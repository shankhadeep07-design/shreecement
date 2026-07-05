import {
  AimOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  NumberOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  UserOutlined,
  WalletOutlined,
  AuditOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined
} from "@ant-design/icons";
import {
  Card,
  Descriptions,
  Divider,
  Space,
  Table,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Empty
} from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  budgetingDetailsApi,
  getPendingUserApi,
  sendBudgetingForApprovalApi,
} from "../../../services/Budget-service";
import {
  approveNotificationApi,
  getApprovalTrackApi,
  getNotificationDetailsApi,
} from "../../../services/Notification-service";

import { userDetails } from "../../../auth/auth";
import BudgetApproval from "./BudgetApproval";
import { getLocationByUnitId } from "../../../Services/Master-service";
import "./BudgetingDetails.css";

const { Title, Text } = Typography;

// ✅ Status renderer
const renderStatus = (value) => {
  const val = value?.trim()?.toLowerCase();
  if (val === "pending")
    return (
      <Tag color="orange" icon={<CalendarOutlined />}>
        Pending
      </Tag>
    );
  if (val === "approved")
    return (
      <Tag color="green" icon={<CheckCircleOutlined />}>
        Approved
      </Tag>
    );
  if (val === "rejected")
    return (
      <Tag color="red" icon={<CheckCircleOutlined />}>
        Rejected
      </Tag>
    );
  return <Tag color="default">{value || "N/A"}</Tag>;
};

const DataPoint = ({ icon, label, value }) => (
  <div className="data-point">
    <div className="icon-wrapper">
      {icon}
    </div>
    <div className="data-content">
      <span className="label">{label}</span>
      <span className="value">{value || "-"}</span>
    </div>
  </div>
);

