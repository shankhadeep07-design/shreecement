import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import Select from "react-select";
import * as Yup from "yup";

import {
  createKpiApi,
  fetchAllThemeList,
  updateKpiApi,
} from "../../../Services/Master-service";
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
  tkpi_thematic_area_id: Yup.string().required("Thematic area is required"),

  tkpi_details: trimmedString()
    .required("KPI details is required")
    .max(255, "Max 255 characters")
    .matches(noLeadingSpace, "Cannot start with space")
    .matches(noSpecialStart, "Cannot start with special character")
    .matches(noEmoji, "Emoji not allowed"),

  tkpi_desc: trimmedString()
    .required("Description is required")
    .max(500, "Max 500 characters")
    .matches(noLeadingSpace, "Cannot start with space")
    .matches(noSpecialStart, "Cannot start with special character")
    .matches(noEmoji, "Emoji not allowed"),
});

export const AddEditKpi = ({
  changeModalStatus,
  editKpi,
  initiatedKpiDatatable,
  datatable_url,
}) => {
  const [themes, setThemes] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [scheduleSeven, setScheduleSeven] = useState([]);

  const [formData, setFormData] = useState({
    tkpi_id: null,
    tkpi_thematic_area_id: null,
    tkpi_details: "",
    tkpi_desc: "",
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

    if (name === "tkpi_details" || name === "tkpi_desc") {
      newValue = newValue.replace(/^\s+/, ""); // remove leading spaces
    }

    setFormData({
      ...formData,
      [name]: newValue, // ✅ correct
    });
  };

  // Load Theme List
  // useEffect(() => {
  //     fetchAllThemeList()
  //         .then((res) => {
  //             setThemes(res?.data || []);
  //         })
  //         .catch((err) =>
  //             toast.error(err?.response?.data?.message)
  //         );
  // }, []);
  useEffect(() => {
    getAllScheduleSevenApi().then((res) => setScheduleSeven(res?.data || []));
  }, []);

  // Edit Mode
  useEffect(() => {
    if (editKpi && scheduleSeven.length > 0) {
      // ✅ guards both conditions
      setFormData({
        tkpi_id: editKpi?.tkpi_id,
        tkpi_thematic_area_id: editKpi?.tschm_schedule_id,
        tkpi_details: editKpi?.tkpi_details,
        tkpi_desc: editKpi?.tkpi_desc,
      });
    }
  }, [editKpi, scheduleSeven]); // ✅ reacts to both

  const submit = async (e) => {
    e.preventDefault();

    const isValid = await handleValidation(formData);
    if (!isValid) return;

    setLoading(true);

    const apiCall = editKpi
      ? updateKpiApi(formData, formData?.tkpi_id)
      : createKpiApi(formData);

    apiCall
      .then((res) => {
        setLoading(false);

        if (res.status) toast.success(res.message);
        else toast.error(res.message);

        changeModalStatus("user_update_modal", false);
        initiatedKpiDatatable(datatable_url);
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message);
        setLoading(false);
      });
  };

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />

      <form onSubmit={submit} className="my_form">
        <div className="row">
          {/* THEMATIC AREA */}
          <div className="col-md-6 mb-3">
            <label className="form-label">
              Thematic Area(Schedule VII Item No)
              <span className="required">*</span>
            </label>

            <Select
              options={scheduleSeven}
              value={
                scheduleSeven.find(
                  ({ value }) => value == formData?.tkpi_thematic_area_id,
                ) || ""
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tkpi_thematic_area_id: e.value,
                })
              }
            />

            {/* <Select
                            options={themes}
                            value={
                                themes.find(
                                    ({ value }) => value == formData?.tkpi_thematic_area_id
                                ) || ""
                            }
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    tkpi_thematic_area_id: e.value,
                                })
                            }
                        /> */}

            {errors?.tkpi_thematic_area_id && (
              <div className="error text-danger">
                {errors.tkpi_thematic_area_id}
              </div>
            )}
          </div>

          {/* KPI DETAILS */}
          <div className="col-md-6 mb-3">
            <label className="form-label">
              KPI Details <span className="required">*</span>
            </label>

            <input
              type="text"
              className="form-control"
              name="tkpi_details"
              value={formData.tkpi_details}
              onChange={inputChange}
              placeholder="Enter KPI details"
            />

            {errors?.tkpi_details && (
              <div className="error text-danger">{errors.tkpi_details}</div>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="col-md-12 mb-3">
            <label className="form-label">
              Description <span className="required">*</span>
            </label>

            <textarea
              className="form-control"
              rows="3"
              name="tkpi_desc"
              value={formData.tkpi_desc}
              onChange={inputChange}
              placeholder="Enter Description"
            />

            {errors?.tkpi_desc && (
              <div className="error text-danger">{errors.tkpi_desc}</div>
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
