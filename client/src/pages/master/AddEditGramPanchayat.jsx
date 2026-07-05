import { useEffect, useState } from "react";
import Select from "react-select";

import { toast, Toaster } from "react-hot-toast";
import * as Yup from "yup";
import { fetchBlocksByDistrictIds, fetchDistrictsByStateIds } from '../../Services/Master-service';
import { getAllStateApi } from "../../Services/State-service";
import { createLocationApi, updateLocationApi } from "../../services/Gram-panchayat-service";
const Schema = Yup.object({
    tgrm_state_id: Yup.string().required("State name is required"),
    tgrm_district_id: Yup.string().required("District name is required"),
    tgrm_block_id: Yup.string().required("Block name is required"),
    tgrm_grampanchayat_name: Yup.string()
        .trim()
        .max(100, "Gram Panchayat name must be at most 100 characters")
        .required("Gram Panchayat name is required"),
});

export const AddEditGramPanchayat = ({ changeModalStatus, editGramPanchayet, initiatedLocationDatatable, datatable_url }) => {

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        tgrm_state_id: null,
        tgrm_district_id: null,
        tgrm_block_id: null,
        tgrm_grampanchayat_name: "",
        tgrm_grampanchayat_id: null,
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

    const handleChange = async (e) => {
        let updatedData;
        const { name, type } = e.target;

                let value = e.target.value;


         if (type === "text") {
            value = value.replace(/^\s+/, "");
        }

        if (name === "tgrm_state_id" && formData?.tgrm_state_id !== value) {
            setDistricts([]);
            setBlocks([]);
            fetchDistrictsByStateIds(value)
                .then((data) => {
                    setDistricts(data?.data);
                })
                .catch((error) => {
                    toast(error?.response?.data?.message);
                });
            updatedData = {
                ...formData,
                [name]: value,
                tgrm_district_id: "",
                tgrm_block_id: "",
            };
        } else if (
            name === "tgrm_district_id" &&
            formData?.tgrm_district_id !== value
        ) {
            setBlocks([]);
            fetchBlocksByDistrictIds(value)
                .then((data) => {
                    setBlocks(data?.data);
                })
                .catch((error) => {
                    toast.error(error?.response?.data?.message);
                });
            updatedData = {
                ...formData,
                [name]: value,
                tgrm_block_id: "",
            };
        } else {
            updatedData = { ...formData, [name]: value };
        }
        setFormData(updatedData);
    };

    const submit = async (e) => {
        e.preventDefault();
        const isValid = await handleValidation(formData);
        if (!isValid) return;
        setLoading(true);

        if (editGramPanchayet) {
            updateLocationApi(formData, formData?.tgrm_grampanchayat_id)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedLocationDatatable(datatable_url);
                })
                .catch((error) => {
                    toast.error(error?.response?.data?.message);
                    setLoading(false);
                });
        } else {
            createLocationApi(formData)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedLocationDatatable(datatable_url);
                })
                .catch((error) => {
                    toast.error(error?.response?.data?.message);
                    setLoading(false);
                });
        }
    };

    useEffect(() => {
        console.log("editGramPanchayet:", editGramPanchayet);

        setErrors({});
        if (editGramPanchayet) {
            fetchDistrictsByStateIds(editGramPanchayet?.tgrm_state_id)
                .then((data) => {
                    setDistricts(data?.data);
                })
                .catch((error) => {
                    toast.error(
                        error?.response?.data?.originalError ||
                        error?.response?.data?.message
                    );
                });

            fetchBlocksByDistrictIds(editGramPanchayet?.tgrm_district_id)
                .then((data) => {
                    setBlocks(data?.data);
                })
                .catch((error) => {
                    toast.error(
                        error?.response?.data?.originalError ||
                        error?.response?.data?.message
                    );
                });

            setFormData({
                tgrm_state_id: editGramPanchayet?.tgrm_state_id,
                tgrm_district_id: editGramPanchayet?.tgrm_district_id,
                tgrm_block_id: editGramPanchayet?.tgrm_block_id,
                tgrm_grampanchayat_name: editGramPanchayet?.tgrm_grampanchayat_name,
                tgrm_grampanchayat_id: editGramPanchayet?.tgrm_grampanchayat_id,
            });
        } else {
            setFormData({
                tgrm_state_id: null,
                tgrm_district_id: null,
                tgrm_block_id: null,
                tgrm_grampanchayat_name: "",
                tgrm_grampanchayat_id: null,
            });
        }
    }, [editGramPanchayet]);

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
                            <label htmlFor="tgrm_state_id" className="form-label">
                                State
                            </label>
                            <Select
                                name="tgrm_state_id"
                                options={states}
                                value={
                                    states.find(
                                        ({ value }) => value == formData?.tgrm_state_id
                                    ) || ""
                                }
                                onChange={(e) => {
                                    handleChange({
                                        target: {
                                            name: "tgrm_state_id",
                                            value: e.value,
                                        },
                                    });
                                }}
                                labelledBy="Select States"
                            />
                            {errors?.tgrm_state_id && (
                                <div className="error text-danger">{errors?.tgrm_state_id}</div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label htmlFor="tgrm_district_id" className="form-label">
                                District
                            </label>
                            <Select
                                name="tgrm_district_id"
                                options={districts}
                                value={
                                    districts.find(
                                        ({ value }) => value == formData?.tgrm_district_id
                                    ) || ""
                                }
                                onChange={(e) => {
                                    handleChange({
                                        target: {
                                            name: "tgrm_district_id",
                                            value: e.value,
                                        },
                                    });
                                }}
                                labelledBy="Select Districts"
                            />
                            {errors?.tgrm_district_id && (
                                <div className="error text-danger">{errors?.tgrm_district_id}</div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label htmlFor="tgrm_block_id" className="form-label">
                                Block
                            </label>
                            <Select
                                name="tgrm_block_id"
                                options={blocks}
                                value={
                                    blocks.find(
                                        ({ value }) => value == formData?.tgrm_block_id
                                    ) || ""
                                }
                                onChange={(e) => {
                                    handleChange({
                                        target: {
                                            name: "tgrm_block_id",
                                            value: e.value,
                                        },
                                    });
                                }}
                                labelledBy="Select Blocks"
                            />
                            {errors?.tgrm_block_id && (
                                <div className="error text-danger">{errors?.tgrm_block_id}</div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label htmlFor="tgrm_grampanchayat_name" className="form-label">
                                Gram Panchayat
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tgrm_grampanchayat_name}
                                onChange={handleChange}
                                name="tgrm_grampanchayat_name"
                                id="tgrm_grampanchayat_name"
                                placeholder="Enter Gram Panchayat"
                            />
                            {errors?.tgrm_grampanchayat_name && (
                                <div className="error text-danger">
                                    {errors?.tgrm_grampanchayat_name}
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