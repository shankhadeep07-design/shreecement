import { Modal as AntdModal, Col, Input, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { toast, Toaster } from "react-hot-toast";
import Select from "react-select";
import * as Yup from "yup";
import { single_block_by_district_id_api } from "../../../services/Block-service";
import {
  createBudgeting,
  deleteBudgetingRowApi,
} from "../../../services/Budget-service";
import { currentFinancialYear } from "../../../Services/Master-service";
import { fetchDistrictsByStateIds, getSubMasterListByMasterSlugApi } from "../../../services/Master-service";
import {
  getActivityByFocusAreaId,
  getAllScheduleSevenApi,
  getAllSdgApi,
  getAllSubScheduleSevenApi,
  getSubActivityByFocusAreaId
} from "../../../services/PriorityAlignment-service";
import { getAllStateApi } from "../../../services/State-service";

const Schema = Yup.object({
  tbm_fy_id: Yup.string().required("Financial Year is required"),
  tbm_budget_list: Yup.array()
    .of(
      Yup.object({
        tbad_sch_vii_id: Yup.string().required("Schedule Seven is required"),
        tbad_focus_area_id: Yup.string().required("Focus Area is required"),
        tbad_activity_id: Yup.string().required("Activity is required"),
        tbad_sub_activity_id: Yup.string().required("Activity is required"),
        tbad_sdg_id: Yup.string().required("Activity is required"),

        tbad_amount: Yup.number()
          .typeError("Amount must be a number")
          .required("Proposed Budget is required"),
        tbad_description: Yup.string().required(
          "Brief Description is required",
        ),
        tbad_target_beneficiary: Yup.string().required(
          "Target Beneficiary Headcount is required",
        ),
        tbad_remarks: Yup.string().required("Remarks are required"),
      }),
    )
    .min(1, "At least one budget entry is required"),
});

export default function BudgetingAddUpdateModal({
  showModal,
  changeModalStatus,
  editData,
  fetchBudgets,
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
  const [businessAreas, setBusinessAreas] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
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


  const [formData, setFormData] = useState({
    tbm_id: null,
    tbm_type: "budget",
    tbm_fy_id: null,
    tbm_domain_id: null,
    tbm_plant_id: null,
    tbm_bu_id: null,
    tbm_state_id: null,
    tbm_district_id: null,
    tbm_block_id: null,
    tbm_gl_code: null,
    tbm_profit_center: null,
    tbm_nature_of_project: null,
    tbm_project_concise: null,
    tbm_project_duration: null,
    tbm_national_indicator_framework: null,
    tbm_total_budget_amount: 0,
    tbm_budget_list: [
      {
        tbad_id: null,
        tbad_type: "budget",
        tbad_sch_vii_id: null,
        tbad_focus_area_id: null,
        tbad_activity_id: null,
        tbad_sub_activity_id: null,
        tbad_sdg_id: null,
        tbad_factory_id: null,
        tbad_budget_type: "add",
        tbad_amount: "",
        tbad_description: "",
        tbad_target_beneficiary: "",
        tbad_remarks: "",
      },
    ],
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

  const handleChangeFY = (value) => {
    setFormData({ ...formData, tbm_fy_id: value });
  };
  const handleChangeDomain = (value) => {
    setFormData({ ...formData, tbm_domain_id: value });
  };

  const handleChangePlant = (value) => {
    setFormData({ ...formData, tbm_plant_id: value });
  };
  const handleChangeBU = (value) => {
    setFormData({ ...formData, tbm_bu_id: value });
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "tbm_state_id") {
      fetchDistrictsByStateIds(value).then((res) =>
        setDistricts(res?.data || []),
      );
    }

    if (name === "tbm_district_id") {
      single_block_by_district_id_api(value).then((res) =>
        setBlocks(res?.data || []),
      );
    }
  };

  const handleBudgetChange = (index, field, value) => {
    const updatedList = [...formData.tbm_budget_list];

    // Prevent duplicate activity selection
    if (field === "tbad_activity_id") {
      const duplicate = formData.tbm_budget_list.some(
        (item, i) => i !== index && item.tbad_activity_id === value,
      );
      if (duplicate) {
        toast.error("This activity is already selected in another row.");
        return;
      }
    }

    updatedList[index][field] = value;

    if (field === "tbad_sch_vii_id") {
      updatedList[index].tbad_focus_area_id = null;
      updatedList[index].tbad_activity_id = null;
      getAllSubScheduleSevenApi({
        schedule_id: value,
      })
        .then((res) => {
          setFocusArea((prev) => ({
            ...prev,
            [index]: res?.data || [],
          }));
        })
        .catch(() => toast.error("Failed to load Sub Schedules"));
    }

    if (field === "tbad_focus_area_id") {
      updatedList[index].tbad_activity_id = null;
      getActivityByFocusAreaId(value)
        .then((data) => {
          setActivitiesList((prev) => ({
            ...prev,
            [index]: data?.data || [],
          }));
        })
        .catch((error) => {
          toast.error(error?.response?.data?.message);
        });
    }

    if (field === "tbad_activity_id") {
      updatedList[index].tbad_sub_activity_id = null;
      getSubActivityByFocusAreaId(value)
        .then((data) => {
          setSubActivitiesList((prev) => ({
            ...prev,
            [index]: data?.data || [],
          }));
        })
        .catch((error) => {
          toast.error(error?.response?.data?.message);
        });
    }

    setFormData({ ...formData, tbm_budget_list: updatedList });
  };

  const addBudgetRow = () => {
    setFormData({
      ...formData,
      tbm_budget_list: [
        ...formData.tbm_budget_list,
        {
          tbad_id: null,
          tbad_type: "budget",
          tbad_sch_vii_id: null,
          tbad_focus_area_id: null,
          tbad_activity_id: null,
          tbad_sub_activity_id: null,
          tbad_sdg_id: null,
          tbad_factory_id: null,
          tbad_budget_type: "add",
          tbad_amount: "",
          tbad_description: "",
          tbad_target_beneficiary: "",
          tbad_remarks: "",
        },
      ],
    });
  };

  const removeBudgetRow = (index) => {
    AntdModal.confirm({
      title: "Are you sure you want to delete this budget row?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        const updatedList = formData.tbm_budget_list.filter(
          (_, i) => i !== index,
        );
        setFormData({ ...formData, tbm_budget_list: updatedList });
        setActivitiesList((prev) => {
          const newList = { ...prev };
          delete newList[index];
          return newList;
        });

        deleteRowFromDatabase(formData.tbm_budget_list[index].tbad_id);
      },
    });
  };

  const deleteRowFromDatabase = async (rowId) => {
    try {
      await deleteBudgetingRowApi({ tbad_id: rowId }); // 🔄 Await API
    } catch (error) {
      console.error("Delete API failed:", error);
      // Optionally, show error message here
    }
  };

  useEffect(() => {
    getAllStateApi().then((res) => setStateOptions(res?.data || []));
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
    setErrors({});
    if (editData) {
      setFormData(editData);
      if (editData.tbm_state_id) {
        fetchDistrictsByStateIds(editData.tbm_state_id).then((res) =>
          setDistricts(res?.data || []),
        );
      }

      if (editData.tbm_district_id) {
        single_block_by_district_id_api(editData.tbm_district_id).then((res) =>
          setBlocks(res?.data || []),
        );
      }
      const loadDataForRows = async () => {
        const activitiesMap = {};
        const famap = {};
        const subactivityMap = {};

        for (let i = 0; i < editData.tbm_budget_list.length; i++) {
          const row = editData.tbm_budget_list[i];
          if (row.tbad_sch_vii_id) {
            try {
              const faRes = await getAllSubScheduleSevenApi(
                row.tbad_sch_vii_id,
              );
              famap[i] = faRes?.data || [];
            } catch (error) {
              toast.error(error?.response?.data?.message);
            }
          }
          if (row.tbad_focus_area_id) {
            try {
              const actRes = await getActivityByFocusAreaId(
                row.tbad_focus_area_id,
              );
              activitiesMap[i] = actRes?.data || [];
            } catch (error) {
              toast.error(error?.response?.data?.message);
            }
          }

          if (row.tbad_activity_id) {
            try {
              const subactRes = await getSubActivityByFocusAreaId(
                row.tbad_activity_id,
              );
              subactivityMap[i] = subactRes?.data || [];
            } catch (error) {
              toast.error(error?.response?.data?.message);
            }
          }
        }
        setSubActivitiesList(subactivityMap);
        setFocusArea(famap);

        setActivitiesList(activitiesMap);
      };
      loadDataForRows();
    }
  }, [editData]);

  useEffect(() => {
    const total = formData.tbm_budget_list.reduce((sum, item) => {
      const num = parseFloat(item.tbad_amount);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
    setFormData((prev) => ({
      ...prev,
      tbm_total_budget_amount: total,
    }));
  }, [formData.tbm_budget_list]);

  useEffect(() => {
    getAllScheduleSevenApi()
      .then((data) => setScheduleSeven(data?.data || []))
      .catch((error) => toast.error(error?.response?.data?.message));

    getAllSdgApi()
      .then((data) => setSdg(data?.data || []))
      .catch((error) => toast.error(error?.response?.data?.message));
    getFinancialYear();

    // getFocusArea();
  }, []);

  const getFinancialYear = () => {
    currentFinancialYear()
      .then((data) => setFinancialYears(data?.data || []))
      .catch((error) => toast.error(error?.response?.data?.message));
  };

  // const getFocusArea = () => {
  //   getAllFocusAreaApi()
  //     .then((data) => setFocusArea(data?.data || []))
  //     .catch((error) => toast.error(error?.response?.data?.message));
  // };

  const submit = async (e) => {
    e.preventDefault();
    const isValid = await handleValidation(formData);
    if (!isValid) return;
    setLoading(true);
    createBudgeting(formData)
      .then((res) => {
        setLoading(false);
        if (res.status) {
          toast.success(res.message);
        } else {
          toast.error(res.message);
        }
        fetchBudgets(1, false);
        changeModalStatus(false);
      })
      .catch((error) => {
        fetchBudgets(1, false);
        toast.error(error?.response?.data?.message);
        setLoading(false);
      });
  };

  console.log("formData", formData);
  console.log("FocusArea", focusArea);

  const businessAreaOptions = businessAreas.map(item => ({
        label: item.tsml_sub_master_list_name,
        value: item.tsml_id,
    }));

  return (
    <Modal
      show={showModal}
      onHide={() => changeModalStatus(false)}
      size="xl"
      id="user_update_modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {editData ? "Update Budgeting" : "Add Budgeting"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Toaster position="top-center" toastOptions={{ duration: 2000 }} />
        <div className="overflow-y-auto"  style={{ height: "80vh" }}>
          <form onSubmit={submit} className="my_form">


            <div className="row">
              <div className="col-md-6 mb-6">
                {" "}
                {/* 12 / 4 = 3 → same as 6 in AntD */}
                <label>Financial Year</label>
                <Select
                  options={financialYears}
                  value={
                    financialYears.find((fy) => fy.value === formData.tbm_fy_id) ||
                    null
                  }
                  onChange={(e) => handleChangeFY(e.value)}
                />
                {errors?.tbm_fy_id && (
                  <div className="text-danger">{errors.tbm_fy_id}</div>
                )}
              </div>
              <div className="col-md-6 mb-6">
                {" "}
                {/* 12 / 4 = 3 → same as 6 in AntD */}
                <label>Domain Name</label>
                <Select
                  options={domainOptions}
                  value={
                    domainOptions.find(
                      (domain) => domain.value === formData.tbm_domain_id
                    ) || null
                  }
                  onChange={(e) => handleChangeDomain(e.value)}
                />
                {errors?.tbm_domain_id && (
                  <div className="text-danger">{errors.tbm_domain_id}</div>
                )}
              </div>
              <div className="col-md-6 mb-6">
                {" "}
                {/* 12 / 4 = 3 → same as 6 in AntD */}
                <label>Plant</label>
                <Select
                  options={plantOptions}
                  value={
                    plantOptions.find(
                      (plant) => plant.value === formData.tbm_plant_id
                    ) || null
                  }
                  onChange={(e) => handleChangePlant(e.value)}
                />
                {errors?.tbm_plant_id && (
                  <div className="text-danger">{errors.tbm_plant_id}</div>
                )}
              </div>
              <div className="col-md-6 mb-6">
                {" "}
                {/* 12 / 4 = 3 → same as 6 in AntD */}
                <label>BU</label>
                <Select
                  options={businessAreaOptions}
                  value={
                    businessAreaOptions.find(
                      (bu) => bu.value === formData.tbm_bu_id
                    ) || null
                  }
                  onChange={(e) => handleChangeBU(e.value)}
                />
                {errors?.tbm_bu_id && (
                  <div className="text-danger">{errors.tbm_bu_id}</div>
                )}
              </div>
              <div className="col-md-6 mb-6">
                {" "}
                {/* 12 / 4 = 3 → same as 6 in AntD */}
                <label>State</label>
                <Select
                  placeholder="Select State"
                  options={stateOptions}
                  value={
                    stateOptions.find((o) => o.value === formData.tbm_state_id) ||
                    null
                  }
                  onChange={(val) => handleChange("tbm_state_id", val.value)}
                />
                {errors?.tbm_state_id && (
                  <div className="text-danger">{errors.tbm_state_id}</div>
                )}
              </div>
              <div className="col-md-6 mb-6">
                <label>District</label>
                <Select
                  placeholder="Select District"
                  options={districts}
                  value={
                    districts.find((o) => o.value === formData.tbm_district_id) ||
                    null
                  }
                  onChange={(val) => handleChange("tbm_district_id", val.value)}
                />
                {errors?.tbm_district_id && (
                  <div className="text-danger">{errors.tbm_district_id}</div>
                )}
              </div>
              <div className="col-md-6 mb-6">
                <label>Sub District</label>
                <Select
                  placeholder="Sub-District"
                  options={blocks}
                  value={
                    blocks.find((o) => o.value === formData.tbm_block_id) || null
                  }
                  onChange={(val) => handleChange("tbm_block_id", val.value)}
                />
                {errors?.tbm_block_id && (
                  <div className="text-danger">{errors.tbm_block_id}</div>
                )}
              </div>
              <div className="col-md-6 mb-6">
                {" "}
                {/* 12 / 4 = 3 → same as 6 in AntD */}
                <label>GL Code</label>
                <Input className="form-control"
                  value={formData.tbm_gl_code}
                  onChange={(e) => handleChange("tbm_gl_code", e.target.value)}
                />
                {errors?.tbm_gl_code && (
                  <div className="text-danger">{errors.tbm_gl_code}</div>
                )}
              </div>
              <div className="col-md-6 mb-6">
                {" "}
                {/* 12 / 4 = 3 → same as 6 in AntD */}
                <label>Profit Center</label>
                <Input className="form-control"
                  value={formData.tbm_profit_center}
                  onChange={(e) =>
                    handleChange("tbm_profit_center", e.target.value)
                  }
                />
                {errors?.tbm_profit_center && (
                  <div className="text-danger">{errors.tbm_profit_center}</div>
                )}
              </div>
              <div className="col-md-6 mb-6">
                {" "}
                {/* 12 / 4 = 3 → same as 6 in AntD */}
                <label>Nature of project</label>
                <Input
                  value={formData.tbm_nature_of_project} className="form-control"
                  onChange={(e) =>
                    handleChange("tbm_nature_of_project", e.target.value)
                  }
                />
                {errors?.tbm_nature_of_project && (
                  <div className="text-danger">
                    {errors.tbm_nature_of_project}
                  </div>
                )}
              </div>
            </div>


            {formData.tbm_budget_list.map((item, index) => {
              console.log("focusArea", focusArea);

              return (
                <div key={index} className="border p-2 mb-3 border-2 rounded-2">
                  <div className="row">

                    <div className="col-md-4 mb-3">
                      <label>Schedule VII</label>
                      <Select
                        options={scheduleSeven.map((opt) => ({
                          ...opt,
                          isDisabled: formData.tbm_budget_list.some(
                            (row, i) => i !== index && row.tbad_sch_vii_id === opt.value
                          ),
                        }))}
                        value={
                          scheduleSeven.find(
                            ({ value }) => value == item.tbad_sch_vii_id
                          ) || null
                        }
                        onChange={(e) =>
                          handleBudgetChange(index, "tbad_sch_vii_id", e.value)
                        }
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label>Sub Schedule VII</label>
                      <Select
                        options={(focusArea[index] || []).filter(
                          (opt) =>
                            !formData.tbm_budget_list.some(
                              (row, i) =>
                                i !== index && row.tbad_focus_area_id === opt.value
                            )
                        )}
                        value={
                          (focusArea[index] || []).find(
                            ({ value }) => value == item.tbad_focus_area_id
                          ) || null
                        }
                        onChange={(e) =>
                          handleBudgetChange(index, "tbad_focus_area_id", e.value)
                        }
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label>Activity</label>
                      <Select
                        options={(activitiesList[index] || []).filter(
                          (opt) =>
                            !formData.tbm_budget_list.some(
                              (row, i) =>
                                i !== index && row.tbad_activity_id === opt.value
                            )
                        )}
                        value={
                          (activitiesList[index] || []).find(
                            ({ value }) => value == item.tbad_activity_id
                          ) || null
                        }
                        onChange={(e) =>
                          handleBudgetChange(index, "tbad_activity_id", e.value)
                        }
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label>Sub Activity</label>
                      <Select
                        options={(subactivitiesList[index] || []).filter(
                          (opt) =>
                            !formData.tbm_budget_list.some(
                              (row, i) =>
                                i !== index && row.tbad_sub_activity_id === opt.value
                            )
                        )}
                        value={
                          (subactivitiesList[index] || []).find(
                            ({ value }) => value == item.tbad_sub_activity_id
                          ) || null
                        }
                        onChange={(e) =>
                          handleBudgetChange(index, "tbad_sub_activity_id", e.value)
                        }
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label>SDG</label>
                      <Select
                        options={sdg.map((opt) => ({
                          ...opt,
                          isDisabled: formData.tbm_budget_list.some(
                            (row, i) => i !== index && row.tbad_sdg_id === opt.value
                          ),
                        }))}
                        value={
                          sdg.find(({ value }) => value == item.tbad_sdg_id) || null
                        }
                        onChange={(e) =>
                          handleBudgetChange(index, "tbad_sdg_id", e.value)
                        }
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label>Proposed Budget</label>
                      <input
                        type="number"
                        className="form-control"
                        value={item.tbad_amount}
                        onChange={(e) =>
                          handleBudgetChange(index, "tbad_amount", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-md-4">
                      <label>Brief Description</label>
                      <input
                        type="text"
                        className="form-control"
                        value={item.tbad_description}
                        onChange={(e) =>
                          handleBudgetChange(index, "tbad_description", e.target.value)
                        }
                      />
                    </div>
                      <div className="col-md-4">
                      <label>Target Beneficiary</label>
                      <input
                        type="number"
                        className="form-control"
                        value={item.tbad_target_beneficiary}
                        onChange={(e) =>
                          handleBudgetChange(index, "tbad_target_beneficiary", e.target.value)
                        }
                      />
                    </div>

                    <div className="col-md-4">
                      <label>Remarks</label>
                      <input
                        type="text"
                        className="form-control"
                        value={item.tbad_remarks}
                        onChange={(e) =>
                          handleBudgetChange(index, "tbad_remarks", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="row mt-2">


                  

                    <div className="col-md-3 ml-auto text-end">
                      {formData.tbm_budget_list.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeBudgetRow(index)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}


            <button
              type="button"
              className="btn btn-dark mb-3"
              onClick={addBudgetRow}
            >
              <i className="fa-solid fa-plus"></i> Add More
            </button>

            <div className="row">
              <div className="col-md-4 mb-3">
                {" "}
                {/* 12 / 4 = 3 → same as 6 in AntD */}
                <label>Project Concise</label>
                <Input
                className="form-control"
                  value={formData.tbm_project_concise}
                  onChange={(e) =>
                    handleChange("tbm_project_concise", e.target.value)
                  }
                />
                {errors?.tbm_project_concise && (
                  <div className="text-danger">{errors.tbm_project_concise}</div>
                )}
              </div>

              <div className="col-md-4 mb-3">
                {" "}
                {/* 12 / 4 = 3 → same as 6 in AntD */}
                <label>Project Duration</label>
                <Input className="form-control"
                  value={formData.tbm_project_duration}
                  onChange={(e) =>
                    handleChange("tbm_project_duration", e.target.value)
                  }
                />
                {errors?.tbm_project_duration && (
                  <div className="text-danger">{errors.tbm_project_duration}</div>
                )}
              </div>

              <div className="col-md-4 mb-3">
                {" "}
                {/* 12 / 4 = 3 → same as 6 in AntD */}
                <label>National indicator framework</label>
                <Input  className="form-control"
                  value={formData.tbm_national_indicator_framework}
                  onChange={(e) =>
                    handleChange(
                      "tbm_national_indicator_framework",
                      e.target.value
                    )
                  }
                />
                {errors?.tbm_national_indicator_framework && (
                  <div className="text-danger">
                    {errors.tbm_national_indicator_framework}
                  </div>
                )}
              </div>
            </div>

            <Row
              style={{
                background: "rgb(237 242 250)",
                border: "1px solid #d9d9d9",
                padding: "6px 15px",
                marginBottom: "16px",
                borderRadius: "4px",
              }}
            >
              <Col span={18}>
                <Typography.Text strong>Total Budget</Typography.Text>
              </Col>
              <Col span={6} style={{ textAlign: "right" }}>
                <Typography.Text
                  strong
                  style={{ fontSize: "16px", color: "#1890ff" }}
                >
                  ₹ {formData.tbm_total_budget_amount.toLocaleString("en-IN")}
                </Typography.Text>
              </Col>
            </Row>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Submit"}
            </button>
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
}
