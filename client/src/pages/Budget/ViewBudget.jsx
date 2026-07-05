import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import Select from "react-select";
import { fetchNewBudgetAmendment } from '../../services/Budget-service.js';
import {
  currentFinancialYear,
  fetchFoundationLists,
  fetchProjectStageLists,
} from "../../Services/Master-service.js";

export const ViewBudget = ({ editBudget}) => {

  const [yearOptions, setYearOptions] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [foundations, setFoundations] = useState([]);
  const [selectedFoundations, setSelectedFoundations] = useState([]);
  const [renderProjectStage, setRenderProjectStage] = useState([]);
  const [selectedProjectStage, setSelectedProjectStage] = useState(null);
  const [educationData, setEducationData] = useState([]);
  const [budgetDetails, setBudgetDetails] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalActualBudgetAmount, setTotalActualBudgetAmount] = useState(0);
  const [formData, setFormData] = useState({
    tbm_id: "",
    tbm_fy_year_id: "",
    tbm_foundation_id: "",
    tbm_project_stage_id: "",
    tbm_budget_amount: "",
  });

  useEffect(() => {
    const calculateTotalAmount = (data) => {
      return data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    };
    setTotalAmount(
      budgetDetails && budgetDetails.length > 0
        ? calculateTotalAmount(budgetDetails)
        : calculateTotalAmount(educationData)
    );
  }, [budgetDetails, educationData]);

  const handleTableChange = (e, id, field) => {
    const { value } = e.target;
    const budgetAmount = parseFloat(formData.tbm_budget_amount) || 0;
  
    const updateStateData = (data, setData) => {
      const updatedData = data.map((item) => {
        if (item.id === id) {
          const newAmount = field === "amount" ? parseFloat(value) || 0 : parseFloat(item.amount) || 0;
  
          const totalAmount = data.reduce(
            (sum, curr) => (curr.id === id ? sum : sum + parseFloat(curr.amount || 0)),
            newAmount
          );
  
          if (totalAmount > budgetAmount) {
            toast.error("Total amount cannot exceed the budget!");
            return item;
          }
  
          const newPercentage =
            budgetAmount > 0
              ? ((newAmount / budgetAmount) * 100).toFixed(2)
              : item.percentage;
  
          return {
            ...item,
            [field]: value,
            percentage: field === "amount" ? newPercentage : item.percentage,
          };
        }
        return item;
      });
  
      setData(updatedData);
    };
  
    if (budgetDetails && budgetDetails.length > 0) {
      updateStateData(budgetDetails, setBudgetDetails);
    } else {
      updateStateData(educationData, setEducationData);
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
        // Find the default year based on tfy_current_year or editBudget.tbm_fy_year_id
        const defaultYear =
          options.find((option) => option.value === editBudget.tbm_fy_year_id) ||
          options.find((option) => option.currentYear === "Y"); // Prioritize current year
           // Fallback to editBudget year

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
          (option) => option.value === editBudget.tbm_foundation_id
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
          (option) => option.value === editBudget.tbm_project_stage_id
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
        const viewbudget_ids = {
            year_ids: year_id,
            projet_ids: project_id,
            foundation_ids: found_id,
            budget_ids: budget_id,
        };

        // Make the API call to fetch districts based on the selected budget IDs
        const eduresponse = await fetchNewBudgetAmendment(viewbudget_ids);
    
        // Assuming the response structure you provided
        const { data, status, message, budgetDatas, actualBudgetDatas } = eduresponse;
        
        
        if (status === 1) {

            const newbudgetAmount = budgetDatas?.map((item) => ({
                amount: parseFloat(item.tbm_budget_amount), // Sum of budget and amendment amounts
            }));
            const total = newbudgetAmount.reduce((sum, item) => sum + item.amount, 0);                       
            setFormData((prevData) => ({
                ...prevData,
                tbm_budget_amount: total, // Format total to two decimal places
            }));

            const newActualBudgetAmount = actualBudgetDatas?.map((item) => ({
                id: item.id,
                name: item.name,
                actual_amount: parseFloat(item.actual_amounts), // Sum of budget and amendment amounts
            }));

            const totalActualAmount = newActualBudgetAmount.reduce((sum, item) => sum + item.actual_amount, 0);
            setTotalActualBudgetAmount(totalActualAmount);
            const tableData = data.map((item) => {
              const totalBudget = parseFloat(item.budget_amount) + parseFloat(item.amendment_amount); // Total budget
              const percentage = ((totalBudget / total) * 100).toFixed(2) + '%'; // Percentage of the total
              const actualItem = newActualBudgetAmount.find((actual) => actual.id === item.tbdm_project_stage_submodule_id);
              return {
                id: item.tbdm_project_stage_submodule_id,
                name: item.tbdm_project_stage_submodule_name,
                amount: totalBudget,
                percentage: percentage,
                actual_amount: actualItem ? actualItem.actual_amount : 0, 
              };
            });
            
            setBudgetDetails(tableData);

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
    if (editBudget) {

      detailsofBudgetDetails(editBudget.tbm_fy_year_id, editBudget.tbm_project_stage_id, editBudget.tbm_foundation_id, editBudget.tbm_id);
    }
  }, [editBudget]);
  
  let inputChange = (event) => {
    var field = event.target.name;   

    const actualValue = event.target.value;

    setFormData({ ...formData, [field]: actualValue });
  };


  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{ duration: 2000 }}
        reverseOrder={false}
      ></Toaster>

      <form  id="user_submit" className="my_form">
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
                isDisabled = {true}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Foundation</label>
              <Select
                name="tbm_foundation_id"
                options={foundations}
                isDisabled = {true}
                value={selectedFoundations}
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
                isDisabled = {true}
                value={selectedProjectStage}
              />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <h4>Sub Module Details</h4>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Plan Budget</th>
                  <th>Percentage</th>
                  <th>Actual Budget</th>
                </tr>
              </thead>
              <tbody>
                    {budgetDetails?.map((item) => (
                        <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>
                            <input
                            type="text"
                            className="form-control"
                            value={item.amount}
                            onChange={(e) => handleTableChange(e, item.id, "amount")}
                            placeholder="Enter Amount"
                            readOnly
                            />
                        </td>
                        <td>
                            <input
                            type="text"
                            className="form-control"
                            value={item.percentage}
                            readOnly
                            />
                        </td>
                        <td>
                            <input
                            type="text"
                            className="form-control"
                            value={item.actual_amount}
                            readOnly
                            />
                        </td>
                        </tr>
                    ))}
                    <tr>
                        <td>
                        <strong>Total</strong>
                        </td>
                        <td>
                        <input
                            type="text"
                            className="form-control"
                            value={totalAmount.toFixed(2)}
                            readOnly
                            placeholder="Total Amount"
                        />
                        </td>
                        <td>
                        
                        </td>
                        <td>
                        <input
                            type="text"
                            className="form-control"
                            value={totalActualBudgetAmount.toFixed(2)}
                            readOnly
                            placeholder="Total Amount"
                        />
                        </td>
                    </tr>
                </tbody>
            </table>
          </div>
        </div>

      </form>
    </>
  );
};
