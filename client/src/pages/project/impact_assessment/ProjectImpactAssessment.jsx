import $ from 'jquery';
import { useEffect, useState } from 'react';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import ReactDOM from "react-dom/client";
import { toast, Toaster } from "react-hot-toast";
import { useLoading } from '../../../context/LoadingContext.jsx';
import { useParams } from "react-router-dom";


import { getMyModulePermissionFun, getTableShimmer } from "../../../helper/common.js";
import { getAuthToken } from "../../../services/Helper.js";
import AddEditProjectImpactAssessment from './AddEditProjectImpactAssessment.jsx';
import { Descriptions } from 'antd';
import { projectDetailsApi } from '../../../services/Project-service.js';


export const ProjectImpactAssessment = () => {
    const [projectDetails, setProjectDetails] = useState([]);

    let { loading, setLoading } = useLoading(false);
    const [showModal, setShowModal] = useState(false);
    let [editList, setEditList] = useState("#ffffff");
    let datatable_url = `${import.meta.env.VITE_API_URL}/admin/projects/impact-assessment/datatable`;
    const [permissions, setPermissions] = useState([])
    const [isOpenUpsertModal, setIsOpenUpsertModal] = useState(false);
    const { tproj_id } = useParams();

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
        setIsOpenUpsertModal(true);
    };

    const editFun = (data) => {
        setEditList(data);
        setIsOpenUpsertModal(true);
        changeModalStatus("user_update_modal", true);
    };


    const initiatedDistrictDatatable = () => {
        var i = 1;
        var authToken = getAuthToken();
        var my_url = `${import.meta.env.VITE_API_URL}/admin/projects/impact-assessment/datatable`;

        if ($.fn.DataTable.isDataTable("#initiated-ImpactAssessment-datatable")) {
            $("#initiated-ImpactAssessment-datatable").DataTable().destroy();
        }
        $("#initiated-ImpactAssessment-datatable").DataTable({

            paging: false,        // ❌ disable pagination
            lengthChange: false,  // ❌ hide "10 entries per page" dropdown
            info: false,          // ❌ hide "Showing X of Y entries" text (optional)
            searching: false,     // ❌ hide search box (optional)
            ordering: false,
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
                    d.project_id = tproj_id; // 👈 PASS PROJECT ID HERE
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
                    name: "tpia_actual_beneficiary",
                    data: "tpia_actual_beneficiary",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tpia_before_after_comparison",
                    data: "tpia_before_after_comparison",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tpia_is_80g_applicable",
                    data: "tpia_is_80g_applicable",
                    searchable: true,
                    orderable: true,
                },


                {
                    name: "tpia_csr1_form_number",
                    data: "tpia_csr1_form_number",
                    searchable: true,
                    orderable: true,
                },

                {
                    name: "documents",
                    data: "documents",
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
                    targets: [5], // 👈 documents column index
                    createdCell: (td, cellData) => {
                        ReactDOM.createRoot(td).render(
                            <>
                                {Array.isArray(cellData) && cellData.length > 0 ? (
                                    <ul className="list-unstyled mb-0">
                                        {cellData.map((doc) => (
                                            <li key={doc.tdoc_id}>
                                                <a
                                                    href={doc.full_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download
                                                    style={{ textDecoration: 'none', color: '#1890ff' }}
                                                >
                                                    {doc.doc_name}
                                                </a>
                                            </li>

                                        ))}
                                    </ul>
                                ) : (
                                    <span className="text-muted">No documents</span>
                                )}
                            </>
                        );
                    },
                },


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
                                                        Edit ImpactAssessment
                                                    </span>
                                                </button>
                                            </li>
                                        }
                                        <li>
                                            <a
                                                target="_blank"
                                                href={`/coromandel/admin/project/impact_assessment/view-list/${record?.tpia_id}`}
                                                className="dropdown-item"
                                            >
                                                <span style={{ marginRight: "5px" }}>
                                                    <i className="bx bx-slider-alt"></i>
                                                </span>
                                                <span>View</span>
                                            </a>
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

    useEffect(() => {
        // if(permissions.indexOf('list') > -1){
        initiatedDistrictDatatable();
        // }

    }, [permissions]);


    const fetchProjectDetailsFun = () => {
        projectDetailsApi({ tproj_id }).then(({ data }) => {
            if (!data) return;
            setProjectDetails(data);
        }).catch((error) =>
            toast.error(error?.response?.data?.originalError || error?.response?.data?.message)
        );
    }

    useEffect(() => {
        fetchProjectDetailsFun();
    }, []);


    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{ duration: 2000 }}
                reverseOrder={false}></Toaster>

            <span className="position-absolute trigger"></span>

            {/* This is a side bar */}
            <div className="home-content">

                {/* <div className="card pb-3">
                    <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
                        <h5 className="mb-0 float-left">
                            Project Details
                        </h5>

                    </div>
                    <div className="card-body at-elevation-z6 table-box" style={{ maxHeight: "calc(100vh - 23vh);", overflowX: 'auto' }}>


                        <Descriptions
                            column={2}
                            size="middle"
                            labelStyle={{ fontWeight: 500 }}
                            contentStyle={{ background: '#fafafa', padding: '8px 12px', borderRadius: 6 }}
                        >

                            <Descriptions.Item label="Project Title">{projectDetails?.tproj_proposal_name || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Financial Year">{projectDetails?.tfy_year_label || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Theme">{projectDetails?.theme_name || 'N/A'}</Descriptions.Item>

                        </Descriptions>
                    </div>

                </div> */}

                <div className="card pb-3">
                    <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
                        <h5 className="mb-0 float-left">
                            ImpactAssessment List
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
                                <i class="fa-solid fa-plus"></i> Add ImpactAssessment

                            </button>

                        </div>
                        {/* } */}
                    </div>
                    <div className="card-body at-elevation-z6 table-box" style={{ maxHeight: "calc(100vh - 23vh);", overflowX: 'auto' }}>
                        <div class="collapse" id="collapseExample">
                            <div class="">

                            </div>
                        </div>

                        <div className="initiated-ImpactAssessment-table-container">
                            <div className="mt-2 table table-bordered">
                                <div>
                                    {/* {(permissions.indexOf('list') > -1) ? */}
                                    <table id="initiated-ImpactAssessment-datatable" className="table table-bordered dataTable">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Actual Beneficiary</th>
                                                <th>Before After Comparison</th>
                                                <th>Is 80g applicable</th>
                                                <th>Csr1 Form Number</th>
                                                <th>Documets</th>
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
                    {isOpenUpsertModal && (
                        <AddEditProjectImpactAssessment
                            visible={isOpenUpsertModal}
                            onClose={() => {
                                setIsOpenUpsertModal(false);
                            }}
                            data={editList}
                            fetchData={() => {
                                initiatedDistrictDatatable();   // refresh datatable
                            }}
                        />
                    )}
                </div>

            </div>
        </>
    )
}
