import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Spin,
  Select,
  Input,
  Tooltip,
  Modal,
  message,
  Tag,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { getAuthToken } from "../../../services/Helper.js";
import { toast } from "react-toastify";
import BudgetTransferAddUpdateModal from "./BudgetTransferAddUpdateModal.jsx";
import { sendBudgetingForApprovalApi } from "../../../services/Budget-service.js";
import { userDetails } from "../../../auth/auth.js";

const { Option } = Select;

const BudgetTransferKanbanDraft = ({ permissions = [], refreshSendForApproval }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 3,
    total: 0,
  });
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  let userDetail = userDetails();

  const addFun = () => {
    setEditData(null);
    changeModalStatus(true);
  };

  const editFun = (data) => {
    setEditData(data);
    changeModalStatus(true);
  };

  const changeModalStatus = (value) => {
    setShowModal(value);
  };

  // 🔹 Local filters
  const [yearFilter, setYearFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const fetchBudgets = async (page = 1, append = false) => {
    try {
      setLoading(true);
      const token = getAuthToken();

      let query = `status=draft&page=${page}&limit=${pagination.pageSize}`;
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
      toast.error("Failed to load Draft budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets(1, false);
  }, [yearFilter, searchFilter]);

  const sendForApprovalConfirm = (data) => {
    Modal.confirm({
      title: "Are you sure you want to send for approval?",
      content: `You are about to send for approval.`,
      okText: "Yes",
      cancelText: "No",
      onOk() {
        sendForApproval(data);
      },
      onCancel() {
        message.error("Send for approval cancelled");
      },
    });
  };

  const sendForApproval = (data) => {
    sendBudgetingForApprovalApi(data)
      .then((response) => {
        if (response.status) {
          toast.success(response.message);
          fetchBudgets(1, false);
          refreshSendForApproval();
        }
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message);
      });
  };

  return (
    <div className="kanban-column">
      {/* 🔹 Header with filter icon */}
      <div className="kanban-header header-col-1">
        <span style={{ color: "#1b1b1bff", marginRight: 12 }}>
    <FileTextOutlined style={{ color: "rgb(212, 147, 0)", marginRight: 6 }} />
    Draft
  </span>
  <div>
        <span className="kanban-count">
          <Tag color="#d49300">  {pagination.total} </Tag>
        </span>

        <Tooltip title="Toggle Filters">
          <Button className="filter-btn"
            type="link"
            icon={<FilterOutlined />}
            onClick={() => setFiltersVisible(!filtersVisible)}
          />
        </Tooltip>

        <Tooltip title="Add Budget">
          <Button className="add-btn"
            type="primary"
           
            icon={<PlusOutlined />}
            size="small"
            onClick={addFun}
          />
        </Tooltip></div>
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
      {/* 🔹 Budget List */}
      {loading && pagination.current === 1 ? (
        <Spin />
      ) : budgets.length === 0 ? (
        <div style={{ textAlign: "center", padding: "1rem" }}>
          <p>No budgets found</p>
        </div>
      ) : (
        <>
          {budgets.map((budget) => (
            <div key={budget.tbm_id} >
              <Card size="small" className="budget-card"  style={{ borderBottom: "solid 4px #e9bc55ff" }} >
                {/* Hover Edit Icon */}
                <div className="edit-icon">
                  <Tooltip title="Edit">
                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => editFun(budget)}
                    />
                  </Tooltip>
                </div>

                <div className="card-top-row">
                  <div className="card-info">
                    <CalendarOutlined className="card-icon calendar" />
                    <span className="card-text-bold">
                      {budget.tfy_year_label}
                    </span>
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
                  <Avatar
                    icon={<UserOutlined />}
                    size="small"
                    className="creator-avatar"
                  />
                  <Tag color="purple">{budget.name}</Tag>
                </div>

                {/* 🔹 Actions */}
                <div className="card-actions">
                  <Tooltip title="View Details">
                    <Button
                     className="kanban-btn yellow"
                      type=""
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() =>
                        window.open(
                          `${
                            import.meta.env.VITE_HOME_PAGE
                          }/admin/budgeting/budgeting_details/${budget.tbm_id}`,
                          "_blank"
                        )
                      }
                    >
                      View
                    </Button>
                  </Tooltip>

                  {budget.tbm_created_by == userDetail?.id && (
                    <Tooltip title="Send for Approval">
                      <Button
                        type="link"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={() => sendForApprovalConfirm(budget)}
                      />
                    </Tooltip>
                  )}
                </div>
              </Card>
            </div>
          ))}

          {/* 🔹 Load More Button */}
          {budgets.length < pagination.total && (
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <Button
                type="dashed"
                loading={loading}
                onClick={() => fetchBudgets(pagination.current + 1, true)}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <BudgetTransferAddUpdateModal
          showModal={showModal}
          editData={editData}
          fetchBudgets={fetchBudgets} 
          changeModalStatus={changeModalStatus}
        />
      )}
      </div>
    </div>
  );
};

export default BudgetTransferKanbanDraft;
