import $ from "jquery";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { Modal } from "antd";
import { FaFileExport } from "react-icons/fa";
import { toast } from "react-toastify";

import { useLoading } from "../../context/LoadingContext.jsx";
import {
  formatToIST,
  getMyModulePermissionFun,
  getTableShimmer,
} from "../../helper/common.js";

import {
  getAuthToken,
  privateAxios,
} from "../../services/Helper.js";

import {
  copyEventApi,
  joinNewVolunteerInEventApi,
  publishEventApi,
} from "../../services/Event-service.js";

import AddEditEventList from "./AddEditEventList.jsx";

export const EventList = () => {

  const { setLoading } = useLoading();   // ✅ FIXED

  const [permissions, setPermissions] = useState([]);
  const [editEvent, setEditEvent] = useState(null);
  const [isOpenUpsertModal, setIsOpenUpsertModal] = useState(false);

  /* ================= PERMISSIONS ================= */
  useEffect(() => {
    getMyModulePermissionFun("events")
      .then((module) => setPermissions(module || []))
      .catch(() => toast.error("Failed to load permissions"));
  }, []);

  /* ================= ACTION HANDLERS ================= */

  const addFun = () => {
    setEditEvent(null);
    setIsOpenUpsertModal(true);
  };

  const editFun = (data) => {
    setEditEvent(data);
    setIsOpenUpsertModal(true);
  };

  const viewEvent = (data) => {
    window.open(
      `${import.meta.env.VITE_HOME_PAGE}/admin/event-cil/${data.tevent_id}`,
      "_blank"
    );
  };

  const publishEventAction = (data) => {
    Modal.confirm({
      title: "Publish this event?",
      onOk: () => publishEventFun(data),
    });
  };

  const publishEventFun = async (data) => {
    try {
      await publishEventApi({
        tevent_id: data.tevent_id,
        tevent_status: "published",
      });

      toast.success("Event published");
      initiatedEventDatatable();
    } catch {
      toast.error("Publish failed");
    }
  };

  const copyEventFunApi = async (data) => {
    try {
      await copyEventApi({ tevent_id: data.tevent_id });
      toast.success("Event copied");
      initiatedEventDatatable();
    } catch {
      toast.error("Copy failed");
    }
  };

  const joinNewVolunteerEventFun = async (data) => {
    try {
      await joinNewVolunteerInEventApi({
        tevent_id: data.tevent_id,
        tevent_status: "join_new_volunteer",
      });

      toast.success("Volunteer added");
      initiatedEventDatatable();
    } catch {
      toast.error("Action failed");
    }
  };

  const downloadExcel = async () => {
    try {
      const res = await privateAxios.get(
        "admin/events/event-list/excel-export",
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Event List.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Excel download failed");
    }
  };

  /* ================= DATATABLE ================= */

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-IN");
  };

  const initiatedEventDatatable = () => {

    const authToken = getAuthToken();
    const my_url = `${import.meta.env.VITE_API_URL}/admin/events/event-list/datatable`;

    if ($.fn.DataTable.isDataTable("#event-datatable")) {
      $("#event-datatable").DataTable().destroy();
      $("#event-datatable").empty();   // ✅ FIXED (important)
    }

    $("#event-datatable").DataTable({
      order: [[1, "asc"]],
      serverSide: true,
      processing: true,
      ajax: {
        url: my_url,
        type: "POST",
        beforeSend: function (request) {
          request.setRequestHeader("Authorization", `Bearer ${authToken}`);
        },
      },
      language: {
        loadingRecords: () => getTableShimmer(5, 8),
      },
      columns: [
        {
          render: (data, type, row, meta) =>
            meta.row + meta.settings._iDisplayStart + 1,
          orderable: false,
        },
        { data: "tevent_activity_title" },
        { data: "tsl_state_name" },
        { data: "tevent_location" },
        {
          data: null,
          render: (data) => {
            if (!data.tevent_start_date) return "-";
            return `
              <div>
                <i class="fa fa-calendar text-primary me-1"></i>
                ${formatDate(data.tevent_start_date)}
                <br/>
                <i class="fa fa-clock text-success me-1"></i>
                ${data.tevent_start_time || "-"}
              </div>
            `;
          },
        },
        {
          data: null,
          render: (data) => {
            if (!data.tevent_end_date) return "-";
            return `
              <div>
                <i class="fa fa-calendar text-danger me-1"></i>
                ${formatDate(data.tevent_end_date)}
                <br/>
                <i class="fa fa-clock text-warning me-1"></i>
                ${data.tevent_end_time || "-"}
              </div>
            `;
          },
        },
        { data: "created_by_name" },
        {
          data: "tevent_status",
          render: (data) => {
            if (!data) return "-";

            const formatted = data
              .toLowerCase()
              .replace(/_/g, " ")
              .replace(/^./, (str) => str.toUpperCase());

            let badgeClass = "badge bg-secondary";

            if (data === "pending") badgeClass = "badge bg-warning";
            if (data === "approved") badgeClass = "badge bg-success";
            if (data === "rejected") badgeClass = "badge bg-danger";
            if (data === "completed") badgeClass = "badge bg-info";
            if (data === "published") badgeClass = "badge bg-primary";

            return `<span class="${badgeClass}">${formatted}</span>`;
          },
        },
        {
          data: "tevent_created_at",
          render: (data) => {
            if (!data) return "-";
            return `
              <div>
                <i class="fa fa-calendar-check text-dark me-1"></i>
                ${formatToIST(data)}
              </div>
            `;
          },
        },
        { data: null }, // Action column placeholder
      ],
      columnDefs: [
        {
          targets: 9,
          createdCell: (td, cellData, record) => {
            ReactDOM.createRoot(td).render(
              <div className="dropdown">
                <button
                  className="btn btn-light btn-sm dropdown-toggle"
                  data-bs-toggle="dropdown"
                >
                  <i className="fa fa-ellipsis-h"></i>
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button className="dropdown-item" onClick={() => viewEvent(record)}>
                      View
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => copyEventFunApi(record)}>
                      Copy
                    </button>
                  </li>
                  {record.tevent_status !== "published" &&
                    record.tevent_status !== "approved" && (
                      <li>
                        <button className="dropdown-item" onClick={() => editFun(record)}>
                          Edit
                        </button>
                      </li>
                    )}
                  {record.tevent_status === "approved" && (
                    <li>
                      <button className="dropdown-item" onClick={() => publishEventAction(record)}>
                        Publish
                      </button>
                    </li>
                  )}
                  {record.tevent_status === "published" && (
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => joinNewVolunteerEventFun(record)}
                      >
                        Join Volunteer
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            );
          },
        },
      ],
    });
  };

  useEffect(() => {
    if (permissions.includes("list")) {
      initiatedEventDatatable();
    }
  }, [permissions]);

  /* ================= COPY URL ================= */

  const copyToClipboardVolURL = () => {
    const base = window.location.origin;
    const url = `${base}/volunteer-registration`;

    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Volunteer Registration URL copied!"))
      .catch(() => toast.error("Failed to copy URL"));
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="home-content">
        <div className="card">
          <div className="card-header d-flex justify-content-between">
            <h5>Event List</h5>
            <div>
              <button
                type="button"
                style={{ marginRight: "10px" }}
                className="btn btn-sm btn-dark"
                onClick={copyToClipboardVolURL}
              >
                Copy Volunteer REG URL
              </button>

              {permissions.includes("add") && (
                <button className="btn btn-dark btn-sm me-2" onClick={addFun}>
                  Add Event
                </button>
              )}

              {permissions.includes("export") && (
                <button className="btn btn-success btn-sm" onClick={downloadExcel}>
                  <FaFileExport /> Download Excel
                </button>
              )}
            </div>
          </div>

          <div className="card-body">
            <div className="table-responsive">
              <table
                id="event-datatable"
                className="table table-bordered table-striped"
              >
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Activity Title</th>
                    <th>State</th>
                    <th>Location</th>
                    <th>Start Date Time</th>
                    <th>End Date Time</th>
                    <th>Created By</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>
              </table>
            </div>
          </div>
        </div>

        {isOpenUpsertModal && (
          <AddEditEventList
            visible={isOpenUpsertModal}
            onClose={() => setIsOpenUpsertModal(false)}
            data={editEvent}
            fetchData={initiatedEventDatatable}
          />
        )}
      </div>
    </>
  );
};