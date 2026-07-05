import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom/client";
import  { Toaster } from 'react-hot-toast';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { Modal } from "react-bootstrap";
import $ from 'jquery';
import { AddEditVillage } from "./AddEditVillage.jsx";
import { getMyModulePermissionFun, getTableShimmer } from "../../helper/common.js";
import { getAuthToken } from "../../services/Helper.js";

export const VillageMaster = () => {
    const [showModal, setShowModal] = useState(false);
    let [editVillage, setEditVillage] = useState("#ffffff");
   
    let datatable_url = `${process.env.REACT_APP_API_URL}/admin/education/master/villages/initiated-datatable`;
    const [permissions, setPermissions] = useState([]);

    useEffect(() => {
        getMyModulePermissionFun('village')
            .then((module) => {
                setPermissions(module);
            })
            .catch((error) => {
            console.error('Error fetching module permissions:', error);
        }); 
        
        setTimeout(() => {
            // setShimmerLoading(false);
        }, 2000)
    }, [])

    const changeModalStatus = (id, status) => {
        
        setShowModal({
            ...showModal,
            [id]: status,
        });
    };

    const addFun = () => {
        setEditVillage("");
        changeModalStatus("user_update_modal", true);
    };

    const editFun = (data) => {
        setEditVillage(data);

        changeModalStatus("user_update_modal", true);
    };


    const initiatedVillageDatatable = () => {
        var i = 1;
        var authToken = getAuthToken();
        var my_url = `${process.env.REACT_APP_API_URL}/admin/master/villages/initiated-datatable`;
        if ($.fn.DataTable.isDataTable("#initiated-Village-datatable")) {
            $("#initiated-Village-datatable").DataTable().destroy();
        }
        $("#initiated-Village-datatable").DataTable({
            order: [[1, "asc"]],
            dom: "<'d-flex justify-content-between align-items-center mb-2'<'d-flex align-items-center'Bl><'d-flex'f>>" +
                "<'row table-responsive'<'col-sm-12'tr>>" +
                "<'row mt-2'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 d-flex justify-content-end'p>>",
            language: {
                lengthMenu: "_MENU_"
            },
            ajax: {
                url: my_url,
                type: "POST",
                // data: function (d) {
                //     // Additional data to be sent to the server
                //     d.filterParams = toBeFilterData; // You can add more parameters as needed
                // },
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
                    name: "tsl_state_name",
                    data: "tsl_state_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tdl_district_name",
                    data: "tdl_district_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tbl_block_name",
                    data: "tbl_block_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tvl_village_name",
                    data: "tvl_village_name",
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
                                    (permissions?.indexOf('edit') > -1 || permissions == "*") &&
                                        <li>
                                            <button
                                                className="dropdown-item"
                                                href="javascript:void(0)"
                                                // onClick={() => {
                                                //     dispatch(clearAllProjectState());
                                                //     navigate(`add/${record.teya_id}`)
                                                // }}
                                                onClick={() => editFun(record)}
                                            >
                                                <span style={{ marginRight: "5px" }}>
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </span>
                                                <span>
                                                    Edit Village
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
        if(permissions.indexOf('list') > -1){
            initiatedVillageDatatable();
        }

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
                            Village List
                        </h5>
                        <div className="float-right">
                        {
                        (permissions?.indexOf('add') > -1 || permissions == "*") &&
                            <button
                                type="button"
                                style={{ marginRight: "10px" }}
                                className="btn btn-sm btn-dark"
                                // onClick={() =>{
                                //     dispatch(clearAllProjectState())
                                //     navigate('add')
                                // }}
                                onClick={() => addFun()}
                                >
                                <i className="fa-solid fa-plus"></i> Add Village

                            </button>
                        }

                            {/* <button
                                type="button"
                                className="btn btn-sm btn-dark"
                                data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-controls="collapseExample"
                            >
                                <i class="fa-solid fa-filter-list"></i> Filter
                            </button> */}
                        </div>
                    </div>
                    <div className="card-body at-elevation-z6 table-box" style={{ maxHeight: "calc(100vh - 23vh);", overflowX: 'auto' }}>
                        <div className="collapse" id="collapseExample">
                            <div className="">
                                
                            </div>
                        </div>

                        <div className="initiated-Village-table-container">
                            <h6>Initiated Village List</h6>
                            <hr className="my-1" />
                            <div className="mt-2 table table-bordered">
                                <div>
                                {(permissions.indexOf('list') > -1) ?
                                    <table id="initiated-Village-datatable" className="table table-bordered dataTable">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>State Name</th>
                                                <th>District Name</th>
                                                <th>Block Name</th>                                               
                                                <th>Village Name</th>                                               
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                    </table>
                                    :
                                    <>
                                    <tr>
                                    <td colSpan={5} className='text-center'>You don't have any permissions</td>
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
                            <Modal.Title>{editVillage == '' ? 'Add Village' : 'Update Village'}</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <AddEditVillage
                                changeModalStatus={changeModalStatus}
                                editVillage={editVillage}
                                initiatedVillageDatatable={initiatedVillageDatatable}
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
