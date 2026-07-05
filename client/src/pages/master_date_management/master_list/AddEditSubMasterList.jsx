import { useEffect, useState } from "react";

import { toast, Toaster } from "react-hot-toast";

import * as Yup from "yup";
import { createSubMasterListApi, updateSubMasterListApi } from "../../../Services/Master-service";
// import { createVerticalApi, updateVerticalApi } from "../../../services/Master-service";
const Schema = Yup.object({
    tsml_sub_master_list_name: Yup.string()
        .trim()
        .required("Sub Master List name is required"),
    tsml_sub_master_list_desc: Yup.string()
        .trim()
        .required("Sub Master List Description is required"),
});

export const AddEditSubMasterList = ({ tml_id, changeModalStatus, editSubMasterList, initiatedSubMasterListDatatable, datatable_url }) => {

    const [stateOptions, setStateOptions] = useState([]);
    let [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        tsml_id: "",
        tsml_sub_master_list_name: "",
        tsml_sub_master_list_desc: "",
        tsml_tml_id: tml_id,
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
        if (editSubMasterList) {
            setFormData({
                tsml_sub_master_list_name: editSubMasterList?.tsml_sub_master_list_name,
                tsml_sub_master_list_desc: editSubMasterList?.tsml_sub_master_list_desc,
                tsml_id: editSubMasterList?.tsml_id,
                tsml_tml_id: tml_id,

            });
        } else {
            setFormData({
                tsml_id: null,
                tsml_sub_master_list_name: "",
                tsml_sub_master_list_desc: "",
                tsml_tml_id: tml_id,
            });
        }
    }, [editSubMasterList, tml_id]);


    let inputChange = (event) => {
        var field = event.target.name
        let actualValue = event.target.value;

         let type = event.target.type;
       
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


        if (editSubMasterList) {
            updateSubMasterListApi(formData, formData?.tsml_id)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedSubMasterListDatatable(datatable_url);
                })
                .catch((error) => {
                    // const errMsg = error?.response?.data?.message || "Something went wrong";
                    // setErrors({ tsml_sub_master_list_name: errMsg });
                    toast.error(error?.response?.data?.message);
                    setLoading(false);
                });
        } else {

            createSubMasterListApi(formData)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedSubMasterListDatatable(datatable_url);
                })
                .catch((error) => {
                    // const errMsg = error?.response?.data?.message || "Something went wrong";
                    // setErrors({ tsml_sub_master_list_name: errMsg });
                    toast.error(error?.response?.data?.message);
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

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Sub Master List Name
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tsml_sub_master_list_name}
                                onChange={inputChange}
                                name="tsml_sub_master_list_name"
                                id="tsml_sub_master_list_name"
                                placeholder="Enter Sub Master List"
                            // required
                            />
                            {errors.tsml_sub_master_list_name && <small className="error text-danger">{errors.tsml_sub_master_list_name}</small>}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Sub Master List Description
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tsml_sub_master_list_desc}
                                onChange={inputChange}
                                name="tsml_sub_master_list_desc"
                                id="tsml_sub_master_list_desc"
                                placeholder="Enter Sub Master List Description"
                            // required
                            />
                            {errors.tsml_sub_master_list_desc && <small className="error text-danger">{errors.tsml_sub_master_list_desc}</small>}
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
