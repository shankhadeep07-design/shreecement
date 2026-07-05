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
  projectCollateralCreateUpdateApi,
  projectCollateralDetailsApi,
} from "../../services/Project-service";

import { deleteDocumentApi } from "../../services/Project-service";

/* ================= VALIDATION ================= */
const schema = Yup.object().shape({
  tpcol_title: Yup.string().required("Title is required"),
  tpcol_date: Yup.string().required("Date is required"),
});

const Collateral = ({ isClosureApproved }) => {
  const tproj_id = useParams()?.tproj_id;

  /* ================= STATE ================= */
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fileLists, setFileLists] = useState({ tpcol_docs: [] });
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    tpcol_id: "",
    tpcol_project_id: tproj_id,
    tpcol_title: "", // ✅ Title
    tpcol_date: null, // ✅ Date
    tpcol_docs: [], // ✅ Upload Documents (multi)
  });

  /* ================= FETCH LIST ================= */
  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await projectCollateralDetailsApi({
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
      tpcol_id: "",
      tpcol_project_id: tproj_id,
      tpcol_title: "",
      tpcol_date: null,
      tpcol_docs: [],
    });
    setFileLists({ tpcol_docs: [] });
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

    setFileLists({ tpcol_docs: fileMap });
    setFormData({
      tpcol_id: record.tpcol_id,
      tpcol_project_id: record.tpcol_project_id,
      tpcol_title: record.tpcol_title,
      tpcol_date: record.tpcol_date,
      tpcol_docs: fileMap,
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
        if (key !== "tpcol_docs" && value) {
          payload.append(key, value);
        }
      });

      // ✅ only new files
      formData.tpcol_docs.forEach((file) => {
        if (file.originFileObj) {
          payload.append("tpcol_docs", file.originFileObj);
        }
      });

      const res = await projectCollateralCreateUpdateApi(payload);
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
    setFileLists({ tpcol_docs: updated });
    handleChange("tpcol_docs", updated);
  };

  /* ================= RENDER ================= */
  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="d-flex justify-content-end mb-3">
        {!isClosureApproved && (
          <button className="btn btn-sm btn-primary" onClick={handleAdd}>
            <i className="fa-solid fa-plus me-1"></i> Add Collateral
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
                <tr key={item.tpcol_id}>
                  <td>{index + 1}</td>
                  <td>{item.tpcol_title || "--"}</td>
                  <td>
                    {item.tpcol_date
                      ? dayjs(item.tpcol_date).format("DD MMM YYYY")
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
                  No collateral records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL FORM ================= */}
      <Modal
        title={formData.tpcol_id ? "Edit Collateral" : "Add Collateral"}
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
            {formData.tpcol_id ? "Update" : "Submit"}
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
              value={formData.tpcol_title}
              onChange={(e) => handleChange("tpcol_title", e.target.value)}
            />
            {errors.tpcol_title && (
              <div style={{ color: "red", fontSize: 12 }}>
                {errors.tpcol_title}
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
              value={formData.tpcol_date ? dayjs(formData.tpcol_date) : null}
              onChange={(d, str) => handleChange("tpcol_date", str)}
            />
            {errors.tpcol_date && (
              <div style={{ color: "red", fontSize: 12 }}>
                {errors.tpcol_date}
              </div>
            )}
          </Col>

          {/* ===== Upload Documents (multi) ===== */}

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
                fileList={fileLists.tpcol_docs || []}
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
                  setFileLists({ tpcol_docs: fileList });
                  handleChange("tpcol_docs", fileList);
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
                        setFileLists({ tpcol_docs: updatedList });
                        handleChange("tpcol_docs", updatedList);
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

            {errors?.tpcol_docs && (
              <div className="error text-danger">{errors.tpcol_docs}</div>
            )}
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default Collateral;
