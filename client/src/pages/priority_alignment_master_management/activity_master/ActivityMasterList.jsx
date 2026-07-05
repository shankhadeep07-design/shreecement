import $ from 'jquery';
import { useEffect, useState } from 'react';
import { Modal } from "react-bootstrap";
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import ReactDOM from "react-dom/client";
import { Toaster } from 'react-hot-toast';
import { FaFileExport } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getMyModulePermissionFun, getTableShimmer } from "../../../helper/common.js";
import { getAuthToken, tableToExcel } from "../../../services/Helper.js";
import { getExcelExportActivityList } from '../../../services/PriorityAlignment-service.js';
import { AddEditActivity } from './AddEditActivity.jsx';
import { statusChange } from '../../../Services/Master-service.js';

const ActivityMasterList = () => {
    const [showModal, setShowModal] = useState(false);
    let [editActivity, setEditActivity] = useState("#ffffff");

    let datatable_url = `${import.meta.env.VITE_API_URL}/admin/priority-alignment/activity-master-list/datatable`;
    const [permissions, setPermissions] = useState([]);
    const [exportsLists, setExportsLists] = useState([]);
    useEffect(() => {
        getMyModulePermissionFun('activities')
            .then((module) => {
                setPermissions(module);
            })
            .catch((error) => {
                console.error('Error fetching module permissions:', error);
            });

    }, [])

    const changeModalStatus = (id, status) => {

        setShowModal({
            ...showModal,
            [id]: status,
        });
    };

    const addFun = () => {
        setEditActivity("");
        changeModalStatus("user_update_modal", true);
    };

    const editFun = (data) => {
        setEditActivity(data);

        changeModalStatus("user_update_modal", true);
    };
   const handleStatusChange = async (pk, newStatus) => {
        try {
            const payload = {
                table: 't_activity_master',
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

    const initiatedActivityDatatable = () => {
        var i = 1;
        var authToken = getAuthToken();
        var my_url = `${import.meta.env.VITE_API_URL}/admin/priority-alignment/activity-master-list/datatable`;
        if ($.fn.DataTable.isDataTable("#initiated-Activity-datatable")) {
            $("#initiated-Activity-datatable").DataTable().destroy();
        }
        $("#initiated-Activity-datatable").DataTable({
            order: [[1, "asc"]],
            dom: "<'d-flex justify-content-between align-items-center mb-2'<'d-flex align-items-center'l><'d-flex'f>>" +
                "<'row table-responsive'<'col-sm-12'tr>>" +
                "<'row mt-2'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 d-flex justify-content-end'p>>",
            language: {
                lengthMenu: "_MENU_"
            },
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
            language: {
                loadingRecords: function () {
                    return getTableShimmer(5, 8)
                }
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
                    name: "tschm_schedule_name",
                    data: "tschm_schedule_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tsubshcm_sub_schedule_name",
                    data: "tsubshcm_sub_schedule_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tactm_activity_name",
                    data: "tactm_activity_name",
                    searchable: true,
                    orderable: true,
                },
                 {
                    name: "tactm_is_active",
                    data: "tactm_is_active",
                    searchable: false,
                    orderable: false,
                    render: function (data, type, row) {

                        // data === row.tsl_is_active
                        const isChecked = data === true ? 'checked' : '';

                        return `
                <i class="fas fa-edit text-primary edit-icon"
                   style="cursor:pointer; margin-right:10px;"
                   title="Edit"
                   data-id="${row.tactm_activity_id}">
                </i>

                <div class="form-check form-switch d-inline-block"
                     style="vertical-align: middle;">
                    <input class="form-check-input toggle-switch"
                           type="checkbox"
                           id="toggleSwitch_${row.tactm_activity_id}"
                           data-id="${row.tactm_activity_id}"
                          
                           ${isChecked}  data-table="t_activity_master"   >
                </div>
            `;
                    }
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
                { targets: '_all', className: 'dt-center' },
                {
                    name: 'Action',
                    targets: [5],
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
                                        title="Action">
                                        <i className="fa fa-ellipsis-h" aria-hidden="true"></i>
                                    </button>

                                    <ul className="dropdown-menu">
                                        {
                                            (permissions?.indexOf('edit') > -1) &&
                                            <li>
                                                <button
                                                    className="dropdown-item"
                                                    href="javascript:void(0)"

                                                    onClick={() => editFun(record)}
                                                >
                                                    <span style={{ marginRight: "5px" }}>
                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                    </span>
                                                    <span>
                                                        Edit Activity
                                                    </span>
                                                </button>
                                            </li>
                                        }
                                    </ul>

                                </div>
                            </>
                        );
                    },
                },
            ]
        });
    };

    useEffect(() => {
        if (permissions.indexOf('list') > -1) {
            initiatedActivityDatatable();
        }

    }, [permissions]);


    const getAllExportData = () => {
        getExcelExportActivityList().then((response) => {
            setExportsLists(response.data);
        }).catch((error) => {
            toast.error(
                error?.response?.data?.originalError || error?.response?.data?.message
            );
        });
    };

    useEffect(() => {
        if (exportsLists.length > 0) {
            tableToExcel("new-table", "Activity List"); // Trigger export once data is set
        }
    }, [exportsLists]);


    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{ duration: 2000 }}
                reverseOrder={false}></Toaster>

            <span className="position-absolute trigger"></span>

            <div className="home-content">
                <div className="card pb-3">
                    <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
                        <h5 className="mb-0 float-left">
                            Activity List
                        </h5>
                        <div className="float-right">
                            {
                                (permissions?.indexOf('add') > -1) &&
                                <button
                                    type="button"
                                    style={{ marginRight: "10px" }}
                                    className="btn btn-sm btn-dark"

                                    onClick={() => addFun()}
                                >
                                    <i className="fa-solid fa-plus"></i> Add Activity

                                </button>
                            }
                            {
                                (permissions?.indexOf('export') > -1) &&
                                <button
                                    className="btn btn-success btn-sm"
                                    style={{ marginLeft: "10px" }}
                                    onClick={() => getAllExportData()}
                                >
                                    <FaFileExport /> Export
                                </button>
                            }


                        </div>
                    </div>
                    <div className="card-body at-elevation-z6 table-box" style={{ maxHeight: "calc(100vh - 23vh);", overflowX: 'auto' }}>
                        <div className="collapse" id="collapseExample">
                            <div className="">

                            </div>
                        </div>

                        <div className="initiated-Activity-table-container">
                            <div className="mt-2 table table-bordered">
                                <div>
                                    {(permissions.indexOf('list') > -1) ?
                                        <table id="initiated-Activity-datatable" className="table table-bordered dataTable">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Schedule Vii Name</th>
                                                    <th>Sub Schedule Name</th>
                                                    <th>Activity Name</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                        </table>
                                        :
                                        <>
                                            <tr>
                                                <td colSpan={4} className='text-center'>You don't have any permissions</td>
                                            </tr>
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="allModals">
                    {/* Update User Modal Start */}
                    <Modal
                        show={showModal.user_update_modal}
                        onHide={() => changeModalStatus("user_update_modal", false)}
                        size="lg"
                        backdrop="static"
                        centered
                        id="user_update_modal"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>{editActivity == '' ? 'Add Activity' : 'Update Activity'}</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <AddEditActivity
                                changeModalStatus={changeModalStatus}
                                editActivity={editActivity}
                                initiatedActivityDatatable={initiatedActivityDatatable}
                                datatable_url={datatable_url}
                            />
                        </Modal.Body>
                    </Modal>
                    {/* Update User Modal End */}
                </div>

            </div>
            <div style={{ display: 'none' }}>
                <table id='new-table' style={{ fontSize: '9pt' }} className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Serial No</th>
                            <th>Schedule Seven Name</th>
                            <th>Sub Schedule Name</th>
                            <th>Activity Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            exportsLists.map((data, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{data?.tschm_schedule_name}</td>
                                    <td>{data?.tsubshcm_sub_schedule_name}</td>
                                    <td>{data?.tactm_activity_name}</td>
                                </tr>
                            ))
                        }

                    </tbody>
                </table>
            </div>
        </>
    )
}

export default ActivityMasterList;
