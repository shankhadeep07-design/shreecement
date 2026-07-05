import { useEffect, useState } from "react";
import Select from "react-select";
import { toast, Toaster } from "react-hot-toast";
import { fetchDistrictsByStateIds } from "../../Services/Master-service";
import * as Yup from "yup";
import { getAllStateApi } from "../../Services/State-service";
import { createBlockApi, updateBlockApi } from "../../services/Block-service";
const Schema = Yup.object({
    tbl_state_id: Yup.string().required("State name is required"),
    tbl_district_id: Yup.string().required("District name is required"),
    tbl_block_name: Yup.string()
        .trim()
        .max(100, "Block name must be at most 100 characters")
        .required("Block name is required"),
});

export const AddEditBlock = ({ changeModalStatus, editBlock, initiatedBlockDatatable, datatable_url }) => {

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        tbl_block_id: null,
        tbl_state_id: null,
        tbl_district_id: null,
        tbl_block_name: "",
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


    // const inputChange = async (e) => {
    //     let updatedData;
    //     const { name, value } = e.target;
    //     if (name === "tbl_state_id" && formData?.tbl_state_id !== value) {
    //         setDistricts([]);
    //         fetchDistrictsByStateIds(value)
    //             .then((data) => {
    //                 setDistricts(data?.data);
    //             })
    //             .catch((error) => {
    //                 toast.error(error?.response?.data?.message);
    //             });
    //         updatedData = { ...formData, [name]: value, tbl_district_id: "" };
    //     } else {
    //         updatedData = { ...formData, [name]: value };
    //     }
    //     setFormData(updatedData);
    // };

    const inputChange = async (e) => {
        let updatedData;
        const { name, value } = e.target;
        let newValue = value;
        // 👉 remove leading spaces for text inputs like block name
        if (name === "tbl_block_name") {
            newValue = newValue.replace(/^\s+/, "");
        }
        // 👉 existing logic for state change
        if (name === "tbl_state_id" && formData?.tbl_state_id !== newValue) {
            setDistricts([]);

            fetchDistrictsByStateIds(newValue)
                .then((data) => {
                    setDistricts(data?.data);
                })
                .catch((error) => {
                    toast.error(error?.response?.data?.message);
                });

            updatedData = {
                ...formData,
                [name]: newValue,
                tbl_district_id: ""
            };
        } else {
            updatedData = {
                ...formData,
                [name]: newValue
            };
        }

        setFormData(updatedData);
    };


    useEffect(() => {
        setErrors({});

        if (editBlock) {
            const stateId = editBlock?.tdl_state_id;   // ✅ FIX
            const districtId = editBlock?.tbl_district_id;

            // 🔥 First load districts
            if (stateId) {
                fetchDistrictsByStateIds(stateId)
                    .then((res) => {
                        setDistricts(res?.data || []);
                    })
                    .catch((error) => {
                        toast.error(error?.response?.data?.message);
                    });
            }

            // 🔥 Then set form data
            setFormData({
                tbl_block_id: editBlock?.tbl_block_id,
                tbl_block_name: editBlock?.tbl_block_name,
                tbl_state_id: stateId,          // ✅ correct value
                tbl_district_id: districtId,
            });
        } else {
            setFormData({
                tbl_block_id: null,
                tbl_block_name: "",
                tbl_state_id: null,
                tbl_district_id: null,
            });
            setDistricts([]);
        }
    }, [editBlock]);


    useEffect(() => {
        getAllStateApi()
            .then((data) => {
                setStates(data?.data || []);
            })
            .catch((error) => {
                toast.error(
                    error?.response?.data?.originalError || error?.response?.data?.message
                );
            });
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        const isValid = await handleValidation(formData);
        if (!isValid) return;
        setLoading(true);



        if (editBlock) {
            updateBlockApi(formData, formData?.tbl_block_id)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedBlockDatatable(datatable_url);
                })
                .catch((error) => {
                    // const errMsg = error?.response?.data?.message || "Something went wrong";
                    // setErrors({ tdl_district_name: errMsg });
                    toast.error(error?.response?.data?.message);
                    setLoading(false);
                });
        } else {

            createBlockApi(formData)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedBlockDatatable(datatable_url);
                })
                .catch((error) => {
                    // const errMsg = error?.response?.data?.message || "Something went wrong";
                    // setErrors({ tdl_district_name: errMsg });
                    toast.error(error?.response?.data?.message);
                    setLoading(false);
                });
        }
    };

    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{ duration: 2000 }}
                reverseOrder={false}
            ></Toaster>

            <form onSubmit={submit} id="user_submit" className="my_form">

                <div className="row">

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label">
                                State <span className="required">*</span>
                            </label>
                            <Select
                                name="tpm_state_id"
                                options={states}
                                value={
                                    states.find(
                                        ({ value }) => value == formData?.tbl_state_id
                                    ) || ""
                                }
                                onChange={(e) => {
                                    inputChange({
                                        target: {
                                            name: "tbl_state_id",
                                            value: e.value,
                                        },
                                    });
                                }}
                                labelledBy="Select States"
                            />
                            {errors?.tbl_state_id && (
                                <div className="error text-danger">{errors?.tbl_state_id}</div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label">
                                District<span className="required">*</span>
                            </label>
                            <Select
                                options={districts}
                                name="tbl_district_id"
                                value={
                                    districts.find(
                                        ({ value }) => value == formData?.tbl_district_id
                                    ) || ""
                                }
                                onChange={(e) => {
                                    inputChange({
                                        target: {
                                            name: "tbl_district_id",
                                            value: e.value,
                                        },
                                    });
                                }}
                                labelledBy="Select Districts"
                            />
                            {errors?.tbl_district_id && (
                                <div className="error text-danger">
                                    {errors?.tbl_district_id}
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="col-md-6">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Block<span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tbl_block_name}
                                onChange={inputChange}
                                name="tbl_block_name"
                                id="tbl_block_name"
                                placeholder="Enter Block"
                            />
                            {errors?.tbl_block_name && (
                                <div className="error text-danger">
                                    {errors?.tbl_block_name}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12 float-right">
                        <button type="submit" className="btn btn-primary">
                            Submit
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
};
