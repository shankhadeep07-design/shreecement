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
import React, { useEffect, useState } from "react";
import {
  projectMouUploadCreateUpdateApi,
  projectMouUploadDetailsApi,
} from "../../../services/Project-service";
import { deleteDocumentApi } from "../../../services/Project-service";

/* ================= MOU TYPE OPTIONS ================= */
const MOU_TYPE_OPTIONS = [
  { label: "MOU", value: "MOU" },
  { label: "Addendum", value: "Addendum" },
];

/* ================= VALIDATION ================= */
const schema = Yup.object().shape({
  tpmou_title: Yup.string().required("Title is required"),
  tpmou_valid_from: Yup.string().required("Valid From is required"),
  tpmou_valid_to: Yup.string().required("Valid To is required"),
  tpmou_mou_type: Yup.string().required("MOU Type is required"),
});

const ProjectMouUpload = ({ isClosureApproved }) => {
  const tproj_id = useParams()?.tproj_id;

  /* ================= STATE ================= */
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fileLists, setFileLists] = useState({ tpmou_docs: [] });
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    tpmou_id: "",
    tpmou_proposal_id: tproj_id, // ✅ project reference
    tpmou_title: "",
    tpmou_valid_from: null,
    tpmou_valid_to: null,
    tpmou_mou_type: null,
    tpmou_remarks: "",
    tpmou_docs: [],
  });

  /* ================= FETCH LIST ================= */
  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await projectMouUploadDetailsApi({
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
      tpmou_id: "",
      tpmou_proposal_id: tproj_id,
      tpmou_title: "",
      tpmou_valid_from: null,
      tpmou_valid_to: null,
      tpmou_mou_type: null,
      tpmou_remarks: "",
      tpmou_docs: [],
    });
    setFileLists({ tpmou_docs: [] });
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

    setFileLists({ tpmou_docs: fileMap });
    setFormData({
      tpmou_id: record.tpmou_id,
      tpmou_proposal_id: record.tpmou_proposal_id,
      tpmou_title: record.tpmou_title,
      tpmou_valid_from: record.tpmou_valid_from,
      tpmou_valid_to: record.tpmou_valid_to,
      tpmou_mou_type: record.tpmou_mou_type,
      tpmou_remarks: record.tpmou_remarks,
      tpmou_docs: fileMap,
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
        if (key !== "tpmou_docs" && value) {
          payload.append(key, value);
        }
      });

      // ✅ only new files
      formData.tpmou_docs.forEach((file) => {
        if (file.originFileObj) {
          payload.append("tpmou_docs", file.originFileObj);
        }
      });

      const res = await projectMouUploadCreateUpdateApi(payload);
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
    setFileLists({ tpmou_docs: updated });
    handleChange("tpmou_docs", updated);
  };

  /* ================= RENDER ================= */
  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="d-flex justify-content-end mb-3">
        {!isClosureApproved && (
          <button className="btn btn-sm btn-primary" onClick={handleAdd}>
            <i className="fa-solid fa-plus me-1"></i> Add MOU
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
              <th>MOU Type</th>
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
                <td colSpan={8} className="text-center">
                  Loading...
                </td>
              </tr>
            ) : list.length ? (
              list.map((item, index) => (
                <tr key={item.tpmou_id}>
                  <td>{index + 1}</td>
                  <td>{item.tpmou_title || "--"}</td>
                  <td>{item.tpmou_mou_type || "--"}</td>
                  <td>
                    {item.tpmou_valid_from
                      ? dayjs(item.tpmou_valid_from).format("DD MMM YYYY")
                      : "--"}
                  </td>
                  <td>
                    {item.tpmou_valid_to
                      ? dayjs(item.tpmou_valid_to).format("DD MMM YYYY")
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
                    {item.tpmou_remarks || "--"}
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
                <td colSpan={8} className="text-center">
                  No MOU records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL FORM ================= */}
      <Modal
        title={formData.tpmou_id ? "Edit MOU" : "Add MOU"}
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
            {formData.tpmou_id ? "Update" : "Submit"}
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
              value={formData.tpmou_title}
              onChange={(e) => handleChange("tpmou_title", e.target.value)}
              status={errors.tpmou_title ? "error" : ""}
            />
            {errors.tpmou_title && (
              <div style={{ color: "red", fontSize: 12 }}>
                {errors.tpmou_title}
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
                formData.tpmou_valid_from
                  ? dayjs(formData.tpmou_valid_from)
                  : null
              }
              onChange={(d, str) => handleChange("tpmou_valid_from", str)}
              status={errors.tpmou_valid_from ? "error" : ""}
            />
            {errors.tpmou_valid_from && (
              <div style={{ color: "red", fontSize: 12 }}>
                {errors.tpmou_valid_from}
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
                formData.tpmou_valid_to ? dayjs(formData.tpmou_valid_to) : null
              }
              onChange={(d, str) => handleChange("tpmou_valid_to", str)}
              status={errors.tpmou_valid_to ? "error" : ""}
            />
            {errors.tpmou_valid_to && (
              <div style={{ color: "red", fontSize: 12 }}>
                {errors.tpmou_valid_to}
              </div>
            )}
          </Col>

          {/* ===== MOU Type ===== */}
          <Col span={24}>
            <label>
              MOU Type <span style={{ color: "red" }}>*</span>
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder="Select MOU Type"
              value={formData.tpmou_mou_type || undefined}
              onChange={(val) => handleChange("tpmou_mou_type", val)}
              options={MOU_TYPE_OPTIONS}
              status={errors.tpmou_mou_type ? "error" : ""}
            />
            {errors.tpmou_mou_type && (
              <div style={{ color: "red", fontSize: 12 }}>
                {errors.tpmou_mou_type}
              </div>
            )}
          </Col>

          {/* ===== Remarks ===== */}
          <Col span={24}>
            <label>Remarks</label>
            <Input.TextArea
              rows={3}
              placeholder="Enter Remarks"
              value={formData.tpmou_remarks}
              onChange={(e) => handleChange("tpmou_remarks", e.target.value)}
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
                fileList={fileLists.tpmou_docs || []}
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
                  setFileLists({ tpmou_docs: fileList });
                  handleChange("tpmou_docs", fileList);
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
                        setFileLists({ tpmou_docs: updatedList });
                        handleChange("tpmou_docs", updatedList);
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

            {errors?.tpmou_docs && (
              <div className="error text-danger">{errors.tpmou_docs}</div>
            )}
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default ProjectMouUpload;
