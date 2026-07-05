import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import { useLoading } from "../../context/LoadingProvider.jsx";
import { Modal, Form } from "react-bootstrap";

import $ from "jquery";
import ReactDOM from "react-dom/client";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import {
  EyeOutlined,
  EditOutlined,
  MoreOutlined,
  LockOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  EditTwoTone,
} from "@ant-design/icons";

import {
  deleteApprovalPath,
} from "../../services/ApprovalPath-Service.js";

import {
  getTableShimmer,
  convertToTimezone,
  getMyModulePermissionFun,
} from "../../helper/common.js";

import { updateStatusApprovalPath } from "../../services/Role-service.js";
import { getAuthToken } from "../../services/Helper.js";

export const ApprovalPath = () => {
  let { loading, setLoading } = useLoading(false);
  const dispatch = useDispatch();

  const RAW_BASE = import.meta.env.VITE_HOME_PAGE || "";
  const BASE_PATH =
    RAW_BASE === "/" || RAW_BASE === ""
      ? ""
      : `/${RAW_BASE.replace(/^\/|\/$/g, "")}`;

  const [modulePermissions, setModulePermissions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [statusChangeData, setStatusChangeData] = useState(null);

  useEffect(() => {
    getMyModulePermissionFun("approval").then(setModulePermissions);
  }, []);

  const handleStatusChangeToggleSwitch = (record, checked) => {
    setStatusChangeData({ record, checked });
    setShowModal(true);
  };

  const handleConfirmStatusChange = () => {
    if (!statusChangeData) return;

    const { record, checked } = statusChangeData;

    updateStatusApprovalPath(record.tac_id, { checked, record })
      .then((res) => {
        if (res.status === 0) {
          toast.success(res.message);
          initDatatable();
        }
      })
      .finally(() => {
        setShowModal(false);
        setStatusChangeData(null);
      });
  };

  const initDatatable = () => {
    const authToken = getAuthToken();
    const my_url = `${import.meta.env.VITE_API_URL}/admin/approvals/datatable`;

    if ($.fn.DataTable.isDataTable("#table-datatable")) {
      $("#table-datatable").DataTable().destroy();
    }

    $("#table-datatable").DataTable({
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
          data: null,
          render: (data, type, full, meta) =>
            meta.settings._iDisplayStart + meta.row + 1,
        },
        { data: "taml_approval_name" },
        { 
          data: "tac_approved_type",
          render: (data) => {
            if (data === "under_approved_annual_budget" || data === "under_approved") return "Under Approved Annual Budget";
            if (data === "other_than_approved_annual_budget") return "Other Than Approved Annual Budget";
            return data || "N/A";
          }
        },
        { data: "tac_from_amount" },
        { data: "tac_to_amount" },
        { data: "trl_role_name" },
        { data: "tsml_sub_master_list_name" },
        { data: "tac_module_name" },

        // ✅ Status Column with AntD Icons
        {
          data: "tac_status",
          render: (data) => {
            if (data === "active") {
              return `<span class="badge bg-success">
                <i class="anticon anticon-check-circle"></i> Active
              </span>`;
            }
            if (data === "draft") {
              return `<span class="badge bg-warning text-dark">
                <i class="anticon anticon-edit"></i> Draft
              </span>`;
            }
            return `<span class="badge bg-danger">
              <i class="anticon anticon-close-circle"></i> Inactive
            </span>`;
          },
        },

        { data: null }, // Status Switch
        {
          data: "tac_created_at",
          render: convertToTimezone,
        },
        { data: "name" },
        {
          data: "tac_published_date",
          render: convertToTimezone,
        },
        { data: null }, // Action
      ],

      columnDefs: [
        {
          orderable: false,
          targets: [0, 9, 13],
        },
        {
          targets: [3, 4],
          orderSequence: ["asc", "desc"],
        },
        {
          targets: [10, 12],
          orderSequence: ["desc", "asc"],
        },

        // ✅ Status Change Switch
        {
          targets: 9,
          createdCell: (td, cellData, record) => {
            ReactDOM.createRoot(td).render(
              record.tac_status === "draft" ? (
                <Form.Check
                  type="switch"
                  title="Activate Approval Path"
                  onChange={(e) =>
                    handleStatusChangeToggleSwitch(record, e.target.checked)
                  }
                />
              ) : (
                <LockOutlined style={{ color: "#999" }} />
              )
            );
          },
        },

        // ✅ Action Column
        {
          targets: 13,
          createdCell: (td, cellData, record) => {
            ReactDOM.createRoot(td).render(
              <div className="dropdown">
                <button
                  className="btn btn-light btn-sm"
                  data-bs-toggle="dropdown"
                >
                  <MoreOutlined />
                </button>

                <ul className="dropdown-menu">
                  <li>
                    <a
                      className="dropdown-item"
                      target="_blank"
                      href={`${BASE_PATH}/admin/approval/add_approval_view/${record.tac_id}`}
                    >
                      <EyeOutlined className="me-2" />
                      View
                    </a>
                  </li>

                  {record.tac_status === "draft" &&
                    modulePermissions.includes("edit") && (
                      <li>
                        <a
                          className="dropdown-item"
                          target="_blank"
                          href={`${BASE_PATH}/admin/approval/add_approval/${record.tac_id}`}
                        >
                          <EditOutlined className="me-2" />
                          Edit
                        </a>
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
    if (modulePermissions.includes("list")) {
      initDatatable();
    }
  }, [modulePermissions]);

  return (
    <>
      {/* Status Confirmation Modal */}
      {showModal && (
        <div className="modal show d-block">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                Confirm Status Change
              </div>
              <div className="modal-body">
                Are you sure you want to change the status?
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmStatusChange}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="home-content">
        <div className="card">
          <div className="card-header d-flex justify-content-between">
            <h5 className="mb-0 float-left">Approval Path</h5>
            <Link to="/admin/approval/add_approval">
              <button className="btn btn-dark btn-sm">
                <i className="fa-solid fa-plus"></i> Add New Path
              </button>
            </Link>
          </div>

          <div className="card-body">
            <div className="table-responsive">
              <table
                id="table-datatable"
                className="table table-bordered dataTable"
              >
                <thead>
                  <tr>
                    <th>Sl</th>
                    <th>Approval Type</th>
                    <th>Approved Type</th>
                    <th>From Amount</th>
                    <th>To Amount</th>
                    <th>Initiator Role</th>
                    <th>Location</th>
                    <th>Details Info</th>
                    <th>Status</th>
                    <th>Status Change</th>
                    <th>Created Date</th>
                    <th>Created By</th>
                    <th>Published Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
