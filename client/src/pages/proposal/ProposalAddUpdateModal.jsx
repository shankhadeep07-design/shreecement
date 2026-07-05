import set from "lodash/set"; // lodash set is great for nested paths
import { useEffect, useState, useRef } from "react";
import { Modal } from "react-bootstrap";
import { toast, Toaster } from "react-hot-toast";
import Select from "react-select";
import * as Yup from "yup";
import { getAllLocationApi } from "../../services/Gram-panchayat-service";
import { currentFinancialYear, fetchDistrictsListByStateIds, fetchSubDistrictsListByDistrictIdsForProposalCreation, fetchLocationsListBySubdistrictIds, getSubMasterListByMasterSlugApi } from "../../Services/Master-service";
import { getActivityByFocusAreaId, getAllFocusAreaApi, getAllScheduleSevenApi, getSubActivityByFocusAreaId } from "../../services/PriorityAlignment-service";
import { createOrUpdateProposalApi, getBudgetingAmountFetchByFocusAreaActivityId } from "../../services/Proposal-service";
import { getAllStateApi } from '../../services/State-service';
// import { getAllScheduleSevenApi } from "../../services/PriorityAlignment-service";
import { proposalDetailsApi } from '../../services/Proposal-service';

import { allSdgs } from "../../services/National-indicator-service";

import { allProjectTypes } from '../../Services/Project-type-service';
import { fetchSubSubProjectTypeByProjectId } from '../../Services/SubProject-type-service';

import { getAllSubScheduleSevenApi, getAllThemeApi } from "../../services/PriorityAlignment-service";
// import { fetchBlocksByDistrictIds, fetchDistrictsByStateIds, fetchLocationsByBlockIds, getSubMasterListByMasterSlugApi } from "../../Services/Master-service";
import { getAllSubdistricWiseProfitCenterApi } from "../../services/MasterData-service";


import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import { fromLonLat, transform } from "ol/proj";
import Draw from "ol/interaction/Draw";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Fill, Stroke, Circle as CircleStyle } from "ol/style";
import "ol/ol.css";
import { defaults as defaultControls } from "ol/control";
import ScaleLine from "ol/control/ScaleLine";
import FullScreen from "ol/control/FullScreen";

// import Geocoder from "ol-geocoder";
// import "ol-geocoder/dist/ol-geocoder.min.css";



import { Upload, Button, Tooltip, Popconfirm } from "antd";
import { UploadOutlined, InfoCircleOutlined } from "@ant-design/icons";







const Schema = Yup.object({
    tpros_financial_year_id: Yup.string()
        .required("Financial Year is required"),

    tpros_proposal_name: Yup.string()
        .max(255, "Proposal name must be at most 255 characters")
        .required("Proposal name is required"),
})


const MIN_DATE = "1800-01-01";
// Start Date Change









