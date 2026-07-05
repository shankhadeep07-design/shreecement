import $ from 'jquery';
import React, { useEffect, useState } from 'react';
import { Modal } from "react-bootstrap";
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import ReactDOM from "react-dom/client";
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getMyModulePermissionFun, getTableShimmer } from "../../../helper/common.js";
import { getAuthToken } from "../../../Services/Helper";

export const MasterListMaster = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    let [editMasterList, setEditMasterList] = useState("#ffffff");
   
    const [permissions, setPermissions] = useState([]);

    useEffect(() => {
        getMyModulePermissionFun('master')
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
        setEditMasterList("");
        changeModalStatus("user_update_modal", true);
    };

    const editFun = (data) => {
        setEditMasterList(data);

        changeModalStatus("user_update_modal", true);
    };

    const viewFun = (data) => {
        navigate(`/admin/${data.tml_slug}-master`);
    };


    const initiatedMasterListDatatable = () => {
        var i = 1;
        var authToken = getAuthToken();
        var my_url = `${process.env.REACT_APP_API_URL}/admin/master/lists/initiated-datatable`;
        if ($.fn.DataTable.isDataTable("#initiated-MasterList-datatable")) {
            $("#initiated-MasterList-datatable").DataTable().destroy();
        }
        $("#initiated-MasterList-datatable").DataTable({
            order: [[1, "asc"]],
           
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
                },
                lengthMenu: "_MENU_"
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
                    name: "tml_name",
                    data: "tml_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tml_description",
                    data: "tml_description",
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
                    _createdCell: (td, celldata, record) => {
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
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </span>
                                                <span>
                                                    Edit MasterList
                                                </span>
                                            </button>
                                        </li>
                                    }
                                    {
                                        (permissions?.indexOf('view') > -1 || permissions == "*") &&
                                        <li>
                                            <button
                                                className="dropdown-item"
                                                
                                                onClick={() => viewFun(record)}
                                            >
                                                <span style={{ marginRight: "5px" }}>
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </span>
                                                <span>
                                                    view List
                                                </span>
                                            </button>
                                        </li>
                                    }
                                    </ul>
                                </div>
                            </>
                        );
                    },
                    get createdCell() {
                        return this._createdCell;
                    },
                    set createdCell(value) {
                        this._createdCell = value;
                    },
                },
            ]
        });
    };

    useEffect(() => {
        if(permissions.indexOf('list') > -1){
            initiatedMasterListDatatable();
        }

    }, [permissions]);


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
                            MasterList List
                        </h5>
                        <div className="float-right">
                            
                        </div>
                    </div>
                    <div className="card-body at-elevation-z6 table-box" style={{ maxHeight: "calc(100vh - 23vh);", overflowX: 'auto' }}>
                        <div className="collapse" id="collapseExample">
                            <div className="">
                                
                            </div>
                        </div>

                        <div className="initiated-MasterList-table-container">
                            <hr className="my-1" />
                            <div className="mt-2 table table-bordered">
                                <div>
                                {(permissions.indexOf('list') > -1) ?
                                    <table id="initiated-MasterList-datatable" className="table table-bordered dataTable">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>                                                                                              
                                                <th>Description</th>                                                                                              
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
                            <Modal.Title>{editMasterList === '' ? 'Add MasterList' : 'Update MasterList'}</Modal.Title>
                        </Modal.Header>

                        
                    </Modal>
                    {/* Update User Modal End */}
                </div>

            </div>
        </>
    )
}
