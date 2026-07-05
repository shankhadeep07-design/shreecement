import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import Select from "react-select";
import { createActualBudget, fetchActualBudgetDetailsLists, fetchNewBudgetAmendment } from "../../Services/Budget-service";
import {
  currentFinancialYear,
  fetchFoundationLists,
  fetchProjectStageLists,
  getAllEducationMasterApi,
} from "../../Services/Master-service";

export const ActualBudget = ({
  changeModalStatus,
  editActualBudget,
  initiatedBudgetDatatable,
  datatable_url,
}) => {

  
  const [yearOptions, setYearOptions] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [foundations, setFoundations] = useState([]);
  const [selectedFoundations, setSelectedFoundations] = useState([]);
  const [renderProjectStage, setRenderProjectStage] = useState([]);
  const [selectedProjectStage, setSelectedProjectStage] = useState(null);
  const [educationData, setEducationData] = useState([]);
  const [budgetDetails, setBudgetDetails] = useState([]);
  const [actualBudgetDetails, setActualBudgetDetails] = useState([]);
  const [actualDataId, setActualDataId] = useState([]);
  const [months, setMonths] = useState([
    "April","May","June","July","August","September","October","November","December","January", "February","March"
  ]);
  const [formData, setFormData] = useState({
    tabm_id: "",
    tabm_budget_id: "",
    tbm_project_stage_id: "",
    tabm_project_stage_submodule_id: "",
    tabm_project_stage_submodule_name: "",
    tabm_month_json: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!editActualBudget?.tabm_budget_id) {
          await fetchSubModules(editActualBudget.tbm_project_stage_id);
        } else {
          await detailsofActualBudgetDetails(
            editActualBudget.tbm_id,
            editActualBudget.tbm_project_stage_id
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, [editActualBudget?.tabm_budget_id, editActualBudget?.tbm_project_stage_id]);

  const handleTableChange = (e, id, month, AMounts, index) => {
    const value = parseFloat(e.target.value) || 0;

    
    // Find the corresponding budgetDetails item for this id
    const budgetDetail = budgetDetails.find((item) => item.id === id);
    
    if (!budgetDetail) {
      toast.error("Budget details not found for this ID.");
      return;
    }
  
    // Clone and update the data for the specific item and month
    const updatedData = educationData.map((item) => {
      if (item.id === id) {
        const updatedMonthlyAmounts = {
          ...item.monthlyAmounts,
          [month]: value,
        };
  
        // Calculate the total for the updated row
        const totalForRow = Object.values(updatedMonthlyAmounts).reduce(
          (sum, amount) => sum + (parseFloat(amount) || 0),
          0
        );
  
        // Check if the total exceeds the allowed budget amount
        if (totalForRow > budgetDetail.amount) {
          toast.error(
            `Total for all months exceeds the allowed budget amount of ${budgetDetail.amount}.`
          );
          updatedMonthlyAmounts[month] = 0; // Reset the current month value
        }
  
        return {
          ...item,
          monthlyAmounts: updatedMonthlyAmounts,
        };
      }
      return item;
    });
  
    // Update the state with the new data
    setEducationData(updatedData);
  };

    const calculateTotalForRow = (monthlyAmounts) => {
        return Object.values(monthlyAmounts)
        .reduce((sum, amount) => sum + amount, 0)
        .toFixed(2);
    };



  const fetchSubModules = async (stateIds) => {
  
    const state_id = stateIds;

    // Create the request payload
    const state_ids = {
      state_ids: state_id,
    };

    // Make the API call to fetch districts based on the selected state IDs
    const eduresponse = await getAllEducationMasterApi(state_ids);

    // Assuming the response structure you provided
    const { data, status, message } = eduresponse;

    if (status === 1) {
      const tableData = data.map((item) => ({
        id: item.tem_id,
        name: item.tem_name,
        monthlyAmounts: months.reduce((acc, month) => {
            acc[month] = 0;
            return acc;
          }, {}),
      }));
      
      setEducationData(tableData);
    } else {
      console.error("Failed to fetch sub module:", message);
    }
  };

  const detailsofFinancialList = async () => {
    try {
      const response = await currentFinancialYear();
      if (response.status === 1) {
        const options = response.data.map((data) => ({
          value: data.tfy_id,
          label: data.tfy_year_label,
          currentYear: data.tfy_current_year,
        }));
        setYearOptions(options);

        // Set default selected year based on user.f_year
        // Find the default year based on tfy_current_year or editActualBudget.tbm_fy_year_id
        const defaultYear =
        options.find((option) => option.value === editActualBudget.tbm_fy_year_id) || // Fallback to editActualBudget year
        options.find((option) => option.currentYear === "Y");  // Prioritize current year

        setSelectedYear(defaultYear || null);

        setFormData((prev) => ({
          ...prev,
          tbm_fy_year_id: defaultYear ? defaultYear.value : "",
        }));
      }
    } catch (error) {
      console.error("Error fetching financial years:", error);
    }
  };

  const detailsofFoundationList = async () => {
    try {
      const response = await fetchFoundationLists();

      if (response.status === 1) {
        const options = response.data.map((data) => ({
          value: data.tfm_id,
          label: data.tfm_name,
        }));
        setFoundations(options);

        // Set default selected year based on user.f_year
        const defaultFoundation = options.find(
          (option) => option.value === editActualBudget.tbm_foundation_id
        );
        setSelectedFoundations(defaultFoundation || null);

        setFormData((prev) => ({
          ...prev,
          tbm_foundation_id: defaultFoundation ? defaultFoundation.value : "",
        }));
      }
    } catch (error) {
      console.error("Error fetching Genders:", error);
    }
  };

  const detailsofProjectStageList = async () => {
    try {
      const response = await fetchProjectStageLists();

      if (response.status === 1) {
        const options = response.data.map((data) => ({
          value: data.tpsm_id,
          label: data.tpsm_name,
        }));
        setRenderProjectStage(options);

        // Set default selected year based on user.f_year
        const defaultProjectStage = options.find(
          (option) => option.value === editActualBudget.tbm_project_stage_id
        );
        setSelectedProjectStage(defaultProjectStage || null);

        setFormData((prev) => ({
          ...prev,
          teya_ProjectStage: defaultProjectStage
            ? defaultProjectStage.value
            : "",
        }));
      }
    } catch (error) {
      console.error("Error fetching ProjectStages:", error);
    }
  };

  const detailsofBudgetDetails = async (YearIds, ProjectStagesIds, FoundationIds, budgetIds) => {
    try {
        // Map the selected states to extract the state values (IDs)
        const year_id = YearIds;
        const project_id = ProjectStagesIds;
        const found_id = FoundationIds;
        const budget_id = budgetIds;
    
        // Create the request payload
        const actualbudget_ids = {
            year_ids: year_id,
            projet_ids: project_id,
            foundation_ids: found_id,
            budget_ids: budget_id,
        };

        // Make the API call to fetch districts based on the selected budget IDs
        const eduresponse = await fetchNewBudgetAmendment(actualbudget_ids);

        // Assuming the response structure you provided
        const { data, status, message, budgetDatas } = eduresponse;

        if (status === 1) {
          
          const newbudgetAmount = budgetDatas.map((item) => ({
            amount: parseFloat(item.tbm_budget_amount), // Sum of budget and amendment amounts
            }));
          const total = newbudgetAmount.reduce((sum, item) => sum + item.amount, 0);                       
          setFormData((prevData) => ({
              ...prevData,
              tbm_budget_amount: total, // Format total to two decimal places
          }));
          const tableData = data.map((item) => ({
            id: item.tbdm_project_stage_submodule_id,
            name: item.tbdm_project_stage_submodule_name,
            amount: parseFloat(item.budget_amount) + parseFloat(item.amendment_amount), // Sum of budget and amendment amounts
           
        }));
          setBudgetDetails(tableData);
        } else {
          console.error("Failed to fetch budget:", message);
        }
      } catch (error) {
        console.error("Error fetching financial years:", error);
      }
    };

    const detailsofActualBudgetDetails = async (budgetIds, ProjectStagesIds) => {
        try {
          // Map the selected states to extract the state values (IDs)
          const budget_id = budgetIds;
          const project_id = ProjectStagesIds;
  
          // Create the request payload
          const budget_ids = {
            budget_ids: budget_id,
            projet_ids: project_id,
          };
  
          // Make the API call to fetch districts based on the selected budget IDs
          const eduresponse = await fetchActualBudgetDetailsLists(budget_ids);
  
          // Assuming the response structure you provided
          const { data, status, message } = eduresponse;
  
          if (status === 1) {
            setEducationData(eduresponse?.data?.[0]?.tabm_month_json);
            setActualDataId(eduresponse?.data?.[0]?.tabm_id);
          } else {
            console.error("Failed to fetch budget:", message);
          }
        } catch (error) {
          console.error("Error fetching financial years:", error);
        }
    };

  useEffect(() => {
    detailsofFinancialList();
    detailsofFoundationList();
    detailsofProjectStageList();
    if (editActualBudget) {
      setFormData(editActualBudget);
      detailsofBudgetDetails(editActualBudget.tbm_fy_year_id, editActualBudget.tbm_project_stage_id, editActualBudget.tbm_foundation_id, editActualBudget.tbm_id);
    }
  }, [editActualBudget]);

  let inputChange = (event) => { 
    var field = event.target.name;

    const actualValue = event.target.value;

    setFormData({ ...formData, [field]: actualValue });
  };
  
  const submit = (e) => {
    e.preventDefault();
    if (educationData.length > 0) {
      var allData = educationData
    } else {
      allData = actualBudgetDetails;
    }
    
    const ActualBudgetData = {
      tabm_id: actualDataId,
      tabm_budget_id: editActualBudget.tbm_id,
      tabm_project_stage_id: editActualBudget.tbm_project_stage_id,
      actualData: allData,
    };
    
    createActualBudget(ActualBudgetData)
      .then((res) => {
        toast.success(res.message);
        changeModalStatus("actual_budget_modal", false);
        initiatedBudgetDatatable(datatable_url);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
    });
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{ duration: 2000 }}
        reverseOrder={false}
      ></Toaster>

      <form onSubmit={submit} id="user_submit" className="my_form">
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Year
              </label>
              <Select
                name="tbm_fy_year_id"
                id="financialYear"
                options={yearOptions}
                value={selectedYear} 
                isSearchable={true}
                
                isDisabled={true}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Foundation</label>
              <Select
                name="tbm_foundation_id"
                options={foundations}
                value={selectedFoundations}
                isDisabled={true}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="mobile" className="form-label">
                Amount
              </label>
              <input
                type="text"
                className="form-control"
                value={formData.tbm_budget_amount}
                onChange={inputChange}
                name="tbm_budget_amount"
                id="tbm_budget_amount"
                placeholder="Enter Amount"
                readOnly
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Project Stage</label>
              <Select
                name="tbm_project_stage_id"
                options={renderProjectStage}
                value={selectedProjectStage}
                isDisabled={true}
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <h4>Sub Module Details</h4>
            <div style={{overflowX: "auto",whiteSpace: "nowrap",color: "red",border: "1px solid #dee2e6"}}>
              <table
                className="table table-bordered"
                style={{ minWidth: "800px" }}
              >
                <thead>
                  <tr>
                    <th>Name</th>
                    {months.map((month) => (
                      <th key={month}>{month}</th>
                    ))}
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {educationData?.map((item, index) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      {months.map((month) => (
                        <td key={month}>
                          <input
                            type="number"
                            className="form-control"
                            style={{
                              width: "100px",
                              margin: "4px",
                            }}
                            value={item.monthlyAmounts[month]}
                            onChange={(e) =>
                              handleTableChange(e, item.id, month, item.monthlyAmounts,index)
                            }
                            placeholder={`Enter ${month} Amount`}
                          />
                        </td>
                      ))}
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          style={{
                            width: "100px", // Fixed width
                            margin: "4px", // Gap for total column
                          }}
                          value={calculateTotalForRow(item.monthlyAmounts)}
                          readOnly
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12 float-right">
            <button type="submit" className="btn btn-dark">
              Submit
            </button>
          </div>
        </div>
      </form>
    </>
  );
};