export default function BudgetingDetails() {
  const { budgeting_id } = useParams();
  const [budgetData, setBudgetData] = useState(null);
  const [notification, setNotification] = useState([]);
  const [approvalTrack, setApprovalTrack] = useState([]);
  const [approvalForm, setApprovalForm] = useState([]);
  const [notificationCheck, setNotificationCheck] = useState([]);
  const user = userDetails();
  const [loading, setLoading] = useState(false);
  const [unitLocation, setUnitLocation] = useState({
    blocks: [],
    grampanchayats: [],
    revenue_villages: [],
    villages: []
  });

  const budgeting_item_id = budgeting_id;
  const not_type = "budgeting";
  const [totalApprovedAmount, setTotalApprovedAmount] = useState(0);
  const [pendingDetails, setPendingDetails] = useState("");

  const handleFetchPendingUser = async () => {
    if (not_type && budgeting_item_id) {
      const body = {
        type: "budgeting",
        moduleName: "budgeting",
        tableName: "t_budget_master",
        IdcolumnName: "tbm_id",
        IdcolumnValue: budgeting_item_id,
        IndexcolumnName: "tbm_approver_index",
        StatuscolumnName: "tbm_status",
        usercolumnName: "tbm_user_id",
        rolecolumnName: "tbm_user_role_id",
        approvalIdColumnName: "tbm_approval_id",
      };

      getPendingUserApi(body)
        .then((data) => {
          setPendingDetails(data?.data || "");
        })
        .catch((error) => {
          console.error("Pending user fetch error", error);
        });
    }
  };

  useEffect(() => {
    if (budgeting_id) {
      fetchBudgetDetails();
      notificationFun();
      approvalTrackFun();
      handleFetchPendingUser();
    }
  }, [budgeting_id]);

  const fetchBudgetDetails = () => {
    setLoading(true);
    budgetingDetailsApi({ budgeting_id })
      .then(({ data }) => {
        if (!data) return;
        setBudgetData(data);
        setTotalApprovedAmount(data?.totalApprovedAmount);
        if (data?.tbm_unit_id) {
          loadUnitLocation(data.tbm_unit_id);
        }
      })
      .catch((error) =>
        toast.error(
          error?.response?.data?.originalError ||
          error?.response?.data?.message,
        ),
      )
      .finally(() => setLoading(false));
  };

  const loadUnitLocation = async (unitId) => {
    try {
      const res = await getLocationByUnitId(unitId);
      if (!res?.data?.status) return;
      const data = res.data.data;
      setUnitLocation({
        blocks: data.blocks || [],
        grampanchayats: data.grampanchayats || [],
        revenue_villages: data.revenue_villages || [],
        villages: data.villages || []
      });
    } catch (err) {
      console.error("Unit location error", err);
    }
  };

  const notificationFun = () => {
    const data = { user_id: user.id, item_id: budgeting_id, not_action_taken: "N" };
    getNotificationDetailsApi(data)
      .then((res) => setNotification(res.data || []))
      .catch(() => { });
  };

  const approvalTrackFun = () => {
    const data = { item_id: budgeting_id };
    getApprovalTrackApi(data)
      .then((res) => setApprovalTrack(res.data || []))
      .catch(() => { });
  };

  const columns = [
    // {
    //   title: "Theme",
    //   dataIndex: "tthm_theme_name",
    //   key: "tthm_theme_name",
    //   render: (text) => <Text strong>{text}</Text>
    // },
    {
      title: "Thematic Area (Schedule VII)",
      dataIndex: "tschm_schedule_name",
      key: "tschm_schedule_name",
      width: 250,
    },
    {
      title: "Sub-theme",
      dataIndex: "tsubshcm_sub_schedule_name",
      key: "tsubshcm_sub_schedule_name",
    },
    {
      title: "Project Identified",
      dataIndex: "tbad_project_identified",
      key: "tbad_project_identified",
      render: (val) => (
        <Tag color={val === "yes" ? "blue" : "default"}>
          {val === "yes" ? "Yes" : "No"}
        </Tag>
      ),
    },
    {
      title: "Proposed Description",
      dataIndex: "tbad_description",
      key: "tbad_description",
      ellipsis: true,
    },
    {
      title: "Budget (INR)",
      dataIndex: "tbad_amount",
      key: "tbad_amount",
      align: "right",
      render: (amt) => <span className="amount-cell">₹ {amt?.toLocaleString() || 0}</span>,
    },
  ];

  if (!budgetData && loading) {
    return (
      <div className="budget-details-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Statistic title="Loading Budget Details..." value=" " prefix={<ClockCircleOutlined spin />} />
      </div>
    );
  }

  if (!budgetData) {
    return (
      <div className="budget-details-container">
        <Empty description="No budgeting details found" />
      </div>
    );
  }

  const renderStatusBanner = () => {
    // Before sending for approval (Draft status), don't show the banner.
    const currentStatus = (budgetData?.tbm_status || "").toLowerCase();
    if (!pendingDetails || currentStatus === "draft") return null;

    const details = pendingDetails?.details || {};
    const status = (details?.status || "").toLowerCase();
    
    let bannerClass = "status-warning";
    let icon = <InfoCircleOutlined />;
    let text = `Pending with ${details?.role_name?.toUpperCase() || ""} (${details?.name?.toUpperCase() || ""})`;

    if (status === "approved" || budgetData?.tbm_status === "Approved") {
      bannerClass = "status-success";
      icon = <CheckCircleOutlined />;
      text = "Budget Proposal Approved";
    } else if (status === "reject" || budgetData?.tbm_status === "Rejected") {
      bannerClass = "status-danger";
      icon = <SafetyCertificateOutlined />;
      text = "Budget Proposal Rejected";
    }

    return (
      <div className={`status-banner ${bannerClass}`}>
        {icon}
        <span>{text}</span>
      </div>
    );
  };

  return (
    <div className="budget-details-container fade-in">
      
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-header">
          <div className="hero-title">
            <Title level={2}>Budgeting Details</Title>
            <div className="hero-subtitle">
              Detailed breakdown and allocation for resource management
            </div>
          </div>
          <div className="hero-actions">
            <Tag color="#ffffff50" style={{ color: 'white', borderRadius: 20, padding: '4px 12px' }}>
              ID: {budgeting_id}
            </Tag>
          </div>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label"><CalendarOutlined /> Financial Year</div>
            <div className="kpi-value">{budgetData?.tfy_year_label}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label"><HomeOutlined /> Unit</div>
            <div className="kpi-value">{budgetData?.tun_name}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label"><WalletOutlined /> Total Proposed Budget</div>
            <div className="kpi-value">₹ {budgetData?.tbm_proposed_total_amount?.toLocaleString() || 0}</div>
          </div>
        </div>
      </div>

      {renderStatusBanner()}

      <div className="details-grid">
        {/* Geography Details */}
        <div className="col-12">
          <div className="section-card">
            <div className="section-title">
              <GlobalOutlined /> Geography & Location Points
            </div>
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} md={8}>
                <DataPoint 
                  icon={<EnvironmentOutlined />} 
                  label="State" 
                  value={budgetData?.tsl_state_name} 
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <DataPoint 
                  icon={<AimOutlined />} 
                  label="District" 
                  value={budgetData?.tdl_district_name} 
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <DataPoint 
                  icon={<AppstoreOutlined />} 
                  label="Block" 
                  value={unitLocation.blocks.map(b => b.label).join(", ")} 
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <DataPoint 
                  icon={<HomeOutlined />} 
                  label="Gram Panchayat" 
                  value={unitLocation.grampanchayats.map(g => g.label).join(", ")} 
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <DataPoint 
                  icon={<NumberOutlined />} 
                  label="Revenue Villages" 
                  value={unitLocation.revenue_villages.map(rv => rv.label).join(", ")} 
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <DataPoint 
                  icon={<AimOutlined />} 
                  label="Villages / Hamlets" 
                  value={unitLocation.villages.map(v => v.label).join(", ")} 
                />
              </Col>
            </Row>
          </div>
        </div>

        {/* Audit Details */}
        <div className="col-12" style={{ marginTop: 24 }}>
          <div className="section-card">
            <div className="section-title">
              <AuditOutlined /> Audit & Creation Info
            </div>
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} md={6}>
                <DataPoint 
                  icon={<UserOutlined />} 
                  label="Created By" 
                  value={budgetData?.created_by_name} 
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <DataPoint 
                  icon={<ClockCircleOutlined />} 
                  label="Created At" 
                  value={new Date(budgetData?.tbm_created_at).toLocaleString()} 
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <DataPoint 
                  icon={<BarChartOutlined />} 
                  label="Total Approved" 
                  value={`₹ ${totalApprovedAmount?.toLocaleString() || 0}`} 
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <DataPoint 
                  icon={<CheckCircleOutlined />} 
                  label="System Status" 
                  value={budgetData?.tbm_status} 
                />
              </Col>
            </Row>
          </div>
        </div>

        {/* Allocation Table */}
        <div className="col-12" style={{ marginTop: 24 }}>
          <div className="section-card">
            <div className="section-title">
              <FileTextOutlined /> Budget Allocations Breakdown
            </div>
            <div className="modern-table">
              <Table
                dataSource={budgetData?.tbm_budget_list || []}
                columns={columns}
                rowKey="tbad_id"
                pagination={false}
                bordered={false}
                scroll={{ x: "max-content" }}
              />
            </div>
          </div>
        </div>

        {/* Approval Flow Section */}
        <div className="col-12" style={{ marginTop: 24 }}>
          {budgeting_id && (
            <BudgetApproval
              budget_id={budgeting_id}
              not_type={not_type}
              budgetDetails={budgetData}
              user={user}
              handleFetchPendingUser={handleFetchPendingUser}
              pendingDetails={pendingDetails}
              totalApprovedAmount={totalApprovedAmount}
            />
          )}
        </div>
      </div>
    </div>
  );
}
