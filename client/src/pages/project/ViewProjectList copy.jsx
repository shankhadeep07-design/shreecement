import { FileTextOutlined, UserOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Form,
  Input,
  Select,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { Suspense, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { userDetails } from "../../auth/auth";
import {
  approveNotificationApi,
  getApprovalTrackApi,
  getNotificationDetailsApi,
} from "../../services/Notification-service";
import { projectDetailsApi } from "../../services/Project-service";
import { sendProposalForApprovalApi } from "../../services/Proposal-service";
import ProjectMouUpload from "./mou_upload/ProjectMouUpload";
import ProjectPayments from "./payment/ProjectPayments";
import { ProjectClosure } from "./closure/ProjectClosure";
import { ProjectImpactAssessment } from "./impact_assessment/ProjectImpactAssessment";
import { ProjectBeneficiary } from "./beneficiary/ProjectBeneficiary";
// import { budgetingDetailsApi } from '../../../services/Budget-service';
import ProjectPoUpload from "./po_upload/ProjectPoUpload";
import ProjectDeviations from "./deviation/ProjectDeviations";

import ProjectPaymentTerms from "./payment_terms/ProjectPaymentTerms";
import { ProjectMonitoring } from "./ProjectMonitoring";
// import  ProjectMonitoring  from "./ProjectMonitoring";
import FinancialReviewReport from "./quarterly_financial_review_report/FinancialReviewReport";
import { AnnualSubmission } from "./AnnualSubmission";

import { Collateral } from "./Collateral";

import { GanttChart } from "./GanttChart";

export default function ViewProjectList() {
  const tproj_id = useParams()?.tproj_id;
  const [projectData, setProjectData] = useState(null);
  const [notification, setNotification] = useState([]);
  const [approvalTrack, setApprovalTrack] = useState([]);
  const [loading, setLoading] = useState(false);
  const [proposalSendData, setPropodalSendData] = useState({
    approval_remarks: "",
    tproj_id: tproj_id,
    approval_type: "proposal",
  });

  const userDetail = userDetails();

  // Example states (replace with your actual logic)
  const [approvalData, setApprovalData] = useState({
    approval_type: "proposal",
    approval_status: "",
    approval_remarks: "",
    approval_item_id: tproj_id,
  });
  const user = { id: 1 }; // replace with auth user
  const id = tproj_id;

  const fetchDetails = () => {
    projectDetailsApi({ tproj_id })
      .then(({ data }) => {
        if (!data) return;
        setProjectData(data);
      })
      .catch((error) =>
        toast.error(
          error?.response?.data?.originalError ||
            error?.response?.data?.message,
        ),
      );
  };

  const notificationFun = () => {
    const data = {
      user_id: user.id,
      item_id: id,
      not_action_taken: "N",
    };
    getNotificationDetailsApi(data)
      .then((res) => setNotification(res.data || []))
      .catch(() => {});
  };

  const approvalTrackFun = () => {
    const data = { item_id: id };
    getApprovalTrackApi(data)
      .then((res) => setApprovalTrack(res.data || []))
      .catch(() => {});
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await approveNotificationApi(approvalData);
      if (response.status === 1) {
        toast.success(response.message);
        approvalTrackFun();
        notificationFun();
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(false);
  };

  const handleSendForApprovalSubmit = async () => {
    setLoading(true);
    try {
      const sendData = {
        approval_type: "proposal",
        approval_status: "draft",
        approval_item_id: tproj_id,
        approval_remarks: proposalSendData.approval_remarks.trim(),
      };

      const response = await sendProposalForApprovalApi(sendData);
      if (response.status) {
        toast.success(response.message);
        // initiatedDatatable(); // if you have a refresh table function
        fetchDetails();
        notificationFun();
        approvalTrackFun();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (tproj_id) {
      fetchDetails();
      notificationFun();
      approvalTrackFun();
    }
  }, [tproj_id]);

  // if (!projectData) {
  //   return <p style={{ padding: 20 }}>Loading project details...</p>;
  // }

  return (
    <div className="home-content">
      <Card className="card project-details-card">
        <div className="card-header">
          <h5 className="mb-0"> Project Details</h5>
        </div>
        <div className="card-body">
          <div className="card m-0 mb-3 mt-2">
            <div className="card-header header-bg">
              <h5 className="mb-0"> Project Info</h5>
            </div>
            <div className="card-body">
              <Descriptions
                column={3}
                size="middle"
                labelStyle={{ fontWeight: 500 }}
                contentStyle={{
                  background: "#fafafa",
                  padding: "8px 12px",
                  borderRadius: 6,
                }}
              >
                <Descriptions.Item label="Project Name">
                  {projectData?.tproj_project_title}
                </Descriptions.Item>

                <Descriptions.Item label="Financial Year">
                  {projectData?.tfy_year_label}
                </Descriptions.Item>

                <Descriptions.Item label="Unit">
                  {projectData?.unit_name}
                </Descriptions.Item>

                <Descriptions.Item label="State">
                  {projectData?.state_name}
                </Descriptions.Item>

                <Descriptions.Item label="District">
                  {projectData?.district_name?.trim()}
                </Descriptions.Item>

                <Descriptions.Item label="Block">
                  {projectData?.blocks?.map((b) => b.name).join(", ") || "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Gram Panchayat">
                  {projectData?.gram_panchayats
                    ?.map((g) => g.name)
                    .join(", ") || "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Revenue Village">
                  {projectData?.revenue_villages
                    ?.map((r) => r.name)
                    .join(", ") || "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Village">
                  {projectData?.villages?.map((v) => v.name).join(", ") ||
                    "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Theme">
                  {projectData?.theme_name}
                </Descriptions.Item>

                <Descriptions.Item label="Schedule">
                  {projectData?.schedule_name}
                </Descriptions.Item>

                <Descriptions.Item label="Sub Schedule">
                  {projectData?.sub_schedule_name}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        </div>

        <div className="card m-0 mb-3 mt-2">
          <div className="card-header header-bg">
            <h5 className="mb-0">Project Details</h5>
          </div>

          {/* {
            permissions.indexOf("list") > -1 ? ( */}
          <>
            <div className="card m-0 mb-3 mt-2">
              <div className="card-header header-bg">
                <h5 className="mb-0">Project Activity</h5>
              </div>

              <div className="card-body">
                <Tabs
                  defaultActiveKey="1"
                  destroyInactiveTabPane
                  items={[
                    {
                      key: "1",
                      label: "Payment",
                      children: (
                        <Suspense fallback={<p>Loading Payment...</p>}>
                          <ProjectPayments
                            projectId={tproj_id}
                            projectDetails={projectData}
                            fetchDetails={fetchDetails}
                          />
                        </Suspense>
                      ),
                    },

                    {
                      key: "2",
                      label: "Deviation",
                      children: (
                        <Suspense fallback={<p>Loading Deviation...</p>}>
                          <ProjectDeviations
                            projectId={tproj_id}
                            projectDetails={projectData}
                            fetchDetails={fetchDetails}
                          />
                        </Suspense>
                      ),
                    },

                    {
                      key: "3",
                      label: "Payment Terms Form",
                      children: (
                        <Suspense
                          fallback={<p>Loading Payment Terms Form...</p>}
                        >
                          <ProjectPaymentTerms
                            projectId={tproj_id}
                            projectDetails={projectData}
                            fetchDetails={fetchDetails}
                          />
                        </Suspense>
                      ),
                    },

                    {
                      key: "4",
                      label: "Monitoring & Execution",
                      children: (
                        <Suspense fallback={<p>Loading Monitoring...</p>}>
                          <ProjectMonitoring
                            projectId={tproj_id}
                            projectDetails={projectData}
                            fetchDetails={fetchDetails}
                          />
                        </Suspense>
                      ),
                    },

                    {
                      key: "5",
                      label: "Quarterly Financial Review Report",
                      children: (
                        <Suspense
                          fallback={
                            <p>Loading Quarterly Financial Review Report...</p>
                          }
                        >
                          <FinancialReviewReport
                            projectId={tproj_id}
                            projectDetails={projectData}
                            fetchDetails={fetchDetails}
                          />
                        </Suspense>
                      ),
                    },

                    {
                      key: "6",
                      label: "Annual Report Submission",
                      children: (
                        <Suspense
                          fallback={<p>Loading Annual Report Submission...</p>}
                        >
                          <AnnualSubmission
                            projectId={tproj_id}
                            projectDetails={projectData}
                            fetchDetails={fetchDetails}
                          />
                        </Suspense>
                      ),
                    },

                    {
                      key: "7",
                      label: "Collateral",
                      children: (
                        <Suspense
                          fallback={<p>Loading Collateral Submission...</p>}
                        >
                          <Collateral
                            projectId={tproj_id}
                            projectDetails={projectData}
                            fetchDetails={fetchDetails}
                          />
                        </Suspense>
                      ),
                    },

                    // {
                    //   key: "8",
                    //   label: "Gantt Chart",
                    //   children: (
                    //     <Suspense
                    //       fallback={<p>Loading Gantt Chart Submission...</p>}
                    //     >
                    //       <GanttChart
                    //         projectId={tproj_id}
                    //         projectDetails={projectData}
                    //         fetchDetails={fetchDetails}
                    //       />
                    //     </Suspense>
                    //   ),
                    // },

                    {
                      key: "8",
                      label: "MOU Details Form",
                      children: (
                        <Suspense fallback={<p>Loading MOU...</p>}>
                          <ProjectMouUpload
                            projectId={tproj_id}
                            projectDetails={projectData}
                            fetchDetails={fetchDetails}
                          />
                        </Suspense>
                      ),
                    },
                    {
                      key: "9",
                      label: "PO Details Form",
                      children: (
                        <Suspense fallback={<p>Loading PO Details Form...</p>}>
                          <ProjectPoUpload
                            projectId={tproj_id}
                            projectDetails={projectData}
                            fetchDetails={fetchDetails}
                          />
                        </Suspense>
                      ),
                    },

                    {
                      key: "10",
                      label: "Closure Details Form",
                      children: (
                        <Suspense
                          fallback={<p>Loading Closure Details Form...</p>}
                        >
                          <ProjectClosure
                            projectId={tproj_id}
                            projectDetails={projectData}
                            fetchDetails={fetchDetails}
                          />
                        </Suspense>
                      ),
                    },
                    
                  ]}
                />
              </div>
            </div>
          </>
          {/* ) : ( */}
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "80vh" }}
          ></div>
          {/* )} */}
        </div>
      </Card>
    </div>
  );
}
