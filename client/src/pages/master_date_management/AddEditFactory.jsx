import { useEffect, useState } from "react";

import { toast, Toaster } from "react-hot-toast";
import Select from "react-select";

import * as Yup from "yup";
import { fetchBlocksByDistrictIds, fetchDistrictsByStateIds, fetchLocationsByBlockIds, getSubMasterListByMasterSlugApi } from "../../Services/Master-service";
import { createFactoryApi, updateFactoryDetailsApi } from "../../services/MasterData-service";
import { getAllStateApi } from "../../Services/State-service";


const Schema = Yup.object({
    tfact_state_id: Yup.string().required("State name is required"),
    tfact_district_id: Yup.string().required("District name is required"),
    tfact_block_id: Yup.string().required("Block name is required"),
    // tfact_location_id: Yup.string().required("Location name is required"),
    tfact_factory_name: Yup.string().trim().required("Factory name is required"),
    tfact_business_area_id: Yup.string().trim().required("Business Area name is required"),



});

export const AddEditFactory = ({ changeModalStatus, editFactory, initiatedFactoryDatatable, datatable_url }) => {

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [locations, setLocations] = useState([]);

    const [businessAreas, setBusinessAreas] = useState([]);

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        tfact_factory_id: "",
        tfact_factory_name: "",
        tfact_state_id: "",
        tfact_district_id: "",
        tfact_block_id: "",
        // tfact_location_id: "",
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
        if (editFactory) {
            fetchDistrictsByStateIds(editFactory?.tfact_state_id)
                .then((data) => {
                    setDistricts(data?.data);
                })
                .catch((error) => {
                    toast.error(
                        error?.response?.data?.originalError ||
                        error?.response?.data?.message
                    );
                });
            fetchBlocksByDistrictIds(editFactory?.tfact_district_id)
                .then((data) => {

                    // setBlocks(data?.data);

                    const blocksData = data?.data || [];

                    const formattedBlocks = blocksData.map((b) => ({
                        label: b.tbl_block_name,
                        value: b.tbl_block_id,
                    }));

                    setBlocks(formattedBlocks);

                })
                .catch((error) => {
                    toast.error(
                        error?.response?.data?.originalError ||
                        error?.response?.data?.message
                    );
                });


            fetchLocationsByBlockIds(editFactory?.tfact_block_id)
                .then((data) => {
                    setLocations(data?.data);
                })
                .catch((error) => {
                    toast.error(
                        error?.response?.data?.originalError ||
                        error?.response?.data?.message
                    );
                });




            setFormData({
                tfact_factory_id: editFactory?.tfact_factory_id,
                tfact_factory_name: editFactory?.tfact_factory_name,
                tfact_state_id: editFactory?.tfact_state_id,
                tfact_district_id: editFactory?.tfact_district_id,
                tfact_block_id: editFactory?.tfact_block_id,
                // tfact_location_id: editFactory?.tfact_location_id,
                tfact_business_area_id: editFactory?.tfact_business_area_id,

            });
        } else {
            setFormData({
                tfact_factory_id: "",
                tfact_factory_name: "",
                tfact_state_id: "",
                tfact_district_id: "",
                tfact_block_id: "",
                // tfact_location_id: "",
            });
        }
    }, [editFactory]);


    const handleChange = async (e) => {
        let updatedData;
        // const { name, value } = e.target;


        let { name, value, type } = e.target;
        console.log('---------------', type);


        let newValue = value;
        if (type === "text") {
            value = value.replace(/^\s+/, "");
        }


        if (name === "tfact_state_id" && formData?.tfact_state_id !== value) {
            setDistricts([]);
            setBlocks([]);
            setLocations([]);
            fetchDistrictsByStateIds(value)
                .then((data) => {
                    setDistricts(data?.data);
                })
                .catch((error) => {
                    toast(error?.response?.data?.message);
                });
            updatedData = {
                ...formData,
                [name]: value,
                tfact_district_id: "",
                tfact_block_id: "",
                // tfact_location_id: "",
            };
        } else if (
            name === "tfact_district_id" &&
            formData?.tfact_district_id !== value
        ) {
            setBlocks([]);
            setLocations([]);
            fetchBlocksByDistrictIds(value)
                .then((data) => {

                    // setBlocks(data?.data);
                    const blocksData = data?.data || [];

                    const formattedBlocks = blocksData.map((b) => ({
                        label: b.tbl_block_name,
                        value: b.tbl_block_id,
                    }));

                    setBlocks(formattedBlocks);


                })
                .catch((error) => {
                    toast.error(error?.response?.data?.message);
                });
            updatedData = {
                ...formData,
                [name]: value,
                tfact_block_id: "",
                // tfact_location_id: "",
            };
        } else if (name === "tfact_block_id" && formData?.tfact_block_id !== value) {
            setLocations([]);
            fetchLocationsByBlockIds(value)
                .then((data) => {
                    setLocations(data?.data);
                })
                .catch((error) => {
                    toast.error(error?.response?.data?.message);
                });
            updatedData = {
                ...formData,
                [name]: value,
                // tfact_location_id: "",
            };
        }
        else {
            updatedData = { ...formData, [name]: value };
        }
        setFormData(updatedData);
    };



    const submit = async (e) => {
        e.preventDefault();
        const isValid = await handleValidation(formData);
        if (!isValid) return;
        setLoading(true);


        const updateData = {
            tfact_factory_id: formData?.tfact_factory_id,
            tfact_factory_name: formData?.tfact_factory_name,
            tfact_state_id: formData?.tfact_state_id,
            tfact_district_id: formData?.tfact_district_id,
            tfact_block_id: formData?.tfact_block_id,
            // tfact_location_id: formData?.tfact_location_id,
            tfact_business_area_id: formData?.tfact_business_area_id,

        };

        if (editFactory) {
            updateFactoryDetailsApi(updateData, formData?.tfact_factory_id)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedFactoryDatatable(datatable_url);
                })
                .catch((error) => {
                    const errMsg = error?.response?.data?.message || "Something went wrong";
                    setErrors({ tfact_factory_name: errMsg });
                    toast.error(error.response.data.message);
                    setLoading(false);
                });
        } else {

            createFactoryApi(updateData)
                .then((res) => {
                    setLoading(false);
                    if (res.status == 1) {
                        toast.success(res.message);
                    } else {
                        toast.error(res.message);
                    }
                    changeModalStatus("user_update_modal", false);
                    initiatedFactoryDatatable(datatable_url);
                })
                .catch((error) => {
                    const errMsg = error?.response?.data?.message || "Something went wrong";
                    setErrors({ tfact_factory_name: errMsg });
                    toast.error(error.response.data.message);
                    setLoading(false);
                });
        }
    };

    useEffect(() => {
        getAllStateApi()
            .then((data) => {
                setStates(data?.data || []);
            })
            .catch((error) => {
                toast.error(
                    error?.response?.data?.originalError || error?.response?.data?.message
                );
            });


        getSubMasterListByMasterSlugApi({
            master_slug: "business_area",
        })
            .then((data) => {
                setBusinessAreas(data?.data);
            })
            .catch((error) => {
                toast.error(
                    error?.response?.data?.originalError ||
                    error?.response?.data?.message
                );
            });
    }, []);


    const businessAreaOptions = businessAreas.map(item => ({
        label: item.tsml_sub_master_list_name,
        value: item.tsml_id,
    }));



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
                            <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label">
                                State
                            </label>
                            <Select
                                name="tfact_state_id"
                                options={states}
                                value={
                                    states.find(
                                        ({ value }) => value == formData?.tfact_state_id
                                    ) || ""
                                }
                                onChange={(e) => {
                                    handleChange({
                                        target: {
                                            name: "tfact_state_id",
                                            value: e.value,
                                        },
                                    });
                                }}
                                labelledBy="Select States"
                            />
                            {errors?.tfact_state_id && (
                                <div className="error text-danger">{errors?.tfact_state_id}</div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label">
                                District
                            </label>
                            <Select
                                name="tfact_district_id"
                                options={districts}
                                value={
                                    districts.find(
                                        ({ value }) => value == formData?.tfact_district_id
                                    ) || ""
                                }
                                onChange={(e) => {
                                    handleChange({
                                        target: {
                                            name: "tfact_district_id",
                                            value: e.value,
                                        },
                                    });
                                }}
                                labelledBy="Select Districts"
                            />
                            {errors?.tfact_district_id && (
                                <div className="error text-danger">
                                    {errors?.tfact_district_id}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label">
                                Sub district
                            </label>
                            <Select
                                name="tfact_block_id"
                                options={blocks}
                                value={
                                    blocks.find(
                                        ({ value }) => value == formData?.tfact_block_id
                                    ) || ""
                                }
                                onChange={(e) => {
                                    handleChange({
                                        target: {
                                            name: "tfact_block_id",
                                            value: e.value,
                                        },
                                    });
                                }}
                                labelledBy="Select Blocks"
                            />
                            {errors?.tfact_block_id && (
                                <div className="error text-danger">{errors?.tfact_block_id}</div>
                            )}
                        </div>
                    </div>
                    {/* <div className="col-md-6">
                        <div className="mb-3">
                            <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label">
                                Location
                            </label>
                            <Select
                                name="tfact_location_id"
                                options={locations}
                                value={
                                    locations.find(
                                        ({ value }) => value == formData?.tfact_location_id
                                    ) || ""
                                }
                                onChange={(e) => {
                                    handleChange({
                                        target: {
                                            name: "tfact_location_id",
                                            value: e.value,
                                        },
                                    });
                                }}
                                labelledBy="Select Locations"
                            />
                            {errors?.tfact_location_id && (
                                <div className="error text-danger">{errors?.tfact_location_id}</div>
                            )}
                        </div>
                    </div> */}


                    <div className="col-md-6">
                        <div className="mb-3">
                            <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label">
                                Business Area
                            </label>
                            <Select
                                name="tfact_business_area_id"
                                options={businessAreaOptions}
                                value={
                                    businessAreaOptions.find(
                                        option => option.value === formData?.tfact_business_area_id
                                    ) || null
                                }
                                onChange={(e) => {
                                    handleChange({
                                        target: {
                                            name: "tfact_business_area_id",
                                            value: e.value,
                                        },
                                    });
                                }}
                                labelledBy="Select Business Area"
                            />


                            {errors?.tfact_business_area_id && (
                                <div className="error text-danger">{errors?.tfact_business_area_id}</div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Factory Name
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tfact_factory_name}
                                onChange={handleChange}
                                name="tfact_factory_name"
                                id="tfact_factory_name"
                                placeholder="Enter Factory"
                            // required
                            />
                            {errors?.tfact_factory_name && (
                                <div className="error text-danger">
                                    {errors?.tfact_factory_name}
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
