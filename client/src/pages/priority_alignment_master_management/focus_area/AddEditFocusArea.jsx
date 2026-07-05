import { useEffect, useState } from "react";
import Select from "react-select";
import { toast, Toaster } from "react-hot-toast";
import * as Yup from "yup";
import { createSubScheduleSevenApi, getAllScheduleSevenApi, getAllSubScheduleSevenApi, updateSubScheduleSevenDetailsApi } from "../../../services/PriorityAlignment-service";
const Schema = Yup.object({
    tfam_schedule_id: Yup.string().required("Schedule Seven name is required"),
    tfam_focus_area_name: Yup.string()
        .trim()
        .required("Subschedule name is required"),
});

export const AddEditFocusArea = ({ changeModalStatus, editFocusArea, initiatedFocusAreaDatatable, datatable_url }) => {

    const [scheduleSevenOptions, setStateOptions] = useState([]);
    let [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        tfam_schedule_id: "",
        tfam_focus_area_id: "",
        tfam_focus_area_name: "",
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
        if (editFocusArea) {
            setFormData({
                tfam_focus_area_id: editFocusArea?.tsubshcm_sub_schedule_id,
                tfam_focus_area_name: editFocusArea?.tsubshcm_sub_schedule_name,
                tfam_schedule_id: editFocusArea?.tsubshcm_schedule_id,
            });
        } else {
            setFormData({
                tfam_focus_area_id: null,
                tfam_schedule_id: null,
                tfam_focus_area_name: "",
            });
        }
    }, [editFocusArea]);


    let inputChange = (event) => {
        var field = event.target.name
        const actualValue = event.target.value;
        setFormData({ ...formData, [field]: actualValue });
    };

    const handleSelectChange = (selectedOption, { name }) => {
        setFormData({ ...formData, [name]: selectedOption ? selectedOption.value : '' });
    };

    const submit = async (e) => {
        e.preventDefault();

        const isValid = await handleValidation(formData);

        if (!isValid) return;
        setLoading(true);

        if (editFocusArea) {
            updateSubScheduleSevenDetailsApi(formData, formData?.tfam_focus_area_id)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedFocusAreaDatatable(datatable_url);
                })
                .catch((error) => {
                    // const errMsg = error?.response?.data?.message || "Something went wrong";
                    // setErrors({ tfam_focus_area_name: errMsg });
                    toast.error(error?.response?.data?.message);
                    setLoading(false);
                });
        } else {

            createSubScheduleSevenApi(formData)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedFocusAreaDatatable(datatable_url);
                })
                .catch((error) => {
                    // const errMsg = error?.response?.data?.message || "Something went wrong";
                    // setErrors({ tfam_focus_area_name: errMsg });
                    toast.error(error?.response?.data?.message);
                    setLoading(false);
                });
        }

    };

    const fetchAllScheduleSeven = () => {
        getAllScheduleSevenApi()
            .then((data) => {
                setStateOptions(data?.data || []);
            })
            .catch((error) => {
                toast.error(
                    error?.response?.data?.originalError || error?.response?.data?.message
                );
            });
    };

    useEffect(() => {
        fetchAllScheduleSeven();
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
                            <label htmlFor="Village" className="form-label">
                                Schedule Vii Name
                            </label>
                            <Select
                                labelledBy="Select Schedule Seven"
                                name="tfam_schedule_id"
                                id="scheduleSeven"
                                options={scheduleSevenOptions}
                                value={scheduleSevenOptions.find(
                                    ({ value }) => value == formData?.tfam_schedule_id
                                )}
                                onChange={(selectedOption) => handleSelectChange(selectedOption, { name: "tfam_schedule_id" })
                                }
                            />
                            {errors.tfam_schedule_id && <small className="error text-danger">{errors.tfam_schedule_id}</small>}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Subschedule Name
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tfam_focus_area_name}
                                onChange={inputChange}
                                name="tfam_focus_area_name"
                                id="tfam_focus_area_name"
                                placeholder="Enter Subschedule Name"
                            // required
                            />
                            {errors.tfam_focus_area_name && <small className="error text-danger">{errors.tfam_focus_area_name}</small>}
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
