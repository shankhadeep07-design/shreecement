import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import Select from "react-select";
import * as Yup from "yup";

import {
    fetchBlocksByDistrictIdsWithOutLabelValue,
    fetchDistrictsByStateIds,
    getGramPanchayatsByBlockIds,
    getRevenueVillageByGramPanchayatIds,
    getTypeOfVillageList,
    getVillageByRevenueVillageIds
} from "../../../Services/Master-service";

import { useNavigate } from "react-router-dom";
import { getAllStateApi } from "../../../services/State-service";
import { createUnitApi, updateUnitApi } from "../../../services/unit-service";
import { getDistancesByStateDistrictApi } from "../../../services/Distance-service";
const noLeadingSpace = /^(?!\s)/;
const noEmoji = /^(?!.*[\p{Extended_Pictographic}]).*$/u;
const noSpecialStart = /^[a-zA-Z0-9]/;

const trimmedString = () =>
    Yup.string().transform((value) => (value ? value.trim() : ""));

const Schema = Yup.object({

    tun_name: trimmedString()
        .required("Unit name required")
        .matches(noLeadingSpace, "Cannot start with space")
        .matches(noSpecialStart, "Cannot start with special character")
        .matches(noEmoji, "Emoji not allowed"),

    tun_state_id: Yup.string().required("State required"),
    tun_district_id: Yup.string().required("District required"),

    locations: Yup.array().of(
        Yup.object().shape({
            block_id: Yup.string().required("Block required"),
            gp_id: Yup.string().required("Gram Panchayat required"),
            revenue_village_id: Yup.string().required("Revenue Village required"),
            village_id: Yup.string().required("Village required"),
            type_of_village_id: Yup.string().required("Village type required"),
            distance: Yup.number()
                .typeError("Distance must be number")
                .required("Distance required")
        })
    )
});

