import 'datatables.net';
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import $ from "jquery";
import { useEffect, useState } from 'react';
import ReactDOM from "react-dom/client";
import { FaFileExport } from "react-icons/fa";
import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router-dom
import { getMyModulePermissionFun, getTableShimmer, tableToExcel } from '../../helper/common';
import { getExcelExportProposalList } from '../../services/Proposal-service.js';


import { Toaster } from 'react-hot-toast';
import { toast } from 'react-toastify';



import { getAuthToken } from "../../services/Helper";
import ProposalAddUpdateModal from './ProposalAddUpdateModal';
const ProposalList = () => {
  var my_url = `${import.meta.env.VITE_API_URL}/admin/proposals/datatable`;
  const [modulePermissions, setModulePermissions] = useState([]);
  const [permissions, setPermissions] = useState([])
  const [exportsLists, setExportsLists] = useState([]);

  useEffect(() => {

    getMyModulePermissionFun('csr_pd_project')
      .then((module) => {
        // console.log(module);
        setModulePermissions(module);
      })
      .catch((error) => {
        console.error('Error fetching module permissions:', error);
      });

  }, []);

  const navigate = useNavigate();
  const [modalKey, setModalKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [details, setDetails] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [closureId, setClosureId] = useState('');
  const [mode, setMode] = useState('');
  // let { loading, setLoading } = useLoading();
  const [toBeFilterData, setToBeFilterData] = useState({
    tproj_id: "",
  });
  const [dataArray, setDataArray] = useState([]);
  const [csrPDList, setCsrPDList] = useState([]);
  const handleRoleAddModel = (project_details) => {
    setPaymentId('');
    setMode('add');
    setModalKey(prevKey => prevKey + 1);
    setShowModal(true);
    setDetails('');
  };
  const closeModal = () => {
    setShowModal(false);
  };
  const viewFun = (data) => {
    window.open(
      `${import.meta.env.VITE_HOME_PAGE}/admin/proposal/proposal_details/${data.tpros_id}`,
      "_blank"
    );
  }

  const editFun = (data) => {
    setModalKey(prev => prev + 1); // force remount
    setDetails(data);
    changeModalStatus("user_update_modal", true);
  };


  const maxBufferSize = 10;
  const initListDatatable = (my_url) => {
    // var i = 1;
    var authToken = getAuthToken();
    return $("#list_csr_project_table").DataTable({
      order: [[1, "desc"]],
      pageLength: 10, // default selected value
      lengthMenu: [10, 20, 50, 100], // 👈 THIS is missing
      dom: "<'d-flex justify-content-between align-items-center mb-2'<'d-flex align-items-center'l><'d-flex'f>>" +
        "<'row'<'col-sm-12 plot-list-table-container'tr>>" +
        "<'row mt-2'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 d-flex justify-content-end'p>>",
      ajax: {
        url: my_url,
        type: "POST",
        data: function (d) {
          d.filterParams = toBeFilterData || {}; // You can add more parameters as needed
        },
        beforeSend: function (request) {
          // setLoading(true);
          // i = 1;
          setDataArray([]);
          request.setRequestHeader("Authorization", `Bearer ${authToken}`);
        },
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
      },
      drawCallback: function (settings) {
        // setLoading(false);  // Stop loading state after the table is drawn
      },
      columns: [


        {
          name: "id",
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
          name: "tpros_proposal_name",
          data: "tpros_proposal_name",

          searchable: true,
          orderable: true,
        },

        {
          name: "tfy_year_label",
          data: "tfy_year_label",

          searchable: true,
          orderable: true,
        },

        {
          name: "tpros_status",
          data: "tpros_status",

          searchable: true,
          orderable: true,
        },
        {
          name: "action",
          data: "action",
          searchable: false,
          orderable: false,
          defaultContent: ""
        },

      ],
      columnDefs: [
        { targets: "_all", className: 'dt-center1' },
        {
          name: "Action",
          targets: [4],
          className: 'text-center',
          createdCell: (td, celldata, rowdata) => {
            const { tproj_id, tpros_status } = rowdata;
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
                    title="Action">
                    <i className="fa fa-ellipsis-h" aria-hidden="true"></i>
                  </button>

                  <ul className="dropdown-menu">
                    {/* {
                                    (permissions?.indexOf('edit') > -1 || permissions == "*") && */}
                    {

                      // (tpros_status != 'approved' || tpros_status === 'send_for_approval') &&
                      <li>
                        <button
                          className="dropdown-item"
                          href="javascript:void(0)"

                          onClick={() => editFun(rowdata)}
                        >
                          <span style={{ marginRight: "5px" }}>
                            <i className="fa-solid fa-pen-to-square"></i>
                          </span>
                          <span>
                            Edit
                          </span>
                        </button>
                      </li>

                    }
                    {/* } */}

                    <li>
                      <button
                        className="dropdown-item"
                        href="javascript:void(0)"

                        onClick={() => viewFun(rowdata)}
                      >
                        <span style={{ marginRight: "5px" }}>
                          <i
                            className="fa-solid fa-eye"
                            style={{ cursor: "pointer" }}
                          ></i>

                        </span>
                        <span>
                          View
                        </span>
                      </button>
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
    var my_url = `${import.meta.env.VITE_API_URL}/admin/proposals/datatable`;

    var dataTable = initListDatatable(my_url);
    return () => {
      if (dataTable)
        dataTable.destroy();
    }
  }, []);


  const addFun = () => {
    setModalKey(prev => prev + 1); // force remount
    setDetails(null); // clear old edit data
    changeModalStatus("user_update_modal", true);
  };

  const changeModalStatus = (id, status) => {

    setShowModal({
      ...showModal,
      [id]: status,
    });
  };

  const getAllExportData = () => {
    getExcelExportProposalList().then((response) => {
      setExportsLists(response.data);
    }).catch((error) => {
      toast.error(
        error?.response?.data?.originalError || error?.response?.data?.message
      );
    });
  }



  useEffect(() => {
    if (exportsLists.length > 0) {
      tableToExcel("new-table", "Proposal List"); // Trigger export once data is set
    }
  }, [exportsLists]);

  //----------------------Transfer Modal Part -----------------------




  return (
    <>

      <div className="home-content">
        <div className="card pb-3">

          <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
            <h5 className="mb-0 float-left">Proposal List</h5>


            <div className="float-right">
              {/* { 
                                                     (permissions?.indexOf('add') > -1) &&
                                                     */}
              <button
                type="button"
                style={{ marginRight: "10px" }}
                className="btn btn-sm btn-dark"

                onClick={() => addFun()}
              >
                <i class="fa-solid fa-plus"></i> Add Proposal

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

          <div className="card-body">
            <div className="table-responsive">
              {/* {
                                            (modulePermissions?.indexOf('list') > -1) ? */}
              <table className="table text-nowrap table-bordered" id="list_csr_project_table">
                <thead>
                  <tr>
                    <th className="text-start" style={{ width: '5%' }}>Sl</th>
                    <th>Proposal Name</th>
                    <th>FY</th>


                    <th>Status</th>
                    <th className="text-center" style={{ width: '5%' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* </div> */}
      <div>

        <div className="allModals">
          {showModal?.user_update_modal && (<ProposalAddUpdateModal key={modalKey} details={details} showModal={showModal} changeModalStatus={changeModalStatus} my_url={my_url} initListDatatable={initListDatatable} />)}
        </div>

      </div>
      <div style={{ display: 'none' }}>
        <table id='new-table' className="table">
          <thead>
            <tr>
              <th>Sl</th>
              <th>Proposal Name</th>
              <th>FY</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {exportsLists.map((row, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{row.tpros_proposal_name}</td>
                <td>{row.tfy_year_label}</td>
                <td>{row.tpros_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>




    </>
  )
}

export default ProposalList;