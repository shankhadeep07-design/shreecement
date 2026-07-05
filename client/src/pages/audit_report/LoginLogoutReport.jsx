import React, { useEffect, useState } from "react";
import { Table, Button, Spin, DatePicker } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getLoginLogoutReport,
  exportLoginLogoutReport,
} from "../../services/Audit-report-service"; // 👈 import services

const { RangePicker } = DatePicker;

const LoginLogoutReport = () => {
  const [data, setData] = useState([]); // ✅ empty - loads from API
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
  });

  const [dates, setDates] = useState(null);

  // ✅ Fetch Data via Service
  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const resp = await getLoginLogoutReport({
        // 👈 service call
        start_date: filters.start_date,
        end_date: filters.end_date,
        page,
        limit: pageSize,
      });

      const resData = resp.data;
      setData(resData.data || []);
      setPagination({
        current: resData.page || 1,
        pageSize,
        total: resData.total || 0,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Auto load on mount
  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Handle Date Change
  const handleDateChange = (val) => {
    setDates(val);
    if (val && val.length === 2) {
      setFilters({
        ...filters,
        start_date: val[0].format("YYYY-MM-DD"),
        end_date: val[1].format("YYYY-MM-DD"),
      });
    } else {
      setFilters({
        ...filters,
        start_date: "",
        end_date: "",
      });
    }
  };

  // ✅ Search Click
  const handleSearch = () => {
    fetchData(1, pagination.pageSize);
  };

  // ✅ Pagination Change
  const handleTableChange = (pagination) => {
    fetchData(pagination.current, pagination.pageSize);
  };

  // ✅ Export via Service — filters automatically included
  const handleExport = async () => {
    setLoading(true);
    try {
      const resp = await exportLoginLogoutReport({
        // 👈 service call
        start_date: filters.start_date, // ✅ filtered export
        end_date: filters.end_date,
      });

      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "LoginLogoutReport.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to export");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Sl.No.",
      key: "slno",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    { title: "User Name", dataIndex: "user_name" },
    { title: "Log Type", dataIndex: "log_type" },
    { title: "IP", dataIndex: "ip" },

    {
      title: "Time",
      dataIndex: "time",
      render: (val) => {
        if (!val) return "-";
        const date = new Date(val);
        const formattedDate = date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        const formattedTime = date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
        return `${formattedDate}  ${formattedTime}`;
      },
    },

    {
      title: "Status",
      dataIndex: "status",
      render: (val) => {
        const isSuccess = val === "Success";
        return (
          <span style={{ color: isSuccess ? "green" : "red", fontWeight: 600 }}>
            {isSuccess ? "Success" : "Failure"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="home-content">
      <div className="card common-card">
        <div className="card-header d-flex justify-content-between">
          <h5>Login Logout Report</h5>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            Export
          </Button>
        </div>

        <div className="p-3">
          {/* 🔍 Filters */}
          <div className="d-flex gap-3 mb-3 flex-wrap">
            <RangePicker
              value={dates}
              onChange={handleDateChange}
              style={{ width: 280 }}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>

          {/* 📊 Table */}
          {loading ? (
            <div className="text-center p-5">
              <Spin size="large" />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={data}
              rowKey="list_id"
              pagination={pagination}
              onChange={handleTableChange}
              scroll={{ x: "max-content" }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginLogoutReport;
