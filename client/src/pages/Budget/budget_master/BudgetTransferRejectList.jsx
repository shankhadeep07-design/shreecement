import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from "react-dom/client";
import toast, { Toaster } from "react-hot-toast";
import { convertToTimezone, tableToExcel, getTableShimmer } from '../../../helper/common';
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "datatables.net-bs5";
import 'datatables.net';
import $ from "jquery";
import { CiEdit } from "react-icons/ci";
import { Link, useNavigate } from 'react-router-dom'; // Assuming you're using react-router-dom
// import { rolesList } from '../../services/Role-service';

// import { csrPdBudgetList, fetchAmendmentListApi ,budgetTransferDeleteApi} from '../../services/Budget-service';
import { IoDocumentText } from "react-icons/io5";
import { FaFileExport } from 'react-icons/fa';
import { userDetails } from '../../../auth/auth';
import { AiOutlineEye } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { getAuthToken } from "../../../services/Helper";


export default function BudgetTransferRejectList() {


  const navigate = useNavigate();
     
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
  
      return $("#list_table3").DataTable({
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
            json.data = json.data.filter(row => row.tbtm_status === "reject"); // Keep only approved rows
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
            className:"text-start",
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
                    onClick={() => handleViewBudgetTransferReject(rowdata)}
                  >
                    {`${
                rowdata?.tfin_year_label
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
            className:"text-dot",
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
            className:"text-dot",
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
            className:"text-dot",
            // render: function (data, type, full, meta) {
            //   return data && typeof data === "string" ? data.toUpperCase() : data;
            // },
            searchable: true,
            orderable: true,
          },
          {
            name: "to_budget_type",
            data: "to_budget_type",
            className:"text-dot",
            // render: function (data, type, full, meta) {
            //   return data && typeof data === "string" ? data.toUpperCase() : data;
            // },
            searchable: true,
            orderable: true,
          },
          
          {
            name: "tbad_amount",
            data: "tbad_amount",
            className:"text-dot",
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
            className:"text-dot",
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
            className:"text-dot",
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
  
      initListDatatable(my_url);
  
  
    }, []);

    const viewBudgetTransferDetails = (rowdata) => {
  
      navigate(`/admin/budget_shuffling/budget-transfer-view/${rowdata.tbtm_id}?not_type=budget_shuffling`);
  
    };
    const handleViewBudgetTransferReject = (rowdata) => {
  
      navigate(`/admin/budget_shuffling/budget-transfer-view/${rowdata.tbtm_id}?not_type=budget_shuffling`);
  
    };
  
    
  return (
    <>
    
    <div className="table-responsive">
                      <table className="table table-bordered dataTable" id="list_table3">
                        <thead>
                          <tr>
                            <th className="text-start" style={{width:'5%'}}>Sl</th>
                            <th>Unique ID</th>
                            <th>FY</th>
                            <th>Transaction Id</th>
                            <th>Transfer From</th>
                            <th>Transfer To</th>
                            <th>Amount  (₹)</th>
                            <th>Status</th>
                            <th>Created By</th>
                            <th>Created At</th>
                            <th className="text-center" style={{width:'5%'}}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
  
                        </tbody>
                      </table>
                    </div>
    
    </>
  )
}

