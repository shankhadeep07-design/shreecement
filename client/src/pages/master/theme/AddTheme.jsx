import { useEffect, useState } from "react";

import { toast, Toaster } from "react-hot-toast";

import { createThemeApi, updateThemeApi } from '../../../Services/Theme-service';
import { Modal, Form, Input, Select, Button, Row, Col } from 'antd';

import { allRoles } from '../../../services/Role-service';
import { getAllStateApi } from '../../../services/State-service';


import * as Yup from "yup";

// const Schema = Yup.object({
//     tthm_theme_name: Yup.string()
//         .trim()
//         .required("Name is required")
//         .test(
//             "not-blank",
//             "First Character cannot be empty spaces",
//             (value) => value && value.trim().length > 0
//         ),
// });
const Schema = Yup.object({
    tthm_theme_name: Yup.string()
        .trim()
        .max(100, "Name must be at most 100 characters")
        .required("Name is required")
});


export const AddTheme = ({ changeModalStatus, editState, initiatedStateDatatable, datatable_url }) => {


    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        tthm_theme_id: "",
        tthm_theme_name: "",

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
                tthm_theme_id: editState?.tthm_theme_id || "",
                tthm_theme_name: editState?.tthm_theme_name || "",
            });
        } else {
            setFormData({
                tthm_theme_id: "",

                tthm_theme_name: "",

            });
        }

        console.log(editState);
    }, [editState]);


    // const inputChange = (event) => {
    //     const field = event.target.name;
    //     const value = event.target.value;
    //     setFormData(prev => ({
    //         ...prev,
    //         [field]: value,
    //     }));
    // };

    const inputChange = (e) => {
        let { name, value } = e.target;
        // ❌ prevent first character space
        if (name === "tthm_theme_name") {
            // remove leading spaces
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
        const updateData = {
            tthm_theme_id: formData?.tthm_theme_id,
            tthm_theme_name: formData?.tthm_theme_name.trim(),


        };
        if (editState) {
            updateThemeApi(updateData, formData?.tthm_theme_id)
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
                    setErrors({ tthm_theme_name: errMsg });

                    toast.error(error.response.data.message);
                    setLoading(false);
                });
        } else {

            createThemeApi(updateData)
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
                                value={formData.tthm_theme_name}
                                onChange={inputChange}
                                name="tthm_theme_name"
                                id="tthm_theme_name"
                                placeholder="Enter Name"
                            // required
                            />
                            {errors?.tthm_theme_name && (
                                <div className="error text-danger">
                                    {errors?.tthm_theme_name}
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
