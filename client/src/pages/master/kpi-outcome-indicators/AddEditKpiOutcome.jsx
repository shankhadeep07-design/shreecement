import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import Select from "react-select";
import * as Yup from "yup";
import {
  fetchAllThemeList,
  getKpiList,
  getThemeWiseKpiList,
} from "../../../Services/Master-service";
import {
  createKpiOutcomeApi,
  updateKpiOutcomeApi,
} from "../../../Services/Kpi-outcome-service";

const noLeadingSpace = /^(?!\s)/;
const noEmoji = /^(?!.*[\p{Extended_Pictographic}]).*$/u;
const noSpecialStart = /^[a-zA-Z0-9]/;
import {
  getAllSubScheduleSevenApi,
  getAllScheduleSevenApi,
  getSubScheduleSevenByScheduleSevenIdApi,
} from "../../../services/PriorityAlignment-service";
const trimmedString = () =>
  Yup.string().transform((value) => (value ? value.trim() : ""));

const Schema = Yup.object({
  tkpio_thematic_area_id: Yup.string().required("Thematic Area is required"),

  // tkpio_kpi: trimmedString()
  //     .required("KPI is required")
  //     .max(255, "Max 255 characters")
  //     .matches(noLeadingSpace, "Cannot start with space")
  //     .matches(noSpecialStart, "Cannot start with special character")
  //     .matches(noEmoji, "Emoji not allowed"),
  tkpio_kpi: Yup.string().required("KPI is required"),

  tkpio_outcome_name: trimmedString()
    .required("KPI / Outcome Indicator name is required")
    .max(255, "Max 255 characters")
    .matches(noLeadingSpace, "Cannot start with space")
    .matches(noSpecialStart, "Cannot start with special character")
    .matches(noEmoji, "Emoji not allowed"),

  tkpio_desc: trimmedString()
    .required("Description is required")
    .max(500, "Max 500 characters")
    .matches(noLeadingSpace, "Cannot start with space")
    .matches(noSpecialStart, "Cannot start with special character")
    .matches(noEmoji, "Emoji not allowed"),
});

