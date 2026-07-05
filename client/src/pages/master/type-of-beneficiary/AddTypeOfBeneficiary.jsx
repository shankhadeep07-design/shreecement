import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import * as Yup from "yup";
import { createTypeOfBeneficiaryApi, updateTypeOfBeneficiaryApi } from '../../../Services/Type-of-beneficiary-service';

const Schema = Yup.object({
    tben_beneficiary_type_name: Yup.string()
        .trim()
        .required("Name of Beneficiary is required")
        .max(255, "Maximum 255 characters allowed"),

    tben_beneficiary_desc: Yup.string()
        .trim()
        .max(500, "Maximum 500 characters allowed"),
});

export const AddTypeOfBeneficiary = ({
    changeModalStatus,
    editState,
    initiatedStateDatatable,
    datatable_url,
}) => {

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        tben_beneficiary_type_id: "",
        tben_beneficiary_type_name: "",
        tben_beneficiary_desc: "",
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
                tben_beneficiary_type_id: editState?.tben_beneficiary_type_id || "",
                tben_beneficiary_type_name: editState?.tben_beneficiary_type_name || "",
                tben_beneficiary_desc: editState?.tben_beneficiary_desc || "",
            });
        } else {
            setFormData({
                tben_beneficiary_type_id: "",
                tben_beneficiary_type_name: "",
                tben_beneficiary_desc: "",
            });
        }

        console.log("editState:", editState);
    }, [editState]);

    const inputChange = (e) => {
        let { name, value } = e.target;
        // prevent leading spaces
        if (["tben_beneficiary_type_name", "tben_beneficiary_desc"].includes(name)) {
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

        // const updateData = {
        //     tben_beneficiary_type_id: formData?.tben_beneficiary_type_id,
        //     tben_beneficiary_type_name: formData?.tben_beneficiary_type_name.trim(),
        //     tben_beneficiary_desc: formData?.tben_beneficiary_desc.trim(),
        // };

        // const apiCall = editState
        //     ? updateTypeOfBeneficiaryApi(updateData)
        //     : createTypeOfBeneficiaryApi(updateData);
        const apiCall = editState
            ? updateTypeOfBeneficiaryApi(formData, formData?.tben_beneficiary_type_id)
            : createTypeOfBeneficiaryApi(formData);

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
                setErrors({ tben_beneficiary_type_name: errMsg });
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

                    {/* NAME OF BENEFICIARY */}
                    <div className="col-md-12 mb-3">
                        <label className="form-label">
                            Name of Beneficiary <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            name="tben_beneficiary_type_name"
                            id="tben_beneficiary_type_name"
                            value={formData.tben_beneficiary_type_name}
                            onChange={inputChange}
                            placeholder="Enter Name of Beneficiary"
                        />
                        {errors?.tben_beneficiary_type_name && (
                            <div className="error text-danger">
                                {errors.tben_beneficiary_type_name}
                            </div>
                        )}
                    </div>

                    {/* DESCRIPTION */}
                    <div className="col-md-12 mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-control"
                            name="tben_beneficiary_desc"
                            id="tben_beneficiary_desc"
                            value={formData.tben_beneficiary_desc}
                            onChange={inputChange}
                            placeholder="Enter Description"
                            rows={3}
                        />
                        {errors?.tben_beneficiary_desc && (
                            <div className="error text-danger">
                                {errors.tben_beneficiary_desc}
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