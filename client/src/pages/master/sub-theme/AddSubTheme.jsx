import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import Select from "react-select";
import * as Yup from "yup";
import { createSubScheduleSevenApi, updateSubScheduleSevenDetailsApi, getAllScheduleSevenApi } from "../../../services/PriorityAlignment-service";

// ✅ USE NEW API (IMPORTANT)


// ✅ VALIDATION
const Schema = Yup.object({
    tsubshcm_schedule_id: Yup.string().required("Thematic Area is required"),
    tsubshcm_sub_schedule_name: Yup.string()
        .max(100)
        .required("Sub-theme is required"),
    tsubshcm_desc: Yup.string(),
});

export const AddSubTheme = ({
    changeModalStatus,
    editState,
    initiatedStateDatatable,
    datatable_url,
}) => {

    const [scheduleSeven, setScheduleSeven] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // ✅ FULLY UPDATED FORM
    const [formData, setFormData] = useState({
        tsubshcm_sub_schedule_id: "",
        tsubshcm_schedule_id: "",
        tsubshcm_sub_schedule_name: "",
        tsubshcm_desc: "",
    });

    // ✅ VALIDATION
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

    // ✅ EDIT MODE FIXED
    useEffect(() => {
        setErrors({});

        if (editState) {
            setFormData({
                tsubshcm_sub_schedule_id: editState?.tsubshcm_sub_schedule_id || "",
                tsubshcm_schedule_id: editState?.tsubshcm_schedule_id || "",
                tsubshcm_sub_schedule_name: editState?.tsubshcm_sub_schedule_name || "",
                tsubshcm_desc: editState?.tsubshcm_desc || "",
            });


        } else {
            setFormData({
                tsubshcm_sub_schedule_id: "",
                tsubshcm_schedule_id: "",
                tsubshcm_sub_schedule_name: "",
            });
        }

    }, [editState]);

    // ✅ INPUT CHANGE
    const inputChange = (e) => {
        let { name, value } = e.target;
        value = value.replace(/^\s+/, "");

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ✅ LOAD SCHEDULES
    useEffect(() => {
        getAllScheduleSevenApi()
            .then((res) => setScheduleSeven(res?.data || []))
            .catch((error) => toast.error(error?.response?.data?.message));
    }, []);

    // ✅ SUBMIT
    const submit = async (e) => {
        e.preventDefault();

        const isValid = await handleValidation(formData);
        if (!isValid) return;

        setLoading(true);

        const payload = {
            tsubshcm_sub_schedule_id: formData.tsubshcm_sub_schedule_id,
            tsubshcm_schedule_id: formData.tsubshcm_schedule_id,
            tsubshcm_sub_schedule_name: formData.tsubshcm_sub_schedule_name.trim(),
            tsubshcm_desc: formData.tsubshcm_desc?.trim(),
        };

        const apiCall = editState
            ? updateSubScheduleSevenDetailsApi(payload, formData.tsubshcm_sub_schedule_id)
            : createSubScheduleSevenApi(payload);

        apiCall
            .then((res) => {
                setLoading(false);
                if (res.status === true) {
                    toast.success(res.message);
                    changeModalStatus("user_update_modal", false);
                    initiatedStateDatatable(datatable_url);
                } else {
                    toast.error(res.message);
                }
            })
            .catch((error) => {
                toast.error(error?.response?.data?.message || "Something went wrong");
                setLoading(false);
            });
    };

    return (
        <>
            <Toaster position="top-center" />

            <form onSubmit={submit} className="my_form">
                <div className="row">


                    {/* SCHEDULE */}
                    <div className="col-md-12 mb-3">
                        <label className="form-label">
                            Thematic Area (Schedule VII Item No) <span className="required">*</span>
                        </label>
                        <Select
                            options={scheduleSeven}
                            value={scheduleSeven.find(
                                (opt) => opt.value === formData.tsubshcm_schedule_id
                            )}
                            onChange={(selected) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    tsubshcm_schedule_id: selected?.value,
                                }))
                            }
                            isDisabled={false}
                            placeholder="Select Thematic Area"
                        />
                        {errors.tsubshcm_schedule_id && (
                            <div className="text-danger">{errors.tsubshcm_schedule_id}</div>
                        )}
                    </div>

                    {/* SUB SCHEDULE */}
                    <div className="col-md-12 mb-3">
                        <label className="form-label">
                            Sub-theme<span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            name="tsubshcm_sub_schedule_name"
                            value={formData.tsubshcm_sub_schedule_name}
                            onChange={inputChange}
                            placeholder="Enter Sub-theme"
                        />
                        {errors.tsubshcm_sub_schedule_name && (
                            <div className="text-danger">
                                {errors.tsubshcm_sub_schedule_name}
                            </div>
                        )}
                    </div>

                    {/* DESCRIPTION */}
                    <div className="col-md-12 mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-control"
                            name="tsubshcm_desc"
                            value={formData.tsubshcm_desc}
                            onChange={inputChange}
                            placeholder="Enter Description"
                            rows={3}
                        />
                        {errors.tsubshcm_desc && (
                            <div className="text-danger">{errors.tsubshcm_desc}</div>
                        )}
                    </div>

                </div>

                <button className="btn btn-primary" disabled={loading}>
                    {loading ? "Submitting..." : "Submit"}
                </button>
            </form>
        </>
    );
};