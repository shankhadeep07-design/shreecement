import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import * as Yup from "yup";
import { createScheduleSevenApi, updateScheduleSevenDetailsApi } from "../../../services/PriorityAlignment-service";
import { fetchAllThemeList } from "../../../Services/Master-service";
import Select from "react-select";

const Schema = Yup.object({
    // tschm_schedule_name: Yup.string()
    //     .trim()
    //     .required("Item number is required"),


    tschm_schedule_name: Yup.string()
        .trim()
        .required("This field is required"),
    schedule_vii_line_item: Yup.string()
        .trim()
        .required("This field is required"),
    sub_activity_item_number: Yup.string()
        .trim()
        .required("This field is required"),

});

export const AddEditScheduleSeven = ({ changeModalStatus, editScheduleSeven, initiatedScheduleSevenDatatable, datatable_url }) => {

    
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});


    const [formData, setFormData] = useState({
        tschm_schedule_id: "",
        tschm_schedule_name: "",        // Item number (existing)
        schedule_vii_line_item: "",     // NEW
        sub_activity_item_number: "",   // NEW
        sub_activity_description: "",   // NEW
        // tschm_theme_id: ""
    });
    const [themeOptions, setThemeOptions] = useState([]);

    const handleSelectChange = (selectedOption, { name }) => {
        setFormData({
            ...formData,
            [name]: selectedOption ? selectedOption.value : ""
        });
    };
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
        if (editScheduleSeven) {
            setFormData({
                tschm_schedule_id: editScheduleSeven?.tschm_schedule_id,
                tschm_schedule_name: editScheduleSeven?.tschm_schedule_name,
                schedule_vii_line_item: editScheduleSeven?.tschm_schedule_vii_line_item,
                sub_activity_item_number: editScheduleSeven?.tschm_sub_activity_item_number,
                sub_activity_description: editScheduleSeven?.tschm_sub_activity_description,
                //  tschm_theme_id: editScheduleSeven?.tschm_theme_id 
            });
        } else {
            setFormData({
                tschm_schedule_id: "",
                tschm_schedule_name: "",
                schedule_vii_line_item: "",
                sub_activity_item_number: "",
                sub_activity_description: "",
                //  tschm_theme_id: ""
            });
        }
    }, [editScheduleSeven]);


    let inputChange = (event) => {
        var field = event.target.name
        const actualValue = event.target.value;
        setFormData({ ...formData, [field]: actualValue });
    };

    // const submit = async (e) => {
    //     e.preventDefault();
    //     const isValid = await handleValidation(formData);
    //     if (!isValid) return;
    //     setLoading(true);
    //     const updateData = {
    //         tschm_schedule_id: formData.tschm_schedule_id,
    //         tschm_schedule_name: formData.tschm_schedule_name,
    //         schedule_vii_line_item: formData.schedule_vii_line_item,
    //         sub_activity_item_number: formData.sub_activity_item_number,
    //         sub_activity_description: formData.sub_activity_description,
    //     };
    //     if (editScheduleSeven) {
    //         updateScheduleSevenDetailsApi(updateData, formData?.tschm_schedule_id)
    //             .then((res) => {
    //                 setLoading(false);
    //                 if (res.status == 1) {
    //                     toast.success(res.message);
    //                 } else {
    //                     toast.error(res.message);
    //                 }
    //                 changeModalStatus("user_update_modal", false);
    //                 initiatedScheduleSevenDatatable(datatable_url);
    //             })
    //             .catch((error) => {
    //                 const errMsg = error?.response?.data?.message || "Something went wrong";
    //                 setErrors({ tschm_schedule_name: errMsg });
    //                 toast.error(error.response.data.message);
    //                 setLoading(false);
    //             });
    //     } else {
    //         createScheduleSevenApi(updateData)
    //             .then((res) => {
    //                 setLoading(false);
    //                 if (res.status == 1) {
    //                     toast.success(res.message);
    //                 } else {
    //                     toast.error(res.message);
    //                 }
    //                 changeModalStatus("user_update_modal", false);
    //                 initiatedScheduleSevenDatatable(datatable_url);
    //             })
    //             .catch((error) => {
    //                 const errMsg = error?.response?.data?.message || "Something went wrong";
    //                 setErrors({ tschm_schedule_name: errMsg });
    //                 toast.error(error.response.data.message);
    //                 setLoading(false);
    //             });
    //     }
    // };


    const TOAST_ID = "schedule-seven-submit";
    const submit = async (e) => {
        e.preventDefault();

        const isValid = await handleValidation(formData);
        if (!isValid) return;

        setLoading(true);

        const updateData = {
            tschm_schedule_id: formData.tschm_schedule_id,
            tschm_schedule_name: formData.tschm_schedule_name,
            schedule_vii_line_item: formData.schedule_vii_line_item,
            sub_activity_item_number: formData.sub_activity_item_number,
            sub_activity_description: formData.sub_activity_description,
            // tschm_theme_id: formData.tschm_theme_id
        };

        const onSuccess = (res) => {
            setLoading(false);

            if (res?.status == 1) {
                toast.success(res.message, { id: TOAST_ID });
            } else {
                toast.error(res.message, { id: TOAST_ID });
            }

            changeModalStatus("user_update_modal", false);
            initiatedScheduleSevenDatatable(datatable_url);
        };

        const onError = (error) => {
            setLoading(false);

            const errMsg =
                error?.response?.data?.message || "Something went wrong";

            setErrors({ tschm_schedule_name: errMsg });

            toast.error(errMsg, { id: TOAST_ID });
        };

        try {
            if (editScheduleSeven) {
                const res = await updateScheduleSevenDetailsApi(
                    updateData,
                    formData?.tschm_schedule_id
                );
                onSuccess(res);
            } else {
                const res = await createScheduleSevenApi(updateData);
                onSuccess(res);
            }
        } catch (error) {
            onError(error);
        }
    };

    const fetchThemes = () => {
        fetchAllThemeList()
            .then((data) => {
                setThemeOptions(data?.data || []);
            })
            .catch((error) => {
                toast.error(error?.response?.data?.message);
            });
    };

    useEffect(() => {
        fetchThemes();
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

                    {/* <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label">
                                Theme <span className="required">*</span>
                            </label>

                            <Select
                                name="tschm_theme_id"
                                options={themeOptions}
                                value={themeOptions.find(
                                    ({ value }) => value === formData?.tschm_theme_id
                                )}
                                onChange={(selectedOption) =>
                                    handleSelectChange(selectedOption, { name: "tschm_theme_id" })
                                }
                            />
                        </div>
                    </div> */}

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Item number                             </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tschm_schedule_name}
                                onChange={inputChange}
                                name="tschm_schedule_name"
                                id="tschm_schedule_name"
                                placeholder="Enter Item number "
                            // required
                            />
                            {errors?.tschm_schedule_name && (
                                <div className="error text-danger">
                                    {errors?.tschm_schedule_name}
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label">Schedule VII line items</label>
                            <input
                                type="text"
                                className="form-control"
                                name="schedule_vii_line_item"
                                value={formData.schedule_vii_line_item}
                                onChange={inputChange}
                                placeholder="Enter Schedule VII line items"
                            />
                            {errors?.schedule_vii_line_item && (
                                <div className="error text-danger">
                                    {errors?.schedule_vii_line_item}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label">Sub Activities item number</label>
                            <input
                                type="text"
                                className="form-control"
                                name="sub_activity_item_number"
                                value={formData.sub_activity_item_number}
                                onChange={inputChange}
                                placeholder="Enter Sub activity item number"
                            />
                            {errors?.sub_activity_item_number && (
                                <div className="error text-danger">
                                    {errors?.sub_activity_item_number}
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label">Sub activities description</label>
                            <textarea
                                className="form-control"
                                name="sub_activity_description"
                                value={formData.sub_activity_description}
                                onChange={inputChange}
                                placeholder="Enter Sub activities description"
                                rows={2}
                            />
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
