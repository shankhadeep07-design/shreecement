import "datatables.net";
import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import $ from "jquery";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { FaFileExport } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Assuming you're using react-router-dom
import {
  getMyModulePermissionFun,
  getTableShimmer,
  tableToExcel,
} from "../../helper/common";
// import { rolesList } from '../../services/Role-service';
// import CsrPdProjectPaymentAddModal from './CsrPdProjectPaymentAddModal';
// import CsrPdProjectMonitoringAddModal from './CsrPdProjectMonitoringAddModal';
// import CsrPdProjectClosureAddModal from './CsrPdProjectClosureAddModal';
// import CsrPdProjectImpactAssessmentAddModal from './CsrPdProjectImpactAssessmentAddModal';
// import { useLoading } from '../../context/LoadingProvider';
// import CsrPdProjectNewImpactAssessmentAddModal from './CsrPdProjectNewImpactAssessmentAddModal';
// import { getcsrPdProjectList } from '../../services/Project-service';
// import CsrPdTransferModal from './CsrPdTransferModal';
import { getAuthToken } from "../../services/Helper";
import { PlusOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import ProjectAddEditForm from "./ProjectAddEditForm";
const ProjectList = () => {
  const [modulePermissions, setModulePermissions] = useState([]);
  useEffect(() => {
    getMyModulePermissionFun("csr_pd_project")
      .then((module) => {
        // console.log(module);
        setModulePermissions(module);
      })
      .catch((error) => {
        console.error("Error fetching module permissions:", error);
      });
  }, []);

  const navigate = useNavigate();
  const [modalKey, setModalKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [details, setDetails] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [closureId, setClosureId] = useState("");
  const [mode, setMode] = useState("");
  // let { loading, setLoading } = useLoading();
  const [toBeFilterData, setToBeFilterData] = useState({
    tproj_id: "",
  });
  const [dataArray, setDataArray] = useState([]);
  const [csrPDList, setCsrPDList] = useState([]);

  const handleProjectView = (items) => {
    window.open(
      `${import.meta.env.VITE_HOME_PAGE}/admin/project/view-list/${
        items.tproj_id
      }`,
      "_blank",
    );
  };

  const handleRoleAddModel = (project_details) => {
    setPaymentId("");
    setMode("add");
    setModalKey((prevKey) => prevKey + 1);
    setShowModal(true);
    setDetails("");
  };
  const closeModal = () => {
    setShowModal(false);
  };
  const editRole = (data) => {
    setModalKey((prevKey) => prevKey + 1);
    setDetails(data);
    setShowModal(true);
  };
  const editCsrProjectPayment = (proposalId) => {
    setPaymentId(proposalId);
    setMode("payment");
    setDetails(proposalId);
    setShowModal(true);
  };
  const viewCsrProjectDetails = (proposalId) => {
    navigate("/admin/project/csr-pd-view/" + proposalId);
  };
  const editCsrProjectMonitoring = (proposalId) => {
    setPaymentId(proposalId);
    setMode("monitoring");
    setDetails(proposalId);
  };
  const editCsrProjectClosure = (proposalId) => {
    setClosureId(proposalId);
    setMode("closure");
    setDetails(proposalId);
  };

  const editCsrProjectImpactAssessment = (proposalId) => {
    setClosureId(proposalId);
    setMode("impact");
    setDetails(proposalId);
  };
  const editCsrProject = (rowData) => {
    setMode("edit");
    setDetails(rowData); // 👉 pass full row data
    setShowModal(true);
  };
  const viewCsrProject = (viewId) => {
    setPaymentId(viewId);
    setMode("view");
    setModalKey((prevKey) => prevKey + 1);
    setDetails(viewId);
    setShowModal(true);
  };

  const maxBufferSize = 10;
  const initListDatatable = (my_url) => {
    // var i = 1;
    var authToken = getAuthToken();
    return $("#list_csr_project_table").DataTable({
      order: [[1, "desc"]],
      dom:
        "<'d-flex justify-content-between align-items-center mb-2'<'d-flex align-items-center'l><'d-flex'f>>" +
        "<'row'<'col-sm-12 plot-list-table-container'tr>>" +
        "<'row mt-2'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7 d-flex justify-content-end'p>>",
      buttons: [
        {
          text: "Export Excel",
          className: "btn-light",
          action: function (e, dt, node, config) {
            tableToExcel(
              "list_csr_project_table",
              "Project Organisation Type List",
            );
          },
        },
      ],
      pageLength: 10, // Set the limit to 20
      ajax: {
        url: my_url,
        type: "POST",
        data: function (d) {
          d.filterParams = toBeFilterData || {}; // You can add more parameters as needed
        },
        beforeSend: function (request) {
          // setLoading(true);
          // i = 1;
          setDataArray([]);
          request.setRequestHeader("Authorization", `Bearer ${authToken}`);
        },
      },
      paging: true,
      processing: false,
      serverSide: true,
      destroy: true,
      language: {
        loadingRecords: function () {
          return getTableShimmer(5, 8);
        },
      },
      initComplete: function (settings) {},
      drawCallback: function (settings) {
        // setLoading(false);  // Stop loading state after the table is drawn
      },
      columns: [
        {
          name: "id",
          render: function (data, type, full, meta) {
            var page = meta.settings._iDisplayStart;
            return page + meta.row + 1;
          },
          className: "text-center",
          searchable: false,
          orderable: false,
        },
        {
          name: "tproj_project_title",
          data: "tproj_project_title",
          className: "text-center",
          searchable: true,
          orderable: true,
          render: (data) => data ?? "N/A", // ✅
        },
        {
          name: "tsl_state_name",
          data: "tsl_state_name",
          className: "text-center",
          searchable: true,
          orderable: true,
          render: (data) => data ?? "N/A", // ✅
        },
        {
          name: "tdl_district_name",
          data: "tdl_district_name",
          className: "text-center",
          searchable: true,
          orderable: true,
          render: (data) => data ?? "N/A", // ✅
        },
        // {
        //   name: "tthm_theme_name",
        //   data: "tthm_theme_name",
        //   className: "text-center",
        //   searchable: true,
        //   orderable: true,
        //   render: (data) => data ?? "N/A", // ✅
        // },
        {
          name: "tproj_approved_type",
          data: "tproj_approved_type",
          className: "text-center",
          searchable: true,
          orderable: true,
          render: (data) => {
            if (!data) return "N/A";
            return data
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
              .replace("Other Then", "Other Than");
          },
        },
        {
          name: "tngo_name",
          data: "tngo_name",
          className: "text-center",
          searchable: true,
          orderable: true,
          render: (data) => data ?? "N/A", // ✅
        },
        {
          name: "action",
          data: "action",
          searchable: false,
          orderable: false,
          defaultContent: "",
        },
      ],
      columnDefs: [
        { targets: "_all", className: "dt-center1" },
        {
          name: "Action",
          targets: [6],
          className: "text-center",
          createdCell: (td, celldata, rowdata) => {
            const { tproj_id } = rowdata;

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
                    title="Action"
                  >
                    <i className="fa fa-ellipsis-h" aria-hidden="true"></i>
                  </button>

                  <ul className="dropdown-menu">
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => editCsrProject(rowdata)}
                      >
                        <i className="fa fa-edit"></i> Edit
                      </button>
                    </li>
                    <li>
                      {/* <a target='_blank'
                        href={`/shreecement/admin/project/view-list/${tproj_id}`}
                        className="btn btn-icon btn-sm btn-info-light rounded-pill"><i class='fa fa-eye'></i>View</a> */}
                      <button
                        className="dropdown-item"
                        onClick={() =>
                          window.open(
                            `/shreecement/admin/project/view-list/${tproj_id}`,
                            "_blank",
                          )
                        }
                      >
                        <i className="fa fa-eye"></i> View
                      </button>
                    </li>
                    {/*  
                    <li>
                      <a
                        target='_blank'
                        href={`/shreecement/admin/project/po-upload/${tproj_id}`}
                        className="btn btn-icon btn-sm btn-info-light rounded-pill"><i class='bx bx-slider-alt'></i>Purchase Order</a>
                    </li>
                    <li>
                      <a
                        target='_blank'
                        href={`/shreecement/admin/project/mou-upload/${tproj_id}`}
                        className="btn btn-icon btn-sm btn-info-light rounded-pill"><i class='bx bx-slider-alt'></i>MOU</a>
                    </li>


                    <li>
                      <a target='_blank'
                        href={`/shreecement/admin/project/payment/${tproj_id}`}
                        className="btn btn-icon btn-sm btn-info-light rounded-pill"><i class='bx bx-slider-alt'></i>Payment</a>
                    </li>
                    <li>
                      <a target='_blank'
                        href={`/shreecement/admin/project/monitoring/${tproj_id}`}
                        className="btn btn-icon btn-sm btn-info-light rounded-pill"><i class='bx bx-slider-alt'></i>Monitoring</a>
                    </li>
                     <li>
                      <a
                        target='_blank'
                        href={`/shreecement/admin/project/implementation/${tproj_id}`}
                        className="btn btn-icon btn-sm btn-info-light rounded-pill"><i class='bx bx-slider-alt'></i>Implementation</a>
                    </li> 


                    <li>
                      <a
                        target='_blank'
                        href={`/shreecement/admin/project/closure/${tproj_id}`}
                        className="btn btn-icon btn-sm btn-info-light rounded-pill"><i class='bx bx-slider-alt'></i>Closure</a>
                    </li>
                    <li>
                      <a
                        target='_blank'
                        href={`/shreecement/admin/project/impact_assessment/${tproj_id}`}
                        className="btn btn-icon btn-sm btn-info-light rounded-pill"><i class='bx bx-slider-alt'></i>Impact</a>
                    </li>


                    <li>
                      <a
                        target='_blank'
                        href={`/shreecement/admin/project/beneficiary/${tproj_id}`}
                        className="btn btn-icon btn-sm btn-info-light rounded-pill"><i class='bx bx-slider-alt'></i>Beneficiary</a>
                    </li> */}

                    {/*                     
                   
                    <li>
                      <a
                        target='_blank'
                        href={`/shreecement/admin/project/gantt_task/${tproj_id}`}
                        className="btn btn-icon btn-sm btn-info-light rounded-pill"><i class='bx bx-slider-alt'></i>Add Task</a>
                    </li>
                    <li>
                      <a
                        target='_blank'
                        href={`/shreecement/admin/project/gantt_details/${tproj_id}`}
                        className="btn btn-icon btn-sm btn-info-light rounded-pill"><i class='bx bx-slider-alt'></i>Gantt Chart</a>
                    </li> */}
                  </ul>
                </div>
              </>,
            );
          },
        },
      ],
    });
  };
  useEffect(() => {
    var my_url = `${import.meta.env.VITE_API_URL}/admin/projects/projects-list/datatable`;
    // var dataTable = initListDatatable(my_url);

    // if (modulePermissions.indexOf('list') > -1) {
    // }
    var dataTable = initListDatatable(my_url);
    return () => {
      if (dataTable) dataTable.destroy();
    };
    // }, [modulePermissions]);
  }, []);

  const getAllExportData = () => {
    // getcsrPdProjectList().then((response) => {
    //     // console.log("response   ", response);
    //     setCsrPDList(response.data);
    // });
  };

  useEffect(() => {
    if (csrPDList.length > 0) {
      tableToExcel("new-table", "CSR/PD List"); // Trigger export once data is set
    }
  }, [csrPDList]);

  //----------------------Transfer Modal Part -----------------------
  const [csrPdTranferModalShow, setCsrPdTranferModalShow] = useState(false);
  const [projectDetails, setProjectDetails] = useState(false);
  const csrPdTranferModalShowFun = (data) => {
    setProjectDetails(data);
    setCsrPdTranferModalShow(true);
  };

  const csrPdTranferModalCloseFun = (data) => {
    setCsrPdTranferModalShow(false);
  };
  const handleAddProject = () => {
    setMode("add");
    setDetails("");
    setShowModal(true);
  };

  return (
    <>
      <div className="home-content">
        <div className="card pb-3">
          <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
            <h5 className="mb-0 float-left">Projects List</h5>
            {/* {(modulePermissions.indexOf('add') > -1) && ( */}
            <button
              className="btn btn-dark btn-sm"
              style={{ marginRight: "10px" }}
              onClick={() => handleAddProject()}
            >
              <PlusOutlined /> Add Project
            </button>
            {/* )} */}
            {modulePermissions.indexOf("export") > -1 && (
              <button
                className="btn btn-success btn-sm"
                style={{ marginLeft: "10px" }}
                onClick={() => getAllExportData()}
              >
                <FaFileExport /> Export
              </button>
            )}
          </div>

          <div className="card-body">
            <div className="table-responsive" style={{ minHeight: "200px" }}>
              <table
                className="table text-nowrap table-bordered"
                id="list_csr_project_table"
              >
                <thead>
                  <tr>
                    <th className="text-start" style={{ width: "5%" }}>
                      Sl
                    </th>
                    <th>Project Title</th>
                    <th>State</th>
                    <th>District</th>
                    <th>Approved Type</th>
                    {/* <th>Theme Name</th> */}
                    <th>NGO Name</th>

                    <th className="text-center" style={{ width: "5%" }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div></div>

      <div style={{ display: "none" }}>
        <table
          id="new-table"
          style={{ fontSize: "9pt" }}
          className="table table-striped table-hover"
        >
          <thead>
            <tr>
              <th>Serial No</th>
              <th>Unique ID</th>
              <th>Name</th>
              <th>Region</th>
              <th>Mines</th>
              <th>District</th>
              <th>Block</th>
              <th>Gram Panchayat</th>
              <th>Village</th>
              <th>Approved Type</th>
              <th>Created By</th>
            </tr>
          </thead>
          <tbody>
            {csrPDList.map((data, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{`${data?.tpu_financial_year || ""}/${
                  data?.tpu_proposal_type?.toUpperCase() || ""
                }/${data?.tpu_unique_id ?? ""}`}</td>
                <td>{data.tcpp_project_name}</td>
                <td>{data.treg_region_name}</td>
                <td>{data.tmin_mine_name}</td>
                <td>{data.tdl_district_name}</td>
                <td>{data.tbl_block_name}</td>
                <td>{data.tgm_grampanchyat_name}</td>
                <td>{data.tvill_village_name}</td>
                <td>
                  {data?.tproj_approved_type
                    ? data.tproj_approved_type
                        .split("_")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")
                        .replace("Other Then", "Other Than")
                    : "N/A"}
                </td>
                <td>{data.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        title={mode === "add" ? "Add Project" : "Edit Project"}
        open={showModal} // ✅ instead of "show"
        onCancel={() => setShowModal(false)} // ✅ instead of onHide
        footer={null} // ✅ remove default OK/Cancel buttons
        // width={900}                     // ✅ similar to size="lg"
        centered
        destroyOnClose // ✅ reset form on close (important)
        //      open={open}
        // onCancel={closeModal}
        // footer={null}
        width={1000}
        bodyStyle={{
          maxHeight: "75vh",
          overflowY: "auto",
          paddingRight: "10px",
        }}
      >
        <ProjectAddEditForm
          mode={mode}
          details={details}
          closeModal={() => setShowModal(false)}
          reloadTable={() => {
            $("#list_csr_project_table").DataTable().ajax.reload();
          }}
        />
      </Modal>
    </>
  );
};

export default ProjectList;
