import { useEffect, useState } from "react";
import Select from "react-select";
import { toast, Toaster } from "react-hot-toast";
import * as Yup from "yup";

import { getAllStateApi } from "../../../services/State-service";
import { fetchDistrictsByStateIds } from "../../../Services/Master-service";
import { fetchBlocksByDistrictIds } from "../../../Services/Master-service";
import { getGramPanchayatsByBlockIds } from "../../../Services/Master-service";
import { getRevenueVillageByGramPanchayatIds, getVillageByRevenueVillageIds } from "../../../Services/Master-service";
import { createVillageApi, updateVillageDetailsApi } from "../../../Services/Village-service";

import {
    createRevenueVillageApi,
    updateRevenueVillageApi,
} from "../../../Services/Master-service";

const noLeadingSpace = /^(?!\s)/;
const noEmoji = /^(?!.*[\p{Extended_Pictographic}]).*$/u;
const noSpecialStart = /^[a-zA-Z0-9]/;

const trimmedString = () =>
    Yup.string().transform((value) => (value ? value.trim() : ""));

// const Schema = Yup.object({
//     trevvlg_state_id: Yup.string().required("State is required"),

//     trevvlg_district_id: Yup.string().required("District is required"),

//     trevvlg_block_id: Yup.string().required("Block is required"),

//     trevvlg_grampanchayat_id: Yup.string().required("Gram Panchayat is required"),

//     trevvlg_revenue_village_id: trimmedString()
//         .required("Revenue village name is required"),

//     // .matches(noLeadingSpace, {
//     //     message: "Cannot start with space",
//     //     excludeEmptyString: true
//     // })
//     // .matches(noSpecialStart, {
//     //     message: "Cannot start with special character",
//     //     excludeEmptyString: true
//     // })
//     // .matches(noEmoji, {
//     //     message: "Emoji not allowed",
//     //     excludeEmptyString: true
//     // })


//     trevvlg_revenue_village_name: trimmedString()
//         .required("village name is required")

//         .matches(noLeadingSpace, {
//             message: "Cannot start with space",
//             excludeEmptyString: true
//         })
//         .matches(noSpecialStart, {
//             message: "Cannot start with special character",
//             excludeEmptyString: true
//         })
//         .matches(noEmoji, {
//             message: "Emoji not allowed",
//             excludeEmptyString: true
//         })
// });

const Schema = Yup.object({
    tvl_state_id: Yup.string().required("State is required"),
    tvl_district_id: Yup.string().required("District is required"),
    tvl_block_id: Yup.string().required("Block is required"),
    tvl_grampanchayat_id: Yup.string().required("Gram Panchayat is required"),
    tvl_revenue_village_id: Yup.string().required("Revenue Village is required"),

    tvl_village_name: Yup.string().required("Village is required"),

});

