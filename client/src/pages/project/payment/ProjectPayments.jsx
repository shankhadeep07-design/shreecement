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
} from "../../../services/Project-service";

import { Descriptions } from "antd";

import { getAllSubScheduleSevenApi } from "../../../services/PriorityAlignment-service";

import { getSubMasterListByMasterSlugApi } from "../../../Services/Master-service";

/* ===================== OPTIONS ===================== */
const yesNoOptions = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

const paymentTypeOptions = [
  { label: "Online", value: "online" },
  { label: "Offline", value: "offline" },
];

const gstApplicableOptions = [
  { label: "Applicable", value: "yes" },
  { label: "Not Applicable", value: "no" },
];

const ProjectPayments = ({ isClosureApproved }) => {
  const { tproj_id } = useParams();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [editData, setEditData] = useState(null);

  /* ===================== FETCH PAYMENTS ===================== */
  const fetchPaymentDetails = () => {
    projectPaymentDetailsApi({
      tproj_id,
      tbad_transfer_type: "purchase_payment",
    })
      .then(({ data }) => setPaymentDetails(data || []))
      .catch(() => toast.error("Failed to load payment details"));
  };

  /* ===================== SUBMIT ===================== */
  const handleSubmit = async (values) => {
    try {
      const payload = new FormData();

      payload.append("tproj_id", tproj_id);
      payload.append("payment_type", values.payment_type); // ✅ PAYMENT TYPE

      payload.append("invoice_base_value", values.base_value);
      payload.append("invoice_gst_applicable", values.gst_applicable);
      payload.append("invoice_gst_amount", values.gst_amount || 0);
      payload.append("invoice_tds_applicable", values.tds_applicable);

      payload.append("remaining_balance", values.balance_amount || 0);

      if (editData?.tbad_id) {
        payload.append("tbad_id", editData.tbad_id);
      }

      if (values.invoice_file?.[0]?.originFileObj) {
        payload.append("invoice_file", values.invoice_file[0].originFileObj);
      }

      setLoading(true);
      const res = await projectPaymentCreateUpdateApi(payload);

      if (!res?.success) {
        toast.error("Failed to save payment");
        return;
      }

      toast.success(
        editData
          ? "Payment updated successfully"
          : "Payment added successfully",
      );

      handleCancel();
      fetchPaymentDetails();
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Something went wrong";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tproj_id) {
      fetchPaymentDetails();
    }
  }, [tproj_id]);

  const mapDocToUploadFile = (doc) => ({
    uid: doc.tdoc_id, // unique key
    name: doc.file_name, // file name
    status: "done",
    url: doc.full_url, // preview/download
    originFileObj: null, // IMPORTANT for edit mode
  });

  /* ===================== EDIT ===================== */
  const handleEdit = (payment) => {
    setEditData(payment);
    setIsModalVisible(true);

    const existingInvoice =
      payment?.documents?.length > 0
        ? payment.documents.map(mapDocToUploadFile)
        : [];

    form.setFieldsValue({
      payment_type: payment.tbad_payment_type,
      base_value: payment.tbad_used_budget,
      gst_applicable: payment.tbad_gst_applicable,
      gst_amount: payment.tbad_gst_amount,
      tds_applicable: payment.tbad_tds_applicable,
      invoice_file: existingInvoice, // ✅ NOW SHOWS
    });
  };

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
            <h5 className="mb-0">Project Payments</h5>

            {!isClosureApproved && (
              /* <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  form.resetFields();
                  setEditData(null);
                  setIsModalVisible(true);
                }}
              >
                Add
              </Button> */
              null
            )}
          </div>

          {/* ===== Modal (unchanged logic) ===== */}
          <Modal
            title={editData ? "Edit Payment" : "Add Payment"}
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
              {/* ✅ Invoice Details — Col layout instead of Table */}
              <Row gutter={16}>
                {/* Base Value */}
                <Col span={8}>
                  <Form.Item
                    label="Title"
                    name="base_value"
                    rules={[
                      { required: true, message: "Base value is required" },
                    ]}
                  >
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>

                {/* GST Applicable */}
                <Col span={8}>
                  <Form.Item
                    label="Payment Term"
                    name="gst_applicable"
                    rules={[
                      { required: true, message: "Select GST applicability" },
                    ]}
                  >
                    <Select options={gstApplicableOptions} />
                  </Form.Item>
                </Col>

                {/* GST Amount */}
                <Col span={8}>
                  <Form.Item label="GST Amount" name="gst_amount">
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>

                {/* TDS Applicable */}
                <Col span={8}>
                  <Form.Item
                    label="TDS Applicable"
                    name="tds_applicable"
                    rules={[
                      { required: true, message: "Select TDS applicability" },
                    ]}
                  >
                    <Select options={yesNoOptions} />
                  </Form.Item>
                </Col>

                {/* Invoice Upload */}
                <Col span={8}>
                  <Form.Item
                    label="Invoice Upload"
                    name="invoice_file"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => e?.fileList?.slice(-1)}
                    rules={[
                      { required: true, message: "Upload invoice document" },
                    ]}
                  >
                    <Upload beforeUpload={() => false} maxCount={1}>
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
                  <th>Payment Terms</th>
                  <th>Amount (INR)</th>
                  <th>Fund Received Till Date (INR)</th>
                  <th>Fund Spent Till Date (INR)</th>
                  <th>Spent %</th>
                  <th>Remarks</th>
                  {/* <th style={{ width: "120px" }}>Action</th> */}
                </tr>
              </thead>

              <tbody>
                {paymentDetails.length ? (
                  paymentDetails.map((p, index) => (
                    <tr key={p.tpay_id}>
                      <td>{index + 1}</td>
                      <td>{p.tpay_payment_terms || "-"}</td>
                      <td>₹ {p.tpay_amount?.toLocaleString("en-IN") || "0"}</td>
                      <td>
                        ₹{" "}
                        {p.tpay_fund_received_till_date?.toLocaleString(
                          "en-IN",
                        ) || "0"}
                      </td>
                      <td>
                        ₹{" "}
                        {p.tpay_fund_spent_till_date?.toLocaleString("en-IN") ||
                          "0"}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            p.tpay_spent_percentage >= 90
                              ? "bg-danger"
                              : p.tpay_spent_percentage >= 60
                                ? "bg-warning text-dark"
                                : "bg-success"
                          }`}
                        >
                          {p.tpay_spent_percentage ?? "0"} %
                        </span>
                      </td>
                      <td>{p.tpay_remarks || "-"}</td>
                      <td>
                        {!isClosureApproved && (
                          /* <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(p)}
                          >
                            <i className="fa-solid fa-pen"></i> Edit
                          </button> */
                          null
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center">
                      No payment records found
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

export default ProjectPayments;
