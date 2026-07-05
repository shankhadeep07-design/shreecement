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
  createKpiVariableApi,
  updateKpiVariableApi,
} from "../../../Services/Kpi-variable-service";
import {
  getAllSubScheduleSevenApi,
  getAllScheduleSevenApi,
  getSubScheduleSevenByScheduleSevenIdApi,
} from "../../../services/PriorityAlignment-service";
const noLeadingSpace = /^(?!\s)/;
const noEmoji = /^(?!.*[\p{Extended_Pictographic}]).*$/u;
const noSpecialStart = /^[a-zA-Z0-9]/;

const trimmedString = () =>
  Yup.string().transform((value) => (value ? value.trim() : ""));

const Schema = Yup.object({
  tkpiv_thematic_area_id: Yup.string().required("Thematic Area is required"),

  tkpiv_kpi_details: trimmedString().required("KPI Details is required"),

  tkpiv_kpi_variable: trimmedString()
    .required("KPI Variable is required")
    .max(255, "Max 255 characters"),

  tkpiv_desc: trimmedString()
    .nullable()
    .optional()
    .max(500, "Max 500 characters"),
});

export const AddEditKpiVariable = ({
  changeModalStatus,
  editKpiVariable,
  initiatedKpiVariableDatatable,
  datatable_url,
}) => {
  const [themes, setThemes] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [kpis, setKpis] = useState([]);

  const [scheduleSeven, setScheduleSeven] = useState([]);

  const [formData, setFormData] = useState({
    tkpiv_id: null,
    tkpiv_thematic_area_id: null,
    tkpiv_kpi_details: "",
    tkpiv_kpi_variable: "",
    tkpiv_desc: "",
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

    if (
      ["tkpiv_kpi_details", "tkpiv_kpi_variable", "tkpiv_desc"].includes(name)
    ) {
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

  useEffect(() => {
    if (editKpiVariable?.tkpiv_thematic_area_id) {
      getThemeWiseKpiList(editKpiVariable.tkpiv_thematic_area_id)
        .then((res) => setKpis(res?.data?.data || []))
        .catch((err) =>
          toast.error(err?.response?.data?.message || "Failed to load KPI"),
        );
    }
  }, [editKpiVariable]);

  // Edit Mode — prepopulate form
  useEffect(() => {
    setErrors({});


    if (editKpiVariable && scheduleSeven.length > 0) {
      setFormData({
        tkpiv_id: editKpiVariable?.tkpiv_id || null,
        tkpiv_thematic_area_id: editKpiVariable?.tkpiv_thematic_area_id || null,
        tkpiv_kpi_details: editKpiVariable?.tkpiv_kpi_details || "",
        tkpiv_kpi_variable: editKpiVariable?.tkpiv_kpi_variable || "",
        tkpiv_desc: editKpiVariable?.tkpiv_desc || "",
      });
    } 
    // else {
    //   setFormData({
    //     tkpiv_id: null,
    //     tkpiv_thematic_area_id: null,
    //     tkpiv_kpi_details: "",
    //     tkpiv_kpi_variable: "",
    //     tkpiv_desc: "",
    //   });
    // }
    // console.log("editKpiVariable:", editKpiVariable);
  }, [editKpiVariable,scheduleSeven]);


  const submit = async (e) => {
    e.preventDefault();
    const isValid = await handleValidation(formData);
    if (!isValid) return;
    setLoading(true);

    const apiCall = editKpiVariable
      ? updateKpiVariableApi(formData, formData?.tkpiv_id)
      : createKpiVariableApi(formData);

    apiCall
      .then((res) => {
        setLoading(false);
        if (res.status) {
          toast.success(res.message);
          changeModalStatus("user_update_modal", false);
          initiatedKpiVariableDatatable(datatable_url);
        } else {
          toast.error(res.message);
        }
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message);
        setLoading(false);
      });
  };

  //   useEffect(() => {
  //     getKpiList()
  //       .then((res) => setKpis(res?.data?.data || []))
  //       .catch((err) => toast.error(err?.response?.data?.message));
  //   }, []);

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
                  ({ value }) => value == formData?.tkpiv_thematic_area_id,
                ) || ""
              }
              onChange={(e) => {
                const thematicId = e.value;
                setFormData({
                  ...formData,
                  tkpiv_thematic_area_id: e.value,
                  tkpiv_kpi_details: "", // ✅ RESET KPI
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
                  ({ value }) => value == formData?.tkpiv_thematic_area_id,
                ) || ""
              }
              onChange={(e) => {
                const thematicId = e.value;
                setFormData({ ...formData, tkpiv_thematic_area_id: e.value,    tkpiv_kpi_details: "", // ✅ RESET KPI
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
            {errors?.tkpiv_thematic_area_id && (
              <div className="error text-danger">
                {errors.tkpiv_thematic_area_id}
              </div>
            )}
          </div>

          {/* KPI DETAILS — simple input */}
          {/* <div className="col-md-6 mb-3">
                        <label className="form-label">
                            KPI Details <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            name="tkpiv_kpi_details"
                            value={formData.tkpiv_kpi_details}
                            onChange={inputChange}
                            placeholder="Enter KPI Details"
                        />
                        {errors?.tkpiv_kpi_details && (
                            <div className="error text-danger">{errors.tkpiv_kpi_details}</div>
                        )}
                    </div> */}

          <div className="col-md-6 mb-3">
            <label className="form-label">
              KPI Details <span className="required">*</span>
            </label>
            <Select
              options={kpis}
              value={
                kpis.find(
                  ({ value }) => value == formData?.tkpiv_kpi_details,
                ) || null
              }
              onChange={(e) =>
                setFormData({ ...formData, tkpiv_kpi_details: e.value })
              }
              placeholder="Select KPI"
            />
            {errors?.tkpiv_kpi_details && (
              <div className="error text-danger">
                {errors.tkpiv_kpi_details}
              </div>
            )}
          </div>

          {/* KPI VARIABLE — simple input */}
          <div className="col-md-6 mb-3">
            <label className="form-label">
              KPI Variable <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              name="tkpiv_kpi_variable"
              value={formData.tkpiv_kpi_variable}
              onChange={inputChange}
              placeholder="Enter KPI Variable"
            />
            {errors?.tkpiv_kpi_variable && (
              <div className="error text-danger">
                {errors.tkpiv_kpi_variable}
              </div>
            )}
          </div>

          {/* DESCRIPTION — simple textarea */}
          <div className="col-md-6 mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="3"
              name="tkpiv_desc"
              value={formData.tkpiv_desc}
              onChange={inputChange}
              placeholder="Enter Description"
            />
            {errors?.tkpiv_desc && (
              <div className="error text-danger">{errors.tkpiv_desc}</div>
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
