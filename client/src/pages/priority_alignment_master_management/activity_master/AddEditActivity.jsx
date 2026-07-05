import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import Select from "react-select";
import * as Yup from "yup";
import { createActivityApi, getAllScheduleSevenApi, getFocusAreaByScheduleSeven, updateActivityDetailsApi,getAllSubScheduleSevenApi } from "../../../services/PriorityAlignment-service";

const Schema = Yup.object({
    tactm_schedule_id: Yup.string().required("Schedule Seven name is required"),
    tactm_focus_area_id: Yup.string().required("Sub Schedule is required"),
    tactm_activity_name: Yup.string()
        .trim()
        .required("Activity name is required"),
});

export const AddEditActivity = ({ changeModalStatus, editActivity, initiatedActivityDatatable, datatable_url }) => {

    const [scheduleSeven, setScheduleSeven] = useState([]);
    const [focusArea, setFocusArea] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        tactm_activity_id: null,
        tactm_schedule_id: null,
        tactm_focus_area_id: null,
        tactm_activity_name: "",
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
        let updatedData;
        const { name } = e.target;

         const type = e.target.type;
        let value = e.target.value;

          if (type === "text") {
            value = value.replace(/^\s+/, "");
        }

        if (name === "tactm_schedule_id" && formData?.tactm_schedule_id !== value) {
            setFocusArea([]);
           

             getAllSubScheduleSevenApi({schedule_id:value})
                .then((data) => {
                    setFocusArea(data?.data);
                })
                .catch((error) => {
                    toast.error(error?.response?.data?.message);
                });
            updatedData = { ...formData, [name]: value, tactm_focus_area_id: "" };
        } else {
            updatedData = { ...formData, [name]: value };
        }
        setFormData(updatedData);
    };

    useEffect(() => {
        setErrors({});
        if (editActivity) {
            getAllSubScheduleSevenApi({schedule_id:editActivity?.tactm_schedule_id})
                .then((data) => {
                    setFocusArea(data?.data);
                })
                .catch((error) => {
                    toast.error(
                        error?.response?.data?.originalError ||
                        error?.response?.data?.message
                    );
                });

            setFormData({
                tactm_activity_name: editActivity?.tactm_activity_name,
                tactm_activity_id: editActivity?.tactm_activity_id,
                tactm_schedule_id: editActivity?.tactm_schedule_id,
                tactm_focus_area_id: editActivity?.tactm_focus_area_id,
            });
        } else {
            setFormData({
                tactm_activity_name: "",
                tactm_activity_id: null,
                tactm_schedule_id: null,
                tactm_focus_area_id: null,
            });
        }
    }, [editActivity]);

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

    const submit = async (e) => {
        e.preventDefault();
        const isValid = await handleValidation(formData);
        if (!isValid) return;
        setLoading(true);



        if (editActivity) {
            updateActivityDetailsApi(formData, formData?.tactm_activity_id)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedActivityDatatable(datatable_url);
                })
                .catch((error) => {
                    // const errMsg = error?.response?.data?.message || "Something went wrong";
                    // setErrors({ tdl_district_name: errMsg });
                    toast.error(error?.response?.data?.message);
                    setLoading(false);
                });
        } else {

            createActivityApi(formData)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedActivityDatatable(datatable_url);
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
                                Schedule Vii Name
                            </label>
                            <Select
                                name="tactm_schedule_id"
                                options={scheduleSeven}
                                value={
                                    scheduleSeven.find(
                                        ({ value }) => value == formData?.tactm_schedule_id
                                    ) || ""
                                }
                                onChange={(e) => {
                                    inputChange({
                                        target: {
                                            name: "tactm_schedule_id",
                                            value: e.value,
                                        },
                                    });
                                }}
                                labelledBy="Select Schedule Seven"
                            />
                            {errors?.tactm_schedule_id && (
                                <div className="error text-danger">{errors?.tactm_schedule_id}</div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label">
                                Sub Schedule
                            </label>
                            <Select
                                options={focusArea}
                                name="tactm_focus_area_id"
                                value={
                                    focusArea.find(
                                        ({ value }) => value == formData?.tactm_focus_area_id
                                    ) || ""
                                }
                                onChange={(e) => {
                                    inputChange({
                                        target: {
                                            name: "tactm_focus_area_id",
                                            value: e.value,
                                        },
                                    });
                                }}
                                labelledBy="Select Sub Schedule"
                            />
                            {errors?.tactm_focus_area_id && (
                                <div className="error text-danger">
                                    {errors?.tactm_focus_area_id}
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="col-md-6">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Activity Name
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tactm_activity_name}
                                onChange={inputChange}
                                name="tactm_activity_name"
                                id="tactm_activity_name"
                                placeholder="Enter Activity Name"
                            />
                            {errors?.tactm_activity_name && (
                                <div className="error text-danger">
                                    {errors?.tactm_activity_name}
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
