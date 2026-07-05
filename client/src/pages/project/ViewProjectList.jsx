import {
  CalendarOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  HomeOutlined,
  ProjectOutlined,
  ScheduleOutlined,
  TeamOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  ExclamationCircleFilled,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";
import {
  Card,
  Col,
  Descriptions,
  Row,
  Tabs,
  Tag,
  Typography,
  Badge,
  Space,
  Table,
  Skeleton,
} from "antd";
import { Suspense, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { userDetails } from "../../auth/auth";
import { projectDetailsApi } from "../../services/Project-service";
import ProjectApproval from "./ProjectApproval";
import "./ProjectDetails.css";
import ProjectMouUpload from "./mou_upload/ProjectMouUpload";
import ProjectPayments from "./payment/ProjectPayments";
import { ProjectClosure } from "./closure/ProjectClosure";
import { ProjectImpactAssessment } from "./impact_assessment/ProjectImpactAssessment";
import ProjectDeviations from "./deviation/ProjectDeviations";
import { getPendingUserApi } from "../../services/Budget-service";

import ProjectPaymentTerms from "./payment_terms/ProjectPaymentTerms";
import { ProjectMonitoring } from "./ProjectMonitoring";
// import  ProjectMonitoring  from "./ProjectMonitoring";
import FinancialReviewReport from "./quarterly_financial_review_report/FinancialReviewReport";
import { AnnualSubmission } from "./AnnualSubmission";
import ProjectPoUpload from "./po_upload/ProjectPoUpload";
import Collateral from "./Collateral";
import TaskSubTask from "./gantt/TaskSubTask";

const { Title, Text } = Typography;

export default function ViewProjectList() {
  const { tproj_id } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingDetails, setPendingDetails] = useState(null);

  const fetchDetails = () => {
    setLoading(true);
    projectDetailsApi({ tproj_id })
      .then(({ data }) => {
        if (!data) return;
        setProjectData(data);
      })
      .catch((error) =>
        toast.error(
          error?.response?.data?.originalError ||
            error?.response?.data?.message || "Failed to fetch project details"
        )
      )
      .finally(() => setLoading(false));
  };

  const handleFetchPendingUser = async () => {
    if (tproj_id) {
      const body = {
        type: "project",
        moduleName: "project",
        tableName: "t_projects",
        IdcolumnName: "tproj_id",
        IdcolumnValue: tproj_id,
        IndexcolumnName: "tproj_approver_index",
        StatuscolumnName: "tproj_status",
        usercolumnName: "tproj_user_id",
        rolecolumnName: "tproj_user_role_id",
        approvalIdColumnName: "tproj_approval_id",
      };

      getPendingUserApi(body)
        .then((res) => {
          setPendingDetails(res?.data || null);
        })
        .catch((error) => {
          console.error("Pending user fetch error", error);
        });
    }
  };

  useEffect(() => {
    if (tproj_id) {
      fetchDetails();
      handleFetchPendingUser();
    }
  }, [tproj_id]);

  const getStatusBanner = () => {
    const status = (projectData?.tproj_status || "").toLowerCase();
    if (!pendingDetails || status === "draft") return null;

    const details = pendingDetails?.details || {};
    const pendingStatus = (details?.status || "").toLowerCase();
    
    let bannerClass = "status-warning";
    let icon = <ExclamationCircleFilled />;
    let text = `ACTION REQUIRED: Pending with ${details?.role_name?.toUpperCase() || ""} (${details?.name?.toUpperCase() || ""})`;

    if (status === "approved") {
      bannerClass = "status-success";
      icon = <CheckCircleFilled />;
      text = "PROJECT MISSION FULLY APPROVED";
    } else if (status === "rejected") {
      bannerClass = "status-danger";
      icon = <CloseCircleFilled />;
      text = "PROJECT PROPOSAL REJECTED";
    } else if (status === "returned") {
      bannerClass = "status-warning";
      icon = <ExclamationCircleFilled />;
      text = `RETURNED FOR REVISION: Pending with ${details?.role_name?.toUpperCase() || ""} (${details?.name?.toUpperCase() || ""})`;
    }

    return (
      <div className={`status-banner ${bannerClass}`}>
        <Space size="middle">
          <div style={{ fontSize: '20px' }}>{icon}</div>
          <span style={{ fontWeight: 600 }}>{text}</span>
        </Space>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="project-details-container">
        {/* HERO SKELETON */}
        <div className="hero-section" style={{ background: '#f1f5f9', boxShadow: 'none' }}>
          <Skeleton active paragraph={{ rows: 3 }} title={{ width: '40%' }} />
          <Row gutter={[24, 24]} style={{ marginTop: '40px' }}>
             {[1,2,3,4].map(i => (
               <Col xs={24} sm={12} lg={6} key={i}>
                 <Skeleton.Button active block style={{ height: '100px', borderRadius: '24px' }} />
               </Col>
             ))}
          </Row>
        </div>

        <div className="details-grid">
          <div className="main-content-col">
             <Space direction="vertical" size={32} style={{ width: '100%' }}>
                <Card className="section-card"><Skeleton active paragraph={{ rows: 4 }} /></Card>
                <Card className="section-card"><Skeleton active paragraph={{ rows: 4 }} /></Card>
                <Card className="section-card"><Skeleton active paragraph={{ rows: 6 }} /></Card>
             </Space>
          </div>
          <div className="sidebar-col">
             <Space direction="vertical" size={32} style={{ width: '100%' }}>
                <Card className="section-card"><Skeleton active paragraph={{ rows: 3 }} /></Card>
                <Card className="section-card"><Skeleton active paragraph={{ rows: 5 }} /></Card>
                <Card className="section-card"><Skeleton active paragraph={{ rows: 4 }} /></Card>
             </Space>
          </div>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="project-details-container">
        <Card className="section-card">Project not found or failed to load.</Card>
      </div>
    );
  }

  return (
    <div className="project-details-container fade-in">
      {/* ================= HERO SECTION ================= */}
      <div className="hero-section">
        <div className="hero-header">
          <div className="hero-title">
            <Title level={2}>
              {projectData?.tproj_project_title || "Project Overview"}
            </Title>
            <div className="hero-subtitle">
              <div className="hero-chip">
                <Badge status="processing" color="white" /> 
                <span style={{ fontWeight: 700 }}>ID: {projectData?.tproj_unique_id || tproj_id}</span>
              </div>
              <div className="hero-chip">
                <CalendarOutlined /> 
                <span style={{ fontWeight: 700 }}>FY: {projectData?.tfy_year_label || projectData?.tpu_financial_year || "N/A"}</span>
              </div>
              <div className="hero-chip">
                <ProjectOutlined /> 
                <span style={{ fontWeight: 700 }}>{projectData?.unit_name || "N/A"} UNIT</span>
              </div>
            </div>
          </div>
          <div className="hero-actions">
            {projectData?.tproj_status && (
              <Tag 
                color={projectData.tproj_status === "approved" ? "#10b981" : "#e31e24"} 
                style={{ 
                  padding: "6px 20px", 
                  fontSize: "14px", 
                  borderRadius: "100px", 
                  fontWeight: 800,
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                {projectData.tproj_status?.toUpperCase()}
              </Tag>
            )}
          </div>
        </div>

        <div className="kpi-grid">
          {/* TOTAL BUDGET */}
          <div className="kpi-card">
            <div className="kpi-icon-row">
              <div className="kpi-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#a7f3d0' }}>
                <DollarOutlined />
              </div>
              <div className="kpi-label">Financial Output</div>
            </div>
            <div className="kpi-value">₹ {(projectData?.tproj_budget_amount || 0).toLocaleString()}</div>
          </div>

          {/* IMPLEMENTING PARTNER */}
          <div className="kpi-card">
            <div className="kpi-icon-row">
              <div className="kpi-icon-wrapper" style={{ background: 'rgba(79, 70, 229, 0.2)', color: '#c7d2fe' }}>
                <TeamOutlined />
              </div>
              <div className="kpi-label">Project Partner</div>
            </div>
            <div className="kpi-value" style={{ fontSize: '18px' }}>{projectData?.ngo_name || "Direct Implementation"}</div>
          </div>

          {/* DURATION */}
          <div className="kpi-card">
            <div className="kpi-icon-row">
              <div className="kpi-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fde68a' }}>
                <ScheduleOutlined />
              </div>
              <div className="kpi-label">Timeline</div>
            </div>
            <div className="kpi-value" style={{ fontSize: '14px' }}>
              <div>START: {projectData?.tproj_project_start_date ? new Date(projectData.tproj_project_start_date).toLocaleDateString() : "N/A"}</div>
              <div style={{ opacity: 0.7 }}>END: {projectData?.tproj_project_end_date ? new Date(projectData.tproj_project_end_date).toLocaleDateString() : "N/A"}</div>
            </div>
          </div>

          {/* PROJECT THEME */}
          <div className="kpi-card">
            <div className="kpi-icon-row">
              <div className="kpi-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#ddd6fe' }}>
                <GlobalOutlined />
              </div>
              <div className="kpi-label">Strategic Focus</div>
            </div>
            <div className="kpi-value" style={{ fontSize: '18px' }}>{projectData?.theme_name || "Development Focus"}</div>
          </div>
        </div>
      </div>

      {/* ================= STATUS BANNER ================= */}
      {getStatusBanner()}

      <div className="details-grid">
        {/* ================= MAIN CONTENT ================= */}
        <div className="main-content-col">
          <Space direction="vertical" size={32} style={{ width: "100%" }}>
            
            {/* 1. PROJECT DESCRIPTION VAULT */}
            <div className="section-card">
              <div className="section-title">
                <div style={{ color: '#4f46e5' }}><InfoCircleOutlined /></div>
                <span>Mission Intelligence & Context</span>
              </div>
              <div style={{ marginBottom: '32px', background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                <div className="label" style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, marginBottom: '12px', letterSpacing: '1px' }}>EXECUTIVE SUMMARY</div>
                <Text type="secondary" style={{ fontSize: "16px", lineHeight: "1.8", color: '#334155' }}>
                  {projectData?.tproj_project_desc || "Documentation pending for this project mission."}
                </Text>
              </div>
              <Row gutter={[24, 24]}>
                <Col span={12}>
                  <div className="data-point">
                    <div className="icon-wrapper-color" style={{ background: '#fef2f2', color: '#e31e24' }}>
                      <ClockCircleOutlined />
                    </div>
                    <div className="data-content">
                      <span className="label">Criticality Flag</span>
                      <span className="value">{projectData?.tproj_project_started_necessarily == 1 ? "Mandatory Commencement" : "Standard Cycle"}</span>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="data-point">
                    <div className="icon-wrapper-color" style={{ background: '#ecfdf5', color: '#10b981' }}>
                      <BarChartOutlined />
                    </div>
                    <div className="data-content">
                      <span className="label">Implementation Type</span>
                      <span className="value">{projectData?.tproj_project_type || "Sustainable Dev"}</span>
                    </div>
                  </div>
                </Col>
                <Col span={24}>
                  <div className="data-point">
                    <div className="icon-wrapper-color" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                      <CheckCircleOutlined />
                    </div>
                    <div className="data-content">
                      <span className="label">Approved Type</span>
                      <span className="value">
                        {projectData?.tproj_approved_type
                          ? projectData.tproj_approved_type
                              .split("_")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1),
                              )
                              .join(" ")
                              .replace("Other Then", "Other Than")
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* 2. IMPACT METHODOLOGY */}
            <div className="section-card">
              <div className="section-title">
                <div style={{ color: '#10b981' }}><BarChartOutlined /></div>
                <span>Engagement & Impact Mapping</span>
              </div>
              <Row gutter={[24, 24]}>
                <Col span={12}>
                  <div className="data-point">
                    <div className="icon-wrapper-color" style={{ background: '#fffbeb', color: '#f59e0b' }}>
                      <ClockCircleOutlined />
                    </div>
                    <div className="data-content">
                      <span className="label">Baseline Registry</span>
                      <span className="value">{projectData?.tproj_baseline_info || "Initial evaluation pending"}</span>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="data-point">
                    <div className="icon-wrapper-color" style={{ background: '#f0fdf4', color: '#22c55e' }}>
                      <ProjectOutlined />
                    </div>
                    <div className="data-content">
                      <span className="label">Monitoring Framework</span>
                      <span className="value">{projectData?.tproj_monitoring_method || "Digital Dashboard Tracking"}</span>
                    </div>
                  </div>
                </Col>
                <Col span={24}>
                  <div className="data-point">
                    <div className="icon-wrapper-color" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                      <TeamOutlined />
                    </div>
                    <div className="data-content">
                      <span className="label">Target Demographic Group</span>
                      <span className="value">{projectData?.tproj_target_beneficiary_group || "Universal Community Impact"}</span>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* 3. KPI REPOSITORY */}
            <div className="section-card">
              <div className="section-title" style={{ border: 'none', marginBottom: '8px' }}>
                <div style={{ color: '#ec4899' }}><CheckCircleOutlined /></div>
                <span>Strategic Performance Indicators</span>
              </div>
              <Table 
                dataSource={projectData?.kpi_names?.map((name, i) => ({ key: i, index: i + 1, name })) || []}
                pagination={false}
                size="large"
                className="modern-table"
                rowKey={(record) => record.key}
                columns={[
                  { 
                    title: '#', 
                    dataIndex: 'index', 
                    key: 'index', 
                    width: 80,
                    render: (val) => <span style={{ fontWeight: 800, color: '#94a3b8' }}>{val.toString().padStart(2, '0')}</span>
                  },
                  { 
                    title: 'Strategic Indicator Metrics', 
                    dataIndex: 'name', 
                    key: 'name',
                    render: (text) => <span style={{ fontWeight: 600, color: '#1e293b' }}>{text}</span>
                  }
                ]}
              />
            </div>
          </Space>
        </div>

        {/* ================= SIDEBAR ================= */}
        <div className="sidebar-col" style={{ animationDelay: '0.2s' }}>
          <Space direction="vertical" size={32} style={{ width: "100%" }}>
            
            {/* APPROVAL ACTIONS (REMAINS PERSISTENT) */}
            <ProjectApproval 
              projectData={projectData} 
              onRefresh={fetchDetails} 
              handleFetchPendingUser={handleFetchPendingUser}
              pendingDetails={pendingDetails}
              onlyActions={true}
            />

            {/* GEOGRAPHIC TIMELINE */}
            <div className="section-card">
              <div className="section-title">
                <div style={{ color: '#f59e0b' }}><EnvironmentOutlined /></div>
                <span>Deployment Geometry</span>
              </div>
              <div className="geography-timeline">
                <div className="geo-node active">
                  <div className="label">REGION / STATE</div>
                  <div className="value" style={{ fontWeight: 700, color: '#1e293b' }}>{projectData?.state_name}</div>
                </div>
                <div className="geo-node active">
                  <div className="label">OPERATIONAL DISTRICT</div>
                  <div className="value" style={{ fontWeight: 700, color: '#1e293b' }}>{projectData?.district_name}</div>
                </div>
                <div className="geo-node">
                  <div className="label">ALIGNED BLOCKS</div>
                  <div className="value" style={{ fontSize: '13px', color: '#64748b' }}>{projectData?.block_names?.join(" • ") || "No specific blocks mapped"}</div>
                </div>
                <div className="geo-node">
                  <div className="label">GRAM PANCHAYATS</div>
                  <div className="value" style={{ fontSize: '13px', color: '#64748b' }}>{projectData?.gp_names?.join(" • ") || "N/A"}</div>
                </div>
              </div>
            </div>

            {/* SDG IMPACT TRACKER */}
            <div className="section-card">
              <div className="section-title">
                <div style={{ color: '#3b82f6' }}><GlobalOutlined /></div>
                <span>Sustainability Alignment</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {projectData?.tproj_sdg_details?.length > 0 ? projectData.tproj_sdg_details.map((sdg, i) => (
                  <div key={i} className="sdg-pill">
                    <div className="sdg-header">
                      <span className="sdg-name">{sdg.sdg_name}</span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#e31e24' }}>{sdg.sdg_weightage_value}%</span>
                    </div>
                    <div className="sdg-progress-bg">
                      <div className="sdg-progress-fill" style={{ width: `${sdg.sdg_weightage_value}%` }}></div>
                    </div>
                  </div>
                )) : <Text type="secondary" style={{ fontStyle: 'italic' }}>No SDGs mapped to this mission.</Text>}
              </div>
            </div>

            {/* STRATEGIC ALIGNMENT VAULT */}
            <div className="section-card" style={{ background: '#1e293b', color: 'white' }}>
              <div className="section-title" style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <ProjectOutlined /> Governance Context
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div className="label" style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 800, letterSpacing: '1px' }}>SCHEDULE ALIGNMENT</div>
                  <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{projectData?.schedule_name || "N/A"}</div>
                </div>
                <div>
                  <div className="label" style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 800, letterSpacing: '1px' }}>SUB-SCHEDULE CATEGORY</div>
                  <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{projectData?.sub_schedule_name || "N/A"}</div>
                </div>
              </div>
            </div>

            {/* FINAL REMARKS */}
            <div className="section-card">
              <div className="section-title">
                <div style={{ color: '#64748b' }}><MessageOutlined /></div>
                <span>Strategic Advisory Remarks</span>
              </div>
              <div style={{ position: 'relative', paddingLeft: '20px' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#f1f5f9', borderRadius: '10px' }}></div>
                <Text type="secondary" style={{ fontSize: '15px', fontStyle: 'italic', color: '#475569', lineHeight: '1.6' }}>
                  {projectData?.tproj_remarks || "No supplementary advisor remarks recorded."}
                </Text>
              </div>
            </div>

          </Space>
        </div>
      </div> {/* Correctly closing details-grid */}

      {/* 4. ACTIVITY OPERATIONS HUB - NOW FULL WIDTH */}
           {(projectData?.tproj_status === "approved" || projectData?.tproj_status === "pending" || projectData?.tproj_status === "closed") && (
        <div className="section-card" style={{ padding: 0, overflow: 'hidden', marginTop: '40px' }}>
          <div className="section-title" style={{ padding: '36px 36px 20px 36px', border: 'none', marginBottom: 0 }}>
             <div style={{ color: '#e31e24' }}><ProjectOutlined /></div>
             <span>Operations Ecosystem & Mission Activities</span>
          </div>
          <div style={{ padding: '0 36px 36px 36px' }}>
            {/* ✅ Closure Locking Logic */}
            {["pending", "approved"].includes(projectData?.latest_closure_status) && (
              <div className="alert alert-warning mb-4 mx-2" style={{ borderRadius: '12px', border: '1px solid #fcd34d', background: '#fffbeb' }}>
                <Space>
                  <InfoCircleOutlined style={{ color: '#f59e0b', fontSize: '18px' }} />
                  <span style={{ fontWeight: 600, color: '#92400e' }}>
                    {projectData?.latest_closure_status === "approved" 
                      ? "PROJECT MISSION CLOSED: Activity logging and financial updates are disabled as this project has been officially closed and approved."
                      : "PROJECT CLOSURE IN PROGRESS: Activity logging and financial updates are disabled while the project closure is undergoing approval."
                    }
                  </span>
                </Space>
              </div>
            )}
            <Tabs
              defaultActiveKey="1"
              className="modern-tabs"
              items={[
                { key: "1", label: "Financials", children: <Suspense fallback={<p>Loading...</p>}><ProjectPayments projectId={tproj_id} projectDetails={projectData} fetchDetails={fetchDetails} isClosureApproved={["pending", "approved"].includes(projectData?.latest_closure_status)} /></Suspense> },
                { key: "2", label: "Deviations", children: <Suspense fallback={<p>Loading...</p>}><ProjectDeviations projectId={tproj_id} projectDetails={projectData} fetchDetails={fetchDetails} isClosureApproved={["pending", "approved"].includes(projectData?.latest_closure_status)} /></Suspense> },
                { key: "3", label: "Pay Terms", children: <Suspense fallback={<p>Loading...</p>}><ProjectPaymentTerms projectId={tproj_id} projectDetails={projectData} fetchDetails={fetchDetails} isClosureApproved={["pending", "approved"].includes(projectData?.latest_closure_status)} /></Suspense> },
                { key: "4", label: "Monitoring", children: <Suspense fallback={<p>Loading...</p>}><ProjectMonitoring projectId={tproj_id} projectDetails={projectData} fetchDetails={fetchDetails} isClosureApproved={["pending", "approved"].includes(projectData?.latest_closure_status)} /></Suspense> },
                { key: "5", label: "Review", children: <Suspense fallback={<p>Loading...</p>}><FinancialReviewReport projectId={tproj_id} projectDetails={projectData} fetchDetails={fetchDetails} isClosureApproved={["pending", "approved"].includes(projectData?.latest_closure_status)} /></Suspense> },
                { key: "6", label: "Annual", children: <Suspense fallback={<p>Loading...</p>}><AnnualSubmission projectId={tproj_id} projectDetails={projectData} fetchDetails={fetchDetails} isClosureApproved={["pending", "approved"].includes(projectData?.latest_closure_status)} /></Suspense> },
                { key: "7", label: "Collateral", children: <Suspense fallback={<p>Loading...</p>}><Collateral projectId={tproj_id} projectDetails={projectData} fetchDetails={fetchDetails} isClosureApproved={["pending", "approved"].includes(projectData?.latest_closure_status)} /></Suspense> },
                { key: "8", label: "Timeline", children: <Suspense fallback={<p>Loading...</p>}><TaskSubTask isClosureApproved={["pending", "approved"].includes(projectData?.latest_closure_status)} /></Suspense> },
                { key: "9", label: "MOU", children: <Suspense fallback={<p>Loading...</p>}><ProjectMouUpload projectId={tproj_id} projectDetails={projectData} fetchDetails={fetchDetails} isClosureApproved={["pending", "approved"].includes(projectData?.latest_closure_status)} /></Suspense> },
                { key: "10", label: "PO", children: <Suspense fallback={<p>Loading...</p>}><ProjectPoUpload projectId={tproj_id} projectDetails={projectData} fetchDetails={fetchDetails} isClosureApproved={["pending", "approved"].includes(projectData?.latest_closure_status)} /></Suspense> },
                { key: "11", label: "Closure", children: <Suspense fallback={<p>Loading...</p>}><ProjectClosure projectId={tproj_id} projectDetails={projectData} fetchDetails={fetchDetails} isClosureApproved={["pending", "approved"].includes(projectData?.latest_closure_status)} /></Suspense> },
              ]}
            />
          </div>
        </div>
      )}

      {/* ================= HISTORY TRACK ================= */}
      <div style={{ marginTop: '40px' }}>
        <ProjectApproval 
          projectData={projectData} 
          onRefresh={fetchDetails} 
          handleFetchPendingUser={handleFetchPendingUser}
          pendingDetails={pendingDetails}
          onlyTrack={true}
        />
      </div>
    </div>
  );
}