export const AddEditDistance = ({
    changeModalStatus,
    editData,
    initiatedVillageDatatable,
    datatable_url,
}) => {

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [gramPanchayats, setGramPanchayats] = useState([]);
    const [revenueVillages, setRevenueVillages] = useState([]);

    const [villages, setVillages] = useState([]);

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);


    const handleValidation = async (data) => {
        try {
            await Schema.validate(data, { abortEarly: false });
            setErrors({});
            return true;
        } catch (err) {
            const validationErrors = {};
            err.inner.forEach((e) => {
                validationErrors[e.path] = e.message;
            });
            setErrors(validationErrors);
            return false;
        }
    };

    const inputChange = async (e) => {
        const { name, value } = e.target;
        let updatedData = { ...formData, [name]: value };

        if (name === "tvl_state_id") {
            setDistricts([]);
            setBlocks([]);
            setGramPanchayats([]);
            setRevenueVillages([]);
            setVillages([]);


            fetchDistrictsByStateIds(value)
                .then((res) => setDistricts(res?.data || []))
                .catch((err) => toast.error(err?.response?.data?.message));

            updatedData.tvl_district_id = "";
            updatedData.tvl_block_id = "";
            updatedData.tvl_grampanchayat_id = "";
            updatedData.tvl_revenue_village_id = "";
        }

        if (name === "tvl_district_id") {
            setBlocks([]);
            setGramPanchayats([]);
            setRevenueVillages([]);
            setVillages([]);

            fetchBlocksByDistrictIds(value)
                .then((res) => {
                    setBlocks(res?.data || []);       // ✅ correct - data is { value, label }[] directly
                })
                .catch((err) => toast.error(err?.response?.data?.message));

            updatedData.tvl_block_id = "";
            updatedData.tvl_grampanchayat_id = "";
            updatedData.tvl_revenue_village_id = "";
        }

        if (name === "tvl_block_id") {
            setGramPanchayats([]);
            setRevenueVillages([]);
            setVillages([]);

            getGramPanchayatsByBlockIds(value)
                .then((res) => {
                    if (res?.status) setGramPanchayats(res.data);
                    else setGramPanchayats([]);
                })
                .catch((err) => toast.error(err?.response?.data?.message));

            updatedData.tvl_grampanchayat_id = "";
            updatedData.tvl_revenue_village_id = "";
        }

        if (name === "tvl_grampanchayat_id") {
            setRevenueVillages([]);
            setVillages([]);

            getRevenueVillageByGramPanchayatIds(value)
                .then((res) => {
                    if (res?.status) setRevenueVillages(res.data);
                    else setRevenueVillages([]);
                })
                .catch((err) => toast.error(err?.response?.data?.message));

            updatedData.tvl_revenue_village_id = "";
        }

        if (name === "tvl_revenue_village_id") {
            setVillages([]);

            getVillageByRevenueVillageIds(value)
                .then((res) => {
                    if (res?.status) setVillages(res.data);
                    else setVillages([]);
                })
                .catch((err) => toast.error(err?.response?.data?.message));

            updatedData.tvl_village_id = "";
        }

        setFormData(updatedData);
    };

    // Load states on mount
    useEffect(() => {
        getAllStateApi()
            .then((data) => setStates(data?.data || []))
            .catch((error) =>
                toast.error(
                    error?.response?.data?.originalError ||
                    error?.response?.data?.message
                )
            );
    }, []);

    // Prepopulate form on edit
    useEffect(() => {
        console.log("editData:", editData);

        if (editData) {
            const stateId = editData?.tvl_state_id;
            const districtId = editData?.tvl_district_id;
            const blockId = editData?.tvl_block_id;
            const gpId = editData?.tvl_grampanchayat_id;

            setFormData({
                tvl_village_id: editData?.tvl_village_id,
                tvl_state_id: stateId,
                tvl_district_id: districtId,
                tvl_block_id: blockId,
                tvl_grampanchayat_id: gpId,
                tvl_revenue_village_id: editData?.tvl_revenue_village_id,
                tvl_village_name: editData?.tvl_village_name,

            });

            // load districts
            fetchDistrictsByStateIds(stateId)
                .then((res) => {
                    setDistricts(res?.data || []);

                    // load blocks
                    fetchBlocksByDistrictIds(districtId)
                        .then((blockRes) => {
                            setBlocks(blockRes?.data || []);       // ✅ correct - data is { value, label }[] directly

                            // load gram panchayats
                            getGramPanchayatsByBlockIds(blockId)
                                .then((gpRes) => {
                                    if (gpRes?.status) {
                                        setGramPanchayats(gpRes.data);

                                        // load revenue villages
                                        getRevenueVillageByGramPanchayatIds(gpId)
                                            .then((rvRes) => {
                                                if (rvRes?.status) setRevenueVillages(rvRes.data);
                                            });
                                    }
                                });
                        });
                });
        } else {
            setFormData({
                tvl_village_id: null,
                tvl_state_id: null,
                tvl_district_id: null,
                tvl_block_id: null,
                tvl_grampanchayat_id: null,
                tvl_revenue_village_id: null,
            });
        }
    }, [editData]);

    const submit = async (e) => {
        e.preventDefault();
        const isValid = await handleValidation(formData);
        if (!isValid) return;
        setLoading(true);

        const apiCall = editData
            ? updateVillageDetailsApi(formData, formData?.tvl_village_id)
            : createVillageApi(formData);

        apiCall
            .then((res) => {
                setLoading(false);
                if (res.status === true) {
                    toast.success(res.message);
                    changeModalStatus("user_update_modal", false);  // ✅ only on success
                    initiatedVillageDatatable(datatable_url);        // ✅ only on success
                } else {
                    toast.error(res.message);
                }
            })
            .catch((error) => {
                toast.error(error?.response?.data?.message);
                setLoading(false);
            });
    };

    return (
        <>
            <Toaster position="top-center" toastOptions={{ duration: 2000 }} />

            <form onSubmit={submit} className="my_form">
                <div className="row">

                    {/* STATE */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">State <span className="required">*</span></label>
                        <Select
                            options={states}
                            value={states.find(({ value }) => value == formData?.tvl_state_id) || ""}
                            onChange={(e) => inputChange({ target: { name: "tvl_state_id", value: e.value } })}
                        />
                        {errors?.tvl_state_id && (
                            <div className="error text-danger">{errors.tvl_state_id}</div>
                        )}
                    </div>

                    {/* DISTRICT */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">District <span className="required">*</span></label>
                        <Select
                            options={districts}
                            value={districts.find(({ value }) => value == formData?.tvl_district_id) || ""}
                            onChange={(e) => inputChange({ target: { name: "tvl_district_id", value: e.value } })}
                        />
                        {errors?.tvl_district_id && (
                            <div className="error text-danger">{errors.tvl_district_id}</div>
                        )}
                    </div>

                    {/* BLOCK */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Block <span className="required">*</span></label>
                        <Select
                            options={blocks}
                            value={blocks.find(({ value }) => value == formData?.tvl_block_id) || ""}
                            onChange={(e) => inputChange({ target: { name: "tvl_block_id", value: e.value } })}
                        />
                        {errors?.tvl_block_id && (
                            <div className="error text-danger">{errors.tvl_block_id}</div>
                        )}
                    </div>

                    {/* GRAM PANCHAYAT */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Gram Panchayat <span className="required">*</span></label>
                        <Select
                            options={gramPanchayats}
                            value={gramPanchayats.find(({ value }) => value == formData?.tvl_grampanchayat_id) || ""}
                            onChange={(e) => inputChange({ target: { name: "tvl_grampanchayat_id", value: e.value } })}
                        />
                        {errors?.tvl_grampanchayat_id && (
                            <div className="error text-danger">{errors.tvl_grampanchayat_id}</div>
                        )}
                    </div>

                    {/* REVENUE VILLAGE */}
                    {/* REVENUE VILLAGE */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Revenue Village <span className="required">*</span></label>
                        <Select
                            options={revenueVillages}
                            value={revenueVillages.find(({ value }) => value == formData?.tvl_revenue_village_id) || ""}
                            onChange={(e) => inputChange({ target: { name: "tvl_revenue_village_id", value: e.value } })}
                        />
                        {errors?.tvl_revenue_village_id && (
                            <div className="error text-danger">{errors.tvl_revenue_village_id}</div>
                        )}
                    </div>  {/* ✅ Close Revenue Village div HERE */}

                    {/* VILLAGE NAME */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Village Name <span className="required">*</span></label>
                        <Select
                            options={villages}
                            value={villages.find(({ value }) => value == formData?.tvl_village_id) || ""}
                            onChange={(e) => inputChange({ target: { name: "tvl_village_id", value: e.value } })}
                        />
                        {errors?.tvl_village_id && (
                            <div className="error text-danger">{errors.tvl_village_id}</div>
                        )}

                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Type Of Village <span className="required">*</span></label>
                        <Select
                            options={[
                                { value: 1, label: "Core" },
                                { value: 2, label: "Non Core" },
                            ]}
                            value={[
                                { value: 1, label: "Core" },
                                { value: 2, label: "Non Core" },
                            ].find(({ value }) => value == formData?.tvl_village_type_id) || ""}
                            onChange={(e) => inputChange({ target: { name: "tvl_village_type_id", value: e.value } })}
                        />
                        {errors?.tvl_village_type_id && (
                            <div className="error text-danger">{errors.tvl_village_type_id}</div>
                        )}

                    </div>

                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Submitting..." : "Submit"}
                </button>
            </form>
        </>
    );
};