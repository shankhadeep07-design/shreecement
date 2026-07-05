import {
  FileTextOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  PaperClipOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  Card,
  Divider,
  Typography,
  Button,
  Tag,
  Space,
  Row,
  Col,
} from "antd";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getProjectClosureDetailsApi, sendProjectClosureForApprovalApi, getProjectClosurePendingUserApi } from "../../../services/Project-service";
import dayjs from "dayjs";
import ProjectClosureApproval from "./ProjectClosureApproval";
import { userDetails } from "../../../auth/auth";

const { Title, Text } = Typography;

export default function ViewProjectClosure() {
  const tpclsr_id = useParams()?.tpclsr_id;
  const navigate = useNavigate();
  const [projectClosureData, setProjectClosureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingDetails, setPendingDetails] = useState(null);
  const user = userDetails();

  const fetchDetails = () => {
    setLoading(true);
    getProjectClosureDetailsApi({ tpclsr_id })
      .then(({ data }) => {
        if (!data) return;
        setProjectClosureData(data);
      })
      .catch((error) =>
        toast.error(
          error?.response?.data?.originalError ||
            error?.response?.data?.message ||
            "Failed to fetch closure details"
        )
      )
      .finally(() => setLoading(false));
  };

  const handleFetchPendingUser = async () => {
    try {
      const res = await getProjectClosurePendingUserApi({ item_id: tpclsr_id });
      if (res.status === 1) {
        setPendingDetails(res.data);
      }
    } catch (error) {
      console.error("Pending user fetch error", error);
    }
  };

  useEffect(() => {
    if (tpclsr_id) {
      fetchDetails();
      handleFetchPendingUser();
    }
  }, [tpclsr_id]);

  const handleSendForApproval = async () => {
    try {
      const res = await sendProjectClosureForApprovalApi({ 
        item_id: tpclsr_id,
        remarks: "Initiating approval process for project closure."
      });
      if (res.status === 1) {
        toast.success("Sent for approval successfully");
        fetchDetails();
        handleFetchPendingUser();
      } else {
        toast.error(res.message || "Failed to send for approval");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Loading project closure details...</p>
      </div>
    );
  }

  if (!projectClosureData) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <Title level={4}>Closure record not found.</Title>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "#10b981";
      case "draft":
        return "#f59e0b";
      default:
        return "#3b82f6";
    }
  };

  return (
    <div className="view-closure-container fade-in" style={{ padding: "24px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* APPROVAL STATUS BANNER */}
      {projectClosureData?.tpclsr_status && projectClosureData?.tpclsr_status !== 'draft' && (
        <Card className="status-banner" style={{ marginBottom: '24px', borderRadius: '16px', border: 'none', background: 'linear-gradient(90deg, #1e293b 0%, #334155 100%)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space size="large">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.7, letterSpacing: '1px' }}>Current Status</div>
                <Tag color={getStatusColor(projectClosureData?.tpclsr_status)} style={{ margin: 0, fontWeight: 700, borderRadius: '4px' }}>
                  {projectClosureData?.tpclsr_status?.toUpperCase()}
                </Tag>
              </div>
              {pendingDetails?.details && projectClosureData?.tpclsr_status !== 'approved' && (
                <>
                  <Divider type="vertical" style={{ background: 'rgba(255,255,255,0.1)', height: '40px' }} />
                  <div>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.7, letterSpacing: '1px' }}>Pending With</div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{pendingDetails.details.name} <span style={{ opacity: 0.6, fontWeight: 400, fontSize: '12px' }}>({pendingDetails.details.role_name})</span></div>
                  </div>
                </>
              )}
            </Space>
            {(projectClosureData?.tpclsr_status === 'draft' || projectClosureData?.tpclsr_status === 'resend') && (
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleSendForApproval} size="large" shape="round">
                Send For Approval
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* HEADER SECTION */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Space direction="vertical" size={0}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(-1)} 
              style={{ background: "white", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
            />
            <Title level={3} style={{ margin: 0 }}>Project Closure Details</Title>
          </div>
          <Text type="secondary" style={{ marginLeft: "44px" }}>Reviewing mission completion methodology and impact metrics</Text>
        </Space>
        
        <Space>
          <Tag 
            color={getStatusColor(projectClosureData?.tpclsr_status)}
            style={{ 
              padding: "8px 24px", 
              borderRadius: "10px", 
              fontWeight: 700, 
              fontSize: "14px",
              textTransform: "uppercase",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              margin: 0
            }}
          >
            {projectClosureData?.tpclsr_status || "DRAFT"}
          </Tag>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* MAIN DETAILS */}
        <Col span={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card 
              className="glass-card" 
              style={{ borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.04)", border: "1px solid #fff" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                <div style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", padding: "10px", borderRadius: "12px" }}>
                  <FileTextOutlined style={{ fontSize: "20px" }} />
                </div>
                <Title level={4} style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Project Deliverable Review</Title>
              </div>

              <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "20px", marginBottom: "32px", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#94a3b8", letterSpacing: "1.5px", marginBottom: "12px", textTransform: 'uppercase' }}>MISSION ACHIEVEMENTS</div>
                <Text style={{ fontSize: "16px", color: "#334155", lineHeight: "1.8", display: 'block' }}>
                  {projectClosureData?.tpclsr_deliverable_achieved || "Documentation pending for this project mission completion."}
                </Text>
              </div>

              {/* KPI GRID */}
              <Row gutter={[20, 20]}>
                {[
                  { 
                    label: "Closure Date", 
                    value: projectClosureData?.tpclsr_closure_date ? dayjs(projectClosureData.tpclsr_closure_date).format("DD MMM YYYY") : "N/A",
                    icon: <CalendarOutlined />,
                    bg: "rgba(239, 68, 68, 0.1)",
                    color: "#ef4444"
                  },
                  { 
                    label: "Beneficiary Impact", 
                    value: projectClosureData?.tpclsr_beneficiary_impacted || "N/A",
                    icon: <TeamOutlined />,
                    bg: "rgba(139, 92, 246, 0.1)",
                    color: "#8b5cf6"
                  },
                  { 
                    label: "Finalized Status", 
                    value: projectClosureData?.tpclsr_closed_finally === "Yes" ? "PERMANENTLY CLOSED" : "CONDITIONALLY CLOSED",
                    icon: <CheckCircleOutlined />,
                    bg: "rgba(16, 185, 129, 0.1)",
                    color: "#10b981",
                    isTag: true
                  },
                  { 
                    label: "Final Payment", 
                    value: `₹ ${(projectClosureData?.tpclsr_total_payment_received || 0).toLocaleString()}`,
                    icon: <DollarOutlined />,
                    bg: "rgba(245, 158, 11, 0.1)",
                    color: "#f59e0b"
                  }
                ].map((item, index) => (
                  <Col span={12} key={index}>
                    <div style={{ 
                      padding: '20px', 
                      background: '#fff', 
                      border: '1px solid #f1f5f9', 
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      height: '100%',
                      transition: 'all 0.3s'
                    }} className="kpi-item-card">
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        background: item.bg, 
                        color: item.color, 
                        borderRadius: '14px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>
                        {item.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>{item.label}</div>
                        {item.isTag ? (
                          <Tag color={projectClosureData?.tpclsr_closed_finally === "Yes" ? "success" : "default"} style={{ border: 'none', fontWeight: 600, margin: 0 }}>
                            {item.value}
                          </Tag>
                        ) : (
                          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{item.value}</div>
                        )}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>

              <div style={{ marginTop: "32px", padding: "24px", background: "#f8fafc", borderRadius: "20px", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#94a3b8", letterSpacing: "1.5px", marginBottom: "12px", textTransform: 'uppercase' }}>CLOSURE REMARKS & SUMMARY</div>
                <div style={{ color: "#475569", lineHeight: "1.7", fontStyle: 'italic', position: 'relative', paddingLeft: '20px' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#e2e8f0', borderRadius: '4px' }}></div>
                  {projectClosureData?.tpclsr_summary_report || "No additional strategic remarks recorded for this closure."}
                </div>
              </div>
            </Card>

            {/* APPROVAL SECTION */}
            {tpclsr_id && (
              <ProjectClosureApproval 
                tpclsr_id={tpclsr_id}
                projectClosureData={projectClosureData}
                user={user}
                handleFetchPendingUser={handleFetchPendingUser}
                pendingDetails={pendingDetails}
                refreshData={fetchDetails}
              />
            )}
          </div>
        </Col>

        {/* SIDEBAR / DOCUMENTS */}
        <Col span={8}>
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            <Card 
              title={
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: '4px 0' }}>
                  <PaperClipOutlined style={{ color: "#3b82f6" }} />
                  <span style={{ fontWeight: 700 }}>Evidence & Documents</span>
                </div>
              }
              style={{ borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.03)", border: "1px solid #fff" }}
              bodyStyle={{ padding: "20px" }}
              className="glass-card"
            >
              {(projectClosureData?.documents || []).length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {projectClosureData.documents.map((doc, i) => (
                    <a 
                      key={i} 
                      href={doc.full_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="doc-link-card"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "14px",
                        background: "#f8fafc",
                        borderRadius: "16px",
                        color: "#1e293b",
                        transition: "all 0.3s",
                        border: '1px solid #f1f5f9'
                      }}
                    >
                      <div style={{ background: "white", padding: "10px", borderRadius: "10px", boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                        <FileTextOutlined style={{ color: "#3b82f6", fontSize: '18px' }} />
                      </div>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{ fontSize: "14px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {doc.doc_name || "Closure Document"}
                        </div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>
                          {doc.doc_ext?.toUpperCase().replace('.', '') || "PDF"} • CLICK TO PREVIEW
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 20px", background: "#f8fafc", borderRadius: "20px", border: '1px dashed #e2e8f0' }}>
                   <InfoCircleOutlined style={{ fontSize: "32px", color: "#cbd5e1", marginBottom: "12px" }} />
                   <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px", fontWeight: 500 }}>No documents attached</p>
                </div>
              )}
            </Card>

            <div style={{ background: "#1e293b", padding: "32px", borderRadius: "32px", boxShadow: '0 20px 40px rgba(30, 41, 59, 0.2)', position: 'relative', overflow: 'hidden' }}>
               <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}></div>
               <Title level={5} style={{ color: "white", margin: 0, fontSize: '16px' }}>Mission Governance</Title>
               <Divider style={{ borderColor: "rgba(255,255,255,0.1)", margin: "16px 0" }} />
               <Text style={{ color: "#94a3b8", fontSize: "13px", lineHeight: '1.6', display: 'block' }}>
                 This closure record serves as the final mission verification. All financial and impact data has been indexed for compliance auditing.
               </Text>
            </div>
          </Space>
        </Col>
      </Row>

      <style jsx>{`
        .doc-link-card:hover {
          background: #fff !important;
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.06);
          border-color: #3b82f6 !important;
        }
        .kpi-item-card:hover {
          border-color: #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          transform: translateY(-2px);
        }
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