export default function ProposalAddUpdateModal({ details, showModal, changeModalStatus, initListDatatable, my_url }) {
    const mapInstanceRef = useRef(null);

    const [financialYearOption, setFinancialYearOption] = useState([]);
    const [selectedStates, setSelectedStates] = useState([]);
    const [thematicOptions, setThematicOptions] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [stateOptions, setStateOptions] = useState([]);
    const [districtsOptions, setDistrictsOptions] = useState([]);
    const [subDistrictsOptions, setSubDistrictsOptions] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);
    const [scheduleSevenOptions, setScheduleSevenOptionsOptions] = useState([]);
    const [sdgOptions, setSdgOptions] = useState([]);
    const [projectOptions, setProjectOptions] = useState([]);
    const [subProjectOptions, setSubProjectOptions] = useState([]);
    const [budgetingAmount, setBudgetingAmount] = useState([]);
    const [fileLists, setFileLists] = useState({});

    const [searchText, setSearchText] = useState("");


    const [businessAreas, setBusinessAreas] = useState([]);


    const [minDate, setMinDate] = useState("");
    const [maxDate, setMaxDate] = useState("");
    const [baseProjectYearOptions, setBaseProjectYearOptions] = useState([]);

    const unitOptions = [
        { label: "Meter", value: "Meter" },
        { label: "Centimeter", value: "Centimeter" }
    ];


    const [glCodeOptions, setGlCodeOptions] = useState([]);
    const [profitCenterOptions, setProfitCenterOptions] = useState([]);
    const [costCenterOptions, setCostCenterOptions] = useState([]);




    const fetchAllSubdistrictwiseProfitCenterApiFun = () => {
        getAllSubdistricWiseProfitCenterApi()
            .then((res) => {
                const rows = res?.data || [];

                // GL CODE options
                const glList = rows.map(item => ({
                    value: item.tprofc_id,
                    label: item.tprofc_gl_account
                }));

                // PROFIT CENTER options
                const profitList = rows.map(item => ({
                    value: item.tprofc_id,
                    label: item.tprofc_profit_centre
                }));

                // COST CENTER options
                const costList = rows.map(item => ({
                    value: item.tprofc_id,
                    label: item.tprofc_cost_centre
                }));

                setGlCodeOptions(glList);
                setProfitCenterOptions(profitList);
                setCostCenterOptions(costList);

                console.log("GL:", glList);
                console.log("Profit:", profitList);
                console.log("Cost:", costList);
            })
            .catch((error) => {
                toast.error(
                    error?.response?.data?.originalError ||
                    error?.response?.data?.message
                );
            });
    };

    useEffect(() => {
        fetchAllSubdistrictwiseProfitCenterApiFun();
    }, []);


    useEffect(() => {
        fetchAllSubdistrictwiseProfitCenterApiFun();
    }, []);











    useEffect(() => {


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


    const [budgetRows, setBudgetRows] = useState([
        {
            tpros_particular: "",
            tpros_unit: "",
            tpros_no_of_units: 0,
            tpros_unit_cost: 0,
            tpros_total_amount: 0,
            tpros_gst_amount: 0,
            tpros_total_incl_gst: 0,
        },
    ]);


    const addRow = () => {
        setBudgetRows(prev => [
            ...prev,
            {
                tpros_particular: "",
                tpros_unit: "",
                tpros_no_of_units: "",
                tpros_unit_cost: "",
                tpros_total_amount: "",
                tpros_gst_amount: "",
                tpros_total_incl_gst: ""
            }
        ]);
    };


    const removeRow = (index) => {
        const updated = [...budgetRows];
        updated.splice(index, 1);
        setBudgetRows(updated);
    };


    const handleRowChange = (index, field, value) => {
        const updatedRows = [...budgetRows];
        updatedRows[index][field] = value;

        // Recalculate totals
        const noOfUnits = Number(updatedRows[index].tpros_no_of_units || 0);
        const unitCost = Number(updatedRows[index].tpros_unit_cost || 0);
        const gst = Number(updatedRows[index].tpros_gst_amount || 0);

        const total = noOfUnits * unitCost;
        const totalInclGst = total + (total * gst) / 100;

        updatedRows[index].tpros_total_amount = total;
        updatedRows[index].tpros_total_incl_gst = totalInclGst;

        setBudgetRows(updatedRows);
    };




    const grandTotal = budgetRows.reduce(
        (sum, row) => sum + Number(row.tpros_total_incl_gst || 0),
        0
    );



    const [formData, setFormData] = useState({
        // ===============================
        // Proposal Basic Details
        // ===============================
        tpros_proposal_name: "",
        tpros_financial_year_id: "",
        tpros_current_date: "",
        tpros_nature_of_the_project: "",
        tpros_project_type: "",
        tpros_type_of_the_project: "",
        tpros_type_of_the_sub_project: "",
        tpros_ngo_engagement: "",
        tpros_description: "",
        tpros_base_project_year: "",
        tpros_project_value: 0,

        // ===============================
        // Dates & Frequency
        // ===============================
        tpros_date_of_the_program: "",
        tpros_start_date: "",
        tpros_end_date: "",
        tpros_frequency: "",

        // ===============================
        // Proposal Content
        // ===============================

        // ===============================
        // Classification / Mapping
        // ===============================
        tpros_activity_id: "",
        tpros_org_unit: "",
        tpros_bu: "",
        tpros_thematic_area: "",
        tpros_gl_code: "",
        tpros_profit_center: "",
        tpros_cost_center: "",

        // ===============================
        // Location Details
        // ===============================
        tpros_state: "",
        tpros_district: "",
        tpros_sub_district: "",
        // tpros_location: "",
        tpros_gps_latitude: "",
        tpros_gps_longitude: "",




        //////////////new fields
        tpros_is_aspirational_district: "",
        tpros_is_gromor_village: "",
        tpros_schedule_seven: "",
        tpros_sdg: "",

        // ===============================
        // Beneficiaries
        // ===============================
        tpros_target_beneficiaries: 0,
        male_beneficiaries: 0,
        female_beneficiaries: 0,
        mix_group_beneficiaries: 0,

        // ===============================
        // Budget & Financials
        // ===============================
        // tpros_approved_line_item: "",
        tpros_allocate_budget_for_approved_line_item: 1,
        tpros_utilized_till_date: 0,
        tpros_project_budget: 1,

        tpros_particular: "",
        tpros_unit: "",
        tpros_no_of_units: 0,
        tpros_unit_cost: 1,
        tpros_total_amount: 1,
        tpros_gst_amount: 1,
        tpros_total_incl_gst: 2,

        // ===============================
        // Cost Breakdown
        // ===============================
        tpros_capex_cost: 0,
        tpros_opex_cost: 0,
        tpros_service_charges: 0,
        tpros_tax_details: 0,
        tpros_total_project_cost: 0,

        // ===============================
        // Implementation
        // ===============================
        tpros_implementation_by: "",
        tpros_implementation_partner_name: "",

        // ===============================
        // Compliance & Governance
        // ===============================
        tpros_ngo_compliance_check: "",
        tpros_vendor_compliance_check: "",
        tpros_govt_scheme_linkage: "",
        tpros_stakeholder_request_level: "",
        tpros_government_approval: "",

        // ===============================
        // Program Details
        // ===============================
        tpros_program_background: "",
        tpros_baseline_data_information: "",
        tpros_proposal_details: "",
        tpros_program_objective: [],
        tpros_activities_planned: "",
        tpros_expected_outcome: "",
        tpros_project_uniqueness: "",
        tpros_branding_communication: "",
        tpros_monitoring_scope: "",
        tpros_budget_breakup: "",

        // ===============================
        // Vendor Comparison
        // ===============================
        tpros_l1_party_budget: "",
        tpros_recommended_party: "",
        tpros_justification_other_than_l1: "",
        tpros_single_party_justification: "",

        // ===============================
        // Attachments
        // ===============================
        tpros_attachment_documents: null,
        tpros_remarks: ""
    });
    const [showMapModal, setShowMapModal] = useState(false);
    const mapRef = useRef(null)
    const handleValidation = async (data) => {
        try {
            await Schema.validate(data, { abortEarly: false });
            setErrors({});
            return true;
        } catch (err) {
            const validationErrors = {};
            err.inner.forEach((e) => {
                set(validationErrors, e.path, e.message); // builds nested structure
            });
            setErrors(validationErrors);
            return false;
        }
    };


    const inputChange = (e, meta) => {
        if (meta && meta.name) {
            const value = e
                ? Array.isArray(e) // multi-select returns array of objects
                    ? e.map(item => item.value)
                    : e.value
                : "";

            setFormData(prev => ({
                ...prev,
                [meta.name]: value,
            }));




            if (meta.name === "tpros_state") {
                fetchDistricts(value ? [value] : []);
            }
            return;
        }

        const { name, value, options, type } = e.target;

        let newValue = value;



        if (type === "text" || type === "textarea") {
            newValue = value.replace(/^\s+/, "");
        }



        if (options && e.target.multiple) {
            newValue = Array.from(options)
                .filter(option => option.selected)
                .map(option => option.value);
        }

        setFormData(prev => ({
            ...prev,
            [name]: newValue,
        }));

        // Existing conditional logic
        if (name === "tpros_state") {
            fetchDistricts(Array.isArray(newValue) ? newValue : [newValue]);
        }
        if (name === "tpros_district") {
            const districtIds = Array.isArray(newValue) ? newValue : newValue ? [newValue] : [];
            fetchSubDistrictsForProposalCreation(districtIds);
        }
        if (name === "tpros_sub_district") {
            const subDistrictIds = Array.isArray(newValue) ? newValue : newValue ? [newValue] : [];
            fetchLocations(subDistrictIds);
        }
        if (name === "tpros_type_of_the_project") {
            const projectId = newValue || "";
            fetchSubProjectType(projectId);
        }




    };



    const fetchSubProjectType = async (projectId) => {
        try {




            setSubProjectOptions([]);
            // setFormData(prev => ({
            //     ...prev,
            //     tpros_sub_district: ""
            // }));
            const res = await fetchSubSubProjectTypeByProjectId(projectId);

            // if (res.status === 1) {
            setSubProjectOptions(res.data.map(d => ({
                label: d.label,
                value: d.value,
            })));
            // }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDistricts = async (stateIds) => {
        try {
            setDistrictsOptions([]);

            setFormData(prev => ({
                ...prev,
                tpros_district: ""
            }));

            console.log("stateIds value:", stateIds);
            console.log("typeof stateIds:", typeof stateIds);
            console.log("is Array:", Array.isArray(stateIds));
            const res = await fetchDistrictsListByStateIds({ state_ids: stateIds });

            if (res.status === 1) {
                setDistrictsOptions(res.data.map(d => ({
                    label: d.tdl_district_name,
                    value: d.tdl_district_id,
                    stateId: d.tdl_state_id
                })));
            }
        } catch (err) {
            console.error(err);
        }
    };


    const fetchSubDistrictsForProposalCreation = async (districtIds) => {
        try {
            setSubDistrictsOptions([]);
            setFormData(prev => ({
                ...prev,
                tpros_sub_district: ""
            }));

            const res = await fetchSubDistrictsListByDistrictIdsForProposalCreation(districtIds);

            if (Array.isArray(res?.data)) {
                setSubDistrictsOptions(
                    res.data.map(d => ({
                        label: d.tbl_block_name,
                        value: d.tbl_block_id,
                    }))
                );
            } else {
                // fallback – prevents crash
                setSubDistrictsOptions([]);
            }

        } catch (err) {
            console.error(err);
        }
    };


    const fetchLocations = async (subDistrictIds) => {
        try {
            setLocationOptions([]);

            const res = await fetchLocationsListBySubdistrictIds(subDistrictIds);
            // if (res.status === 1) {
            setLocationOptions(res.data.map(d => ({
                label: d.label,
                value: d.value,
            })));
            // }
        } catch (err) {
            console.error(err);
        }
    };


    const financialYearOptionsWithCurrent = financialYearOption.map(opt => ({
        ...opt,
        label:
            opt.tfy_current_year === 'Y'
                ? `${opt.label}`
                : opt.label,
    }));


    useEffect(() => {
        const fetchData = async () => {
            try {
                // Financial Year
                const fyRes = await currentFinancialYear();
                setFinancialYearOption(fyRes?.data || []);



                // States + Thematic in parallel
                const [stateRes] = await Promise.all([
                    getAllStateApi(),
                    // fetchAllThematicApiFun(),
                ]);

                const [scheduleSevenRes] = await Promise.all([
                    getAllScheduleSevenApi(),

                ]);
                const [sdgRes] = await Promise.all([
                    allSdgs(),

                ]);

                const [projectTypeRes] = await Promise.all([
                    allProjectTypes(),

                ]);

                setStateOptions(stateRes?.data || []);
                setScheduleSevenOptionsOptions(scheduleSevenRes?.data || []);
                setSdgOptions(sdgRes?.data || []);

                setProjectOptions(projectTypeRes?.data || []);

                // getAllSubScheduleSevenApi()
                //     .then(res => setThematicOptions(res?.data || []));


                getAllThemeApi()
                    .then((data) => setThematicOptions(data?.data || []))
                    .catch((error) => toast.error(error?.response?.data?.message));
            } catch (error) {
                toast.error(
                    error?.response?.data?.originalError ||
                    error?.response?.data?.message ||
                    "Something went wrong"
                );
            }
        };

        fetchData();
    }, []);


    const handleStartDateChange = (e) => {
        const { value } = e.target;

        let error = "";

        if (value && value < MIN_DATE) {
            error = "Start date cannot be before 01-01-1800";
        }

        // if end date already selected, validate relation
        if (formData.tpros_end_date && value > formData.tpros_end_date) {
            error = "Start date cannot be after End date";
        }

        setFormData({
            ...formData,
            tpros_start_date: value
        });

        setErrors({
            ...errors,
            tpros_start_date: error
        });
    };
    // End Date Change
    const handleEndDateChange = (e) => {
        const { value } = e.target;

        let error = "";

        if (value && value < MIN_DATE) {
            error = "End date cannot be before 01-01-1800";
        }

        if (formData.tpros_start_date && value < formData.tpros_start_date) {
            error = "End date cannot be before Start date";
        }

        setFormData({
            ...formData,
            tpros_end_date: value
        });

        setErrors({
            ...errors,
            tpros_end_date: error
        });
    };


    const preventLeadingSpace = (e) => {
        const value = e.target.value;

        if (value.length === 1 && value === " ") {
            e.target.value = "";
            return;
        }

        if (value.startsWith(" ")) {
            e.target.value = value.trimStart();
        }
    };



    const handleFyChange = (selectedOption) => {
        console.log("Selected Option:", selectedOption);

        // 👇 get year from label instead
        const fyLabel = selectedOption?.label; // "2024-2025"

        if (fyLabel) {
            const [startYear, endYear] = fyLabel.split("-");

            const startDate = `${startYear}-04-01`;
            const endDate = `${endYear}-03-31`;

            console.log("Min:", startDate);
            console.log("Max:", endDate);

            setMinDate(startDate);
            setMaxDate(endDate);

            const baseYears = [
                { label: startYear, value: startYear },
                { label: endYear, value: endYear }
            ];

            setBaseProjectYearOptions(baseYears);

            // also store id if needed
            setFormData(prev => ({
                ...prev,
                tpros_financial_year_id: selectedOption.value,
                tpros_current_date: "",   // 👈 clear date field
                tpros_date_of_the_program: "",
                base_project_year: ""
            }));
        }
    };








    const submit = async (e) => {
        e.preventDefault();
        const isValid = await handleValidation(formData);
        // if (!isValid) return;
        if (!isValid) {
            toast.error("Please fix the validation errors before submitting.");
            return;
        }
        setLoading(true);
        const payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                payload.append(key, value);
            }
        });
        if (fileLists?.tpros_attachment_documents?.length > 0) {
            fileLists.tpros_attachment_documents.forEach((file) => {
                payload.append(
                    "tpros_attachment_documents",
                    file.originFileObj
                );
            });
        }
        // if (details?.tpros_id) {
        //     payload.append("tpros_id", details.tpros_id);
        // }

        if (budgetRows?.length > 0) {
            // append as JSON string
            payload.append("budgetRows", JSON.stringify(budgetRows));
        }


        if (details?.tpros_id) {
            payload.set("tpros_id", details.tpros_id); // replaces any previous value
        }


        try {


            console.log("---- Payload Contents ----");
            for (let pair of payload.entries()) {
                console.log(pair[0], ":", pair[1]);
            }

            // return;


            const res = await createOrUpdateProposalApi(payload);
            setLoading(false);
            // alert(res.status);
            // return;
            if (res.data.status === true) {
                toast.success(res.message || (details?.tpros_id
                    ? "Data Updated Successfully"
                    : "Data Added Successfully")
                );
                setTimeout(() => {
                    changeModalStatus("user_update_modal", false);
                }, 2000);
            } else {

                toast.error(res?.data?.message);
            }
            initListDatatable(my_url);
        } catch (error) {

            const errMsg =
                error?.response?.data?.message || "Something went wrong";
            toast.error(errMsg);
            setLoading(false);
        }
    };






    const fetchDetails = async () => {
        try {
            const proposal_id = details?.tpros_id;
            if (!proposal_id) return;

            // 1️⃣ Proposal details
            const { data } = await proposalDetailsApi({ proposal_id });
            if (!data) return;

            const normalizedData = {
                ...data,
                tpros_date_of_the_program: data?.tpros_date_of_the_program
                    ? data.tpros_date_of_the_program.split("T")[0]
                    : "",
                tpros_start_date: data?.tpros_start_date
                    ? data.tpros_start_date.split("T")[0]
                    : "",
                tpros_end_date: data?.tpros_end_date
                    ? data.tpros_end_date.split("T")[0]
                    : "",

                male_beneficiaries: data?.tpros_male_beneficiaries
                    ? data.tpros_male_beneficiaries
                    : "",
                female_beneficiaries: data?.tpros_female_beneficiaries
                    ? data.tpros_female_beneficiaries
                    : "",
                mix_group_beneficiaries: data?.tpros_mix_group_beneficiaries
                    ? data.tpros_mix_group_beneficiaries
                    : "",
                tpros_program_objective: data?.tpros_program_objective
                    ? JSON.parse(data.tpros_program_objective)
                    : [],
            };

            // 2️⃣ Set base form data
            setFormData(prev => ({
                ...prev,
                ...normalizedData,
            }));

            // 3️⃣ 🔥 Fetch districts AND auto-select
            if (normalizedData.tpros_state) {
                const res = await fetchDistrictsListByStateIds({
                    state_ids: [normalizedData.tpros_state],
                });

                if (res.status === 1) {
                    const districts = res.data.map(d => ({
                        label: d.tdl_district_name,
                        value: d.tdl_district_id,
                        stateId: d.tdl_state_id,
                    }));

                    // options + value together = guaranteed selection
                    setDistrictsOptions(districts);

                    setFormData(prev => ({
                        ...prev,
                        tpros_district: normalizedData.tpros_district,
                    }));
                }
            }

            // 4️⃣ Continue cascade
            if (normalizedData.tpros_district) {
                await fetchSubDistrictsForProposalCreation([
                    normalizedData.tpros_district,
                ]);
            }
            // AFTER district is handled



            if (normalizedData.tpros_sub_district) {
                await fetchLocations([normalizedData.tpros_sub_district]);
            }


            if (normalizedData.tpros_type_of_the_project) {
                const projectId = normalizedData.tpros_type_of_the_project;
                fetchSubProjectType(projectId);
            }

            // 5️⃣ Files
            const existingFiles =
                (data?.documents || [])
                    .filter(doc => doc.doc_purpose === "tpros_attachment_documents")
                    .map(doc => ({
                        uid: doc.tdoc_id,
                        name: doc.doc_name,
                        status: "done",
                        url: doc.full_url,
                        doc_id: doc.tdoc_id,
                        isExisting: true,
                    }));

            setFileLists(prev => ({
                ...prev,
                tpros_attachment_documents: existingFiles,
            }));



            // ✅ Set budget rows if editing
            if (data?.budgetRows && data.budgetRows.length > 0) {
                const rows = data.budgetRows.map(row => ({
                    tpros_particular: row.tpai_particular || "",
                    tpros_unit: row.tpai_unit || "",
                    tpros_no_of_units: Number(row.tpai_no_of_unit || 0),
                    tpros_unit_cost: Number(row.tpai_unit_cost || 0),
                    tpros_total_amount: Number(row.tpai_total || 0),
                    tpros_gst_amount: Number(row.tpai_gst_percentage || 0),
                    tpros_total_incl_gst: Number(row.tpai_total_including_gst || 0),
                }));
                setBudgetRows(rows);
            } else {
                // For Add, keep default single row
                setBudgetRows([
                    {
                        tpros_particular: "",
                        tpros_unit: "",
                        tpros_no_of_units: 0,
                        tpros_unit_cost: 0,
                        tpros_total_amount: 0,
                        tpros_gst_amount: 0,
                        tpros_total_incl_gst: 0,
                    },
                ]);
            }


        } catch (error) {
            toast.error(
                error?.response?.data?.originalError ||
                error?.response?.data?.message
            );
        }
    };



    useEffect(() => {
        if (details && details?.tpros_id) {
            fetchDetails();
        }
    }, [details]);


    useEffect(() => {
        let proposal_id = details?.tpros_id;
        proposalDetailsApi({ proposal_id })
            .then(({ data }) => {
                if (!data) return;
                var sub_district_id = data.tpros_sub_district;
                if (subDistrictsOptions.length) {
                    setFormData(prev => ({
                        ...prev,
                        tpros_sub_district: sub_district_id,
                    }));
                }

            });
    }, [subDistrictsOptions]);


    useEffect(() => {
        let proposal_id = details?.tpros_id;
        proposalDetailsApi({ proposal_id })
            .then(({ data }) => {
                if (!data) return;
                var tpros_type_of_the_sub_project = data.tpros_type_of_the_sub_project;
                if (subProjectOptions.length) {
                    setFormData(prev => ({
                        ...prev,
                        tpros_type_of_the_sub_project: tpros_type_of_the_sub_project,
                    }));
                }

            });
    }, [subProjectOptions]);



    const fileChangeHandler = (event) => {
        const { name, files } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: files[0], // store single file
        }));
    };


    const lat = 23.297;
    const lon = 77.638;
    const initializeMap = () => {
        if (!mapRef.current) return;

        if (mapInstanceRef.current) {
            mapInstanceRef.current.setTarget(null);
            mapInstanceRef.current = null;
        }

        const vectorSource = new VectorSource();
        const vectorLayer = new VectorLayer({
            source: vectorSource,
        });

        const esriLayer = new TileLayer({
            source: new XYZ({
                url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
                maxZoom: 12,
            }),
        });

        const map = new Map({
            target: mapRef.current,
            layers: [esriLayer, vectorLayer],
            controls: defaultControls({ attribution: false }).extend([
                new ScaleLine(),
                new FullScreen(),
            ]),
            view: new View({
                center: fromLonLat([lon, lat]),
                zoom: 4,
            }),
        });

        /* =============================
           DRAW INTERACTION
        ==============================*/
        const draw = new Draw({
            source: vectorSource,
            type: "Point",
        });

        map.addInteraction(draw);

        draw.on("drawend", (evt) => {
            vectorSource.clear();

            const coords = transform(
                evt.feature.getGeometry().getCoordinates(),
                "EPSG:3857",
                "EPSG:4326"
            );

            setFormData((prev) => ({
                ...prev,
                tpros_gps_latitude: coords[1],
                tpros_gps_longitude: coords[0],
            }));
        });

        /* =============================
           AUTO SUGGEST SEARCH
        ==============================*/
        const geocoder = new Geocoder("nominatim", {
            provider: "osm",
            lang: "en",
            placeholder: "Search location...",
            limit: 5,
            autoComplete: true,
            keepOpen: false,
            countrycodes: "in", // restrict to India
        });

        map.addControl(geocoder);

        geocoder.on("addresschosen", function (evt) {
            const coords = transform(
                evt.coordinate,
                "EPSG:3857",
                "EPSG:4326"
            );

            vectorSource.clear();

            const feature = new Feature({
                geometry: new Point(fromLonLat([coords[0], coords[1]])),
            });

            vectorSource.addFeature(feature);

            map.getView().setCenter(evt.coordinate);
            map.getView().setZoom(14);

            setFormData((prev) => ({
                ...prev,
                tpros_gps_latitude: coords[1],
                tpros_gps_longitude: coords[0],
            }));
        });

        map.updateSize();
        mapInstanceRef.current = map;
    };



    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{ duration: 2000 }}
                reverseOrder={false}
            ></Toaster>

            <Modal
                show={showModal.user_update_modal}
                onHide={() => changeModalStatus("user_update_modal", false)}
                fullscreen={true}

                id="user_update_modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{details?.tpros_id ? 'Update proposal' : 'Add proposal'}</Modal.Title>
                </Modal.Header>

                <Modal.Body>


                    <form onSubmit={submit} id="user_submit" className="my_form">

                        <div className="card">
                            <div className="card-header header-bg">
                                <h5 className="mb-0">Proposal Details</h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_proposal_name" className="form-label">
                                                Proposal Name
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="tpros_proposal_name"
                                                id="tpros_proposal_name"
                                                value={formData.tpros_proposal_name || ""}
                                                onChange={inputChange}
                                                placeholder="Enter Proposal"
                                            />
                                            {errors?.tpros_proposal_name && (
                                                <div className="error text-danger">{errors.tpros_proposal_name}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_financial_year_id" className="form-label">
                                                Financial Year
                                            </label>

                                            <Select
                                                name="tpros_financial_year_id"
                                                options={financialYearOptionsWithCurrent}
                                                value={financialYearOptionsWithCurrent.find(
                                                    opt => opt.value === formData.tpros_financial_year_id
                                                )}
                                                // onChange={inputChange}
                                                onChange={handleFyChange}

                                                placeholder="Select Financial Year"
                                            />

                                            {errors?.tpros_financial_year_id && (
                                                <div className="error text-danger">{errors.tpros_financial_year_id}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_current_date" className="form-label">
                                                Current Date
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="tpros_current_date"
                                                id="tpros_current_date"
                                                value={formData.tpros_current_date || ""}
                                                onChange={inputChange}
                                                min={minDate}   // 👈 restrict start
                                                max={maxDate}   // 👈 restrict end
                                            />
                                            {errors?.tpros_current_date && (
                                                <div className="error text-danger">{errors.tpros_current_date}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_nature_of_the_project" className="form-label">
                                                Nature of the Project
                                            </label>
                                            <select
                                                className="form-control"
                                                name="tpros_nature_of_the_project"
                                                id="tpros_nature_of_the_project"
                                                value={formData.tpros_nature_of_the_project || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select Nature of Project</option>
                                                <option value="Ongoing project">Ongoing project</option>
                                                <option value="Other than Ongoing project">Other than Ongoing project</option>
                                            </select>
                                            {errors?.tpros_nature_of_the_project && (
                                                <div className="error text-danger">{errors.tpros_nature_of_the_project}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_project_type" className="form-label">
                                                Type of Project
                                            </label>
                                            <select
                                                className="form-control"
                                                name="tpros_project_type"
                                                id="tpros_project_type"
                                                value={formData.tpros_project_type || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Type of Project</option>
                                                <option value="social_development">Social Development Project</option>
                                                <option value="infrastructure_development">Infrastructure Development Project</option>
                                                <option value="service_oriented_yearlong">Service Oriented Yearlong Project</option>

                                            </select>
                                            {errors?.tpros_project_type && (
                                                <div className="error text-danger">{errors.tpros_project_type}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_ngo_engagement" className="form-label">
                                                NGO engagement for implementation
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="tpros_ngo_engagement"
                                                id="tpros_ngo_engagement"
                                                value={formData.tpros_ngo_engagement || ""}
                                                onChange={inputChange}
                                                placeholder="Enter NGO engagement for implementation"
                                            />
                                            {errors?.tpros_ngo_engagement && (
                                                <div className="error text-danger">{errors.tpros_ngo_engagement}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_description" className="form-label">
                                                Description
                                            </label>
                                            <textarea
                                                className="form-control"
                                                name="tpros_description"
                                                id="tpros_description"
                                                value={formData.tpros_description || ""}
                                                onChange={inputChange}
                                                placeholder="Enter Description"
                                                rows={3}
                                            />
                                            {errors?.tpros_description && (
                                                <div className="error text-danger">{errors.tpros_description}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_base_project_year" className="form-label">
                                                Base project year
                                            </label>
                                            <Select
                                                name="base_project_year"
                                                options={baseProjectYearOptions}
                                                value={baseProjectYearOptions.find(
                                                    opt => opt.value === formData.base_project_year
                                                )}
                                                onChange={(selectedOption) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        base_project_year: selectedOption.value
                                                    }));
                                                }}
                                                placeholder="Select Base Project Year"
                                            />




                                            {/* <select
                                                className="form-control"
                                                name="tpros_base_project_year"
                                                id="tpros_base_project_year"
                                                value={formData.tpros_base_project_year || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select Year</option>
                                                <option value="2020">2020</option>
                                                <option value="2021">2021</option>
                                                <option value="2022">2022</option>
                                                <option value="2023">2023</option>
                                                <option value="2024">2024</option>
                                                <option value="2025">2025</option>
                                                <option value="2026">2026</option>
                                                <option value="2027">2027</option>
                                                <option value="2028">2028</option>
                                                <option value="2029">2029</option>
                                                <option value="2030">2030</option>

                                            </select> */}
                                            {errors?.tpros_base_project_year && (
                                                <div className="error text-danger">{errors.tpros_base_project_year}</div>
                                            )}
                                        </div>
                                    </div>


                                    {formData.tpros_nature_of_the_project === 'Ongoing project' && (

                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <label htmlFor="tpros_project_value" className="form-label">
                                                    Project Value in Case of Ongoing Project
                                                </label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="tpros_project_value"
                                                    id="tpros_project_value"
                                                    min="0"
                                                    value={formData.tpros_project_value || ""}
                                                    onChange={inputChange}
                                                    placeholder="Enter Project Value"
                                                />
                                                {errors?.tpros_project_value && (
                                                    <div className="error text-danger">{errors.tpros_project_value}</div>
                                                )}
                                            </div>
                                        </div>
                                    )}


                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label">
                                                Date of the program
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={formData.tpros_date_of_the_program}
                                                onChange={inputChange}
                                                name="tpros_date_of_the_program"
                                                id="tpros_date_of_the_program"
                                                placeholder=""
                                                min={minDate}   // 👈 restrict start
                                                max={maxDate}   // 👈 restrict end
                                            />
                                            {errors?.tpros_date_of_the_program && (
                                                <div className="error text-danger">
                                                    {errors?.tpros_date_of_the_program}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_start_date" className="form-label">
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={formData.tpros_start_date}
                                                onChange={handleStartDateChange}
                                                name="tpros_start_date"
                                                id="tpros_start_date"
                                                min={MIN_DATE}
                                            />

                                            {errors?.tpros_start_date && (
                                                <div className="error text-danger">
                                                    {errors?.tpros_start_date}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_end_date" className="form-label">End Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="tpros_end_date"
                                                id="tpros_end_date"
                                                value={formData.tpros_end_date || ""}
                                                onChange={handleEndDateChange}
                                                min={MIN_DATE}
                                            />

                                            {errors?.tpros_end_date && <div className="error text-danger">{errors.tpros_end_date}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_frequency" className="form-label">Frequency</label>
                                            <select
                                                className="form-control"
                                                name="tpros_frequency"
                                                id="tpros_frequency"
                                                value={formData.tpros_frequency || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select Frequency</option>
                                                <option value="One time">One time</option>
                                                <option value="Monthly">Monthly</option>
                                                <option value="Annual">Annual</option>
                                                <option value="Quarterly">Quarterly</option>
                                            </select>
                                            {errors?.tpros_frequency && <div className="error text-danger">{errors.tpros_frequency}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_state" className="form-label">State</label>
                                            <select
                                                className="form-control"
                                                name="tpros_state"
                                                id="tpros_state"
                                                value={formData.tpros_state || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select State</option>

                                                {stateOptions.map((state) => (
                                                    <option
                                                        key={state.value}
                                                        value={state.value}
                                                    >
                                                        {state.label}
                                                    </option>
                                                ))}
                                            </select>

                                            {errors?.tpros_state && (
                                                <div className="error text-danger">{errors.tpros_state}</div>
                                            )}

                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_district" className="form-label">District</label>
                                            <select
                                                className="form-control"
                                                name="tpros_district"
                                                id="tpros_district"
                                                value={formData.tpros_district || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select District</option>

                                                {districtsOptions.map((district) => (
                                                    <option
                                                        key={district.value}
                                                        value={district.value}
                                                    >
                                                        {district.label}
                                                    </option>
                                                ))}
                                            </select>

                                            {errors?.tpros_district && (
                                                <div className="error text-danger">
                                                    {errors.tpros_district}
                                                </div>
                                            )}

                                            {errors?.tpros_district && <div className="error text-danger">{errors.tpros_district}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_sub_district" className="form-label">
                                                Sub-district
                                            </label>
                                            <select
                                                className="form-control"
                                                name="tpros_sub_district"
                                                id="tpros_sub_district"
                                                value={formData.tpros_sub_district || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select Sub-district</option>
                                                {subDistrictsOptions.map((subDistrict) => (
                                                    <option key={subDistrict.value} value={subDistrict.value}>
                                                        {subDistrict.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors?.tpros_sub_district && (
                                                <div className="error text-danger">{errors.tpros_sub_district}</div>
                                            )}
                                        </div>
                                    </div>







                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_org_unit" className="form-label">Corporate / Plant / Division / Zone</label>
                                            <select
                                                className="form-control"
                                                name="tpros_org_unit"
                                                id="tpros_org_unit"
                                                value={formData.tpros_org_unit || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select Option</option>
                                                <option value="CFHO">CFHO</option>
                                                <option value="Plant">Plant</option>
                                                <option value="Marketing">Marketing</option>
                                                <option value="Retail">Retail</option>
                                            </select>
                                            {errors?.tpros_org_unit && <div className="error text-danger">{errors.tpros_org_unit}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_bu" className="form-label">BU</label>
                                            {/* <select
                                                className="form-control"
                                                name="tpros_bu"
                                                id="tpros_bu"
                                                value={formData.tpros_bu || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select BU</option>
                                                <option value="Corporate">Corporate</option>
                                                <option value="Fert">Fert</option>
                                                <option value="CPC">CPC</option>
                                                <option value="SSP">SSP</option>
                                                <option value="Bio">Bio</option>
                                                <option value="Retail">Retail</option>
                                                <option value="Marketing">Marketing</option>
                                            </select> */}


                                            <select
                                                className="form-control"
                                                name="tpros_bu"
                                                id="tpros_bu"
                                                value={formData.tpros_bu || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select BU</option>
                                                {businessAreaOptions.map((item, index) => (
                                                    <option key={index} value={item.value}>
                                                        {item.label}
                                                    </option>
                                                ))}                                            </select>
                                            {errors?.tpros_bu && <div className="error text-danger">{errors.tpros_bu}</div>}
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_thematic_area" className="form-label">
                                                Thematic Area
                                            </label>

                                            <select
                                                className="form-control"
                                                name="tpros_thematic_area"
                                                id="tpros_thematic_area"
                                                value={formData.tpros_thematic_area || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select Thematic Area</option>

                                                {thematicOptions.map((item) => (
                                                    <option key={item.value} value={item.value}>
                                                        {item.label}
                                                    </option>
                                                ))}
                                            </select>

                                            {errors?.tpros_thematic_area && (
                                                <div className="error text-danger">
                                                    {errors.tpros_thematic_area}
                                                </div>
                                            )}
                                        </div>
                                    </div>




                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_gl_code" className="form-label">GL Code</label>
                                            {/* <input
                                                type="text"
                                                className="form-control"
                                                name="tpros_gl_code"
                                                id="tpros_gl_code"
                                                value={formData.tpros_gl_code || ""}
                                                onChange={inputChange}
                                                placeholder="Enter GL Code"
                                            /> */}

                                            <select
                                                className="form-control"
                                                name="tpros_gl_code"
                                                id="tpros_gl_code"
                                                value={formData.tpros_gl_code || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select GL Code</option>

                                                {glCodeOptions.map((item) => (
                                                    <option key={item.value} value={item.value}>
                                                        {item.label}
                                                    </option>
                                                ))}
                                            </select>

                                            {errors?.tpros_gl_code && <div className="error text-danger">{errors.tpros_gl_code}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_profit_center" className="form-label">Profit Center</label>
                                            {/* <input
                                                type="text"
                                                className="form-control"
                                                name="tpros_profit_center"
                                                id="tpros_profit_center"
                                                value={formData.tpros_profit_center || ""}
                                                onChange={inputChange}
                                                placeholder="Enter Profit Center"
                                            /> */}


                                            <select
                                                className="form-control"
                                                name="tpros_profit_center"
                                                id="tpros_profit_center"
                                                value={formData.tpros_profit_center || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select Profit Center</option>

                                                {profitCenterOptions.map((item) => (
                                                    <option key={item.value} value={item.value}>
                                                        {item.label}
                                                    </option>
                                                ))}
                                            </select>



                                            {errors?.tpros_profit_center && <div className="error text-danger">{errors.tpros_profit_center}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_cost_center" className="form-label">Cost Center</label>

                                            {/* <input
                                                type="text"
                                                className="form-control"
                                                name="tpros_cost_center"
                                                id="tpros_cost_center"
                                                value={formData.tpros_cost_center || ""}
                                                onChange={inputChange}
                                                placeholder="Enter Cost Center"
                                            /> */}


                                            <select
                                                className="form-control"
                                                name="tpros_cost_center"
                                                id="tpros_cost_center"
                                                value={formData.tpros_cost_center || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select Cost Center</option>

                                                {costCenterOptions.map((item) => (
                                                    <option key={item.value} value={item.value}>
                                                        {item.label}
                                                    </option>
                                                ))}
                                            </select>




                                            {errors?.tpros_cost_center && <div className="error text-danger">{errors.tpros_cost_center}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="row align-items-end">
                                            <div className="col-4">
                                                <div className="mb-3"> <button
                                                    type="button"
                                                    className="btn btn-primary px-2 form-control"
                                                    onClick={() => setShowMapModal(true)}
                                                >
                                                    Pick Location
                                                </button>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="mb-3">
                                                    <label htmlFor="tpros_gps_latitude" className="form-label">GPS Latitude</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="tpros_gps_latitude"
                                                        id="tpros_gps_latitude"
                                                        value={formData.tpros_gps_latitude || ""}
                                                        onChange={inputChange}
                                                        placeholder="Enter Latitude"
                                                    />
                                                    {errors?.tpros_gps_latitude && <div className="error text-danger">{errors.tpros_gps_latitude}</div>}
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="mb-3">
                                                    <label htmlFor="tpros_gps_longitude" className="form-label">GPS Longitude</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="tpros_gps_longitude"
                                                        id="tpros_gps_longitude"
                                                        value={formData.tpros_gps_longitude || ""}
                                                        onChange={inputChange}
                                                        placeholder="Enter Longitude"
                                                    />
                                                    {errors?.tpros_gps_longitude && <div className="error text-danger">{errors.tpros_gps_longitude}</div>}
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_schedule_seven" className="form-label">
                                                Schedule VII
                                            </label>
                                            <select
                                                className="form-control"
                                                name="tpros_schedule_seven"
                                                id="tpros_schedule_seven"
                                                value={formData.tpros_schedule_seven || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select Schedule VII</option>
                                                {scheduleSevenOptions.map((loc) => (
                                                    <option key={loc.value} value={loc.value}>
                                                        {loc.label}-{loc.line_item}-{loc.sub_activity}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors?.tpros_schedule_seven && (
                                                <div className="error text-danger">{errors.tpros_schedule_seven}</div>
                                            )}
                                        </div>
                                    </div>


                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_sdg" className="form-label">
                                                SDG
                                            </label>
                                            <select
                                                className="form-control"
                                                name="tpros_sdg"
                                                id="tpros_sdg"
                                                value={formData.tpros_sdg || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select SDG</option>
                                                {sdgOptions.map((loc) => (
                                                    <option key={loc.value} value={loc.value}>
                                                        {loc.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors?.tpros_sdg && (
                                                <div className="error text-danger">{errors.tpros_sdg}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_is_aspirational_district" className="form-label">
                                                Whether project falls under aspirational district
                                            </label>

                                            <select
                                                className="form-control"
                                                name="tpros_is_aspirational_district"
                                                id="tpros_is_aspirational_district"
                                                value={formData.tpros_is_aspirational_district || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select</option>
                                                <option value="yes">Yes</option>
                                                <option value="no">No</option>
                                            </select>

                                            {errors?.tpros_is_aspirational_district && (
                                                <div className="error text-danger">
                                                    {errors.tpros_is_aspirational_district}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_is_gromor_village" className="form-label">
                                                Whether project falls under Gromor village project
                                            </label>

                                            <select
                                                className="form-control"
                                                name="tpros_is_gromor_village"
                                                id="tpros_is_gromor_village"
                                                value={formData.tpros_is_gromor_village || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select</option>
                                                <option value="yes">Yes</option>
                                                <option value="no">No</option>
                                            </select>

                                            {errors?.tpros_is_gromor_village && (
                                                <div className="error text-danger">
                                                    {errors.tpros_is_gromor_village}
                                                </div>
                                            )}
                                        </div>
                                    </div>


                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_target_beneficiaries" className="form-label">Target Beneficiaries</label>
                                            <select
                                                className="form-control"
                                                name="tpros_target_beneficiaries"
                                                id="tpros_target_beneficiaries"
                                                value={formData.tpros_target_beneficiaries || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select Option</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Mixed">Mixed</option>
                                            </select>
                                            {errors?.tpros_target_beneficiaries && <div className="error text-danger">{errors.tpros_target_beneficiaries}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="male_beneficiaries" className="form-label">Male Beneficiaries Number</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="male_beneficiaries"
                                                id="male_beneficiaries"
                                                min="0"
                                                value={formData.male_beneficiaries || ""}
                                                onChange={inputChange}
                                            />
                                            {errors?.male_beneficiaries && <div className="error text-danger">{errors.male_beneficiaries}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="female_beneficiaries" className="form-label">Female Beneficiaries Number</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="female_beneficiaries"
                                                id="female_beneficiaries"
                                                min="0"
                                                value={formData.female_beneficiaries || ""}
                                                onChange={inputChange}
                                            />
                                            {errors?.female_beneficiaries && <div className="error text-danger">{errors.female_beneficiaries}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="mix_group_beneficiaries" className="form-label">
                                                Mix Group Beneficiaries Number
                                            </label>

                                            <input
                                                type="number"
                                                className="form-control"
                                                name="mix_group_beneficiaries"
                                                id="mix_group_beneficiaries"
                                                min="0"
                                                value={formData.mix_group_beneficiaries || ""}
                                                onChange={inputChange}
                                                placeholder="Enter number of mix group beneficiaries"
                                            />

                                            {errors?.mix_group_beneficiaries && (
                                                <div className="error text-danger">
                                                    {errors.mix_group_beneficiaries}
                                                </div>
                                            )}
                                        </div>
                                    </div>


                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_type_of_the_project" className="form-label">
                                                Project
                                            </label>

                                            <select
                                                className="form-control"
                                                name="tpros_type_of_the_project"
                                                id="tpros_type_of_the_project"
                                                value={formData.tpros_type_of_the_project || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select Project</option>

                                                {projectOptions.map((item) => (
                                                    <option key={item.value} value={item.value}>
                                                        {item.label}
                                                    </option>
                                                ))}
                                            </select>

                                            {errors?.tpros_type_of_the_project && (
                                                <div className="error text-danger">
                                                    {errors.tpros_type_of_the_project}
                                                </div>
                                            )}
                                        </div>
                                    </div>



                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_type_of_the_sub_project" className="form-label">
                                                Sub Project
                                            </label>

                                            <select
                                                className="form-control"
                                                name="tpros_type_of_the_sub_project"
                                                id="tpros_type_of_the_sub_project"
                                                value={formData.tpros_type_of_the_sub_project || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select Sub Project</option>

                                                {subProjectOptions.map((item) => (
                                                    <option key={item.value} value={item.value}>
                                                        {item.label}
                                                    </option>
                                                ))}
                                            </select>

                                            {errors?.tpros_type_of_the_sub_project && (
                                                <div className="error text-danger">
                                                    {errors.tpros_type_of_the_sub_project}
                                                </div>
                                            )}
                                        </div>
                                    </div>


                                    {/* <div className="col-md-4">
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">
                                            Approved line item of CSR budget of organization
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.tpros_approved_line_item}
                                            onChange={inputChange}
                                            name="tpros_approved_line_item"
                                            id="tpros_approved_line_item"
                                            placeholder="Enter Approved line item of CSR budget of organization"
                                        />
                                        {errors?.tpros_approved_line_item && (
                                            <div className="error text-danger">
                                                {errors?.tpros_approved_line_item}
                                            </div>
                                        )}
                                    </div>
                                </div> */}

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label">
                                                Allocated budget for the approved line item from board
                                            </label>
                                            <input
                                                type="number" min={1}
                                                className="form-control"
                                                value={formData.tpros_allocate_budget_for_approved_line_item}
                                                onChange={inputChange}
                                                name="tpros_allocate_budget_for_approved_line_item"
                                                id="tpros_allocate_budget_for_approved_line_item"
                                                placeholder="Enter Allocated budget for the approved line item from board"
                                            />
                                            {errors?.tpros_allocate_budget_for_approved_line_item && (
                                                <div className="error text-danger">
                                                    {errors?.tpros_allocate_budget_for_approved_line_item}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label">
                                                Utilized till date
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={formData.tpros_utilized_till_date}
                                                onChange={inputChange} min={0}
                                                name="tpros_utilized_till_date"
                                                id="tpros_utilized_till_date"
                                                placeholder=""
                                            />
                                            {errors?.tpros_utilized_till_date && (
                                                <div className="error text-danger">
                                                    {errors?.tpros_utilized_till_date}
                                                </div>
                                            )}
                                        </div>
                                    </div>


                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="email" className="form-label">
                                                Project Budget
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={formData.tpros_project_budget}
                                                onChange={inputChange}
                                                name="tpros_project_budget"
                                                id="tpros_project_budget"
                                                placeholder="Enter Project value " min={1}
                                            />
                                            {errors?.tpros_project_budget && (
                                                <div className="error text-danger">
                                                    {errors?.tpros_project_budget}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_implementation_by" className="form-label">
                                                Implementation by
                                            </label>

                                            <select
                                                className="form-control"
                                                name="tpros_implementation_by"
                                                id="tpros_implementation_by"
                                                value={formData.tpros_implementation_by || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select Implementation Type</option>
                                                <option value="Directly by company">Directly by company</option>
                                                <option value="NGO">NGO</option>
                                                <option value="Trust">Trust</option>
                                                <option value="Section 25 company">Section 25 company</option>
                                                <option value="Service providers (Contractors)">
                                                    Service providers (Contractors)
                                                </option>
                                            </select>

                                            {errors?.tpros_ngo_engagement && (
                                                <div className="error text-danger">
                                                    {errors.tpros_ngo_engagement}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_implementation_partner_name" className="form-label">
                                                Name of the Implementation Partner
                                            </label>

                                            <input
                                                type="text"
                                                className="form-control"
                                                name="tpros_implementation_partner_name"
                                                id="tpros_implementation_partner_name"
                                                value={formData.tpros_implementation_partner_name || ""}
                                                onChange={inputChange}
                                                placeholder="Enter implementation partner name"
                                            />

                                            {errors?.tpros_implementation_partner_name && (
                                                <div className="error text-danger">
                                                    {errors.tpros_implementation_partner_name}
                                                </div>
                                            )}
                                        </div>
                                    </div>


                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_ngo_compliance_check" className="form-label">
                                                NGO Compliance Check
                                            </label>
                                            <select
                                                className="form-control"
                                                name="tpros_ngo_compliance_check"
                                                id="tpros_ngo_compliance_check"
                                                value={formData.tpros_ngo_compliance_check || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select Option</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                            {errors?.tpros_ngo_compliance_check && (
                                                <div className="error text-danger">{errors.tpros_ngo_compliance_check}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_vendor_compliance_check" className="form-label">
                                                Vendor Compliance Check
                                            </label>
                                            <select
                                                className="form-control"
                                                name="tpros_vendor_compliance_check"
                                                id="tpros_vendor_compliance_check"
                                                value={formData.tpros_vendor_compliance_check || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select Option</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                            {errors?.tpros_vendor_compliance_check && (
                                                <div className="error text-danger">{errors.tpros_vendor_compliance_check}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_program_background" className="form-label">
                                                Background of the Program
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="tpros_program_background"
                                                id="tpros_program_background"
                                                value={formData.tpros_program_background || ""}
                                                onChange={inputChange}
                                                placeholder="Enter background of the program"
                                            />
                                            {errors?.tpros_program_background && (
                                                <div className="error text-danger">{errors.tpros_program_background}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_baseline_data_information" className="form-label">
                                                Baseline Data Information
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="tpros_baseline_data_information"
                                                id="tpros_baseline_data_information"
                                                value={formData.tpros_baseline_data_information || ""}
                                                onChange={inputChange}
                                                placeholder="Enter baseline data information"
                                            />
                                            {errors?.tpros_baseline_data_information && (
                                                <div className="error text-danger">{errors.tpros_baseline_data_information}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_proposal_details" className="form-label">
                                                Proposal Details
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="tpros_proposal_details"
                                                id="tpros_proposal_details"
                                                value={formData.tpros_proposal_details || ""}
                                                onChange={inputChange}
                                                placeholder="Enter proposal details"
                                            />
                                            {errors?.tpros_proposal_details && (
                                                <div className="error text-danger">{errors.tpros_proposal_details}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_govt_scheme_linkage" className="form-label">
                                                Linkage / Association / Supplementation with any Government Scheme
                                            </label>
                                            <select
                                                className="form-control"
                                                name="tpros_govt_scheme_linkage"
                                                id="tpros_govt_scheme_linkage"
                                                value={formData.tpros_govt_scheme_linkage || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select Option</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                            {errors?.tpros_govt_scheme_linkage && (
                                                <div className="error text-danger">{errors.tpros_govt_scheme_linkage}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_stakeholder_request_level" className="form-label">
                                                Stakeholder Request Level
                                            </label>
                                            <select
                                                className="form-control"
                                                name="tpros_stakeholder_request_level"
                                                id="tpros_stakeholder_request_level"
                                                value={formData.tpros_stakeholder_request_level || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select Option</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                                <option value="Document Upload">Document Upload</option>
                                            </select>
                                            {errors?.tpros_stakeholder_request_level && (
                                                <div className="error text-danger">{errors.tpros_stakeholder_request_level}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_government_approval" className="form-label">
                                                Approval from Concerned Government Authorities
                                            </label>
                                            <select
                                                className="form-control"
                                                name="tpros_government_approval"
                                                id="tpros_government_approval"
                                                value={formData.tpros_government_approval || ""}
                                                onChange={inputChange}
                                            >
                                                <option value="">Select Option</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                                <option value="Document Upload">Document Upload</option>
                                            </select>
                                            {errors?.tpros_government_approval && (
                                                <div className="error text-danger">{errors.tpros_government_approval}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_program_objective" className="form-label">
                                                Objective of the Program(Multiple Object)
                                            </label>

                                            <Select
                                                name="tpros_program_objective"
                                                options={[
                                                    { label: "Objective1", value: "Objective1" },
                                                    { label: "Objective2", value: "Objective2" },
                                                ]}
                                                value={[
                                                    { label: "Objective1", value: "Objective1" },
                                                    { label: "Objective2", value: "Objective2" },
                                                ].filter(opt =>
                                                    (formData.tpros_program_objective || []).includes(opt.value)
                                                )}
                                                onChange={(selectedOptions) =>
                                                    inputChange(selectedOptions, { name: "tpros_program_objective" })
                                                }
                                                placeholder="Select Objective(s)"
                                                isMulti
                                            />


                                            {errors?.tpros_program_objective && (
                                                <div className="error text-danger">{errors.tpros_program_objective}</div>
                                            )}
                                        </div>
                                    </div>


                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_activities_planned" className="form-label">
                                                Activities Planned
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="tpros_activities_planned"
                                                id="tpros_activities_planned"
                                                value={formData.tpros_activities_planned || ""}
                                                onChange={inputChange}
                                                placeholder="Enter activities planned"
                                            />
                                            {errors?.tpros_activities_planned && (
                                                <div className="error text-danger">{errors.tpros_activities_planned}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_expected_outcome" className="form-label">
                                                Expected Outcome of the Project
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="tpros_expected_outcome"
                                                id="tpros_expected_outcome"
                                                value={formData.tpros_expected_outcome || ""}
                                                onChange={inputChange}
                                                placeholder="Enter expected outcome"
                                            />
                                            {errors?.tpros_expected_outcome && (
                                                <div className="error text-danger">{errors.tpros_expected_outcome}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_project_uniqueness" className="form-label">
                                                Uniqueness of the Project / Best Practices
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="tpros_project_uniqueness"
                                                id="tpros_project_uniqueness"
                                                value={formData.tpros_project_uniqueness || ""}
                                                onChange={inputChange}
                                                placeholder="Enter uniqueness / best practices"
                                            />
                                            {errors?.tpros_project_uniqueness && (
                                                <div className="error text-danger">{errors.tpros_project_uniqueness}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_branding_communication" className="form-label">
                                                Branding and Communication
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="tpros_branding_communication"
                                                id="tpros_branding_communication"
                                                value={formData.tpros_branding_communication || ""}
                                                onChange={inputChange}
                                                placeholder="Enter branding and communication"
                                            />
                                            {errors?.tpros_branding_communication && (
                                                <div className="error text-danger">{errors.tpros_branding_communication}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_monitoring_scope" className="form-label">
                                                Scope for Midterm and End Term Monitoring
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="tpros_monitoring_scope"
                                                id="tpros_monitoring_scope"
                                                value={formData.tpros_monitoring_scope || ""}
                                                onChange={inputChange}
                                                placeholder="Enter monitoring scope"
                                            />
                                            {errors?.tpros_monitoring_scope && (
                                                <div className="error text-danger">{errors.tpros_monitoring_scope}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_budget_breakup" className="form-label">
                                                Budget Breakup
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="tpros_budget_breakup"
                                                id="tpros_budget_breakup" min={0}
                                                value={formData.tpros_budget_breakup || ""}
                                                onChange={inputChange}
                                                placeholder="Enter budget breakup"
                                            />
                                            {errors?.tpros_budget_breakup && (
                                                <div className="error text-danger">{errors.tpros_budget_breakup}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header header-bg d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Additional Information of Budget Details</h5>

                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    onClick={addRow}
                                >
                                    + Add More
                                </button>
                            </div>

                            <div className="card-body">

                                {/* ================= TABLE HEADER ================= */}
                                <div className="row fw-bold border-bottom pb-2 mb-2 text-center">
                                    <div className="col-md-2">Particular</div>
                                    <div className="col-md-2">Unit</div>
                                    <div className="col-md-1"> No of Units</div>
                                    <div className="col-md-2">Unit Cost</div>
                                    <div className="col-md-2">Total</div>
                                    <div className="col-md-1">GST(%)</div>
                                    <div className="col-md-1">Total incl GST</div>
                                    <div className="col-md-1">Action</div>
                                </div>

                                {budgetRows.map((row, index) => (
                                    <div className="row g-2 align-items-center mb-2" key={index}>

                                        {/* Particular */}
                                        <div className="col-md-2">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={row.tpros_particular}
                                                onChange={(e) =>
                                                    handleRowChange(index, "tpros_particular", e.target.value)
                                                }
                                                placeholder="Particular"
                                            />
                                        </div>

                                        {/* Unit */}
                                        <div className="col-md-2">
                                            <Select
                                                placeholder="Select Unit"
                                                style={{ width: "100%" }}
                                                value={row.tpros_unit || undefined}
                                                options={unitOptions}
                                                onChange={(value) =>
                                                    handleRowChange(index, "tpros_unit", value)
                                                }
                                            />
                                        </div>

                                        {/* No of Units */}
                                        <div className="col-md-1">
                                            <input
                                                type="number"
                                                className="form-control text-end"
                                                min="0"
                                                value={row.tpros_no_of_units}
                                                onChange={(e) =>
                                                    handleRowChange(index, "tpros_no_of_units", e.target.value)
                                                }
                                                placeholder="0"
                                            />
                                        </div>

                                        {/* Unit Cost */}
                                        <div className="col-md-2">
                                            <input
                                                type="number"
                                                className="form-control text-end"
                                                min="0"
                                                step="any"
                                                value={row.tpros_unit_cost}
                                                onChange={(e) =>
                                                    handleRowChange(index, "tpros_unit_cost", e.target.value)
                                                }
                                                placeholder="Cost"
                                            />
                                        </div>

                                        {/* Total */}
                                        <div className="col-md-2">
                                            <input
                                                type="number"
                                                className="form-control text-end bg-light"
                                                value={row.tpros_total_amount}
                                                readOnly
                                            />
                                        </div>

                                        {/* GST */}
                                        <div className="col-md-1">
                                            <div className="input-group">
                                                <input
                                                    type="number"
                                                    className="form-control text-end"
                                                    min="0"
                                                    max="100"
                                                    step="any"
                                                    value={row.tpros_gst_amount}
                                                    onChange={(e) => {
                                                        let val = Number(e.target.value);

                                                        // ✅ restrict 0-100
                                                        if (val > 100) val = 100;
                                                        if (val < 0) val = 0;

                                                        handleRowChange(index, "tpros_gst_amount", val);
                                                    }}
                                                    placeholder="GST"
                                                />
                                                {/* <span className="input-group-text">%</span> */}
                                            </div>
                                        </div>


                                        {/* Total Incl GST */}
                                        <div className="col-md-1">
                                            <input
                                                type="number"
                                                className="form-control text-end bg-light"
                                                value={row.tpros_total_incl_gst}
                                                readOnly
                                            />
                                        </div>

                                        {/* Delete Button */}
                                        <div className="col-md-1 text-center">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-danger"
                                                onClick={() => removeRow(index)}
                                            // disabled={budgetRows.length === 1}
                                            >
                                                Delete
                                            </button>
                                        </div>

                                    </div>
                                ))}
                                <div className="row mt-3 align-items-center">
                                    <div className="col-md-7"></div>
                                    <div className="col-md-2 text-end fw-bold">
                                        Grand Total :
                                    </div>
                                    <div className="col-md-2">
                                        <input
                                            type="number"
                                            className="form-control text-end fw-bold bg-light"
                                            value={grandTotal}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-md-1"></div>
                                </div>

                                {/* ================= ATTACHMENT SECTION ================= */}
                                <div className="row mt-4">
                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Attachment Documents
                                            <Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX">
                                                <InfoCircleOutlined style={{ color: "#1890ff", marginLeft: 6 }} />
                                            </Tooltip>
                                        </label>

                                        <div
                                            style={{
                                                width: "100%",
                                                maxHeight: "200px",
                                                overflowY: "auto",
                                                border: "1px solid #d9d9d9",
                                                padding: "12px",
                                                borderRadius: "6px",
                                                backgroundColor: "#fff",
                                            }}
                                        >
                                            <Upload
                                                fileList={fileLists?.tpros_attachment_documents || []}
                                                multiple
                                                beforeUpload={() => false}
                                                accept=".pdf,.doc,.docx,.xls,.xlsx"
                                                onChange={({ fileList }) => {
                                                    setFileLists(prev => ({
                                                        ...prev,
                                                        tpros_attachment_documents: fileList,
                                                    }));
                                                    inputChange("tpros_attachment_documents", fileList);
                                                }}
                                                showUploadList={{ showRemoveIcon: false }}
                                            >
                                                <Button icon={<UploadOutlined />}>
                                                    Choose File
                                                </Button>
                                            </Upload>
                                        </div>

                                        {errors?.tpros_attachment_documents && (
                                            <div className="error text-danger mt-2">
                                                {errors.tpros_attachment_documents}
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>




                        <div className="card">
                            <div className="card-header header-bg">
                                <h5 className="mb-0">Comparative statement of Vendors</h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    {/* Capex Cost */}
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_capex_cost" className="form-label">Capex Cost</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="tpros_capex_cost"
                                                id="tpros_capex_cost"
                                                min="0"
                                                value={formData.tpros_capex_cost || ""}
                                                onChange={inputChange}
                                                placeholder="Enter capex cost"
                                            />
                                            {errors?.tpros_capex_cost && <div className="error text-danger">{errors.tpros_capex_cost}</div>}
                                        </div>
                                    </div>

                                    {/* Opex Cost */}
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_opex_cost" className="form-label">Opex Cost</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="tpros_opex_cost"
                                                id="tpros_opex_cost"
                                                min="0"
                                                value={formData.tpros_opex_cost || ""}
                                                onChange={inputChange}
                                                placeholder="Enter opex cost"
                                            />
                                            {errors?.tpros_opex_cost && <div className="error text-danger">{errors.tpros_opex_cost}</div>}
                                        </div>
                                    </div>

                                    {/* Service Charges */}
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_service_charges" className="form-label">Service Charges (Management Cost)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="tpros_service_charges"
                                                id="tpros_service_charges"
                                                min="0"
                                                value={formData.tpros_service_charges || ""}
                                                onChange={inputChange}
                                                placeholder="Enter service charges"
                                            />
                                            {errors?.tpros_service_charges && <div className="error text-danger">{errors.tpros_service_charges}</div>}
                                        </div>
                                    </div>

                                    {/* Tax if Any */}
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_tax_details" className="form-label">Tax if Any (GST or Other)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="tpros_tax_details"
                                                id="tpros_tax_details"
                                                min="0"
                                                value={formData.tpros_tax_details || ""}
                                                onChange={inputChange}
                                                placeholder="Enter tax details"
                                            />
                                            {errors?.tpros_tax_details && <div className="error text-danger">{errors.tpros_tax_details}</div>}
                                        </div>
                                    </div>

                                    {/* Total Cost of Project */}
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_total_project_cost" className="form-label">Total Cost of Project</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="tpros_total_project_cost"
                                                id="tpros_total_project_cost"
                                                min="0"
                                                value={formData.tpros_total_project_cost || ""}
                                                onChange={inputChange}
                                                placeholder="Enter total project cost"
                                            />
                                            {errors?.tpros_total_project_cost && <div className="error text-danger">{errors.tpros_total_project_cost}</div>}
                                        </div>
                                    </div>

                                    {/* L1 Party as per Budget */}
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_l1_party_budget" className="form-label">L1 Party as per Budget</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="tpros_l1_party_budget"
                                                id="tpros_l1_party_budget"
                                                value={formData.tpros_l1_party_budget || ""}
                                                onChange={inputChange}
                                                placeholder="Enter L1 party name"
                                            />
                                            {errors?.tpros_l1_party_budget && <div className="error text-danger">{errors.tpros_l1_party_budget}</div>}
                                        </div>
                                    </div>

                                    {/* Recommended Party */}
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_recommended_party" className="form-label">
                                                Recommended Party for Project Implementation (L1/L2/L3)
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="tpros_recommended_party"
                                                id="tpros_recommended_party"
                                                value={formData.tpros_recommended_party || ""}
                                                onChange={inputChange}
                                                placeholder="Enter recommended party"
                                            />
                                            {errors?.tpros_recommended_party && <div className="error text-danger">{errors.tpros_recommended_party}</div>}
                                        </div>
                                    </div>

                                    {/* Justification for Other Than L1 */}
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_justification_other_than_l1" className="form-label">
                                                Justification for Other Than L1
                                            </label>
                                            <textarea
                                                className="form-control"
                                                name="tpros_justification_other_than_l1"
                                                id="tpros_justification_other_than_l1"
                                                rows="1"
                                                value={formData.tpros_justification_other_than_l1 || ""}
                                                onChange={inputChange}
                                                placeholder="Enter justification"
                                            />
                                            {errors?.tpros_justification_other_than_l1 && <div className="error text-danger">{errors.tpros_justification_other_than_l1}</div>}
                                        </div>
                                    </div>

                                    {/* Justification for Single Party */}
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_single_party_justification" className="form-label">
                                                Justification for Single Party Quotations, if Any
                                            </label>
                                            <textarea
                                                className="form-control"
                                                name="tpros_single_party_justification"
                                                id="tpros_single_party_justification"
                                                rows="1"
                                                value={formData.tpros_single_party_justification || ""}
                                                onChange={inputChange}
                                                placeholder="Enter justification"
                                            />
                                            {errors?.tpros_single_party_justification && <div className="error text-danger">{errors.tpros_single_party_justification}</div>}
                                        </div>
                                    </div>



                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tpros_remarks" className="form-label">
                                                Remarks
                                            </label>
                                            <textarea
                                                className="form-control"
                                                name="tpros_remarks"
                                                id="tpros_remarks"
                                                rows="1"
                                                value={formData.tpros_remarks || ""}
                                                onChange={inputChange}
                                                placeholder="Enter justification"
                                            />
                                            {errors?.tpros_remarks && <div className="error text-danger">{errors.tpros_remarks}</div>}
                                        </div>
                                    </div>
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






                    <Modal
                        show={showMapModal}
                        onHide={() => setShowMapModal(false)}
                        size="xl"
                        centered
                        onEntered={initializeMap}   // ⭐ REQUIRED
                        latitude={formData?.cen_lat}
                        longitude={formData?.cen_lng}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Location Preview</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div
                                ref={mapRef}
                                style={{ width: "100%", height: "450px" }}
                            />
                        </Modal.Body>
                    </Modal>
                </Modal.Body>
            </Modal >
        </>
    )
}
