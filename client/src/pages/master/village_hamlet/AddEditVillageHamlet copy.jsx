import { useEffect, useState } from "react";
import Select from "react-select";
import { toast, Toaster } from "react-hot-toast";
import * as Yup from "yup";

import { getAllStateApi } from "../../../services/State-service";
import { fetchDistrictsByStateIds } from "../../../Services/Master-service";
import { fetchBlocksByDistrictIds } from "../../../Services/Master-service";
import { getGramPanchayatsByBlockIds } from "../../../Services/Master-service";
import { getRevenueVillageByGramPanchayatIds } from "../../../Services/Master-service";

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

export const AddEditVillageHamlet = ({
    changeModalStatus,
    editRevenueVillage,
    initiatedRevenueVillageDatatable,
    datatable_url,
}) => {

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [gramPanchayats, setGramPanchayats] = useState([]);

    const [revenueVillages, setRevenueVillages] = useState([]);


    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        trevvlg_revenue_village_id: null,
        trevvlg_state_id: null,
        trevvlg_district_id: null,
        trevvlg_block_id: null,
        trevvlg_grampanchayat_id: null,
        trevvlg_revenue_village_id: null,
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
        let newValue = value;

        if (name === "trevvlg_revenue_village_id") {
            newValue = newValue.replace(/^\s+/, "");
        }

        let updatedData = { ...formData, [name]: newValue };

        if (name === "trevvlg_state_id") {
            setDistricts([]);
            setBlocks([]);
            setGramPanchayats([]);

            fetchDistrictsByStateIds(newValue)
                .then((res) => setDistricts(res?.data || []))
                .catch((err) => toast.error(err?.response?.data?.message));

            updatedData.trevvlg_district_id = "";
            updatedData.trevvlg_block_id = "";
            updatedData.trevvlg_grampanchayat_id = "";
        }

        if (name === "trevvlg_district_id") {
            setBlocks([]);
            setGramPanchayats([]);

            fetchBlocksByDistrictIds(newValue)
                .then((res) => {
                    // const formattedBlocks = (res?.data || []).map((item) => ({
                    //     value: item.tbl_block_id,
                    //     label: item.tbl_block_name
                    // }));
                    // setBlocks(formattedBlocks);
                    setBlocks(res?.data || []);

                })
                .catch((err) => toast.error(err?.response?.data?.message));

            updatedData.trevvlg_block_id = "";
            updatedData.trevvlg_grampanchayat_id = "";
        }

        if (name === "trevvlg_block_id") {
            setGramPanchayats([]);
            getGramPanchayatsByBlockIds(newValue)
                .then((res) => {
                    if (res?.status) {
                        setGramPanchayats(res.data);
                    } else {
                        setGramPanchayats([]);
                    }
                })
                .catch((err) => toast.error(err?.response?.data?.message));

            updatedData.trevvlg_grampanchayat_id = "";
        }


        if (name === "trevvlg_grampanchayat_id") {
            setRevenueVillages([]);
            getRevenueVillageByGramPanchayatIds(newValue)
                .then((res) => {
                    if (res?.status) {
                        setRevenueVillages(res.data);
                    } else {
                        setRevenueVillages([]);
                    }
                })
                .catch((err) => toast.error(err?.response?.data?.message));

            updatedData.trevvlg_grampanchayat_id = "";
        }

        setFormData(updatedData);
    };

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

    const submit = async (e) => {
        e.preventDefault();

        const isValid = await handleValidation(formData);
        if (!isValid) return;

        setLoading(true);

        const apiCall = editRevenueVillage
            ? updateRevenueVillageApi(
                formData,
                formData?.trevvlg_revenue_village_id
            )
            : createRevenueVillageApi(formData);

        apiCall
            .then((res) => {
                setLoading(false);

                if (res.status == 1) toast.success(res.message);
                else toast.error(res.message);

                changeModalStatus("user_update_modal", false);
                initiatedRevenueVillageDatatable(datatable_url);
            })
            .catch((error) => {
                toast.error(error?.response?.data?.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (editRevenueVillage) {

            const stateId = editRevenueVillage?.tsl_state_id;
            const districtId = editRevenueVillage?.tdl_district_id;
            const blockId = editRevenueVillage?.tbl_block_id;
            const gpId = editRevenueVillage?.tgrm_grampanchayat_id;

            // set form values
            setFormData({
                trevvlg_revenue_village_id: editRevenueVillage?.trevvlg_revenue_village_id,
                trevvlg_revenue_village_id: editRevenueVillage?.trevvlg_revenue_village_id,
                trevvlg_state_id: stateId,
                trevvlg_district_id: districtId,
                trevvlg_block_id: blockId,
                trevvlg_grampanchayat_id: gpId
            });

            // load districts
            fetchDistrictsByStateIds(stateId)
                .then((res) => {
                    setDistricts(res?.data || []);

                    // load blocks
                    fetchBlocksByDistrictIds(districtId)
                        .then((blockRes) => {

                            // const formattedBlocks = (blockRes?.data || []).map((item) => ({
                            //     value: item.tbl_block_id,
                            //     label: item.tbl_block_name
                            // }));

                            // setBlocks(formattedBlocks);
                            // setBlocks(blockRes?.data || []);
                            console.log("blockRes full:", blockRes); // check the full structure
                            setBlocks(blockRes?.data?.data || []);  // ✅ note: .data.data



                            // load gram panchayat
                            getGramPanchayatsByBlockIds(blockId)
                                .then((gpRes) => {
                                    if (gpRes?.status) {
                                        setGramPanchayats(gpRes.data);
                                    }
                                });

                        });
                });
        }
    }, [editRevenueVillage]);

    useEffect(() => {
        console.log("Revenue Villages:", revenueVillages);
    }, [revenueVillages]);

    return (
        <>
            <Toaster position="top-center" toastOptions={{ duration: 2000 }} />

            <form onSubmit={submit} className="my_form">
                <div className="row">

                    {/* STATE */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">
                            State <span className="required">*</span>
                        </label>
                        <Select
                            options={states}
                            value={
                                states.find(
                                    ({ value }) => value == formData?.trevvlg_state_id
                                ) || ""
                            }
                            onChange={(e) =>
                                inputChange({
                                    target: { name: "trevvlg_state_id", value: e.value },
                                })
                            }
                        />
                        {errors?.trevvlg_state_id && (
                            <div className="error text-danger">{errors.trevvlg_state_id}</div>
                        )}
                    </div>

                    {/* DISTRICT */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">
                            District <span className="required">*</span>
                        </label>
                        <Select
                            options={districts}
                            value={
                                districts.find(
                                    ({ value }) => value == formData?.trevvlg_district_id
                                ) || ""
                            }
                            onChange={(e) =>
                                inputChange({
                                    target: { name: "trevvlg_district_id", value: e.value },
                                })
                            }
                        />
                        {errors?.trevvlg_district_id && (
                            <div className="error text-danger">
                                {errors.trevvlg_district_id}
                            </div>
                        )}
                    </div>

                    {/* BLOCK */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">
                            Block <span className="required">*</span>
                        </label>
                        <Select
                            options={blocks}
                            value={
                                blocks.find(
                                    ({ value }) => value == formData?.trevvlg_block_id
                                ) || ""
                            }
                            onChange={(e) =>
                                inputChange({
                                    target: { name: "trevvlg_block_id", value: e.value },
                                })
                            }
                        />
                        {errors?.trevvlg_block_id && (
                            <div className="error text-danger">{errors.trevvlg_block_id}</div>
                        )}
                    </div>

                    {/* GRAM PANCHAYAT */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">
                            Gram Panchayat <span className="required">*</span>
                        </label>
                        <Select
                            options={gramPanchayats}
                            value={
                                gramPanchayats.find(
                                    ({ value }) => value == formData?.trevvlg_grampanchayat_id
                                ) || ""
                            }
                            onChange={(e) =>
                                inputChange({
                                    target: {
                                        name: "trevvlg_grampanchayat_id",
                                        value: e.value,
                                    },
                                })
                            }
                        />
                        {errors?.trevvlg_grampanchayat_id && (
                            <div className="error text-danger">
                                {errors.trevvlg_grampanchayat_id}
                            </div>
                        )}
                    </div>

                    {/* REVENUE VILLAGE */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">
                            Revenue Village <span className="required">*</span>
                        </label>


                        <Select
                            options={revenueVillages}
                            value={
                                revenueVillages.find(
                                    ({ value }) => value == formData?.trevvlg_grampanchayat_id
                                ) || ""
                            }
                            onChange={(e) =>
                                inputChange({
                                    target: {
                                        name: "trevvlg_grampanchayat_id",
                                        value: e.value,
                                    },
                                })
                            }
                        />
                        {errors?.trevvlg_revenue_village_id && (
                            <div className="error text-danger">
                                {errors.trevvlg_revenue_village_id}
                            </div>
                        )}
                        {/* <input
                            type="text"
                            className="form-control"
                            name="trevvlg_revenue_village_id"
                            value={formData.trevvlg_revenue_village_id}
                            onChange={inputChange}
                            placeholder="Enter Revenue Village"
                        />
                        {errors?.trevvlg_revenue_village_id && (
                            <div className="error text-danger">
                                {errors.trevvlg_revenue_village_id}
                            </div>
                        )} */}
                    </div>



                    <div className="col-md-6 mb-3">
                        <label className="form-label">
                            Village <span className="required">*</span>
                        </label>


                        <input
                            type="text"
                            className="form-control"
                            name="trevvlg_revenue_village_name"
                            value={formData.trevvlg_revenue_village_name}
                            onChange={inputChange}
                            placeholder="Enter Revenue Village"
                        />
                        {errors?.trevvlg_revenue_village_name && (
                            <div className="error text-danger">
                                {errors.trevvlg_revenue_village_name}
                            </div>
                        )}



                    </div>
                </div>

                <button type="submit" className="btn btn-primary">
                    Submit
                </button>
            </form>
        </>
    );
};