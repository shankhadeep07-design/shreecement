import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { toast, Toaster } from "react-hot-toast";
import * as yup from "yup";

import GalleryUploader from "./GalleryUploader";

import {
  getAllThemeApi
} from "../../services/PriorityAlignment-service";

import {
  createGalleryApi,
  updateGalleryApi,
  getThemeWiseProjectsListsApi,
  deleteGalleryImageApi
} from "../../services/Gallery-service";


/* ================= VALIDATION ================= */

const gallerySchema = yup.object().shape({
  tgl_theme_id: yup.string().required("Theme is required"),
  tgl_project_id: yup.string().required("Project is required")
});


export default function AddEditGallery({
  changeModalStatus,
  editList,
  initiatedDistrictDatatable
}) {

  const [themes, setThemes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [fileLists, setFileLists] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    tgl_id: "",
    tgl_theme_id: "",
    tgl_project_id: ""
  });

  const [errors, setErrors] = useState({});


  /* ================= LOAD THEMES ================= */

  useEffect(() => {

    getAllThemeApi()
      .then((res) => {

        if (res?.data) {
          setThemes(res.data);
        }

      })
      .catch((error) =>
        toast.error(error?.response?.data?.message)
      );

  }, []);


  /* ================= THEME CHANGE ================= */

  const handleThemeChange = async (e) => {

    const theme_id = e.target.value;

    setFormData({
      ...formData,
      tgl_theme_id: theme_id,
      tgl_project_id: ""
    });

    setProjects([]);

    try {

      const res = await getThemeWiseProjectsListsApi({
        theme_id
      });

      if (res?.status) {
        setProjects(res.data);
      }

    } catch {

      toast.error("Failed to load projects");

    }

  };


  /* ================= PROJECT CHANGE ================= */

  const handleProjectChange = (e) => {

    setFormData({
      ...formData,
      tgl_project_id: e.target.value
    });

  };


  /* ================= EDIT MODE ================= */

  useEffect(() => {

    if (!editList) return;

    const loadEditData = async () => {

      setFormData({
        tgl_theme_id: editList.tgl_theme_id,
        tgl_project_id: editList.tgl_project_id
      });

      try {

        const res = await getThemeWiseProjectsListsApi({
          theme_id: editList.tgl_theme_id
        });

        if (res?.status) {
          setProjects(res.data);
        }

      } catch {

        toast.error("Failed to load projects");

      }

      if (editList?.documents?.length) {

        const mappedFiles = editList.documents.map((doc) => ({
          uid: doc.tdoc_id,
          name: doc.file_name,
          status: "done",
          url: doc.full_url,
          tdoc_id: doc.tdoc_id
        }));

        setFileLists(mappedFiles);

      }

    };

    loadEditData();

  }, [editList]);


  /* ================= DELETE IMAGE ================= */

  const handleDeleteImage = async (tdoc_id) => {

    try {

      const res = await deleteGalleryImageApi(tdoc_id);

      if (res?.status) {

        toast.success(res.message);

        setFileLists((prev) =>
          prev.filter((file) => file.tdoc_id !== tdoc_id)
        );

      }

    } catch {

      toast.error("Failed to delete image");

    }

  };


  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await gallerySchema.validate(formData, { abortEarly: false });

      setErrors({});

    } catch (err) {

      const validationErrors = {};

      err.inner.forEach((error) => {
        validationErrors[error.path] = error.message;
      });

      setErrors(validationErrors);
      return;

    }

    const formDataObj = new FormData();

    Object.keys(formData).forEach((key) => {
      formDataObj.append(key, formData[key]);
    });

    fileLists.forEach((file) => {

      if (file.originFileObj) {
        formDataObj.append("tgl_gallery_images", file.originFileObj);
      }

    });

    setLoading(true);

    try {

      let res;

      if (editList?.tgl_id) {

        res = await updateGalleryApi(
          formDataObj,
          editList.tgl_id
        );

      } else {

        res = await createGalleryApi(formDataObj);

      }

      if (res?.status) {

        toast.success(res.message);

        changeModalStatus("user_update_modal", false);
        initiatedDistrictDatatable();

      } else {

        toast.error(res.message);

      }

    } catch (error) {

      toast.error(
        error?.response?.data?.message ||
        "Something went wrong"
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <>
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />

      <form onSubmit={handleSubmit}>

        <div className="row">

          {/* ================= THEME ================= */}

          <div className="col-md-6">

            <label className="form-label">Theme</label>

            <select
              className="form-select"
              value={formData.tgl_theme_id}
              onChange={handleThemeChange}
            >

              <option value="">Select Theme</option>

              {themes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}

            </select>

            {errors.tgl_theme_id && (
              <small className="text-danger">
                {errors.tgl_theme_id}
              </small>
            )}

          </div>


          {/* ================= PROJECT ================= */}

          <div className="col-md-6">

            <label className="form-label">Project</label>

            <select
              className="form-select"
              value={formData.tgl_project_id}
              onChange={handleProjectChange}
            >

              <option value="">Select Project</option>

              {projects.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}

            </select>

            {errors.tgl_project_id && (
              <small className="text-danger">
                {errors.tgl_project_id}
              </small>
            )}

          </div>

        </div>


        {/* ================= GALLERY ================= */}

        <div className="mt-3">

          <label className="form-label">Gallery Images</label>

          <GalleryUploader
            fileLists={fileLists}
            setFileLists={setFileLists}
            onDeleteImage={handleDeleteImage}
          />

        </div>


        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="mt-3"
        >
          Submit
        </Button>

      </form>

    </>

  );

}