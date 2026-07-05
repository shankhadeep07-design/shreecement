
import { Modal, message } from "antd";
import $ from 'jquery';
import { useEffect, useState } from 'react';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import ReactDOM from "react-dom/client";
import { Toaster } from 'react-hot-toast';

import { FaFileExport } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getMyModulePermissionFun, getTableShimmer } from "../../../helper/common.js";
import { sendBudgetingForApprovalApi } from '../../../services/Budget-service.js';
import { getAuthToken, tableToExcel } from "../../../services/Helper.js";
import { getExcelExportStateList } from '../../../Services/State-service.js';
import BudgetingAddUpdateModal from './BudgetingAddUpdateModal.jsx';

 const BudgetingManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [permissions, setPermissions] = useState([])
    const [exportsLists, setExportsLists] = useState([]);
    const [editData, setEditData] = useState([]);

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
        setEditData("");
        changeModalStatus("user_update_modal", true);
    };

    const editFun = (data) => {
        setEditData(data);

        changeModalStatus("user_update_modal", true);
    };

    const viewBudgeting = (data) => {
        window.open(
        `${import.meta.env.VITE_HOME_PAGE}/admin/budgeting/budgeting_details/${data.tbm_id}`,
        "_blank"
        );
    }

    const sendForApprovalConfirm = (data) => {
        Modal.confirm({
            title: "Are you sure you want to send for approval?",
            content: `You are about to send  for approval.`,
            okText: "Yes",
            cancelText: "No",
            onOk() {
                // Your approval logic here
                sendForApproval(data);
            },
            onCancel() {
            message.info("Action cancelled");
            },
        });
    };

    const sendForApproval = (data) => {
        sendBudgetingForApprovalApi(data).then((response) => {
            if (response.status) {
                toast.success(response.message);
                initiatedDatatable();
            }
        }).catch((error) => {
            toast.error(error?.response?.data?.message);
        })
    }


    const initiatedDatatable = () => {
        var i = 1;
        var authToken = getAuthToken();
        var my_url = `${import.meta.env.VITE_API_URL}/admin/budget/budgeting_list/datatable`;

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
                    render: function (data, type, full, meta) {
                        return i++;
                    },
                    searchable: false,
                    orderable: false,
                },
                {
                    name: "tfy_year_label",
                    data: "tfy_year_label",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tbm_total_budget_amount",
                    data: "tbm_total_budget_amount",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tbm_status",
                    data: "tbm_status",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "name",
                    data: "name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tbm_created_at",
                    data: "tbm_created_at",
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
                { targets: '_all', className: 'dt-center' },
                {
                    name: 'Action',
                    targets: [6],
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
                                            (permissions?.indexOf('edit') > -1 || permissions == "*") &&
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
                                                        Edit
                                                    </span>
                                                </button>
                                            </li>

                                        }

                                        {
                                            (permissions?.indexOf('edit') > -1 || permissions == "*") &&
                                            <li>
                                                <button
                                                    className="dropdown-item"
                                                    href="javascript:void(0)"

                                                    onClick={() => viewBudgeting(record)}
                                                >
                                                    <span style={{ marginRight: "5px" }}>
                                                        <i class="fa-solid fa-pen-to-square"></i>
                                                    </span>
                                                    <span>
                                                        View
                                                    </span>
                                                </button>
                                            </li>

                                        }

                                        {/* {
                                            (permissions?.indexOf('edit') > -1 || permissions == "*") &&
                                            <li>
                                                <button
                                                    className="dropdown-item"
                                                    href="javascript:void(0)"

                                                    onClick={() => sendForApprovalConfirm(record)}
                                                >
                                                    <span style={{ marginRight: "5px" }}>
                                                        <i class="fa-solid fa-pen-to-square"></i>
                                                    </span>
                                                    <span>
                                                        Send For Approval
                                                    </span>
                                                </button>
                                            </li>

                                        } */}
                                        
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
            initiatedDatatable();
        }

    }, [permissions]);

    const getAllExportData = () => {
        getExcelExportStateList().then((response) => {
            setExportsLists(response.data);
        }).catch((error) => {
            toast.error(
                error?.response?.data?.originalError || error?.response?.data?.message
            );
        });
    };

    useEffect(() => {
        if (exportsLists.length > 0) {
            tableToExcel("new-table", "Budgeting"); // Trigger export once data is set
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
                            Budgeting
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
                                    <i class="fa-solid fa-plus"></i> Add Budget

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
                        <div class="collapse" id="collapseExample">
                            <div class="">

                            </div>
                        </div>

                        <div className="initiated-State-table-container">
                            <div className="mt-2 table table-bordered">
                                <div>
                                    {(permissions.indexOf('list') > -1) ?
                                        <table id="initiated-State-datatable" className="table table-bordered dataTable">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>F/Y</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                    <th>Created By</th>
                                                    <th>Created At</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                        </table>
                                        :
                                        <>
                                            <tr>
                                                <td colSpan={9} className='text-center'>You don't have any permissions</td>
                                            </tr>
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="allModals">

                    {
                        showModal?.user_update_modal &&
                        <BudgetingAddUpdateModal showModal={showModal} editData ={editData} initiatedDatatable={initiatedDatatable} changeModalStatus={changeModalStatus} />
                    }
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
                            <th>State Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exportsLists?.map((data, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{data?.tsl_state_name || ""}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default BudgetingManagement;
