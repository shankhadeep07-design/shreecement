import { useEffect, useState } from "react";

import { toast, Toaster } from "react-hot-toast";

import { createStateApi, updateStateDetailsApi } from '../../../Services/State-service';

import * as Yup from "yup";

const Schema = Yup.object({
    tsl_state_name: Yup.string()
        .trim()
        .max(100, "State name must be at most 100 characters")
        .required("State name is required"),
});

export const AddEditState = ({ changeModalStatus, editState, initiatedStateDatatable, datatable_url }) => {


    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        tsl_state_id: "",
        tsl_state_name: "",
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
                tsl_state_id: editState?.tsl_state_id,
                tsl_state_name: editState?.tsl_state_name,
            });
        } else {
            setFormData({
                tsl_state_id: "",
                tsl_state_name: "",
            });
        }
    }, [editState]);


    // let inputChange = (event) => {
    //     var field = event.target.name
    //     const actualValue = event.target.value;
    //     setFormData({ ...formData, [field]: actualValue });
    // };


    let inputChange = (event) => {
        const field = event.target.name;
        const type = event.target.type;
        let newValue = event.target.value;

        // 👉 remove leading spaces for text & textarea
        if (type === "text") {
            newValue = newValue.replace(/^\s+/, "");
        }

        setFormData({
            ...formData,
            [field]: newValue
        });
    };




    const submit = async (e) => {
        e.preventDefault();
        const isValid = await handleValidation(formData);
        if (!isValid) return;
        setLoading(true);


        const updateData = {
            tsl_state_id: formData?.tsl_state_id,
            tsl_state_name: formData?.tsl_state_name,
        };

        if (editState) {
            updateStateDetailsApi(updateData, formData?.tsl_state_id)
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
                    setErrors({ tsl_state_name: errMsg });
                    toast.error(error.response.data.message);
                    setLoading(false);
                });
        } else {

            createStateApi(updateData)
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
                    setErrors({ tsl_state_name: errMsg });
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
                                State<span className="required">*</span>

                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tsl_state_name}
                                onChange={inputChange}
                                name="tsl_state_name"
                                id="tsl_state_name"
                                placeholder="Enter State"
                            // required
                            />
                            {errors?.tsl_state_name && (
                                <div className="error text-danger">
                                    {errors?.tsl_state_name}
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
