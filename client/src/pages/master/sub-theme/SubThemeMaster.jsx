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


// import { AddSubTheme } from './AddSubTheme.jsx';
import { statusChange } from '../../../Services/Master-service.js';
import { AddSubTheme } from "../sub-theme/AddSubTheme";

// import { getExcelExportThemeList } from '../../../Services/Theme-service';

import { getExcelExportSubScheduleSevenList } from '../../../services/PriorityAlignment-service.js';

export const SubThemeMaster = () => {
    const [showModal, setShowModal] = useState(false);
    let [editState, setEditState] = useState(null);
    let datatable_url = `${import.meta.env.VITE_API_URL}/admin/masters/sub-schedule-seven-master-list/datatable`;
    const [permissions, setPermissions] = useState([])
    const [exportsLists, setExportsLists] = useState([]);

    const [toBeFilterData, setToBeFilterData] = useState({
        tproj_id: "",
    });

    useEffect(() => {
        getMyModulePermissionFun('sub_theme_list')
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
                table: 't_sub_schedule_master',        // ✅ updated table name
                pk: pk,
                status: newStatus ? 1 : 0
            };
            const res = await statusChange(payload);
            if (res?.status === true) {
                toast.success(res?.message || "Status updated successfully");
            } else {
                throw new Error(res?.message || "Update failed");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update status");
            throw error;
        }
    };

    useEffect(() => {
        const onToggleChange = async (e) => {
            if (!e.target.classList.contains("toggle-switch")) return;
            const checkbox = e.target;
            const pk = checkbox.dataset.id;
            const newStatus = checkbox.checked;
            const prevState = !newStatus;
            try {
                await handleStatusChange(pk, newStatus);
            } catch (err) {
                checkbox.checked = prevState;
            }
        };
        document.addEventListener("change", onToggleChange);
        return () => {
            document.removeEventListener("change", onToggleChange);
        };
    }, []);

    const initiatedStateDatatable = () => {
        var authToken = getAuthToken();
        var my_url = `${import.meta.env.VITE_API_URL}/admin/priority-alignment/sub-schedule-seven-master-list/datatable`;

        if ($.fn.DataTable.isDataTable("#initiated-State-datatable")) {
            $("#initiated-State-datatable").DataTable().destroy();
        }

        $("#initiated-State-datatable").DataTable({
            order: [[1, "asc"]],
            dom:
                "<'d-flex justify-content-between align-items-center mb-2'<'d-flex align-items-center'l><'d-flex'f>>" +
                "<'row table-responsive'<'col-sm-12'tr>>" +
                "<'row mt-2'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 d-flex justify-content-end'p>>",
            language: {
                lengthMenu: "_MENU_"
            },
            ajax: {
                url: my_url,
                type: "POST",
                data: function (d) {
                    d.filterParams = toBeFilterData;
                },
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", `Bearer ${authToken}`);
                },
            },
            processing: false,
            serverSide: true,
            language: {
                loadingRecords: function () {
                    return getTableShimmer(5, 8);
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
                    render: (data) => data ?? "-",
                },
                {
                    name: "tsubshcm_sub_schedule_name",
                    data: "tsubshcm_sub_schedule_name",
                    render: (data) => data ?? "-",
                },
                {
                    name: "tsubshcm_desc",
                    data: "tsubshcm_desc",
                    render: (data) => data ?? "-",
                },
                {
                    name: "tsthm_is_active",
                    data: "tsubshcm_is_active",
                    searchable: false,
                    orderable: false,
                    render: function (data, type, row) {
                        const isChecked = data === true ? 'checked' : '';
                        return `
                            <div class="form-check form-switch d-inline-block">
                                <input class="form-check-input toggle-switch"
                                       type="checkbox"
                                       id="toggleSwitch_${row.tsubshcm_sub_schedule_id}"
                                      data-id="${row.tsubshcm_sub_schedule_id}"
                                       ${isChecked}
                                      data-table="t_sub_schedule_master">
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
                }
            ],

            columnDefs: [
                { targets: '_all', className: 'dt-center' },
                {
                    name: 'Action',
                    targets: [5],                   // ✅ updated target index
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
                                            // (permissions?.indexOf('edit') > -1) &&
                                            <li>
                                                <button
                                                    className="dropdown-item"
                                                    href="javascript:void(0)"
                                                    onClick={() => editFun(record)}
                                                >
                                                    <span style={{ marginRight: "5px" }}>
                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                    </span>
                                                    <span>Edit Sub-theme</span>
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
        initiatedStateDatatable();
    }, [permissions]);

    const getAllExportData = () => {
        getExcelExportSubScheduleSevenList()               // ✅ updated API call
            .then((response) => {
                setExportsLists(response.data);
            })
            .catch((error) => {
                toast.error(
                    error?.response?.data?.originalError || error?.response?.data?.message
                );
            });
    };

    useEffect(() => {
        if (exportsLists.length > 0) {
            tableToExcel("new-table", "Sub-theme List");
        }
    }, [exportsLists]);

    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{ duration: 2000 }}
                reverseOrder={false}
            />

            <span className="position-absolute trigger"></span>

            <div className="home-content">
                <div className="card pb-3">
                    <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
                        <h5 className="mb-0 float-left">Sub-theme List</h5>
                        <div className="float-right">
                            <button
                                type="button"
                                style={{ marginRight: "10px" }}
                                className="btn btn-sm btn-dark"
                                onClick={() => addFun()}
                            >
                                <i className="fa-solid fa-plus"></i> Add Sub-theme
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

                    <div className="card-body at-elevation-z6 table-box" style={{ maxHeight: "calc(100vh - 23vh)", overflowX: 'auto' }}>
                        <div className="initiated-State-table-container">
                            <div className="mt-2 table table-bordered">
                                <table id="initiated-State-datatable" className="table table-bordered dataTable">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Thematic Area (Schedule VII Item No)</th>
                                            <th>Sub-theme Name</th>
                                            <th>Description</th>          {/* ✅ */}
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                </table>
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
                            <Modal.Title>
                                {editState == '' ? 'Add Sub-theme' : 'Update Sub-theme'}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <AddSubTheme
                                changeModalStatus={changeModalStatus}
                                editState={editState}
                                initiatedStateDatatable={initiatedStateDatatable}
                                datatable_url={datatable_url}
                            />
                        </Modal.Body>
                    </Modal>
                </div>
            </div>

            {/* Export Table */}
            <div style={{ display: "none" }}>
                <table id="new-table" style={{ fontSize: "9pt" }} className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Serial No</th>
                            <th>Thematic Area (Schedule VII Item No)</th>
                            <th>Sub-theme Name</th>
                            <th>Description</th>        {/* ✅ */}
                        </tr>
                    </thead>
                    <tbody>
                        {exportsLists?.map((data, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{data?.tschm_schedule_name ?? "-"}</td>
                                <td>{data?.tsubshcm_sub_schedule_name ?? "-"}</td>
                                <td>{data?.tsubshcm_desc ?? "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};
