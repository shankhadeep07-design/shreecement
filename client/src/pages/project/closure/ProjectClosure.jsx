import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  InputNumber,
  DatePicker,
  Upload,
  Row,
  Col,
  Tooltip,
  Modal,
  Select,
  Popconfirm,
} from "antd";

import { deleteDocumentApi } from "../../../services/Project-service";

import {
  UploadOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

import {
  projectClosureCreateUpdateApi,
  projectClosureDetailsApi,
} from "../../../services/Project-service.js";

/* ================= YES / NO OPTIONS ================= */
const YES_NO_OPTIONS = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

/* ================= CLOSED TYPE OPTIONS ================= */
const CLOSED_TYPE_OPTIONS = [
  { label: "Finally", value: "Finally" },
  { label: "Optionally", value: "Optionally" },
];

/* ================= VALIDATION ================= */
const schema = Yup.object().shape({
  tpclsr_deliverable_achieved: Yup.string().required(
    "Deliverable Achieved is required",
  ),
  tpclsr_closure_date: Yup.string().required("Closure Date is required"),
  // tpclsr_closed_type:          Yup.string().required("Closed Type is required"),
  tpclsr_closed_finally: Yup.string().required("Closed Finally is required"),
});

export const ProjectClosure = ({ isClosureApproved }) => {
  const tproj_id = useParams()?.tproj_id;
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fileLists, setFileLists] = useState({ tpclsr_docs: [] });
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    tpclsr_id: "",
    tpclsr_project_id: tproj_id,
    tpclsr_deliverable_achieved: "",
    tpclsr_closure_date: null,
    tpclsr_beneficiary_impacted: "",
    tpclsr_closed_type: null, // ✅ Finally / Optionally
    tpclsr_closed_finally: null, // ✅ Yes / No
    tpclsr_summary_report: "",
    tpclsr_total_payment_received: "",
    tpclsr_docs: [],
  });

  /* ================= FETCH LIST ================= */
  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await projectClosureDetailsApi({
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
     if (typeof value === "string") {
      value = value.replace(/^\s+/, "");
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= RESET FORM ================= */
  const resetForm = () => {
    setFormData({
      tpclsr_id: "",
      tpclsr_project_id: tproj_id,
      tpclsr_deliverable_achieved: "",
      tpclsr_closure_date: null,
      tpclsr_beneficiary_impacted: "",
      tpclsr_closed_type: null,
      tpclsr_closed_finally: null,
      tpclsr_summary_report: "",
      tpclsr_total_payment_received: "",
      tpclsr_docs: [],
    });
    setFileLists({ tpclsr_docs: [] });
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

    setFileLists({ tpclsr_docs: fileMap });
    setFormData({
      tpclsr_id: record.tpclsr_id,
      tpclsr_project_id: record.tpclsr_project_id,
      tpclsr_deliverable_achieved: record.tpclsr_deliverable_achieved,
      tpclsr_closure_date: record.tpclsr_closure_date,
      tpclsr_beneficiary_impacted: record.tpclsr_beneficiary_impacted,
      tpclsr_closed_type: record.tpclsr_closed_type,
      tpclsr_closed_finally: record.tpclsr_closed_finally,
      tpclsr_summary_report: record.tpclsr_summary_report,
      tpclsr_total_payment_received: record.tpclsr_total_payment_received,
      tpclsr_docs: fileMap,
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
        if (key !== "tpclsr_docs" && value) {
          payload.append(key, value);
        }
      });

      // ✅ only new files
      formData.tpclsr_docs.forEach((file) => {
        if (file.originFileObj) {
          payload.append("tpclsr_docs", file.originFileObj);
        }
      });

      const res = await projectClosureCreateUpdateApi(payload);
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
    setFileLists({ tpclsr_docs: updated });
    handleChange("tpclsr_docs", updated);
  };

  /* ================= RENDER ================= */
  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="d-flex justify-content-end mb-3">
        {!isClosureApproved && (
          <button className="btn btn-sm btn-primary" onClick={handleAdd}>
            <i className="fa-solid fa-plus me-1"></i> Add Closure
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
              <th>Deliverable Achieved</th>
              <th>Closure Date</th>
              <th>Beneficiary Impacted</th>
              {/* <th>Closed (Finally & Optionally)</th> */}
              <th>Closed</th>
              <th>Total Payment</th>
              <th>Documents</th>
              <th>Status</th>
              <th style={{ width: "160px" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center">
                  Loading...
                </td>
              </tr>
            ) : list.length ? (
              list.map((item, index) => (
                <tr key={item.tpclsr_id}>
                  <td>{index + 1}</td>
                  <td
                    style={{
                      maxWidth: "180px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.tpclsr_deliverable_achieved || "--"}
                  </td>
                  <td>
                    {item.tpclsr_closure_date
                      ? dayjs(item.tpclsr_closure_date).format("DD MMM YYYY")
                      : "--"}
                  </td>
                  <td>{item.tpclsr_beneficiary_impacted || "--"}</td>

                  {/* ===== Closed Type ===== */}
                  {/* <td>
                    {item.tpclsr_closed_type ? (
                      <span className="badge bg-secondary">
                        {item.tpclsr_closed_type}
                      </span>
                    ) : "--"}
                  </td> */}

                  {/* ===== Closed Finally Yes/No ===== */}
                  <td>
                    {item.tpclsr_closed_finally ? (
                      <span
                        className={`badge ${
                          item.tpclsr_closed_finally === "Yes"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {item.tpclsr_closed_finally}
                      </span>
                    ) : (
                      "--"
                    )}
                  </td>

                  <td>{item.tpclsr_total_payment_received || "--"}</td>
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
                  <td>
                    <span className={`badge ${
                      item.tpclsr_status === "approved" ? "bg-success" : 
                      item.tpclsr_status === "draft" ? "bg-warning text-dark" : "bg-primary"
                    }`}>
                      {(item.tpclsr_status || "draft").toUpperCase()}
                    </span>
                  </td>

                  {/* ===== Action ===== */}
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => navigate(`/admin/project/closure/view-list/${item.tpclsr_id}`)}
                        title="View Details"
                      >
                        <i className="fa-solid fa-eye text-info"></i>
                      </button>
                      
                      {!isClosureApproved && item.tpclsr_status === "draft" && (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(item)}
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center">
                  No closure records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL FORM ================= */}
      <Modal
        title={formData.tpclsr_id ? "Edit Closure" : "Add Closure"}
        open={isModalOpen}
        onCancel={handleCloseModal}
        width={750}
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
            {formData.tpclsr_id ? "Update" : "Submit"}
          </Button>,
        ]}
      >
        <Row gutter={[12, 16]} style={{ marginTop: 8 }}>
          {/* ===== Deliverable Achieved ===== */}
          <Col span={24}>
            <label>
              Deliverable Achieved <span style={{ color: "red" }}>*</span>
            </label>
            <Input.TextArea
              rows={2}
              placeholder="Enter Deliverable Achieved"
              value={formData.tpclsr_deliverable_achieved}
              onChange={(e) =>
                handleChange("tpclsr_deliverable_achieved", e.target.value)
              }
              status={errors.tpclsr_deliverable_achieved ? "error" : ""}
            />
            {errors.tpclsr_deliverable_achieved && (
              <div style={{ color: "red", fontSize: 12 }}>
                {errors.tpclsr_deliverable_achieved}
              </div>
            )}
          </Col>

          {/* ===== Closure Date ===== */}
          <Col span={12}>
            <label>
              Closure Date <span style={{ color: "red" }}>*</span>
            </label>
            <DatePicker
              style={{ width: "100%" }}
              value={
                formData.tpclsr_closure_date
                  ? dayjs(formData.tpclsr_closure_date)
                  : null
              }
              onChange={(d, str) => handleChange("tpclsr_closure_date", str)}
              status={errors.tpclsr_closure_date ? "error" : ""}
            />
            {errors.tpclsr_closure_date && (
              <div style={{ color: "red", fontSize: 12 }}>
                {errors.tpclsr_closure_date}
              </div>
            )}
          </Col>

          {/* ===== Beneficiary Impacted ===== */}
          <Col span={12}>
            <label>Beneficiary Impacted</label>
            <Input
              placeholder="Enter Beneficiary Impacted"
              value={formData.tpclsr_beneficiary_impacted}
              onChange={(e) =>
                handleChange("tpclsr_beneficiary_impacted", e.target.value)
              }
            />
          </Col>

          {/* ===== Closed (Finally & Optionally) ===== */}
          {/* <Col span={12}>
            <label>
              Closed (Finally & Optionally) <span style={{ color: "red" }}>*</span>
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder="Select Finally / Optionally"
              value={formData.tpclsr_closed_type || undefined}
              onChange={(val) => handleChange("tpclsr_closed_type", val)}
              options={CLOSED_TYPE_OPTIONS}
              status={errors.tpclsr_closed_type ? "error" : ""}
            />
            {errors.tpclsr_closed_type && (
              <div style={{ color: "red", fontSize: 12 }}>
                {errors.tpclsr_closed_type}
              </div>
            )}
          </Col> */}

          {/* ===== Closed Yes / No ===== */}
          <Col span={12}>
            <label>
              Closed <span style={{ color: "red" }}>*</span>
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder="Select Yes / No"
              value={formData.tpclsr_closed_finally || undefined}
              onChange={(val) => handleChange("tpclsr_closed_finally", val)}
              options={YES_NO_OPTIONS}
              status={errors.tpclsr_closed_finally ? "error" : ""}
            />
            {errors.tpclsr_closed_finally && (
              <div style={{ color: "red", fontSize: 12 }}>
                {errors.tpclsr_closed_finally}
              </div>
            )}
          </Col>

          {/* ===== Total Payment Received ===== */}
          <Col span={12}>
            <label>Total Payment Received</label>
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter Total Payment Received"
              min={0}
              value={formData.tpclsr_total_payment_received}
              onChange={(val) =>
                handleChange("tpclsr_total_payment_received", val)
              }
            />
          </Col>

          {/* ===== Summary Report and Suggestions ===== */}
          <Col span={24}>
            <label>Summary Report and Suggestions</label>
            <Input.TextArea
              rows={3}
              placeholder="Enter Summary Report and Suggestions"
              value={formData.tpclsr_summary_report}
              onChange={(e) =>
                handleChange("tpclsr_summary_report", e.target.value)
              }
            />
          </Col>

          {/* ===== Upload Documents (multi) ===== */}
          <Col span={24}>
            <label>
              Upload Documents
              <Tooltip title="Supported formats: JPG, JPEG, PNG, WebP, PDF, DOC, DOCX, XLS, XLSX">
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
                fileList={fileLists.tpclsr_docs || []}
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
                    return Upload.LIST_IGNORE; // Prevent upload
                  }

                  const isLt15MB = file.size / 1024 / 1024 < 15;
                  if (!isLt15MB) {
                    toast.error("File must be smaller than 15MB");
                    return Upload.LIST_IGNORE; // Prevent upload
                  }

                  return false; // Stop auto upload
                }}
                onChange={({ fileList }) => {
                  setFileLists({ tpclsr_docs: fileList });
                  handleChange("tpclsr_docs", fileList);
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
                            fetchList(); // Fetch updated list after deletion
                          } catch (err) {
                            console.error(err);
                            toast.error("Failed to delete document");
                            return;
                          }
                        }
                        const updatedList = currFileList.filter(
                          (f) => f.uid !== file.uid,
                        );
                        setFileLists({ tpclsr_docs: updatedList });
                        handleChange("tpclsr_docs", updatedList);
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

            {errors?.tpclsr_docs && (
              <div className="error text-danger">{errors.tpclsr_docs}</div>
            )}
          </Col>
        </Row>
      </Modal>
    </>
  );
};
