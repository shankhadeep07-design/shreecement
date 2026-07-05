import $ from "jquery";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { Modal } from "antd";
import { FaFileExport } from "react-icons/fa";
import { toast } from "react-toastify";

import { useLoading } from "../../../context/LoadingContext.jsx";
import {
  formatToIST,
  getMyModulePermissionFun,
  getTableShimmer,
} from "../../../helper/common.js";

import {
  getAuthToken,
  privateAxios,
} from "../../../services/Helper.js";

import {
  copyEventApi,
  joinNewVolunteerInEventApi,
  publishEventApi,
} from "../../../services/Event-service.js";

import AddEditEventNotCsrList from "./AddEditEventNotCsrList.jsx";
import { userDetails } from "../../../auth/auth.js";

export const EventNotCsrList = () => {
  const { setLoading } = useLoading(false);

  const [permissions, setPermissions] = useState([]);
  const [editEvent, setEditEvent] = useState(null);
  const [isOpenUpsertModal, setIsOpenUpsertModal] = useState(false);
  const userDetail = userDetails();

  console.log(userDetail);

  /* ================= PERMISSIONS ================= */
  useEffect(() => {
    getMyModulePermissionFun("events_not_csr")
      .then((module) => setPermissions(module))
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
      `${import.meta.env.VITE_HOME_PAGE}/admin/event-social-development/${data.tevent_id}`,
      "_blank"
    );
  };

  const publishEventAction = (data) => {
    Modal.confirm({
      title: "Publish this event?",
      onOk: () => publishEventFun(data),
    });
  };

  const publishEventFun = (data) => {
    publishEventApi({
      tevent_id: data.tevent_id,
      tevent_status: "published",
    })
      .then(() => {
        toast.success("Event published");
        initiatedEventDatatable();
      })
      .catch(() => toast.error("Publish failed"));
  };

  const copyEventFunApi = (data) => {
    copyEventApi({ tevent_id: data.tevent_id })
      .then(() => {
        toast.success("Event copied");
        initiatedEventDatatable();
      })
      .catch(() => toast.error("Copy failed"));
  };

  const joinNewVolunteerEventFun = (data) => {
    joinNewVolunteerInEventApi({
      tevent_id: data.tevent_id,
      tevent_status: "join_new_volunteer",
    })
      .then(() => {
        toast.success("Volunteer added");
        initiatedEventDatatable();
      })
      .catch(() => toast.error("Action failed"));
  };

  const downloadExcel = async () => {
    try {
      const res = await privateAxios.get(
        "admin/events/not_csr/event-list/excel-export",
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Social Development Event.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Excel download failed");
    }
  };

  /* ================= DATATABLE ================= */

  const initiatedEventDatatable = () => {
    const authToken = getAuthToken();
    const my_url = `${import.meta.env.VITE_API_URL}/admin/events/not_csr/event-list/datatable`;

    if ($.fn.DataTable.isDataTable("#initiated-CreateEvent-datatable")) {
      $("#initiated-CreateEvent-datatable").DataTable().destroy();
    }

    $("#initiated-CreateEvent-datatable").DataTable({
      order: [[1, "asc"]],
      serverSide: true,
      processing: false,
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
        { data: "tevent_start_date" },
        { data: "tevent_end_date" },
        { data: "tevent_start_time" },
        { data: "tevent_end_time" },
        { data: "created_by_name" },
        { data: "tevent_status" },
        {
          data: "tevent_created_at",
          render: (data) => formatToIST(data),
        },
        { data: null, orderable: false },
      ],
      columnDefs: [
        {
          targets: 11,
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
                    <button
                      className="dropdown-item"
                      onClick={() => viewEvent(record)}
                    >
                      View
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => copyEventFunApi(record)}
                    >
                      Copy
                    </button>
                  </li>
                  {record.tevent_status == "submitted" && userDetail.id == record.tevent_created_by && (
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => editFun(record)}
                      >
                        Edit
                      </button>
                    </li>
                  )}
                  {record.tevent_status === "approved" && userDetail.role_id == record.role_ids &&(
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => publishEventAction(record)}
                      >
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

  /* ================= UI ================= */

  const copyToClipboardVolURL = () => {
    const base =
      import.meta.env.VITE_HOME_PAGE === "/"
        ? `${window.location.origin}/`
        : `${window.location.origin}${import.meta.env.VITE_HOME_PAGE}/`;

    navigator.clipboard
      .writeText(`${base}volunteer-registration`)
      .then(() => alert("Volunteer Registration URL copied!"));
  };

  return (
    <>
      <Toaster position="top-center" />

      <div className="home-content">
        <div className="card">
          <div className="card-header d-flex justify-content-between">
            <h5>Social Development Event List</h5>

            <div>
              <button
                className="btn btn-dark btn-sm me-2"
                onClick={copyToClipboardVolURL}
              >
                Copy Volunteer REG URL
              </button>

              {permissions.includes("add") && (
                <button
                  className="btn btn-dark btn-sm me-2"
                  onClick={addFun}
                >
                  Add Event
                </button>
              )}

              {permissions.includes("export") && (
                <button
                  className="btn btn-success btn-sm"
                  onClick={downloadExcel}
                >
                  <FaFileExport /> Download Excel
                </button>
              )}
            </div>
          </div>

          <div className="card-body">
            <div className="table-responsive">
              <table
                id="initiated-CreateEvent-datatable"
                className="table table-bordered table-striped"
              >
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Activity Title</th>
                    <th>State</th>
                    <th>Location</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
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
          <AddEditEventNotCsrList
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
