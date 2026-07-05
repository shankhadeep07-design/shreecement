import { useEffect, useState } from "react";

import { toast, Toaster } from "react-hot-toast";
import Select from "react-select";

import * as Yup from "yup";
import { fetchDistrictsByStateIds, fetchLocationsByBlockIds } from "../../../Services/Master-service";
// import { createFactoryApi, updateFactoryDetailsApi } from "../../services/MasterData-service";
import { getAllStateApi } from "../../../Services/State-service";
import { fetchLocationByDistrictId } from "../../../services/Gram-panchayat-service";
import { createProfitCenterApi, updateProfitCenterDetailsApi } from "../../../services/MasterData-service";

const Schema = Yup.object({
    tprofc_state_id: Yup.string().required("State name is required"),
    tprofc_district_id: Yup.string().required("District name is required"),
    tprofc_location_id: Yup.string().required("Location name is required"),
    tprofc_corporate: Yup.string()
        .trim()
        .required("Corporate is required"),
    tprofc_bu: Yup.string()
        .trim()
        .required("BU is required"),
    tprofc_gl_account: Yup.string()
        .trim()
        .required("GL Account is required"),
    tprofc_profit_centre: Yup.string()
        .trim()
        .required("Profit Centre is required"),
    tprofc_cost_centre: Yup.string()
        .trim()
        .required("Cost Centre is required"),
});

