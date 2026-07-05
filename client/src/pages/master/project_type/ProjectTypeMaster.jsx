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
// import { getExcelExportProjectTypeList } from '../../../Services/State-service.js';

import { getExcelExportProjectTypeList } from '../../../Services/Project-type-service';

import { AddEditProjectType } from './AddEditProjectType.jsx';
import { statusChange } from '../../../Services/Master-service.js';

export const ProjectTypeMaster = () => {
    const [showModal, setShowModal] = useState(false);
    let [editState, setEditState] = useState("#ffffff");
    let datatable_url = `${import.meta.env.VITE_API_URL}/admin/masters/states/datatable`;
    const [permissions, setPermissions] = useState([])
    const [exportsLists, setExportsLists] = useState([]);

    const [toBeFilterData, setToBeFilterData] = useState({
        tproj_id: "",
    });
    useEffect(() => {
        getMyModulePermissionFun('state')
            .then((module) => {
                setPermissions(module);
            })
            .catch((error) => {
                console.error('Error fetching module permissions:', error);
            });

        setTimeout(() => {
            // setLoading(false);
        }, 2000)
    }, [])

    const changeModalStatus = (id, status) => {

        setShowModal({
            ...showModal,
            [id]: status,
        });
    };

    const addFun = () => {
        setEditState("");
        changeModalStatus("user_update_modal", true);
    };

    const editFun = (data) => {
        setEditState(data);

        changeModalStatus("user_update_modal", true);
    };


    const handleStatusChange = async (pk, newStatus) => {
        try {
            const payload = {
                table: 't_project_type',
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


    const initiatedStateDatatable = () => {
        var i = 1;
        var authToken = getAuthToken();
        var my_url = `${import.meta.env.VITE_API_URL}/admin/masters/project-type/datatable`;

        if ($.fn.DataTable.isDataTable("#initiated-State-datatable")) {
            $("#initiated-State-datatable").DataTable().destroy();
        }
        $("#initiated-State-datatable").DataTable({
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
                data: function (d) {
                    // Additional data to be sent to the server
                    d.filterParams = toBeFilterData; // You can add more parameters as needed
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
                    name: "tprj_project_type_name",
                    data: "tprj_project_type_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tprj_desc",
                    data: "tprj_desc",
                    searchable: true,
                    orderable: true,
                },

                {
                    name: "tprj_is_active",
                    data: "tprj_is_active",
                    searchable: false,
                    orderable: false,
                    render: function (data, type, row) {

                        // data === row.tsl_is_active
                        const isChecked = data === true ? 'checked' : '';

                        return `
                <i class="fas fa-edit text-primary edit-icon"
                   style="cursor:pointer; margin-right:10px;"
                   title="Edit"
                   data-id="${row.tprj_id}">
                </i>

                <div class="form-check form-switch d-inline-block"
                     style="vertical-align: middle;">
                    <input class="form-check-input toggle-switch"
                           type="checkbox"
                           id="toggleSwitch_${row.tprj_id}"
                           data-id="${row.tprj_id}"
                          
                           ${isChecked}  data-table="t_project_type"   >
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
                    targets: [4],
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
                                            // (permissions?.indexOf('edit') > -1 || permissions == "*") &&
                                            <li>
                                                <button
                                                    className="dropdown-item"
                                                    href="javascript:void(0)"

                                                    onClick={() => editFun(record)}
                                                >
                                                    <span style={{ marginRight: "5px" }}>
                                                        <i class="fa-solid fa-pen-to-square"></i>
                                                    </span>
                                                    <span>
                                                        Edit Project Type
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
        // if (permissions.indexOf('list') > -1) {
        initiatedStateDatatable();
        // }

    }, [permissions]);

    const getAllExportData = () => {
        getExcelExportProjectTypeList().then((response) => {
            setExportsLists(response.data);
        }).catch((error) => {
            toast.error(
                error?.response?.data?.originalError || error?.response?.data?.message
            );
        });
    };

    useEffect(() => {
        if (exportsLists.length > 0) {
            tableToExcel("new-table", "Project Type List"); // Trigger export once data is set
        }
    }, [exportsLists]);



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
                            Project Type List
                        </h5>

                        <div className="float-right">
                            {
                                // (permissions?.indexOf('add') > -1) &&
                                <button
                                    type="button"
                                    style={{ marginRight: "10px" }}
                                    className="btn btn-sm btn-dark"

                                    onClick={() => addFun()}
                                >
                                    <i class="fa-solid fa-plus"></i> Add Project Type

                                </button>
                            }
                            {

                                // (permissions?.indexOf('export') > -1) &&

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
                        <div class="collapse" id="collapseExample">
                            <div class="">

                            </div>
                        </div>

                        <div className="initiated-State-table-container">
                            <div className="mt-2 table table-bordered">
                                <div>

                                    {
                                        // (permissions.indexOf('list') > -1) ?
                                        <table id="initiated-State-datatable" className="table table-bordered dataTable">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Type Name</th>
                                                    <th>Description</th>
                                                    <th>Status</th>

                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                        </table>
                                        // :
                                        // <>
                                        //     <tr>
                                        //         <td colSpan={3} className='text-center'>You don't have any permissions</td>
                                        //     </tr>
                                        // </>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="allModals">
                    <Modal
                        show={showModal.user_update_modal}
                        onHide={() => changeModalStatus("user_update_modal", false)}
                        size="md"
                        backdrop="static"
                        centered
                        id="user_update_modal"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>{editState == '' ? 'Add Project Type' : 'Update Project Type'}</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <AddEditProjectType
                                changeModalStatus={changeModalStatus}
                                editState={editState}
                                initiatedStateDatatable={initiatedStateDatatable}
                                datatable_url={datatable_url}
                            />
                        </Modal.Body>
                    </Modal>
                </div>

            </div>

            <div style={{ display: "none" }}>
                <table
                    id="new-table"
                    style={{ fontSize: "9pt" }}
                    className="table table-striped table-hover"
                >
                    <thead>
                        <tr>
                            <th>Serial No</th>
                            <th>Project Type Name</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exportsLists?.map((data, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{data?.tprj_project_type_name || ""}</td>

                                <td>{data?.tprj_desc || ""}</td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}
