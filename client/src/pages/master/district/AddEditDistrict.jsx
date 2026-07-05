import { useEffect, useState } from "react";
import Select from "react-select";

import { toast, Toaster } from "react-hot-toast";

import * as Yup from "yup";
import { createDistrictApi, updateDistrictApi } from "../../../Services/District-service";
import { getAllStateApi } from '../../../Services/State-service';
const Schema = Yup.object({
    tdl_state_id: Yup.string().required("State name is required"),
    tdl_district_name: Yup.string()
        .trim()
         .max(100, "District name must be at most 100 characters")
        .required("District name is required"),
});

export const AddEditDistrict = ({ changeModalStatus, editDistrict, initiatedDistrictDatatable, datatable_url }) => {

    const [stateOptions, setStateOptions] = useState([]);
    let [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        tdl_state_id: "",
        tdl_district_id: "",
        tdl_district_name: "",
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
        console.log("editDistrict:", editDistrict); // 👈 log full object

        if (editDistrict) {
            setFormData({
                tdl_state_id: editDistrict?.tdl_state_id,
                tdl_district_name: editDistrict?.tdl_district_name,
                tdl_district_id: editDistrict?.tdl_district_id,
            });
        } else {
            setFormData({
                tdl_state_id: null,
                tdl_district_id: null,
                tdl_district_name: "",
            });
        }
    }, [editDistrict]);


    // let inputChange = (event) => {
    //     var field = event.target.name
    //     const actualValue = event.target.value;
    //     setFormData({ ...formData, [field]: actualValue });
    // };

    let inputChange = (event) => {
        const field = event.target.name;
        const type = event.target.type;
        let newValue = event.target.value;

        console.log('--------------', type);


        // 👉 remove leading spaces for text & textarea
        if (type === "text") {
            newValue = newValue.replace(/^\s+/, "");
        }

        setFormData({ ...formData, [field]: newValue });
    };

    const handleSelectChange = (selectedOption, { name }) => {
        setFormData({ ...formData, [name]: selectedOption ? selectedOption.value : '' });
    };

    const submit = async (e) => {
        e.preventDefault();

        const isValid = await handleValidation(formData);

        if (!isValid) return;
        setLoading(true);

        if (editDistrict) {
            updateDistrictApi(formData, formData?.tdl_district_id)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedDistrictDatatable(datatable_url);
                })
                .catch((error) => {
                    // const errMsg = error?.response?.data?.message || "Something went wrong";
                    // setErrors({ tdl_district_name: errMsg });
                    toast.error(error?.response?.data?.message);
                    setLoading(false);
                });
        } else {

            createDistrictApi(formData)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedDistrictDatatable(datatable_url);
                })
                .catch((error) => {
                    // const errMsg = error?.response?.data?.message || "Something went wrong";
                    // setErrors({ tdl_district_name: errMsg });
                    toast.error(error?.response?.data?.message);
                    setLoading(false);
                });
        }

    };

    const fetchAllState = () => {
        getAllStateApi()
            .then((data) => {
                setStateOptions(data?.data || []);
            })
            .catch((error) => {
                toast.error(
                    error?.response?.data?.originalError || error?.response?.data?.message
                );
            });
    };

    useEffect(() => {
        fetchAllState();
    }, []);

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
                            <label htmlFor="Village" className="form-label">
                                State <span className="required">*</span>
                            </label>
                            <Select
                                labelledBy="Select State"
                                name="tdl_state_id"
                                id="state"
                                options={stateOptions}
                                value={stateOptions.find(
                                    ({ value }) => value == formData?.tdl_state_id
                                )}
                                onChange={(selectedOption) => handleSelectChange(selectedOption, { name: "tdl_state_id" })
                                }
                            />
                            {errors.tdl_state_id && <small className="error text-danger">{errors.tdl_state_id}</small>}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                District <span className="required">*</span>
                            </label>
                            {/* <input
                                type="text"
                                className="form-control"
                                value={formData.tdl_district_id}
                                onChange={inputChange}
                                name="tdl_district_name"
                                id="tdl_district_name"
                                placeholder="Enter District"
                            // required
                            /> */}

                            <input
                                type="text"
                                className="form-control"
                                value={formData.tdl_district_name}
                                onChange={inputChange}
                                name="tdl_district_name"
                                id="tdl_district_name"
                                placeholder="Enter District"
                            // required
                            />
                            {errors.tdl_district_name && <small className="error text-danger">{errors.tdl_district_name}</small>}
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
