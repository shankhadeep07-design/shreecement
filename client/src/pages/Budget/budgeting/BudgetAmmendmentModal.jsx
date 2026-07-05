import { Modal as AntdModal, Col, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { toast, Toaster } from "react-hot-toast";
import Select from "react-select";
import * as Yup from "yup";
import {
  Form,
  Input,
  DatePicker,
  TimePicker,
  Upload,
  Button,
  Divider,
} from "antd";
import {
  createBudgetAmendment,

} from "../../../services/Budget-service";
import { currentFinancialYear } from "../../../Services/Master-service";
import { getAllStateApi } from "../../../services/State-service";
import { fetchDistrictsByStateIds } from "../../../services/Master-service";
import { blocks_by_district_id_api, single_block_by_district_id_api } from "../../../services/Block-service";
import {
  getActivityByFocusAreaId,
  getAllFocusAreaApi,
  getAllScheduleSevenApi,
  getAllSubScheduleSevenApi,
  getAllSdgApi,
  getSubActivityByFocusAreaId,
  getNationalIndicatorBySdg,
  getAllThemeApi,
} from "../../../services/PriorityAlignment-service";
import { get } from "jquery";

const Schema = Yup.object({
 
  tbam_domain_id: Yup.string().required("Domain is required"),
  tbam_plant_id: Yup.string().required("Plant is required"),
  tbam_bu_id: Yup.string().required("Business Unit is required"),
  tbam_sbu_id: Yup.string().required("SBU is required"),
  tbam_state_id: Yup.string().required("State is required"),
  tbam_nature_of_project: Yup.string().required("Nature of Project is required"),
  tbam_sub_schedule_vii_id: Yup.string().required("Sub Schedule VII is required"),
  tbam_schedule_vii_id: Yup.string().required("Schedule VII is required"),
  tbam_national_indicator_framework: Yup.string().required(
    "National Indicator is required",
  ),  
  tbam_thematic_area: Yup.string().required("Thematic Area is required"),

});

export default function BudgetAmmendmentModal({
  showModal,
  changeModalStatus,
  budgetId,
}) {
  const [scheduleSeven, setScheduleSeven] = useState([]);
  const [subScheduleList, setSubScheduleList] = useState({});
  const [focusArea, setFocusArea] = useState([]);
  const [activitiesList, setActivitiesList] = useState({});
  const [subactivitiesList, setSubActivitiesList] = useState({});
  const [financialYears, setFinancialYears] = useState([]);
  const [financialYear, setFinancialYear] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sdg, setSdg] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [nationalIndicator, setNationalIndicator] = useState([]);
  const [theme, setTheme] = useState([]);

  console.log("editData in modal:", budgetId);

  const [domainOptions, setdomainOptions] = useState([
    { label: "Coro Arogya (Healthcare)", value: "coro_arogya" },
    { label: "Coro Vidya (Education)", value: "coro_vidya" },
    {
      label: "Coro Vikas (Rural Development & Livelihood)",
      value: "coro_vikas",
    },
    { label: "Environmental Sustainability", value: "environment" },
    { label: "Others", value: "others" },
  ]);
  const plantOptions = [
    { label: "CFHO", value: "cfho" },
    { label: "Plant", value: "plant" },
    { label: "Marketing", value: "marketing" },
    { label: "Retail", value: "retail" },
  ];

  const buOptions = [
    { label: "Corporate", value: "corporate" },
    { label: "Fert", value: "fert" },
    { label: "CPC", value: "cpc" },
    { label: "SSP", value: "ssp" },
    { label: "Bio", value: "bio" },
    { label: "Retail", value: "retails" },
    { label: "Marketing", value: "marketing" },
  ];
  const [formData, setFormData] = useState({
    tbam_id: null,
    tbam_budget_master_id: "budget",
    tbam_domain_id: null,
    tbam_plant_id: null,
    tbam_bu_id: null,
    tbam_sbu_id: null,
    tbam_state_id: null,
    tbam_district_id: null,
    tbam_block_id: null,
    tbam_nature_of_project: null,
    tbam_schedule_vii_id: null,
    tbam_sub_schedule_vii_id: null,
    tbam_sdg_id: null,
    tbam_national_indicator_framework: null,
    tbam_thematic_area: null,

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

  const handleChangeDomain = (value) => {
    setFormData({ ...formData, tbam_domain_id: value });
  };

  const handleChangePlant = (value) => {
    setFormData({ ...formData, tbam_plant_id: value });
  };
  const handleChangeBU = (value) => {
    setFormData({ ...formData, tbam_bu_id: value });
  };

   const handleChangeSBU = (value) => {
    setFormData({ ...formData, tbam_sbu_id: value });
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "tbam_state_id") {
      fetchDistrictsByStateIds(value).then((res) =>
        setDistricts(res?.data || []),
      );
    }

    if (name === "tbam_district_id") {
      single_block_by_district_id_api(value).then((res) =>
        setBlocks(res?.data || []),
      );
    }
    if (name === "tbam_schedule_vii_id") {
      getAllSubScheduleSevenApi(value).then((res) =>
        setFocusArea(res?.data || []),
      );
    }

    if (name === "tbam_sdg_id") {
      getNationalIndicatorBySdg(value).then((res) =>
        setNationalIndicator(res?.data || []),
      );
    }
  };






  useEffect(() => {
    getAllStateApi().then((res) => setStateOptions(res?.data || []));
    getAllScheduleSevenApi()
      .then((data) => setScheduleSeven(data?.data || []))
      .catch((error) => toast.error(error?.response?.data?.message));

    getAllSdgApi()
      .then((data) => setSdg(data?.data || []))
      .catch((error) => toast.error(error?.response?.data?.message));

    getAllThemeApi()
      .then((data) => setTheme(data?.data || []))
      .catch((error) => toast.error(error?.response?.data?.message));


    // getFocusArea();
  }, []);


  const submit = async (e) => {
    e.preventDefault();
    const isValid = await handleValidation(formData);
    console.log("isValid", isValid);
    if (!isValid) return;
    setLoading(true);
    formData.tbam_budget_master_id = budgetId || null;

    createBudgetAmendment(formData)
      .then((res) => {
        setLoading(false);
        if (res.status) {
          toast.success(res.message);
        } else {
          toast.error(res.message);
        }
        
        changeModalStatus(false);
      })
      .catch((error) => {
        
        toast.error(error?.response?.data?.message);
        setLoading(false);
      });
  };

 

  return (
    <Modal
      show={showModal}
      onHide={() => changeModalStatus(false)}
      size="xl"
      id="user_update_modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{"Add Budget Ammendement"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
        <form onSubmit={submit} className="my_form">
          {/* Hidden Budget ID */}

          <div className="row">
            <div className="col-md-4 mb-6">
              {" "}
              {/* 12 / 4 = 3 → same as 6 in AntD */}
              <label>Domain Name</label>
              <Select
                options={domainOptions}
                value={
                  domainOptions.find(
                    (domain) => domain.value === formData.tbam_domain_id,
                  ) || null
                }
                onChange={(e) => handleChangeDomain(e.value)}
              />
              {errors?.tbam_domain_id && (
                <div className="text-danger">{errors.tbam_domain_id}</div>
              )}
            </div>

            <div className="col-md-4 mb-6">
              {" "}
              {/* 12 / 4 = 3 → same as 6 in AntD */}
              <label>Plant</label>
              <Select
                options={plantOptions}
                value={
                  plantOptions.find(
                    (plant) => plant.value === formData.tbam_plant_id,
                  ) || null
                }
                onChange={(e) => handleChangePlant(e.value)}
              />
              {errors?.tbam_plant_id && (
                <div className="text-danger">{errors.tbam_plant_id}</div>
              )}
            </div>
              <div className="col-md-4 mb-6">
              {" "}
              {/* 12 / 4 = 3 → same as 6 in AntD */}
              <label>Business</label>
              <Select
                options={buOptions}
                value={
                  buOptions.find((bu) => bu.value === formData.tbam_bu_id) ||
                  null
                }
                onChange={(e) => handleChangeBU(e.value)}
              />
              {errors?.tbam_bu_id && (
                <div className="text-danger">{errors.tbam_bu_id}</div>
              )}
            </div>
            <div className="col-md-4 mb-6">
              {" "}
              {/* 12 / 4 = 3 → same as 6 in AntD */}
              <label>SBU</label>
              <Select
                options={buOptions}
                value={
                  buOptions.find((bu) => bu.value === formData.tbam_sbu_id) ||
                  null
                }
                onChange={(e) => handleChangeSBU(e.value)}
              />
              {errors?.tbam_sbu_id && (
                <div className="text-danger">{errors.tbam_sbu_id}</div>
              )}
            </div>
              <div className="col-md-4 mb-6">
              {" "}
              {/* 12 / 4 = 3 → same as 6 in AntD */}
              <label>State</label>
              <Select
                placeholder="Select State"
                options={stateOptions}
                value={
                  stateOptions.find((o) => o.value === formData.tbam_state_id) ||
                  null
                }
                onChange={(val) => handleChange("tbam_state_id", val.value)}
              />
              {errors?.tbam_state_id && (
                <div className="text-danger">{errors.tbam_state_id}</div>
              )}
            </div>
             <div className="col-md-4 mb-6">
              <label>District</label>
              <Select
                placeholder="Select District"
                options={districts}
                value={
                  districts.find((o) => o.value === formData.tbam_district_id) ||
                  null
                }
                onChange={(val) => handleChange("tbam_district_id", val.value)}
              />
              {errors?.tbam_district_id && (
                <div className="text-danger">{errors.tbam_district_id}</div>
              )}
            </div>
             <div className="col-md-4 mb-6">
              <label>Sub District</label>
              <Select
                placeholder="Sub-District"
                options={blocks}
                value={
                  blocks.find((o) => o.value === formData.tbam_block_id) || null
                }
                onChange={(val) => handleChange("tbam_block_id", val.value)}
              />
              {errors?.tbam_block_id && (
                <div className="text-danger">{errors.tbam_block_id}</div>
              )}
            </div>
              <div className="col-md-4 mb-6">
              {" "}
              {/* 12 / 4 = 3 → same as 6 in AntD */}
              <label>Nature of project</label>
              <Input className="form-control"
                value={formData.tbam_nature_of_project}
                onChange={(e) =>
                  handleChange("tbam_nature_of_project", e.target.value)
                }
              />
              {errors?.tbam_nature_of_project && (
                <div className="text-danger">
                  {errors.tbam_nature_of_project}
                </div>
              )}
            </div>
             <div className="col-md-4  mb-6">
              {" "}
              {/* 12 / 4 = 3 → same as 6 in AntD */}
              <label>Schedule VII</label>
              <Select
                placeholder="Select Schedule VII"
                options={scheduleSeven}
                value={
                  scheduleSeven.find(
                    (o) => o.value === formData.tbam_schedule_vii_id,
                  ) || null
                }
                onChange={(val) =>
                  handleChange("tbam_schedule_vii_id", val.value)
                }
              />
              {errors?.tbm_schedule_seven_id && (
                <div className="text-danger">
                  {errors.tbam_schedule_vii_id}
                </div>
              )}
            </div>
              <div className="col-md-4  mb-6">
              <label>Sub Schedule VII</label>
              <Select
                placeholder="Select Sub Schedule VII"
                options={focusArea}
                value={
                  focusArea.find(
                    (o) => o.value === formData.tbam_sub_schedule_vii_id,
                  ) || null
                }
                onChange={(val) =>
                  handleChange("tbam_sub_schedule_vii_id", val.value)
                }
              />
              {errors?.tbam_sub_schedule_vii_id && (
                <div className="text-danger">{errors.tbam_sub_schedule_vii_id}</div>
              )}
            </div>

            <div className="col-md-4  mb-6">
              <label>SDG</label>
              <Select
                options={sdg}
                value={sdg.find(({ value }) => value == formData.tbam_sdg_id)}
                onChange={(e) => handleChange("tbam_sdg_id", e.value)}
              />
            </div>
             <div className="col-md-4 mb-6">
              <label>National Indicator</label>
              <Select
                placeholder="Select National Indicator"
                options={nationalIndicator}
                value={
                  nationalIndicator.find(
                    (o) => o.value === formData.tbam_national_indicator_framework,
                  ) || null
                }
                onChange={(val) =>
                  handleChange("tbam_national_indicator_framework", val.value)
                }
              />
              {errors?.tbam_national_indicator_framework && (
                <div className="text-danger">
                  {errors.tbam_national_indicator_framework}
                </div>
              )}
            </div>

            <div className="col-md-4 mb-6">
              <label>Thematic Area</label>
              <Select
                options={theme}
                value={theme.find(({ value }) => value == formData.tbam_thematic_area)}
                onChange={(e) => handleChange("tbam_thematic_area", e.value)}
              />
            </div>
          </div>

          
     


          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Submit"}
          </button>
        </form>
      </Modal.Body>
    </Modal>
  );
}
