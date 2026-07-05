import $ from "jquery";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import "react-confirm-alert/src/react-confirm-alert.css";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { toast } from "react-toastify";

import {
  getMyModulePermissionFun,
  getTableShimmer,
} from "../../helper/common.js";
import { getAuthToken, tableToExcel } from "../../services/Helper.js";

import { getExcelExportCaseStudiesList } from "../../services/CaseStudy-service.js";
import { FaFileExport } from "react-icons/fa";
import AddEditCaseStudy from "./AddEditCaseStudy.jsx";

export default function CaseStudyMasterList() {
  const [showModal, setShowModal] = useState({});
  const [editList, setEditList] = useState("");
  const [viewData, setViewData] = useState(null);

  const [permissions, setPermissions] = useState([]);
  const [exportsLists, setExportsLists] = useState([]);

  let datatable_url = `${import.meta.env.VITE_API_URL}/admin/case-studies/datatable`;

  useEffect(() => {
    getMyModulePermissionFun("district")
      .then((module) => {
        setPermissions(module);
      })
      .catch((error) => {
        console.error("Error fetching module permissions:", error);
      });
  }, []);

  const changeModalStatus = (id, status) => {
    setShowModal({
      ...showModal,
      [id]: status,
    });
  };

  const addFun = () => {
    setEditList("");
    changeModalStatus("user_update_modal", true);
  };

  const editFun = (data) => {
    setEditList(data);
    changeModalStatus("user_update_modal", true);
  };

  // const viewFun = (data) => {
  //   setViewData(data);
  //   changeModalStatus("view_case_modal", true);
  // };
  const viewFun = (data) => {
    setViewData(data);

    // Close Add/Edit modal if open
    setShowModal({
      user_update_modal: false,
      view_case_modal: true,
    });
  };

  const initiatedDistrictDatatable = () => {
    var authToken = getAuthToken();
    var my_url = `${import.meta.env.VITE_API_URL}/admin/case-studies/datatable`;

    if ($.fn.DataTable.isDataTable("#initiated-CaseStudies-datatable")) {
      $("#initiated-CaseStudies-datatable").DataTable().destroy();
    }

    $("#initiated-CaseStudies-datatable").DataTable({
      order: [[1, "asc"]],
      dom:
        "<'d-flex justify-content-between align-items-center mb-2'<'d-flex align-items-center'Bl><'d-flex'f>>" +
        "<'row table-responsive'<'col-sm-12'tr>>" +
        "<'row mt-2'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 d-flex justify-content-end'p>>",

      buttons: [],

      ajax: {
        url: my_url,
        type: "POST",
        beforeSend: function (request) {
          request.setRequestHeader("Authorization", `Bearer ${authToken}`);
        },
      },

      processing: false,
      serverSide: true,

      language: {
        loadingRecords: function () {
          return getTableShimmer(5, 7);
        },
        lengthMenu: "_MENU_",
      },

      columns: [
        {
          name: "id",
          render: function (data, type, row, meta) {
            return meta.row + meta.settings._iDisplayStart + 1;
          },
          searchable: false,
          orderable: false,
        },
        {
          name: "project_name",
          data: "project_name",
        },
        {
          name: "theme_name",
          data: "theme_name",
        },
        {
          name: "tcs_problem",
          data: "tcs_problem",
          render: function (data) {
            if (!data) return "";
            return data.length > 20 ? data.substring(0, 20) + "..." : data;
          },
        },
        {
          name: "tcs_solution",
          data: "tcs_solution",
          render: function (data) {
            if (!data) return "";
            return data.length > 20 ? data.substring(0, 20) + "..." : data;
          },
        },
        {
          name: "tcs_benefit",
          data: "tcs_benefit",
          render: function (data) {
            if (!data) return "";
            return data.length > 20 ? data.substring(0, 20) + "..." : data;
          },
        },
        {
          name: "action",
          data: null,
          searchable: false,
          orderable: false,
          defaultContent: "",
        },
      ],

      columnDefs: [
        { targets: "_all", className: "dt-center" },
        {
          targets: [6],
          createdCell: (td, celldata, record) => {
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
                      onClick={() => viewFun(record)}
                    >
                      <i className="fa-solid fa-eye"></i> View Case Study
                    </button>
                  </li>

                  {(permissions?.indexOf("edit") > -1 ||
                    permissions === "*") && (
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => editFun(record)}
                      >
                        <i className="fa-solid fa-pen-to-square"></i> Edit Case
                        Study
                      </button>
                    </li>
                  )}
                </ul>
              </div>,
            );
          },
        },
      ],
    });
  };

  useEffect(() => {
    initiatedDistrictDatatable();
  }, [permissions]);

  const getAllExportData = () => {
    getExcelExportCaseStudiesList()
      .then((response) => {
        setExportsLists(response.data);
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.originalError ||
            error?.response?.data?.message,
        );
      });
  };

  useEffect(() => {
    if (exportsLists.length > 0) {
      tableToExcel("new-table", "Best Practice List");
    }
  }, [exportsLists]);

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />

      <div className="home-content">
        <div className="card pb-3">
          <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
            <h5 className="mb-0">Case Study List</h5>

            <div>
              <button className="btn btn-sm btn-dark" onClick={() => addFun()}>
                <i className="fa-solid fa-plus"></i> Add Case Study
              </button>

              <button
                className="btn btn-success btn-sm"
                style={{ marginLeft: "10px" }}
                onClick={() => getAllExportData()}
              >
                <FaFileExport /> Export
              </button>
            </div>
          </div>

          <div className="card-body table-box" style={{ overflowX: "auto" }}>
            <table
              id="initiated-CaseStudies-datatable"
              className="table table-bordered dataTable"
            >
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Project</th>
                  <th>Theme</th>
                  <th>Problem</th>
                  <th>Solution</th>
                  <th>Benefit</th>
                  <th>Action</th>
                </tr>
              </thead>
            </table>
          </div>
        </div>

        {/* ADD / EDIT MODAL */}

        <Modal
          show={showModal.user_update_modal}
          onHide={() => changeModalStatus("user_update_modal", false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {editList === "" ? "Add CaseStudies" : "Update CaseStudies"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <AddEditCaseStudy
              changeModalStatus={changeModalStatus}
              editList={editList}
              initiatedDistrictDatatable={initiatedDistrictDatatable}
              datatable_url={datatable_url}
            />
          </Modal.Body>
        </Modal>

        {/* VIEW MODAL */}
        <Modal
          show={showModal.view_case_modal}
          onHide={() => changeModalStatus("view_case_modal", false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton className="modern-header">
            <Modal.Title>
              <span className="header-icon">📘</span>
              Case Study Details
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="modern-body">
            {/* Top Info */}
            <div className="info-grid">
              <div className="info-card">
                <div className="info-label">Project</div>
                <div className="info-value">
                  {viewData?.project_name || "-"}
                </div>
              </div>

              <div className="info-card">
                <div className="info-label">Theme</div>
                <div className="info-value">{viewData?.theme_name || "-"}</div>
              </div>
            </div>

            {/* Problem */}
            <div className="case-card problem">
              <div className="case-title">
                <span className="case-icon">⚠</span> Problem
              </div>

              <div className="case-text">{viewData?.tcs_problem || "-"}</div>
            </div>

            {/* Solution */}
            <div className="case-card solution">
              <div className="case-title">
                <span className="case-icon">💡</span> Solution
              </div>

              <div className="case-text">{viewData?.tcs_solution || "-"}</div>
            </div>

            {/* Benefit */}
            <div className="case-card benefit">
              <div className="case-title">
                <span className="case-icon">🎯</span> Benefit
              </div>

              <div className="case-text">{viewData?.tcs_benefit || "-"}</div>
            </div>

            {/* Documents */}

            <div className="document-section">
              <div className="document-title">📂 Documents</div>

              {viewData?.documents?.length > 0 ? (
                <div className="doc-grid">
                  {viewData.documents.map((doc, index) => (
                    <div className="doc-card" key={index}>
                      <div className="doc-left">
                        <div className="doc-icon">📄</div>
                        <div className="doc-name">{doc.file_name}</div>
                      </div>

                      <a
                        href={doc.full_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-btn"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted">No documents uploaded</div>
              )}
            </div>
          </Modal.Body>
        </Modal>
      </div>

      {/* EXPORT TABLE */}

      <div style={{ display: "none" }}>
        <table id="new-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Project</th>
              <th>Theme</th>
              <th>Problem</th>
              <th>Solution</th>
              <th>Benefit</th>
            </tr>
          </thead>

          <tbody>
            {exportsLists?.map((data, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{data?.project_name}</td>
                <td>{data?.theme_name}</td>
                <td>{data?.tcs_problem}</td>
                <td>{data?.tcs_solution}</td>
                <td>{data?.tcs_benefit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
