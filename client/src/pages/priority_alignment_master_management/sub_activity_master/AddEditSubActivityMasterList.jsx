import { useEffect, useState } from "react";
import Select from "react-select";

import { toast, Toaster } from "react-hot-toast";
import * as Yup from "yup";
import { createSubActivityApi, getActivityByFocusAreaId, getAllScheduleSevenApi, getFocusAreaByScheduleSeven, updateSubActivityDetailsApi, getAllSubScheduleSevenApi } from "../../../services/PriorityAlignment-service";
const Schema = Yup.object({
    tsactm_schedule_id: Yup.string().required("Schedule Seven name is required"),
    tsactm_focus_area_id: Yup.string().required("Focus Area name is required"),
    tsactm_activity_id: Yup.string().required("Activity name is required"),
    tsactm_sub_activity_name: Yup.string()
        .trim()
        .required("Sub Activity name is required"),
});
export const AddEditSubActivityMasterList = ({ changeModalStatus, editSubActivity, initiatedSubActivityDatatable, datatable_url }) => {

    const [scheduleSeven, setScheduleSeven] = useState([]);
    const [focusArea, setFocusArea] = useState([]);
    const [activity, setActivity] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        tsactm_schedule_id: null,
        tsactm_focus_area_id: null,
        tsactm_activity_id: null,
        tsactm_sub_activity_name: "",
        tsactm_sub_activity_id: null,
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
        if (name === "tsactm_schedule_id" && formData?.tsactm_schedule_id !== value) {
            setFocusArea([]);
            setActivity([]);
            // getFocusAreaByScheduleSeven(value)
            getAllSubScheduleSevenApi({ schedule_id: value })

                .then((data) => {
                    setFocusArea(data?.data);
                })
                .catch((error) => {
                    toast(error?.response?.data?.message);
                });
            updatedData = {
                ...formData,
                [name]: value,
                tsactm_focus_area_id: "",
                tsactm_activity_id: "",
            };
        } else if (
            name === "tsactm_focus_area_id" &&
            formData?.tsactm_focus_area_id !== value
        ) {
            setActivity([]);
            getActivityByFocusAreaId(value)
                .then((data) => {
                    setActivity(data?.data);
                })
                .catch((error) => {
                    toast.error(error?.response?.data?.message);
                });
            updatedData = {
                ...formData,
                [name]: value,
                tsactm_activity_id: "",
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

        if (editSubActivity) {
            updateSubActivityDetailsApi(formData, formData?.tsactm_sub_activity_id)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedSubActivityDatatable(datatable_url);
                })
                .catch((error) => {
                    // const errMsg = error?.response?.data?.message || "Something went wrong";
                    // setErrors({ tdl_district_name: errMsg });
                    toast.error(error?.response?.data?.message);
                    setLoading(false);
                });
        } else {

            createSubActivityApi(formData)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedSubActivityDatatable(datatable_url);
                })
                .catch((error) => {
                    // const errMsg = error?.response?.data?.message || "Something went wrong";
                    // setErrors({ tdl_district_name: errMsg });
                    console.log("error--------- ", error);

                    toast.error(error?.response?.data?.message);
                    setLoading(false);
                });
        }
    };

    useEffect(() => {
        setErrors({});
        if (editSubActivity) {
            // getFocusAreaByScheduleSeven(editSubActivity?.tsactm_schedule_id)
            getAllSubScheduleSevenApi({ schedule_id: editSubActivity?.tsactm_schedule_id })
                .then((data) => {
                    setFocusArea(data?.data);
                })
                .catch((error) => {
                    toast.error(
                        error?.response?.data?.originalError ||
                        error?.response?.data?.message
                    );
                });

            getActivityByFocusAreaId(editSubActivity?.tsactm_focus_area_id)
                .then((data) => {
                    setActivity(data?.data);
                })
                .catch((error) => {
                    toast.error(
                        error?.response?.data?.originalError ||
                        error?.response?.data?.message
                    );
                });

            setFormData({
                tsactm_schedule_id: editSubActivity?.tsactm_schedule_id,
                tsactm_focus_area_id: editSubActivity?.tsactm_focus_area_id,
                tsactm_activity_id: editSubActivity?.tsactm_activity_id,
                tsactm_sub_activity_name: editSubActivity?.tsactm_sub_activity_name,
                tsactm_sub_activity_id: editSubActivity?.tsactm_sub_activity_id,
            });
        } else {
            setFormData({
                tsactm_schedule_id: null,
                tsactm_focus_area_id: null,
                tsactm_activity_id: null,
                tsactm_sub_activity_name: "",
                tsactm_sub_activity_id: null,
            });
        }
    }, [editSubActivity]);

    useEffect(() => {
        getAllScheduleSevenApi()
            .then((data) => {
                setScheduleSeven(data?.data || []);
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
                                Schedule Seven Name
                            </label>
                            <Select
                                name="tsactm_schedule_id"
                                options={scheduleSeven}
                                value={
                                    scheduleSeven.find(
                                        ({ value }) => value == formData?.tsactm_schedule_id
                                    ) || ""
                                }
                                onChange={(e) => {
                                    handleChange({
                                        target: {
                                            name: "tsactm_schedule_id",
                                            value: e.value,
                                        },
                                    });
                                }}
                                labelledBy="Select Schedule Seven Name"
                            />
                            {errors?.tsactm_schedule_id && (
                                <div className="error text-danger">{errors?.tsactm_schedule_id}</div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label">
                                Focus Area Name
                            </label>
                            <Select
                                name="tsactm_focus_area_id"
                                options={focusArea}
                                value={
                                    focusArea.find(
                                        ({ value }) => value == formData?.tsactm_focus_area_id
                                    ) || ""
                                }
                                onChange={(e) => {
                                    handleChange({
                                        target: {
                                            name: "tsactm_focus_area_id",
                                            value: e.value,
                                        },
                                    });
                                }}
                                labelledBy="Select Focus Area Name"
                            />
                            {errors?.tsactm_focus_area_id && (
                                <div className="error text-danger">
                                    {errors?.tsactm_focus_area_id}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label">
                                Activity
                            </label>
                            <Select
                                name="tsactm_activity_id"
                                options={activity}
                                value={
                                    activity.find(
                                        ({ value }) => value == formData?.tsactm_activity_id
                                    ) || ""
                                }
                                onChange={(e) => {
                                    handleChange({
                                        target: {
                                            name: "tsactm_activity_id",
                                            value: e.value,
                                        },
                                    });
                                }}
                                labelledBy="Select Activity"
                            />
                            {errors?.tsactm_activity_id && (
                                <div className="error text-danger">{errors?.tsactm_activity_id}</div>
                            )}
                        </div>
                    </div>


                    <div className="col-md-6">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Sub Activity Name
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tsactm_sub_activity_name}
                                onChange={handleChange}
                                name="tsactm_sub_activity_name"
                                id="tsactm_sub_activity_name"
                                placeholder="Enter Sub Activity Name"
                            />
                            {errors?.tsactm_sub_activity_name && (
                                <div className="error text-danger">
                                    {errors?.tsactm_sub_activity_name}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12 float-right">
                        <button type="submit" className="btn btn-dark">
                            Submit
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
};
