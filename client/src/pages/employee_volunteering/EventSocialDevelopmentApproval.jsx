import React, { useEffect, useState } from "react";
import {
  Button,
  Divider,
  Form,
  Modal,
  Space,
  Table,
  Typography,
  Card,
  Tag,
  Row,
  Col,
  Avatar, Tooltip, 
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  SendOutlined,
  FileSearchOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleTwoTone,
  ReloadOutlined,
} from "@ant-design/icons";
import toast, { Toaster } from "react-hot-toast";
import TextArea from "antd/es/input/TextArea";
import {
  approveNotificationApi,
  getApprovalTrackApi,
  getPendingNotificationDetailsApi,
  sendForApprovalEventsNotificationApi,
} from "../../services/Notification-service";
import { userDetails } from "../../auth/auth";

const { Title, Text } = Typography;


export default function EventSocialDevelopmentApproval(
    {
  eventDetails,
  event_id,
  fetchEventDetailsFunApi,
  handleFetchPendingUser,
}
) {
    
  const { tevent_status , tevent_created_by} = eventDetails;
  const [formData, setFormData] = useState({ remarks: "" });
  const [pendingNotification, setPendingNotification] = useState([]);
  const [approvalTrack, setApprovalTrack] = useState([]);
  const [status, setStatus] = useState(null);
  const [isSentForApproval, setIsSentForApproval] = useState(
    tevent_status == "send_for_approval" || tevent_status == "approved" || tevent_status == "published"
  );

  console.log(isSentForApproval);

  let user_id = userDetails()?.id || 0;

  useEffect(() => {
    approvalTrackFun();
    fetchPendingNotificationFunApi();
  }, [event_id]);

  const approvalTrackFun = () => {
    getApprovalTrackApi({ item_id: event_id })
      .then((res) => setApprovalTrack(res.data || []))
      .catch(() => {});
  };

  const fetchPendingNotificationFunApi = () => {
    getPendingNotificationDetailsApi({ item_id: event_id })
      .then((res) => setPendingNotification(res?.data || []))
      .catch((error) => {
        toast.error(
          error?.response?.data?.originalError ||
            error?.response?.data?.message ||
            "Failed to fetch pending notifications"
        );
      });
  };

  const sendForApproval = () => {
    if (!formData.remarks.trim()) {
      toast.error("Please add remarks before proceeding");
      return;
    }

    Modal.confirm({
      title: "Send event for approval?",
      icon: <SendOutlined style={{ color: "#1890ff" }} />,
      content: "This action cannot be undone.",
      onOk() {
        sendForApprovalEventsNotificationApi({
          item_id: event_id,
          status: "send_for_approval",
          remarks: formData.remarks,
        })
          .then((res) => {
            if (res.status === 1) {
              toast.success("Event sent for approval successfully");
              setFormData({ remarks: "" });
              setIsSentForApproval(true);
              approvalTrackFun();
              handleFetchPendingUser();
            } else {
              toast.error("Failed to send for approval");
            }
          })
          .catch(() => toast.error("Something went wrong"));
      },
      okText: "Yes, send",
      cancelText: "Cancel",
    });
  };

  const handleAction = (actionStatus) => {
    if (!formData.remarks.trim()) {
      toast.error("Please add remarks before proceeding");
      return;
    }

    setStatus(actionStatus);

    Modal.confirm({
      title: `Are you sure you want to ${actionStatus} this event?`,
      icon:
        actionStatus === "approved" ? (
          <CheckCircleOutlined style={{ color: "#52c41a" }} />
        ) : actionStatus === "rejected" ? (
          <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
        ) : (
          <ReloadOutlined style={{ color: "#722ed1" }} />
        ),
      content: "This action cannot be undone.",
      onOk() {
        approveNotificationApi({
          approval_item_id: event_id,
          approval_status: actionStatus,
          approval_remarks: formData.remarks,
          approval_type: "event",
        })
          .then((res) => {
            if (res.status) {
              toast.success(`Event ${actionStatus} successfully`);
              fetchPendingNotificationFunApi();
              approvalTrackFun();
              setFormData({ remarks: "" });
              handleFetchPendingUser();
              fetchEventDetailsFunApi();
            } else {
              toast.error(`Failed to ${actionStatus} event`);
            }
          })
          .catch(() => toast.error("Something went wrong"));
      },
      okText: `Yes, ${actionStatus}`,
      cancelText: "Cancel",
    });
  };

 
const columns = [
  {
    title: "Step",
    dataIndex: "apt_accept_step",
    render: (step) => {
      const stepMap = {
        initial: { label: "🧩 Initial", color: "gold" },
        resend: { label: "🔁 Resend", color: "purple" },
        reviewed: { label: "🔍 Reviewed", color: "blue" },
        approved: { label: "✅ Approved", color: "green" },
      };
      const current = stepMap[step] || { label: step, color: "default" };
      return (
        <Tag
          color={current.color}
          style={{ fontWeight: 500, fontSize: "13px", borderRadius: "8px" }}
        >
          {current.label}
        </Tag>
      );
    },
  },
  {
    title: "User",
    dataIndex: "name",
    render: (name) => (
      <Space>
        <Avatar
          style={{
            backgroundColor: "#1677ff",
            verticalAlign: "middle",
            fontSize: "13px",
          }}
          icon={<UserOutlined />}
        />
        <Text strong>{name || "Unknown User"}</Text>
      </Space>
    ),
  },
  {
    title: "Date",
    dataIndex: "apt_created_at",
    render: (val) => (
      <Tooltip title={new Date(val).toLocaleString()}>
        <Text type="secondary" style={{ fontSize: "13px" }}>
          <ClockCircleOutlined style={{ marginRight: 5, color: "#1677ff" }} />
          {new Date(val).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}{" "}
          |{" "}
          {new Date(val).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </Tooltip>
    ),
  },
  {
    title: "Status",
    dataIndex: "apt_accept_status",
    render: (status) => {
      const statusMap = {
        send_for_approval: { label: "📤 Sent for Approval", color: "gold" },
        resend: { label: "🔁 Resend", color: "purple" },
        reject: { label: "❌ Rejected", color: "red" },
        approved: { label: "🎉 Approved", color: "green" },
      };
      const current = statusMap[status] || { label: status, color: "default" };
      return (
        <Tag
          color={current.color}
          style={{ fontWeight: 500, fontSize: "13px", borderRadius: "8px" }}
        >
          {current.label}
        </Tag>
      );
    },
  },
  {
    title: "Remarks",
    dataIndex: "apt_remarks",
    render: (text) => (
      <Text
        style={{
          fontSize: "13px",
          color: text ? "#333" : "#999",
          fontStyle: text ? "normal" : "italic",
        }}
      >
        {text || "— No remarks —"}
      </Text>
    ),
  },
];

  return (
    <div style={{ padding: 20, backgroundColor: "#f9fafc" }}>
      <Toaster position="top-right" />

      <Row gutter={[16, 16]}>
        {!isSentForApproval && tevent_created_by === user_id && (
          <Col span={24}>
            <Card
              title={
                <>
                  <SendOutlined /> Send For Approval
                </>
              }
              bordered={false}
              style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}
            >
              <Form layout="vertical">
                <Form.Item label="Remarks">
                  <TextArea
                    rows={3}
                    value={formData.remarks}
                    onChange={(e) =>
                      setFormData({ ...formData, remarks: e.target.value })
                    }
                    placeholder="Add your remarks..."
                  />
                </Form.Item>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={sendForApproval}
                >
                  Send for Approval
                </Button>
              </Form>
            </Card>
          </Col>
        )}

        {eventDetails?.tevent_status !== "approved" && eventDetails?.tevent_status !== "published" &&
          pendingNotification.length > 0 && (
            <Col span={24}>
              <Card
                title={
                  <>
                    <FileSearchOutlined /> Pending Notification
                  </>
                }
                bordered={false}
                style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}
              >
                <Form layout="vertical">
                  <Form.Item label="Remarks">
                    <TextArea
                      rows={3}
                      value={formData.remarks}
                      onChange={(e) =>
                        setFormData({ ...formData, remarks: e.target.value })
                      }
                      placeholder="Add your remarks..."
                    />
                  </Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleAction("approved")}
                    >
                      Accept
                    </Button>
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={() => handleAction("rejected")}
                    >
                      Reject
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => handleAction("resend")}
                    >
                      Resend
                    </Button>
                  </Space>
                </Form>
              </Card>
            </Col>
          )}

        <Col span={24}>
          <Card
            title={
              <>
                <ClockCircleOutlined /> Approval Track
              </>
            }
            bordered={false}
            style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}
          >
            <Table
              bordered
              size="small"
              dataSource={approvalTrack}
              columns={columns}
              rowKey={(record, index) => index}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