export const AddEditProfitCenter = ({ changeModalStatus, editProfitCenter, initiatedProfitCenterDatatable, datatable_url }) => {

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [locations, setLocations] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        tprofc_id: "",
        tprofc_corporate: "",
        tprofc_bu: "",
        tprofc_gl_account: "",
        tprofc_profit_centre: "",
        tprofc_cost_centre: "",
        tprofc_state_id: "",
        tprofc_district_id: "",
        tprofc_location_id: "",
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


    useEffect(() => {
        setErrors({});
        if (editProfitCenter) {
            fetchDistrictsByStateIds(editProfitCenter?.tprofc_state_id)
                .then((data) => {
                    setDistricts(data?.data);
                })
                .catch((error) => {
                    toast.error(
                        error?.response?.data?.originalError ||
                        error?.response?.data?.message
                    );
                });
            fetchLocationByDistrictId(editProfitCenter?.tprofc_district_id)
                .then((data) => {
                    setLocations(data?.data);
                })
                .catch((error) => {
                    toast.error(
                        error?.response?.data?.originalError ||
                        error?.response?.data?.message
                    );
                });
            setFormData({
                tprofc_id: editProfitCenter?.tprofc_id,
                tprofc_corporate: editProfitCenter?.tprofc_corporate,
                tprofc_bu: editProfitCenter?.tprofc_bu,
                tprofc_gl_account: editProfitCenter?.tprofc_gl_account,
                tprofc_profit_centre: editProfitCenter?.tprofc_profit_centre,
                tprofc_cost_centre: editProfitCenter?.tprofc_cost_centre,
                tprofc_state_id: editProfitCenter?.tprofc_state_id,
                tprofc_district_id: editProfitCenter?.tprofc_district_id,
                tprofc_location_id: editProfitCenter?.tprofc_location_id,
            });
        } else {
            setFormData({
                tprofc_id: "",
                tprofc_corporate: "",
                tprofc_bu: "",
                tprofc_gl_account: "",
                tprofc_profit_centre: "",
                tprofc_cost_centre: "",
                tprofc_state_id: "",
                tprofc_district_id: "",
                tprofc_location_id: "",
            });
        }
    }, [editProfitCenter]);


    const handleChange = async (e) => {
        let updatedData;
        const { name, value } = e.target;
        if (name === "tprofc_state_id" && formData?.tprofc_state_id !== value) {
            setDistricts([]);
            setLocations([]);
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
                tprofc_district_id: "",
                tprofc_location_id: "",
            };
        } else if (
            name === "tprofc_district_id" &&
            formData?.tprofc_district_id !== value
        ) {
            setLocations([]);
            fetchLocationByDistrictId(value)
                .then((data) => {
                    setLocations(data?.data);
                })
                .catch((error) => {
                    toast.error(error?.response?.data?.message);
                });
            updatedData = {
                ...formData,
                [name]: value,
                tprofc_location_id: "",
            };
        }
        else {
            updatedData = { ...formData, [name]: value };
        }
        setFormData(updatedData);
    };



    const submit = async (e) => {
        e.preventDefault();
        const isValid = await handleValidation(formData);
        if (!isValid) return;
        setLoading(true);




        const updateData = {
            tprofc_id: formData?.tprofc_id,
            tprofc_corporate: formData?.tprofc_corporate,
            tprofc_bu: formData?.tprofc_bu,
            tprofc_gl_account: formData?.tprofc_gl_account,
            tprofc_profit_centre: formData?.tprofc_profit_centre,
            tprofc_cost_centre: formData?.tprofc_cost_centre,
            tprofc_state_id: formData?.tprofc_state_id,
            tprofc_district_id: formData?.tprofc_district_id,
            tprofc_location_id: formData?.tprofc_location_id
        };

        if (editProfitCenter) {
            updateProfitCenterDetailsApi(updateData, formData?.tprofc_id)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedProfitCenterDatatable(datatable_url);
                })
                .catch((error) => {
                    const errMsg = error?.response?.data?.message || "Something went wrong";
                    setErrors({ tprofc_profit_centre: errMsg });
                    toast.error(error.response.data.message);
                    setLoading(false);
                });
        } else {

            createProfitCenterApi(updateData)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedProfitCenterDatatable(datatable_url);
                })
                .catch((error) => {
                    const errMsg = error?.response?.data?.message || "Something went wrong";
                    setErrors({ tprofc_profit_centre: errMsg });
                    toast.error(error.response.data.message);
                    setLoading(false);
                });
        }
    };

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
                            <label htmlFor="email" className="form-label">
                                Corporate/Plant/ Division/Zone
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tprofc_corporate}
                                onChange={handleChange}
                                name="tprofc_corporate"
                                id="tprofc_corporate"
                                placeholder="Enter Corporate/Plant/ Division/Zone"
                            // required
                            />
                            {errors?.tprofc_corporate && (
                                <div className="error text-danger">
                                    {errors?.tprofc_corporate}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                BU
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tprofc_bu}
                                onChange={handleChange}
                                name="tprofc_bu"
                                id="tprofc_bu"
                                placeholder="Enter BU"
                            // required
                            />
                            {errors?.tprofc_bu && (
                                <div className="error text-danger">
                                    {errors?.tprofc_bu}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label">
                                State
                            </label>
                            <Select
                                name="tprofc_state_id"
                                options={states}
                                value={
                                    states.find(
                                        ({ value }) => value == formData?.tprofc_state_id
                                    ) || ""
                                }
                                onChange={(e) => {
                                    handleChange({
                                        target: {
                                            name: "tprofc_state_id",
                                            value: e.value,
                                        },
                                    });
                                }}
                                labelledBy="Select States"
                            />
                            {errors?.tprofc_state_id && (
                                <div className="error text-danger">{errors?.tprofc_state_id}</div>
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
                                name="tprofc_district_id"
                                options={districts}
                                value={
                                    districts.find(
                                        ({ value }) => value == formData?.tprofc_district_id
                                    ) || ""
                                }
                                onChange={(e) => {
                                    handleChange({
                                        target: {
                                            name: "tprofc_district_id",
                                            value: e.value,
                                        },
                                    });
                                }}
                                labelledBy="Select Districts"
                            />
                            {errors?.tprofc_district_id && (
                                <div className="error text-danger">
                                    {errors?.tprofc_district_id}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label">
                                Location
                            </label>
                            <Select
                                name="tprofc_location_id"
                                options={locations}
                                value={
                                    locations.find(
                                        ({ value }) => value == formData?.tprofc_location_id
                                    ) || ""
                                }
                                onChange={(e) => {
                                    handleChange({
                                        target: {
                                            name: "tprofc_location_id",
                                            value: e.value,
                                        },
                                    });
                                }}
                                labelledBy="Select Locations"
                            />
                            {errors?.tprofc_location_id && (
                                <div className="error text-danger">{errors?.tprofc_location_id}</div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                GL Account
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tprofc_gl_account}
                                onChange={handleChange}
                                name="tprofc_gl_account"
                                id="tprofc_gl_account"
                                placeholder="Enter GL Account "
                            // required
                            />
                            {errors?.tprofc_gl_account && (
                                <div className="error text-danger">
                                    {errors?.tprofc_gl_account}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Profit Centre
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tprofc_profit_centre}
                                onChange={handleChange}
                                name="tprofc_profit_centre"
                                id="tprofc_profit_centre"
                                placeholder="Enter Profit Centre "
                            // required
                            />
                            {errors?.tprofc_profit_centre && (
                                <div className="error text-danger">
                                    {errors?.tprofc_profit_centre}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Cost Centre
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tprofc_cost_centre}
                                onChange={handleChange}
                                name="tprofc_cost_centre"
                                id="tprofc_cost_centre"
                                placeholder="Enter Cost Centre"
                            // required
                            />
                            {errors?.tprofc_cost_centre && (
                                <div className="error text-danger">
                                    {errors?.tprofc_cost_centre}
                                </div>
                            )}
                        </div>
                    </div>


                </div>

                <div className="row">
                    <div className="col-md-12 float-right">
                        <button type="submit" className="btn btn-primary ">
                            Submit
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
};
