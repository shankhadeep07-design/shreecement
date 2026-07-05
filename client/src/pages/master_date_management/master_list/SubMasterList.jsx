import $ from 'jquery';
import { useEffect, useState } from 'react';
import { Modal } from "react-bootstrap";
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import ReactDOM from "react-dom/client";
import { Toaster } from 'react-hot-toast';
import { useLoading } from '../../../context/LoadingContext.jsx';
import { toast } from 'react-toastify';


import { getMyModulePermissionFun, getTableShimmer } from "../../../helper/common.js";
import { getAuthToken, tableToExcel } from "../../../services/Helper.js";
// import { AddEditVerticalMaster } from './AddEditVerticalMaster.jsx';
import { useParams } from 'react-router-dom';
import { AddEditSubMasterList } from './AddEditSubMasterList.jsx';
// import { AddEditMasterList } from './AddEditMasterList.jsx';
import { statusChange } from '../../../Services/Master-service.js';

export const SubMasterList = () => {
    const tml_id = useParams().id;

    let { loading, setLoading } = useLoading(false);
    const [showModal, setShowModal] = useState(false);
    let [editSubMasterList, setEditSubMasterList] = useState("#ffffff");
    const [permissions, setPermissions] = useState([])
    const [exportsLists, setExportsLists] = useState([]);
    useEffect(() => {
        getMyModulePermissionFun('district')
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
        setEditSubMasterList("");
        changeModalStatus("user_update_modal", true);
    };

    const editFun = (data) => {
        setEditSubMasterList(data);
        changeModalStatus("user_update_modal", true);
    };

    let datatable_url = `${import.meta.env.VITE_API_URL}/admin/masters-management/sub-master-list/datatable/${tml_id}`;

        const handleStatusChange = async (pk, newStatus) => {
            try {
                const payload = {
                    table: 't_sub_master_list',
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

    const initiatedSubMasterListDatatable = () => {
        var i = 1;
        var authToken = getAuthToken();

        var my_url = `${import.meta.env.VITE_API_URL}/admin/masters-management/sub-master-list/datatable/${tml_id}`;

        if ($.fn.DataTable.isDataTable("#initiated-SubMasterList-datatable")) {
            $("#initiated-SubMasterList-datatable").DataTable().destroy();
        }
        $("#initiated-SubMasterList-datatable").DataTable({
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
                    name: "tsml_sub_master_list_name",
                    data: "tsml_sub_master_list_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tsml_sub_master_list_desc",
                    data: "tsml_sub_master_list_desc",
                    searchable: true,
                    orderable: true,
                },
                 {
                    name: "tsml_is_active",
                    data: "tsml_is_active",
                    searchable: false,
                    orderable: false,
                    render: function (data, type, row) {

                        // data === row.tsl_is_active
                        const isChecked = data === true ? 'checked' : '';

                        return `
                <i class="fas fa-edit text-primary edit-icon"
                   style="cursor:pointer; margin-right:10px;"
                   title="Edit"
                   data-id="${row.tsml_id}">
                </i>

                <div class="form-check form-switch d-inline-block"
                     style="vertical-align: middle;">
                    <input class="form-check-input toggle-switch"
                           type="checkbox"
                           id="toggleSwitch_${row.tsml_id}"
                           data-id="${row.tsml_id}"
                          
                           ${isChecked}  data-table="t_sub_master_list"   >
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
                                        {/* {
                                            (permissions?.indexOf('edit') > -1) && */}
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
                                                    Edit Sub Master List
                                                </span>
                                            </button>
                                        </li>

                                        {/* } */}

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
            initiatedSubMasterListDatatable();
        }

    }, [permissions]);

    // const getAllExportData = () => {
    //     getExcelExportMasterList().then((response) => {
    //         setExportsLists(response.data);
    //     }).catch((error) => {
    //         toast.error(
    //             error?.response?.data?.originalError || error?.response?.data?.message
    //         );
    //     });
    // };

    useEffect(() => {
        if (exportsLists.length > 0) {
            tableToExcel("new-table", "Sub Master List"); // Trigger export once data is set
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
                <div className="card common-card pb-3">
                    <div className="card-header common-card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
                        <h5 className="mb-0 float-left">
                            Sub Master List
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
                                    <i class="fa-solid fa-plus"></i> Add Sub Master List

                                </button>
                            }
                            {/* {
                                (permissions?.indexOf('export') > -1) &&

                                <button
                                    className="btn btn-success btn-sm"
                                    style={{ marginLeft: "10px" }}
                                    onClick={() => getAllExportData()}
                                >
                                    <FaFileExport /> Export
                                </button>

                            } */}
                        </div>
                    </div>
                    <div className="card-body at-elevation-z6 table-box" style={{ maxHeight: "calc(100vh - 23vh);", overflowX: 'auto' }}>
                        <div class="collapse" id="collapseExample">
                            <div class="">

                            </div>
                        </div>

                        <div className="initiated-SubMasterList-table-container">
                            <div className="mt-2 table table-bordered">
                                <div>
                                    {(permissions.indexOf('list') > -1) ?
                                        <table id="initiated-SubMasterList-datatable" className="table table-bordered dataTable">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Title</th>
                                                    <th>Description</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                        </table>
                                        :
                                        <>
                                            <tr>
                                                <td colSpan={3} className='text-center'>You don't have any permissions</td>
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
                            <Modal.Title>{editSubMasterList == '' ? 'Add Sub Master List' : 'Update Sub Master List'}</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <AddEditSubMasterList
                                changeModalStatus={changeModalStatus}
                                editSubMasterList={editSubMasterList}
                                initiatedSubMasterListDatatable={initiatedSubMasterListDatatable}
                                datatable_url={datatable_url}
                                tml_id={tml_id}
                            />
                        </Modal.Body>
                    </Modal>
                    {/* Update User Modal End */}
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
                            <th>Sub Master List Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exportsLists?.map((data, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{data?.tml_master_list_name || ""}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}
