import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import * as Yup from "yup";

import {
    createNationalIndicatorApi,
    updateNationalIndicatorApi,
    allSdgs
} from "../../../services/National-indicator-service";

import { allProjectTypes } from "../../../Services/SubProject-type-service";

const Schema = Yup.object({
    target: Yup.string().trim().required("Target is required"),
    indicators: Yup.string().trim().required("Indicators are required"),
    tnif_sdg_id: Yup.string().required("SDG is required"),
});


export const AddEditSdg = ({
    changeModalStatus,
    editSdg,
    initiatedSdgDatatable,
    datatable_url
}) => {

    const [projectTypeOptions, setProjectTypeOptions] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
    target: "",
    indicators: "",
    tnif_sdg_id: "",
});


    /* ================= FETCH PROJECT TYPES ================= */
    const fetchAllData = async () => {
        try {
            // const res = await allProjectTypes();
            const res = await allSdgs();

            setProjectTypeOptions(res?.data || []);
        } catch (err) {
            toast.error("Failed to load Project Types");
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    /* ================= EDIT MODE ================= */
   useEffect(() => {
    setErrors({});
    if (editSdg) {
        setFormData({
            target: editSdg?.tnif_target || "",
            indicators: editSdg?.tnif_indicator || "",
            tnif_sdg_id: editSdg?.tnif_sdg_id || "",
        });
    } else {
        setFormData({
            target: "",
            indicators: "",
            tnif_sdg_id: "",
        });
    }
}, [editSdg]);


    /* ================= INPUT CHANGE ================= */
    const inputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    /* ================= VALIDATION ================= */
    const handleValidation = async () => {
        try {
            await Schema.validate(formData, { abortEarly: false });
            setErrors({});
            return true;
        } catch (err) {
            const validationErrors = {};
            err.inner.forEach(e => {
                validationErrors[e.path] = e.message;
            });
            setErrors(validationErrors);
            return false;
        }
    };

    /* ================= SUBMIT ================= */
    const submit = async (e) => {
        e.preventDefault();

        const isValid = await handleValidation();
        if (!isValid) return;

        setLoading(true);

        const payload = {
    tnif_target: formData.target,
    tnif_indicator: formData.indicators,
    tnif_sdg_id: formData.tnif_sdg_id,
};


        if (editSdg) {
            updateNationalIndicatorApi(payload, editSdg?.tnif_id)
                .then(res => {
                    setLoading(false);
                    res.status === 1
                        ? toast.success(res.message)
                        : toast.error(res.message);

                    changeModalStatus("user_update_modal", false);
                    initiatedSdgDatatable(datatable_url);
                })
                .catch(err => {
                    toast.error(err?.response?.data?.message || "Update failed");
                    setLoading(false);
                });
        } else {
            createNationalIndicatorApi(payload)
                .then(res => {
                    setLoading(false);
                    res.status === 1
                        ? toast.success(res.message)
                        : toast.error(res.message);

                    changeModalStatus("user_update_modal", false);
                    initiatedSdgDatatable(datatable_url);
                })
                .catch(err => {
                    toast.error(err?.response?.data?.message || "Create failed");
                    setLoading(false);
                });
        }
    };

    return (
        <>
            <Toaster position="top-center" toastOptions={{ duration: 2000 }} />

            <form onSubmit={submit} className="my_form">
                <div className="row">

                    {/* Project Type */}
                    <select
    className="form-select"
    name="tnif_sdg_id"
    value={formData.tnif_sdg_id}
    onChange={inputChange}
>
    <option value="">Select SDG</option>
    {projectTypeOptions.map(item => (
        <option key={item.value} value={item.value}>
            {item.label}
        </option>
    ))}
</select>

{errors?.tnif_sdg_id && (
    <div className="text-danger">{errors.tnif_sdg_id}</div>
)}


                    {/* Target */}
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label">Target</label>
                            <input
                                type="text"
                                className="form-control"
                                name="target"
                                value={formData.target}
                                onChange={inputChange}
                                placeholder="Enter Target"
                            />
                            {errors?.target && (
                                <div className="text-danger">{errors.target}</div>
                            )}
                        </div>
                    </div>

                    {/* Indicators */}
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label">Indicators</label>
                            <input
                                type="text"
                                className="form-control"
                                name="indicators"
                                value={formData.indicators}
                                onChange={inputChange}
                                placeholder="Enter Indicators"
                            />
                            {errors?.indicators && (
                                <div className="text-danger">{errors.indicators}</div>
                            )}
                        </div>
                    </div>

                </div>

                <div className="row">
                    <div className="col-md-12 text-end">
                        <button
                            type="submit"
                            className="btn btn-dark"
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
};
