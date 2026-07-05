import { useEffect, useState } from "react";

import { toast, Toaster } from "react-hot-toast";

import { createProjectTypeApi, updateProjectTypeDetailsApi } from '../../../Services/Project-type-service';

import * as Yup from "yup";

const Schema = Yup.object({
    tprj_project_type_name: Yup.string()
        .trim()
        .required("Name is required")
        .max(255, "Maximum 255 characters allowed"),


    tprj_desc: Yup.string()
        .trim()
        .nullable()
        .max(300, "Description cannot exceed 300 characters"),

});

export const AddEditProjectType = ({ changeModalStatus, editState, initiatedStateDatatable, datatable_url }) => {


    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        tprj_id: "",
        tprj_project_type_name: "",
        tprj_desc: "",
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
        if (editState) {
            setFormData({
                tprj_id: editState?.tprj_id,
                tprj_project_type_name: editState?.tprj_project_type_name,
                tprj_desc: editState?.tprj_desc,

            });
        } else {
            setFormData({
                tprj_id: "",
                tprj_project_type_name: "",
            });
        }
    }, [editState]);


    let inputChange = (event) => {
        var field = event.target.name
        let actualValue = event.target.value;
        let type = event.target.type;



        //  let { name, value, type } = e.target;
        console.log('---------------', type);


        // let newValue = value;
        if (type === "text") {
            actualValue = actualValue.replace(/^\s+/, "");
        }




        setFormData({ ...formData, [field]: actualValue });
    };



    const submit = async (e) => {
        e.preventDefault();
        const isValid = await handleValidation(formData);
        if (!isValid) return;
        setLoading(true);
        const updateData = {
            tprj_id: formData?.tprj_id,
            tprj_project_type_name: formData?.tprj_project_type_name,
            tprj_desc: formData?.tprj_desc,
        };
        if (editState) {
            updateProjectTypeDetailsApi(updateData, formData?.tprj_id)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedStateDatatable(datatable_url);
                })
                .catch((error) => {
                    const errMsg = error?.response?.data?.message || "Something went wrong";
                    setErrors({ tprj_project_type_name: errMsg });
                    toast.error(error.response.data.message);
                    setLoading(false);
                });
        } else {

            createProjectTypeApi(updateData)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedStateDatatable(datatable_url);
                })
                .catch((error) => {
                    const errMsg = error?.response?.data?.message || "Something went wrong";
                    setErrors({ tprj_project_type_name: errMsg });
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
                                Name
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tprj_project_type_name}
                                onChange={inputChange}
                                name="tprj_project_type_name"
                                id="tprj_project_type_name"
                                placeholder="Enter Name"
                            // required
                            />
                            {errors?.tprj_project_type_name && (
                                <div className="error text-danger">
                                    {errors?.tprj_project_type_name}
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="col-md-12">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Description
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tprj_desc}
                                onChange={inputChange}
                                name="tprj_desc"
                                id="tprj_desc"
                                placeholder="Enter Description"
                            // required
                            />
                            {errors?.tprj_desc && (
                                <div className="error text-danger">
                                    {errors?.tprj_desc}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12 float-right">
                        <button type="submit" className="btn btn-primary">
                            Submit
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
};
