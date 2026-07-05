import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import ScaleLoader from "react-spinners/ScaleLoader";
import {
    createClassificationApi,
    deleteClassificationApi,
    getAllClassificationsApi,
    updateClassificationDetailsApi,
} from "../../../Services/Classification-service.js";
import toast, { Toaster } from "react-hot-toast";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import { Table } from 'ant-table-extensions';
import { SearchOutlined } from "@ant-design/icons";
import {
    FaEllipsisH,
    FaPencilAlt,
    FaTrash,
    FaRegPlusSquare,
} from "react-icons/fa";
import { Modal, Dropdown } from "react-bootstrap";

import { useLoading } from '../../../context/LoadingContext.jsx'

import { roleHasPermission } from "../../../Services/Role-service.js";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Select from "react-select";

import $ from "jquery";
import { getAuthToken } from "../../../Services/Helper.js";
import PlotListShimmer from "../../shimmers/PlotListShimmer.jsx";

import { tableToExcel, getTableShimmer, slugToText } from "../../../helper/common.js";


export const OtherMasters = () => {
    let [loading, setLoading] = useState(true);
    let [shimmerLoading, setShimmerLoading] = useState(true);
    let [color] = useState("#ffffff");
    const [searchText, setSearchText] = useState("");

    var navigate = useNavigate();

    const {type} = useParams();

    const [permissions, setPermissions] = useState([])
    const [responseReceived, setResponseReceived] = useState(false)

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const _pm = queryParams.get('_pm');

    useEffect(() => {
        roleHasPermission('other_masters').then((response) => {
            if (response.status == 1) {
                var pmsn = response?.data;
                setPermissions(pmsn);
                setResponseReceived(true)
            }
        })
        setTimeout(() => {
            setShimmerLoading(false);
        }, 2000)
    }, [])



    const initDatatable = () => {
        if (permissions?.indexOf('list') > -1 || permissions == "*") {
            var i = 1;
            var authToken = getAuthToken();
            var my_url = `${process.env.REACT_APP_API_URL}/admin/module-master/datatable`;
            if ($.fn.DataTable.isDataTable("#datatable")) {
                $("#datatable").DataTable().destroy();
            }
            $("#datatable").DataTable({
                order: [[1, "asc"]],
                dom: "<'d-flex justify-content-between align-items-center mb-2'<'d-flex align-items-center'Bl><'d-flex'f>>" +
                    "<'row'<'col-sm-12'tr>>" +
                    "<'row mt-2'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 d-flex justify-content-end'p>>",
                language: {
                    lengthMenu: "_MENU_"
                },
                buttons: [
                    {
                        text: 'Export', // Button text
                        action: function (e, dt, node, config) {
                            tableToExcel('datatable', 'Owner List')
                        },
                    },
                ],
                // scrollX: true,
                ajax: {
                    url: my_url,
                    type: "POST",
                    data : {
                        type : type || 'module'
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
                initComplete: function (settings) {
                    console.log('Init complete');
                    setShimmerLoading(false);
                    // $("#plot_list_table").removeClass('table-loader').show();
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
                        name: "tmm_disp_title",
                        data: "tmm_disp_title",
                        searchable: true,
                        orderable: true,
                    },
                    {
                        name: "tmm_description",
                        data: "tmm_description",
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
                    { targets: [0, 1, 2, 3], className: 'dt-center' },
                    {
                        name: 'Action',
                        targets: [3],
                        createdCell: (td, celldata, record) => {
                            ReactDOM.createRoot(td).render(
                                <>
                                    {
                                        (permissions?.indexOf('edit') > -1 || permissions == "*") ?
                                            <div className="dropdown">
                                                <a
                                                    className="btn btn-light btn-sm dropdown-toggle"
                                                    href="#"
                                                    role="button"
                                                    data-bs-toggle="dropdown"
                                                    aria-expanded="false"
                                                    data-toggle="tooltip"
                                                    data-placement="bottom"
                                                    title="Action">
                                                    <i className="fa fa-ellipsis-h" aria-hidden="true"></i>
                                                </a>

                                                <ul className="dropdown-menu">
                                                    <li>
                                                        <a
                                                            className="dropdown-item"
                                                            href="#"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                if(type)
                                                                    navigate(`/admin/other-masters/add/${record.tmm_id}?_pm=${type}`)
                                                                else
                                                                    navigate(`/admin/other-masters/add/${record.tmm_id}`)
                                                            }}
                                                            >
                                                            <span style={{ marginRight: "5px" }}>
                                                                <i className="fa fa-pen"></i>
                                                            </span>
                                                            <span> Edit</span>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a
                                                            className="dropdown-item"
                                                            href="#"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                navigate(`/admin/other-masters/${record.tmm_title}`)
                                                            }}
                                                        >
                                                            <span style={{ marginRight: "5px" }}>
                                                                <i class="fa-sharp fa-solid fa-people-group"></i>
                                                            </span>
                                                            <span> Sub Masters</span>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                            : "-"
                                    }
                                </>
                            );
                        },
                    },
                ],
            });
        }
        else {
            if (responseReceived)
                setShimmerLoading(false)
        }
    };


    useEffect(() => {
        initDatatable();
    }, [permissions, type])


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
                            Other Masters {(type) && `of ${slugToText(type)}`}
                        </h5>

                        <div className="float-right">
                            {
                                (permissions?.indexOf('add') > -1 || permissions == "*") &&
                                <button
                                    type="button"
                                    className="btn btn-sm btn-dark"
                                    onClick={() => {
                                        if(type)
                                            navigate(`/admin/other-masters/add?_pm=${type}`)
                                        else
                                            navigate(`/admin/other-masters/add`)
                                    }}
                                    >
                                    <a
                                        className="text-light"
                                        data-toggle="tooltip"
                                        data-placement="bottom"
                                        title="Add Classification"
                                        data-bs-original-title="Add Classification"
                                        aria-label="Add Classification">
                                        <i className="fas fa-plus" aria-hidden="true"></i>
                                    </a>
                                </button>
                            }
                        </div>
                    </div>

                    <div className="card-body at-elevation-z6 table-box">
                        {
                            (shimmerLoading) &&
                            <PlotListShimmer header={false} />
                        }
                        <div className="card-body-content" style={{ visibility: (shimmerLoading) ? 'hidden' : "visible" }}>
                            <div className="table-responsive mt-2 table table-bordered">
                                <table id="datatable" className="table table-bordered dataTable">
                                    <thead>
                                        <tr>
                                            <th>Sl. No</th>
                                            <th>Name</th>
                                            <th>Description</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* {
                                            (!permissions?.indexOf('list') > -1 || !permissions == "*") && */}
                                        <tr>
                                            <td colSpan={4} className="text-center">
                                                You don't have the permission to access this resource
                                            </td>
                                        </tr>
                                        {/* } */}

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Plot details modal */}

                {/* Plot details modal End */}


            </div>
        </>
    );
};
