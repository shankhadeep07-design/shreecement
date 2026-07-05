import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Input,
  Modal,
  Row,
  Upload,
  Select,
  InputNumber,
  Tooltip,
  Popconfirm,
} from "antd";

import {
  projectDeviationCreateUpdateApi,
  projectDeviationDetailsApi,
  deleteDocumentApi,
} from "../../../services/Project-service";

/* ================= VALIDATION SCHEMA ================= */
const schema = Yup.object().shape({
  tpdev_deviation_type: Yup.string().required("Deviation type is required"),
  tpdev_brief_fact: Yup.string()
    .required("Brief fact is required")
    .max(300, "Brief fact must be at most 300 characters"),

  tpdev_reason_for_deviation: Yup.string()
    .required("Reason is required")
    .max(300, "Reason must be at most 300 characters"),

  tpdev_program_change: Yup.string()
    .required("Program change is required")
    .max(255, "Program change must be at most 255 characters"),
});

const DEVIATION_TYPE_OPTIONS = [
  { label: "Schedule Deviation", value: "schedule_deviation" },
  { label: "Cost Deviation", value: "cost_deviation" },
];

const NUMBER_REGEX = {
  integer: /^[0-9]*$/,
  decimal: /^[0-9]*\.?[0-9]*$/,
};

