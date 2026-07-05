import {
  Descriptions,
  Divider,
  Typography,
  Card,
  Tag,
  Table,
  Space,
  Form,
  Select,
  Input,
  Button,
  Alert,
} from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  AimOutlined,
  NumberOutlined,
  TeamOutlined,
  DollarCircleOutlined,
  CommentOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import {
  budgetingDetailsApi,
  sendBudgetingForApprovalApi,
  getPendingUserApi,
} from "../../../services/Budget-service";
import {
  approveNotificationApi,
  getApprovalTrackApi,
  getNotificationDetailsApi,
} from "../../../services/Notification-service";

import { userDetails } from "../../../auth/auth";
import BudgetApproval from "./BudgetApproval";

const Label = ({ icon, text }) => (
  <>
    {icon} <span className="label-text">{text}</span>
  </>
);

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

export default function BudgetingDetails() {
  const { budgeting_id } = useParams();
  const [budgetData, setBudgetData] = useState(null);
  const [notification, setNotification] = useState([]);
  const [approvalTrack, setApprovalTrack] = useState([]);
  const [approvalForm, setApprovalForm] = useState([]);
  const [notificationCheck, setNotificationCheck] = useState([]);
  const user = userDetails();
  const [loading, setLoading] = useState(false);
  const [domainOptions, setdomainOptions] = useState([
    { label: "Coro Arogya (Healthcare)", value: "coro_arogya" },
    { label: "Coro Vidya (Education)", value: "coro_vidya" },
    {
      label: "Coro Vikas (Rural Development & Livelihood)",
      value: "coro_vikas",
    },
    { label: "Environmental Sustainability", value: "environment" },
    { label: "Others", value: "others" },
  ]);
  const plantOptions = [
    { label: "CFHO", value: "cfho" },
    { label: "Plant", value: "plant" },
    { label: "Marketing", value: "marketing" },
    { label: "Retail", value: "retail" },
  ];

  const buOptions = [
    { label: "Corporate", value: "corporate" },
    { label: "Fert", value: "fert" },
    { label: "CPC", value: "cpc" },
    { label: "SSP", value: "ssp" },
    { label: "Bio", value: "bio" },
    { label: "Retail", value: "retails" },
    { label: "Marketing", value: "marketing" },
  ];

  // Example states (replace with your actual logic)
  const [approvalData, setApprovalData] = useState({
    approval_type: "budgeting",
    approval_status: "",
    approval_remarks: "",
    approval_item_id: budgeting_id,
  });
  // replace with auth user
  const id = budgeting_id;

  const [pendingDetails, setPendingDetails] = useState("");
  const not_type = "budgeting";
  const [totalApprovedAmount, setTotalApprovedAmount] = useState(0);

  const handleFetchPendingUser = async () => {
    if (not_type && id) {
      const body = {
        type: "budgeting",
        moduleName: "",
        tableName: "t_budget_master",
        IdcolumnName: "tbm_id",
        IdcolumnValue: id,
        IndexcolumnName: "tbm_approver_index",
        StatuscolumnName: "tbm_status",
        usercolumnName: "tbm_user_id",
        rolecolumnName: "tbm_user_role_id",
        approvalIdColumnName: "tbm_approval_id",
      };

      if (not_type === "budgeting") {
        body.moduleName = "budgeting";
        getPendingUserApi(body)
          .then((data) => {
            setPendingDetails(data?.data || "");
          })
          .catch((error) => {
            toast.error(
              error?.response?.data?.originalError ||
                error?.response?.data?.message,
            );
          });
      }
    }
  };

  useEffect(() => {
    if (budgeting_id) {
      fetchBudgetDetails();
      notificationFun();
      approvalTrackFun();
    }
  }, [budgeting_id]);

  useEffect(() => {
    handleFetchPendingUser();
  }, [not_type, id]);

  const fetchBudgetDetails = () => {
    budgetingDetailsApi({ budgeting_id })
      .then(({ data }) => {
        if (!data) return;
        setBudgetData(data);
        setTotalApprovedAmount(data?.totalApprovedAmount);
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

  const sendForApproval = () => {
    if (!approvalForm.remarks?.trim()) {
      toast.error("Please enter remarks");
      return;
    }

    setLoading(true);

    const dataSend = {
      item_id: id,
      user_id: user?.id || 0,
      remarks: approvalForm.remarks,
      budget_amount: budgetData.tbm_total_budget_amount,
    };

    sendBudgetingForApprovalApi(dataSend)
      .then((response) => {
        if (response.status == 1) {
          toast.success(response.message);
          setApprovalForm({});
          approvalTrackFun();
          notificationFun();
          fetchBudgetDetails(); // ✅ use this, not BudgetingDetails()
        } else {
          toast.error(response.message);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
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

  const handleFields = (e) => {
    const { name, value } = e.target;
    setApprovalForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleBudgetingsSubmit = async () => {
    setLoading(true);
    try {
      const response = await sendBudgetingForApprovalApi(budgetData);
      if (response.status) {
        toast.success(response.message);
        // initiatedDatatable(); // if you have a refresh table function
        fetchBudgetDetails();
        notificationFun();
        approvalTrackFun();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
    setLoading(false);
  };
  const capitalizeFirst = (value) => {
    if (!value) return "-";
    const str = String(value);
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  const columns = [
    {
      title: (
        <Space>
          <NumberOutlined /> Schedule VII
        </Space>
      ),
      dataIndex: "tschm_schedule_name",
      key: "tschm_schedule_name",
    },
    {
      title: (
        <Space>
          <AimOutlined /> Focus Area
        </Space>
      ),
      dataIndex: "tfam_focus_area_name",
      key: "tfam_focus_area_name",
    },
    {
      title: (
        <Space>
          <AppstoreOutlined /> Activity
        </Space>
      ),
      dataIndex: "tactm_activity_name",
      key: "tactm_activity_name",
    },
    {
      title: (
        <Space>
          <AimOutlined /> Sub Activity
        </Space>
      ),
      dataIndex: "tsactm_sub_activity_name",
      key: "tsactm_sub_activity_name",
    },

    {
      title: (
        <Space>
          <AimOutlined /> Sdg
        </Space>
      ),
      dataIndex: "tsdg_name",
      key: "tsdg_name",
    },

    {
      title: (
        <Space>
          <TeamOutlined /> Target Beneficiary
        </Space>
      ),
      dataIndex: "tbad_target_beneficiary",
      key: "tbad_target_beneficiary",
    },
    {
      title: (
        <Space>
          <DollarCircleOutlined /> Amount
        </Space>
      ),
      dataIndex: "tbad_amount",
      key: "tbad_amount",
      render: (amt) => amt?.toLocaleString() || "0",
    },
    {
      title: (
        <Space>
          <CommentOutlined /> Remarks
        </Space>
      ),
      dataIndex: "tbad_remarks",
      key: "tbad_remarks",
    },
    {
      title: (
        <Space>
          <CheckCircleOutlined /> Status
        </Space>
      ),
      dataIndex: "tbad_status",
      key: "tbad_status",
      render: renderStatus,
    },
  ];

  const ammendmentcolumns = [
    {
      title: (
        <Space>
          <NumberOutlined />
          Domain
        </Space>
      ),
      dataIndex: "tbam_domain_id",
      key: "tbam_domain_id",
      render: (text) => capitalizeFirst(text),
    },
    {
      title: (
        <Space>
          <AimOutlined /> Corporate/Plant/ Division/Zone
        </Space>
      ),
      dataIndex: "tbam_plant_id",
      key: "tbam_plant_id",
      render: (text) => capitalizeFirst(text),
    },
    {
      title: (
        <Space>
          <AppstoreOutlined /> Business
        </Space>
      ),
      dataIndex: "tbam_bu_id",
      key: "tbam_bu_id",
      render: (text) => capitalizeFirst(text),
    },
    {
      title: (
        <Space>
          <AimOutlined /> SBU
        </Space>
      ),
      dataIndex: "tbam_sbu_id",
      key: "tbam_sbu_id",
      render: (text) => capitalizeFirst(text),
    },

    {
      title: (
        <Space>
          <AimOutlined /> State
        </Space>
      ),
      dataIndex: "tsl_state_name",
      key: "tsl_state_name",
    },

    {
      title: (
        <Space>
          <AimOutlined /> District
        </Space>
      ),
      dataIndex: "tdl_district_name",
      key: "tdl_district_name",
    },

    {
      title: (
        <Space>
          <AimOutlined /> Block
        </Space>
      ),
      dataIndex: "tbl_block_name",
      key: "tbl_block_name",
    },

    {
      title: (
        <Space>
          <AimOutlined /> Nature of project
        </Space>
      ),
      dataIndex: "tbam_nature_of_project",
      key: "tbam_nature_of_project",
    },

    {
      title: (
        <Space>
          <AimOutlined /> Schedule VII line item
        </Space>
      ),
      dataIndex: "tschm_schedule_name",
      key: "tschm_schedule_name",
    },

    {
      title: (
        <Space>
          <AimOutlined /> Schedule VII line item
        </Space>
      ),
      dataIndex: "tschm_schedule_name",
      key: "tschm_schedule_name",
    },

    {
      title: (
        <Space>
          <AimOutlined /> Schedule vii sub line item
        </Space>
      ),
      dataIndex: "tfam_focus_area_name",
      key: "tfam_focus_area_name",
    },

    {
      title: (
        <Space>
          <AimOutlined />
          Sustainable development goal
        </Space>
      ),
      dataIndex: "tsdg_name",
      key: "tsdg_name",
    },

    {
      title: (
        <Space>
          <AimOutlined /> National indicator framework
        </Space>
      ),
      dataIndex: "tnif_indicator",
      key: "tnif_indicator",
    },

    {
      title: (
        <Space>
          <AimOutlined /> Thematic Area
        </Space>
      ),
      dataIndex: "tthm_theme_name",
      key: "tthm_theme_name",
    },
  ];

  if (!budgetData) {
    return <p style={{ padding: 20 }}>Loading budget details...</p>;
  }

  return (
    <div className="home-content">
      {/* <div className="card budgeting_details" >
              <div className="card-header">
                <h5> Budgeting Details</h5>
                <p className="mb-0">
                   Overview of budget and allocations for the selected fiscal year
                </p>
              </div>
              <div className="card-body">
                 <Descriptions
                column={2}
                size="middle"
                labelStyle={{ fontWeight: 500 }}
                contentStyle={{
                  background: "#fafafa",
                  padding: "8px 12px",
                  borderRadius: 6,
                }}
              >
                <Descriptions.Item label="Financial Year">
                  {budgetData.tfy_year_label}
                </Descriptions.Item>
                <Descriptions.Item label="Domain">
                  {domainOptions.find((opt) => opt.value === budgetData.tbm_domain_id)
                    ?.label || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Corporate/Plant/ Division/ Zone">
                  {plantOptions.find((opt) => opt.value === budgetData.tbm_plant_id)
                    ?.label || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="BU">
                  {buOptions.find((opt) => opt.value === budgetData.tbm_bu_id)
                    ?.label || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="State">
                  {budgetData.tsl_state_name}
                </Descriptions.Item>
                <Descriptions.Item label="District">
                  {budgetData.tdl_district_name}
                </Descriptions.Item>
                <Descriptions.Item label="Block">
                  {budgetData.tbl_block_name}
                </Descriptions.Item>
                <Descriptions.Item label="GL Code">
                  {budgetData.tbm_gl_code}
                </Descriptions.Item>
                <Descriptions.Item label="Profit Center">
                  {budgetData.tbm_profit_center}
                </Descriptions.Item>
                <Descriptions.Item label="Nature of project">
                  {budgetData.tbm_nature_of_project}
                </Descriptions.Item>
                <Descriptions.Item label="Project concise">
                  {budgetData.tbm_project_concise}
                </Descriptions.Item>
                <Descriptions.Item label="Project duration">
                  {budgetData.tbm_project_duration}
                </Descriptions.Item>
                <Descriptions.Item label="National indicator framework">
                  {budgetData.tbm_national_indicator_framework}
                </Descriptions.Item>
                <Descriptions.Item label="Total Budget Amount">
                  ₹ {budgetData.tbm_total_budget_amount?.toLocaleString() || 0}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {renderStatus(budgetData.tbm_status)}
                </Descriptions.Item>
                <Descriptions.Item label="Created By">
                  {budgetData.name || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {new Date(budgetData.tbm_created_at).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
              <div className="card">
                <div className="card-header bg-header">
                  <h6>Budget Allocations</h6>
                </div>
                <div className="card-body">

                </div>
              </div>
              </div>
            </div> */}

      <Card
        style={{ borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
      >
        <div className="card-header">
          <Typography.Title
            level={3}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            Budgeting Details
          </Typography.Title>
          <Typography.Text type="secondary">
            Overview of budget and allocations for the selected fiscal year
          </Typography.Text>
        </div>

        {pendingDetails && (
          <div>
            {(() => {
              const details = pendingDetails?.details || [];

              const variant =
                details?.status === "reject"
                  ? "danger"
                  : details?.status === "approved"
                    ? "success"
                    : "warning";

              const icon =
                details?.status === "reject"
                  ? "x"
                  : details?.status === "approved"
                    ? "check"
                    : "info";

              return (
                <div
                  style={{
                    padding: "7px",
                    margin: "5px 0",
                    borderRadius: "4px",
                    border: "1px solid",
                    fontSize: "14px",
                    backgroundColor:
                      variant === "danger"
                        ? "#f8d7da"
                        : variant === "success"
                          ? "#d1e7dd"
                          : "#fff3cd",
                    borderColor:
                      variant === "danger"
                        ? "#f5c2c7"
                        : variant === "success"
                          ? "#badbcc"
                          : "#ffecb5",
                    color:
                      variant === "danger"
                        ? "#842029"
                        : variant === "success"
                          ? "#0f5132"
                          : "#664d03",
                  }}
                >
                  {variant === "danger" ? (
                    "Rejected"
                  ) : variant === "success" ? (
                    "Approved"
                  ) : (
                    <>
                      <i
                        className={`bi bi-${icon}-circle`}
                        style={{ marginRight: "5px" }}
                      ></i>
                      Pending with{" "}
                      <b>{details?.role_name?.toUpperCase() || ""}</b> (
                      {details?.name?.toUpperCase() || ""})
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        <Descriptions
          column={2}
          size="middle"
          labelStyle={{ fontWeight: 500 }}
          contentStyle={{
            background: "#fafafa",
            padding: "8px 12px",
            borderRadius: 6,
          }}
        >
          <Descriptions.Item label="Financial Year">
            {budgetData.tfy_year_label}
          </Descriptions.Item>
          <Descriptions.Item label="Domain">
            {domainOptions.find((opt) => opt.value === budgetData.tbm_domain_id)
              ?.label || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Corporate/Plant/ Division/ Zone">
            {plantOptions.find((opt) => opt.value === budgetData.tbm_plant_id)
              ?.label || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="BU">
            {buOptions.find((opt) => opt.value === budgetData.tbm_bu_id)
              ?.label || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="State">
            {budgetData.tsl_state_name}
          </Descriptions.Item>
          <Descriptions.Item label="District">
            {budgetData.tdl_district_name}
          </Descriptions.Item>
          <Descriptions.Item label="Block">
            {budgetData.tbl_block_name}
          </Descriptions.Item>
          <Descriptions.Item label="GL Code">
            {budgetData.tbm_gl_code}
          </Descriptions.Item>
          <Descriptions.Item label="Profit Center">
            {budgetData.tbm_profit_center}
          </Descriptions.Item>
          <Descriptions.Item label="Nature of project">
            {budgetData.tbm_nature_of_project}
          </Descriptions.Item>
          <Descriptions.Item label="Project concise">
            {budgetData.tbm_project_concise}
          </Descriptions.Item>
          <Descriptions.Item label="Project duration">
            {budgetData.tbm_project_duration}
          </Descriptions.Item>
          <Descriptions.Item label="National indicator framework">
            {budgetData.tbm_national_indicator_framework}
          </Descriptions.Item>
          <Descriptions.Item label="Total Budget Amount">
            ₹ {budgetData.tbm_total_budget_amount?.toLocaleString() || 0}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {renderStatus(budgetData.tbm_status)}
          </Descriptions.Item>
          <Descriptions.Item label="Created By">
            {budgetData.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(budgetData.tbm_created_at).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
        <Divider
          orientation="left"
          style={{ fontWeight: "bold", color: "#444" }}
        >
          <FileTextOutlined /> Budget Allocations
        </Divider>
        <Table
          dataSource={budgetData.tbm_budget_list || []}
          columns={columns}
          rowKey="tbad_id"
          pagination={false}
          bordered
          style={{ marginTop: 16 }}
          size="small"
          scroll={{ x: "max-content" }}
        />
        <Divider
          orientation="left"
          style={{ fontWeight: "bold", color: "#444" }}
        >
          <FileTextOutlined /> Budget Ammendments
        </Divider>
        <Table
          dataSource={budgetData.tbm_budget_ammendment_list || []}
          columns={ammendmentcolumns}
          rowKey="tbam_id"
          pagination={false}
          bordered
          style={{ marginTop: 16 }}
          size="small"
          scroll={{ x: "max-content" }}
        />

        {/* ✅ Budgeting Approval */}
        {id && (
          <BudgetApproval
            budget_id={id}
            not_type={not_type}
            budgetDetails={budgetData}
            user={user}
            handleFetchPendingUser={handleFetchPendingUser}
            pendingDetails={pendingDetails}
            totalApprovedAmount={totalApprovedAmount}
          />
        )}
      </Card>
    </div>
  );
}
