import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import ScaleLoader from "react-spinners/ScaleLoader";
import toast, { Toaster } from "react-hot-toast";
import Select from "react-select";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import ReactDOM from "react-dom/client";
import { Table, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useLoading } from '../../../context/LoadingContext';

import { capitalizeAfterSpace } from '../../../helper/common';


import {
    getProjectList, deleteProjectService
} from "../../../Services/Project-service";
import {
    FaEllipsisH,
    FaPencilAlt,
    FaTrash,
    FaRegPlusSquare,
} from "react-icons/fa";

import { Modal, Dropdown, Button, Accordion } from "react-bootstrap";

import { AddProject } from "./AddProject";
import { AssignSite } from "./AssignSite";
import { AssignPlot } from "./AssignPlot";
import ProjectFilter from "./ProjectFilter"
import $ from "jquery";

import { getAuthToken } from "../../../services/Helper";
import { tableToExcel, getTableShimmer } from "../../../helper/common";

import { useSelector, useDispatch } from "react-redux";
import {
    setSelectedVillage,
    setUpdateRecord, clearAllProjectState, clearAllState
} from "../../../redux/slices/ProjectMasterSlice";

import { getPlostByProjectId } from '../../../Services/Plot-service';

const ProjectManagement = () => {
    let { loading, setLoading } = useLoading(false);
    const [showModal, setShowModal] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [deleteData, setDeleteData] = useState(null);
    const [filterProjectList, setFilterProjectList] = useState([])

    const [stateForSiteList, setStateForSiteList] = useState(null);

    let navigate = useNavigate();

    let [plotListLoader, setPlotListLoader] = useState(true);
    const handleSearch = (value) => {
        setSearchText(value);
    };
    const [updateProjectValues, setUpdateProjectValues] = useState({});
    const [filterValues, setFilterValues] = useState({});

    var dispatch = useDispatch();

    function deleteRecord(id) {
        setDeleteData(id)
    }


    function assignSiteModal(data) {
        setUpdateProjectValues(data)
        changeModalStatus('assignSiteModal', true)
    }

    async function assignPlotModal(record) {
        if (record?.tpm_id) {
            var data = {
                data: {
                    projectId: record?.tpm_id
                }
            }
            await getPlostByProjectId(data).then(response => {
                if (response.status) {
                    if (response.data) {
                        dispatch(setUpdateRecord(record));
                        dispatch(setSelectedVillage(response.data))
                    } else {
                        dispatch(setUpdateRecord(record));
                        dispatch(setSelectedVillage([]))
                    }
                } else {
                    toast.error(response.message);
                }
            }).catch(err => {
                toast.error(err.message);
            })

            changeModalStatus('assignPlotModal', true)
        }
    }

    const initiatedProjectDatatable = () => {
        var i = 1;
        var authToken = getAuthToken();
        var my_url = `${process.env.REACT_APP_API_URL}/admin/project-management/initiated-datatable`;
        if ($.fn.DataTable.isDataTable("#initiated-project-datatable")) {
            $("#initiated-project-datatable").DataTable().destroy();
        }
        $("#initiated-project-datatable").DataTable({
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
                console.log('Init complete');
                setPlotListLoader(false);
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
                    name: "tpm_project_name",
                    data: "tpm_project_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tsl_state_name",
                    data: "tsl_state_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tsm_name",
                    data: "tsm_name",
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
                    name: "ttll_taluka_name",
                    data: "ttll_taluka_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tpm_oaf_no",
                    data: "tpm_oaf_no",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tpm_wbs_no",
                    data: "tpm_wbs_no",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tpm_total_land_planned",
                    data: "tpm_total_land_planned",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tpm_total_no_location",
                    data: "tpm_total_no_location",
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
                                        <li>
                                            <button
                                                className="dropdown-item"
                                                href="javascript:void(0)"
                                                onClick={() => {
                                                    dispatch(clearAllProjectState());
                                                    navigate(`add/${record.tpm_id}`)
                                                }}>
                                                <span style={{ marginRight: "5px" }}>
                                                    <i class="fa-solid fa-pen-to-square"></i>
                                                </span>
                                                <span>
                                                    Edit Project
                                                </span>
                                            </button>

                                        </li>
                                        <li>
                                            <button
                                                className="dropdown-item"
                                                href="javascript:void(0)"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigate(`acquisition-activity/${btoa(record.tpm_project_name)}/${btoa(record.tpm_id)}/aggregator-assign`)
                                                }}>
                                                <span style={{ marginRight: "5px" }}>
                                                    <i class="fa-solid fa-link"></i>
                                                </span>
                                                <span> Acquisition Activity</span>
                                            </button>
                                        </li>

                                    </ul>
                                </div>

                            </>
                        );
                    },
                },
            ]
        });
    };

    const approvedProjectDatatable = () => {
        var i = 1;
        var authToken = getAuthToken();
        var my_url = `${process.env.REACT_APP_API_URL}/admin/project-management/approved-datatable`;
        if ($.fn.DataTable.isDataTable("#approved-project-datatable")) {
            $("#approved-project-datatable").DataTable().destroy();
        }
        $("#approved-project-datatable").DataTable({
            order: [[1, "asc"]],
            dom: "<'d-flex justify-content-between align-items-center mb-2'<'d-flex align-items-center'Bl><'d-flex'f>>" +
                "<'row overflow-x-auto'<'col-sm-12'tr>>" +
                "<'row mt-2'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 d-flex justify-content-end'p>>",
            language: {
                lengthMenu: "_MENU_"
            },
            buttons: [
                // {
                //   text: 'Export', // Button text
                //   action: function (e, dt, node, config) {
                //     tableToExcel('initiated-project-datatable','SPV Management List')
                //   },
                // },
            ],
            // scrollX: true,
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
                console.log('Init complete');
                setPlotListLoader(false);
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
                    name: "tpm_project_name",
                    data: "tpm_project_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tpm_project_description",
                    data: "tpm_project_description",
                    searchable: true,
                    orderable: true,
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
                    name: "ttll_taluka_name",
                    data: "ttll_taluka_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tun_name",
                    data: "tun_name",
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
                    name: "tspvm_name",
                    data: "tspvm_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tspvm_code",
                    data: "tspvm_code",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tpm_status",
                    data: "tpm_status",
                    searchable: true,
                    orderable: true,
                    render: function (data) {
                        if (data.toLowerCase() == 'approved')
                            return `<span class="badge rounded-pill bg-label-success">Approved</span>`;
                        else
                            return `<span class="badge rounded-pill bg-label-warning">Unknown</span>`;

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
                { targets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], className: 'dt-center' },
                {
                    name: 'Action',
                    targets: [11],
                    createdCell: (td, celldata, record) => {
                        ReactDOM.createRoot(td).render(
                            <>

                                <div class="dropdown">
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
                                        <li>
                                            <button
                                                className="dropdown-item"
                                                href="javascript:void(0)"
                                                onClick={() => assignPlotModal(record)}>
                                                <span style={{ marginRight: "5px" }}>
                                                    <i class="fa-solid fa-link"></i>
                                                </span>
                                                <span> Assign Plot</span>
                                            </button>
                                        </li>

                                        <li>
                                            <button
                                                className="dropdown-item"
                                                href="javascript:void(0)"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigate(`acquisition-stages/${btoa(record.tpm_project_name)}/${btoa(record.tpm_id)}`)
                                                }}>
                                                <span style={{ marginRight: "5px" }}>
                                                    <i class="fa-solid fa-link"></i>
                                                </span>
                                                <span> Acquisition Stages</span>
                                            </button>
                                        </li>

                                        <li>
                                            <button
                                                className="dropdown-item"
                                                href="javascript:void(0)"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    navigate(`track-acquisition/${btoa(record.tpm_project_name)}/${btoa(record.tpm_id)}`)
                                                }}>
                                                <span style={{ marginRight: "5px" }}>
                                                    <i class="fa-solid fa-link"></i>
                                                </span>
                                                <span> Track Acquisition</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>

                            </>
                        );
                    },
                },
            ],
        });
    };

    const rejectedProjectDatatable = () => {
        var i = 1;
        var authToken = getAuthToken();
        var my_url = `${process.env.REACT_APP_API_URL}/admin/project-management/rejected-datatable`;
        if ($.fn.DataTable.isDataTable("#rejected-project-datatable")) {
            $("#rejected-project-datatable").DataTable().destroy();
        }
        $("#rejected-project-datatable").DataTable({
            order: [[1, "asc"]],
            dom: "<'d-flex justify-content-between align-items-center mb-2'<'d-flex align-items-center'Bl><'d-flex'f>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row mt-2'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 d-flex justify-content-end'p>>",
            language: {
                lengthMenu: "_MENU_"
            },
            buttons: [
                // {
                //   text: 'Export', // Button text
                //   action: function (e, dt, node, config) {
                //     tableToExcel('initiated-project-datatable','SPV Management List')
                //   },
                // },
            ],
            // scrollX: true,
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
                console.log('Init complete');
                setPlotListLoader(false);
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
                    name: "tpm_project_name",
                    data: "tpm_project_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tpm_project_description",
                    data: "tpm_project_description",
                    searchable: true,
                    orderable: true,
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
                    name: "ttll_taluka_name",
                    data: "ttll_taluka_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tun_name",
                    data: "tun_name",
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
                    name: "tspvm_name",
                    data: "tspvm_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tspvm_code",
                    data: "tspvm_code",
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
                { targets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], className: 'dt-center' },
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
                                        <li>
                                            <button
                                                className="dropdown-item"
                                                href="javascript:void(0)"
                                                onClick={() => updateProjectOnClick(record)}>
                                                <span style={{ marginRight: "5px" }}>
                                                    <i className="fa fa-pen"></i>
                                                </span>
                                                <span> Edit</span>
                                            </button>
                                        </li>

                                        <li>
                                            <button
                                                className="dropdown-item text-danger"
                                                href="javascript:void(0)"
                                                onClick={() => deleteRecord(record.tpm_id)}
                                            >
                                                <span style={{ marginRight: "5px" }}>
                                                    <i className="fa fa-trash"></i>
                                                </span>
                                                <span> Delete</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>

                            </>
                        );
                    },
                },
            ],
        });
    };

    const closedProjectDatatable = () => {
        var i = 1;
        var authToken = getAuthToken();
        var my_url = `${process.env.REACT_APP_API_URL}/admin/project-management/closed-datatable`;
        if ($.fn.DataTable.isDataTable("#closed-project-datatable")) {
            $("#closed-project-datatable").DataTable().destroy();
        }
        $("#closed-project-datatable").DataTable({
            order: [[1, "asc"]],
            dom: "<'d-flex justify-content-between align-items-center mb-2'<'d-flex align-items-center'Bl><'d-flex'f>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row mt-2'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 d-flex justify-content-end'p>>",
            language: {
                lengthMenu: "_MENU_"
            },
            buttons: [
                // {
                //   text: 'Export', // Button text
                //   action: function (e, dt, node, config) {
                //     tableToExcel('initiated-project-datatable','SPV Management List')
                //   },
                // },
            ],
            // scrollX: true,
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
                console.log('Init complete');
                setPlotListLoader(false);
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
                    name: "tpm_project_name",
                    data: "tpm_project_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tpm_project_description",
                    data: "tpm_project_description",
                    searchable: true,
                    orderable: true,
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
                    name: "ttll_taluka_name",
                    data: "ttll_taluka_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tun_name",
                    data: "tun_name",
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
                    name: "tspvm_name",
                    data: "tspvm_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tspvm_code",
                    data: "tspvm_code",
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
                { targets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], className: 'dt-center' },
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
                                        <li>
                                            <button
                                                className="dropdown-item"
                                                href="javascript:void(0)"
                                                onClick={() => updateProjectOnClick(record)}>
                                                <span style={{ marginRight: "5px" }}>
                                                    <i className="fa fa-pen"></i>
                                                </span>
                                                <span> Edit</span>
                                            </button>
                                        </li>

                                        <li>
                                            <button
                                                className="dropdown-item text-danger"
                                                href="javascript:void(0)"
                                                onClick={() => deleteRecord(record.tpm_id)}
                                            >
                                                <span style={{ marginRight: "5px" }}>
                                                    <i className="fa fa-trash"></i>
                                                </span>
                                                <span> Delete</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>

                            </>
                        );
                    },
                },
            ],
        });
    };

    useEffect(() => {
        initiatedProjectDatatable();
        // approvedProjectDatatable();
        // rejectedProjectDatatable();
        // closedProjectDatatable();
    }, [])

    const ProjectDeleteOnClick = () => {

        setLoading(true);
        deleteProjectService(deleteData)
            .then((res) => {
                setLoading(false);
                toast.success(res.message);
                setDeleteData(null)
                initiatedProjectDatatable();
            })
            .catch((error) => {
                toast.error(error.response.data.message);
                setDeleteData(null)
                setLoading(false);
            });
    }

    const getAllProjectList = (filt) => {
        getProjectList(filt).then((response) => {
            setFilterProjectList(response.data)
            setLoading(false)
        });
    }

    useEffect(() => {
        getAllProjectList(filterValues);
    }, [filterValues]);



    const columns = [
        {
            title: "Sl. No.",
            dataIndex: "id",
            render: (text, record, index) => index + 1,
            width: "10%",
        },
        {
            title: "Project Name",
            dataIndex: "tpm_project_name",
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) =>
                Object.values(record).some(
                    (val) =>
                        val && val.toString().toLowerCase().includes(value.toLowerCase())
                ),
            render: (text, record) => {
                return <>{record?.tpm_project_name}</>;
            },
        },
        {
            title: "Project Description",
            dataIndex: "tpm_project_description",
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) =>
                Object.values(record).some(
                    (val) =>
                        val && val.toString().toLowerCase().includes(value.toLowerCase())
                ),
            render: (text, record) => {
                return <>{record?.tpm_project_description}</>;
            },
        },
        {
            title: "State",
            dataIndex: "tsl_state_name",
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) =>
                Object.values(record).some(
                    (val) =>
                        val && val.toString().toLowerCase().includes(value.toLowerCase())
                ),
            render: (text, record) => {
                return <>{record.tsl_state_name}</>;
            },
        },
        {
            title: "District",
            dataIndex: "tdl_district_name",
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) =>
                Object.values(record).some(
                    (val) =>
                        val && val.toString().toLowerCase().includes(value.toLowerCase())
                ),
            render: (text, record) => {
                return <>{record.tdl_district_name}</>;
            },
        },
        {
            title: "Taluka",
            dataIndex: "ttll_taluka_name",
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) =>
                Object.values(record).some(
                    (val) =>
                        val && val.toString().toLowerCase().includes(value.toLowerCase())
                ),
            render: (text, record) => {
                return <>{record.ttll_taluka_name}</>;
            },
        },
        {
            title: "Unit Name",
            dataIndex: "tun_name",
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) =>
                Object.values(record).some(
                    (val) =>
                        val && val.toString().toLowerCase().includes(value.toLowerCase())
                ),
            render: (text, record) => {
                return <>{record.tun_name}</>;
            },
        },
        {
            title: "Village Name",
            dataIndex: "tvl_village_name",
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) =>
                Object.values(record).some(
                    (val) =>
                        val && val.toString().toLowerCase().includes(value.toLowerCase())
                ),
            render: (text, record) => {
                return <>{record.tvl_village_name}</>;
            },
        },
        {
            title: "Profit Center No.",
            dataIndex: "tpm_profit_center",
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value, record) =>
                Object.values(record).some(
                    (val) =>
                        val && val.toString().toLowerCase().includes(value.toLowerCase())
                ),
            render: (text, record) => {
                return <>{record.tpm_profit_center}</>;
            },
        },
        {
            title: "Actions",
            render: (text, record) => (

                <Dropdown>
                    <Dropdown.Toggle
                        variant="secondary"
                        id={`dropdown-${record.ti_id}`}
                        size="sm">
                        <FaEllipsisH style={{ marginRight: "5px" }} />
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => updateProjectOnClick(record)}>
                            <FaPencilAlt style={{ marginRight: "5px" }} />
                            Edit
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => setDeleteData(record.tpm_id)}>
                            <FaTrash style={{ marginRight: "5px" }} />
                            Delete
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            ),
        },
    ];

    const getFilterVal = (data) => {
        setFilterValues(data);
    }

    const updateProjectOnClick = (data) => {
        setUpdateProjectValues({
            tpm_id: data?.tpm_id,
            tpm_project_name: data?.tpm_project_name,

            tpm_oaf_no: data?.tpm_oaf_no,
            tpm_wbs_no: data?.tpm_wbs_no,
            tpm_pr_no_for_land: data?.tpm_pr_no_for_land,
            tpm_pr_no_for_title_deed: data?.tpm_pr_no_for_title_deed,
            tpm_pr_no_services: data?.tpm_pr_no_services,
            tpm_po_no_for_land: data?.tpm_po_no_for_land,
            tpm_po_no_for_title_deed: data?.tpm_po_no_for_title_deed,
            tpm_po_no_services: data?.tpm_po_no_services,
            tpm_total_land_planned: data?.tpm_total_land_planned,
            tpm_total_no_location: data?.tpm_total_no_location,
            tpm_board_approval: data?.tpm_board_approval,

            tpm_state_id: { label: data?.tsl_state_name, value: data?.tpm_state_id },
            tpm_district_id: { label: data?.tdl_district_name, value: data?.tpm_district_id },
            tpm_taluka_id: { label: data?.ttll_taluka_name, value: data?.tpm_taluka_id }

        });
        changeModalStatus('addModal', true);
    }

    const changeModalStatus = (key, value) => {
        setShowModal((prevObj) => {
            return {
                ...prevObj,
                [key]: value
            }
        });
    }

    const clearUpdateValues = () => {
        setUpdateProjectValues({})
    }

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
                            Project List
                        </h5>
                        <div className="float-right">
                            <button
                                type="button"
                                style={{ marginRight: "10px" }}
                                className="btn btn-sm btn-dark"
                                onClick={() =>{
                                    dispatch(clearAllProjectState())
                                    navigate('add')
                                }
                                    
                                }>
                                <i class="fa-solid fa-plus"></i> Add New Project

                            </button>

                            <button
                                type="button"
                                className="btn btn-sm btn-dark"
                                data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-controls="collapseExample"
                            >
                                <i class="fa-solid fa-filter-list"></i> Filter
                            </button>
                        </div>
                    </div>

                    <div className="card-body at-elevation-z6 table-box" style={{ maxHeight: "calc(100vh - 23vh);", overflowX: 'auto' }}>
                        <div class="collapse" id="collapseExample">
                            <div class="">
                                <ProjectFilter getFilterVal={getFilterVal} />
                            </div>
                        </div>

                        <div className="initiated-project-table-container">
                            <h6>Initiated Project List</h6>
                            <hr className="my-1" />
                            <div className="mt-2 table table-bordered">
                                <div>
                                    <table id="initiated-project-datatable" className="table table-bordered dataTable">
                                        <thead>
                                            <tr>
                                                {/* <td></td> */}
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>State</th>
                                                <th>Site</th>
                                                <th>District</th>
                                                <th>Taluka</th>
                                                <th>OAF Numder</th>
                                                <th>WBS Number</th>
                                                <th>Total Land Planned To Be Acquired</th>
                                                <th>Total Number of Locations</th>


                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="allModals">
                </div>

            </div>
        </>
    )
}

export default ProjectManagement;