import { useEffect, useState } from "react";

import { toast, Toaster } from "react-hot-toast";

import * as Yup from "yup";
import { createSdgApi, updateSdgApi } from "../../../services/PriorityAlignment-service";
import { userDetails } from "../../../auth/auth";

const Schema = Yup.object({
    tsdg_name: Yup.string()
        .trim()
        .required("SDGsname is required"),
});

export const AddEditSdg = ({ changeModalStatus, editSdg, initiatedSdgDatatable, datatable_url }) => {

    const userId = userDetails().id;
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        tsdg_id: "",
        tsdg_name: "",
        tsdg_desc: "",
        tsdg_icon: "",
        userId: userId,
        tsdg_icon_name: "",
        tsdg_icon_path: "",
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
        if (editSdg) {
            setFormData({
                tsdg_id: editSdg?.tsdg_id,
                tsdg_name: editSdg?.tsdg_name,
                tsdg_icon_name: editSdg?.file_name || "", // new field just to display the file
                tsdg_icon_path: editSdg?.file_path || "", // new field to generate full URL
                tsdg_desc: editSdg?.tsdg_desc,
            });
        } else {
            setFormData({
                tsdg_id: "",
                tsdg_name: "",
                tsdg_icon_name: "",
                tsdg_icon_path: "",
            });
        }
    }, [editSdg]);

    let inputChange = (event) => {
        const field = event.target.name;


         const type = event.target.type;
        let newValue = event.target.value;

        // 👉 remove leading spaces for text & textarea
        if (type === "text" || type === "textarea") {
            newValue = newValue.replace(/^\s+/, "");
        }

        if (field === "tsdg_icon") {
            const file = event.target.files[0]; // ⬅️ CORRECT WAY to get uploaded file
            setFormData({ ...formData, tsdg_icon: file });
        } else {
            setFormData({ ...formData, [field]: newValue });
        }
    };




    const submit = async (e) => {
        e.preventDefault();
        const isValid = await handleValidation(formData);
        if (!isValid) return;
        setLoading(true);

        const updateData = new FormData(); // <-- switch from object to FormData
        updateData.append("tsdg_name", formData?.tsdg_name);
        updateData.append("tsdg_desc", formData?.tsdg_desc);
        if (formData?.tsdg_icon) {
            updateData.append("tsdg_icon", formData?.tsdg_icon);
        }
        updateData.append("userId", formData?.userId);

        if (editSdg) {
            updateData.append("tsdg_id", formData?.tsdg_id); // needed for update
            updateSdgApi(updateData, formData?.tsdg_id)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedSdgDatatable(datatable_url);
                })
                .catch((error) => {
                    const errMsg = error?.response?.data?.message || "Something went wrong";
                    setErrors({ tsdg_name: errMsg });
                    toast.error(error.response.data.message);
                    setLoading(false);
                });
        } else {

            createSdgApi(updateData)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedSdgDatatable(datatable_url);
                })
                .catch((error) => {
                    const errMsg = error?.response?.data?.message || "Something went wrong";
                    setErrors({ tsdg_name: errMsg });
                    toast.error(error.response.data.message);
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

                    <div className="col-md-12">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                SDGs Name
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tsdg_name}
                                onChange={inputChange}
                                name="tsdg_name"
                                id="tsdg_name"
                                placeholder="Enter SDGs"
                            />
                            {errors?.tsdg_name && (
                                <div className="error text-danger">
                                    {errors?.tsdg_name}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-12">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Description
                            </label>
                           <textarea
  className="form-control"
  value={formData.tsdg_desc}
  onChange={inputChange}
  name="tsdg_desc"
  id="tsdg_desc"
  placeholder="Enter Description"
  rows={2}  // you can adjust height
/>

                        </div>
                    </div>

                    {/* <div className="mb-3">
                        <label htmlFor="tsdg_icon" className="form-label">
                            Upload Document
                        </label>
                        <input
                            type="file"
                            className="form-control"
                            name="tsdg_icon"
                            id="tsdg_icon"
                            onChange={inputChange}
                            accept=".pdf,.doc,.docx,.jpg,.png"
                        />
                        {formData.tsdg_icon_name && (
                            <div className="mt-2">
                                <strong>Previously uploaded:</strong>{" "}
                                <a
                                    href={`${import.meta.env.VITE_API_URL}/uploads/${formData?.tsdg_icon_path?.replace(/\\/g, "/")}`} // convert backslashes for URL
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {formData.tsdg_icon_name}
                                </a>
                            </div>
                        )}

                    </div> */}


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