export const AddEditUnit = ({ datatable_url, initiatedUnitDatatable, changeModalStatus, editUnit }) => {

    const id = editUnit?.tun_id;
    const navigate = useNavigate();
    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [villageTypes, setVillageTypes] = useState([]);
    const [distances, setDistances] = useState([]);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        tun_name: "",
        tun_state_id: "",
        tun_district_id: "",
        locations: [
            {
                block_id: "",
                gp_id: "",
                revenue_village_id: "",
                village_id: "",
                type_of_village_id: "",
                distance: "",
                gps: [],
                revenueVillages: [],
                villages: []
            }
        ]
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

    const inputChange = ({ target: { name, value } }) => {

        let newValue = value;

        if (name === "tun_name") {
            newValue = value.replace(/^\s+/, ""); // remove leading spaces
        }

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleLocationChange = (index, field, value) => {

        const rows = [...formData.locations];
        rows[index][field] = value;

        setFormData({
            ...formData,
            locations: rows
        });

    };

    const fetchDistances = async (stateId, districtId) => {
        if (!stateId || !districtId) {
            setDistances([]);
            return;
        }
        try {
            const res = await getDistancesByStateDistrictApi({
                tdis_state_id: stateId,
                tdis_district_id: districtId
            });
            setDistances(res?.data || []);
        } catch (error) {
            console.error("Failed to fetch distances", error);
            setDistances([]);
        }
    };

    const addRow = () => {

        setFormData({
            ...formData,
            locations: [
                ...formData.locations,
                {
                    block_id: "",
                    gp_id: "",
                    revenue_village_id: "",
                    village_id: "",
                    type_of_village_id: "",
                    distance: "",
                    gps: [],
                    revenueVillages: [],
                    villages: []
                }
            ]
        });

    };

    const removeRow = (index) => {

        const rows = [...formData.locations];
        rows.splice(index, 1);

        setFormData({
            ...formData,
            locations: rows
        });

    };

    useEffect(() => {

        getAllStateApi()
            .then((data) => {

                setStates(data?.data || []);

            })
            .catch((error) =>
                toast.error(
                    error?.response?.data?.originalError ||
                    error?.response?.data?.message
                )
            );

    }, []);

    useEffect(() => {

        getTypeOfVillageList()
            .then((res) => {
                setVillageTypes(res?.data || []);
            })
            .catch((error) => {
                toast.error(
                    error?.response?.data?.message ||
                    "Failed to load village types"
                );
            });

    }, []);

    const submit = async (e) => {

        e.preventDefault();

        const isValid = await handleValidation(formData);
        if (!isValid) return;

        const cleanedLocations = formData.locations.map((loc) => ({
            block_id: loc.block_id,
            gp_id: loc.gp_id,
            revenue_village_id: loc.revenue_village_id,
            village_id: loc.village_id,
            type_of_village_id: loc.type_of_village_id,
            distance: loc.distance
        }));

        const payload = {
            ...formData,
            locations: cleanedLocations
        };

        try {

            let response;

            if (editUnit?.tun_id) {

                response = await updateUnitApi(payload, id);

                toast.success(response?.message || "Unit updated successfully");
                changeModalStatus("user_update_modal", false);
                initiatedUnitDatatable(datatable_url);

            } else {

                response = await createUnitApi(payload);

                toast.success(response?.message || "Unit created successfully");
                changeModalStatus("user_update_modal", false);
                initiatedUnitDatatable(datatable_url);
            }

            // setTimeout(() => {
            //     navigate("/admin/masters/unit");
            // }, 1200);

        } catch (error) {

            toast.error(
                error?.response?.data?.message ||
                error?.response?.data?.originalError ||
                "Something went wrong"
            );

        }

    };

    //    useEffect(() => {
    //   if (editUnit && editUnit.tun_id) {

    //     // Load districts
    //     fetchDistrictsByStateIds(editUnit.tsl_state_id).then(res => {
    //       setDistricts(res?.data || []);
    //     });

    //     // Load blocks
    //     fetchBlocksByDistrictIdsWithOutLabelValue(editUnit.tdl_district_id).then(res => {
    //       const formattedBlocks = (res?.data || []).map(item => ({
    //         value: item.tbl_block_id,
    //         label: item.tbl_block_name
    //       }));
    //       setBlocks(formattedBlocks);
    //     });

    //     const formattedLocations = editUnit.locations.map(loc => ({
    //       block_id: loc.block_id,
    //       gp_id: loc.gp_id,
    //       revenue_village_id: loc.revenue_village_id,
    //       village_id: loc.village_id,
    //       gps: [],
    //       revenueVillages: [],
    //       villages: []
    //     }));

    //     setFormData({
    //       tun_name: editUnit.tun_name,
    //       tun_distance: editUnit.tun_distance,
    //       tun_state_id: editUnit.tsl_state_id,
    //       tun_district_id: editUnit.tdl_district_id,
    //       locations: formattedLocations
    //     });

    //   }
    // }, [editUnit]);

    useEffect(() => {
        const loadEditData = async () => {

            if (!editUnit || !editUnit.tun_id) return;

            try {

                // 1️⃣ Load districts
                const districtRes = await fetchDistrictsByStateIds(editUnit.tsl_state_id);
                const districtList = districtRes?.data || [];
                setDistricts(districtList);

                // 2️⃣ Load blocks
                const blockRes = await fetchBlocksByDistrictIdsWithOutLabelValue(editUnit.tdl_district_id);

                const formattedBlocks = (blockRes?.data || []).map((item) => ({
                    value: item.tbl_block_id,
                    label: item.tbl_block_name
                }));

                setBlocks(formattedBlocks);

                // 2.1 Fetch Distances for edit
                await fetchDistances(editUnit.tsl_state_id, editUnit.tdl_district_id);

                // 3️⃣ Load locations
                const updatedLocations = await Promise.all(
                    (editUnit.locations || []).map(async (loc) => {

                        const gpRes = await getGramPanchayatsByBlockIds(loc.block_id);
                        const gps = gpRes?.data || [];

                        const rvRes = await getRevenueVillageByGramPanchayatIds(loc.gp_id);
                        const revenueVillages = rvRes?.data || [];

                        const vRes = await getVillageByRevenueVillageIds(loc.revenue_village_id);
                        const villages = vRes?.data || [];

                        return {
                            block_id: loc.block_id,
                            gp_id: loc.gp_id,
                            revenue_village_id: loc.revenue_village_id,
                            village_id: loc.village_id,
                            type_of_village_id: loc.type_of_village_id,
                            distance: loc.distance,
                            gps,
                            revenueVillages,
                            villages
                        };
                    })
                );

                // 4️⃣ Set form data
                setFormData({
                    tun_name: editUnit.tun_name,
                    tun_state_id: editUnit.tsl_state_id,
                    tun_district_id: editUnit.tdl_district_id,
                    locations: updatedLocations
                });

            } catch (err) {
                console.error(err);
            }
        };

        loadEditData();

    }, [editUnit]);

    return (

        <>
            <Toaster position="top-center" />

            <form onSubmit={submit}>

                <div className="row">

                    <div className="col-md-6">

                        <label>Unit Name <span className="text-danger">*</span></label>

                        <input
                            type="text"
                            name="tun_name"
                            value={formData.tun_name}
                            onChange={inputChange}
                            className="form-control"
                        />
                        {errors.tun_name && (
                            <div className="text-danger">{errors.tun_name}</div>
                        )}
                    </div>

                </div>

                <div className="row">

                    <div className="col-md-6">
                        <label>State <span className="text-danger">*</span></label>

                        <Select
                            options={states}
                            value={states.find(s => s.value === formData.tun_state_id) || null}
                            onChange={(e) => {

                                fetchDistrictsByStateIds(e.value)
                                    .then((res) => {
                                        setDistricts(res?.data || []);
                                    });

                                fetchDistances(e.value, "");

                                setBlocks([]);

                                setFormData({
                                    ...formData,
                                    tun_state_id: e.value,
                                    tun_district_id: "",
                                    locations: [
                                        {
                                            block_id: "",
                                            gp_id: "",
                                            revenue_village_id: "",
                                            village_id: "",
                                            gps: [],
                                            revenueVillages: [],
                                            villages: []
                                        }
                                    ]
                                });

                            }}
                        />
                        {errors.tun_state_id && (
                            <div className="text-danger">{errors.tun_state_id}</div>
                        )}
                    </div>

                    <div className="col-md-6">

                        <label>District <span className="text-danger">*</span></label>

                        <Select
                            options={districts}
                            value={districts.find(d => d.value === formData.tun_district_id) || null}
                            onChange={(e) => {

                                fetchBlocksByDistrictIdsWithOutLabelValue(e.value)
                                    .then((res) => {

                                        const formattedBlocks = (res?.data || []).map((item) => ({
                                            value: item.tbl_block_id,
                                            label: item.tbl_block_name
                                        }));

                                        setBlocks(formattedBlocks);

                                    });

                                fetchDistances(formData.tun_state_id, e.value);

                                setFormData({
                                    ...formData,
                                    tun_district_id: e.value,
                                    locations: [
                                        {
                                            block_id: "",
                                            gp_id: "",
                                            revenue_village_id: "",
                                            village_id: "",
                                            gps: [],
                                            revenueVillages: [],
                                            villages: []
                                        }
                                    ]
                                });

                            }}
                        />
                        {errors.tun_district_id && (
                            <div className="text-danger">{errors.tun_district_id}</div>
                        )}
                    </div>

                </div>

                <hr />
                <button
                    type="button"
                    onClick={addRow}
                    className="btn btn-success mt-3"
                >
                    ➕ Add More
                </button>
                {formData.locations.map((row, index) => (

                    <div className="row mt-3" key={index}>

                        <div className="col-md-3">

                            <label>Distance (KM) <span className="text-danger">*</span></label>

                            <Select
                                options={distances}
                                value={distances.find(d => d.value === row.distance) || null}
                                onChange={(e) =>
                                    handleLocationChange(index, "distance", e.value)
                                }
                            />
                            {errors[`locations[${index}].distance`] && (
                                <div className="text-danger">
                                    {errors[`locations[${index}].distance`]}
                                </div>
                            )}
                        </div>
                        <div className="col-md-3">

                            <label>Block <span className="text-danger">*</span></label>

                            <Select
                                options={blocks}
                                value={blocks.find(b => b.value === row.block_id) || null}
                                onChange={(e) => {

                                    getGramPanchayatsByBlockIds(e.value)
                                        .then((res) => {

                                            const rows = [...formData.locations];

                                            rows[index].gps = res?.data || [];
                                            rows[index].revenueVillages = [];
                                            rows[index].villages = [];
                                            rows[index].block_id = e.value;
                                            rows[index].gp_id = "";
                                            rows[index].revenue_village_id = "";
                                            rows[index].village_id = "";

                                            setFormData({
                                                ...formData,
                                                locations: rows
                                            });

                                        });

                                }}
                            />
                            {errors[`locations[${index}].block_id`] && (
                                <div className="text-danger">
                                    {errors[`locations[${index}].block_id`]}
                                </div>
                            )}
                        </div>

                        <div className="col-md-3">

                            <label>Gram Panchayat <span className="text-danger">*</span></label>

                            <Select
                                options={row.gps}
                                value={row.gps.find(g => g.value === row.gp_id) || null}
                                onChange={(e) => {

                                    getRevenueVillageByGramPanchayatIds(e.value)
                                        .then((res) => {

                                            const rows = [...formData.locations];

                                            rows[index].revenueVillages = res?.data || [];
                                            rows[index].villages = [];
                                            rows[index].gp_id = e.value;
                                            rows[index].revenue_village_id = "";
                                            rows[index].village_id = "";

                                            setFormData({
                                                ...formData,
                                                locations: rows
                                            });

                                        });

                                }}
                            />
                            {errors[`locations[${index}].gp_id`] && (
                                <div className="text-danger">
                                    {errors[`locations[${index}].gp_id`]}
                                </div>
                            )}
                        </div>

                        <div className="col-md-3">

                            <label>Revenue Village <span className="text-danger">*</span></label>

                            <Select
                                options={row.revenueVillages}
                                value={row.revenueVillages.find(r => r.value === row.revenue_village_id) || null}
                                onChange={(e) => {

                                    getVillageByRevenueVillageIds(e.value)
                                        .then((res) => {

                                            const rows = [...formData.locations];

                                            rows[index].villages = res?.data || [];
                                            rows[index].revenue_village_id = e.value;
                                            rows[index].village_id = "";

                                            setFormData({
                                                ...formData,
                                                locations: rows
                                            });

                                        });

                                }}
                            />
                            {errors[`locations[${index}].revenue_village_id`] && (
                                <div className="text-danger">
                                    {errors[`locations[${index}].revenue_village_id`]}
                                </div>
                            )}
                        </div>

                        <div className="col-md-3">

                            <label>Village <span className="text-danger">*</span></label>

                            <Select
                                options={row.villages}
                                value={row.villages.find(v => v.value === row.village_id) || null}
                                onChange={(e) => handleLocationChange(index, "village_id", e.value)}
                            />
                            {errors[`locations[${index}].village_id`] && (
                                <div className="text-danger">
                                    {errors[`locations[${index}].village_id`]}
                                </div>
                            )}
                        </div>

                        <div className="col-md-3">

                            <label>Type of Village <span className="text-danger">*</span></label>

                            <Select
                                options={villageTypes}
                                value={villageTypes.find(v => v.value === row.type_of_village_id) || null}
                                onChange={(e) =>
                                    handleLocationChange(index, "type_of_village_id", e.value)
                                }
                            />
                            {errors[`locations[${index}].type_of_village_id`] && (
                                <div className="text-danger">
                                    {errors[`locations[${index}].type_of_village_id`]}
                                </div>
                            )}
                        </div>

                        <div className="col-md-1">

                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => removeRow(index)}
                            >
                                ❌
                            </button>

                        </div>

                    </div>

                ))}



                <button type="submit" className="btn btn-primary mt-4">
                    Submit
                </button>

            </form>
        </>
    );
};