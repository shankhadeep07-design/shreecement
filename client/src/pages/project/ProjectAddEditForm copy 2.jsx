import {
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Typography,
} from "antd";

import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import ReactSelect from "react-select";

// SERVICES
import {
  currentFinancialYear,
  fetchKpiByThemeId,
  getAllState,
  getGramPanchayatsByBlockIds,
  getLocationByUnitId,
  getNgoList,
  getRevenueVillageByGramPanchayatIds,
  getSdgList,
  getVillageByRevenueVillageIds,
} from "../../Services/Master-service";

import {
  fetchDistrictsByStateIds,
  getUnitList,
} from "../../services/Master-service";

import { fetchBudgetingAmountByLocationTheme } from "../../services/Budget-service";
import {
  getAllScheduleSevenApi,
  getSubScheduleSevenByScheduleSevenIdApi,
} from "../../services/PriorityAlignment-service";
import {
  createProject,
  projectDetailsApi,
} from "../../services/Project-service";

// VALIDATION
const noLeadingSpace = /^(?!\s)/;
const noEmoji = /^(?!.*[\p{Extended_Pictographic}]).*$/u;
const noSpecialStart = /^[a-zA-Z0-9]/;

const trimmedString = () =>
  Yup.string().transform((value) => (value ? value.trim() : ""));

const Schema = Yup.object({
  // 🔹 BASIC
  tproj_fy_id: Yup.string().required("Financial Year required"),
  tproj_unit_id: Yup.string().required("Unit required"),
  tproj_state_id: Yup.string().required("State required"),
  tproj_district_id: Yup.string().required("District required"),

  // 🔹 LOCATION (MULTI SELECT)
  tproj_block_id: Yup.array().min(1, "At least one Block required"),

  tproj_gram_panchayat_id: Yup.array().min(
    1,
    "At least one Gram Panchayat required",
  ),

  tproj_revenue_village_id: Yup.array().min(
    1,
    "At least one Revenue Village required",
  ),

  tproj_village_id: Yup.array().min(1, "At least one Village required"),

  // 🔹 THEME (DERIVED)
  tproj_schedule_id: Yup.mixed().required("Thematic Area required"),
  tproj_sub_schedule_id: Yup.mixed().required("Sub-theme required"),

  // 🔹 SDG
  tproj_sdg_id: Yup.array().min(1, "At least one SDG required"),

  sdgWeightages: Yup.object().test(
    "sdg-weightage-required",
    "Weightage is required for all selected SDGs",
    function (value) {
      const { tproj_sdg_id } = this.parent;

      if (!tproj_sdg_id || tproj_sdg_id.length < 2) return true;

      for (let id of tproj_sdg_id) {
        if (!value || !value[id]) {
          return this.createError({
            message: "All SDG weightages are required",
          });
        }
      }
      return true;
    },
  ),

  // 🔹 PROJECT DETAILS
  tproj_project_title: trimmedString()
    .required("Project title is required")
    .max(255, "Max 255 characters")
    .matches(noLeadingSpace, { message: "Cannot start with space" })
    .matches(noSpecialStart, { message: "Cannot start with special character" })
    .matches(noEmoji, { message: "Emoji not allowed" }),

  tproj_project_desc: trimmedString().required(
    "Project description is required",
  ),

  tproj_baseline_info: trimmedString().required(
    "Baseline information is required",
  ),

  tproj_monitoring_method: trimmedString().required(
    "Monitoring method is required",
  ),

  tproj_target_beneficiary_group: trimmedString().required(
    "Target beneficiary group is required",
  ),

  // 🔹 DATES
  tproj_project_start_date: Yup.string().required("Start date is required"),

  tproj_project_end_date: Yup.string()
    .required("End date is required")
    .test(
      "is-after-start",
      "End date cannot be before start date",
      function (value) {
        const { tproj_project_start_date } = this.parent;
        if (!tproj_project_start_date || !value) return true;
        return new Date(value) >= new Date(tproj_project_start_date);
      },
    ),

  // 🔹 FLAGS
  tproj_project_started_necessarily: Yup.mixed().required(
    "Project started necessarily is required",
  ),
  tproj_approved_type: Yup.string().required("Approved Type is required"),

  // 🔹 BUDGET
  tproj_budget_amount: Yup.number()
    .required("Budget amount is required")
    .min(1, "Must be greater than 0"),

  // 🔹 NGO
  tproj_implement_partner_id: Yup.mixed().required("NGO is required"),

  // 🔹 KPI
  kpis: Yup.array()
    .of(Yup.mixed().required("KPI is required"))
    .min(1, "At least one KPI is required"),
});

