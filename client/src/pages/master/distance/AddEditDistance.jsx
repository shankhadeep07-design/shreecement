import { useEffect, useState } from "react";
import Select from "react-select";
import { toast, Toaster } from "react-hot-toast";
import * as Yup from "yup";

import { getAllStateApi } from "../../../services/State-service";
import { fetchDistrictsByStateIds } from "../../../Services/Master-service";
import { fetchBlocksByDistrictIds } from "../../../Services/Master-service";
import { getGramPanchayatsByBlockIds } from "../../../Services/Master-service";
import { getRevenueVillageByGramPanchayatIds } from "../../../Services/Master-service";
import { getVillageByRevenueVillageIds, getVillageByTypes } from "../../../Services/Master-service";
import { createVillageApi, updateVillageDetailsApi } from "../../../Services/Village-service";
import { createDistanceApi, updateDistanceApi } from "../../../Services/Distance-service";
import { getTypeOfVillageList } from "../../../Services/Master-service"; // 👈 add this

const VILLAGE_TYPE_OPTIONS = [
    { value: "core", label: "Core" },
    { value: "non_core", label: "Non Core" },
];
const Schema = Yup.object({
    tdis_state_id: Yup.string().required("State is required"),
    tdis_district_id: Yup.string().required("District is required"),
    tdis_block_id: Yup.string().required("Block is required"),
    tdis_grampanchayat_id: Yup.string().required("Gram Panchayat is required"),
    tdis_revenue_village_id: Yup.string().required("Revenue Village is required"),
    tdis_village_id: Yup.string().required("Village is required"),
    tdis_village_type_id: Yup.string().required("Type of Village is required"),
    // tdis_value: Yup.string().required("Type of Village is required"),
    // If it's a numeric field
    tdis_value: Yup.number()
        .max(999999999999, "Value cannot exceed 999999999999")
        .required("Type of Village is required"),

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

    const [villageTypes, setVillageTypes] = useState([]); // 👈 add this


    const [formData, setFormData] = useState({
        tdis_distance_id: null,
        tdis_state_id: null,
        tdis_district_id: null,
        tdis_block_id: null,
        tdis_grampanchayat_id: null,
        tdis_revenue_village_id: null,
        tdis_village_id: null,
        tdis_village_type_id: null,
        tdis_value: ""
    });

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

        if (name === "tdis_state_id") {
            setDistricts([]);
            setBlocks([]);
            setGramPanchayats([]);
            setRevenueVillages([]);
            setVillages([]);

            fetchDistrictsByStateIds(value)
                .then((res) => setDistricts(res?.data || []))
                .catch((err) => toast.error(err?.response?.data?.message));

            updatedData.tdis_district_id = "";
            updatedData.tdis_block_id = "";
            updatedData.tdis_grampanchayat_id = "";
            updatedData.tdis_revenue_village_id = "";
            updatedData.tdis_village_id = "";
        }

        if (name === "tdis_district_id") {
            setBlocks([]);
            setGramPanchayats([]);
            setRevenueVillages([]);
            setVillages([]);

            fetchBlocksByDistrictIds(value)
                .then((res) => setBlocks(res?.data || []))
                .catch((err) => toast.error(err?.response?.data?.message));

            updatedData.tdis_block_id = "";
            updatedData.tdis_grampanchayat_id = "";
            updatedData.tdis_revenue_village_id = "";
            updatedData.tdis_village_id = "";
        }

        if (name === "tdis_block_id") {
            setGramPanchayats([]);
            setRevenueVillages([]);
            setVillages([]);

            getGramPanchayatsByBlockIds(value)
                .then((res) => {
                    if (res?.status) setGramPanchayats(res.data);
                    else setGramPanchayats([]);
                })
                .catch((err) => toast.error(err?.response?.data?.message));

            updatedData.tdis_grampanchayat_id = "";
            updatedData.tdis_revenue_village_id = "";
            updatedData.tdis_village_id = "";
        }

        if (name === "tdis_grampanchayat_id") {
            setRevenueVillages([]);
            setVillages([]);

            getRevenueVillageByGramPanchayatIds(value)
                .then((res) => {
                    if (res?.status) setRevenueVillages(res.data);
                    else setRevenueVillages([]);
                })
                .catch((err) => toast.error(err?.response?.data?.message));

            updatedData.tdis_revenue_village_id = "";
            updatedData.tdis_village_id = "";
        }

        if (name === "tdis_village_type_id") {
            setVillages([]);
            updatedData.tdis_village_id = "";

            if (value && updatedData.tdis_revenue_village_id) {
                getVillageByTypes(value, updatedData.tdis_revenue_village_id)
                    .then((res) => {
                        if (res?.status) setVillages(res.data);
                        else setVillages([]);
                    })
                    .catch((err) => toast.error(err?.response?.data?.message));
            }
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
            const stateId = editData?.tdis_state_id;
            const districtId = editData?.tdis_district_id;
            const blockId = editData?.tdis_block_id;
            const gpId = editData?.tdis_grampanchayat_id;
            const rvId = editData?.tdis_revenue_village_id;

            setFormData({
                tdis_distance_id: editData?.tdis_distance_id,
                tdis_state_id: stateId,
                tdis_district_id: districtId,
                tdis_block_id: blockId,
                tdis_grampanchayat_id: gpId,
                tdis_revenue_village_id: rvId,
                tdis_village_id: editData?.tdis_village_id,
                tdis_village_type_id: editData?.tdis_village_type_id,
                tdis_value: editData?.tdis_value,

            });

            // Cascade load dropdowns
            fetchDistrictsByStateIds(stateId)
                .then((res) => {
                    setDistricts(res?.data || []);

                    fetchBlocksByDistrictIds(districtId)
                        .then((blockRes) => {
                            setBlocks(blockRes?.data || []);

                            getGramPanchayatsByBlockIds(blockId)
                                .then((gpRes) => {
                                    if (gpRes?.status) {
                                        setGramPanchayats(gpRes.data);

                                        getRevenueVillageByGramPanchayatIds(gpId)
                                            .then((rvRes) => {
                                                if (rvRes?.status) {
                                                    setRevenueVillages(rvRes.data);

                                                    getVillageByRevenueVillageIds(rvId)
                                                        .then((vlRes) => {
                                                            if (vlRes?.status) setVillages(vlRes.data);
                                                        });
                                                }
                                            });
                                    }
                                });
                        });
                });
        } else {
            setFormData({
                tdis_distance_id: null,
                tdis_state_id: null,
                tdis_district_id: null,
                tdis_block_id: null,
                tdis_grampanchayat_id: null,
                tdis_revenue_village_id: null,
                tdis_village_id: null,
                tdis_village_type_id: null,
                tdis_value: ""
            });
        }
    }, [editData]);


    useEffect(() => {
    if (editData && villageTypes.length > 0) {
        const matchedType = villageTypes.find(
            (v) => v.label === editData?.ttovill_type_of_village
        );
        if (matchedType) {
            setFormData((prev) => ({
                ...prev,
                tdis_village_type_id: matchedType.value,
            }));
        }
    }
}, [editData, villageTypes]);



    // 👈 add this
