import { Input, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
import Select from "react-select";

import {
  currentFinancialYear,
  getLocationByUnitId,
} from "../../../Services/Master-service";
import {
  fetchDistrictsByStateIds,
  getUnitList,
} from "../../../services/Master-service";
import { getAllStateApi } from "../../../services/State-service";

import {
  getBlocksByDistrictIds,
  getGramPanchayatsByBlockIds,
  getRevenueVillageByGramPanchayatIds,
  getVillageByRevenueVillageIds,
} from "../../../services/Master-service";

import {
  getAllSubScheduleSevenApi,
  getAllThemeApi,
  getScheduleSevenByThemeIdApi,
  getSubScheduleSevenByScheduleSevenIdApi,
} from "../../../services/PriorityAlignment-service";

import * as Yup from "yup";
import { createBudgeting } from "../../../services/Budget-service";
const noLeadingSpace = /^(?!\s)/;
const noEmoji = /^(?!.*[\p{Extended_Pictographic}]).*$/u;
const noSpecialStart = /^[a-zA-Z0-9]/;

const trimmedString = () =>
  Yup.string().transform((value) => (value ? value.trim() : ""));

const Schema = Yup.object().shape({
  tbm_fy_id: Yup.string().required("Financial Year is required"),

  tbm_unit_id: Yup.string().required("Unit is required"),

  tbm_state_id: Yup.string().required("State is required"),

  tbm_district_id: Yup.string().required("District is required"),

  // tbm_block_id: Yup.string().required("Block is required"),

  // tbm_gram_panchayat_id: Yup.string().required("Gram Panchayat is required"),

  // tbm_revenue_village_id: Yup.string().required("Revenue Village is required"),

  // tbm_village_id: Yup.string().required("Village is required"),

  // tbm_village_type_id: Yup.string().required("Village type is required"),

  tbm_budget_list: Yup.array().of(
    Yup.object().shape({
      tbad_theme_id: Yup.string().required("Theme is required"),

      tbad_sch_vii_id: Yup.string().required("Thematic Area is required"),

      tbad_sub_theme: Yup.string().required("Sub-theme is required"),

      tbad_project_identified: Yup.string().required(
        "Project identified is required",
      ),

      tbad_description: trimmedString()
        .required("Description is required")
        .matches(noLeadingSpace, {
          message: "Cannot start with space",
          excludeEmptyString: true,
        })
        .matches(noSpecialStart, {
          message: "Cannot start with special character",
          excludeEmptyString: true,
        })
        .matches(noEmoji, {
          message: "Emoji not allowed",
          excludeEmptyString: true,
        }),

      tbad_amount: Yup.number()
        .typeError("Amount must be number")
        .required("Amount is required")
        .positive("Amount must be positive"),
    }),
  ),
});

export default function BudgetingAddUpdateModal({
  showModal,
  changeModalStatus,
  fetchBudgets,
  editData,
}) {
  const [financialYears, setFinancialYears] = useState([]);
  const [units, setUnits] = useState([]);
  const [themes, setThemes] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [gramPanchayats, setGramPanchayats] = useState([]);
  const [revenueVillages, setRevenueVillages] = useState([]);
  const [villages, setVillages] = useState([]);
  // const [villageTypes, setVillageTypes] = useState([]);

  // const [scheduleSeven, setScheduleSeven] = useState([]);
  const [scheduleSeven, setScheduleSeven] = useState({});
  const [focusArea, setFocusArea] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    tbm_id: null,
    tbm_fy_id: null,
    tbm_unit_id: null,
    tbm_state_id: null,
    tbm_district_id: null,
    // tbm_block_id: null,
    // tbm_gram_panchayat_id: null,
    // tbm_revenue_village_id: null,
    // tbm_village_id: null,
    // tbm_village_type_id: null,
    tbm_proposed_total_amount: "",

    tbm_budget_list: [
      {
        tbad_theme_id: null,
        tbad_sch_vii_id: null,
        tbad_sub_theme: null,
        tbad_project_identified: null,
        tbad_description: "",
        tbad_amount: "",
      },
    ],
  });

  const totalAmount = useMemo(() => {
    return formData.tbm_budget_list.reduce((sum, item) => {
      return sum + (Number(item.tbad_amount) || 0);
    }, 0);
  }, [formData.tbm_budget_list]);
  useEffect(() => {
    currentFinancialYear().then((res) => setFinancialYears(res?.data || []));

    getUnitList().then((res) => setUnits(res?.data || []));

    getAllStateApi().then((res) => setStates(res?.data || []));

    // getTypeOfVillageList().then((res) =>
    //   setVillageTypes(res?.data || [])
    // );

    // getAllScheduleSevenApi().then((res) =>
    //   setScheduleSeven(res?.data || [])
    // );
    getAllThemeApi().then((res) => setThemes(res?.data || []));
  }, []);

  const handleChange = useCallback((name, value) => {
    if (name === "tbm_unit_id") {
      // 🔴 Clear all location dropdowns first
      setDistricts([]);
      setBlocks([]);
      setGramPanchayats([]);
      setRevenueVillages([]);
      setVillages([]);

      setFormData((prev) => ({
        ...prev,
        tbm_unit_id: value,
        tbm_state_id: null,
        tbm_district_id: null,
        tbm_block_id: null,
        tbm_gram_panchayat_id: null,
        tbm_revenue_village_id: null,
        tbm_village_id: null,
      }));

      // 🔵 Then call API
      getLocationByUnitId(value)
        .then(async (res) => {
          if (!res?.data?.status) {
            message.error(res?.data?.message || "Unit location not found");
            return;
          }

          const data = res?.data?.data;
          if (!data) return;

          const districtRes = await fetchDistrictsByStateIds(data.state_id);

          setDistricts(districtRes?.data || []);

          setBlocks(data.blocks);
          setGramPanchayats(data.grampanchayats);
          setRevenueVillages(data.revenue_villages);
          setVillages(data.villages);

          setFormData((prev) => ({
            ...prev,
            tbm_unit_id: value,
            tbm_state_id: data.state_id,
            tbm_district_id: data.district_id,
            tbm_block_id: data.blocks.map((i) => i.value),
            tbm_gram_panchayat_id: data.grampanchayats.map((i) => i.value),
            tbm_revenue_village_id: data.revenue_villages.map((i) => i.value),
            tbm_village_id: data.villages.map((i) => i.value),
          }));
        })
        .catch(() => {
          message.error("Something went wrong while fetching unit location");
        });
    }

    setFormData((prev) => {
      let updated = { ...prev, [name]: value };

      if (name === "tbm_state_id") {
        updated.tbm_district_id = null;
        updated.tbm_block_id = null;
        updated.tbm_gram_panchayat_id = null;
        updated.tbm_revenue_village_id = null;
        updated.tbm_village_id = null;

        setDistricts([]);
        setBlocks([]);
        setGramPanchayats([]);
        setRevenueVillages([]);
        setVillages([]);

        fetchDistrictsByStateIds(value).then((res) =>
          setDistricts(res?.data || []),
        );
      }

      if (name === "tbm_district_id") {
        updated.tbm_block_id = null;
        updated.tbm_gram_panchayat_id = null;
        updated.tbm_revenue_village_id = null;
        updated.tbm_village_id = null;

        setBlocks([]);
        setGramPanchayats([]);
        setRevenueVillages([]);
        setVillages([]);

        getBlocksByDistrictIds(value).then((res) => setBlocks(res?.data || []));
      }

      if (name === "tbm_block_id") {
        updated.tbm_gram_panchayat_id = null;
        updated.tbm_revenue_village_id = null;
        updated.tbm_village_id = null;

        setGramPanchayats([]);
        setRevenueVillages([]);
        setVillages([]);

        getGramPanchayatsByBlockIds(value).then((res) =>
          setGramPanchayats(res?.data || []),
        );
      }

      if (name === "tbm_gram_panchayat_id") {
        updated.tbm_revenue_village_id = null;
        updated.tbm_village_id = null;

        setRevenueVillages([]);
        setVillages([]);

        getRevenueVillageByGramPanchayatIds(value).then((res) =>
          setRevenueVillages(res?.data || []),
        );
      }

      if (name === "tbm_revenue_village_id") {
        updated.tbm_village_id = null;
        setVillages([]);

        getVillageByRevenueVillageIds(value).then((res) =>
          setVillages(res?.data || []),
        );
      }

      return updated;
    });
  }, []);

  // const handleBudgetChange = (index, field, value) => {

  //   const updated = [...formData.tbm_budget_list];

  //   updated[index][field] = value;

  //   if (field === "tbad_sch_vii_id") {

  //     updated[index].tbad_sub_theme = null;

  //     getAllSubScheduleSevenApi({ schedule_id: value }).then((res) => {

  //       setFocusArea((prev) => ({
  //         ...prev,
  //         [value]: res?.data || [],
  //       }));

  //     });
  //   }

  //   setFormData({ ...formData, tbm_budget_list: updated });

  // };

  const handleBudgetChange = async (index, field, value) => {
    const updated = [...formData.tbm_budget_list];
    updated[index][field] = value;

    // When theme changes → load schedule seven
    // if (field === "tbad_theme_id") {
    //   updated[index].tbad_sch_vii_id = null;
    //   updated[index].tbad_sub_theme = null;

    //   const res = await getScheduleSevenByThemeIdApi(value);

    //   setScheduleSeven(res?.data || []);
    // }
    if (field === "tbad_theme_id") {
      updated[index].tbad_sch_vii_id = null;
      updated[index].tbad_sub_theme = null;

      const res = await getScheduleSevenByThemeIdApi(value);

      setScheduleSeven((prev) => ({
        ...prev,
        [index]: res?.data || [],
      }));
    }

    // When schedule changes → load sub schedule
    if (field === "tbad_sch_vii_id") {
      updated[index].tbad_sub_theme = null;

      const res = await getSubScheduleSevenByScheduleSevenIdApi(value);

      setFocusArea((prev) => ({
        ...prev,
        [value]: res?.data || [],
      }));
    }

    setFormData({
      ...formData,
      tbm_budget_list: updated,
    });
  };

  const addBudgetRow = () => {
    setFormData({
      ...formData,
      tbm_budget_list: [
        ...formData.tbm_budget_list,
        {
          tbad_theme_id: null,
          tbad_sch_vii_id: null,
          tbad_sub_theme: null,
          tbad_project_identified: null,
          tbad_description: "",
          tbad_amount: "",
        },
      ],
    });
  };

  const removeBudgetRow = (index) => {
    const updated = formData.tbm_budget_list.filter((_, i) => i !== index);
    setFormData({ ...formData, tbm_budget_list: updated });
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      await Schema.validate(formData, { abortEarly: false });

      setErrors({}); // clear errors

      createBudgeting({
        ...formData,
        tbm_proposed_total_amount: totalAmount,
      })
        .then((res) => {
          if (res?.status) {
            message.success({
              content: res.message,
              duration: 2,
            }); // ⭐ use API message
          }

          fetchBudgets(1);
          changeModalStatus(false);
        })
        .catch((err) => {
          if (err?.response?.data?.errors) {
            setErrors(err.response.data.errors);
          } else {
            message.error(
              err?.response?.data?.message || "Something went wrong",
            );
          }
        });
    } catch (err) {
      const validationErrors = {};

      err.inner.forEach((error) => {
        validationErrors[error.path] = error.message;
      });

      setErrors(validationErrors);
    }
  };

  useEffect(() => {
    if (editData) {
      const budgetList =
        editData.tbm_budget_list?.map((item) => ({
          tbad_theme_id: item.tbad_theme_id,
          tbad_sch_vii_id: item.tbad_sch_vii_id,
          tbad_sub_theme: item.tbad_sub_theme,
          tbad_project_identified: item.tbad_project_identified,
          tbad_description: item.tbad_description,
          tbad_amount: item.tbad_amount,
        })) || [];

      setFormData({
        tbm_id: editData.tbm_id,
        tbm_fy_id: editData.tbm_fy_id || null,
        tbm_unit_id: editData.tbm_unit_id || null,
        tbm_state_id: editData.tbm_state_id || null,
        tbm_district_id: editData.tbm_district_id || null,
        tbm_block_id: editData.tbm_block_id || null,
        tbm_gram_panchayat_id: editData.tbm_gram_panchayat_id || null,
        tbm_revenue_village_id: editData.tbm_revenue_village_id || null,
        tbm_village_id: editData.tbm_village_id || null,
        // tbm_village_type_id: editData.tbm_village_type_id || null,
        tbm_budget_list: budgetList,
      });

      // 🔹 Optimized sub-theme loading (single state update)

      const loadSubThemes = async () => {
        const uniqueSchedules = [
          ...new Set(budgetList.map((i) => i.tbad_sch_vii_id)),
        ];

        const newFocus = {};

        const responses = await Promise.all(
          uniqueSchedules.map((id) =>
            getAllSubScheduleSevenApi({ schedule_id: id }),
          ),
        );

        uniqueSchedules.forEach((id, index) => {
          newFocus[id] = responses[index]?.data || [];
        });

        setFocusArea(newFocus);
      };
      const loadSchedules = async () => {
        const uniqueThemes = [
          ...new Set(budgetList.map((i) => i.tbad_theme_id)),
        ];

        const scheduleRes = await Promise.all(
          uniqueThemes.map((id) => getScheduleSevenByThemeIdApi(id)),
        );

        // if (scheduleRes[0]) {
        //   setScheduleSeven(scheduleRes[0].data || []);
        // }
        const scheduleMap = {};

        budgetList.forEach((item, index) => {
          const res = scheduleRes.find(
            (r, i) => uniqueThemes[i] === item.tbad_theme_id,
          );

          scheduleMap[index] = res?.data || [];
        });

        setScheduleSeven(scheduleMap);
      };
      loadSchedules();
      loadSubThemes();

      const loadLocations = async () => {
        try {
          const res = await getLocationByUnitId(editData.tbm_unit_id);

          if (!res?.data?.status) return;

          const data = res.data.data;

          const districtRes = await fetchDistrictsByStateIds(data.state_id);

          setDistricts(districtRes?.data || []);
          setBlocks(data.blocks || []);
          setGramPanchayats(data.grampanchayats || []);
          setRevenueVillages(data.revenue_villages || []);
          setVillages(data.villages || []);

          setFormData((prev) => ({
            ...prev,
            tbm_state_id: data.state_id,
            tbm_district_id: data.district_id,
            tbm_block_id: data.blocks?.map((i) => i.value) || [],
            tbm_gram_panchayat_id:
              data.grampanchayats?.map((i) => i.value) || [],
            tbm_revenue_village_id:
              data.revenue_villages?.map((i) => i.value) || [],
            tbm_village_id: data.villages?.map((i) => i.value) || [],
          }));
        } catch (err) {
          console.error(err);
        }
      };
      loadLocations();
    }
  }, [editData]);

  useEffect(() => {
    if (!showModal) {
      setFormData({
        tbm_id: null,
        tbm_fy_id: null,
        tbm_unit_id: null,
        tbm_state_id: null,
        tbm_district_id: null,
        tbm_block_id: null,
        tbm_gram_panchayat_id: null,
        tbm_revenue_village_id: null,
        tbm_village_id: null,
        // tbm_village_type_id: null,
        tbm_proposed_total_amount: "",
        tbm_budget_list: [
          {
            tbad_sch_vii_id: null,
            tbad_sub_theme: null,
            tbad_project_identified: null,
            tbad_description: "",
            tbad_amount: "",
          },
        ],
      });

      setErrors({});
    }
  }, [showModal]);

  return (
    <>
      {/* <Toaster position="top-center" toastOptions={{ duration: 2000 }} /> */}
      <Modal show={showModal} size="xl" onHide={() => changeModalStatus(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editData ? "Update Budgeting" : "Add Budgeting"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <form onSubmit={submit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Financial Year</label>

                <Select
                  options={financialYears}
                  value={
                    financialYears.find(
                      (o) => o.value === formData.tbm_fy_id,
                    ) || null
                  }
                  onChange={(e) => handleChange("tbm_fy_id", e.value)}
                />
                {errors.tbm_fy_id && (
                  <div className="text-danger">{errors.tbm_fy_id}</div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label>Unit</label>

                <Select
                  options={units}
                  value={
                    units.find((o) => o.value === formData.tbm_unit_id) || null
                  }
                  onChange={(e) => handleChange("tbm_unit_id", e.value)}
                />
                {errors.tbm_unit_id && (
                  <div className="text-danger">{errors.tbm_unit_id}</div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label>State</label>

                <Select
                  options={states}
                  value={
                    states.find((o) => o.value === formData.tbm_state_id) ||
                    null
                  }
                  onChange={(e) => handleChange("tbm_state_id", e.value)}
                  isDisabled={true}
                />
                {errors.tbm_state_id && (
                  <div className="text-danger">{errors.tbm_state_id}</div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label>District</label>

                <Select
                  options={districts}
                  value={
                    districts.find(
                      (o) => o.value === formData.tbm_district_id,
                    ) || null
                  }
                  onChange={(e) => handleChange("tbm_district_id", e.value)}
                  isDisabled={true}
                />
                {errors.tbm_district_id && (
                  <div className="text-danger">{errors.tbm_district_id}</div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label>Block</label>

                <Select
                  options={blocks}
                  value={
                    formData.tbm_block_id
                      ? {
                          label: blocks
                            .filter((o) =>
                              formData.tbm_block_id.includes(o.value),
                            )
                            .map((o) => o.label)
                            .join(", "),
                          value: formData.tbm_block_id,
                        }
                      : null
                  }
                  onChange={(e) => handleChange("tbm_block_id", e.value)}
                  isDisabled={true}
                />
                {errors.tbm_block_id && (
                  <div className="text-danger">{errors.tbm_block_id}</div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label>Gram Panchayat</label>

                <Select
                  options={gramPanchayats}
                  value={
                    formData.tbm_gram_panchayat_id
                      ? {
                          label: gramPanchayats
                            .filter((o) =>
                              formData.tbm_gram_panchayat_id.includes(o.value),
                            )
                            .map((o) => o.label)
                            .join(", "),
                          value: formData.tbm_gram_panchayat_id,
                        }
                      : null
                  }
                  onChange={(e) =>
                    handleChange("tbm_gram_panchayat_id", e.value)
                  }
                  isDisabled={true}
                />
                {errors.tbm_gram_panchayat_id && (
                  <div className="text-danger">
                    {errors.tbm_gram_panchayat_id}
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label>Revenue Village</label>

                <Select
                  options={revenueVillages}
                  value={
                    formData.tbm_revenue_village_id
                      ? {
                          label: revenueVillages
                            .filter((o) =>
                              formData.tbm_revenue_village_id.includes(o.value),
                            )
                            .map((o) => o.label)
                            .join(", "),
                          value: formData.tbm_revenue_village_id,
                        }
                      : null
                  }
                  onChange={(e) =>
                    handleChange("tbm_revenue_village_id", e.value)
                  }
                  isDisabled={true}
                />
                {errors.tbm_revenue_village_id && (
                  <div className="text-danger">
                    {errors.tbm_revenue_village_id}
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label>Village / Hamlet</label>

                <Select
                  options={villages}
                  value={
                    formData.tbm_village_id
                      ? {
                          label: villages
                            .filter((o) =>
                              formData.tbm_village_id.includes(o.value),
                            )
                            .map((o) => o.label)
                            .join(", "),
                          value: formData.tbm_village_id,
                        }
                      : null
                  }
                  onChange={(e) => handleChange("tbm_village_id", e.value)}
                  isDisabled={true}
                />
                {errors.tbm_village_id && (
                  <div className="text-danger">{errors.tbm_village_id}</div>
                )}
              </div>

              {/* <div className="col-md-6 mb-3">
                <label>Type of Village</label>

                <Select
                  options={villageTypes}
                  value={
                    villageTypes.find(
                      (o) =>
                        o.value === formData.tbm_village_type_id
                    ) || null
                  }
                  onChange={(e) =>
                    handleChange("tbm_village_type_id", e.value)
                  }
                />
                {errors.tbm_village_type_id && (
                  <div className="text-danger">{errors.tbm_village_type_id}</div>
                )}
              </div> */}
            </div>

            {/* ADD MORE */}
            <button
              type="button"
              className="btn btn-dark mb-3 float-end"
              onClick={addBudgetRow}
            >
              Add More
            </button>
            {formData.tbm_budget_list.map((item, index) => (
              <div key={index} className="border p-3 mb-3">
                <div className="row">
                  <div className="col-md-4">
                    <label>Theme</label>

                    <Select
                      options={themes}
                      value={
                        themes.find((o) => o.value === item.tbad_theme_id) ||
                        null
                      }
                      onChange={(e) =>
                        handleBudgetChange(index, "tbad_theme_id", e.value)
                      }
                    />

                    {errors[`tbm_budget_list[${index}].tbad_theme_id`] && (
                      <div className="text-danger">
                        {errors[`tbm_budget_list[${index}].tbad_theme_id`]}
                      </div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label>Thematic Area</label>

                    {/* <Select
                      options={scheduleSeven}
                      value={
                        scheduleSeven.find(
                          (o) => o.value === item.tbad_sch_vii_id,
                        ) || null
                      } */}
                    <Select
                      options={scheduleSeven[index] || []}
                      value={
                        (scheduleSeven[index] || []).find(
                          (o) => o.value === item.tbad_sch_vii_id,
                        ) || null
                      }
                      onChange={(e) =>
                        handleBudgetChange(index, "tbad_sch_vii_id", e.value)
                      }
                    />
                    {errors[`tbm_budget_list[${index}].tbad_sch_vii_id`] && (
                      <div className="text-danger">
                        {errors[`tbm_budget_list[${index}].tbad_sch_vii_id`]}
                      </div>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label>Sub-theme</label>

                    <Select
                      // options={(focusArea[item.tbad_sch_vii_id] || []).filter(option =>
                      //   !formData.tbm_budget_list.some(
                      //     (row, i) =>
                      //       row.tbad_sub_theme === option.value && i !== index
                      //   )
                      // )}
                      options={focusArea[item.tbad_sch_vii_id] || []}
                      value={
                        (focusArea[item.tbad_sch_vii_id] || []).find(
                          (o) => o.value === item.tbad_sub_theme,
                        ) || null
                      }
                      onChange={(e) =>
                        handleBudgetChange(index, "tbad_sub_theme", e.value)
                      }
                    />
                    {errors[`tbm_budget_list[${index}].tbad_sub_theme`] && (
                      <div className="text-danger">
                        {errors[`tbm_budget_list[${index}].tbad_sub_theme`]}
                      </div>
                    )}
                  </div>

                  {/* <div className="col-md-4">
                  <label>Project Identified</label>

                  <Select
                    options={[
                      { label: "Yes", value: "yes" },
                      { label: "No", value: "no" },
                    ]}
                    value={
                      item.tbad_project_identified
                        ? {
                          label:
                            item.tbad_project_identified === "yes"
                              ? "Yes"
                              : "No",
                          value: item.tbad_project_identified,
                        }
                        : null
                    }
                    onChange={(e) =>
                      handleBudgetChange(
                        index,
                        "tbad_project_identified",
                        e.value
                      )
                    }
                  />
                </div> */}

                  <div className="col-md-4">
                    <label>Project Identified</label>

                    <Select
                      options={[
                        { label: "Yes", value: "yes" },
                        { label: "No", value: "no" },
                      ]}
                      value={
                        item.tbad_project_identified
                          ? {
                              label:
                                item.tbad_project_identified === "yes"
                                  ? "Yes"
                                  : "No",
                              value: item.tbad_project_identified,
                            }
                          : null
                      }
                      onChange={(e) =>
                        handleBudgetChange(
                          index,
                          "tbad_project_identified",
                          e.value,
                        )
                      }
                    />

                    {errors[
                      `tbm_budget_list[${index}].tbad_project_identified`
                    ] && (
                      <div className="text-danger">
                        {
                          errors[
                            `tbm_budget_list[${index}].tbad_project_identified`
                          ]
                        }
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label>Proposed Description</label>

                    <Input
                      value={item.tbad_description}
                      onChange={(e) =>
                        handleBudgetChange(
                          index,
                          "tbad_description",
                          e.target.value,
                        )
                      }
                    />
                    {errors[`tbm_budget_list[${index}].tbad_description`] && (
                      <div className="text-danger">
                        {errors[`tbm_budget_list[${index}].tbad_description`]}
                      </div>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label>Proposed Budget (INR)</label>

                    <Input
                      type="number"
                      value={item.tbad_amount}
                      onChange={(e) =>
                        handleBudgetChange(index, "tbad_amount", e.target.value)
                      }
                    />
                    {errors[`tbm_budget_list[${index}].tbad_amount`] && (
                      <div className="text-danger">
                        {errors[`tbm_budget_list[${index}].tbad_amount`]}
                      </div>
                    )}
                  </div>

                  <div className="col-md-2 d-flex align-items-end">
                    {formData.tbm_budget_list.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => removeBudgetRow(index)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="row mb-3">
              <div className="col-md-6 ms-auto">
                <label>
                  <b>Total Proposed Budget (INR)</b>
                </label>
                <Input value={totalAmount} disabled />
              </div>
            </div>
            <br />
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}