const ProjectAddEditForm = ({ closeModal, reloadTable, details }) => {
  const [lastPayload, setLastPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [financialYears, setFinancialYears] = useState([]);
  const [units, setUnits] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [gramPanchayats, setGramPanchayats] = useState([]);
  const [revenueVillages, setRevenueVillages] = useState([]);
  const [villages, setVillages] = useState([]);

  const [schedules, setSchedules] = useState([]);
  const [subSchedules, setSubSchedules] = useState([]);

  const [sdgList, setSdgList] = useState([]);
  const [ngoList, setNgoList] = useState([]);
  const [kpiList, setKpiList] = useState([]);

  const [sdgWeightages, setSdgWeightages] = useState({});
  const [projectDetails, setProjectDetails] = useState([]);
  const [budgetInfo, setBudgetInfo] = useState({
    total: 0,
    remaining: 0,
    project: 0,
  });

  const [formData, setFormData] = useState({
    tproj_fy_id: null,
    tproj_unit_id: null,
    tproj_state_id: null,
    tproj_district_id: null,

    tproj_block_id: [],
    tproj_gram_panchayat_id: [],
    tproj_revenue_village_id: [],
    tproj_village_id: [],

    tproj_schedule_id: null,
    tproj_sub_schedule_id: null,

    tproj_sdg_id: [],
    tproj_project_title: "",
    tproj_project_desc: "",
    tproj_project_start_date: null,
    tproj_project_end_date: null,
    tproj_budget_amount: 0,
    tproj_implement_partner_id: null,
    tproj_remarks: "",
    tproj_project_started_necessarily: null,
    tproj_approved_type: null,
    tproj_baseline_info: "",
    tproj_monitoring_method: "",
    tproj_target_beneficiary_group: "",

    kpis: [null],
  });

  const validateForm = async () => {
    try {
      await Schema.validate(
        { ...formData, sdgWeightages },
        { abortEarly: false },
      );
      setErrors({});
      return true;
    } catch (err) {
      console.log("Validation Errors:", err.inner);
      message.error("Please fill all required fields correctly.");
      const newErrors = {};
      err.inner.forEach((e) => {
        if (e.path?.includes("kpis")) {
          newErrors.kpis = e.message;
        } else if (e.path?.includes("sdgWeightages")) {
          newErrors.sdgWeightages = e.message;
        } else {
          newErrors[e.path] = e.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
  };

  const loadUnitLocation = async (unitId) => {
    try {
      const res = await getLocationByUnitId(unitId);
      const data = res?.data?.data;
      if (!data) return;

      const distRes = await fetchDistrictsByStateIds([data.state_id]);
      const allDistricts = distRes?.data || [];
      const selectedDistrict = allDistricts.find(
        (d) => String(d.value) === String(data.district_id),
      );

      setDistricts(selectedDistrict ? [selectedDistrict] : []);
      setBlocks(data.blocks || []);
      setGramPanchayats(data.grampanchayats || []);
      setRevenueVillages(data.revenue_villages || []);
      setVillages(data.villages || []);

      setFormData((prev) => ({
        ...prev,
        tproj_state_id: data.state_id,
        tproj_district_id: data.district_id,
      }));
    } catch (err) {
      console.error(err);
      message.error("Failed to load unit location");
    }
  };

  const loadSubSchedules = async (scheduleId) => {
    try {
      const res = await getSubScheduleSevenByScheduleSevenIdApi(scheduleId);
      setSubSchedules(res?.data || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to load sub schedules");
    }
  };

  // LOAD ON MOUNT
  useEffect(() => {
    currentFinancialYear().then((res) => setFinancialYears(res?.data || []));
    getUnitList().then((res) => setUnits(res?.data || []));
    getAllState().then((res) => setStates(res?.data || []));
    getAllScheduleSevenApi().then((res) => setSchedules(res?.data || []));
    getSdgList().then((res) => setSdgList(res?.data?.data || []));
    getNgoList().then((res) => setNgoList(res?.data?.data || []));
  }, []);

  const handleChange = useCallback(
    (name, value) => {
      setFormData((prev) => {
        let updated = { ...prev, [name]: value };

        if (name === "tproj_unit_id") {
          loadUnitLocation(value);
        }

        if (name === "tproj_schedule_id") {
          updated.tproj_sub_schedule_id = null;

          // Load Sub Schedules
          loadSubSchedules(value);
        }

        return updated;
      });
    },
    [schedules],
  );

  const handleKpiChange = (index, value) => {
    const updated = [...formData.kpis];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, kpis: updated }));
    setErrors((prev) => ({ ...prev, kpis: "" }));
  };

  const addMoreKpi = () => {
    setFormData((prev) => ({ ...prev, kpis: [...prev.kpis, null] }));
  };

  const removeKpi = (index) => {
    const updated = formData.kpis.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, kpis: updated }));
  };

  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      setLoading(true);

      if (formData.tproj_budget_amount < 0) {
        setErrors((prev) => ({
          ...prev,
          tproj_budget_amount: "Budget cannot be negative",
        }));
        setLoading(false);
        return;
      }

      const isEditMode = !!projectDetails?.tproj_id;
      const allowedBudget = isEditMode
        ? budgetInfo.remaining + budgetInfo.project
        : budgetInfo.remaining;

      if (formData.tproj_budget_amount > allowedBudget) {
        setErrors((prev) => ({
          ...prev,
          tproj_budget_amount: `Budget cannot exceed ${allowedBudget}`,
        }));
        setLoading(false);
        return;
      }

      const sdgPayload = formData.tproj_sdg_id.map((id) => ({
        sdg_id: id,
        sdg_weightage_value: String(sdgWeightages[id] || 0),
      }));

      const payload = {
        ...formData,
        tproj_sdg_json: sdgPayload,
        kpi_ids: formData.kpis.filter(Boolean),
      };

      await createProject(payload);
      message.success("Project saved successfully");
      closeModal();
      reloadTable();
    } catch (err) {
      console.error("Submission Error:", err);
      message.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save project",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchBudget = async (payload) => {
    try {
      const res = await fetchBudgetingAmountByLocationTheme(payload);
      const data = res || {};
      setBudgetInfo({
        total: data?.budget_amount || 0,
        remaining: data?.remaining_amount || 0,
        project: data?.project_amount || 0,
      });
    } catch (err) {
      console.log(err);
    }
  };

 useEffect(() => {
  // ✅ CASE 1: If "Other Than Approved Budget"
  if (formData.tproj_approved_type === "other_then_approved_annual_budget") {
    // Reset everything
    setBudgetInfo({
      total: 0,
      remaining: 0,
      project: 0,
    });

    setLastPayload(null); // important to allow refetch later
    return; // ❗ stop execution here (no API call)
  }

  // ✅ CASE 2: Under Approved Budget → Call API
  if (
    formData.tproj_fy_id &&
    formData.tproj_unit_id &&
    formData.tproj_state_id &&
    formData.tproj_district_id &&
    formData.tproj_schedule_id &&
    formData.tproj_sub_schedule_id &&
    formData.tproj_block_id.length > 0 &&
    formData.tproj_gram_panchayat_id.length > 0 &&
    formData.tproj_revenue_village_id.length > 0 &&
    formData.tproj_village_id.length > 0
  ) {
    const payload = {
      fy_id: formData.tproj_fy_id,
      unit_id: formData.tproj_unit_id,
      state_id: formData.tproj_state_id,
      district_id: formData.tproj_district_id,
      block_ids: formData.tproj_block_id,
      gram_panchayat_ids: formData.tproj_gram_panchayat_id,
      revenue_village_ids: formData.tproj_revenue_village_id,
      village_ids: formData.tproj_village_id,
      schedule_id: formData.tproj_schedule_id,        // ✅ FIXED key
      sub_schedule_id: formData.tproj_sub_schedule_id // ✅ FIXED key
    };

    if (JSON.stringify(payload) !== JSON.stringify(lastPayload)) {
      setLastPayload(payload);
      fetchBudget(payload);
    }
  }
}, [formData,lastPayload]);

  useEffect(() => {
    if (details?.tproj_id) {
      projectDetailsApi({ tproj_id: details?.tproj_id }).then(({ data }) => {
        setProjectDetails(data);
      });
    }
  }, [details?.tproj_id]);

  useEffect(() => {
    if (!projectDetails?.tproj_id) return;
    const data = projectDetails;

    const sdgWeights = {};
    data.tproj_sdg_id?.forEach((s) => {
      sdgWeights[s.sdg_id] = Number(s.sdg_weightage_value);
    });

    setSdgWeightages(sdgWeights);
    setFormData((prev) => ({
      ...prev,
      tproj_id: data.tproj_id,
      tproj_fy_id: data.tproj_fy_id ? String(data.tproj_fy_id) : null,
      tproj_unit_id: data.tproj_unit_id ? String(data.tproj_unit_id) : null,
      tproj_state_id: data.tproj_state_id ? String(data.tproj_state_id) : null,
      tproj_district_id: data.tproj_district_id
        ? String(data.tproj_district_id)
        : null,
      tproj_block_id: data.tproj_block_id || [],
      tproj_gram_panchayat_id: data.tproj_gram_panchayat_id || [],
      tproj_revenue_village_id: data.tproj_revenue_village_id || [],
      tproj_village_id: data.tproj_village_id || [],
      tproj_schedule_id: data.tproj_schedule_id
        ? String(data.tproj_schedule_id)
        : null,
      tproj_sub_schedule_id: data.tproj_sub_schedule_id
        ? String(data.tproj_sub_schedule_id)
        : null,
      tproj_sdg_id: data.tproj_sdg_id?.map((s) => s.sdg_id) || [],
      tproj_project_title: data.tproj_project_title,
      tproj_project_desc: data.tproj_project_desc,
      tproj_project_start_date: data.tproj_project_start_date,
      tproj_project_end_date: data.tproj_project_end_date,
      tproj_budget_amount: data.tproj_budget_amount,
      tproj_project_started_necessarily: Number(
        data.tproj_project_started_necessarily,
      ),
      tproj_approved_type: data.tproj_approved_type,
      tproj_baseline_info: data.tproj_baseline_info,
      tproj_monitoring_method: data.tproj_monitoring_method,
      tproj_target_beneficiary_group: data.tproj_target_beneficiary_group,
      tproj_implement_partner_id: data.tproj_implement_partner_id
        ? String(data.tproj_implement_partner_id)
        : null,
      tproj_remarks: data.tproj_remarks,
      kpis: data.kpis?.length ? data.kpis : [null],
    }));

    if (data.tproj_schedule_id) loadSubSchedules(data.tproj_schedule_id);

    // ✅ Load Dependent Master Lists in Edit Mode
    if (data.tproj_state_id) {
      fetchDistrictsByStateIds([data.tproj_state_id]).then((res) =>
        setDistricts(res?.data || []),
      );
    }
    if (data.tproj_unit_id) {
      getLocationByUnitId(data.tproj_unit_id).then((res) => {
        const unitData = res?.data?.data;
        if (unitData) {
          setBlocks(unitData.blocks || []);
        }
      });
    }
  }, [projectDetails]);

  useEffect(() => {
    const loadHierarchy = async () => {
      if (!projectDetails?.tproj_block_id?.length) return;

      let allGP = [];
      for (let blockId of projectDetails.tproj_block_id) {
        const res = await getGramPanchayatsByBlockIds(blockId);
        allGP = [...allGP, ...(res?.data || [])];
      }
      setGramPanchayats(allGP);

      let allRV = [];
      for (let gpId of projectDetails.tproj_gram_panchayat_id) {
        const res = await getRevenueVillageByGramPanchayatIds(gpId);
        allRV = [...allRV, ...(res?.data || [])];
      }
      setRevenueVillages(allRV);

      let allVill = [];
      for (let rvId of projectDetails.tproj_revenue_village_id) {
        const res = await getVillageByRevenueVillageIds(rvId);
        allVill = [...allVill, ...(res?.data || [])];
      }
      setVillages(allVill);
    };
    loadHierarchy();
  }, [projectDetails]);

  return (
    <Card>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <label>
            Approved Type <span style={{ color: "red" }}>*</span>
          </label>
          <Select
            style={{ width: "100%" }}
            options={[
              {
                label: "Under Approved Annual Budget",
                value: "under_approved_annual_budget",
              },
              {
                label: "Other Than Approved Annual Budget",
                value: "other_then_approved_annual_budget",
              },
            ]}
            value={formData.tproj_approved_type}
            onChange={(v) => handleChange("tproj_approved_type", v)}
          />
          {errors?.tproj_approved_type && (
            <div className="text-danger">{errors.tproj_approved_type}</div>
          )}
        </Col>

        <Col span={12}>
          <label>
            Financial Year <span style={{ color: "red" }}>*</span>
          </label>
          <Select
            style={{ width: "100%" }}
            options={financialYears}
            value={formData.tproj_fy_id}
            onChange={(v) => handleChange("tproj_fy_id", v)}
          />
          {errors?.tproj_fy_id && (
            <div className="text-danger">{errors.tproj_fy_id}</div>
          )}
        </Col>

        <Col span={12}>
          <label>
            Unit <span style={{ color: "red" }}>*</span>
          </label>
          <Select
            style={{ width: "100%" }}
            options={units}
            value={formData.tproj_unit_id}
            onChange={(v) => handleChange("tproj_unit_id", v)}
          />
          {errors?.tproj_unit_id && (
            <div className="text-danger">{errors.tproj_unit_id}</div>
          )}
        </Col>

        <Col span={12}>
          <label>
            State <span style={{ color: "red" }}>*</span>
          </label>
          <Select
            style={{ width: "100%" }}
            options={states}
            value={formData.tproj_state_id}
            onChange={(v) => handleChange("tproj_state_id", v)}
          />
          {errors?.tproj_state_id && (
            <div className="text-danger">{errors.tproj_state_id}</div>
          )}
        </Col>

        <Col span={12}>
          <label>
            District <span style={{ color: "red" }}>*</span>
          </label>
          <Select
            style={{ width: "100%" }}
            options={districts}
            value={formData.tproj_district_id}
            onChange={(v) => handleChange("tproj_district_id", v)}
          />
          {errors?.tproj_district_id && (
            <div className="text-danger">{errors.tproj_district_id}</div>
          )}
        </Col>

        <Col span={12}>
          <label>
            Block <span style={{ color: "red" }}>*</span>
          </label>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            options={blocks}
            value={formData.tproj_block_id}
            onChange={async (selectedBlocks) => {
              let allGP = [];
              for (let blockId of selectedBlocks) {
                const res = await getGramPanchayatsByBlockIds(blockId);
                allGP = [...allGP, ...(res?.data || [])];
              }
              const uniqueGP = Array.from(
                new Map(allGP.map((item) => [item.value, item])).values(),
              );
              setGramPanchayats(uniqueGP);
              setRevenueVillages([]);
              setVillages([]);
              setFormData((prev) => ({
                ...prev,
                tproj_block_id: selectedBlocks,
                tproj_gram_panchayat_id: [],
                tproj_revenue_village_id: [],
                tproj_village_id: [],
              }));
            }}
          />
          {errors?.tproj_block_id && (
            <div className="text-danger">{errors.tproj_block_id}</div>
          )}
        </Col>

        <Col span={12}>
          <label>
            Gram Panchayat <span style={{ color: "red" }}>*</span>
          </label>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            options={gramPanchayats}
            value={formData.tproj_gram_panchayat_id}
            onChange={async (selectedGPs) => {
              let allRV = [];
              for (let gpId of selectedGPs) {
                const res = await getRevenueVillageByGramPanchayatIds(gpId);
                allRV = [...allRV, ...(res?.data || [])];
              }
              const uniqueRV = Array.from(
                new Map(allRV.map((item) => [item.value, item])).values(),
              );
              setRevenueVillages(uniqueRV);
              setVillages([]);
              setFormData((prev) => ({
                ...prev,
                tproj_gram_panchayat_id: selectedGPs,
                tproj_revenue_village_id: [],
                tproj_village_id: [],
              }));
            }}
          />
          {errors?.tproj_gram_panchayat_id && (
            <div className="text-danger">{errors.tproj_gram_panchayat_id}</div>
          )}
        </Col>

        <Col span={12}>
          <label>
            Revenue Village <span style={{ color: "red" }}>*</span>
          </label>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            options={revenueVillages}
            value={formData.tproj_revenue_village_id}
            onChange={async (selectedRV) => {
              let allVill = [];
              for (let rvId of selectedRV) {
                const res = await getVillageByRevenueVillageIds(rvId);
                allVill = [...allVill, ...(res?.data || [])];
              }
              const uniqueVill = Array.from(
                new Map(allVill.map((item) => [item.value, item])).values(),
              );
              setVillages(uniqueVill);
              setFormData((prev) => ({
                ...prev,
                tproj_revenue_village_id: selectedRV,
                tproj_village_id: [],
              }));
            }}
          />
          {errors?.tproj_revenue_village_id && (
            <div className="text-danger">{errors.tproj_revenue_village_id}</div>
          )}
        </Col>

        <Col span={12}>
          <label>
            Village <span style={{ color: "red" }}>*</span>
          </label>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            options={villages}
            value={formData.tproj_village_id}
            onChange={(v) => handleChange("tproj_village_id", v)}
          />
          {errors?.tproj_village_id && (
            <div className="text-danger">{errors.tproj_village_id}</div>
          )}
        </Col>

        {/* THEME REMOVED - SCHEDULE & SUB-SCHEDULE AT SAME LEVEL */}
        <Col span={12}>
          <label>
            Thematic Area(Schedule VII Item No){" "}
            <span style={{ color: "red" }}>*</span>
          </label>
          <ReactSelect
            options={schedules}
            value={
              schedules.find((o) => o.value === formData.tproj_schedule_id) ||
              null
            }
            onChange={(e) => handleChange("tproj_schedule_id", e.value)}
          />
          {errors?.tproj_schedule_id && (
            <div className="text-danger">{errors.tproj_schedule_id}</div>
          )}
        </Col>

        <Col span={12}>
          <label>
            Sub-theme <span style={{ color: "red" }}>*</span>
          </label>
          <ReactSelect
            options={subSchedules}
            value={
              subSchedules.find(
                (o) => o.value === formData.tproj_sub_schedule_id,
              ) || null
            }
            onChange={(e) => handleChange("tproj_sub_schedule_id", e.value)}
          />
          {errors?.tproj_sub_schedule_id && (
            <div className="text-danger">{errors.tproj_sub_schedule_id}</div>
          )}
        </Col>

        <Col span={12}>
          <label>
            SDG <span style={{ color: "red" }}>*</span>
          </label>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            options={sdgList}
            value={formData.tproj_sdg_id}
            onChange={(value) => {
              handleChange("tproj_sdg_id", value);
              setSdgWeightages((prev) => {
                const updated = { ...prev };
                Object.keys(updated).forEach((key) => {
                  if (!value.includes(Number(key))) delete updated[key];
                });
                return updated;
              });
            }}
          />
          {errors?.tproj_sdg_id && (
            <div className="text-danger">{errors.tproj_sdg_id}</div>
          )}
        </Col>

        {formData.tproj_sdg_id.length >= 2 && (
          <Col span={24}>
            <Typography.Title level={5}>SDG Weightage</Typography.Title>
            {formData.tproj_sdg_id.map((sdgId) => {
              const sdg = sdgList.find((s) => s.value === sdgId);
              return (
                <Row key={sdgId} gutter={10} style={{ marginBottom: 8 }}>
                  <Col span={12}>
                    <b>{sdg?.label}</b>
                  </Col>
                  <Col span={12}>
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Enter Weightage"
                      value={sdgWeightages[sdgId] || ""}
                      onChange={(value) =>
                        setSdgWeightages({ ...sdgWeightages, [sdgId]: value })
                      }
                    />
                  </Col>
                </Row>
              );
            })}
          </Col>
        )}

        <Col span={12}>
          <label>
            Project Title <span style={{ color: "red" }}>*</span>
          </label>
          <Input
            value={formData.tproj_project_title}
            onChange={(e) =>
              handleChange("tproj_project_title", e.target.value)
            }
          />
          {errors?.tproj_project_title && (
            <div className="text-danger">{errors.tproj_project_title}</div>
          )}
        </Col>

        <Col span={12}>
          <label>
            Project Description <span style={{ color: "red" }}>*</span>
          </label>
          <Input.TextArea
            value={formData.tproj_project_desc}
            onChange={(e) => handleChange("tproj_project_desc", e.target.value)}
          />
          {errors?.tproj_project_desc && (
            <div className="text-danger">{errors.tproj_project_desc}</div>
          )}
        </Col>

        <Col span={12}>
          <label>
            Project Start Date <span style={{ color: "red" }}>*</span>
          </label>
          <DatePicker
            style={{ width: "100%" }}
            value={
              formData.tproj_project_start_date
                ? dayjs(formData.tproj_project_start_date)
                : null
            }
            onChange={(d) =>
              handleChange("tproj_project_start_date", d?.format("YYYY-MM-DD"))
            }
          />
          {errors?.tproj_project_start_date && (
            <div className="text-danger">{errors.tproj_project_start_date}</div>
          )}
        </Col>

        <Col span={12}>
          <label>
            Project End Date <span style={{ color: "red" }}>*</span>
          </label>
          <DatePicker
            style={{ width: "100%" }}
            value={
              formData.tproj_project_end_date
                ? dayjs(formData.tproj_project_end_date)
                : null
            }
            disabledDate={(c) =>
              c && c.isBefore(dayjs(formData.tproj_project_start_date))
            }
            onChange={(d) =>
              handleChange("tproj_project_end_date", d?.format("YYYY-MM-DD"))
            }
          />
          {errors?.tproj_project_end_date && (
            <div className="text-danger">{errors.tproj_project_end_date}</div>
          )}
        </Col>

        <Col span={12}>
          <label>
            Project Started Necessarily <span style={{ color: "red" }}>*</span>
          </label>
          <Select
            style={{ width: "100%" }}
            options={[
              { label: "Quarter 1 (April - June)", value: 1 },
              { label: "Quarter 2 (July - September)", value: 2 },
              { label: "Quarter 3 (October - December)", value: 3 },
              { label: "Quarter 4 (January - March)", value: 4 },
            ]}
            value={formData.tproj_project_started_necessarily}
            onChange={(v) =>
              handleChange("tproj_project_started_necessarily", v)
            }
          />
          {errors?.tproj_project_started_necessarily && (
            <div className="text-danger">
              {errors.tproj_project_started_necessarily}
            </div>
          )}
        </Col>

        <Col span={12}>
          <label>
            Project Budget Amount <span style={{ color: "red" }}>*</span>
          </label>
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            value={formData.tproj_budget_amount}
            onChange={(v) => handleChange("tproj_budget_amount", v ?? 0)}
          />
          {errors?.tproj_budget_amount && (
            <div className="text-danger">{errors.tproj_budget_amount}</div>
          )}
          <div style={{ marginTop: 8 }}>
            <div>
              <b>Total Budget:</b> {budgetInfo.total}
            </div>
            <div>
              <b>Remaining Amount:</b> {budgetInfo.remaining}
            </div>
          </div>
        </Col>

        <Col span={12}>
          <label>
            Baseline Info <span style={{ color: "red" }}>*</span>
          </label>
          <Input
            value={formData.tproj_baseline_info}
            onChange={(e) =>
              handleChange("tproj_baseline_info", e.target.value)
            }
          />
          {errors?.tproj_baseline_info && (
            <div className="text-danger">{errors.tproj_baseline_info}</div>
          )}
        </Col>

        <Col span={12}>
          <label>
            Monitoring Method <span style={{ color: "red" }}>*</span>
          </label>
          <Input
            value={formData.tproj_monitoring_method}
            onChange={(e) =>
              handleChange("tproj_monitoring_method", e.target.value)
            }
          />
          {errors?.tproj_monitoring_method && (
            <div className="text-danger">{errors.tproj_monitoring_method}</div>
          )}
        </Col>

        <Col span={12}>
          <label>
            Target Beneficiary Group <span style={{ color: "red" }}>*</span>
          </label>
          <Input
            value={formData.tproj_target_beneficiary_group}
            onChange={(e) =>
              handleChange("tproj_target_beneficiary_group", e.target.value)
            }
          />
          {errors?.tproj_target_beneficiary_group && (
            <div className="text-danger">
              {errors.tproj_target_beneficiary_group}
            </div>
          )}
        </Col>

        <Col span={12}>
          <label>
            Implement Partner <span style={{ color: "red" }}>*</span>
          </label>
          <Select
            style={{ width: "100%" }}
            options={ngoList}
            value={formData.tproj_implement_partner_id}
            onChange={(v) => handleChange("tproj_implement_partner_id", v)}
          />
          {errors?.tproj_implement_partner_id && (
            <div className="text-danger">
              {errors.tproj_implement_partner_id}
            </div>
          )}
        </Col>

        <Col span={12}>
          <label>Remarks</label>
          <Input.TextArea
            style={{ width: "100%" }}
            value={formData.tproj_remarks}
            onChange={(e) => handleChange("tproj_remarks", e.target.value)}
          />
        </Col>

        <Col span={12}>
          <label>
            KPI <span style={{ color: "red" }}>*</span>
          </label>
          {formData.kpis.map((kpi, index) => {
            const selectedKpis = formData.kpis.filter(Boolean);
            const availableOptions = kpiList.filter(
              (item) =>
                !selectedKpis.includes(item.value) || item.value === kpi,
            );
            return (
              <div key={index} style={{ display: "flex", marginBottom: 8 }}>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Select KPI"
                  options={availableOptions}
                  value={kpi}
                  onChange={(value) => handleKpiChange(index, value)}
                />
                {index !== 0 && (
                  <Button
                    danger
                    style={{ marginLeft: 8 }}
                    onClick={() => removeKpi(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            );
          })}
          {errors?.kpis && <div className="text-danger">{errors.kpis}</div>}
          <Button type="dashed" onClick={addMoreKpi}>
            Add More KPI
          </Button>
        </Col>
      </Row>

      <Button
        type="primary"
        loading={loading}
        onClick={handleSubmit}
        style={{ marginTop: 20 }}
      >
        Submit
      </Button>
    </Card>
  );
};

export default ProjectAddEditForm;
