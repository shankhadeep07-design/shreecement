import React, { useEffect, useState } from "react";
import Select from "react-select";

import { toast, Toaster } from "react-hot-toast";

import { useLoading } from '../../context/LoadingContext';

import { createDistrictApi } from "../../Services/District-service";
import { getAllStateApi } from '../../Services/State-service';


export const AddEditActivity = ({ changeModalStatus, editDistrict, initiatedDistrictDatatable, datatable_url }) => {

    const [villageOptions, setVillageOptions] = useState([]);
    const [selectedVillage, setSelectedVillage] = useState(null);
    let { loading, setLoading } = useLoading(false);

    const [formData, setFormData] = useState({
        tactm_activity_id: "",
        tdl_tsl_state_id: "",
        tactm_activity_name: "",
    });

    const detailsofStateList = async () => {

        try {
            const response = await getAllStateApi();

            if (response.status === 1) {
                const options = response.data.map((data) => ({
                    value: data.tsl_state_id,
                    label: data.tsl_state_name,
                }));
                setVillageOptions(options);

              
                const defaultVillage = options.find((option) => option.value === editDistrict.tdl_tsl_state_id);
                setSelectedVillage(defaultVillage || null);

                setFormData((prev) => ({
                    ...prev,
                    tdl_tsl_state_id: defaultVillage ? defaultVillage.value : '',
                }));
            }
        } catch (error) {
            console.error("Error fetching financial years:", error);
        }
    }

    useEffect(() => {

        detailsofStateList();
    }, [])


    useEffect(() => {

        setFormData(editDistrict);

    }, [editDistrict]);


    let inputChange = (event) => {

        var field = event.target.name

        const actualValue = event.target.value;

        setFormData({ ...formData, [field]: actualValue });
    };

    const handleSelectChange = (selectedOption, { name }) => {
        setFormData({ ...formData, [name]: selectedOption ? selectedOption.value : '' });

        if (name === "tdl_tsl_state_id") {
            setSelectedVillage(selectedOption);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);


        const updateData = {
            tactm_activity_id: formData.tactm_activity_id ?? "",
            tactm_activity_name: formData.tactm_activity_name,
        };


        createDistrictApi(updateData)
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
                toast.error(error.response.data.message);
                setLoading(false);
            });
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



                    {/* <div className="col-md-6">
                        <div className="mb-3">
                            <label htmlFor="Village" className="form-label">
                                State
                            </label>
                            <Select
                                name="tdl_tsl_state_id"
                                id="state"
                                options={villageOptions}
                                value={selectedVillage}
                                onChange={(selectedOption) => handleSelectChange(selectedOption, { name: "tdl_tsl_state_id" })
                                }
                            />
                        </div>
                    </div> */}

                    <div className="col-md-12">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Activity
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tactm_activity_name}
                                onChange={inputChange}
                                name="tactm_activity_name"
                                id="tactm_activity_name"
                                placeholder="Enter Activity"
                                required
                            />
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
