import React, { useEffect, useState } from "react";
import Select from "react-select";

import { toast, Toaster } from "react-hot-toast";

import { useLoading } from '../../../context/LoadingContext';

import { createDistrictApi } from "../../../Services/District-service";
import { getAllStateApi } from '../../../Services/State-service';


export const AddEditProjectImplementation = ({ changeModalStatus, editList, initiatedDistrictDatatable, datatable_url }) => {

    const [villageOptions, setVillageOptions] = useState([]);
    const [selectedVillage, setSelectedVillage] = useState(null);
    let { loading, setLoading } = useLoading(false);

    const [formData, setFormData] = useState({
        tpi_id: "",
        tpi_implementation_name: "",
    });

    const detailsofStateList = async () => {

        try {
            const response = await getAllStateApi();

            if (response.status === 1) {
                const options = response.data.map((data) => ({
                    value: data.tpi_id,
                    label: data.tpi_implementation_name,
                }));
                setVillageOptions(options);

              
                const defaultVillage = options.find((option) => option.value === editList.tpi_id);
                setSelectedVillage(defaultVillage || null);

                setFormData((prev) => ({
                    ...prev,
                    tpi_id: defaultVillage ? defaultVillage.value : '',
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

        setFormData(editList);

    }, [editList]);


    let inputChange = (event) => {

        var field = event.target.name

        const actualValue = event.target.value;

        setFormData({ ...formData, [field]: actualValue });
    };

    const handleSelectChange = (selectedOption, { name }) => {
        setFormData({ ...formData, [name]: selectedOption ? selectedOption.value : '' });

        if (name === "tpi_id") {
            setSelectedVillage(selectedOption);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);


        const updateData = {
            tpi_id: formData.tpi_id,
            tpi_implementation_name: formData.tpi_implementation_name,
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
                                name="tpi_id"
                                id="state"
                                options={villageOptions}
                                value={selectedVillage}
                                onChange={(selectedOption) => handleSelectChange(selectedOption, { name: "tpi_id" })
                                }
                            />
                        </div>
                    </div> */}

                    <div className="col-md-12">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Implementation
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tpi_implementation_name}
                                onChange={inputChange}
                                name="tpi_implementation_name"
                                id="tpi_implementation_name"
                                placeholder="Enter Implementation"
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
