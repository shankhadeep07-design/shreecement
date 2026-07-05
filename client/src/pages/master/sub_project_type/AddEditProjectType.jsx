import { useEffect, useState } from "react";

import { toast, Toaster } from "react-hot-toast";

import { createSubProjectTypeApi, updateSubProjectTypeDetailsApi, allProjectTypes } from '../../../Services/SubProject-type-service';
import { Modal, Form, Input, Select, Button, Row, Col } from 'antd';

import { allRoles } from '../../../services/Role-service';
import { getAllStateApi } from '../../../services/State-service';


import * as Yup from "yup";

const Schema = Yup.object({
    tsprj_sub_project_type_name: Yup.string()
        .trim()
        .required("Name is required")
        .max(255, "Maximum 255 characters allowed"),


    tsprj_sub_desc: Yup.string()
        .trim()
        .nullable()
        .max(300, "Description cannot exceed 300 characters"),
});

export const AddEditProjectType = ({ changeModalStatus, editState, initiatedStateDatatable, datatable_url }) => {

    const [rolesOptions, setRolesOptions] = useState([]);

    const [projectTypeOptions, setProjectTypeOptions] = useState([]);
    const [stateOptions, setStateOptions] = useState([]);


    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        tsprj_id: "",
        tsprj_sub_project_type_name: "",
        tsprj_project_type_id: "",
        tsprj_sub_desc: "",
    });


    const fetchAllData = async () => {
        try {
            const [rolesRes, stateRes, projectTypeRes] = await Promise.all([
                allRoles('users'),
                getAllStateApi(),
                allProjectTypes(), // ✅ awaited
            ]);
            setRolesOptions(
                rolesRes.data.map(r => ({
                    label: r.trl_role_name,
                    value: r.trl_role_id,
                }))
            );
            setStateOptions(stateRes.data || []);
            // backend returns { status, message, data }
            setProjectTypeOptions(projectTypeRes.data || []);

        } catch (err) {
            console.error(err);
            toast.error("Error loading master data");
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);






    useEffect(() => {
        console.log("Project Type id:", formData.tsprj_project_type_id);
    }, [formData.tsprj_project_type_id]);



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
                tsprj_id: editState?.tsprj_id || "",
                tsprj_project_type_id: editState?.tsprj_project_type_id || "",
                tsprj_sub_project_type_name: editState?.tsprj_sub_project_type_name || "",
                tsprj_sub_desc: editState?.tsprj_sub_desc || "",
            });
        } else {
            setFormData({
                tsprj_id: "",
                tsprj_project_type_id: "",
                tsprj_sub_project_type_name: "",
                tsprj_sub_desc: "",
            });
        }

        console.log(editState);
    }, [editState]);


    // let inputChange = (event) => {
    //     var field = event.target.name
    //     const actualValue = event.target.value;
    //     setFormData({ ...formData, [field]: actualValue });
    // };

    const inputChange = (event) => {
        const field = event.target.name;
        let value = event.target.value;
        let type = event.target.type;



        if (type === "text") {
            value = value.replace(/^\s+/, "");
        }

        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };




    const submit = async (e) => {
        e.preventDefault();
        const isValid = await handleValidation(formData);
        if (!isValid) return;
        setLoading(true);
        const updateData = {
            tsprj_id: formData?.tsprj_id,
            tsprj_project_type_id: formData?.tsprj_project_type_id,
            tsprj_sub_project_type_name: formData?.tsprj_sub_project_type_name,
            tsprj_sub_desc: formData?.tsprj_sub_desc,

        };
        if (editState) {
            updateSubProjectTypeDetailsApi(updateData, formData?.tsprj_id)
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

            createSubProjectTypeApi(updateData)
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
                            <label htmlFor="tprj_project_type_name" className="form-label">
                                Project Type
                            </label>

                            <select
                                className="form-select"
                                name="tsprj_project_type_id"
                                id="tsprj_project_type_id"
                                value={formData.tsprj_project_type_id || ""}
                                onChange={inputChange}
                            >
                                <option value="">Select Project Type</option>

                                {projectTypeOptions.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>

                        </div>
                    </div>



                    <div className="col-md-12">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Name
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tsprj_sub_project_type_name}
                                onChange={inputChange}
                                name="tsprj_sub_project_type_name"
                                id="tsprj_sub_project_type_name"
                                placeholder="Enter Name"
                            // required
                            />
                            {errors?.tsprj_sub_project_type_name && (
                                <div className="error text-danger">
                                    {errors?.tsprj_sub_project_type_name}
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
                                value={formData.tsprj_sub_desc}
                                onChange={inputChange}
                                name="tsprj_sub_desc"
                                id="tsprj_sub_desc"
                                placeholder="Enter Description"
                            // required
                            />
                            {errors?.tsprj_sub_desc && (
                                <div className="error text-danger">
                                    {errors?.tsprj_sub_desc}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12 float-right">
                        <button type="submit" className="btn btn-primary ">
                            Submit
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
};
