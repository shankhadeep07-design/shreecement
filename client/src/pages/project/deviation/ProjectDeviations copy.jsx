import { UploadOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Upload,
  Select,
  Table,
  InputNumber,
} from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  projectDetailsApi,
  projectPaymentCreateUpdateApi,
  projectPaymentDetailsApi,
  projectDeviationCreateUpdateApi,
  projectDeviationDetailsApi,
} from "../../../services/Project-service";

import { Descriptions } from "antd";

import { getAllSubScheduleSevenApi } from "../../../services/PriorityAlignment-service";

import { getSubMasterListByMasterSlugApi } from "../../../Services/Master-service";

const deviationTypeOptions = [
  { label: "Schedule Deviation", value: "schedule_deviation" },
  { label: "Cost Deviation", value: "cost_deviation" },
];

const ProjectDeviations = () => {
  const { tproj_id } = useParams();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deviationList, setDeviationList] = useState([]);
  const [editData, setEditData] = useState(null);

  /* ===================== FETCH DEVIATIONS ===================== */
  const fetchDeviationList = () => {
    projectDeviationDetailsApi({ tproj_id })
      .then(({ data }) => setDeviationList(data || []))
      .catch(() => toast.error("Failed to load deviation list"));
  };

  useEffect(() => {
    if (tproj_id) {
      fetchDeviationList();
    }
  }, [tproj_id]);

  /* ===================== SUBMIT ===================== */
  const handleSubmit = async (values) => {
    try {
      const payload = new FormData();

      payload.append("tproj_id", tproj_id);
      payload.append("tpdev_deviation_type", values.tpdev_deviation_type);
      payload.append("tpdev_no_of_days", values.tpdev_no_of_days || 0);
      payload.append("tpdev_amount", values.tpdev_amount || 0);
      payload.append("tpdev_brief_fact", values.tpdev_brief_fact);
      payload.append(
        "tpdev_reason_for_deviation",
        values.tpdev_reason_for_deviation,
      );
      payload.append("tpdev_program_change", values.tpdev_program_change);

      if (editData?.tpdev_id) {
        payload.append("tpdev_id", editData.tpdev_id);
      }

      if (values.document_upload?.length > 0) {
        values.document_upload.forEach((file) => {
          if (file?.originFileObj) {
            payload.append("document_upload", file.originFileObj); // ✅ appends each file
          }
        });
      }
      setLoading(true);
      const res = await projectDeviationCreateUpdateApi(payload);

      if (!res?.success) {
        toast.error("Failed to save deviation");
        return;
      }

      toast.success(
        editData
          ? "Deviation updated successfully"
          : "Deviation added successfully",
      );

      handleCancel();
      fetchDeviationList();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const mapDocToUploadFile = (doc) => ({
    uid: doc.tdoc_id,
    name: doc.file_name,
    status: "done",
    url: doc.full_url,
    originFileObj: null,
  });

  /* ===================== EDIT ===================== */
  const handleEdit = (record) => {
    setEditData(record);
    setIsModalVisible(true);

    const existingDocs =
      record?.documents?.length > 0
        ? record.documents.map(mapDocToUploadFile)
        : [];

    form.setFieldsValue({
      tpdev_deviation_type: record.tpdev_deviation_type,
      tpdev_no_of_days: record.tpdev_no_of_days,
      tpdev_amount: record.tpdev_amount,
      tpdev_brief_fact: record.tpdev_brief_fact,
      tpdev_reason_for_deviation: record.tpdev_reason_for_deviation,
      tpdev_program_change: record.tpdev_program_change,
      document_upload: existingDocs,
    });
  };

  /* ===================== CANCEL ===================== */
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditData(null);
    form.resetFields();
  };

  /* ===================== UI ===================== */
  return (
    <>
      <div className="home-content">
        <div className="card pb-3">
          {/* ===== Card Header ===== */}
          <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
            <h5 className="mb-0">Project Deviations</h5>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                setEditData(null);
                setIsModalVisible(true);
              }}
            >
              Add
            </Button>
          </div>

          {/* ===== Modal ===== */}
          <Modal
            title={editData ? "Edit Deviation" : "Add Deviation"}
            open={isModalVisible}
            onCancel={handleCancel}
            width={1200}
            footer={[
              <Button key="c" onClick={handleCancel}>
                Cancel
              </Button>,
              <Button
                key="s"
                type="primary"
                loading={loading}
                onClick={() => form.submit()}
              >
                {editData ? "Update" : "Submit"}
              </Button>,
            ]}
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Row gutter={16}>
                {/* Change In Deviation Type */}
                <Col span={8}>
                  <Form.Item
                    label="Change In Deviation Type"
                    name="tpdev_deviation_type"
                    rules={[
                      {
                        required: true,
                        message: "Please select deviation type",
                      },
                    ]}
                  >
                    <Select
                      options={deviationTypeOptions}
                      placeholder="Select deviation type"
                    />
                  </Form.Item>
                </Col>

                {/* No Of Days */}
                <Col span={8}>
                  <Form.Item label="No Of Days" name="tpdev_no_of_days">
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      placeholder="Enter no of days"
                    />
                  </Form.Item>
                </Col>

                {/* Amount (INR) */}
                <Col span={8}>
                  <Form.Item label="Amount (INR)" name="tpdev_amount">
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      placeholder="Enter amount"
                    />
                  </Form.Item>
                </Col>

                {/* Brief Fact */}
                <Col span={12}>
                  <Form.Item
                    label="Brief Fact"
                    name="tpdev_brief_fact"
                    rules={[
                      { required: true, message: "Brief fact is required" },
                    ]}
                  >
                    <Input.TextArea rows={3} placeholder="Enter brief fact" />
                  </Form.Item>
                </Col>

                {/* Reason For Deviation */}
                <Col span={12}>
                  <Form.Item
                    label="Reason For Deviation"
                    name="tpdev_reason_for_deviation"
                    rules={[
                      {
                        required: true,
                        message: "Reason for deviation is required",
                      },
                    ]}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Enter reason for deviation"
                    />
                  </Form.Item>
                </Col>

                {/* Program Change — ✅ Input field */}
                <Col span={8}>
                  <Form.Item
                    label="Program Change"
                    name="tpdev_program_change"
                    rules={[
                      {
                        required: true,
                        message: "Please enter program change",
                      },
                    ]}
                  >
                    <Input placeholder="Enter program change" />
                  </Form.Item>
                </Col>

                {/* Document Upload */}

                <Col span={8}>
                  <Form.Item
                    label="Document Upload"
                    name="document_upload"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => e?.fileList}
                    rules={[
                      {
                        required: true,
                        message: "Please upload at least one document",
                      },
                    ]}
                  >
                    <Upload beforeUpload={() => false} multiple={true}>
                      <Button icon={<UploadOutlined />}>Upload</Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>

          {/* ===== Table ===== */}
          <div
            className="card-body at-elevation-z6 table-box"
            style={{ maxHeight: "calc(100vh - 23vh)", overflowX: "auto" }}
          >
            <table className="table table-bordered table-yellow dataTable">
              <thead className="table-warning">
                <tr>
                  <th>#</th>
                  <th>Deviation Type</th>
                  <th>No Of Days</th>
                  <th>Amount (INR)</th>
                  <th>Brief Fact</th>
                  <th>Reason For Deviation</th>
                  <th>Program Change</th>
                  {/* <th>Documents</th> */}
                  <th style={{ width: "120px" }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {deviationList.length ? (
                  deviationList.map((d, index) => (
                    <tr key={d.tpdev_id}>
                      <td>{index + 1}</td>
                      <td>
                        {d.tpdev_deviation_type
                          ? d.tpdev_deviation_type
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())
                          : "--"}
                      </td>
                      <td>{d.tpdev_no_of_days ?? "--"}</td>
                      <td>{d.tpdev_amount ? `₹ ${d.tpdev_amount}` : "--"}</td>
                      <td>{d.tpdev_brief_fact || "--"}</td>
                      <td>{d.tpdev_reason_for_deviation || "--"}</td>
                      <td>{d.tpdev_program_change || "--"}</td>

                      {/* Action */}
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(d)}
                        >
                          <i className="fa-solid fa-pen"></i> Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center">
                      No deviation records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDeviations;
