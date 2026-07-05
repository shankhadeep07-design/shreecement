import React, { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  Upload,
  Row,
  Col,
  Tooltip,
  Modal,
  Select,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

import { Popconfirm } from "antd";
import {
  projectAnnualReportCreateUpdateApi,
  projectAnnualReportDetailsApi,
} from "../../services/Project-service";

import { deleteDocumentApi } from "../../services/Project-service";
import { Input } from "antd";
/* ================= REPORT TYPE OPTIONS ================= */
const REPORT_TYPE_OPTIONS = [
  { label: "Report Type A", value: "Report Type A" },
  { label: "Report Type B", value: "Report Type B" },
];

/* ================= VALIDATION ================= */
const schema = Yup.object().shape({
  tpar_report_type: Yup.string().required("Report Type is required")
    .max(255, "Report Type must be at most 255 characters"),
  tpar_date: Yup.string().required("Date is required"),
});

export const AnnualSubmission = ({ isClosureApproved }) => {
  const tproj_id = useParams()?.tproj_id;

  /* ================= STATE ================= */
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fileLists, setFileLists] = useState({ tpar_docs: [] });
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    tpar_id: "",
    tpar_project_id: tproj_id,
    tpar_report_type: null, // ✅ Report Type
    tpar_date: null, // ✅ Date
    tpar_docs: [], // ✅ Upload Documents
  });

  /* ================= FETCH LIST ================= */
  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await projectAnnualReportDetailsApi({
        project_id: tproj_id,
      });
      if (res?.data) setList(res.data || []);
    } catch {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= RESET FORM ================= */
  const resetForm = () => {
    setFormData({
      tpar_id: "",
      tpar_project_id: tproj_id,
      tpar_report_type: null,
      tpar_date: null,
      tpar_docs: [],
    });
    setFileLists({ tpar_docs: [] });
    setErrors({});
  };

  /* ================= ADD NEW ================= */
  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  /* ================= EDIT ================= */
  const handleEdit = (record) => {
    const fileMap = (record?.documents || []).map((doc) => ({
      uid: doc.tdoc_id,
      name: doc.name,
      status: "done",
      url: doc.full_url,
    }));

    setFileLists({ tpar_docs: fileMap });
    setFormData({
      tpar_id: record.tpar_id,
      tpar_project_id: record.tpar_project_id,
      tpar_report_type: record.tpar_report_type,
      tpar_date: record.tpar_date,
      tpar_docs: fileMap,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  /* ================= CLOSE MODAL ================= */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      await schema.validate(formData, { abortEarly: false });
      setErrors({});

      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "tpar_docs" && value) {
          payload.append(key, value);
        }
      });

      formData.tpar_docs.forEach((file) => {
        if (file.originFileObj) {
          payload.append("tpar_docs", file.originFileObj);
        }
      });

      const res = await projectAnnualReportCreateUpdateApi(payload);
      if (res?.status) {
        toast.success(res.message);
        fetchList();
        handleCloseModal();
      }
    } catch (err) {
      if (err.inner) {
        const e = {};
        err.inner.forEach((x) => (e[x.path] = x.message));
        setErrors(e);
      } else {
        toast.error(err.message);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  /* ================= DELETE FILE ================= */
  const removeFile = (file, fileListArr) => {
    const updated = fileListArr.filter((f) => f.uid !== file.uid);
    setFileLists({ tpar_docs: updated });
    handleChange("tpar_docs", updated);
  };

  /* ================= RENDER ================= */
  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="d-flex justify-content-end mb-3">
        {!isClosureApproved && (
          <button className="btn btn-sm btn-primary" onClick={handleAdd}>
            <i className="fa-solid fa-plus me-1"></i> Add Annual Submission
          </button>
        )}
      </div>

      {/* ================= TABLE ================= */}
      <div
        className="card-body at-elevation-z6 table-box"
        style={{ maxHeight: "calc(100vh - 23vh)", overflowX: "auto" }}
      >
        <table className="table table-bordered table-yellow dataTable">
          <thead className="table-warning">
            <tr>
              <th>#</th>
              <th>Report Type</th>
              <th>Date</th>
              <th>Documents</th>
              <th style={{ width: "120px" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center">
                  Loading...
                </td>
              </tr>
            ) : list.length ? (
              list.map((item, index) => (
                <tr key={item.tpar_id}>
                  <td>{index + 1}</td>
                  <td>{item.tpar_report_type || "--"}</td>
                  <td>
                    {item.tpar_date
                      ? dayjs(item.tpar_date).format("DD MMM YYYY")
                      : "--"}
                  </td>
                  <td>
                    {item.documents?.length > 0 ? (
                      <span className="badge bg-primary">
                        {item.documents.length} File
                        {item.documents.length !== 1 ? "s" : ""}
                      </span>
                    ) : (
                      "--"
                    )}
                  </td>

                  {/* ===== Action ===== */}
                  <td>
                    {!isClosureApproved && (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(item)}
                      >
                        <i className="fa-solid fa-pen"></i> Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center">
                  No annual submission records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL FORM ================= */}
      <Modal
        title={
          formData.tpar_id ? "Edit Annual Submission" : "Add Annual Submission"
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        width={600}
        maskClosable={false}
        footer={[
          <Button key="cancel" onClick={handleCloseModal}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitLoading}
            onClick={handleSubmit}
          >
            {formData.tpar_id ? "Update" : "Submit"}
          </Button>,
        ]}
      >
        <Row gutter={[12, 16]} style={{ marginTop: 8 }}>
          {/* ===== Report Type ===== */}
          <Col span={24}>
            <label>
              Report Type <span style={{ color: "red" }}>*</span>
            </label>
            {/* <Select
              style={{ width: "100%" }}
              placeholder="Select Report Type"
              value={formData.tpar_report_type || undefined}
              onChange={(val) => handleChange("tpar_report_type", val)}
              options={REPORT_TYPE_OPTIONS}
            /> */}
            <Input
            style={{ width: "100%" }}
            placeholder="Enter Report Type"
            value={formData.tpar_report_type || ""}
            onChange={(e) =>
              handleChange("tpar_report_type", e.target.value)
            }
          />
            {errors.tpar_report_type && (
              <div style={{ color: "red", fontSize: 12 }}>
                {errors.tpar_report_type}
              </div>
            )}
          </Col>

          {/* ===== Date ===== */}
          <Col span={24}>
            <label>
              Date <span style={{ color: "red" }}>*</span>
            </label>
            <DatePicker
              style={{ width: "100%" }}
              value={formData.tpar_date ? dayjs(formData.tpar_date) : null}
              onChange={(d, str) => handleChange("tpar_date", str)}
              // status={errors.tpar_date ? "error" : ""}
            />
            {errors.tpar_date && (
              <div style={{ color: "red", fontSize: 12 }}>
                {errors.tpar_date}
              </div>
            )}
          </Col>

          {/* ===== Upload Documents ===== */}
          {/* ===== Upload Documents ===== */}
          <Col span={24}>
            <label>
              Upload Documents
              <Tooltip title="Supported formats: JPG, JPEG, PNG, PDF, DOC, DOCX, XLS, XLSX">
                <InfoCircleOutlined style={{ marginLeft: 6 }} />
              </Tooltip>
            </label>

            <div
              style={{
                width: "100%",
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid #d9d9d9",
                padding: "12px",
                borderRadius: "6px",
                backgroundColor: "#fff",
              }}
            >
              <Upload
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpeg,.jpg,.png" // Specify accepted file types
                fileList={fileLists.tpar_docs || []}
                beforeUpload={(file) => {
                  const allowedTypes = [
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                  ];

                  const isValidType = allowedTypes.includes(file.type);
                  if (!isValidType) {
                    toast.error("Invalid file format");
                    return Upload.LIST_IGNORE;
                  }

                  const isLt15MB = file.size / 1024 / 1024 < 15;
                  if (!isLt15MB) {
                    toast.error("File must be smaller than 15MB");
                    return Upload.LIST_IGNORE;
                  }

                  return false; // stop auto upload
                }}
                onChange={({ fileList }) => {
                  setFileLists({ tpar_docs: fileList });
                  handleChange("tpar_docs", fileList);
                }}
                showUploadList={{ showRemoveIcon: false }}
                itemRender={(originNode, file, currFileList) => (
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div>{originNode}</div>
                    <Popconfirm
                      title="Delete?"
                      onConfirm={async () => {
                        const document_id = file?.uid;
                        console.log("-------------Field Value:", document_id);

                        if (document_id) {
                          try {
                            await deleteDocumentApi({ tdoc_id: document_id });
                            toast.success("Document deleted successfully");
                            fetchList();
                          } catch (err) {
                            console.error(err);
                            toast.error("Failed to delete document");
                            return;
                          }
                        }
                        const updatedList = currFileList.filter(
                          (f) => f.uid !== file.uid,
                        );
                        setFileLists({ tpar_docs: updatedList });
                        handleChange("tpar_docs", updatedList);
                      }}
                    >
                      <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </div>
                )}
              >
                <Button icon={<UploadOutlined />} style={{ marginTop: 6 }}>
                  Upload Files
                </Button>
              </Upload>
            </div>

            {errors?.tpar_docs && (
              <div className="error text-danger">{errors.tpar_docs}</div>
            )}
          </Col>
        </Row>
      </Modal>
    </>
  );
};
