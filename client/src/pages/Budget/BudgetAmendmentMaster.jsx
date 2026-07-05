import $ from 'jquery';
import React, { useEffect, useState } from 'react';
import { Modal } from "react-bootstrap";
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import ReactDOM from "react-dom/client";
import { Toaster } from 'react-hot-toast';
import { FaFileExport } from "react-icons/fa";
import { getMyModulePermissionFun, getTableShimmer } from "../../helper/common.js";
import { getBudgetAmendmentListDatatable } from '../../Services/Budget-service.js';
import { getAuthToken, tableToExcel } from "../../Services/Helper";
import { AddEditBudgetAmendment } from "./AddEditBudgetAmendment.jsx";
import { currentFinancialYear } from '../../Services/Master-service.js';
import Select from "react-select";
export const BudgetAmendmentMaster = () => {
    const [showModal, setShowModal] = useState(false);
    let [editBudgetAmendment, setEditBudgetAmendment] = useState("#ffffff");
    const [budgetAmendmentList, setBudgetAmendmentList] = useState([]);
    let datatable_url = `${process.env.REACT_APP_API_URL}/admin/budget/amendment/initiated-datatable`;
    const [permissions, setPermissions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
   const [toBeFilterData, setToBeFilterData] = useState({
        tbm_fy_year_id: "",
      });
    useEffect(() => {
        getMyModulePermissionFun('budget_amendment')
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
        setEditBudgetAmendment("");
        changeModalStatus("user_update_modal", true);
    };

    const editFun = (data) => {
        setEditBudgetAmendment(data);
        changeModalStatus("user_update_modal", true);
    };


    const initiatedBudgetAmendmentDatatable = () => {
        var i = 1;
        var authToken = getAuthToken();
        var my_url = `${process.env.REACT_APP_API_URL}/admin/budget/amendment/initiated-datatable`;
        if ($.fn.DataTable.isDataTable("#initiated-BudgetAmendment-datatable")) {
            $("#initiated-BudgetAmendment-datatable").DataTable().destroy();
        }
        $("#initiated-BudgetAmendment-datatable").DataTable({
            order: [[1, "asc"]],
           
            ajax: {
                url: my_url,
                type: "POST",
                data: function (d) {
                    // Additional data to be sent to the server
                    d.filterParams = toBeFilterData; // You can add more parameters as needed
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
                    name: "tfy_year_label",
                    data: "tfy_year_label",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tfm_name",
                    data: "tfm_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tpsm_name",
                    data: "tpsm_name",
                    searchable: true,
                    orderable: true,
                },
                {
                    name: "tbm_budget_amount",
                    data: "tbm_budget_amount",
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
                                                onClick={() => editFun(record, 'edit')}
                                            >
                                                <span style={{ marginRight: "5px" }}>
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </span>
                                                <span>
                                                    Edit Amendment
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
            initiatedBudgetAmendmentDatatable();
        }

    }, [permissions,toBeFilterData]);

     const getAllExportData = () => {
        getBudgetAmendmentListDatatable().then((response) => {
                setBudgetAmendmentList(response?.data);
            });
        }
    
        useEffect(() => {
            if (budgetAmendmentList.length > 0) {
                tableToExcel('new-table', 'Budget Amendment List'); // Trigger export once data is set
            }
        }, [budgetAmendmentList]);

         const detailsofFinancialList = async () => {
                try {
                  const response = await currentFinancialYear();
                  if (response.status === 1) {
                    const options = response.data.map((data) => ({
                      value: data.tfy_id,
                      label: data.tfy_year_label,
                    }));
                    setYearOptions(options);
            
                  }
                } catch (error) {
                  console.error("Error fetching financial years:", error);
                }
              };

        const handleSelectChange = (selectedOption, { name }) => {
        
            if (name === "tbm_fy_year_id") {
              setSelectedYear(selectedOption);
            } 
          };

            useEffect(() => {
               detailsofFinancialList();
             }, []);

             const searchFiter = () => {

                if (selectedYear) {
                  var year = selectedYear.value;
                }
            
                const data = {
                    tbm_fy_year_id: year,
                  };
              
                  setToBeFilterData(data);
            
              };
            
              const resetFiter = () => {
                // Reset all filter-related state variables
                setSelectedYear(null);
                setToBeFilterData({
                  tbm_fy_year_id: "",
                });
            
              };
    
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
                            BudgetAmendment List
                        </h5>
                        <div className="float-right">
                        <button
                            type="button"
                            className="btn btn-sm btn-dark"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseExample"
                            aria-controls="collapseExample"
                            style={{ marginRight: "10px" }}
                        >
                            <i class="fa-solid fa-filter-list"></i> Filter
                        </button>
                        {
                        (permissions?.indexOf('add') > -1 || permissions == "*") &&
                            <button
                                type="button"
                                style={{ marginRight: "10px" }}
                                className="btn btn-sm btn-dark"
                                onClick={() => addFun('add')}
                                >
                                <i className="fa-solid fa-plus"></i> Add Amendment
                            </button>
                        }
                        {
                        (permissions?.indexOf('export') > -1 || permissions == "*") &&
                            <button className='btn btn-success btn-sm' style={{ marginLeft: '10px' }} onClick={() => getAllExportData()}><FaFileExport /> Export</button>
                        }
                        </div>
                    </div>
                    <div className="card-body at-elevation-z6 table-box" style={{ maxHeight: "calc(100vh - 23vh);", overflowX: 'auto' }}>
                        <div className="collapse" id="collapseExample">
                        <div className="">
                    {/* Year */}
                    

                    <div className="col-md-5 d-flex align-items-end">
                    <div className="mb-3 me-2" style={{ flex: 1 }}>
                        <label htmlFor="exampleFormControlInput1" className="form-label">
                        Year
                        </label>
                        <Select
                        name="tbm_fy_year_id"
                        id="financialYear"
                        options={yearOptions}
                        value={selectedYear}
                        isSearchable={true}
                        onChange={(selectedOption) =>
                            handleSelectChange(selectedOption, { name: "tbm_fy_year_id" })
                        }
                        placeholder="Select Year"
                        styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        />
                    </div>

                    <div className="d-flex mb-3">
                        <button type="button" className="btn btn-dark me-2" onClick={searchFiter}>
                        Search
                        </button>
                        <button type="button" className="btn btn-dark" onClick={resetFiter}>
                        Reset
                        </button>
                    </div>
                    </div>

                            </div>
                        </div>

                        <div className="initiated-BudgetAmendment-table-container">
                            <hr className="my-1" />
                            <div className="mt-2 table table-bordered">
                                <div>
                                {(permissions.indexOf('list') > -1) ?
                                    <table id="initiated-BudgetAmendment-datatable" className="table table-bordered dataTable">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>FY</th>                                                                                              
                                                <th>Foundation</th>                                                                                              
                                                <th>Project Stage</th>                                                                                              
                                                <th>Amount (in lakhs)</th>                                                                                              
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
                            <Modal.Title>{editBudgetAmendment === '' ? 'Add Budget Amendment' : 'Update Budget Amendment'}</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <AddEditBudgetAmendment
                                changeModalStatus={changeModalStatus}
                                editBudgetAmendment={editBudgetAmendment}
                                initiatedBudgetAmendmentDatatable={initiatedBudgetAmendmentDatatable}
                                datatable_url={datatable_url}
                            />
                        </Modal.Body>
                    </Modal>
                    {/* Update User Modal End */}
                </div>
            </div>


            <div style={{ display: 'none' }}>
                <table id='new-table' style={{ fontSize: '9pt' }} className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Serial No</th>
                            <th>FY</th>
                            <th>Foundation</th>
                            <th>Project Stage</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            budgetAmendmentList.map((data, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{data.tfy_year_label}</td>
                                    <td>{data.tfm_name}</td>
                                    <td>{data.tpsm_name}</td>
                                    <td>{data.tbm_budget_amount}</td>
                                </tr>
                            ))
                        }

                    </tbody>
                </table>
            </div>

        </>
    )
}
