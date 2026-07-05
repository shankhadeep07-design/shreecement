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
  fetchKpiByScheduleViiId,
  getAllState,
  getGramPanchayatsByBlockIds,
  getLocationByUnitId,
  getLocationByUnitIdForApprovedBudget,
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

const ProjectAddEditForm3 = ({ closeModal, reloadTable, details }) => {
  const [financialYears, setFinancialYears] = useState([]);
  const [units, setUnits] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

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

  const handleChange = useCallback((name, value) => {
    setFormData((prev) => {
      let updated = { ...prev, [name]: value };

      // 🔥 ADD HERE

      if (
        name === "tproj_unit_id" ||
        name === "tproj_approved_type" ||
        name === "tproj_fy_id"
      ) {
        if (updated.tproj_unit_id && updated.tproj_approved_type) {
          loadUnitLocation(
            updated.tproj_unit_id,
            updated.tproj_approved_type,
            updated.tproj_fy_id,
          );
        }
      }

      return updated;
    });
  }, []);

  const loadUnitLocation = async (unitId, approvedType, fyId) => {
    try {
      let res;

      if (approvedType === "other_then_approved_annual_budget") {
        res = await getLocationByUnitId(unitId);
      } else {
        res = await getLocationByUnitIdForApprovedBudget(unitId, fyId);
      }

      const data = res?.data?.data;
      if (!data) return;

      const distRes = await fetchDistrictsByStateIds([data.state_id]);
      const allDistricts = distRes?.data || [];

      const selectedDistrict = allDistricts.find(
        (d) => String(d.value) === String(data.district_id),
      );

      // ✅ NEW OPTIONS
      const newBlocks = data.blocks || [];
      const newGPs = data.grampanchayats || [];
      const newRVs = data.revenue_villages || [];
      const newVillages = data.villages || [];

      setDistricts(selectedDistrict ? [selectedDistrict] : []);
       setFormData
    } catch (err) {
      console.error(err);
      message.error("Failed to load unit location");
    }
  };

  useEffect(() => {
    currentFinancialYear().then((res) => setFinancialYears(res?.data || []));
    getUnitList().then((res) => setUnits(res?.data || []));
    getAllState().then((res) => setStates(res?.data || []));
  }, []);

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
        </Col>

        <Col span={12}>
          <label>
            Block <span style={{ color: "red" }}>*</span>
          </label>
          <Select mode="multiple" style={{ width: "100%" }} />
        </Col>

        <Col span={12}>
          <label>
            Gram Panchayat <span style={{ color: "red" }}>*</span>
          </label>
          <Select mode="multiple" style={{ width: "100%" }} />
        </Col>

        <Col span={12}>
          <label>
            Revenue Village <span style={{ color: "red" }}>*</span>
          </label>
          <Select mode="multiple" style={{ width: "100%" }} />
        </Col>

        <Col span={12}>
          <label>
            Village <span style={{ color: "red" }}>*</span>
          </label>
          <Select mode="multiple" style={{ width: "100%" }} />
        </Col>

        <Col span={12}>
          <label>
            Thematic Area(Schedule VII Item No){" "}
            <span style={{ color: "red" }}>*</span>
          </label>
          <ReactSelect options={[]} />
        </Col>

        <Col span={12}>
          <label>
            Sub-theme <span style={{ color: "red" }}>*</span>
          </label>
          <ReactSelect options={[]} />
        </Col>

        <Col span={12}>
          <label>
            SDG <span style={{ color: "red" }}>*</span>
          </label>
          <Select mode="multiple" style={{ width: "100%" }} />
        </Col>

        <Col span={12}>
          <label>
            Project Title <span style={{ color: "red" }}>*</span>
          </label>
          <Input />
        </Col>

        <Col span={12}>
          <label>
            Project Description <span style={{ color: "red" }}>*</span>
          </label>
          <Input.TextArea />
        </Col>

        <Col span={12}>
          <label>
            Project Start Date <span style={{ color: "red" }}>*</span>
          </label>
          <DatePicker style={{ width: "100%" }} />
        </Col>

        <Col span={12}>
          <label>
            Project End Date <span style={{ color: "red" }}>*</span>
          </label>
          <DatePicker style={{ width: "100%" }} />
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
          />
        </Col>

        <Col span={12}>
          <label>
            Project Budget Amount <span style={{ color: "red" }}>*</span>
          </label>
          <InputNumber style={{ width: "100%" }} min={0} />
          <div style={{ marginTop: 8 }}>
            <div>
              <b>Total Budget:</b> 0
            </div>
            <div>
              <b>Remaining Amount:</b> 0
            </div>
          </div>
        </Col>

        <Col span={12}>
          <label>
            Baseline Info <span style={{ color: "red" }}>*</span>
          </label>
          <Input />
        </Col>

        <Col span={12}>
          <label>
            Monitoring Method <span style={{ color: "red" }}>*</span>
          </label>
          <Input />
        </Col>

        <Col span={12}>
          <label>
            Target Beneficiary Group <span style={{ color: "red" }}>*</span>
          </label>
          <Input />
        </Col>

        <Col span={12}>
          <label>
            Implement Partner <span style={{ color: "red" }}>*</span>
          </label>
          <Select style={{ width: "100%" }} />
        </Col>

        <Col span={12}>
          <label>Remarks</label>
          <Input.TextArea style={{ width: "100%" }} />
        </Col>

        <Col span={12}>
          <label>
            KPI <span style={{ color: "red" }}>*</span>
          </label>
          <Select style={{ width: "100%" }} placeholder="Select KPI" />
          <Button type="dashed" style={{ marginTop: 8 }}>
            Add More KPI
          </Button>
        </Col>
      </Row>

      <Button type="primary" style={{ marginTop: 20 }}>
        Submit
      </Button>
    </Card>
  );
};

export default ProjectAddEditForm3;
