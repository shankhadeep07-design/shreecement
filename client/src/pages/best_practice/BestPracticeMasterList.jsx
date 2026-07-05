import $ from 'jquery';
import React, { useEffect, useState } from 'react';
import { Modal } from "react-bootstrap";
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import ReactDOM from "react-dom/client";
import { Toaster } from 'react-hot-toast';
// import { useLoading } from '../../../context/LoadingContext.jsx';
import { toast } from 'react-toastify'

import { getMyModulePermissionFun, getTableShimmer } from "../../helper/common.js";
import { getAuthToken, tableToExcel } from "../../services/Helper.js";
import { AddEditBestPracticeMasterList } from './AddEditBestPracticeMasterList.jsx';


import { getExcelExportBestPracticeList } from '../../services/BestPractice-service.js';
import { FaFileExport } from 'react-icons/fa';






export const BestPracticeMasterList = () => {
    // let { loading, setLoading } = useLoading(false);
    const [showModal, setShowModal] = useState(false);
    let [editList, setEditList] = useState("#ffffff");
    let datatable_url = `${import.meta.env.VITE_API_URL}/admin/best-practices/datatable`;
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
        var my_url = `${import.meta.env.VITE_API_URL}/admin/best-practices/datatable`;

        if ($.fn.DataTable.isDataTable("#initiated-BestPractice-datatable")) {
            $("#initiated-BestPractice-datatable").DataTable().destroy();
        }
        $("#initiated-BestPractice-datatable").DataTable({
            order: [[1, "asc"]],
            dom: "<'d-flex justify-content-between align-items-center mb-2'<'d-flex align-items-center'Bl><'d-flex'f>>" +
                "<'row table-responsive'<'col-sm-12'tr>>" +
                "<'row mt-2'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 d-flex justify-content-end'p>>",

            buttons: [],  // ensures no buttons appear

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
                    name: "project_name",
                    data: "project_name",
                    searchable: true,
                    orderable: true,
                },

                {
                    name: "theme_name",
                    data: "theme_name",
                    searchable: true,
                    orderable: true,
                },

                {
                    name: "focus_area_name",
                    data: "focus_area_name",
                    searchable: true,
                    orderable: true,
                },

                {
                    name: "tbp_problem",
                    data: "tbp_problem",
                    searchable: true,
                    orderable: true,
                    render: function (data, type, row) {
                        if (!data) return "";
                        return data.length > 20 ? data.substring(0, 20) + "..." : data;
                    }
                },
                {
                    name: "tbp_solution",
                    data: "tbp_solution",
                    searchable: true,
                    orderable: true,
                    render: function (data, type, row) {
                        if (!data) return "";
                        return data.length > 20 ? data.substring(0, 20) + "..." : data;
                    }
                },






                {
                    name: "tbp_benefit",
                    data: "tbp_benefit",
                    searchable: true,
                    orderable: true,
                    render: function (data, type, row) {
                        if (!data) return "";
                        return data.length > 20 ? data.substring(0, 20) + "..." : data;
                    }
                },

                {
                    name: "documents",
                    data: "documents",
                    searchable: false,
                    orderable: false,
                    render: function (data, type, row) {

                        if (!data || data.length === 0) {
                            return "N/A";
                        }

                        let html = "";

                        data.forEach((doc, index) => {
                            if (doc.full_url) {
                                html += `
                    <div style="margin-bottom:4px;">
                        <a href="${doc.full_url}" target="_blank" rel="noopener noreferrer">
                            ${doc.file_name}
                        </a>
                    </div>
                `;
                            }
                        });

                        return html;
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
                    targets: [8],
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
                                                        Edit BestPractice
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



    const getAllExportData = () => {
        getExcelExportBestPracticeList().then((response) => {
            setExportsLists(response.data);
        }).catch((error) => {
            toast.error(
                error?.response?.data?.originalError || error?.response?.data?.message
            );
        });
    };
    useEffect(() => {
        if (exportsLists.length > 0) {
            tableToExcel("new-table", "Best Practice List");
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
                            Best Practice List
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
                                <i class="fa-solid fa-plus"></i> Add BestPractice

                            </button>


                            <button
                                className="btn btn-success btn-sm"
                                style={{ marginLeft: "10px" }}
                                onClick={() => getAllExportData()}
                            >
                                <FaFileExport /> Export
                            </button>

                        </div>


                        {/* } */}
                    </div>
                    <div className="card-body at-elevation-z6 table-box" style={{ maxHeight: "calc(100vh - 23vh);", overflowX: 'auto' }}>
                        <div class="collapse" id="collapseExample">
                            <div class="">
                            </div>
                        </div>

                        <div className="initiated-BestPractice-table-container">
                            {/* <h6>Initiated BestPractice List</h6> */}
                            <hr className="my-1" />
                            <div className="mt-2 table table-bordered">
                                <div>
                                    {/* {(permissions.indexOf('list') > -1) ? */}
                                    <table id="initiated-BestPractice-datatable" className="table table-bordered dataTable">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Project</th>
                                                <th>Theme</th>
                                                <th>Focus Area Name</th>
                                                <th>Problem</th>
                                                <th>Solution</th>
                                                <th>Benefit</th>
                                                <th>Documents</th>
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
                        size="lg"
                        backdrop="static"
                        centered
                        id="user_update_modal"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>{editList == '' ? 'Add BestPractice' : 'Update BestPractice'}</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <AddEditBestPracticeMasterList
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



            <div style={{ display: "none" }}>
                <table
                    id="new-table"
                    style={{ fontSize: "9pt" }}
                    className="table table-striped table-hover"
                >
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Project</th>
                            <th>Theme</th>
                            <th>Focus Area Name</th>
                            <th>Problem</th>
                            <th>Solution</th>
                            <th>Benefit</th>
                        </tr>
                    </thead>

                    <tbody>
                        {exportsLists?.map((data, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{data?.project_name || ""}</td>
                                <td>{data?.theme_name || ""}</td>
                                <td>{data?.focus_area_name || ""}</td>
                                <td>{data?.tbp_problem || ""}</td>
                                <td>{data?.tbp_solution || ""}</td>
                                <td>{data?.tbp_benefit || ""}</td>
                            </tr>
                        ))}

                    </tbody>
                </table>
            </div>
        </>
    )
}