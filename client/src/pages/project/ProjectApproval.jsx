import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Steps,
  Table,
  Tag,
  Typography,
  Space,
  Empty,
} from "antd";
import React, { useEffect, useState } from "react";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SendOutlined,
  UserOutlined,
  AuditOutlined,
  RollbackOutlined,
  MessageOutlined,
  InfoCircleOutlined,
  FlagOutlined,
  EyeOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";
import { userDetails } from "../../auth/auth";
import {
  approveNotificationApi,
  approveProjectNotificationApi,
  getApprovalTrackApi,
  getNotificationDetailsApi,
} from "../../services/Notification-service";
import { myRoleDetailsApi } from "../../services/Role-service";
import { approvalUsersApi } from "../../services/Common-service";
import { submitProjectService } from "../../services/Project-service";
import { convertToTimezone } from "../../helper/common";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ProjectApproval = ({ 
  projectData, 
  onRefresh, 
  handleFetchPendingUser, 
  pendingDetails,
  onlyActions = false,
  onlyTrack = false
}) => {
  const [user, setUser] = useState(userDetails());
  const [loading, setLoading] = useState(false);
  const [approvalTrack, setApprovalTrack] = useState([]);
  const [approvalForm, setApprovalForm] = useState({
    status: "",
    remarks: "",
    user_id: null,
  });

  const [notificationCheck, setNotificationCheck] = useState([]);
  const [approvalNextDetails, setApprovalNextDetails] = useState({});
  const [approvalPreviousDetails, setApprovalPreviousDetails] = useState({});
  const [approvalPresentDetails, setApprovalPresentDetails] = useState({});
  const [approvalUsers, setApprovalUsers] = useState([]);
  const [approvalPreviousUsers, setApprovalPreviousUsers] = useState([]);
  const [roleDetails, setRoleDetails] = useState([]);
  const [dopMax, setDopMax] = useState(0);

  const tproj_id = projectData?.tproj_id;

  useEffect(() => {
    if (tproj_id) {
      handleFetchApprovalTrack();
      myRoleDetailsFun();
      notificationFun();
    }
  }, [tproj_id]);

  useEffect(() => {
    if (projectData && projectData.tproj_id) {
        approvalUsersFun();
        approvalPresentUsersFun();
        approvalPreviousUsersFun();
    }
  }, [projectData]);

  const myRoleDetailsFun = () => {
    myRoleDetailsApi({ role_id: user.role_id })
      .then((data) => {
        setRoleDetails(data?.data || []);
        if (data?.data?.length > 0) {
          setDopMax(data?.data[0]?.trl_max_access_amount || 0);
        }
      })
      .catch((err) => console.error("Role details error", err));
  };

  const notificationFun = () => {
    const data = {
      item_id: tproj_id,
      user_id: user?.id || 0,
      not_action_taken: "N",
    };
    getNotificationDetailsApi(data)
      .then((res) => setNotificationCheck(res.data || []))
      .catch((err) => console.error("Notification check error", err));
  };

  const approvalUsersFun = () => {
    const data = {
      item_row_id: tproj_id,
      approval_id: projectData?.tproj_approval_id,
      approvar_index: projectData?.tproj_approver_index,
      type: "project",
      previous_present_next: "next",
      bu_id: projectData?.tproj_unit_id,
      state_id: projectData?.tproj_state_id,
      district_id: projectData?.tproj_district_id,
    };

    approvalUsersApi(data)
      .then((res) => {
        setApprovalUsers(res?.data || []);
        setApprovalNextDetails(res?.approval_details || {});
      })
      .catch((err) => console.error("Next users error", err));
  };

  const approvalPreviousUsersFun = () => {
    const data = {
      item_row_id: tproj_id,
      approval_id: projectData?.tproj_approval_id,
      approvar_index: projectData?.tproj_approver_index,
      type: "project",
      previous_present_next: "previous",
      bu_id: projectData?.tproj_unit_id,
      state_id: projectData?.tproj_state_id,
      district_id: projectData?.tproj_district_id,
    };

    approvalUsersApi(data)
      .then((res) => {
        setApprovalPreviousUsers(res?.data || []);
        setApprovalPreviousDetails(res?.approval_details || {});
      })
      .catch((err) => console.error("Previous users error", err));
  };

  const approvalPresentUsersFun = () => {
    const data = {
      item_row_id: tproj_id,
      approval_id: projectData?.tproj_approval_id,
      approvar_index: projectData?.tproj_approver_index,
      type: "project",
      previous_present_next: "present",
      bu_id: projectData?.tproj_unit_id,
      state_id: projectData?.tproj_state_id,
      district_id: projectData?.tproj_district_id,
    };

    approvalUsersApi(data)
      .then((res) => {
        setApprovalPresentDetails(res?.approval_details || {});
      })
      .catch((err) => console.error("Present users error", err));
  };

  const handleFetchApprovalTrack = async () => {
    try {
      const res = await getApprovalTrackApi({
        item_id: tproj_id,
        type: "project",
      });
      setApprovalTrack(res?.data || []);
    } catch (err) {
      console.error("Error fetching approval track", err);
    }
  };

  const handleApprovalSubmit = async () => {
    if (!approvalForm.status) {
      message.error("Please select an action status");
      return;
    }

    if ((approvalForm.status === "send_for_approval" || approvalForm.status === "returned") && !approvalForm.user_id) {
        message.error("Please select a recipient");
        return;
    }

    if (!approvalForm.remarks) {
        message.error("Please enter remarks");
        return;
    }

    Modal.confirm({
      title: 'Confirm Action',
      content: 'Are you sure you want to submit this approval action?',
      onOk: async () => {
        setLoading(true);
        try {
          const payload = {
            item_id: tproj_id,
            creator_id: user?.id,
            user_id: approvalForm.user_id,
            status: approvalForm.status,
            remarks: approvalForm.remarks,
            approvar_index: projectData?.tproj_approver_index,
            notification_type: "project",
          };

          const res = await approveProjectNotificationApi(payload);
          if (res.status == 1) {
            message.success(res.message || "Action submitted successfully");
            setApprovalForm({ status: "", remarks: "", user_id: null });
            onRefresh();
            handleFetchPendingUser && handleFetchPendingUser();
            notificationFun();
            handleFetchApprovalTrack();
          } else {
            message.error(res.message || "Failed to submit action");
          }
        } catch (err) {
          console.error("Error submitting approval", err);
          message.error("An error occurred");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleResubmit = async () => {
      if (projectData?.tproj_status !== "draft" && !approvalForm.user_id) {
          message.error("Please select an approving authority");
          return;
      }
      if (!approvalForm.remarks) {
          message.error("Please enter submission comments");
          return;
      }

      Modal.confirm({
          title: 'Confirm Submission',
          content: 'Do you want to send this project for approval?',
          onOk: async () => {
            setLoading(true);
            try {
                const payload = {
                    item_id: tproj_id,
                    creator_id: user?.id,
                    user_id: approvalForm.user_id,
                    remarks: approvalForm.remarks,
                };
                const res = await submitProjectService(payload);
                if (res.status == 1) {
                    message.success(res.message || "Project submitted successfully");
                    setApprovalForm({ status: "", remarks: "", user_id: null });
                    onRefresh();
                    handleFetchPendingUser && handleFetchPendingUser();
                    notificationFun();
                    handleFetchApprovalTrack();
                } else {
                    message.error(res.message || "Failed to submit project");
                }
            } catch (err) {
                console.error("Resubmit error", err);
                message.error("An error occurred during submission");
            } finally {
                setLoading(false);
            }
          }
      });
  };

  const renderActionStep = (step) => {
    const style = { borderRadius: '100px', padding: '4px 16px', fontWeight: 700, fontSize: '11px', border: '1px solid transparent' };
    switch (step?.toLowerCase()) {
      case "initial": return <Tag icon={<FlagOutlined />} style={{ ...style, background: '#f1f5f9', color: '#64748b', borderColor: '#e2e8f0' }}>INITIAL</Tag>;
      case "send_for_approval": return <Tag icon={<SendOutlined />} style={{ ...style, background: '#eff6ff', color: '#1d4ed8', borderColor: '#dbeafe' }}>SENT</Tag>;
      case "reviewed": return <Tag icon={<EyeOutlined />} style={{ ...style, background: '#f5f3ff', color: '#6d28d9', borderColor: '#ede9fe' }}>REVIEWED</Tag>;
      case "approved": return <Tag icon={<CheckCircleFilled />} style={{ ...style, background: '#ecfdf5', color: '#047857', borderColor: '#d1fae5' }}>APPROVED</Tag>;
      case "resend":
      case "returned": return <Tag icon={<RollbackOutlined />} style={{ ...style, background: '#fffbeb', color: '#b45309', borderColor: '#fef3c7' }}>RETURNED</Tag>;
      default: return <Tag style={style}>{step?.toUpperCase()}</Tag>;
    }
  };

  const renderActionStatus = (status) => {
    const style = { borderRadius: '100px', minWidth: '120px', textAlign: 'center', fontWeight: 800, fontSize: '11px', padding: '4px 0' };
    switch (status?.toLowerCase()) {
      case "reject":
      case "rejected": return <Tag color="error" icon={<CloseCircleFilled />} style={style}>REJECTED</Tag>;
      case "approved":
      case "direct_approved": return <Tag color="success" icon={<CheckCircleFilled />} style={style}>APPROVED</Tag>;
      case "send_for_approval": return <Tag color="processing" icon={<SendOutlined />} style={style}>SENT FOR APPROVAL</Tag>;
      case "resend":
      case "returned": return <Tag color="warning" icon={<RollbackOutlined />} style={style}>RETURNED</Tag>;
      case "initial": return <Tag icon={<FlagOutlined />} style={{ ...style, background: '#f8fafc', color: '#94a3b8' }}>INITIAL</Tag>;
      default: return <Tag style={style}>{status?.toUpperCase()?.replace("_", " ")}</Tag>;
    }
  };

  const columns = [
    {
      title: "Workflow Step",
      dataIndex: "apt_accept_step",
      key: "apt_accept_step",
      width: 160,
      align: 'left',
      render: (step) => renderActionStep(step),
    },
    {
      title: "Approving Authority",
      dataIndex: "name",
      key: "name",
      width: 320,
      align: 'left',
      render: (name, record) => (
        <Space size="middle">
          <div style={{ 
            width: 44, height: 44, borderRadius: '14px', background: '#f0f9ff', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            color: '#0ea5e9', border: '1px solid #e0f2fe',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <UserOutlined style={{ fontSize: '18px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '15px' }}>{name || "Workflow Engine"}</span>
            <span style={{ fontSize: '10px', color: '#e31e24', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {record.trl_role_name || "System"}
            </span>
          </div>
        </Space>
      ),
    },
    {
      title: "Processing Time",
      dataIndex: "apt_created_at",
      key: "apt_created_at",
      width: 220,
      align: 'left',
      render: (date) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569' }}>
          <div style={{ padding: '6px', background: '#f8fafc', borderRadius: '8px', color: '#94a3b8' }}>
            <ClockCircleOutlined />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 500 }}>{convertToTimezone(date)}</span>
        </div>
      ),
    },
    {
      title: "Decision Status",
      dataIndex: "apt_accept_status",
      key: "apt_accept_status",
      width: 200,
      align: 'left',
      render: (status) => renderActionStatus(status),
    },
    {
      title: "Reviewer Remarks & Feedback",
      dataIndex: "apt_remarks",
      key: "apt_remarks",
      align: 'left',
      render: (remarks) => (
        <div style={{ 
          maxWidth: 450, 
          background: remarks ? '#f8fafc' : 'transparent', 
          padding: remarks ? '12px 16px' : '0',
          borderRadius: '16px',
          border: remarks ? '1px solid #f1f5f9' : 'none',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            {remarks && <MessageOutlined style={{ marginTop: 4, color: '#cbd5e1', fontSize: '14px' }} />}
            <Text style={{ 
              fontSize: '13px', 
              color: remarks ? '#334155' : '#94a3b8', 
              fontStyle: remarks ? 'normal' : 'italic',
              fontWeight: remarks ? 500 : 400,
              lineHeight: '1.6'
            }}>
              {remarks || "No formal feedback recorded for this step."}
            </Text>
          </div>
        </div>
      ),
    },
  ];

  if (!tproj_id) return null;

  return (
    <div className="project-approval-section fade-in">
      
      {!onlyTrack && (
        <>
          {/* DOP Authority Banner */}
          {approvalPresentDetails?.dop === "yes" && projectData?.tproj_budget_amount <= dopMax && (
            <div style={{ textAlign: 'right', marginBottom: 24 }}>
              <Button
                type="primary"
                ghost
                onClick={() => {/* Implement DOP Details Modal if needed */}}
                icon={<InfoCircleOutlined />}
              >
                DOP View Authority
              </Button>
            </div>
          )}

          {/* APPROVAL ACTIONS FORM (For Approvers) */}
          {notificationCheck?.length > 0 &&
            projectData?.tproj_created_by != user?.id &&
            (projectData?.tproj_status === "pending" || projectData?.tproj_status === "returned") && (
              <Card className="highlighted-action-card mb-4" bordered={false}>
                <div className="section-title-highlight">
                  <AuditOutlined /> Approval Actions Required
                </div>
                <Form layout="vertical">
                  <Row gutter={24}>
                    <Col span={24}>
                      <Form.Item label="Select Action Status" required>
                        <Select
                          placeholder="Select Status"
                          value={approvalForm.status}
                          onChange={(v) => setApprovalForm({ ...approvalForm, status: v, user_id: null })}
                          size="large"
                        >
                          {pendingDetails?.role_id == user?.role_id && (
                            <Option value="approved">Approve</Option>
                          )}
                          
                          {pendingDetails?.role_id != user?.role_id && approvalNextDetails?.role_id && (
                            <Option value="send_for_approval">Send for Approval</Option>
                          )}

                          {approvalPresentDetails?.dop === "yes" && projectData?.tproj_budget_amount <= dopMax && (
                            <Option value="direct_approved">Approve (Direct)</Option>
                          )}

                          <Option value="returned">Return</Option>

                          {approvalPresentDetails?.dop === "yes" && projectData?.tproj_budget_amount <= dopMax && (
                            <Option value="rejected">Reject</Option>
                          )}
                        </Select>
                      </Form.Item>
                    </Col>

                    {(approvalForm.status === "send_for_approval" || approvalForm.status === "returned") && (
                      <Col span={24}>
                        <Form.Item label="Assign To" required>
                          <Select
                            placeholder="Select Recipient"
                            value={approvalForm.user_id}
                            onChange={(v) => setApprovalForm({ ...approvalForm, user_id: v })}
                            size="large"
                          >
                            {(approvalForm.status === "send_for_approval" ? approvalUsers : approvalPreviousUsers)
                              ?.filter(u => u.id !== user.id)
                              .map((u) => (
                                <Option key={u.id} value={u.id}>{u.name}</Option>
                              ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    )}

                    <Col span={24}>
                      <Form.Item label="Detailed Remarks" required>
                        <TextArea
                          rows={3}
                          placeholder="Enter justification or feedback..."
                          value={approvalForm.remarks}
                          onChange={(e) => setApprovalForm({ ...approvalForm, remarks: e.target.value })}
                          style={{ borderRadius: 12 }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <div style={{ textAlign: 'right' }}>
                    <Button 
                      type="primary" 
                      size="large"
                      loading={loading}
                      onClick={handleApprovalSubmit}
                      style={{ background: '#e31e24', borderColor: '#e31e24', height: 'auto', padding: '10px 30px', borderRadius: 10 }}
                    >
                      Submit Approval Action
                    </Button>
                  </div>
                </Form>
              </Card>
          )}

          {/* RESUBMISSION FORM (For Creators) */}
          {projectData?.tproj_created_by == user?.id &&
            (projectData?.tproj_status === "draft" || projectData?.tproj_status === "returned") && (
              <Card className="highlighted-action-card mb-4" style={{ borderLeftColor: '#10b981' }} bordered={false}>
                <div className="section-title-highlight" style={{ background: '#ecfdf5', color: '#10b981' }}>
                  <SendOutlined /> Workflow Resubmission
                </div>
                <Form layout="vertical">
                  <Row gutter={24}>
                    {(projectData?.tproj_status !== "draft" || true) && ( // Always show for projects to select first step
                      <Col span={24}>
                        <Form.Item label="Forward To Authority" required>
                          <Select
                            placeholder="Select Authority"
                            value={approvalForm.user_id}
                            onChange={(v) => setApprovalForm({ ...approvalForm, user_id: v })}
                            size="large"
                          >
                            {approvalUsers?.map((u) => (
                              <Option key={u.id} value={u.id}>{u.name}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    )}
                    <Col span={24}>
                      <Form.Item label="Submission Comments" required>
                        <TextArea
                          rows={2}
                          placeholder="Add any message for the reviewer..."
                          value={approvalForm.remarks}
                          onChange={(e) => setApprovalForm({ ...approvalForm, remarks: e.target.value })}
                          style={{ borderRadius: 12 }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <div style={{ textAlign: 'right' }}>
                    <Button 
                      type="primary" 
                      size="large"
                      loading={loading}
                      onClick={handleResubmit}
                      style={{ background: '#e31e24', borderColor: '#e31e24', height: 'auto', padding: '10px 30px', borderRadius: 10 }}
                    >
                      {projectData?.tproj_status === "draft" ? "Submit Project" : "Resubmit Project"}
                    </Button>
                  </div>
                </Form>
              </Card>
          )}
        </>
      )}

      {!onlyActions && (
        <Card className="section-card" style={{ borderRadius: 16 }}>
          <div className="section-title">
            <ClockCircleOutlined /> Approval Journey Track
          </div>
          <Table
            columns={columns}
            dataSource={approvalTrack}
            pagination={false}
            className="modern-table"
            rowKey={(record, index) => index}
            locale={{ emptyText: <Empty description="No journey records found" /> }}
          />
        </Card>
      )}
    </div>
  );
};

export default ProjectApproval;
