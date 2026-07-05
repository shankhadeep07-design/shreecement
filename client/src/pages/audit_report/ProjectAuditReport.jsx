import React, { useEffect, useState } from "react";
import { Table, Button, Spin, DatePicker, Modal } from "antd";
import {
  DownloadOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getProjectActivityReport,
  exportProjectActivityReport,
} from "../../services/Audit-report-service";

const { RangePicker } = DatePicker;

const ProjectAuditReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null); // 👈 for modal
  const [modalOpen, setModalOpen] = useState(false); // 👈 for modal

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

  // ✅ Fetch Data
  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const resp = await getProjectActivityReport({
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

  useEffect(() => {
    fetchData();
  }, []);

  const handleDateChange = (val) => {
    setDates(val);
    if (val && val.length === 2) {
      setFilters({
        ...filters,
        start_date: val[0].format("YYYY-MM-DD"),
        end_date: val[1].format("YYYY-MM-DD"),
      });
    } else {
      setFilters({ ...filters, start_date: "", end_date: "" });
    }
  };

  const handleSearch = () => fetchData(1, pagination.pageSize);

  const handleTableChange = (pagination) => {
    fetchData(pagination.current, pagination.pageSize);
  };

  // ✅ Open detail modal
  const openAuditModal = (record) => {
    setSelectedLog(record);
    setModalOpen(true);
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const resp = await exportProjectActivityReport({
        start_date: filters.start_date,
        end_date: filters.end_date,
      });

      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ProjectActivityAuditReport.xlsx");
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

  // ✅ Updated columns matching backend fields
  const columns = [
    {
      title: "Sl.No.",
      key: "slno",
      width: 60,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Table",
      dataIndex: "table_name",
    },
    {
      title: "Action",
      dataIndex: "action_text",
      width: 120,
      render: (val) => {
        const colorMap = {
          Insert: "green",
          Update: "blue",
          Delete: "red",
          Truncate: "orange",
        };
        return (
          <span style={{ color: colorMap[val] || "black", fontWeight: 600 }}>
            {val || "-"}
          </span>
        );
      },
    },
    {
      title: "User",
      dataIndex: "username",
      render: (val) => val || "-",
    },
    {
      title: "Client IP",
      dataIndex: "client_addr",
      render: (val) => val || "-",
    },
    {
      title: "Time",
      dataIndex: "action_tstamp_clk",
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
      title: "Details",
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => openAuditModal(record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="home-content">
      <div className="card common-card">
        <div className="card-header d-flex justify-content-between">
          <h5>Project Activity Audit Report</h5>
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
              rowKey="event_id"
              pagination={pagination}
              onChange={handleTableChange}
              scroll={{ x: "max-content" }}
            />
          )}
        </div>
      </div>
      <Modal
        title="Audit Log Details"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={750}
      >
        <div
          style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: "8px" }}
        >
          {selectedLog &&
            (() => {
              const parseHstore = (hstoreText) => {
                if (!hstoreText) return {};
                const result = {};
                const regex = /"([^"]+)"=>"([^"]*)"/g;
                let match;
                while ((match = regex.exec(hstoreText)) !== null) {
                  result[match[1]] = match[2];
                }
                return result;
              };

              const oldData = parseHstore(selectedLog.row_data);
              const newData = parseHstore(selectedLog.changed_fields);
              const keys = [
                ...new Set([...Object.keys(oldData), ...Object.keys(newData)]),
              ];

              return (
                <div>
                  <p>
                    <strong>Changed On:</strong>{" "}
                    {new Date(selectedLog.action_tstamp_clk).toLocaleString()}
                  </p>

                  <table
                    className="table table-bordered mt-3"
                    style={{ fontSize: "13px" }}
                  >
                    <thead className="table-dark">
                      <tr>
                        <th>Field</th>
                        <th>Previous Value</th>
                        <th>Changed Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keys.map((key) => {
                        const oldVal = oldData[key] ?? "-";
                        const newVal = newData.hasOwnProperty(key)
                          ? newData[key]
                          : oldVal;
                        const isChanged = newData.hasOwnProperty(key);

                        return (
                          <tr
                            key={key}
                            style={{
                              background: isChanged ? "#ae1818" : "transparent",
                            }}
                          >
                            <td>
                              <strong>{key}</strong>
                            </td>
                            <td>{oldVal}</td>
                            <td>{newVal}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
        </div>
      </Modal>
    </div>
  );
};

export default ProjectAuditReport;
