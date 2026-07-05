import $ from 'jquery';
import { useEffect, useState } from 'react';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import ReactDOM from "react-dom/client";
import { Toaster } from 'react-hot-toast';
import { useLoading } from '../../../context/LoadingContext';

import { Descriptions } from 'antd';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMyModulePermissionFun, getTableShimmer } from "../../../helper/common";
import { getAuthToken } from "../../../services/Helper.js";
import { projectDetailsApi } from '../../../services/Project-service.js';
import AddEditProjectBeneficiary from './AddEditProjectBeneficiary.jsx';



export const ProjectBeneficiary = () => {
    let { loading, setLoading } = useLoading(false);
    const [showModal, setShowModal] = useState(false);
    let [editDistrict, setEditDistrict] = useState("#ffffff");
    let datatable_url = `${import.meta.env.VITE_API_URL}/admin/projects/beneficiary/datatable`;
    const [permissions, setPermissions] = useState([])
    const [isOpenUpsertModal, setIsOpenUpsertModal] = useState(false);
    const [projectDetails, setProjectDetails] = useState([]);
    const tproj_id = useParams()?.tproj_id;
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
        setEditDistrict("");
        changeModalStatus("user_update_modal", true);
        setIsOpenUpsertModal(true);
    };

    const editFun = (data) => {
        setEditDistrict(data);
        setIsOpenUpsertModal(true);
        changeModalStatus("user_update_modal", true);
    };


    const initiatedDistrictDatatable = () => {
        var i = 1;
        var authToken = getAuthToken();
        var my_url = `${import.meta.env.VITE_API_URL}/admin/projects/beneficiary/datatable/${tproj_id}`;

        if ($.fn.DataTable.isDataTable("#initiated-Beneficiary-datatable")) {
            $("#initiated-Beneficiary-datatable").DataTable().destroy();
        }
        $("#initiated-Beneficiary-datatable").DataTable({
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
                    name: "tben_name",
                    data: "tben_name",
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
                    name: "tbl_block_name",
                    data: "tbl_block_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tloc_location_name",
                    data: "tloc_location_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "gender_name",
                    data: "gender_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tben_phone",
                    data: "tben_phone",
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
                                        <li>
                                            <a
                                                className="dropdown-item"
                                                href={`/coromandel/admin/project/monitoring/view-list/${record?.tpmon_id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <span style={{ marginRight: "5px" }}>
                                                    <i className="bx bx-slider-alt"></i>
                                                </span>
                                                <span>View Beneficiary</span>
                                            </a>
                                        </li>

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
                                                        Edit Beneficiary
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

    const fetchProjectDetailsFun = () => {
        projectDetailsApi({ tproj_id }).then(({ data }) => {
            if (!data) return;
            setProjectDetails(data[0]);
        }).catch((error) =>
            toast.error(error?.response?.data?.originalError || error?.response?.data?.message)
        );
    }

    useEffect(() => {
        fetchProjectDetailsFun();
    }, []);

    // console.log("projectDetails---------------- ", projectDetails);



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
                            <Descriptions.Item label="Project Details in Brief">{projectDetails?.tproj_introduction || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Background and Need">{projectDetails?.tproj_background_need || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Objectives">{projectDetails?.tproj_objectives || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Scope of the Project">{projectDetails?.tproj_scope_of_the_project || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Activities">{projectDetails?.tproj_activities || 'N/A'}</Descriptions.Item>

                        </Descriptions>
                    </div>
                </div> */}

                <div className="card pb-3">
                    <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
                        <h5 className="mb-0 float-left">
                            Beneficiary List
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
                                <i class="fa-solid fa-plus"></i> Add Beneficiary

                            </button>

                        </div>
                        {/* } */}
                    </div>
                    <div className="card-body at-elevation-z6 table-box" style={{ maxHeight: "calc(100vh - 23vh);", overflowX: 'auto' }}>
                        <div class="collapse" id="collapseExample">
                            <div class="">

                            </div>
                        </div>

                        <div className="initiated-Beneficiary-table-container">
                            <div className="mt-2 table table-bordered">
                                <div>
                                    {/* {(permissions.indexOf('list') > -1) ? */}
                                    <table id="initiated-Beneficiary-datatable" className="table table-bordered dataTable">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Beneficiary Name</th>
                                                <th>State</th>
                                                <th>District</th>
                                                <th>Block</th>
                                                <th>Location</th>
                                                <th>Gender</th>
                                                <th>Phone</th>
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
                        <AddEditProjectBeneficiary
                            // <AddEditEnvironmentMangrove
                            visible={isOpenUpsertModal}
                            onClose={() => {
                                setIsOpenUpsertModal(false);
                                // setSelectedData({});
                            }}
                            data={editDistrict}
                            fetchData={initiatedDistrictDatatable}
                        />
                    )}
                </div>

            </div>
        </>
    )
}
