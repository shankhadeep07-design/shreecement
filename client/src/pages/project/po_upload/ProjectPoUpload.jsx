import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  DatePicker,
  Upload,
  Row,
  Col,
  Tooltip,
  Modal,
  Select,
  Popconfirm,
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

import {
  projectPoUploadCreateUpdateApi,
  projectPoUploadDetailsApi,
} from "../../../services/Project-service";

import { deleteDocumentApi } from "../../../services/Project-service";

/* ================= VALIDATION ================= */
const schema = Yup.object().shape({
  tppo_title: Yup.string().required("Title is required"),
  tppo_valid_from: Yup.string().required("Valid From is required"),
  tppo_valid_to: Yup.string().required("Valid To is required"),
});

const ProjectPoUpload = ({ isClosureApproved }) => {
  const tproj_id = useParams()?.tproj_id;

  /* ================= STATE ================= */
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fileLists, setFileLists] = useState({ tppo_docs: [] });
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    tppo_id: "",
    tppo_proposal_id: tproj_id, // ✅ project reference
    tppo_title: "",
    tppo_valid_from: null,
    tppo_valid_to: null,
    tppo_remarks: "",
    tppo_docs: [],
  });

  /* ================= FETCH LIST ================= */
  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await projectPoUploadDetailsApi({
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
      tppo_id: "",
      tppo_proposal_id: tproj_id,
      tppo_title: "",
      tppo_valid_from: null,
      tppo_valid_to: null,
      tppo_remarks: "",
      tppo_docs: [],
    });
    setFileLists({ tppo_docs: [] });
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

    setFileLists({ tppo_docs: fileMap });
    setFormData({
      tppo_id: record.tppo_id,
      tppo_proposal_id: record.tppo_proposal_id,
      tppo_title: record.tppo_title,
      tppo_valid_from: record.tppo_valid_from,
      tppo_valid_to: record.tppo_valid_to,
      tppo_remarks: record.tppo_remarks,
      tppo_docs: fileMap,
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
        if (key !== "tppo_docs" && value) {
          payload.append(key, value);
        }
      });

      // ✅ only new files
      formData.tppo_docs.forEach((file) => {
        if (file.originFileObj) {
          payload.append("tppo_docs", file.originFileObj);
        }
      });

      const res = await projectPoUploadCreateUpdateApi(payload);
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
    setFileLists({ tppo_docs: updated });
    handleChange("tppo_docs", updated);
  };

  /* ================= RENDER ================= */
  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="d-flex justify-content-end mb-3">
        {!isClosureApproved && (
          <button className="btn btn-sm btn-primary" onClick={handleAdd}>
            <i className="fa-solid fa-plus me-1"></i> Add PO
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
              <th>Title</th>
              <th>Valid From</th>
              <th>Valid To</th>
              <th>Remarks</th>
              <th>Documents</th>
              <th style={{ width: "120px" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center">
                  Loading...
                </td>
              </tr>
            ) : list.length ? (
              list.map((item, index) => (
                <tr key={item.tppo_id}>
                  <td>{index + 1}</td>
                  <td>{item.tppo_title || "--"}</td>
                  <td>
                    {item.tppo_valid_from
                      ? dayjs(item.tppo_valid_from).format("DD MMM YYYY")
                      : "--"}
                  </td>
                  <td>
                    {item.tppo_valid_to
                      ? dayjs(item.tppo_valid_to).format("DD MMM YYYY")
                      : "--"}
                  </td>
                  <td
                    style={{
                      maxWidth: "200px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.tppo_remarks || "--"}
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
                <td colSpan={7} className="text-center">
                  No PO records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL FORM ================= */}
      <Modal
        title={formData.tppo_id ? "Edit PO" : "Add PO"}
        open={isModalOpen}
        onCancel={handleCloseModal}
        width={700}
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
            {formData.tppo_id ? "Update" : "Submit"}
          </Button>,
        ]}
      >
        <Row gutter={[12, 16]} style={{ marginTop: 8 }}>
          {/* ===== Title ===== */}
          <Col span={24}>
            <label>
              Title <span style={{ color: "red" }}>*</span>
            </label>
            <Input
              placeholder="Enter Title"
              value={formData.tppo_title}
              onChange={(e) => handleChange("tppo_title", e.target.value)}
              status={errors.tppo_title ? "error" : ""}
            />
            {errors.tppo_title && (
              <div style={{ color: "red", fontSize: 12 }}>
                {errors.tppo_title}
              </div>
            )}
          </Col>

          {/* ===== Valid From ===== */}
          <Col span={12}>
            <label>
              Valid From <span style={{ color: "red" }}>*</span>
            </label>
            <DatePicker
              style={{ width: "100%" }}
              value={
                formData.tppo_valid_from
                  ? dayjs(formData.tppo_valid_from)
                  : null
              }
              onChange={(d, str) => handleChange("tppo_valid_from", str)}
              status={errors.tppo_valid_from ? "error" : ""}
            />
            {errors.tppo_valid_from && (
              <div style={{ color: "red", fontSize: 12 }}>
                {errors.tppo_valid_from}
              </div>
            )}
          </Col>

          {/* ===== Valid To ===== */}
          <Col span={12}>
            <label>
              Valid To <span style={{ color: "red" }}>*</span>
            </label>
            <DatePicker
              style={{ width: "100%" }}
              value={
                formData.tppo_valid_to ? dayjs(formData.tppo_valid_to) : null
              }
              onChange={(d, str) => handleChange("tppo_valid_to", str)}
              status={errors.tppo_valid_to ? "error" : ""}
            />
            {errors.tppo_valid_to && (
              <div style={{ color: "red", fontSize: 12 }}>
                {errors.tppo_valid_to}
              </div>
            )}
          </Col>

          {/* ===== Remarks ===== */}
          <Col span={24}>
            <label>Remarks</label>
            <Input.TextArea
              rows={3}
              placeholder="Enter Remarks"
              value={formData.tppo_remarks}
              onChange={(e) => handleChange("tppo_remarks", e.target.value)}
            />
          </Col>

          {/* ===== Upload Documents (multi) ===== */}
          <Col span={24}>
            <label>
              Upload Document
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
                fileList={fileLists.tppo_docs || []}
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
                  setFileLists({ tppo_docs: fileList });
                  handleChange("tppo_docs", fileList);
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
                        setFileLists({ tppo_docs: updatedList });
                        handleChange("tppo_docs", updatedList);
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

            {errors?.tppo_docs && (
              <div className="error text-danger">{errors.tppo_docs}</div>
            )}
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default ProjectPoUpload;
