import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Form,
  Input,
  DatePicker,
  Upload,
  Row,
  Col,
  Tooltip,
  Modal,
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

/* ================= VALIDATION ================= */
const schema = Yup.object().shape({
  tpfr_title: Yup.string().required("Title is required"),
  tpfr_date: Yup.string().required("Date is required"),
  tpfr_details: Yup.string().required("Details are required"),
});

const FinancialReport = () => {
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
      if (res?.status) setList(res.data || []);
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

      // only new files
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
  const removeFile = (file, list) => {
    const updated = list.filter((f) => f.uid !== file.uid);
    setFileLists({ tpfr_docs: updated });
    handleChange("tpfr_docs", updated);
  };

  /* ================= TABLE ================= */
  const columns = [
    { title: "Title", dataIndex: "tpfr_title" },
    {
      title: "Date",
      dataIndex: "tpfr_date",
      render: (d) => (d ? dayjs(d).format("DD-MM-YYYY") : "-"),
    },
    {
      title: "Details",
      dataIndex: "tpfr_details",
      ellipsis: true,
    },
    {
      title: "Action",
      render: (_, record) => (
        <Button type="link" onClick={() => handleEdit(record)}>
          Edit
        </Button>
      ),
    },
  ];

  /* ================= RENDER ================= */
  return (
    <>
      {/* ================= LIST VIEW ================= */}
      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Financial Report
        </Button>
      </div>

      <Table
        dataSource={list}
        columns={columns}
        rowKey="tpfr_id"
        loading={loading}
      />

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
              <Tooltip title="Supported formats: JPG, JPEG, PNG, WebP">
                <InfoCircleOutlined style={{ marginLeft: 6 }} />
              </Tooltip>
            </label>

            <Upload
              multiple
              beforeUpload={() => false}
              fileList={fileLists.tpfr_docs}
              onChange={({ fileList }) => {
                setFileLists({ tpfr_docs: fileList });
                handleChange("tpfr_docs", fileList);
              }}
              showUploadList={{ showRemoveIcon: false }}
              itemRender={(node, file, list) => (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  {node}
                  <DeleteOutlined
                    onClick={() => removeFile(file, list)}
                    style={{ color: "red", cursor: "pointer" }}
                  />
                </div>
              )}
            >
              <Button icon={<UploadOutlined />} style={{ marginTop: 6 }}>
                Upload Files
              </Button>
            </Upload>
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default FinancialReport;
