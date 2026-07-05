import React, { useEffect, useState } from "react";
import Select from "react-select";

import ScaleLoader from "react-spinners/ScaleLoader";
import { toast, Toaster } from "react-hot-toast";

import { useLoading } from '../../context/LoadingContext';

// import { MultiSelect } from 'react-multi-select-component';
import { createVillageApi } from "../../Services/Master-service";
// import { getAllStateApi } from '../../Services/State-service';
// import { getAllDistrictApi } from "../../Services/District-service";
import {
    fetchStatesThunk
} from '../../redux/slices/villageGeneralProfileSlice';

import { fetchDistrictsByStateIds, fetchBlocksByDistrictIds } from '../../Services/Master-service';
import { useDispatch, useSelector } from 'react-redux';


export const AddEditVillage = ({ changeModalStatus, editVillage, initiatedVillageDatatable, datatable_url }) => {

    const dispatch = useDispatch();
    let { loading, setLoading } = useLoading(false);
    const [selectedStates, setSelectedStates] = useState([]);
    const [selectedDistricts, setSelectedDistricts] = useState([]);
    const [selectedBlocks, setSelectedBlocks] = useState([]);
    const [filteredDistricts, setFilteredDistricts] = useState([]);
    const [filteredBlocks, setFilteredBlocks] = useState([]);

    const states = useSelector((state) => state.villages.states);
    const districts = useSelector((state) => state.villages.districts);
    const blocks = useSelector((state) => state.villages.blocks);

    const [formData, setFormData] = useState({
        tvl_village_id: "",
        tvl_village_name: "",
        tvl_tsl_state_id: "",
        tvl_tdl_district_id: "",
        tvl_tbl_block_id: "",
    });

    useEffect(() => {

        dispatch(fetchStatesThunk());

    }, [dispatch]);

    const fetchDistricts = async (stateIds) => {
        // try {
        // Map the selected states to extract the state values (IDs)
        const state_id = stateIds;

        // Create the request payload
        const state_ids = {
            state_ids: state_id
        };


        // Make the API call to fetch districts based on the selected state IDs
        const response = await fetchDistrictsByStateIds(state_ids);


        // Assuming the response structure you provided
        const { data, status, message } = response;

        if (status === 1) {
            // Transforming API data into the required format for MultiSelect
            const districtsData = data.map(district => ({
                label: district.tdl_district_name, // Using the district name as label
                value: district.tdl_district_id,   // Using the district ID as value
                stateId: district.tdl_tsl_state_id         // Assuming state_id is available in each district (modify if necessary)
            }));


            // Update the state to reflect the new district data
            setFilteredDistricts(districtsData);
            const defaultYear = data.find((option) => option.value === editVillage.tbl_district_id);
            setSelectedDistricts(defaultYear || null);
            // setSelectedDistricts([]); // Reset selected districts
        } else {
            setFilteredDistricts([]);
            console.error('Failed to fetch districts:', message);
        }
    };

    const fetchBlocks = async (districtIds) => {
        try {
            // Map the selected districts to extract the district IDs
            const district_ids = districtIds;

            // Create the request payload
            const districtPayload = {
                district_ids: district_ids
            };

            // Make the API call to fetch blocks based on the selected district IDs
            const response = await fetchBlocksByDistrictIds(districtPayload);

            // Assuming the response structure similar to districts API
            const { data, status, message } = response;

            if (status === 1) {
                // Transforming API data into the required format for MultiSelect
                const blocksData = data.map(block => ({
                    label: block.tbl_block_name,  // Using block name as label
                    value: block.tbl_block_id,    // Using block ID as value
                    districtId: block.tbl_district_id // Assuming district_id is available in each block
                }));


                // Update the state to reflect the new block data
                setFilteredBlocks(blocksData);
                setSelectedBlocks([]); // Reset selected blocks
            } else {
                setFilteredBlocks([]);  // Reset if no data
                console.error('Failed to fetch blocks:', message);
            }

        } catch (error) {
            console.error('Error fetching blocks:', error);
        }
    };

    const handleStateChange = (selectedStates) => {
        setSelectedStates(selectedStates);

        // Fetch districts based on selected states
        // var state_id = selectedStates.map((state) => state.value);
        var state_id = selectedStates.value;
        fetchDistricts(state_id);
    };

    const handleDistrictChange = (selectedDistricts) => {
        setSelectedDistricts(selectedDistricts);
        // Fetch Villages based on selected districts
        // var district_ids = selectedDistricts.map((district) => district.value);
        var district_ids = selectedDistricts.value;
        fetchBlocks(district_ids);
    };

    const handleBlockChange = (selectedBlocks) => {
        setSelectedBlocks(selectedBlocks);
        // Fetch blocks based on selected districts
        // var block_ids = selectedBlocks.map((block) => block.value);

        // var district_ids = selectedDistricts.value;
        // fetchVillages(block_ids);
    };


    // Ensure states is an array before mapping
    const statesOptions = Array.isArray(states.data) ? states.data.map((state) => ({
        value: state.tsl_state_id, label: state.tsl_state_name
    })) : [];


    const districtsOptions = Array.isArray(districts.data) ? districts.data.map((district) => ({
        value: district.tdl_district_id, label: district.tdl_district_name, stateId: district.tdl_tsl_state_id
    })) : [];

    const blocksOptions = Array.isArray(blocks.data) ? blocks.data.map((block) => ({
        value: block.tbl_block_id, label: block.tbl_block_name, districtId: block.tbl_district_id
    })) : [];


    useEffect(() => {
        setSelectedStates({ label: editVillage?.tsl_state_name, value: editVillage?.tdl_tsl_state_id });
        // Fetch districts for the selected state
        fetchDistricts(editVillage.tdl_tsl_state_id).then(() => {
            // Set the selected district after districts are fetched
            setSelectedDistricts({
                label: editVillage.tdl_district_name,
                value: editVillage.tbl_district_id,
            });
        });
        // Fetch blocks for the selected district
        fetchBlocks(editVillage.tbl_district_id).then(() => {
            // Set the selected district after districts are fetched
            setSelectedBlocks({
                label: editVillage.tbl_block_name,
                value: editVillage.tbl_block_id,
            });
        });

        setFormData(editVillage);

    }, [editVillage]);


    let inputChange = (event) => {

        var field = event.target.name

        const actualValue = event.target.value;

        setFormData({ ...formData, [field]: actualValue });
    };

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);

        const updateData = {
            tvl_village_id: formData.tvl_village_id ?? "",
            tvl_village_name: formData.tvl_village_name,
            tvl_tsl_state_id: selectedStates.value,
            tvl_tdl_district_id: selectedDistricts.value,
            tvl_tbl_block_id: selectedBlocks.value,
        };     

        createVillageApi(updateData)
            .then((res) => {
                setLoading(false);
                if (res.status == 1) {
                    toast.success(res.message);
                } else {
                    toast.error(res.message);
                }
                changeModalStatus("user_update_modal", false);
                initiatedVillageDatatable(datatable_url);
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

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label">
                                State
                            </label>
                            <Select
                                name="tvl_tsl_state_id"
                                options={statesOptions}
                                value={selectedStates}
                                onChange={handleStateChange}
                                labelledBy="Select States"
                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                menuPortalTarget={document.body}
                            />
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
                                name="tvl_tdl_district_id"
                                options={filteredDistricts}
                                value={selectedDistricts}
                                onChange={handleDistrictChange}
                                labelledBy="Select Districts"
                            />
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label
                                htmlFor="exampleFormControlInput1"
                                className="form-label">
                                Block
                            </label>
                            <Select
                                name="tvl_tbl_block_id"
                                options={filteredBlocks}
                                value={selectedBlocks}
                                onChange={handleBlockChange}
                                labelledBy="Select Blocks"
                            />
                        </div>
                    </div>


                    <div className="col-md-6">
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Village
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.tvl_village_name}
                                onChange={inputChange}
                                name="tvl_village_name"
                                id="tvl_village_name"
                                placeholder="Enter Village"
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
