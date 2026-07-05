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
  projectFinancialReportCreateUpdateApi,
  projectFinancialReportDetailsApi,
} from "../../../services/Project-service";

import { deleteDocumentApi } from "../../../services/Project-service";

/* ================= VALIDATION ================= */
const schema = Yup.object().shape({
  tpfr_title: Yup.string().required("Title is required"),
  tpfr_date: Yup.string().required("Date is required"),
  tpfr_details: Yup.string().required("Details are required"),
});

const FinancialReport = ({ isClosureApproved }) => {
  const tproj_id = useParams()?.tproj_id;

  /* ================= STATE ================= */
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fileLists, setFileLists] = useState({ tpfr_docs: [] });
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    tpfr_id: "",
    tpfr_project_id: tproj_id,
    tpfr_title: "",
    tpfr_date: null,
    tpfr_details: "",
    tpfr_docs: [],
  });

  /* ================= FETCH LIST ================= */
  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await projectFinancialReportDetailsApi({
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
      tpfr_id: "",
      tpfr_project_id: tproj_id,
      tpfr_title: "",
      tpfr_date: null,
      tpfr_details: "",
      tpfr_docs: [],
    });
    setFileLists({ tpfr_docs: [] });
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

    setFileLists({ tpfr_docs: fileMap });
    setFormData({
      tpfr_id: record.tpfr_id,
      tpfr_project_id: record.tpfr_project_id,
      tpfr_title: record.tpfr_title,
      tpfr_date: record.tpfr_date,
      tpfr_details: record.tpfr_details,
      tpfr_docs: fileMap,
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
        if (key !== "tpfr_docs" && value) {
          payload.append(key, value);
        }
      });

      formData.tpfr_docs.forEach((file) => {
        if (file.originFileObj) {
          payload.append("tpfr_docs", file.originFileObj);
        }
      });

      const res = await projectFinancialReportCreateUpdateApi(payload);
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
    setFileLists({ tpfr_docs: updated });
    handleChange("tpfr_docs", updated);
  };

  /* ================= RENDER ================= */
  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="d-flex justify-content-end mb-3">
        {!isClosureApproved && (
          <button className="btn btn-sm btn-primary" onClick={handleAdd}>
            <i className="fa-solid fa-plus me-1"></i> Add Financial Report
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
              <th>Date</th>
              <th>Details</th>
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
                <tr key={item.tpfr_id}>
                  <td>{index + 1}</td>
                  <td>{item.tpfr_title || "--"}</td>
                  <td>
                    {item.tpfr_date
                      ? dayjs(item.tpfr_date).format("DD MMM YYYY")
                      : "--"}
                  </td>
                  <td
                    style={{
                      maxWidth: "300px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.tpfr_details || "--"}
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
                  No financial report records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL FORM ================= */}
      <Modal
        title={
          formData.tpfr_id ? "Edit Financial Report" : "Add Financial Report"
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        width={720}
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
            {formData.tpfr_id ? "Update" : "Submit"}
          </Button>,
        ]}
      >
        <Row gutter={[12, 16]} style={{ marginTop: 8 }}>
          <Col span={12}>
            <label>
              Title <span style={{ color: "red" }}>*</span>
            </label>
            <Input
              placeholder="Title"
              value={formData.tpfr_title}
              onChange={(e) => handleChange("tpfr_title", e.target.value)}
              status={errors.tpfr_title ? "error" : ""}
            />
            {errors.tpfr_title && (
              <div style={{ color: "red", fontSize: 12 }}>
                {errors.tpfr_title}
              </div>
            )}
          </Col>

          <Col span={12}>
            <label>
              Date <span style={{ color: "red" }}>*</span>
            </label>
            <DatePicker
              style={{ width: "100%" }}
              value={formData.tpfr_date ? dayjs(formData.tpfr_date) : null}
              onChange={(d, str) => handleChange("tpfr_date", str)}
              status={errors.tpfr_date ? "error" : ""}
            />
            {errors.tpfr_date && (
              <div style={{ color: "red", fontSize: 12 }}>
                {errors.tpfr_date}
              </div>
            )}
          </Col>

          <Col span={24}>
            <label>
              Details <span style={{ color: "red" }}>*</span>
            </label>
            <Input.TextArea
              rows={4}
              placeholder="Financial Report Details"
              value={formData.tpfr_details}
              onChange={(e) => handleChange("tpfr_details", e.target.value)}
              status={errors.tpfr_details ? "error" : ""}
            />
            {errors.tpfr_details && (
              <div style={{ color: "red", fontSize: 12 }}>
                {errors.tpfr_details}
              </div>
            )}
          </Col>

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
                fileList={fileLists.tpfr_docs || []}
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
                  setFileLists({ tpfr_docs: fileList });
                  handleChange("tpfr_docs", fileList);
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
                        setFileLists({ tpfr_docs: updatedList });
                        handleChange("tpfr_docs", updatedList);
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

            {errors?.tpfr_docs && (
              <div className="error text-danger">{errors.tpfr_docs}</div>
            )}
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default FinancialReport;
