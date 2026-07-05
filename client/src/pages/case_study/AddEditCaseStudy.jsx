import React, { useEffect, useState } from "react";
import { Form, Input, Button, Upload, Tooltip, Popconfirm } from "antd";
import { InfoCircleOutlined, UploadOutlined, DeleteOutlined  } from "@ant-design/icons";
import { toast, Toaster } from "react-hot-toast";
import * as yup from "yup";


import {
  getAllThemeApi
} from "../../services/PriorityAlignment-service";

import {
  createCaseStudiesApi,
  updateCaseStudiesApi,
  getThemeWiseProjectsListsApi,
  deleteCaseStudiesDocApi
} from "../../services/CaseStudy-service";

const { TextArea } = Input;


/* ================= YUP VALIDATION ================= */

const caseStudySchema = yup.object().shape({

  tcs_theme_id: yup
    .string()
    .required("Theme is required"),

  tcs_project_id: yup
    .string()
    .required("Project is required"),

  tcs_problem: yup
    .string()
    .required("Problem is required")
    .matches(/^[A-Za-z0-9]/, "First character cannot be space or special character"),

  tcs_solution: yup
    .string()
    .required("Solution is required")
    .matches(/^[A-Za-z0-9]/, "First character cannot be space or special character"),

  tcs_benefit: yup
    .string()
    .required("Benefit is required")
    .matches(/^[A-Za-z0-9]/, "First character cannot be space or special character")

});


