import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import Select from "react-select";
import { createBudget } from "../../Services/Budget-service";
import { fetchBudgetDetailsLists } from '../../Services/Budget-service.js';
import {
  currentFinancialYear,
  fetchFoundationLists,
  fetchProjectStageLists,
  getAllEducationMasterApi,
} from "../../Services/Master-service";

export const AddEditBudget = ({changeModalStatus, editBudget, initiatedBudgetDatatable, datatable_url}) => {
    
  const [yearOptions, setYearOptions] = useState([]);
  
  const [selectedYear, setSelectedYear] = useState(null);
  const [foundations, setFoundations] = useState([]);
  const [selectedFoundations, setSelectedFoundations] = useState([]);
  const [renderProjectStage, setRenderProjectStage] = useState([]);
  const [selectedProjectStage, setSelectedProjectStage] = useState(null);
  const [educationData, setEducationData] = useState([]);
  const [budgetDetails, setBudgetDetails] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
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
        amount: "",
        percentage: "",
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
        // Find the default year based on tfy_current_year or editBudget.tbm_fy_year_id
        const defaultYear =
          options.find((option) => option.currentYear === "Y") || // Prioritize current year
          options.find((option) => option.value === editBudget.teya_year); // Fallback to editBudget year

        setSelectedYear(defaultYear || null);

        setFormData((prev) => ({
          ...prev,
          teya_year: defaultYear ? defaultYear.value : "",
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

  const detailsofBudgetDetails = async (budgetIds, ProjectStagesIds) => {
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
        const eduresponse = await fetchBudgetDetailsLists(budget_ids);
    
        // Assuming the response structure you provided
        const { data, status, message } = eduresponse;
    
        if (status === 1) {
            const tableData = data.map((item) => ({
            budget_id: item.tbdm_budget_id,
            id: item.tbdm_project_stage_submodule_id,
            name: item.tbdm_project_stage_submodule_name,
            amount: item.tbdm_project_stage_submodule_amount,
            percentage: item.tbdm_project_stage_submodule_percentage,
            project_stage_id: item.tbdm_project_stage_id,
            }));
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
      setFormData(editBudget);
      detailsofBudgetDetails(editBudget.tbm_id, editBudget.tbm_project_stage_id);
    }
  }, [editBudget]);

  let inputChange = (event) => {
    var field = event.target.name;   

    const actualValue = event.target.value;

    setFormData({ ...formData, [field]: actualValue });
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setFormData({
      ...formData,
      [name]: selectedOption ? selectedOption.value : "",
    });
    if (name === "tbm_fy_year_id") {
      setSelectedYear(selectedOption);
    } else if (name === "tbm_foundation_id") {
      setSelectedFoundations(selectedOption);
    } else if (name === "tbm_project_stage_id") {
      
        setSelectedProjectStage(selectedOption);
        fetchSubModules(selectedOption.value);
        if (editBudget) {
          detailsofBudgetDetails(editBudget.tbm_id, selectedOption.value);
        }
    
    }
  };

  const submit = (e) => {
    e.preventDefault();    

    if (parseFloat(formData.tbm_budget_amount) !== totalAmount) {
      toast.error("Plan amount vs total amount mismatch");
    }else{
      
      if (educationData.length > 0) {
        var allData = educationData
      }else{
        allData = budgetDetails
      }
      
      const BudgetData = {
        tbm_id: formData.tbm_id,
        tbm_fy_year_id: selectedYear.value,
        tbm_foundation_id: formData.tbm_foundation_id,
        tbm_project_stage_id: formData.tbm_project_stage_id,
        tbm_budget_amount: formData.tbm_budget_amount,
        educationData: allData,
      };
      
      createBudget(BudgetData)
        .then((res) => {
          toast.success(res.message);
          changeModalStatus("user_update_modal", false);
          initiatedBudgetDatatable(datatable_url);
        })
        .catch((error) => {
          toast.error(error.response.data.message);
          initiatedBudgetDatatable(datatable_url);
        });
    }
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
                name="teya_year"
                id="financialYear"
                options={yearOptions}
                value={selectedYear} // Directly use selectedYear
                isSearchable={true}
                onChange={(selectedOption) =>
                  handleSelectChange(selectedOption, { name: "tbm_fy_year_id" })
                }
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Foundation</label>
              <Select
                name="tbm_foundation_id"
                options={foundations}
                onChange={handleSelectChange}
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
                required
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Project Stage</label>
              <Select
                name="tbm_project_stage_id"
                options={renderProjectStage}
                onChange={handleSelectChange}
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
                  <th>Amount</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                    {budgetDetails && budgetDetails.length > 0
                    ? budgetDetails.map((item) => (
                        <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>
                            <input
                            type="text"
                            className="form-control"
                            value={item.amount}
                            onChange={(e) => handleTableChange(e, item.id, "amount")}
                            placeholder="Enter Amount"
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
                        </tr>
                    ))
                    : educationData.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>
                              <input
                                  type="text"
                                  className="form-control"
                                  value={item.amount}
                                  onChange={(e) => handleTableChange(e, item.id, "amount")}
                                  placeholder="Enter Amount"
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
                    </tr>
                </tbody>
            </table>
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
