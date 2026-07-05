import React, { useState, useEffect } from 'react'
import ReactDOM from "react-dom/client";
import { Input } from 'antd';
import { Table } from 'ant-table-extensions';
import { SearchOutlined } from '@ant-design/icons';
import { Modal, Dropdown } from "react-bootstrap";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import toast, { Toaster } from 'react-hot-toast';
import { FaEllipsisH, FaPencilAlt, FaTrash, FaRegPlusSquare } from 'react-icons/fa';
import ScaleLoader from "react-spinners/ScaleLoader";
import { useLoading } from '../../../context/LoadingContext.jsx'
import {
    getAllCourtMasterApi,
    updateCourtMasterDetailsApi,
    createCourtMasterApi,
    deleteCourtMasterApi,
} from "../../../Services/CourtMaster-service.js";
import { submitMilestoneApi, getMilestoneApi , getMilestoneById } from '../../../Services/Milestone-service.js';
import {setMilestoneState,setAllMilestone,clearAllMilestone} from '../../../redux/slices/MasterModuleSlice';

import { encryptData } from '../../../helper/encrypt-decrypt.js';
import '../master_data.css';

import { roleHasPermission } from "../../../Services/Role-service.js";

import PlotListShimmer from "../../shimmers/PlotListShimmer.jsx"

import { useNavigate } from 'react-router-dom';

import { setAllCompany } from '../../../redux/slices/MasterModuleSlice';
import { useDispatch, useSelector } from 'react-redux';


import { capitalizeAfterSpace } from '../../../helper/common';
import $ from "jquery";
import { getAuthToken } from "../../../Services/Helper";
import { tableToExcel, getTableShimmer } from "../../../helper/common";

export const Milestone = () => {
    let color = "#ffffff"
    let navigate = useNavigate();
    const dispatch = useDispatch();
    let { loading, setLoading } = useLoading(false);
    let [shimmerLoading, setShimmerLoading] = useState(true);
    const [milestoneList, setMilestoneList] = useState([])

    const [permissions, setPermissions] = useState([])
    const [responseReceived, setResponseReceived] = useState(false)
    let [plotListLoader, setPlotListLoader] = useState(true);
    useEffect(() => {
        roleHasPermission('milestone').then((response) => {
            if (response.status == 1) {
                var pmsn = response?.data;
                setPermissions(pmsn);
                setResponseReceived(true)
            }
        })
       // getMilestoneApi();
        setTimeout(() => {
            setShimmerLoading(false);
        }, 2000)
    }, [])

    const getMilestoneApi = () => {
        getMilestoneApi().then((res) => {
            // console.log(res.data);
            setMilestoneList(res.data)
        })
    }

    const initDatatable = () => {
        var i = 1;
        var authToken = getAuthToken();
        var my_url = `${process.env.REACT_APP_API_URL}/admin/master/milestone-master-datatable-list`;
        if ($.fn.DataTable.isDataTable("#datatable")) {
            $("#datatable").DataTable().destroy();
        }
        $("#datatable").DataTable({
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
                setPlotListLoader(false);
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
                    name: "tmm_milestone_name",
                    data: "tmm_milestone_name",
                    searchable: true,
                    orderable: true,
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
                    targets: [2],
                    createdCell: (td, celldata, record) => {
                        ReactDOM.createRoot(td).render(
                            <>
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
                                                href="javascript:void(0)"
                                                onClick={() => {
                                                    dispatch(clearAllMilestone());
                                                    navigate(`add/${record.tmm_id}`)
                                                }}>
                                                <span style={{ marginRight: "5px" }}>
                                                    <i className="fa fa-pen"></i>
                                                </span>
                                                <span>Edit</span>
                                            </a>
                                        </li>
                                        {/* <li>
                                            <a
                                                className="dropdown-item"
                                                href="#"
                                                onClick={() => recordDelete(record.tmm_id)}>
                                                <span style={{ marginRight: "5px" }}>
                                                    <FaTrash style={{ marginRight: '5px' }} />
                                                </span>
                                                <span>Delete</span>
                                            </a>
                                        </li> */}
                                    </ul>
                                </div>

                            </>
                        );
                    },
                },
            ]
        });
    };

    const recordDelete = (id) => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui delete_popup_box'>
                        <h1>Are you sure ?</h1>
                        <p>You want to delete this record ?</p>
                        <div className='delete_button_box'>
                            <button className='btn btn-info mr-1' onClick={onClose}>Cancel</button>
                            <button className='btn btn-danger'
                                onClick={() => {
                                    handleClickDelete(id);
                                    onClose();
                                }}
                            >
                                Yes, Delete it!
                            </button>
                        </div>
                    </div>
                );
            }
        });
    }

    const handleClickDelete = (delete_id) => {
        setLoading(true);

        deleteCourtMasterApi(delete_id).then(data => {
            toast.success(data.message);

        }).catch((error) => {
            toast.error(error);
        });
    }
    useEffect(() => {
        initDatatable();
    }, [permissions])

    return (
        <>
            <Toaster position='top-center' toastOptions={{ duration: 2000 }} reverseOrder={false}></Toaster>

            <span className="position-absolute trigger"></span>

            <div className="home-content">
                <div className="card pb-3">
                    <div className="card-header fw-bold d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 float-left">MileStone List</h5>

                        <div className="float-right">
                            <button type="button" className="btn btn-sm btn-dark" onClick={() => { dispatch(clearAllMilestone()); navigate('add');}} >
                                <i className="fas fa-plus" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>

                    <div className="card-body at-elevation-z6 table-box">
                        {
                            (shimmerLoading) &&
                            <PlotListShimmer header={false} />
                        }

                        <div className="card-body-content" style={{ display: (shimmerLoading) ? 'none' : "block" }}>
                            {
                                (permissions?.indexOf('list') > -1 || permissions == "*") ?
                                    <div className="table-responsive mt-2 table table-bordered">
                                        <div style={{ overflowX: 'auto' }}>
                                            <div className="table-container">
                                                <div className="mt-2 table table-bordered">
                                                    <div>
                                                        <table id="datatable" className="table table-bordered dataTable">
                                                            <thead>
                                                                <tr>
                                                                    <th>Sl.</th>
                                                                    <th>MileStone</th>
                                                                   
                                                                    <th>Action</th>
                                                                </tr>
                                                            </thead>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <div>
                                        <table className="table dataTable mt-2">
                                            <thead>
                                                <tr>
                                                    <th>Sl.</th>
                                                    <th>Mileastone</th>
                                                   
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td colSpan={3} className="text-center">You don't have list permission</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                            }
                        </div>
                    </div>
                </div>




            </div>
        </>
    )
}