export const AddEditKpiOutcome = ({
  changeModalStatus,
  editKpiOutcome,
  initiatedKpiOutcomeDatatable,
  datatable_url,
}) => {
  const [themes, setThemes] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState([]);

  const [scheduleSeven, setScheduleSeven] = useState([]);

  const [formData, setFormData] = useState({
    tkpio_id: null,
    tkpio_thematic_area_id: null,
    tkpio_kpi: "",
    tkpio_outcome_name: "",
    tkpio_desc: "",
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

  const inputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (["tkpio_kpi", "tkpio_outcome_name", "tkpio_desc"].includes(name)) {
      newValue = newValue.replace(/^\s+/, "");
    }
    setFormData({ ...formData, [name]: newValue });
  };

  // Load Theme List on mount
  // useEffect(() => {
  //   fetchAllThemeList()
  //     .then((res) => setThemes(res?.data || []))
  //     .catch((err) => toast.error(err?.response?.data?.message));
  // }, []);

  useEffect(() => {
    getAllScheduleSevenApi().then((res) => setScheduleSeven(res?.data || []));
  }, []);

  // Edit Mode — prepopulate form

  useEffect(() => {

    if (editKpiOutcome?.tkpio_thematic_area_id && scheduleSeven.length > 0) {
      getThemeWiseKpiList(editKpiOutcome.tkpio_thematic_area_id)
        .then((res) => setKpis(res?.data?.data || []))
        .catch((err) =>
          toast.error(err?.response?.data?.message || "Failed to load KPI"),
        );
    }

  }, [editKpiOutcome,scheduleSeven]);

  useEffect(() => {
    setErrors({});
    if (editKpiOutcome) {
      setFormData({
        tkpio_id: editKpiOutcome?.tkpio_id || null,
        tkpio_thematic_area_id: editKpiOutcome?.tkpio_thematic_area_id || null,
        tkpio_kpi: editKpiOutcome?.tkpio_kpi || "",
        tkpio_outcome_name: editKpiOutcome?.tkpio_outcome_name || "",
        tkpio_desc: editKpiOutcome?.tkpio_desc || "",
      });
    } else {
      setFormData({
        tkpio_id: null,
        tkpio_thematic_area_id: null,
        tkpio_kpi: "",
        tkpio_outcome_name: "",
        tkpio_desc: "",
      });
    }
    console.log("editKpiOutcome:", editKpiOutcome);
  }, [editKpiOutcome]);

  const submit = async (e) => {
    e.preventDefault();
    const isValid = await handleValidation(formData);
    if (!isValid) return;
    setLoading(true);

    const apiCall = editKpiOutcome
      ? updateKpiOutcomeApi(formData, formData?.tkpio_id)
      : createKpiOutcomeApi(formData);

    apiCall
      .then((res) => {
        setLoading(false);
        if (res.status) {
          toast.success(res.message);
          changeModalStatus("user_update_modal", false);
          initiatedKpiOutcomeDatatable(datatable_url);
        } else {
          toast.error(res.message);
        }
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message);
        setLoading(false);
      });
  };

  // useEffect(() => {
  //     getKpiList()
  //         .then((res) => setKpis(res?.data?.data || []))
  //         .catch((err) => toast.error(err?.response?.data?.message));
  // }, []);

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />

      <form onSubmit={submit} className="my_form">
        <div className="row">
          {/* THEMATIC AREA — API dropdown */}
          <div className="col-md-6 mb-3">
            <label className="form-label">
                            Thematic Area(Schedule VII Item No)<span className="required">*</span>
            </label>

            <Select
              options={scheduleSeven}
              value={
                scheduleSeven.find(
                  ({ value }) => value == formData?.tkpio_thematic_area_id,
                ) || ""
              }
              onChange={(e) => {
                const thematicId = e.value;

                setFormData({
                  ...formData,
                  tkpio_thematic_area_id: thematicId,
                  tkpio_kpi: "",
                });

                getThemeWiseKpiList(thematicId)
                  .then((res) => setKpis(res?.data?.data || []))
                  .catch((err) =>
                    toast.error(
                      err?.response?.data?.message || "Failed to load KPI",
                    ),
                  );
              }}
              placeholder="Select Thematic Area"
            />
            {/* <Select
              options={themes}
              value={
                themes.find(
                  ({ value }) => value == formData?.tkpio_thematic_area_id,
                ) || ""
              }
              

              onChange={(e) => {
                const thematicId = e.value;

                setFormData({
                  ...formData,
                  tkpio_thematic_area_id: thematicId,
                  tkpio_kpi: "",
                });

                getThemeWiseKpiList(thematicId)
                  .then((res) => setKpis(res?.data?.data || []))
                  .catch((err) =>
                    toast.error(
                      err?.response?.data?.message || "Failed to load KPI",
                    ),
                  );
              }}
              placeholder="Select Thematic Area"
            /> */}
            {errors?.tkpio_thematic_area_id && (
              <div className="error text-danger">
                {errors.tkpio_thematic_area_id}
              </div>
            )}
          </div>

          {/* KPI — simple input */}
          <div className="col-md-6 mb-3">
            <label className="form-label">
              KPI <span className="required">*</span>
            </label>
            <Select
              options={kpis}
              value={
                kpis.find(({ value }) => value == formData?.tkpio_kpi) || null
              }
              onChange={(e) => setFormData({ ...formData, tkpio_kpi: e.value })}
              placeholder="Select KPI"
            />

            {errors?.tkpio_kpi && (
              <div className="error text-danger">{errors.tkpio_kpi}</div>
            )}
          </div>

          {/* KPI / OUTCOME INDICATOR NAME — simple input */}
          <div className="col-md-6 mb-3">
            <label className="form-label">
              KPIs / Outcome Indicators Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              name="tkpio_outcome_name"
              value={formData.tkpio_outcome_name}
              onChange={inputChange}
              placeholder="Enter KPIs / Outcome Indicators Name"
            />
            {errors?.tkpio_outcome_name && (
              <div className="error text-danger">
                {errors.tkpio_outcome_name}
              </div>
            )}
          </div>

          {/* DESCRIPTION — simple textarea */}
          <div className="col-md-6 mb-3">
            <label className="form-label">
              Description <span className="required">*</span>
            </label>
            <textarea
              className="form-control"
              rows="3"
              name="tkpio_desc"
              value={formData.tkpio_desc}
              onChange={inputChange}
              placeholder="Enter Description"
            />
            {errors?.tkpio_desc && (
              <div className="error text-danger">{errors.tkpio_desc}</div>
            )}
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Submit"}
        </button>
      </form>
    </>
  );
};
