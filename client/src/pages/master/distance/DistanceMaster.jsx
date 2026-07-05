import $ from 'jquery';
import { useEffect, useState } from 'react';
import { Modal } from "react-bootstrap";
import 'react-confirm-alert/src/react-confirm-alert.css';
import ReactDOM from "react-dom/client";
import { Toaster } from 'react-hot-toast';
import { FaFileExport } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getMyModulePermissionFun, getTableShimmer } from "../../../helper/common.js";
import { getAuthToken, tableToExcel } from "../../../services/Helper.js";
import { getExcelExportDistanceList, } from '../../../Services/Distance-service.js';
import { statusChange } from '../../../Services/Master-service.js';

import { AddEditDistance } from "../distance/AddEditDistance.jsx";


export const DistanceMaster = () => {
    const [showModal, setShowModal] = useState(false);
    let [editData, setEditData] = useState("#ffffff");

    let datatable_url = `${import.meta.env.VITE_API_URL}/admin/masters/distance/datatable`;
    const [permissions, setPermissions] = useState([]);
    const [exportsLists, setExportsLists] = useState([]);

    // useEffect(() => {
    //     getMyModulePermissionFun('block')
    //         .then((module) => {
    //             setPermissions(module);
    //         })
    //         .catch((error) => {
    //             console.error('Error fetching module permissions:', error);
    //         });
    // }, []);
    useEffect(() => {
        const staticPermissions = [
            'export',
            'add',
            'edit',
            'list'
        ];

        setPermissions(staticPermissions);
    }, []);

    const changeModalStatus = (id, status) => {
        setShowModal({
            ...showModal,
            [id]: status,
        });
    };

    const addFun = () => {
        setEditData("");
        changeModalStatus("user_update_modal", true);
    };

    const editFun = (data) => {
        setEditData(data);
        changeModalStatus("user_update_modal", true);
    };

    const handleStatusChange = async (pk, newStatus) => {
        try {
            const payload = {
                table: 't_distance',   // ✅ fixed: was 't_revenue_village', should be 't_villages'
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
            toast.error(
                error?.response?.data?.message || "Failed to update status"
            );
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


    const initiatedRevenueVillageDatatable = () => {
        var i = 1;
        var authToken = getAuthToken();
        var my_url = `${import.meta.env.VITE_API_URL}/admin/masters/distance/datatable`;

        if ($.fn.DataTable.isDataTable("#initiated-Revenue-datatable")) {
            $("#initiated-Revenue-datatable").DataTable().destroy();
        }

        $("#initiated-Revenue-datatable").DataTable({
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
                    name: "tsl_state_name",
                    data: "tsl_state_name",
                    searchable: true,
                    orderable: true,
                    render: (data) => data ?? "-",   // ✅ null-safe
                },
                {
                    name: "tdl_district_name",
                    data: "tdl_district_name",
                    searchable: true,
                    orderable: true,
                    render: (data) => data ?? "-",   // ✅ null-safe
                },
                {
                    name: "tbl_block_name",
                    data: "tbl_block_name",
                    searchable: true,
                    orderable: true,
                    render: (data) => data ?? "-",   // ✅ null-safe
                },
                {
                    name: "tgrm_grampanchayat_name",
                    data: "tgrm_grampanchayat_name",
                    searchable: true,
                    orderable: true,
                    render: (data) => data ?? "-",   // ✅ null-safe
                },
                {
                    name: "ttovill_type_of_village",
                    data: "ttovill_type_of_village",
                    searchable: true,
                    orderable: true,
                    render: (data) => data ?? "-",   // ✅ null-safe
                },
                {
                    name: "trevvlg_revenue_village_name",
                    data: "trevvlg_revenue_village_name",
                    searchable: true,
                    orderable: true,
                    render: (data) => data ?? "-",   // ✅ null-safe
                },
                {
                    name: "tvl_village_name",        // ✅ fixed: removed extra space
                    data: "tvl_village_name",        // ✅ fixed: removed extra space
                    searchable: true,
                    orderable: true,
                    render: (data) => data ?? "-",   // ✅ null-safe
                },
                {
                    name: "tdis_value",        // ✅ fixed: removed extra space
                    data: "tdis_value",        // ✅ fixed: removed extra space
                    searchable: true,
                    orderable: true,
                    render: (data) => data ?? "-",   // ✅ null-safe
                },
                {
                    name: "tdis_is_active",
                    data: "tdis_is_active",
                    searchable: false,
                    orderable: false,
                    render: function (data, type, row) {
                        const isChecked = data === true ? 'checked' : '';
                        return `
                            <i class="fas fa-edit text-primary edit-icon"
                               style="cursor:pointer; margin-right:10px;"
                               title="Edit"
                               data-id="${row.tdis_distance_id}">
                            </i>
                            <div class="form-check form-switch d-inline-block"
                                 style="vertical-align: middle;">
                                <input class="form-check-input toggle-switch"
                                       type="checkbox"
                                       id="toggleSwitch_${row.tdis_distance_id}"
                                       data-id="${row.tdis_distance_id}"
                                       ${isChecked}
                                       data-table="t_distance">
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
                    targets: [10],
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
                                                    <span>Edit Distance</span>
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
            initiatedRevenueVillageDatatable();
        }
    }, [permissions]);


    const getAllExportData = () => {
        getExcelExportDistanceList()
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
            tableToExcel("new-table", "Distance List");
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
                        <h5 className="mb-0 float-left">Distance List</h5>
                        <div className="float-right">
                            {(permissions?.indexOf('add') > -1) &&
                                <button
                                    type="button"
                                    style={{ marginRight: "10px" }}
                                    className="btn btn-sm btn-dark"
                                    onClick={() => addFun()}
                                >
                                    <i className="fa-solid fa-plus"></i> Add Distance
                                </button>
                            }
                            {(permissions?.indexOf('export') > -1) &&
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

                    <div className="card-body at-elevation-z6 table-box" style={{ maxHeight: "calc(100vh - 23vh)", overflowX: 'auto' }}>
                        <div className="collapse" id="collapseExample">
                            <div className=""></div>
                        </div>

                        <div className="initiated-Revenue-table-container">
                            <div className="mt-2 table table-bordered">
                                <div>
                                    {(permissions.indexOf('list') > -1) ?
                                        <table id="initiated-Revenue-datatable" className="table table-bordered dataTable">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>State Name</th>
                                                    <th>District Name</th>
                                                    <th>Block Name</th>
                                                    <th>Gram Panchayat Name</th>
                                                    <th>Type Of Village</th>
                                                    <th>Revenue Village Name</th>

                                                    <th>Village Name</th>
                                                    <th>Distance(KM)</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                        </table>
                                        :
                                        <tr>
                                            <td colSpan={9} className='text-center'>You don't have any permissions</td>
                                        </tr>
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
                        size="lg"
                        backdrop="static"
                        centered
                        id="user_update_modal"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>
                                {editData === '' ? 'Add Distance' : 'Update Distance'}
                            </Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <AddEditDistance
                                changeModalStatus={changeModalStatus}
                                editData={editData}
                                initiatedVillageDatatable={initiatedRevenueVillageDatatable}
                                datatable_url={datatable_url}
                            />
                        </Modal.Body>
                    </Modal>
                </div>
            </div>

            {/* Hidden export table */}
            <div style={{ display: 'none' }}>
                <table id='new-table' style={{ fontSize: '9pt' }} className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Serial No</th>
                            <th>State Name</th>
                            <th>District Name</th>
                            <th>Block Name</th>
                            <th>Gram Panchayat Name</th>
                            <th>Village Type</th>
                            <th>Revenue Village Name</th>
                            <th>Village Name</th>
                            <th>Distance Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exportsLists.map((data, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{data?.tsl_state_name ?? "-"}</td>
                                <td>{data?.tdl_district_name ?? "-"}</td>
                                <td>{data?.tbl_block_name ?? "-"}</td>
                                <td>{data?.tgrm_grampanchayat_name ?? "-"}</td>
                                <td>{data?.tdis_village_type_id ?? "-"}</td>
                                <td>{data?.trevvlg_revenue_village_name ?? "-"}</td>
                                <td>{data?.tvl_village_name ?? "-"}</td>
                                <td>{data?.tdis_value ?? "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};