const ProjectDeviations = ({ isClosureApproved }) => {
  const { tproj_id } = useParams();

  /* ================= STATE ================= */
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fileLists, setFileLists] = useState({ tpdev_docs: [] });
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    tpdev_id: "",
    tproj_id: tproj_id,
    tpdev_deviation_type: null,
    tpdev_no_of_days: 0,
    tpdev_amount: 0,
    tpdev_brief_fact: "",
    tpdev_reason_for_deviation: "",
    tpdev_program_change: "",
    tpdev_docs: [],
  });

  /* ================= FETCH LIST ================= */
  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await projectDeviationDetailsApi({ tproj_id });
      if (res?.data) setList(res.data || []);
    } catch {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tproj_id) fetchList();
  }, [tproj_id]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (name, value) => {
    //console.log("field:", name, "| value:", value, "| type:", typeof value);

    if (typeof value === "string") {
      value = value.replace(/^\s+/, "");
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= RESET FORM ================= */
  const resetForm = () => {
    setFormData({
      tpdev_id: "",
      tproj_id: tproj_id,
      tpdev_deviation_type: null,
      tpdev_no_of_days: 0,
      tpdev_amount: 0,
      tpdev_brief_fact: "",
      tpdev_reason_for_deviation: "",
      tpdev_program_change: "",
      tpdev_docs: [],
    });
    setFileLists({ tpdev_docs: [] });
    setErrors({});
  };

  /* ================= MODAL ACTIONS ================= */
  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    const fileMap = (record?.documents || []).map((doc) => ({
      uid: doc.tdoc_id,
      name: doc.file_name || "Attachment",
      status: "done",
      url: doc.full_url,
    }));

    setFileLists({ tpdev_docs: fileMap });
    setFormData({
      tpdev_id: record.tpdev_id,
      tproj_id: tproj_id,
      tpdev_deviation_type: record.tpdev_deviation_type,
      tpdev_no_of_days: record.tpdev_no_of_days ?? 0, // FIX 3: fallback 0
      tpdev_amount: record.tpdev_amount ?? 0, // FIX 3: fallback 0
      tpdev_brief_fact: record.tpdev_brief_fact,
      tpdev_reason_for_deviation: record.tpdev_reason_for_deviation,
      tpdev_program_change: record.tpdev_program_change,
      tpdev_docs: fileMap,
    });
    setErrors({});
    setIsModalOpen(true);
  };

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

      // FIX 1: Skip tpdev_docs (handled separately)
      //        Skip null/undefined
      //        Skip empty string (prevents blank tpdev_id on Add)
      //        Allow 0 (number) so days/amount are always sent
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "tpdev_docs") return;
        if (value === null || value === undefined) return;
        if (typeof value === "string" && value === "") return;
        payload.append(key, value);
      });

      // Append only NEW files (originFileObj = newly selected, not already saved)
      formData.tpdev_docs.forEach((file) => {
        if (file.originFileObj) {
          payload.append("document_upload", file.originFileObj);
        }
      });

      const res = await projectDeviationCreateUpdateApi(payload);
      if (res?.status || res?.success) {
        toast.success(
          formData.tpdev_id ? "Updated successfully" : "Submitted successfully",
        );
        fetchList();
        handleCloseModal();
      }
    } catch (err) {
      if (err.inner) {
        const e = {};
        err.inner.forEach((x) => (e[x.path] = x.message));
        setErrors(e);
      } else {
        toast.error(err.message || "Something went wrong");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="home-content">
      <div className="card pb-3">
        <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
          <h5 className="mb-0">Project Deviations</h5>
          {!isClosureApproved && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Add Deviation
            </Button>
          )}
        </div>

        {/* ================= TABLE ================= */}
        <div
          className="card-body at-elevation-z6 table-box"
          style={{ maxHeight: "60vh", overflowY: "auto" }}
        >
          <table className="table table-bordered table-yellow">
            <thead className="table-warning sticky-top">
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Days</th>
                <th>Amount</th>
                <th>Brief Fact</th>
                <th>Reason For Deviation</th>
                <th>Program Change</th>
                <th style={{ width: "100px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : list.length > 0 ? (
                list.map((item, index) => (
                  <tr key={item.tpdev_id}>
                    <td>{index + 1}</td>
                    <td className="text-capitalize">
                      {item.tpdev_deviation_type?.replace(/_/g, " ")}
                    </td>
                    <td>{item.tpdev_no_of_days}</td>
                    <td>{item.tpdev_amount}</td>
                    <td>{item.tpdev_brief_fact}</td>
                    <td>{item.tpdev_reason_for_deviation}</td>
                    <td>{item.tpdev_program_change}</td>
                    <td>
                      {!isClosureApproved && (
                        <Button
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= MODAL FORM ================= */}
        <Modal
          title={formData.tpdev_id ? "Edit Deviation" : "Add Deviation"}
          open={isModalOpen}
          onCancel={handleCloseModal}
          width={800}
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
              {formData.tpdev_id ? "Update" : "Submit"}
            </Button>,
          ]}
        >
          <Row gutter={[12, 16]} style={{ marginTop: 8 }}>
            <Col span={12}>
              <label>
                Deviation Type <span className="text-danger">*</span>
              </label>
              <Select
                style={{ width: "100%" }}
                placeholder="Select type"
                value={formData.tpdev_deviation_type}
                onChange={(val) => handleChange("tpdev_deviation_type", val)}
                options={DEVIATION_TYPE_OPTIONS}
                status={errors.tpdev_deviation_type ? "error" : ""}
              />
              {errors.tpdev_deviation_type && (
                <div className="text-danger" style={{ fontSize: 12 }}>
                  {errors.tpdev_deviation_type}
                </div>
              )}
            </Col>

            {/* FIX 2: val ?? 0 prevents null when user clears the InputNumber */}
            <Col span={6}>
              <label>No Of Days</label>
              <Input
                style={{ width: "100%" }}
                min={0}
                value={formData.tpdev_no_of_days}
                // onChange={(val) => handleChange("tpdev_no_of_days", val ?? 0)}

                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== "" && !NUMBER_REGEX.integer.test(val)) return; // allows decimals
                  handleChange("tpdev_no_of_days", val);
                }}
              />
            </Col>

            <Col span={6}>
              <label>Amount (INR)</label>
              <Input
                style={{ width: "100%" }}
                min={0}
                value={formData.tpdev_amount}
                //onChange={(val) => handleChange("tpdev_amount", val ?? 0)}

                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== "" && !NUMBER_REGEX.decimal.test(val)) return; // allows decimals
                  handleChange("tpdev_amount", val);
                }}
              />
            </Col>

            <Col span={24}>
              <label>
                Brief Fact <span className="text-danger">*</span>
              </label>
              <Input.TextArea
                rows={2}
                value={formData.tpdev_brief_fact}
                onChange={(e) =>
                  handleChange("tpdev_brief_fact", e.target.value)
                }
                status={errors.tpdev_brief_fact ? "error" : ""}
              />
              {errors.tpdev_brief_fact && (
                <div className="text-danger" style={{ fontSize: 12 }}>
                  {errors.tpdev_brief_fact}
                </div>
              )}
            </Col>

            <Col span={24}>
              <label>
                Reason For Deviation <span className="text-danger">*</span>
              </label>
              <Input.TextArea
                rows={2}
                value={formData.tpdev_reason_for_deviation}
                onChange={(e) =>
                  handleChange("tpdev_reason_for_deviation", e.target.value)
                }
                status={errors.tpdev_reason_for_deviation ? "error" : ""}
              />
              {errors.tpdev_reason_for_deviation && (
                <div className="text-danger" style={{ fontSize: 12 }}>
                  {errors.tpdev_reason_for_deviation}
                </div>
              )}
            </Col>

            <Col span={24}>
              <label>
                Program Change <span className="text-danger">*</span>
              </label>
              <Input
                value={formData.tpdev_program_change}
                onChange={(e) =>
                  handleChange("tpdev_program_change", e.target.value)
                }
                status={errors.tpdev_program_change ? "error" : ""}
              />
              {errors.tpdev_program_change && (
                <div className="text-danger" style={{ fontSize: 12 }}>
                  {errors.tpdev_program_change}
                </div>
              )}
            </Col>

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
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpeg,.jpg,.png"
                  fileList={fileLists.tpdev_docs || []}
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
                    if (!allowedTypes.includes(file.type)) {
                      toast.error("Invalid file format");
                      return Upload.LIST_IGNORE;
                    }
                    if (file.size / 1024 / 1024 >= 15) {
                      toast.error("File must be smaller than 15MB");
                      return Upload.LIST_IGNORE;
                    }
                    return false; // prevent auto upload
                  }}
                  onChange={({ fileList }) => {
                    setFileLists({ tpdev_docs: fileList });
                    handleChange("tpdev_docs", fileList);
                  }}
                  showUploadList={{ showRemoveIcon: false }}
                  itemRender={(originNode, file, currFileList) => (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>{originNode}</div>
                      <Popconfirm
                        title="Are you sure you want to delete this file?"
                        onConfirm={async () => {
                          if (file?.uid && !file.originFileObj) {
                            try {
                              await deleteDocumentApi({ tdoc_id: file.uid });
                              toast.success("File deleted successfully");
                              fetchList();
                            } catch {
                              toast.error("Failed to delete file");
                              return;
                            }
                          }
                          const updated = currFileList.filter(
                            (f) => f.uid !== file.uid,
                          );
                          setFileLists({ tpdev_docs: updated });
                          handleChange("tpdev_docs", updated);
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
            </Col>
          </Row>
        </Modal>
      </div>
    </div>
  );
};

export default ProjectDeviations;
