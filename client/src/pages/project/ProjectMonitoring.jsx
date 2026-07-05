import $ from "jquery";
import { useEffect, useState } from "react";
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { useLoading } from "../../context/LoadingContext";

import { Descriptions } from "antd";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getMyModulePermissionFun, getTableShimmer } from "../../helper/common";
import { getAuthToken } from "../../services/Helper.js";
import { projectDetailsApi } from "../../services/Project-service.js";
import AddEditProjectMonitoring from "./AddEditProjectMonitoring.jsx";
import dayjs from "dayjs";
export const ProjectMonitoring = ({ isClosureApproved }) => {
  const [showModal, setShowModal] = useState(false);
  let [editDistrict, setEditDistrict] = useState("#ffffff");
  let datatable_url = `${import.meta.env.VITE_API_URL}/admin/projects/monitoring/datatable`;
  const [permissions, setPermissions] = useState([]);
  const [isOpenUpsertModal, setIsOpenUpsertModal] = useState(false);
  const [projectDetails, setProjectDetails] = useState([]);
  const tproj_id = useParams()?.tproj_id;
  useEffect(() => {
    getMyModulePermissionFun("district")
      .then((module) => {
        setPermissions(module);
      })
      .catch((error) => {
        console.error("Error fetching module permissions:", error);
      });

    setTimeout(() => {
      // setLoading(false);
    }, 2000);
  }, []);

  const changeModalStatus = (id, status) => {
    setShowModal({
      ...showModal,
      [id]: status,
    });
  };

  const addFun = () => {
    setEditDistrict("");
    changeModalStatus("user_update_modal", true);
    setIsOpenUpsertModal(true);
  };

  const editFun = (data) => {
    setEditDistrict(data);
    setIsOpenUpsertModal(true);
    changeModalStatus("user_update_modal", true);
  };

  const initiatedDistrictDatatable = () => {
    var i = 1;
    var authToken = getAuthToken();
    var my_url = `${import.meta.env.VITE_API_URL}/admin/projects/monitoring/datatable`;

    if ($.fn.DataTable.isDataTable("#initiated-Monitoring-datatable")) {
      $("#initiated-Monitoring-datatable").DataTable().destroy();
    }
    $("#initiated-Monitoring-datatable").DataTable({
      paging: false, // ❌ disable pagination
      lengthChange: false, // ❌ hide "10 entries per page" dropdown
      info: false, // ❌ hide "Showing X of Y entries" text (optional)
      searching: false, // ❌ hide search box (optional)
      ordering: false,

      order: [[1, "asc"]],
      dom:
        "<'d-flex justify-content-between align-items-center mb-2'<'d-flex align-items-center'l><'d-flex'f>>" +
        "<'row table-responsive'<'col-sm-12'tr>>" +
        "<'row mt-2'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 d-flex justify-content-end'p>>",
      language: {
        lengthMenu: "_MENU_",
      },
      ajax: {
        url: my_url,
        type: "POST",
        data: function (d) {
          d.project_id = tproj_id; // 👈 PASS PROJECT ID HERE
        },
        beforeSend: function (request) {
          i = 1;
          request.setRequestHeader("Authorization", `Bearer ${authToken}`);
        },
      },
      processing: false,
      serverSide: true,
      language: {
        loadingRecords: function () {
          return getTableShimmer(5, 8);
        },
      },

      columns: [
        {
          name: "id",
          render: function (data, type, full, meta) {
            return i++;
          },
          searchable: false,
          orderable: false,
        },

        {
          name: "tpmon_date",
          data: "tpmon_date",
          render: (data) => {
            if (!data) return "";

            try {
              return dayjs(data).format("YYYY-MM-DD");
            } catch {
              return data;
            }
          },
        },

        {
          name: "tpmon_subject",
          data: "tpmon_subject",
          searchable: true,
          orderable: true,
        },

        {
          name: "tpmon_start_time",
          data: "tpmon_start_time",
          searchable: true,
          orderable: true,
        },
        {
          name: "tpmon_end_time",
          data: "tpmon_end_time",
          searchable: true,
          orderable: true,
        },

        {
          name: "tpmon_members",
          data: "tpmon_members",
          searchable: true,
          orderable: true,
        },
        {
          name: "tpmon_discussion_points",
          data: "tpmon_discussion_points",
          searchable: true,
          orderable: true,
        },
        {
          name: "tpmon_action_points",
          data: "tpmon_action_points",
          searchable: true,
          orderable: true,
        },

        {
          name: "action",
          data: "action",
          searchable: false,
          orderable: false,
          defaultContent: "",
        },
      ],
      columnDefs: [
        { targets: "_all", className: "dt-center" },
        {
          name: "Action",
          targets: [8],
          createdCell: (td, celldata, record) => {
            ReactDOM.createRoot(td).render(
              <>
                <div className="dropdown">
                  <button
                    className="btn btn-light btn-sm dropdown-toggle"
                    href="javascript:void(0)"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    data-toggle="tooltip"
                    data-placement="bottom"
                    title="Action"
                  >
                    <i className="fa fa-ellipsis-h" aria-hidden="true"></i>
                  </button>

                  <ul className="dropdown-menu">
                    {/* <li>
                      <a
                        className="dropdown-item"
                        href={`/coromandel/admin/project/monitoring/view-list/${record?.tpmon_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span style={{ marginRight: "5px" }}>
                          <i className="bx bx-slider-alt"></i>
                        </span>
                        <span>View Monitoring</span>
                      </a>
                    </li> */}

                    {(permissions?.indexOf("edit") > -1 ||
                      permissions == "*") && !isClosureApproved && (
                      <li>
                        <button
                          className="dropdown-item"
                          href="javascript:void(0)"
                          onClick={() => editFun(record)}
                        >
                          <span style={{ marginRight: "5px" }}>
                            <i class="fa-solid fa-pen-to-square"></i>
                          </span>
                          <span>Edit Monitoring</span>
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              </>,
            );
          },
        },
      ],
    });
  };

  useEffect(() => {
    // if(permissions.indexOf('list') > -1){
    initiatedDistrictDatatable();
    // }
  }, [permissions]);

  const fetchProjectDetailsFun = () => {
    projectDetailsApi({ tproj_id })
      .then(({ data }) => {
        if (!data) return;
        setProjectDetails(data);
      })
      .catch((error) =>
        toast.error(
          error?.response?.data?.originalError ||
            error?.response?.data?.message,
        ),
      );
  };

  useEffect(() => {
    fetchProjectDetailsFun();
  }, []);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{ duration: 2000 }}
        reverseOrder={false}
      ></Toaster>

      <span className="position-absolute trigger"></span>

      {/* This is a side bar */}
      <div className="home-content">
        <div className="card pb-3">
          {/* ===== Card Header ===== */}
          <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
            <h5 className="mb-0">Monitoring List</h5>

            {!isClosureApproved && (
              <button
                type="button"
                className="btn btn-sm btn-dark"
                onClick={() => addFun()}
              >
                <i className="fa-solid fa-plus me-1"></i> Add Monitoring
              </button>
            )}
          </div>

          {/* ===== Card Body ===== */}
          <div
            className="card-body at-elevation-z6 table-box"
            style={{ maxHeight: "calc(100vh - 23vh)", overflowX: "auto" }}
          >
            <div className="mt-2 table table-bordered">
              <table
                id="initiated-Monitoring-datatable"
                className="table table-bordered dataTable"
              >
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Members</th>
                    <th>Discussion</th>
                    <th>Action Points</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>{/* DataTable / JS will populate rows here */}</tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ===== Modal Section ===== */}
        <div className="allModals">
          {isOpenUpsertModal && (
            <AddEditProjectMonitoring
              visible={isOpenUpsertModal}
              onClose={() => setIsOpenUpsertModal(false)}
              data={editDistrict}
              fetchData={initiatedDistrictDatatable}
            />
          )}
        </div>
      </div>
    </>
  );
};