useEffect(() => {
    getTypeOfVillageList()
        .then((res) => {
            setVillageTypes(res?.data || []);
        })
        .catch((error) => {
            toast.error(
                error?.response?.data?.message ||
                "Failed to load village types"
            );
        });
}, []);

    const submit = async (e) => {
        e.preventDefault();
        const isValid = await handleValidation(formData);
        if (!isValid) return;
        setLoading(true);

        const apiCall = editData
            ? updateDistanceApi(formData)
            : createDistanceApi(formData);

        apiCall
            .then((res) => {
                setLoading(false);
                if (res.status === true) {
                    toast.success(res.message);
                    changeModalStatus("user_update_modal", false);
                    initiatedVillageDatatable(datatable_url);
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
                            value={states.find(({ value }) => value == formData?.tdis_state_id) || ""}
                            onChange={(e) => inputChange({ target: { name: "tdis_state_id", value: e.value } })}
                        />
                        {errors?.tdis_state_id && (
                            <div className="error text-danger">{errors.tdis_state_id}</div>
                        )}
                    </div>

                    {/* DISTRICT */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">District <span className="required">*</span></label>
                        <Select
                            options={districts}
                            value={districts.find(({ value }) => value == formData?.tdis_district_id) || ""}
                            onChange={(e) => inputChange({ target: { name: "tdis_district_id", value: e.value } })}
                        />
                        {errors?.tdis_district_id && (
                            <div className="error text-danger">{errors.tdis_district_id}</div>
                        )}
                    </div>

                    {/* BLOCK */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Block <span className="required">*</span></label>
                        <Select
                            options={blocks}
                            value={blocks.find(({ value }) => value == formData?.tdis_block_id) || ""}
                            onChange={(e) => inputChange({ target: { name: "tdis_block_id", value: e.value } })}
                        />
                        {errors?.tdis_block_id && (
                            <div className="error text-danger">{errors.tdis_block_id}</div>
                        )}
                    </div>

                    {/* GRAM PANCHAYAT */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Gram Panchayat <span className="required">*</span></label>
                        <Select
                            options={gramPanchayats}
                            value={gramPanchayats.find(({ value }) => value == formData?.tdis_grampanchayat_id) || ""}
                            onChange={(e) => inputChange({ target: { name: "tdis_grampanchayat_id", value: e.value } })}
                        />
                        {errors?.tdis_grampanchayat_id && (
                            <div className="error text-danger">{errors.tdis_grampanchayat_id}</div>
                        )}
                    </div>

                    {/* REVENUE VILLAGE */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Revenue Village <span className="required">*</span></label>
                        <Select
                            options={revenueVillages}
                            value={revenueVillages.find(({ value }) => value == formData?.tdis_revenue_village_id) || ""}
                            onChange={(e) => inputChange({ target: { name: "tdis_revenue_village_id", value: e.value } })}
                        />
                        {errors?.tdis_revenue_village_id && (
                            <div className="error text-danger">{errors.tdis_revenue_village_id}</div>
                        )}
                    </div>



                    {/* TYPE OF VILLAGE */}
                    {/* <div className="col-md-6 mb-3">
                        <label className="form-label">Type Of Village <span className="required">*</span></label>
                        <Select
                            options={VILLAGE_TYPE_OPTIONS}
                            value={VILLAGE_TYPE_OPTIONS.find(({ value }) => value == formData?.tdis_village_type_id) || ""}
                            onChange={(e) => inputChange({ target: { name: "tdis_village_type_id", value: e.value } })}
                        />
                        {errors?.tdis_village_type_id && (
                            <div className="error text-danger">{errors.tdis_village_type_id}</div>
                        )}
                    </div> */}

                    {/* TYPE OF VILLAGE */}
<div className="col-md-6 mb-3">
    <label className="form-label">Type Of Village <span className="required">*</span></label>
    <Select
        options={villageTypes}                                              
        value={villageTypes.find(v => v.value === formData?.tdis_village_type_id) || null} 
        onChange={(e) => inputChange({ target: { name: "tdis_village_type_id", value: e.value } })}
    />
    {errors?.tdis_village_type_id && (
        <div className="error text-danger">{errors.tdis_village_type_id}</div>
    )}
</div>


                    {/* VILLAGE */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Village Name <span className="required">*</span></label>
                        <Select
                            options={villages}
                            value={villages.find(({ value }) => value == formData?.tdis_village_id) || ""}
                            onChange={(e) => inputChange({ target: { name: "tdis_village_id", value: e.value } })}
                        />
                        {errors?.tdis_village_id && (
                            <div className="error text-danger">{errors.tdis_village_id}</div>
                        )}
                    </div>


                    <div className="col-md-6 mb-3">
                        <label className="form-label">Distance(in KM,Max:999999999999) <span className="required">*</span></label>
                        <input
                            type="number"
                            className="form-control"
                            name="tdis_value"
                            id="tdis_value"
                            min="0"
                            value={formData.tdis_value || ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                // truncate to 2 decimal places without rounding
                                if (val.includes(".")) {
                                    const [whole, decimal] = val.split(".");
                                    e.target.value = `${whole}.${decimal.slice(0, 2)}`;
                                }
                                inputChange(e);
                            }}
                            placeholder="Enter Distance"
                            onKeyDown={(e) => {
                                if (["e", "E", "-", "+"].includes(e.key)) {
                                    e.preventDefault();
                                }
                                // block 3rd decimal digit from keyboard
                                const val = e.target.value;
                                if (
                                    val.includes(".") &&
                                    val.split(".")[1]?.length >= 2 &&
                                    e.key !== "Backspace" &&
                                    e.key !== "Delete" &&
                                    e.key !== "ArrowLeft" &&
                                    e.key !== "ArrowRight" &&
                                    e.key !== "Tab" &&
                                    !val.includes(e.key) === false  // allow non-digit keys
                                ) {
                                    const cursorAfterDot = e.target.selectionStart > val.indexOf(".");
                                    if (cursorAfterDot) e.preventDefault();
                                }
                            }}
                            onPaste={(e) => {
                                const pasted = e.clipboardData.getData("text");
                                // block if contains e, E, +, -
                                if (/[eE+\-]/.test(pasted)) {
                                    e.preventDefault();
                                    return;
                                }
                                // truncate decimal to 2 places on paste
                                if (pasted.includes(".")) {
                                    e.preventDefault();
                                    const [whole, decimal] = pasted.split(".");
                                    const truncated = `${whole}.${decimal.slice(0, 2)}`;
                                    // insert truncated value into formData
                                    inputChange({ target: { name: "tdis_value", value: truncated } });
                                }
                            }}
                        />
                        {errors?.tdis_value && (
                            <div className="error text-danger">{errors.tdis_value}</div>
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
