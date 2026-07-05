import $ from 'jquery';
import React, { useEffect, useState } from 'react';
import { Modal } from "react-bootstrap";
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import ReactDOM from "react-dom/client";
import { Toaster } from 'react-hot-toast';
import { useLoading } from '../../../context/LoadingContext.jsx';
import { AddEditDistrict } from "../../master/district/AddEditDistrict.jsx";

import { getMyModulePermissionFun, getTableShimmer } from "../../../helper/common.js";
import { getAuthToken } from "../../../services/Helper.js";
import { AddEditProjectImplementation } from './AddEditProjectImplementation.jsx';


export const ProjectImplementation = () => {
    let { loading, setLoading } = useLoading(false);
    const [showModal, setShowModal] = useState(false);
    let [editList, setEditList] = useState("#ffffff");
    let datatable_url = `${import.meta.env.VITE_API_URL}/admin/projects/implementation/datatable`;
    const [permissions, setPermissions] = useState([])
   
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
        setEditList("");
        changeModalStatus("user_update_modal", true);
    };

    const editFun = (data) => {
        setEditList(data);

        changeModalStatus("user_update_modal", true);
    };


    const initiatedDistrictDatatable = () => {
        var i = 1;
        var authToken = getAuthToken();
        var my_url = `${import.meta.env.VITE_API_URL}/admin/projects/implementation/datatable`;

        if ($.fn.DataTable.isDataTable("#initiated-Implementation-datatable")) {
            $("#initiated-Implementation-datatable").DataTable().destroy();
        }
        $("#initiated-Implementation-datatable").DataTable({
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
                    render: function (data, type, full, meta) {
                        return i++;
                    },
                    searchable: false,
                    orderable: false,
                },
                {
                    name: "tpi_implementation_name",
                    data: "tpi_implementation_name",
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
                    targets: [3],
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
                                                    Edit Implementation
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
        // if(permissions.indexOf('list') > -1){
            initiatedDistrictDatatable();
        // }

    }, [permissions]);


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
                            Implementation List
                        </h5>
                    {/* {
                        (permissions?.indexOf('add') > -1 || permissions == "*") && */}
                        <div className="float-right">
                            <button
                                type="button"
                                style={{ marginRight: "10px" }}
                                className="btn btn-sm btn-dark"
                                
                                onClick={() => addFun()}
                                >
                                <i class="fa-solid fa-plus"></i> Add Implementation

                            </button>

                        </div>
                    {/* } */}
                    </div>
                    <div className="card-body at-elevation-z6 table-box" style={{ maxHeight: "calc(100vh - 23vh);", overflowX: 'auto' }}>
                        <div class="collapse" id="collapseExample">
                            <div class="">
                                
                            </div>
                        </div>

                        <div className="initiated-Implementation-table-container">
                            <div className="mt-2 table table-bordered">
                                <div>
                                {/* {(permissions.indexOf('list') > -1) ? */}
                                    <table id="initiated-Implementation-datatable" className="table table-bordered dataTable">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Implementation Name</th>                                            
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                    </table>
                                    {/* :
                                    <>
                                    <tr>
                                    <td colSpan={3} className='text-center'>You don't have any permissions</td>
                                    </tr>
                                    </> */}
                                {/* } */}
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
                        size="md"
                        backdrop="static"
                        centered
                        id="user_update_modal"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>{editList== '' ? 'Add Implementation' : 'Update Implementation'}</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <AddEditProjectImplementation
                                changeModalStatus={changeModalStatus}
                                editList={editList}
                                initiatedDistrictDatatable={initiatedDistrictDatatable}
                                datatable_url={datatable_url}
                            />
                        </Modal.Body>
                    </Modal>
                    {/* Update User Modal End */}
                </div>

            </div>
        </>
    )
}
