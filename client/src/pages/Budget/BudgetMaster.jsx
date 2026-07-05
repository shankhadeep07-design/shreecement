import $ from 'jquery';
import React, { useEffect, useState } from 'react';
import { Modal } from "react-bootstrap";
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import ReactDOM from "react-dom/client";
import { Toaster } from 'react-hot-toast';
import { FaFileExport } from "react-icons/fa";
import { getMyModulePermissionFun, getTableShimmer } from "../../helper/common.js";
import { getBudgetMasterListDatatable } from '../../Services/Budget-service.js';
import { getAuthToken, tableToExcel } from "../../Services/Helper";
import { ActualBudget } from './ActualBudget.jsx';
import { AddEditBudget } from "./AddEditBudget.jsx";
import { ViewBudget } from './ViewBudget.jsx';
import { currentFinancialYear } from '../../Services/Master-service.js';
import Select from "react-select";
export const BudgetMaster = () => {
    const [showModal, setShowModal] = useState(false);
    const [showActualBudgetModal, setActualBudgetShowModal] = useState(false);
    const [showviewModal, setViewShowModal] = useState(false);
    let [editBudget, setEditBudget] = useState("#ffffff");
    let [editActualBudget, setEditActualBudget] = useState("#ffffff");
    const [budgetMasterList, setBudgetMasterList] = useState([]);
    let datatable_url = `${process.env.REACT_APP_API_URL}/admin/budget/initiated-datatable`;
    const [permissions, setPermissions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);

  const [toBeFilterData, setToBeFilterData] = useState({
      tbm_fy_year_id: "",
    });
    useEffect(() => {
        getMyModulePermissionFun('budget')
            .then((module) => {
                setPermissions(module);
            })
            .catch((error) => {
            console.error('Error fetching module permissions:', error);
        }); 
        
    }, [])

      const detailsofFinancialList = async () => {
        try {
          const response = await currentFinancialYear();
          if (response.status === 1) {
            const options = response.data.map((data) => ({
              value: data.tfy_id,
              label: data.tfy_year_label,
            }));
            setYearOptions(options);
    
            // const defaultYear = options.find(
            //   (option) => option.value === editAnganwadi.tbm_fy_year_id
            // );
            // setSelectedYear(defaultYear || null);
    
            // setFormData((prev) => ({
            //   ...prev,
            //   tbm_fy_year_id: defaultYear ? defaultYear.value : "",
            // }));
          }
        } catch (error) {
          console.error("Error fetching financial years:", error);
        }
      };

      const handleSelectChange = (selectedOption, { name }) => {
        // setFormData((prevData) => ({
        //   ...prevData,
        //   [name]: selectedOption ? selectedOption.value : null, // Update the formData for the respective field
        // }));
    
        if (name === "tbm_fy_year_id") {
          setSelectedYear(selectedOption);
        } 
      };

    const changeModalStatus = (id, status) => {

        setShowModal({
            ...showModal,
            [id]: status,
        });
        setActualBudgetShowModal({
            ...showActualBudgetModal,
            [id]: status,
        });
        setViewShowModal({
            ...showviewModal,
            [id]: status,
        });
    };

    const addFun = () => {
        setEditBudget("");
        changeModalStatus("user_update_modal", true);
    };

    const editFun = (data) => {
        setEditBudget(data);
        changeModalStatus("view_modal", true);
    };

    const ActualBudgetFun = (data) => {
        setEditActualBudget(data);
        changeModalStatus("actual_budget_modal", true);
    };


    const initiatedBudgetDatatable = () => {
        var i = 1;
        var authToken = getAuthToken();
        var my_url = `${process.env.REACT_APP_API_URL}/admin/budget/initiated-datatable`;
        if ($.fn.DataTable.isDataTable("#initiated-Budget-datatable")) {
            $("#initiated-Budget-datatable").DataTable().destroy();
        }
        $("#initiated-Budget-datatable").DataTable({
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
                    name: "tabm_month_json",
                    data: "tabm_month_json",
                    render: function (data, type, full, meta) {
                            
                        if (Array.isArray(data) && data.length > 0) {
                            // Iterate through the array and extract monthlyAmounts
                            const totalSum = data.reduce((total, item) => {
                                if (item.monthlyAmounts && typeof item.monthlyAmounts === "object") {
                                    const monthlyAmounts = Object.values(item.monthlyAmounts);
                                    const itemSum = monthlyAmounts.reduce((acc, value) => {
                                        return acc + (typeof value === "number" ? value : 0);
                                    }, 0);
                                    return total + itemSum; // Accumulate the sum
                                }
                                return total; // If no monthlyAmounts, skip this item
                            }, 0);

                            return totalSum.toFixed(2); // Return the total sum formatted to 2 decimal places
                        } else {
                            return "-"; // Fallback if data is not an array or is empty
                        }
                    },
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
                    targets: [6],
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
                                    (permissions?.indexOf('view') > -1 || permissions == "*") && (
                                        <li>
                                            <button
                                                className="dropdown-item"
                                                onClick={() => editFun(record)}
                                            >
                                                <span style={{ marginRight: "5px" }}>
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </span>
                                                <span>
                                                    View Budget
                                                </span>
                                            </button>
                                        </li>
                                    )}

                                    {
                                    (permissions?.indexOf('edit') > -1 || permissions == "*") && (
                                        <li>
                                            <button
                                                className="dropdown-item"
                                                onClick={() => ActualBudgetFun(record, 'edit')}
                                            >
                                                <span style={{ marginRight: "5px" }}>
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </span>
                                                <span>
                                                    Actual Budget
                                                </span>
                                            </button>
                                        </li>
                                    )}
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
            initiatedBudgetDatatable();
        }

    }, [permissions,toBeFilterData]);

    const getAllExportData = () => {
        getBudgetMasterListDatatable().then((response) => {
            setBudgetMasterList(response?.data);
        });
    }

    useEffect(() => {
        if (budgetMasterList.length > 0) {
            tableToExcel('new-table', 'Budget Master List'); // Trigger export once data is set
        }
    }, [budgetMasterList]);

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
                            Budget List
                        </h5>
                        <div className="float-right">
                        {
                        (permissions?.indexOf('add') > -1 || permissions == "*") &&
                            <button
                                type="button"
                                style={{ marginRight: "10px" }}
                                className="btn btn-sm btn-dark"
                                onClick={() => addFun('add')}
                            >
                                <i className="fa-solid fa-plus"></i> Add Budget

                            </button>
                        }
                        <button
                            type="button"
                            className="btn btn-sm btn-dark"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseExample"
                            aria-controls="collapseExample"
                        >
                            <i class="fa-solid fa-filter-list"></i> Filter
                        </button>
                        {
                            (permissions?.indexOf('export') > -1 || permissions === "*") &&
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

                        <div className="initiated-Budget-table-container">
                            <hr className="my-1" />
                            <div className="mt-2 table table-bordered">
                                <div>
                                {(permissions.indexOf('list') > -1) ?
                                    <table id="initiated-Budget-datatable" className="table table-bordered dataTable">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>FY</th>
                                                <th>Foundation</th>
                                                <th>Project Stage</th>
                                                <th>Plan Amount (in lakhs)</th>
                                                <th>Actual Amount (in lakhs)</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                    </table>
                                    :
                                    <>
                                    <tr>
                                    <td colSpan={6} className='text-center'>You don't have any permissions</td>
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
                            <Modal.Title>Add Budget</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <AddEditBudget
                                changeModalStatus={changeModalStatus}
                                initiatedBudgetDatatable={initiatedBudgetDatatable}
                                datatable_url={datatable_url}
                            />
                        </Modal.Body>
                    </Modal>
                    {/* Update User Modal End */}
                    {/* Update Actual Modal Start */}
                    <Modal
                        show={showActualBudgetModal.actual_budget_modal}
                        onHide={() => changeModalStatus("actual_budget_modal", false)}
                        size="lg"
                        backdrop="static"
                        centered
                        id="actual_budget_modal"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Actual Budget</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <ActualBudget
                                changeModalStatus={changeModalStatus}
                                editActualBudget={editActualBudget}
                                initiatedBudgetDatatable={initiatedBudgetDatatable}
                                datatable_url={datatable_url}
                            />
                        </Modal.Body>
                    </Modal>
                    {/* Update Actual Modal End */}
                    {/*View  Modal Start */}
                    <Modal
                        show={showModal.view_modal}
                        onHide={() => changeModalStatus("view_modal", false)}
                        size="lg"
                        backdrop="static"
                        centered
                        id="view_modal"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>View Budget</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                            <ViewBudget
                                changeModalStatus={changeModalStatus}
                                editBudget={editBudget}
                                initiatedBudgetDatatable={initiatedBudgetDatatable}
                                datatable_url={datatable_url}
                            />
                        </Modal.Body>
                    </Modal>
                    {/*View Modal End */}
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
                <th>Plan Amount (in lakhs)</th>
                <th>Actual Amount (in lakhs)</th> {/* Add this column to display the calculated total */}
            </tr>
        </thead>
        <tbody>
            {
                budgetMasterList.map((data, index) => {

                   
                    
                    // Calculation logic for tabm_month_json
                    let totalAmount = "-";
                    if (Array.isArray(data.tabm_month_json) && data.tabm_month_json.length > 0) {
                        const totalSum = data.tabm_month_json.reduce((total, item) => {
                            if (item.monthlyAmounts && typeof item.monthlyAmounts === "object") {
                                const monthlyAmounts = Object.values(item.monthlyAmounts);
                                const itemSum = monthlyAmounts.reduce((acc, value) => {
                                    return acc + (typeof value === "number" ? value : 0);
                                }, 0);
                                return total + itemSum; // Accumulate the sum
                            }
                            return total; // If no monthlyAmounts, skip this item
                        }, 0);
                        totalAmount = totalSum.toFixed(2); // Format to 2 decimal places
                    }

                    return (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{data.tfy_year_label}</td>
                            <td>{data.tfm_name}</td>
                            <td>{data.tpsm_name}</td>
                            <td>{data.tbm_budget_amount}</td>
                            <td>{totalAmount}</td> {/* Render the calculated total */}
                        </tr>
                    );
                })
            }
        </tbody>
    </table>
</div>


        </>
    )
}
