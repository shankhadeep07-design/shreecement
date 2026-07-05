import 'datatables.net';
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import $ from "jquery";
import { useEffect, useState } from 'react';
import ReactDOM from "react-dom/client";
import { CiEdit } from "react-icons/ci";
import { getMyModulePermissionFun, getTableShimmer, tableToExcel } from '../../helper/common';
// import { fetchAllUserList } from '../../../services/User-service';
import { FaFileExport } from 'react-icons/fa';
import { getAuthToken } from '../../services/Helper';
import { fetchAllUserList } from '../../services/User-service';
import UserAddModel from './UserAddModel';
import { statusChange } from '../../Services/Master-service.js';

import { Toaster } from 'react-hot-toast';
import { toast } from 'react-toastify';



export const UsersList = () => {


  const [modulePermissions, setModulePermissions] = useState([]);

  const [details, setDetails] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [exportUsersList, setExportsUsersLists] = useState([])

  const handleUserAddModel = (project_details) => {
    setShowModal(true);
    setDetails(null);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handelUserDetails = (data) => {
    // console.log(data);
    setDetails(data);
    setShowModal(true);
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
  // Define the maximum buffer size (in your case, 10)
  const maxBufferSize = 10;




  const handleStatusChange = async (pk, newStatus) => {
    try {
      const payload = {
        table: 'users',
        pk: pk,
        status: newStatus ? 1 : 0   // or true/false based on backend
      };

      const res = await statusChange(payload);
      if (res?.status === true) {
        toast.success(res?.message || "Status updated successfully");
      } else {
        throw new Error(res?.message || "Update failed");
      }


    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update status"
      );
      throw error; // important for revert
    }
  };

  useEffect(() => {

    const onToggleChange = async (e) => {
      if (!e.target.classList.contains("toggle-switch")) return;

      const checkbox = e.target;
      const pk = checkbox.dataset.id;
      const newStatus = checkbox.checked;

      // save previous state (for revert)
      const prevState = !newStatus;

      try {
        await handleStatusChange(pk, newStatus);
      } catch (err) {
        // revert if API fails
        checkbox.checked = prevState;
      }
    };
    document.addEventListener("change", onToggleChange);
    return () => {
      document.removeEventListener("change", onToggleChange);
    };
  }, []);


  const initListDatatable = (my_url) => {
    // var i = 1;
    var authToken = getAuthToken();
    // console.log(authToken);
    return $("#list_table").DataTable({
      order: [[1, "asc"]],
      dom: "<'d-flex justify-content-between align-items-center mb-2'<'d-flex align-items-center'l><'d-flex'f>>" +
        "<'row'<'col-sm-12 plot-list-table-container'tr>>" +
        "<'row mt-2'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 d-flex justify-content-end'p>>",
      buttons: [
        {
          text: 'Export Excel',
          className: "btn-light",
          action: function (e, dt, node, config) {
            tableToExcel('list_table', 'Project List')
          }
        }
      ],
      // scrollX: true,
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
          className: "text-center",
          searchable: false,
          orderable: false,
        },
        {
          name: "name",
          data: "name",
          className: "text-center",
          searchable: true,
          orderable: true,
        },

        {
          name: "trl_role_name",
          data: "trl_role_name",
          className: "text-center",

          searchable: true,
          orderable: true,
        },
        {
          name: "email",
          data: "email",
          className: "text-center",
          searchable: true,
          orderable: true,
        },
        {
          name: "phone",
          data: "phone",
          className: "text-center",
          searchable: true,
          orderable: true,
        },
        // {
        //   name: "status",
        //   data: "status",
        //   className: "text-center",
        //   searchable: true,
        //   orderable: true,
        // },

        {
          name: "status",
          data: "status",
          searchable: false,
          orderable: false,
          render: function (data, type, row) {

            const isChecked = data === 'active' ? 'checked' : '';

            return `
                <i class="fas fa-edit text-primary edit-icon"
                   style="cursor:pointer; margin-right:10px;"
                   title="Edit"
                   data-id="${row.id}">
                </i>

                <div class="form-check form-switch d-inline-block"
                     style="vertical-align: middle;">
                    <input class="form-check-input toggle-switch"
                           type="checkbox"
                           id="toggleSwitch_${row.id}"
                           data-id="${row.id}"

                           ${isChecked}  data-table="users"   >
                </div>
            `;
          }
        },
        {
          data: "action",
          searchable: false,
          orderable: false,
          defaultContent: "",
        },

      ],
      columnDefs: [

        {
          name: "Action",
          targets: [6],
          className: 'text-center',
          createdCell: (td, celldata, rowdata) => {
            const { tproj_id } = rowdata;
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
                    {
                      (modulePermissions?.indexOf('edit') > -1) &&
                      <li>
                        <a
                          className="dropdown-item"
                          href="#"
                          onClick={() => handelUserDetails(rowdata)}>
                          <span style={{ marginRight: "5px" }}>
                            <CiEdit />
                          </span>
                          <span>Edit</span>
                        </a>
                      </li>

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
    var my_url = `${import.meta.env.VITE_API_URL}/admin/users/datatable/list`;
    if (modulePermissions.indexOf('list') > -1) {
      initListDatatable(my_url);
    }
  }, [modulePermissions]);


  // useEffect(() => {

  //     var my_url = "";
  //     if (get_project_id != null) {
  //         my_url = `${import.meta.env.VITE_API_URL}/admin/users/datatable/${atob(get_project_id)}`;
  //     } else {
  //         my_url = `${import.meta.env.VITE_API_URL}/admin/users/datatable/list`;
  //     }
  //     var dataTable = initListDatatable(my_url);
  //     return () => {
  //         if(dataTable)
  //             dataTable.destroy();
  //     }

  // }, []);


  // -----------------------  Datatable End -------------------------------------------


  useEffect(() => {

    getMyModulePermissionFun('users')
      .then((module) => {
        // console.log(module);
        setModulePermissions(module);
      })
      .catch((error) => {
        console.error('Error fetching module permissions:', error);
      });

  }, []);

  const getAllExportData = () => {
    fetchAllUserList().then((response) => {
      // console.log(response);
      setExportsUsersLists(response?.data);
    });
  }

  useEffect(() => {
    if (exportUsersList.length > 0) {
      tableToExcel('new-table', 'Users List'); // Trigger export once data is set
    }
  }, [exportUsersList]);




  return (
    <>
      {/* <div className="d-sm-flex d-block align-items-center justify-content-between page-header-breadcrumb">
        <h4 className="fw-medium mb-0">User</h4>
        <div className="ms-sm-1 ms-0">
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">User</li>
              <li className="breadcrumb-item active" aria-current="page">list</li>
            </ol>
          </nav>
        </div>
      </div> */}
      <Toaster
        position="top-center"
        toastOptions={{ duration: 2000 }}
        reverseOrder={false}></Toaster>
      <div className="main-content app-content">
        <div className="container-fluid">
          <div className="row">
            <div className="home-content">
              <div className="card pb-3">
                <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
                  <h5 className="mb-0 float-left">
                    User List
                  </h5>
                  <div>
                    {
                      (modulePermissions.indexOf('add') > -1) &&
                      <button onClick={handleUserAddModel} className='btn btn-sm btn-dark py-1'><i className="fa-solid fa-plus"></i> Add</button>
                    }
                    {
                      (modulePermissions.indexOf('export') > -1) &&
                      <button className='btn btn-success btn-sm' style={{ marginLeft: '10px' }} onClick={() => getAllExportData()}><FaFileExport /> Export</button>
                    }
                  </div>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table text-nowrap table-bordered" id="list_table">
                      <thead>
                        <tr>
                          <th>Sl</th>
                          <th>Name</th>
                          {/* <th>Type</th> */}
                          <th>Role</th>
                          <th>Email</th>
                          <th>Mobile No</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={9} className='text-center'>You don't have any permissions</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div>
            {
              showModal ? (
                <>
                  <UserAddModel show={showModal} onClose={closeModal} details={details} initListDatatable={initListDatatable} />
                </>
              ) : null
            }

          </div>

        </div>
      </div>

      <div style={{ display: 'none' }}>
        <table id='new-table' style={{ fontSize: '9pt' }} className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Serial No</th>
              <th>Name</th>
              <th>Role</th>
              <th>Email</th>
              <th>Mobile No</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {
              exportUsersList.map((data, index) => (

                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{data?.name}</td>
                  <td>{data?.trl_role_name}</td>
                  <td>{data?.email}</td>
                  <td>{data?.phone}</td>
                  <td>{data?.status}</td>
                </tr>
              ))
            }

          </tbody>
        </table>
      </div>
    </>
  )
}
