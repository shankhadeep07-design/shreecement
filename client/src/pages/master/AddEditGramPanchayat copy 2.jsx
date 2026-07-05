import { useEffect, useState } from "react";
import Select from "react-select";

import { toast, Toaster } from "react-hot-toast";
import * as Yup from "yup";
import { fetchBlocksByDistrictIds, fetchDistrictsByStateIds } from '../../Services/Master-service';
import { getAllStateApi } from "../../Services/State-service";
import { createLocationApi, updateLocationApi } from "../../services/Gram-panchayat-service";
const Schema = Yup.object({
    tgp_state_id: Yup.string().required("State name is required"),
    tgp_district_id: Yup.string().required("District name is required"),
    tgp_block_id: Yup.string().required("Block name is required"),
    tgp_location_name: Yup.string()
        .trim()
        .required("Gram Panchayat name is required"),
});
export const AddEditGramPanchayat = ({ changeModalStatus, editLocation, initiatedLocationDatatable, datatable_url }) => {

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        tgp_state_id: null,
        tgp_district_id: null,
        tgp_block_id: null,
        tgp_location_name: "",
        tgp_location_id: null,
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
        const { name, value } = e.target;
        if (name === "tgp_state_id" && formData?.tgp_state_id !== value) {
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
                tgp_district_id: "",
                tgp_block_id: "",
            };
        } else if (
            name === "tgp_district_id" &&
            formData?.tgp_district_id !== value
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
                tgp_block_id: "",
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

        if (editLocation) {
            updateLocationApi(formData, formData?.tgp_location_id)
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
        setErrors({});
        if (editLocation) {
            fetchDistrictsByStateIds(editLocation?.tgp_state_id)
                .then((data) => {
                    setDistricts(data?.data);
                })
                .catch((error) => {
                    toast.error(
                        error?.response?.data?.originalError ||
                        error?.response?.data?.message
                    );
                });

            fetchBlocksByDistrictIds(editLocation?.tgp_district_id)
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
                tgp_state_id: editLocation?.tgp_state_id,
                tgp_district_id: editLocation?.tgp_district_id,
                tgp_block_id: editLocation?.tgp_block_id,
                tgp_location_name: editLocation?.tgp_location_name,
                tgp_location_id: editLocation?.tgp_location_id,
            });
        } else {
            setFormData({
                tgp_state_id: null,
                tgp_district_id: null,
                tgp_block_id: null,
                tgp_location_name: "",
                tgp_location_id: null,
            });
        }
    }, [editLocation]);

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
                            <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label">
                                State
                            </label>
                            <Select
                                name="tvl_tsl_state_id"
                                options={states}
                                value={
                                    states.find(
                                        ({ value }) => value == formData?.tgp_state_id
                                    ) || ""
                                }
                                onChange={(e) => {
                                    handleChange({
                                        target: {
                                            name: "tgp_state_id",
                                            value: e.value,
                                        },
                                    });
                                }}
                                labelledBy="Select States"
                            />
                            {errors?.tgp_state_id && (
                                <div className="error text-danger">{errors?.tgp_state_id}</div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label">
                                District
                            </label>
                            <Select
                                name="tvl_tdl_district_id"
                                options={districts}
                                value={
                                    districts.find(
                                        ({ value }) => value == formData?.tgp_district_id
                                    ) || ""
                                }
                                onChange={(e) => {
                                    handleChange({
                                        target: {
                                            name: "tgp_district_id",
                                            value: e.value,
                                        },
                                    });
                                }}
                                labelledBy="Select Districts"
                            />
                            {errors?.tgp_district_id && (
                                <div className="error text-danger">
                                    {errors?.tgp_district_id}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label">
                                Block
                            </label>
                            <Select
                                name="tvl_tbl_block_id"
                                options={blocks}
                                value={
                                    blocks.find(
                                        ({ value }) => value == formData?.tgp_block_id
                                    ) || ""
                                }
                                onChange={(e) => {
                                    handleChange({
                                        target: {
                                            name: "tgp_block_id",
                                            value: e.value,
                                        },
                                    });
                                }}
                                labelledBy="Select Blocks"
                            />
                            {errors?.tgp_block_id && (
                                <div className="error text-danger">{errors?.tgp_block_id}</div>
                            )}
                        </div>
                    </div>


                    <div className="col-md-6">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Gram Panchayat
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tgp_location_name}
                                onChange={handleChange}
                                name="tgp_location_name"
                                id="tgp_location_name"
                                placeholder="Enter Gram Panchayat"
                            />
                            {errors?.tgp_location_name && (
                                <div className="error text-danger">
                                    {errors?.tgp_location_name}
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
