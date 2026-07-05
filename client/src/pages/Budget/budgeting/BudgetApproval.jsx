import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  Button,
  Form as BootstrapForm,
  ModalFooter
} from "react-bootstrap";
import {
  Table,
  Tag,
  Space,
  Typography,
  Select,
  Input,
  Row,
  Col,
  Empty,
  Form,
  Modal as AntModal
} from "antd";
import {
  CheckCircleOutlined,
  SendOutlined,
  RollbackOutlined,
  CloseCircleOutlined,
  AuditOutlined,
  UserOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined
} from "@ant-design/icons";
import toast, { Toaster } from "react-hot-toast";
import { useLoading } from "../../../context/LoadingProvider";
import { Link } from "react-router-dom";
import {
   approveBudgetNotificationApi,
  getApprovalTrackApi,
  getNotificationDetailsApi,
} from "../../../services/Notification-service";
import { sendBudgetingForApprovalApi } from "../../../services/Budget-service";
import { useDispatch } from "react-redux";
import { approvalUsersApi } from "../../../services/Common-service";
import { use } from "react";
import { budgetingDetailsApi } from "../../../services/Budget-service";
import { myRoleDetailsApi } from "../../../services/Role-service";
import { convertToTimezone } from "../../../helper/common";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;


export default function BudgetApproval({
  budget_id,
  not_type,
  budgetDetails,
  user,
  handleFetchPendingUser,
  pendingDetails,
  totalApprovedAmount,
}) {
  const base_url =
    import.meta.env.VITE_HOME_PAGE == "/" ? "" : import.meta.env.VITE_HOME_PAGE;

  //********* My code *********/
  const [approvalTrack, setApprovalTrack] = useState([]);
  const [approvalForm, setApprovalForm] = useState({
    item_id: "",
    creator_id: "",
    user_id: "",
    status: "",
    remarks: "",
    notification_type: "",
    approvar_index: "",
  });
  const [notificationCheck, setNotificationCheck] = useState([]);
  const [forwardRoles, setForwardRoles] = useState([]);
  const [approvalNextDetails, setApprovalNextDetails] = useState({});
  const [approvalPreviousDetails, setApprovalPreviousDetails] = useState({});
  const [approvalPresentDetails, setApprovalPresentDetails] = useState({});
  const [dopTotalApproved, setDopTotalApproved] = useState({});
  const [dopTotalApprovedDetails, setDopTotalApprovedDetails] = useState([]);

  const [approvalPreviousUsers, setApprovalPreviousUsers] = useState([]);
  const [approvalPresentUsers, setApprovalPresentUsers] = useState([]);
  const [approvalUsers, setApprovalUsers] = useState([]);
  const [approvalRoles, setApprovalRoles] = useState([]);
  const [roleDetails, setRoleDetails] = useState([]);
   const [dopMin, setDopMin] = useState(0);
  const [dopMax, setDopMax] = useState(0);
  const [dopTotal, setDopTotal] = useState(0);

  const dispatch = useDispatch();
  const [approvalModalShow, setSpprovalModalShow] = useState(false);
  let { loading, setLoading } = useLoading();

  const budgetingDetailsFun = async () => {
    const response = await budgetingDetailsApi({ budgeting_id: budget_id });
    if (response.status == 1) {
      setApprovalForm((prevState) => ({
        ...prevState,
        ["forward_user_role_id"]: response?.data?.[0]?.tcpr_forward_role_id,
      }));
    }
  };

  useEffect(() => {
    if (budget_id) {
      budgetingDetailsFun();
    }
  }, [budget_id]);

  // const dopTotalDetailsFun = () => {
  //   var data = {
  //     approval_type : "budgeting",
  //     user_id : user?.id,
  //     fy_id : budgetDetails?.tbm_fy_id
  //   };
  //   dopDetailsApi(data)
  //     .then((data) => {
  //       setDopTotalApproved(data?.data[0].total_approved);
  //       setDopTotalApprovedDetails(data?.approval_total_list);
  //       setSpprovalModalShow(true);
  //     })
  //     .catch((err) => {});
  // };

  // console.log("dopTotalApproved",dopTotalApproved);

  const approvalModalShowClose = () => {
    setSpprovalModalShow(false);
  }

  const myRoleDetailsFun = () => {

    myRoleDetailsApi(user.role_id)
      .then((data) => {
        setRoleDetails(data?.data);
        if(data?.data?.length>0){

          
              setDopMin(data?.data[0]?.trl_min_access_amount);
              setDopMax(data?.data[0]?.trl_max_access_amount);
              setDopTotal(data?.data[0]?.trl_access_amount);
          

        }
      })
      .catch((err) => {});
  };

  const approvalUsersFun = () => {
    const {
      tbm_id: item_row_id = null,
      tbm_approval_id: approval_id = null,
      tbm_approver_index: approvar_index = null,
    } = budgetDetails || {};

    const data = {
      item_row_id,
      approval_id,
      approvar_index,
      type: "budgeting",
      previous_present_next: "next",
      bu_id: budgetDetails.tbm_unit_id,
      state_id: budgetDetails.tbm_state_id,
      district_id: budgetDetails.tbm_district_id,
      block_id: budgetDetails.tbm_block_id,
    };

    approvalUsersApi(data)
      .then((data) => {
        setApprovalUsers(data?.data);
        setApprovalNextDetails(data?.approval_details);
      })
      .catch((err) => {});
  };

  const approvalPreviousUsersFun = () => {
    const {
      tbm_id: item_row_id = null,
      tbm_approval_id: approval_id = null,
      tbm_approvar_index: approvar_index = null,
    } = budgetDetails || {};

    const data = {
      item_row_id,
      approval_id,
      approvar_index:budgetDetails.tbm_approver_index,
      type: "budgeting",
      previous_present_next: "previous",
      bu_id: budgetDetails.tbm_unit_id,
      state_id: budgetDetails.tbm_state_id,
      district_id: budgetDetails.tbm_district_id,
      block_id: budgetDetails.tbm_block_id,
    };

    approvalUsersApi(data)
      .then((data) => {

        console.log("previous users",data);
        setApprovalPreviousUsers(data?.data);
        setApprovalPreviousDetails(data?.approval_details);
      })
      .catch((err) => {});
  };

  const approvalPresentUsersFun = () => {
    const {
      tbm_id: item_row_id = null,
      tbm_approval_id: approval_id = null,
      tbm_approvar_index: approvar_index = null,
    } = budgetDetails || {};

    const data = {
      item_row_id,
      approval_id,
      approvar_index,
      type: "budgeting",
      previous_present_next: "present",
      bu_id: budgetDetails.tbm_unit_id,
      state_id: budgetDetails.tbm_state_id,
      district_id: budgetDetails.tbm_district_id,
      block_id: budgetDetails.tbm_block_id,
    };

    approvalUsersApi(data)
      .then((data) => {
        setApprovalPresentUsers(data?.data);
        setApprovalPresentDetails(data?.approval_details);
      })
      .catch((err) => {});
  };

  const approvalForwardUsersFun = (previous_next) => {
    const {
      tcpr_approval_id: approval_id = null,
      tcpr_approvar_index: approvar_index = null,
      tcpr_forward: forward = "no",
      tcpr_department_id: department_id = "no",
      tcpr_forward_sequence: forward_sequence = 0,
    } = budgetDetails || {};

    const data = {
      approval_id,
      approvar_index,
      forward,
      department_id,
      forward_sequence,
      previous_next: previous_next,
    };

    approvalForwardUsersApi(data)
      .then((data) => {
        setForwardDepartmentUsers(data?.data);
      })
      .catch((err) => {});
  };

  const approvalForwardBackUsersFun = (previous_next) => {
    const {
      tcpr_approval_id: approval_id = null,
      tcpr_approvar_index: approvar_index = null,
      tcpr_forward: forward = "no",
      tcpr_department_id: department_id = "no",
      tcpr_forward_sequence: forward_sequence = 0,
    } = budgetDetails || {};

    const data = {
      approval_id,
      approvar_index,
      forward,
      department_id,
      forward_sequence,
      previous_next: previous_next,
    };

    approvalForwardUsersApi(data)
      .then((data) => {
        setForwardBackDepartmentUsers(data?.data);
      })
      .catch((err) => {});
  };

  const getApprovalRoleFun = () => {
    let data = {
      approval_id: budgetDetails?.tcpr_approval_id,
      approvar_sequence: budgetDetails?.tcpr_approvar_index,
      department_id: approvalForm?.department_id,
      forward_sequence: budgetDetails?.tcpr_forward_sequence,
      forward_role_id: budgetDetails?.tcpr_forward_role_id,
    };

    getApprovalRolesBydeptId(data)
      .then((data) => {
        setApprovalRoles(data?.data);
      })
      .catch((err) => {});
  };

  const forwardUsersRoleWiseFun = () => {
    var role_id = approvalForm?.forward_user_role_id;
    userListRoleIdWiseApi(role_id)
      .then((data) => {
        setForwardUsers(data?.data);
      })
      .catch((err) => {});
  };

  const approvalTrackFun = () => {
    var data = {
      item_id: budget_id,
    };
    getApprovalTrackApi(data)
      .then((data) => {
        setApprovalTrack(data?.data);
      })
      .catch((err) => {});
  };

  const notificationFun = () => {
    var data = {
      item_id: budget_id,
      user_id: user?.id || 0,
      not_action_taken: "N",
    };
    getNotificationDetailsApi(data)
      .then((data) => {
        setNotificationCheck(data?.data);
      })
      .catch((err) => {});
  };

  useEffect(() => {
    notificationFun();
    approvalTrackFun();
    // roleFun();
      myRoleDetailsFun();
  }, [budget_id]);

  useEffect(() => {
    if (approvalForm.forward_user_role_id) {
      forwardUsersRoleWiseFun();
    }
  }, [approvalForm.forward_user_role_id]);

  useEffect(() => {
    if (approvalForm.department_id) {
      getApprovalRoleFun();
    }
  }, [approvalForm.department_id]);

  useEffect(() => {
    if (budgetDetails && budgetDetails?.tcpr_approvar_index) {
      console.log(budgetDetails);

      let data = {
        approval_id: budgetDetails?.tcpr_approval_id,
        approvar_sequence: budgetDetails?.tcpr_approvar_index,
      };

      getDeptByApprovalId(data).then((response) => {
        if (response.status == 1) {
          setDepartmentList(response?.data);
        }
      });
    }

    if (budgetDetails && budgetDetails?.tbm_id) {
      approvalUsersFun();
      approvalPresentUsersFun();
      approvalPreviousUsersFun();
    }

    if (budgetDetails && budgetDetails?.tcpr_forwarded_to_department) {
      approvalForwardUsersFun("next");
      approvalForwardBackUsersFun("previous");
    }
  }, [budgetDetails]);

  const handleSelect = (e) => {
    const { name, value } = e.target;
    const FORWARD_DEPARTMENT = "forward_department";
    const FORWARD_USER_ROLE_ID = "forward_user_role_id";

    if (name == "department_id") {
      console.log(value);
      setApprovalForm((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    } else if (value === FORWARD_DEPARTMENT) {
      setApprovalForm((prevState) => ({
        ...prevState,
        [name]: value,
        [FORWARD_USER_ROLE_ID]: budgetDetails.tcpr_forward_role_id,
      }));
    } else {
      setApprovalForm((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleFields = (e) => {
    const { name, value } = e.target;
    setApprovalForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleBudgetApprove = () => {
    AntModal.confirm({
      title: 'Are you sure?',
      content: 'Do you want to submit this approval action?',
      onOk() {
        // setLoading(true);
        var dataSend = {
          item_id: budget_id,
          creator_id: user?.id || 0,
          user_id: approvalForm?.user_id || 0,
          status: approvalForm?.status,
          remarks: approvalForm?.remarks,
          notification_type: not_type,
          approvar_index: budgetDetails?.tbm_approver_index,
        };

        approveBudgetNotificationApi(dataSend)
          .then((response) => {
            if (response.status == 1) {
              handleFetchPendingUser();
              toast.success(response.message);
              setApprovalForm({});
              approvalTrackFun();
              notificationFun();
              setLoading(false);
              handleFetchPendingUser();
            } else {
              toast.error(response.message);
              setLoading(false);
            }
          })
          .catch(() => { });
      }
    });
  };



  const [sendForApprovalLoading, setSendForApprovalLoading] = useState(false);
  const sendForApproval = () => {
    AntModal.confirm({
      title: 'Confirm Submission',
      content: 'Do you want to send this budget for approval?',
      icon: <QuestionCircleOutlined style={{ color: '#1890ff' }} />,
      onOk() {
        var dataSend = {
          item_id: budget_id,
          creator_id: user?.id || 0,
          user_id: approvalForm?.user_id || 0,
          remarks: approvalForm?.remarks,
        };

        sendBudgetingForApprovalApi(dataSend)
          .then((response) => {
            if (response.status == 1) {
              toast.success(response?.message);
              setApprovalForm({});
              approvalTrackFun();
              notificationFun();
              budgetingDetailsFun();
              setSendForApprovalLoading(true);
              handleFetchPendingUser();
            } else {
              toast.error(response?.message);
            }
          })
          .catch(() => { });
      }
    });
  };

  //********* My code End*********/

  const renderActionStep = (step) => {
    switch (step) {
      case "initial": return <Tag color="orange" style={{ borderRadius: 20 }}>Initial</Tag>;
      case "send_for_approval": return <Tag color="blue" icon={<SendOutlined />} style={{ borderRadius: 20 }}>Sent for Approval</Tag>;
      case "reviewed": return <Tag color="processing" style={{ borderRadius: 20 }}>Reviewed</Tag>;
      case "approved": return <Tag color="success" icon={<CheckCircleOutlined />} style={{ borderRadius: 20 }}>Approved</Tag>;
      case "resend": return <Tag color="warning" icon={<RollbackOutlined />} style={{ borderRadius: 20 }}>Returned</Tag>;
      default: return <Tag style={{ borderRadius: 20 }}>{step}</Tag>;
    }
  };

  const renderActionStatus = (status) => {
    switch (status) {
      case "reject": return <Tag color="error" icon={<CloseCircleOutlined />} style={{ borderRadius: 20 }}>Rejected</Tag>;
      case "approved": return <Tag color="success" icon={<CheckCircleOutlined />} style={{ borderRadius: 20 }}>Approved</Tag>;
      case "send_for_approval": return <Tag color="blue" style={{ borderRadius: 20 }}>Sent for Approval</Tag>;
      case "resend":
      case "forward_back":
      case "back_to_department": return <Tag color="warning" style={{ borderRadius: 20 }}>Returned</Tag>;
      case "initial": return <Tag color="orange" style={{ borderRadius: 20 }}>Initial</Tag>;
      case "forward":
      case "forward_department": return <Tag color="cyan" style={{ borderRadius: 20 }}>Forwarded</Tag>;
      default: return <Tag style={{ borderRadius: 20 }}>{status}</Tag>;
    }
  };

  const trackColumns = [
    {
      title: "Step",
      dataIndex: "apt_accept_step",
      key: "apt_accept_step",
      render: (step) => renderActionStep(step),
    },
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <Space>
          <UserOutlined style={{ color: "#6366f1" }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: "Date",
      dataIndex: "apt_created_at",
      key: "apt_created_at",
      render: (date) => (
        <Space>
          <ClockCircleOutlined style={{ color: "#8c8c8c" }} />
          {convertToTimezone(date)}
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "apt_accept_status",
      key: "apt_accept_status",
      render: (status) => renderActionStatus(status),
    },
    {
      title: "Remarks",
      dataIndex: "apt_remarks",
      key: "apt_remarks",
      render: (remarks) => (
        <div style={{ maxWidth: 300 }}>
          <Space align="start">
            <MessageOutlined style={{ marginTop: 4, color: '#8c8c8c' }} />
            <Text type="secondary">{remarks || "-"}</Text>
          </Space>
        </div>
      ),
    },
  ];

  return (
    <div className="approval-section fade-in">
      {/* View Approved Details Button for DOP Authority */}
      {approvalPresentDetails?.dop == "yes" &&
        budgetDetails.tcpr_budget_total <= dopMax && (
          <div style={{ textAlign: 'right', marginBottom: 24 }}>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={dopTotalDetailsFun}
            >
              <InfoCircleOutlined style={{ marginRight: 6 }} /> View Approved Details
            </Button>
          </div>
        )}

      {/* Approval Actions Form */}
      {notificationCheck?.length > 0 &&
        budgetDetails?.tbm_created_by != user?.id &&
        (budgetDetails?.tbm_status === "pending" ||
          budgetDetails?.tbm_status === "resend") ? (
          <div className="section-card" style={{ marginBottom: 32 }}>
            <div className="section-title">
              <AuditOutlined /> Approval Actions
            </div>
            <Form layout="vertical" onFinish={handleBudgetApprove}>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    label="Select Action Status" 
                    name="status"
                    rules={[{ required: true, message: 'Please select an action status' }]}
                  >
                    <Select
                      placeholder="Select Status"
                      value={approvalForm?.status}
                      onChange={(value) => handleSelect({ target: { name: "status", value } })}
                      size="large"
                      style={{ width: '100%' }}
                    >
                      {pendingDetails?.role_id == user?.role_id && (
                        <Option value="approved">Approve</Option>
                      )}
                      {pendingDetails?.role_id != user?.role_id &&
                        approvalNextDetails?.role_id != "" && (
                          <Option value="send_for_approval">Send for Approval</Option>
                        )}
                      {approvalPresentDetails?.dop === "yes" &&
                        budgetDetails.tbm_total_budget_amount <= dopMax && (
                          <Option value="direct_approved">Approve (Direct)</Option>
                        )}
                      <Option value="resend">Return</Option>
                      {approvalPresentDetails?.dop === "yes" &&
                        budgetDetails.tbm_total_budget_amount <= dopMax && (
                          <Option value="reject">Reject</Option>
                        )}
                    </Select>
                  </Form.Item>
                </Col>

                {(approvalForm?.status === "send_for_approval" || approvalForm?.status === "resend") && (
                  <Col xs={24} md={12}>
                    <Form.Item 
                      label="Assign To" 
                      name="user_id"
                      rules={[{ required: true, message: 'Please select a recipient' }]}
                    >
                      <Select
                        placeholder="Select Recipient"
                        value={approvalForm?.user_id}
                        onChange={(value) => handleSelect({ target: { name: "user_id", value } })}
                        size="large"
                        style={{ width: '100%' }}
                      >
                        {(approvalForm?.status === "send_for_approval" ? approvalUsers : approvalPreviousUsers)
                          ?.filter(u => u.id !== user.id)
                          .map((u) => (
                            <Option key={u.id} value={u.id}>{u.name}</Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Col>
                )}

                <Col span={24}>
                  <Form.Item 
                    label="Detailed Remarks" 
                    name="remarks"
                    rules={[{ required: true, message: 'Please enter your remarks' }]}
                  >
                    <TextArea
                      rows={3}
                      placeholder="Enter justification or feedback..."
                      value={approvalForm?.remarks}
                      onChange={(e) => handleFields(e)}
                      name="remarks"
                      style={{ borderRadius: 12 }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div style={{ textAlign: 'right' }}>
                <Button variant="primary" type="submit" className="custom-submit-btn">
                  Submit Approval Action
                </Button>
              </div>
            </Form>
          </div>
        ) : null}

      {/* Draft/Return Submission Form */}
      {sendForApprovalLoading == false &&
        budgetDetails?.tbm_created_by == user?.id &&
        (budgetDetails?.tbm_status === "draft" ||
          budgetDetails?.tbm_status === "resend") ? (
          <div className="section-card" style={{ marginBottom: 32 }}>
            <div className="section-title">
              <SendOutlined /> Resubmit for Approval
            </div>
            <Form layout="vertical" onFinish={sendForApproval}>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    label="Forward To Authority" 
                    name="forward_user_id"
                    rules={[{ required: true, message: 'Please select an approving authority' }]}
                  >
                    <Select
                      placeholder="Select Authority"
                      value={approvalForm?.user_id}
                      onChange={(value) => handleSelect({ target: { name: "user_id", value } })}
                      size="large"
                      style={{ width: '100%' }}
                    >
                      {approvalUsers?.map((u) => (
                        <Option key={u.id} value={u.id}>{u.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item 
                    label="Submission Comments" 
                    name="submission_remarks"
                    rules={[{ required: true, message: 'Please add submission comments' }]}
                  >
                    <TextArea
                      rows={2}
                      placeholder="Add any message for the reviewer..."
                      value={approvalForm?.remarks}
                      onChange={(e) => handleFields(e)}
                      name="remarks"
                      style={{ borderRadius: 12 }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <div style={{ textAlign: 'right' }}>
                <Button variant="info" type="submit" className="custom-submit-btn" style={{ color: 'white' }}>
                  Send for Approval
                </Button>
              </div>
            </Form>
          </div>
        ) : null}

      {/* Approval Journey Card */}
      <div className="section-card">
        <div className="section-title">
          <AuditOutlined /> Approval Journey Track
        </div>
        <div className="modern-table">
          <Table
            dataSource={approvalTrack}
            columns={trackColumns}
            rowKey={(record, index) => index}
            pagination={false}
            bordered={false}
            size="middle"
            className="custom-track-table"
            locale={{ emptyText: <Empty description="No journey records found" /> }}
          />
        </div>
      </div>

      {/* DOP Approval Details Modal (Preserved React-Bootstrap Modal) */}
      <Modal
        show={approvalModalShow}
        onHide={approvalModalShowClose}
        size="lg"
        aria-labelledby="example-modal-sizes-title-lg"
        className="come-from-modal right modal-dialog-50"
      >
        <div className="modalheader-bg"></div>
        <Modal.Header closeButton>
          <Modal.Title>Approved Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table
            dataSource={dopTotalApprovedDetails}
            rowKey={(item, index) => index}
            columns={[
              { title: 'Proposal Type', dataIndex: 'tcpr_proposal_type' },
              { title: 'Approved Amount', dataIndex: 'approved_total' },
              { title: 'Date', dataIndex: 'created_at' },
              {
                title: 'Action',
                render: (_, record) => (
                  <Link to={`${base_url}/admin/proposal/need-assessment-proposal-view/${record.item_id}`} target="_blank" className="btn btn-sm btn-info text-white">
                    View
                  </Link>
                )
              }
            ]}
            pagination={false}
          />
        </Modal.Body>
        <ModalFooter>
          <Button variant="secondary" onClick={approvalModalShowClose}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
