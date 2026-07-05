
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from "react-dom/client";
import toast, { Toaster } from "react-hot-toast";
import { convertToTimezone, tableToExcel, getTableShimmer, getMyModulePermissionFun } from '../../../helper/common';
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "datatables.net-bs5";
import 'datatables.net';
import $ from "jquery";
import { CiEdit } from "react-icons/ci";
import { Link, useNavigate } from 'react-router-dom'; // Assuming you're using react-router-dom
// import { rolesList } from '../../services/Role-service';

// import { csrPdBudgetList, fetchAmendmentListApi, budgetTransferDeleteApi } from '../../services/Budget-service';
import { IoDocumentText } from "react-icons/io5";
import { FaFileExport } from 'react-icons/fa';
import { userDetails } from '../../../auth/auth';
import { AiOutlineEye } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import BudgetTransferRejectList from './BudgetTransferRejectList';
import BudgetTransferApprovedList from './BudgetTransferApprovedList';
// import BudgetTransferApprovedList from './BudgetTransferApprovedList';
// import BudgetTransferRejectList from './BudgetTransferRejectList';
import { getAuthToken } from "../../../services/Helper";


export default function BudgetTransferMaster() {

  const navigate = useNavigate();
  const userDetail = userDetails();
  const [key, setKey] = useState('home');

  const [modalKey, setModalKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [details, setDetails] = useState({});
  const [budgetList, setBudgetList] = useState(null);
  const [exportBudgetAmendmentList, setExportsBudgetAmendmentLists] = useState([]);

  const [url, setURL] = useState(false);

  const [modulePermissions, setModulePermissions] = useState([]);
  useEffect(() => {

    getMyModulePermissionFun('budget_shuffling')
      .then((module) => {
        // console.log(module);
        setModulePermissions(module);
      })
      .catch((error) => {
        console.error('Error fetching module permissions:', error);
      });

  }, []);

  const handleBudgetTransferList = (rowdata) => {

    navigate("/admin/budget/budget-transfer-add");

  };
  const viewBudgetTransferDetails = (rowdata) => {

    navigate(`/admin/budget_shuffling/budget-transfer-view/${rowdata.tbtm_id}?not_type=budget_transfer`);

  };
  const handleViewBudgetTransferPending = (rowdata) => {

    navigate(`/admin/budget_shuffling/budget-transfer-view/${rowdata.tbtm_id}?not_type=budget_transfer`);

  };

  const closeModal = () => {
    setShowModal(false);
  };


  // -----------------------  Datatable  -------------------------------------------
  const queryParameters = new URLSearchParams(window.location.search);
  const get_project_id = queryParameters.get("plot_id");

  const [toBeFilterData, setToBeFilterData] = useState({
    tproj_id: "",
  });
  // Initialize a state variable to hold the data array
  const [dataArray, setDataArray] = useState([]);
  let [plotListLoader, setPlotListLoader] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  // Define the maximum buffer size (in your case, 10)
  const maxBufferSize = 10;

  const initListDatatable = (my_url) => {
    // var i = 1;
    var authToken = getAuthToken();

    return $("#list_table").DataTable({
      order: [[1, "asc"]],
      ajax: {
        url: my_url,
        type: "POST",
        data: function (d) {
          // Additional data to be sent to the server
          d.filterParams = toBeFilterData; // You can add more parameters as needed
        },
        beforeSend: function (request) {
          // i = 1;
          setDataArray([]);
          request.setRequestHeader("Authorization", `Bearer ${authToken}`);
        },
        dataSrc: function (json) {
          json.data = json.data.filter(row => row.tbtm_status !== "approved" && row.tbtm_status !== "reject"); // Keep only approved rows
          return json.data;
        }
      },
      paging: true,
      processing: false,
      serverSide: true,
      destroy: true,
      language: {
        loadingRecords: function () {
          return getTableShimmer(5, 8)
        }
      },
      initComplete: function (settings) {
        setPlotListLoader(false);
        setIsLoading(false);
        setURL(my_url);
      },
      columns: [

        {
          data: "id",
          render: function (data, type, full, meta) {
            // Calculate the serial number dynamically
            var page = meta.settings._iDisplayStart; // The starting index for the current page
            var pageLength = meta.settings._iDisplayLength; // The number of rows per page

            // Calculate serial number: (page index * page length) + row index
            return page + meta.row + 1; // Add 1 to start from 1, not 0
          },
          className: "text-start",
          searchable: false,
          orderable: false,
        },
        {
          name: "tbtm_unique_id",
          data: "tbtm_unique_id",

          createdCell: (td, celldata, rowdata) => {
            ReactDOM.createRoot(td).render(
              <>
                <div
                  style={{
                    cursor: "pointer",
                    color: "#007bff",
                    textAlign: "left",
                  }}
                  onClick={() => handleViewBudgetTransferPending(rowdata)}
                >
                  {`${rowdata?.tfin_year_label
                    }/${rowdata?.tbtm_unique_id}` +

                    `/${rowdata?.tbtm_id?.slice(-4)}`}
                </div>
              </>
            );
          },

          // render: function (data, type, full, meta) {
          //   return  `${
          //     full?.tfin_year_label
          //   }/${full?.tbtm_unique_id}` +

          //   `/${full?.tbtm_id?.slice(-4)}`;
          // },
          searchable: true,
          orderable: true,
          width: "150px",
        },
        {
          name: "tfin_year_label",
          data: "tfin_year_label",
          className: "text-dot",
          // render: function (data, type, full, meta) {
          //   return data && typeof data === "string"
          //     ? data?.replace(/\b\w/g, (char) => char?.toUpperCase())
          //     : data;
          // },
          searchable: false,
          orderable: false,
        },
        {
          name: "tbtm_id",
          data: "tbtm_id",
          className: "text-dot",
          // render: function (data, type, full, meta) {
          //   return data && typeof data === "string"
          //     ? data?.replace(/\b\w/g, (char) => char?.toUpperCase())
          //     : data;
          // },
          searchable: true,
          orderable: true,
        },

        {
          name: "from_budget_type",
          data: "from_budget_type",
          className: "text-dot",
          // render: function (data, type, full, meta) {
          //   return data && typeof data === "string" ? data.toUpperCase() : data;
          // },
          searchable: true,
          orderable: true,
        },
        {
          name: "to_budget_type",
          data: "to_budget_type",
          className: "text-dot",
          // render: function (data, type, full, meta) {
          //   return data && typeof data === "string" ? data.toUpperCase() : data;
          // },
          searchable: true,
          orderable: true,
        },

        {
          name: "tbad_amount",
          data: "tbad_amount",
          className: "text-dot",
          // render: function (data, type, full, meta) {
          //   return data && typeof data === "string"
          //     ? data?.replace(/\b\w/g, (char) => char?.toUpperCase())
          //     : data;
          // },
          searchable: true,
          orderable: true,
        },
        {
          name: "tbtm_status",
          data: "tbtm_status",
          className: "text-dot",
          // render: function (data, type, full, meta) {
          //   return data && typeof data === "string"
          //     ? data?.replace(/\b\w/g, (char) => char?.toUpperCase())
          //     : data;
          // },
          searchable: true,
          orderable: true,
        },
        {
          name: "name",
          data: "name",
          className: "text-dot",
          // render: function (data, type, full, meta) {
          //   return data && typeof data === "string"
          //   ? data.replace(/\b\w+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          //   : data;
          // },
          searchable: true,
          orderable: true,
        },
        {
          name: "tbtm_created_at",
          data: "tbtm_created_at",
          render: function (data, type, full, meta) {
            return convertToTimezone(data);
          },
        },
        {
          data: "action",
          searchable: false,
          orderable: false,
          defaultContent: "",
        },



      ],
      columnDefs: [
        { targets: "_all", className: 'dt-center1' },
        {
          name: "Action",
          targets: [10],
          className: 'text-center',
          createdCell: (td, celldata, rowdata) => {
            const { tproj_id } = rowdata;
            ReactDOM.createRoot(td).render(
              <>

                <div className="dropdown">
                  <a

                    href="javascript:void(0);"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    data-toggle="tooltip"
                    data-placement="bottom"
                    title="Action">
                    <div>
                      <a className="btn btn-icon btn-sm btn-info-light rounded-pill"><i class='bx bx-slider-alt'></i></a>
                    </div>
                  </a>

                  <ul className="dropdown-menu">
                    {
                      (modulePermissions.indexOf('view') > -1) &&
                      <li>
                        <a
                          className="dropdown-item"
                          href="javascript:void(0)" onClick={() => viewBudgetTransferDetails(rowdata)}>
                          <span style={{ marginRight: "5px" }}>
                            <AiOutlineEye />
                          </span>
                          <span>View</span>
                        </a>
                      </li>
                    }
                    {/* {
                      (rowdata.tbtm_status !== "approved" || rowdata.tbtm_status === 'reject')
                        && parseInt(rowdata.tbtm_created_by) === parseInt(userDetail.id)
                        ?
                        <li>
                          <a
                            className="dropdown-item"
                            href="javascript:void(0)" onClick={() => deleteBudgetAmendment(rowdata)}>
                            <span style={{ marginRight: "5px" }}>
                              <FaTrash />
                            </span>
                            <span>Delete</span>
                          </a>
                        </li>
                        :
                        <></>
                    } */}

                    {
                      (modulePermissions.indexOf('view') > -1) && (
                        (rowdata.tbtm_status !== "approved" || rowdata.tbtm_status === 'reject') &&
                          parseInt(rowdata.tbtm_created_by) === parseInt(userDetail.id) ? (
                          <li>
                            <a
                              className="dropdown-item"
                              href="javascript:void(0)"
                              onClick={() => deleteBudgetAmendment(rowdata)}
                            >
                              <span style={{ marginRight: "5px" }}>
                                <FaTrash />
                              </span>
                              <span>Delete</span>
                            </a>
                          </li>
                        ) : null
                      )
                    }


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

    var my_url = `${import.meta.env.VITE_API_URL}/admin/budget/budget-transfer-list/datatable`;

    if (modulePermissions.indexOf('list') > -1) {
      initListDatatable(my_url);
    }



  }, [modulePermissions]);




  // -----------------------  Datatable End -------------------------------------------

  const getAllExportData = () => {
    // fetchAmendmentListApi().then((response) => {
    //   // console.log(response);
    //   setExportsBudgetAmendmentLists(response.data);
    // });
  }

  useEffect(() => {
    if (exportBudgetAmendmentList.length > 0) {
      tableToExcel('new-table', 'BudgetAmendment List'); // Trigger export once data is set
    }
  }, [exportBudgetAmendmentList]);

  const deleteBudgetAmendment = (details) => {
    console.log(details);
    const data = {
      tbtm_id: details.tbtm_id,
    };
    try {

      if (confirm("Are you sure you want to delete?")) {
        // budgetTransferDeleteApi(data).then((response) => {
        //   // console.log(response);
        //   var my_url = `${import.meta.env.VITE_API_URL}/admin/budget/budget-transfer-list/datatable`;

        //   initListDatatable(my_url);
        // });
      }


    } catch (error) {
      console.log(error);
    }

  }

  return (
    <>
      {/* <div className="d-sm-flex d-block align-items-center justify-content-between page-header-breadcrumb">
        <h4 className="fw-medium mb-0">CSR Budget</h4>
        <div className="ms-sm-1 ms-0">
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><a href="javascript:void(0);">CSR Budget</a></li>
              <li className="breadcrumb-item active" aria-current="page">list</li>
            </ol>
          </nav>
        </div>
      </div> */}

      {/* <div className="main-content app-content">
        <div className="container-fluid"> */}
      {/* <div className="row"> */}
      <div className="home-content">
        <div className="card pb-3">
          <div
            className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3"
          // style={{ overflow: "hidden", display: "block" }}
          >
            <div className="card-title" style={{ float: "left" }}>
              Budget Transfer List
            </div>
            <div style={{ float: "right" }}>
              <button onClick={() => handleBudgetTransferList(null)} className='btn btn-sm btn-dark py-1'>Transfer</button>

              {
                (modulePermissions.indexOf('export') > -1) && <button className='btn btn-success btn-sm' style={{ marginLeft: '10px' }} onClick={() => getAllExportData()}><FaFileExport /> Export</button>}
            </div>
          </div>
          {/* <div className="card-header d-flex justify-content-end">
                    <button onClick={() => handleBudgetTransferList(null)} className='btn btn-sm btn-dark py-1'>Add</button>
                  </div> */}
          <div className="card-body at-elevation-z6 table-box" style={{ maxHeight: "calc(100vh - 23vh);", overflowX: 'auto' }}>
            {/* {
                    (modulePermissions?.indexOf('list') > -1) ? */}
            <Tabs
              id="controlled-tab-example"
              activeKey={key}
              onSelect={(k) => setKey(k)}
              className="mb-3"
            >
              <Tab eventKey="home" title="Pending">

                <div className="initiated-State-table-container">
                  <div className="mt-2 table table-bordered">

                    <table className="table table-bordered dataTable" id="list_table">
                      <thead>
                        <tr>
                          <th className="text-start" style={{ width: '5%' }}>Sl</th>
                          <th>Unique ID</th>
                          <th>FY</th>
                          <th>Transaction Id</th>
                          <th>Transfer From</th>
                          <th>Transfer To</th>
                          <th>Amount  (₹)</th>
                          <th>Status</th>
                          <th>Created By</th>
                          <th>Created At</th>
                          <th className="text-center" style={{ width: '5%' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>

                      </tbody>
                    </table>

                  </div>
                </div>
              </Tab>
              <Tab eventKey="reject" title="Reject">
                <BudgetTransferRejectList />
              </Tab>
              <Tab eventKey="approved" title="Approved">
                <BudgetTransferApprovedList />
              </Tab>

            </Tabs>
            {/* :
                      <>
                        <tr>
                          <td colSpan={14} className='text-center'>You don't have any permissions</td>
                        </tr>
                      </>
                  } */}
          </div>
        </div>
      </div>
      {/* </div> */}



      {/* </div>
      </div> */}

      <div style={{ display: 'none' }}>
        <table id='new-table' style={{ fontSize: '9pt' }} className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Serial No</th>
              <th>FY</th>
              <th>Mine</th>
              <th>Schedule</th>
              <th>Type</th>
              <th>Created By</th>
              <th>Budget</th>
            </tr>
          </thead>
          <tbody>
            {
              exportBudgetAmendmentList.map((data, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{data.tfin_year_label}</td>
                  <td>{data.tmin_mine_name}</td>
                  <td>{data.tcat_category_name}</td>
                  <td>{data.tbad_budget_type}</td>
                  <td>{data.tbad_transfer_type}</td>
                  <td>{data.tbad_amount}</td>
                </tr>
              ))
            }

          </tbody>
        </table>
      </div>


      <Toaster position="top-right" reverseOrder={false} />
    </>
  )
}
