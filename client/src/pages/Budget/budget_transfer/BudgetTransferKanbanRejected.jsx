import { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  Card,
  Button,
  Spin,
  Select,
  Input,
  Tooltip,
  Popover,
  Tag,
  Avatar,
} from "antd";
import {
  EyeOutlined,
  FilterOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  UserOutlined,
  CloseCircleOutlined,
  BranchesOutlined,
  StopOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { getAuthToken } from "../../../services/Helper.js";
import { toast } from "react-toastify";

const { Option } = Select;

export default function BudgetTransferKanbanRejected({ permissions = [] }) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 3,
    total: 0,
  });
  const [filtersVisible, setFiltersVisible] = useState(false);

  // 🔹 Approver state
  const [approversData, setApproversData] = useState({});
  const [loadingApprovers, setLoadingApprovers] = useState(false);

  // 🔹 Local filters
  const [yearFilter, setYearFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  // 🔹 Ref for scrollable container
  const listRef = useRef(null);

  // 🔹 Preserve scroll position
  const scrollPosRef = useRef(0);

  const fetchBudgets = async (page = 1, append = false) => {
    try {
      setLoading(true);
      const token = getAuthToken();

      let query = `status=rejected&page=${page}&limit=${pagination.pageSize}`;
      if (yearFilter) query += `&year=${yearFilter}`;
      if (searchFilter) query += `&search=${searchFilter}`;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/budget/budgeting_list?${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      if (append && listRef.current) {
        // save scroll position
        scrollPosRef.current = listRef.current.scrollTop;
        setBudgets((prev) => [...prev, ...(data?.budgets || [])]);
      } else {
        setBudgets(data?.budgets || []);
      }

      setPagination({ current: page, pageSize: 3, total: data?.total || 0 });
    } catch (err) {
      toast.error("Failed to load rejected budgets");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Restore scroll after DOM updates
  useLayoutEffect(() => {
    if (listRef.current && scrollPosRef.current > 0) {
      listRef.current.scrollTop = scrollPosRef.current;
      scrollPosRef.current = 0; // reset after restoring
    }
  }, [budgets]);

  useEffect(() => {
    // Reset pagination when filters change
    setPagination((p) => ({ ...p, current: 1 }));
    fetchBudgets(1, false);
  }, [yearFilter, searchFilter]);

  const fetchApprovers = async (budgetId) => {
    try {
      if (approversData[budgetId]) return; // already fetched
      setLoadingApprovers(true);

      const data = { item_id: budgetId };
      getApprovalTrackApi(data)
        .then((res) => {
          setApproversData((prev) => ({
            ...prev,
            [budgetId]: res?.data || [],
          }));
          setLoadingApprovers(false);
        })
        .catch(() => setLoadingApprovers(false));
    } catch (err) {
      toast.error("Failed to fetch approval tracking");
    }
  };

  return (
    <div className="kanban-column">
      {/* header */}
      <div className="kanban-header header-col-3">
        <span >
          <CloseCircleOutlined style={{ color: "#df3737ff", marginRight: 6 }} />
          Rejected
        </span>
        <div>
        <span className="kanban-count">
          <Tag color="#df3737ff">{pagination.total}</Tag>
        </span>
        <Tooltip title="Toggle Filters">
          <Button className="filter-btn3"
            type="link"
            icon={<FilterOutlined />}
            onClick={() => setFiltersVisible(!filtersVisible)}
          />
        </Tooltip>
        </div>
      </div>

      {/* filters */}
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

      {/* budgets list */}
      <div
        className="kanban-budget-list-box"
        ref={listRef}
        style={{ maxHeight: "500px", overflowY: "auto" }}
      >
        {loading && pagination.current === 1 ? (
          <Spin />
        ) : budgets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "1rem" }}>
            <p>No rejected budgets found</p>
          </div>
        ) : (
          <>
            {budgets.map((budget) => (
              <Card key={budget.tbm_id} size="small" className="budget-card"  style={{ borderBottom: "solid 5px #e25a5aff" }}>
                {/* top row */}
                <div className="card-top-row">
                  <div className="card-info">
                    <CalendarOutlined className="card-icon calendar" />
                    <span className="card-text-bold">{budget.tfy_year_label}</span>
                  </div>
                  <div className="card-info">
                    <DollarCircleOutlined className="card-icon amount" />
                    <span className="card-text-bold">
                      ₹{budget.tbm_total_budget_amount}
                    </span>
                  </div>
                </div>

                {/* created by */}
                <div className="card-created-by">
                  <Avatar icon={<UserOutlined />} size="small" />
                  <Tag color="purple">{budget.name}</Tag>
                </div>

                {/* approvers */}
                <div className="card-approvers">
                  <Popover
                    placement="top"
                    title={<div>👥 Approver Details</div>}
                    content={
                      <div>
                        {budget?.approvers?.length > 0 ? (
                          budget.approvers.map((approver, i) => (
                            <div key={i}>
                              <p>
                                <UserOutlined /> {approver.name}
                              </p>
                              <p>📧 {approver.email || "N/A"}</p>
                            </div>
                          ))
                        ) : (
                          <p>No approvers assigned</p>
                        )}
                      </div>
                    }
                  >
                    <div>
                      {budget?.approvers?.length > 0 ? (
                        budget.approvers.map((approver, i) => (
                          <Avatar key={i} size="small">
                            {approver.name?.charAt(0).toUpperCase()}
                          </Avatar>
                        ))
                      ) : (
                        <span>No approvers</span>
                      )}
                    </div>
                  </Popover>
                </div>

                {/* rejection tracking */}
                <Popover
                  trigger="click"
                  placement="top"
                  title="❌ Rejection Tracking"
                  onOpenChange={(visible) => {
                    if (visible) fetchApprovers(budget.tbm_id);
                  }}
                  content={
                    <div>
                      {loadingApprovers ? (
                        <Spin size="small" />
                      ) : approversData[budget.tbm_id]?.length > 0 ? (
                        <ApprovalTrackList
                          approversData={approversData[budget.tbm_id]}
                        />
                      ) : (
                        <p>No rejection tracking found</p>
                      )}
                    </div>
                  }
                >
                  <Tooltip title="Rejection Tracking">
                    <BranchesOutlined />
                  </Tooltip>
                </Popover>

                {/* actions */}
                <div className="card-actions">
                  <Tooltip title="View Details">
                    <Button
                     className="kanban-btn red"
                      type=""
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

            {/* Load more */}
            {budgets.length < pagination.total && (
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <Button
                  type="dashed"
                  loading={loading}
                  onClick={() => fetchBudgets(pagination.current + 1, true)}
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

// ApprovalTrackList component
const ApprovalTrackList = ({ approversData }) => {
  const [expanded, setExpanded] = useState(false);
  const visibleData = expanded ? approversData : approversData.slice(0, 5);

  return (
    <div>
      {visibleData.map((track) => (
        <div key={track.apt_id} style={{ display: "flex", marginBottom: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#ddd", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>
            {track.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ marginLeft: 8, flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{track.name || "Unknown"}</div>
            <div style={{ fontSize: 12, color: "#666" }}>📧 {track.email || "N/A"}</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              📝 Step: <strong>{track.apt_accept_step || "N/A"}</strong> | 
              <span style={{ color: "red" }}> Status: {track.apt_accept_status || "Rejected"}</span>
            </div>
            {track.apt_remarks && <div style={{ fontSize: 12 }}>💬 {track.apt_remarks}</div>}
            <div style={{ fontSize: 11, color: "#999" }}>
              📅 {new Date(track.apt_created_at).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
      {approversData.length > 5 && (
        <div style={{ textAlign: "center" }}>
          <a onClick={() => setExpanded(!expanded)}>
            {expanded ? "Show Less ▲" : `Show More (${approversData.length - 5}) ▼`}
          </a>
        </div>
      )}
    </div>
  );
};
