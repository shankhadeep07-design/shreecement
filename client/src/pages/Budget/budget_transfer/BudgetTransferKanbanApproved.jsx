import { useState, useEffect } from "react";
import { Card, Button, Spin, Select, Input, Tooltip, Popover, Tag, Avatar } from "antd";
import { EyeOutlined, FilterOutlined, UserOutlined, CalendarOutlined, DollarCircleOutlined, BranchesOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { getAuthToken } from "../../../services/Helper.js";
import { toast } from "react-toastify";
import { getApprovalTrackApi } from "../../../Services/Notification-service.js";

const { Option } = Select;

export default function BudgetTransferKanbanApproved({ permissions = [] }) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 3, total: 0 });
  const [filtersVisible, setFiltersVisible] = useState(false);

  // 🔹 Approver state
  const [approversData, setApproversData] = useState({});
  const [loadingApprovers, setLoadingApprovers] = useState(false);

  // 🔹 Local filters
  const [yearFilter, setYearFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const fetchBudgets = async (page = 1, append = false) => {
    try {
      setLoading(true);
      const token = getAuthToken();

      let query = `status=approved&page=${page}&limit=${pagination.pageSize}`;
      if (yearFilter) query += `&year=${yearFilter}`;
      if (searchFilter) query += `&search=${searchFilter}`;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/budget/budgeting_list?${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      setBudgets((prev) =>
        append ? [...prev, ...(data?.budgets || [])] : data?.budgets || []
      );
      setPagination({ current: page, pageSize: 3, total: data?.total || 0 });
    } catch (err) {
      toast.error("Failed to load Approved budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets(1, false);
  }, [yearFilter, searchFilter]);

  // 🔹 Fetch approvers on popover open
  const fetchApprovers = async (budgetId) => {
    try {
      if (approversData[budgetId]) return; // already fetched

      setLoadingApprovers(true);

      const data = { item_id: budgetId };
      getApprovalTrackApi(data)
        .then((res) => {
          setApproversData(res?.data || []);
          setLoadingApprovers(false);
        })
        .catch(() => {});
    } catch (err) {
      toast.error("Failed to fetch approval tracking");
    } finally {
      setLoadingApprovers(false);
    }
  };

  return (
    <div className="kanban-column">
      {/* 🔹 Header */}
      <div className="kanban-header header-col-2" >
        <span>
          <CheckCircleOutlined style={{ color: "rgb(127 180 2)", marginRight: 6 }} />
          Approved
        </span>
          <div>
        <span className="kanban-count">
          <Tag color="#7fb402">{pagination.total}</Tag>
        </span>

        <Tooltip title="Toggle Filters">
          <Button className="filter-btn2"
            type="link"
            icon={<FilterOutlined />}
            onClick={() => setFiltersVisible(!filtersVisible)}
          />
        </Tooltip>
        </div>
      </div>

      {/* 🔹 Filters */}
      {filtersVisible && (
        <div className="kanban-filters">
          <Select
            placeholder="Select Year"
            style={{ width: "100%", marginBottom: 8 }}
            allowClear
            onChange={(v) => setYearFilter(v || "")}
          >
            <Option value="2023">2023</Option>
            <Option value="2024">2024</Option>
            <Option value="2025">2025</Option>
          </Select>

          <Input.Search
            placeholder="Search by creator"
            onSearch={(val) => setSearchFilter(val)}
            allowClear
          />
        </div>
      )}
    
      <div className="kanban-budget-list-box">

      
        {/* 🔹 Cards */}
        {loading && pagination.current === 1 ? (
            <Spin />
        ) : budgets.length === 0 ? (
            <div style={{ textAlign: "center", padding: "1rem" }}>
            <p>No budgets found</p>
            </div>
        ) : (
            <>
            {budgets.map((budget) => (
                <Card key={budget.tbm_id} size="small" className="budget-card"  style={{ borderBottom: "solid 4px #a7c816" }}         >
                {/* 🔹 Top Row: FY + Amount */}
                <div className="card-top-row">
                    <div className="card-info">
                      <div className="icon-box">
                           <CalendarOutlined />
                      </div>
          
                    <span className="card-text-bold">{budget.tfy_year_label}</span>
                    </div>
                    <div className="card-info">
                    <DollarCircleOutlined className="card-icon amount" />
                    <span className="card-text-bold">
                        ₹{budget.tbm_total_budget_amount}
                    </span>
                    </div>
                </div>

                {/* 🔹 Created By */}
                <div className="card-created-by">
                    <Avatar icon={<UserOutlined />} size="small" className="creator-avatar" />
                    <Tag color="purple">{budget.name}</Tag>
                </div>

                {/* 🔹 Approvers Section */}
                <div className="card-approvers">
                    <Popover
                    placement="top"
                    title={<div className="popover-title">👥 Approver Details</div>}
                    content={
                        <div className="approvers-list">
                        {budget?.approvers?.length > 0 ? (
                            budget.approvers.map((approver, i) => (
                            <div key={i} className="approver-item">
                                <p className="approver-name">
                                <UserOutlined className="approver-icon" />
                                {approver.name}
                                </p>
                                <p className="approver-email">
                                📧 {approver.email || "N/A"}
                                </p>
                            </div>
                            ))
                        ) : (
                            <p className="empty-text">No approvers assigned</p>
                        )}
                        </div>
                    }
                    >
                    <div className="approvers-avatars">
                        {budget?.approvers?.length > 0 ? (
                        budget.approvers.map((approver, i) => (
                            <Avatar key={i} size="small" className="approver-avatar">
                            {approver.name?.charAt(0).toUpperCase()}
                            </Avatar>
                        ))
                        ) : (
                        <span className="empty-text">No approvers</span>
                        )}
                    </div>
                    </Popover>
                </div>

                {/* 🔹 Approval Tracking */}
                <Popover
                    trigger="click"
                    placement="top"
                    title={<div className="popover-title">👥 Approval Tracking</div>}
                    onOpenChange={(visible) => {
                    if (visible) fetchApprovers(budget.tbm_id);
                    }}
                    content={
                    <div className="approval-tracking">
                        {loadingApprovers ? (
                        <Spin size="small" />
                        ) : approversData?.length > 0 ? (
                        <ApprovalTrackList approversData={approversData} />
                        ) : (
                        <p className="empty-text">No approval tracking found</p>
                        )}
                    </div>
                    }
                >
                    <Tooltip title="Approval Tracking">
                    <BranchesOutlined className="tracking-icon" />
                    </Tooltip>
                </Popover>

                {/* 🔹 Actions */}
                <div className="card-actions">
                    <Tooltip title="View Details">
                    <Button
                    className="kanban-btn green"
                        type="default"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() =>
                        window.open(
                            `${import.meta.env.VITE_HOME_PAGE}/admin/budgeting/budgeting_details/${budget.tbm_id}`,
                            "_blank"
                        )
                        }
                    >
                        View
                    </Button>
                    </Tooltip>
                </div>
                </Card>
            ))}

            {/* 🔹 Load More Button */}
            {budgets.length < pagination.total && (
                <div style={{ textAlign: "center", margin: "1rem 0" }}>
                <Button
                    onClick={() => fetchBudgets(pagination.current + 1, true)}
                    loading={loading}
                >
                    {loading ? "Loading..." : "Load More"}
                </Button>
                </div>
            )}
            </>
        )}


        </div>
    </div>
  );
}

// ✅ Extracted sub-component
const ApprovalTrackList = ({ approversData }) => {
  const [expanded, setExpanded] = useState(false);
  const visibleData = expanded ? approversData : approversData.slice(0, 5);

  return (
    <div className="approval-track-list">
      {visibleData.map((track) => (
        <div key={track.apt_id} className="approval-track-item">
          <div className="approver-circle">
            {track.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              {track.name || "Unknown User"}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              📧 {track.email || "N/A"}
            </div>
            <div
              style={{
                marginTop: 6,
                display: "flex",
                flexWrap: "wrap",
                gap: "8px 12px",
                fontSize: 12,
              }}
            >
              <span>
                📝 Step: <strong>{track.apt_accept_step || "N/A"}</strong>
              </span>
              <span>
                ✅ Status:{" "}
                <strong>{track.apt_accept_status || "Pending"}</strong>
              </span>
            </div>
            {track.apt_remarks && (
              <div style={{ marginTop: 4, fontSize: 12, color: "#595959" }}>
                💬 {track.apt_remarks}
              </div>
            )}
            <div style={{ marginTop: 4, fontSize: 11, color: "#999" }}>
              📅 {new Date(track.apt_created_at).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
      {approversData.length > 5 && (
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <a onClick={() => setExpanded(!expanded)}>
            {expanded ? "Show Less ▲" : `Show More (${approversData.length - 5}) ▼`}
          </a>
        </div>
      )}
    </div>
  );
};
