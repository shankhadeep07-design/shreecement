import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import * as Yup from "yup";
import { createCategoryApi, updateCategoryApi } from '../../../services/Category-service';



const Schema = Yup.object({
    tcat_category_type: Yup.string()
        .trim()
        .required("Category Type is required")
        .max(255, "Maximum 255 characters allowed"),

    tcat_category_desc: Yup.string()
        .trim()
        .max(500, "Maximum 500 characters allowed"),
});

export const AddCategory = ({
    changeModalStatus,
    editState,
    initiatedStateDatatable,
    datatable_url,
}) => {

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        tcat_id:            "",
        tcat_category_type: "",
        tcat_category_desc: "",
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

    // Prepopulate on edit
    useEffect(() => {
        setErrors({});

        if (editState) {
            setFormData({
                tcat_id:            editState?.tcat_id            || "",
                tcat_category_type: editState?.tcat_category_type || "",
                tcat_category_desc: editState?.tcat_category_desc || "",
            });
        } else {
            setFormData({
                tcat_id:            "",
                tcat_category_type: "",
                tcat_category_desc: "",
            });
        }

        console.log("editState:", editState);
    }, [editState]);

    const inputChange = (e) => {
        let { name, value } = e.target;
        if (["tcat_category_type", "tcat_category_desc"].includes(name)) {
            value = value.replace(/^\s+/, "");
        }
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const submit = async (e) => {
        e.preventDefault();
        const isValid = await handleValidation(formData);
        if (!isValid) return;
        setLoading(true);

        const apiCall = editState
            ? updateCategoryApi(formData, formData?.tcat_id)
            : createCategoryApi(formData);

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
                const errMsg = error?.response?.data?.message || "Something went wrong";
                setErrors({ tcat_category_type: errMsg });
                toast.error(errMsg);
                setLoading(false);
            });
    };

    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{ duration: 2000 }}
                reverseOrder={false}
            />

            <form onSubmit={submit} id="user_submit" className="my_form">
                <div className="row">

                    {/* CATEGORY TYPE */}
                    <div className="col-md-12 mb-3">
                        <label className="form-label">
                            Category Type <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            name="tcat_category_type"
                            id="tcat_category_type"
                            value={formData.tcat_category_type}
                            onChange={inputChange}
                            placeholder="Enter Category Type"
                        />
                        {errors?.tcat_category_type && (
                            <div className="error text-danger">
                                {errors.tcat_category_type}
                            </div>
                        )}
                    </div>

                    {/* DESCRIPTION */}
                    <div className="col-md-12 mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-control"
                            name="tcat_category_desc"
                            id="tcat_category_desc"
                            value={formData.tcat_category_desc}
                            onChange={inputChange}
                            placeholder="Enter Description"
                            rows={3}
                        />
                        {errors?.tcat_category_desc && (
                            <div className="error text-danger">
                                {errors.tcat_category_desc}
                            </div>
                        )}
                    </div>

                </div>

                <div className="row">
                    <div className="col-md-12">
                        <button
                            type="submit"
                            className="btn btn-primary"
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