export default function AddEditCaseStudy({
  changeModalStatus,
  editList,
  initiatedDistrictDatatable,
  datatable_url
}) {

  const [form] = Form.useForm();

  const [fileLists, setFileLists] = useState([]);
  const [projects, setProjects] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);


  /* ================= INITIAL LOAD ================= */

  useEffect(() => {

    getAllThemeApi()
      .then((res) => setThemes(res?.data))
      .catch((error) =>
        toast.error(error?.response?.data?.message)
      );

  }, []);


  /* ================= THEME CHANGE ================= */

  const handleThemeChange = async (theme_id, selectedProjectId = null) => {

    form.setFieldsValue({ tcs_project_id: "" });

    setProjects([]);

    const res = await getThemeWiseProjectsListsApi({ theme_id });

    if (res?.status) {

      setProjects(res.data);

      if (selectedProjectId) {
        form.setFieldsValue({
          tcs_project_id: selectedProjectId
        });
      }

    } else {

      toast.error(res?.message);

    }

  };


  /* ================= EDIT MODE ================= */

  useEffect(() => {

    if (editList) {

      form.setFieldsValue({
        tcs_theme_id: editList?.tcs_theme_id,
        tcs_problem: editList?.tcs_problem,
        tcs_solution: editList?.tcs_solution,
        tcs_benefit: editList?.tcs_benefit
      });

      if (editList?.tcs_theme_id) {

        handleThemeChange(
          editList.tcs_theme_id,
          editList.tcs_project_id
        );

      }

      if (editList?.documents?.length) {

        const mappedFiles = editList.documents.map((doc) => ({
          uid: doc.tdoc_id,
          name: doc.file_name,
          status: "done",
          url: doc.full_url
        }));

        setFileLists(mappedFiles);

      }

    }

  }, [editList]);


  /* ================= SUBMIT ================= */

  const handleSubmit = async (values) => {

    try {

      await caseStudySchema.validate(values, { abortEarly: false });

    } catch (err) {

      const errors = {};

      err.inner.forEach((error) => {

        errors[error.path] = {
          errors: [error.message]
        };

      });

      form.setFields(
        Object.keys(errors).map((key) => ({
          name: key,
          errors: errors[key].errors
        }))
      );

      return;

    }

    const formDataObj = new FormData();

    Object.keys(values).forEach((key) => {
      formDataObj.append(key, values[key]);
    });


    if (fileLists?.length) {

      fileLists.forEach((file) => {

        if (file.originFileObj) {

          formDataObj.append(
            "tcs_picture_documents",
            file.originFileObj
          );

        }

      });

    }

    setLoading(true);

    try {

      let res;

      if (editList?.tcs_id) {

        res = await updateCaseStudiesApi(
          formDataObj,
          editList.tcs_id
        );

      } else {

        res = await createCaseStudiesApi(formDataObj);

      }

      if (res.status) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }

      changeModalStatus("user_update_modal", false);
      initiatedDistrictDatatable(datatable_url);

    } catch (error) {

      toast.error(
        error?.response?.data?.message ||
        "Something went wrong"
      );

    } finally {

      setLoading(false);

    }

  };


  /* ================= FILE HANDLER ================= */

  const handleFileChange = (fileList) => {
    setFileLists(fileList);
  };

  const removeImage = async (file) => {
console.log("Removing file:", file);
  try {

    if (file.url) {

      const res = await deleteCaseStudiesDocApi(file.uid);

      if (!res?.status) {
        toast.error(res?.message || "Delete failed");
        return;
      }

      toast.success("Document deleted");
      initiatedDistrictDatatable(datatable_url);

    }

    setFileLists((prev) =>
      prev.filter((item) => item.uid !== file.uid)
    );

  } catch (error) {

    toast.error("Failed to delete document");

  }

};


  return (

    <>
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >

        <div className="row">


          {/* ================= THEME ================= */}

          <div className="col-md-6">

            <Form.Item
              label="Theme"
              name="tcs_theme_id"
              rules={[{ required: true, message: "Theme is required" }]}
            >

              <select
                className="form-select"
                onChange={(e) => {
                  const value = e.target.value;
                  form.setFieldsValue({ tcs_theme_id: value });
                  handleThemeChange(value);
                }}
                value={form.getFieldValue("tcs_theme_id") || ""}
              >

                <option value="">Select Theme</option>

                {themes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}

              </select>

            </Form.Item>

          </div>


          {/* ================= PROJECT ================= */}

          <div className="col-md-6">

            <Form.Item
              label="Project"
              name="tcs_project_id"
              rules={[{ required: true, message: "Project is required" }]}
            >

              <select
                className="form-select"
                onChange={(e) =>
                  form.setFieldsValue({
                    tcs_project_id: e.target.value
                  })
                }
                value={form.getFieldValue("tcs_project_id") || ""}
              >

                <option value="">Select Project</option>

                {projects.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}

              </select>

            </Form.Item>

          </div>


          {/* ================= PROBLEM ================= */}

          <div className="col-md-6">

            <Form.Item label="Problem" name="tcs_problem">

              <TextArea
                rows={2}
                placeholder="Enter problem description"
                onKeyDown={(e) => {
                  if (e.key === " " && e.target.selectionStart === 0) {
                    e.preventDefault();
                  }
                }}
              />

            </Form.Item>

          </div>


          {/* ================= SOLUTION ================= */}

          <div className="col-md-6">

            <Form.Item label="Solution" name="tcs_solution">

              <TextArea
                rows={2}
                placeholder="Enter solution description"
                onKeyDown={(e) => {
                  if (e.key === " " && e.target.selectionStart === 0) {
                    e.preventDefault();
                  }
                }}
              />

            </Form.Item>

          </div>


          {/* ================= BENEFIT ================= */}

          <div className="col-md-6">

            <Form.Item label="Benefit" name="tcs_benefit">

              <TextArea
                rows={2}
                placeholder="Enter benefit description"
                onKeyDown={(e) => {
                  if (e.key === " " && e.target.selectionStart === 0) {
                    e.preventDefault();
                  }
                }}
              />

            </Form.Item>

          </div>


          {/* ================= FILE UPLOAD ================= */}

          <div className="col-md-6">

            <Form.Item
              label={
                <>
                  Attachment Documents
                  <Tooltip title="Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG (Max size: 15MB)">
                    <InfoCircleOutlined style={{ marginLeft: 6 }} />
                  </Tooltip>
                </>
              }
            >

              <Upload
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                fileList={fileLists}
                beforeUpload={() => false}
                onChange={({ fileList }) => handleFileChange(fileList)}
                showUploadList={false}
              >

                <Button icon={<UploadOutlined />}>
                  Choose File
                </Button>

              </Upload>

{/* Custom File List */}

<div className="mt-2">

  {fileLists.map((file) => (

    <div
      key={file.uid}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid #ddd",
        padding: "6px 10px",
        marginBottom: 6,
        borderRadius: 4
      }}
    >

      <a
        href={file.url || "#"}
        target="_blank"
        rel="noreferrer"
      >
        {file.name}
      </a>

      <Popconfirm
        title="Delete image?"
        onConfirm={() => removeImage(file)}
      >

        <DeleteOutlined
          style={{
            color: "red",
            fontSize: 16,
            cursor: "pointer"
          }}
        />

      </Popconfirm>

    </div>

  ))}

</div>

            </Form.Item>

          </div>

        </div>


        <div className="row">

          <div className="col-md-12">

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              Submit
            </Button>

          </div>

        </div>

      </Form>

    </>

  );

}