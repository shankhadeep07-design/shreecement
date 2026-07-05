import { useEffect, useState } from "react";

import { toast, Toaster } from "react-hot-toast";

import * as Yup from "yup";
import { createMasterListApi, updateMasterListApi } from "../../../Services/Master-service";
// import { createVerticalApi, updateVerticalApi } from "../../../services/Master-service";
const Schema = Yup.object({
    tml_master_list_name: Yup.string()
        .trim()
        .required("Master List name is required"),
    tml_master_list_desc: Yup.string()
        .trim()
        .required("Master List Description is required"),
});

export const AddEditMasterList = ({ changeModalStatus, editMasterList, initiatedMasterListDatatable, datatable_url }) => {

    const [stateOptions, setStateOptions] = useState([]);
    let [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        tml_id: "",
        tml_master_list_name: "",
        tml_master_list_desc: "",
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
        if (editMasterList) {
            setFormData({
                tml_master_list_name: editMasterList?.tml_master_list_name,
                tml_master_list_desc: editMasterList?.tml_master_list_desc,
                tml_id: editMasterList?.tml_id,
            });
        } else {
            setFormData({
                tml_id: null,
                tml_master_list_name: "",
                tml_master_list_desc: "",
            });
        }
    }, [editMasterList]);


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

        if (editMasterList) {
            updateMasterListApi(formData, formData?.tml_id)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedMasterListDatatable(datatable_url);
                })
                .catch((error) => {
                    // const errMsg = error?.response?.data?.message || "Something went wrong";
                    // setErrors({ tml_master_list_name: errMsg });
                    toast.error(error?.response?.data?.message);
                    setLoading(false);
                });
        } else {

            createMasterListApi(formData)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedMasterListDatatable(datatable_url);
                })
                .catch((error) => {
                    // const errMsg = error?.response?.data?.message || "Something went wrong";
                    // setErrors({ tml_master_list_name: errMsg });
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
                                Master List Name
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tml_master_list_name}
                                onChange={inputChange}
                                name="tml_master_list_name"
                                id="tml_master_list_name"
                                placeholder="Enter Master List"
                                readOnly={!!editMasterList?.tml_id} // true if tml_id exists
                            // required
                            />
                            {errors.tml_master_list_name && <small className="error text-danger">{errors.tml_master_list_name}</small>}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Master List Description
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tml_master_list_desc}
                                onChange={inputChange}
                                name="tml_master_list_desc"
                                id="tml_master_list_desc"
                                placeholder="Enter Master List Description"
                            // required
                            />
                            {errors.tml_master_list_desc && <small className="error text-danger">{errors.tml_master_list_desc}</small>}
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
