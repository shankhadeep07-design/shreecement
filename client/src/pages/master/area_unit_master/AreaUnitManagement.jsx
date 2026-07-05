import React, { useState, useEffect } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";
import toast, { Toaster } from "react-hot-toast";
import Select from "react-select";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import ReactDOM from "react-dom/client";
import { Table, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {useLoading} from '../../../context/LoadingContext';

import {
  deleteSite
} from "../../../Services/SiteMaster-service";
import {
    FaEllipsisH,
    FaPencilAlt,
    FaTrash,
    FaRegPlusSquare,
  } from "react-icons/fa";

import { Modal, Dropdown, Button, Accordion } from "react-bootstrap";

import {AddAreaUnit} from "./AddAreaUnit";
import $ from "jquery";

import { getAuthToken } from "../../../Services/Helper";
import { tableToExcel, getTableShimmer } from "../../../helper/common";

import {useSelector, useDispatch} from 'react-redux';
import {setCompleteFormDataOnce} from "../../../redux/slices/SiteMasterSlice"

const AreaUnitManagement = () => {
    let {loading, setLoading} = useLoading(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [deleteData, setDeleteData] = useState(null);
    const [filterProjectList, setFilterProjectList] = useState([])

    let [plotListLoader, setPlotListLoader] = useState(true);
    const handleSearch = (value) => {
        setSearchText(value);
    };
    const [updateProjectValues, setUpdateProjectValues] = useState({});
    const [filterValues, setFilterValues] = useState({});

    var dispatch = useDispatch();

    function deleteRecord(id){
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <div className="custom-ui delete_popup_box">
              <h1>Are you sure ?</h1>
              <p>You want to delete this record ?</p>
              <div className="delete_button_box">
                <button className="btn btn-info mr-1" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    handleClickDelete(id);
                    onClose();
                  }}
                >
                  Yes, Delete it!
                </button>
              </div>
            </div>
          );
        },
      });
    }


    const initDatatable = () => {
      var i = 1;
      var authToken = getAuthToken();
      var my_url = `${process.env.REACT_APP_API_URL}/admin/site-master/datatable`;
      if ($.fn.DataTable.isDataTable("#table-datatable")) {
        $("#table-datatable").DataTable().destroy();
      }
      $("#table-datatable").DataTable({
        order: [[1, "asc"]],
        dom: "<'d-flex justify-content-between align-items-center mb-2'<'d-flex align-items-center'Bl><'d-flex'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row mt-2'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 d-flex justify-content-end'p>>",
        language: {
          lengthMenu: "_MENU_"
        },
        buttons: [
          // {
          //   text: 'Export', // Button text
          //   action: function (e, dt, node, config) {
          //     tableToExcel('table-datatable','SPV Management List')
          //   },
          // },
        ],
        // scrollX: true,
        ajax: {
          url: my_url,
          type: "POST",
          beforeSend: function (request) {
            i = 1;
            request.setRequestHeader("Authorization", `Bearer ${authToken}`);
          },
        },
        processing: false,
        serverSide: true,
        language : {
          loadingRecords: function (){
            return getTableShimmer(5, 8)
          }
        },
        initComplete: function(settings) {
          console.log('Init complete');
          setPlotListLoader(false);
          // $("#plot_list_table").removeClass('table-loader').show();
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
            name: "tsl_state_name",
            data: "tsl_state_name",
            searchable: true,
            orderable: true,
          },
          {
            name: "tsm_name",
            data: "tsm_name",
            searchable: true,
            orderable: true,
          },
          {
            name: "tsm_area",
            data: "tsm_area",
            searchable: true,
            orderable: true,
          },
          {
            name: "tpm_project_name",
            data: "tpm_project_name",
            searchable: true,
            orderable: true,
            render: function(data){
              if(!data){
                return "-"
              }
            }
          },
          {
            name: "tsm_assigned_project_approval_status",
            data: "tsm_assigned_project_approval_status",
            searchable: true,
            orderable: true,
            render: function(data){
              if(!data){
                return "-"
              }
            }
          },
          {
            name: "action",
            data: "action",
            searchable: false,
            orderable: false,
            defaultContent : ""
          },
        ],
        columnDefs: [
          { targets: [0, 1, 2, 3, 4, 5, 6], className: 'dt-center' },
          {
            name: 'Action',
            targets: [6],
            createdCell: (td, celldata, record) => {
              ReactDOM.createRoot(td).render(
                <>
                
                  <div className="dropdown">
                    <a
                      className="btn btn-light btn-sm dropdown-toggle"
                      href="#"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      data-toggle="tooltip"
                      data-placement="bottom"
                      title="Action">
                      <i className="fa fa-ellipsis-h" aria-hidden="true"></i>
                    </a>
  
                    <ul className="dropdown-menu">
                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                            onClick={() => updateRecordOnClick(record)}>
                            <span style={{ marginRight: "5px" }}>
                              <i className="fa fa-pen"></i>
                            </span>
                            <span> Edit</span>
                          </a>
                        </li>
  
                        <li>
                          <a
                            className="dropdown-item text-danger"
                            href="#"
                            onClick={() => deleteRecord(record.tsm_id)}
                            >
                            <span style={{ marginRight: "5px" }}>
                              <i className="fa fa-trash"></i>
                            </span>
                            <span> Delete</span>
                          </a>
                        </li>
                    </ul>
                  </div>
                  
                </>
              );
            },
          },
        ],
      });
    };
  
    useEffect(() => {
      initDatatable();
    },[])

    const handleClickDelete = (id) => {
      setLoading(true);
      deleteSite(id)
        .then((data) => {
          setLoading(false);
          toast.success(data.message);
          initDatatable();
        })
        .catch((error) => {
          setLoading(false);
          toast.error(error);
        });
    };
    const updateRecordOnClick = (data) => {
      var tempObj = {
        id : data.tsm_id,
        area : data.tsm_area,
        name : data.tsm_name,
        state : {
          label : data.tsl_state_name,
          value : data.tsm_state_id,
        }
      }
      dispatch(setCompleteFormDataOnce(tempObj))
      changeModalStatus(true);
    }

    const changeModalStatus = (data) => {
        setShowAddModal(data);
    }

    const clearUpdateValues = () => {
        setUpdateProjectValues({})
    }

  return (
    <>
    <Toaster
        position="top-center"
        toastOptions={{ duration: 2000 }}
        reverseOrder={false}></Toaster>

      <span className="position-absolute trigger"></span>

      {/* This is a side bar */}

      <div className="home-content">
        <div className="card pb-3">
          <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
            <h5 className="mb-0 float-left">
              Area Unit List
            </h5>
            <div className="float-right">
              <button
                type="button"
                className="btn btn-sm btn-dark"
                onClick={() =>
                    setShowAddModal(true)
                }>
                <a
                  data-toggle="tooltip"
                  data-placement="bottom"
                  title="Add Issue"
                  data-bs-original-title="Add Issue"
                  aria-label="Add User" > 
                  <i class="fa-solid fa-plus"></i> Add New Area Unit
                </a>
              </button>

              {/* <button
                type="button"
                className="btn btn-sm btn-dark-outline"
                data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-controls="collapseExample"
                >
                  <i class="fa-solid fa-filter-list"></i> Filter
              </button> */}
            </div>
          </div>

          <div className="card-body at-elevation-z6 table-box">
            <div className="table-responsive mt-2 table table-bordered">
              <div style={{ overflowX: "auto" }}>
                <table id="table-datatable" className="table table-bordered dataTable">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>State</th>
                      <th>Name</th>
                      <th>Approximate Area (in acre)</th>
                      <th>Assigned Project</th>
                      <th>Approval Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                </table>

              </div>
            </div>
          </div>
        </div>

        <div className="allModals">
          {/* Add Project Modal Start*/}
          <AddAreaUnit
          show={showAddModal}
          changeModalStatus={changeModalStatus}
          refreshTable={initDatatable}
          />
        </div>
        
      </div>
    </>
  )
}

export default AreaUnitManagement;