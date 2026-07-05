import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import Select from "react-select";
import { createBudgetAmendment, fetchBudgetAmendmentDetails } from "../../Services/Budget-service";
import {
  currentFinancialYear,
  fetchFoundationLists,
  fetchProjectStageLists,
  getAllEducationMasterApi,
} from "../../Services/Master-service";

export const AddEditBudgetAmendment = ({changeModalStatus, editBudgetAmendment, initiatedBudgetAmendmentDatatable, datatable_url}) => {
    
  const [yearOptions, setYearOptions] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [foundations, setFoundations] = useState([]);
  const [selectedFoundations, setSelectedFoundations] = useState([]);
  const [renderProjectStage, setRenderProjectStage] = useState([]);
  const [selectedProjectStage, setSelectedProjectStage] = useState(null);
  const [educationData, setEducationData] = useState([]);
  const [BudgetAmendmentDetails, setBudgetAmendmentDetails] = useState([]);
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
      BudgetAmendmentDetails && BudgetAmendmentDetails.length > 0
        ? calculateTotalAmount(BudgetAmendmentDetails)
        : calculateTotalAmount(educationData)
    );
  }, [BudgetAmendmentDetails, educationData]);

  const handleTableChange = (e, id, field) => {
    const { value } = e.target;
    const BudgetAmendmentAmount = parseFloat(formData.tbm_budget_amount) || 0;
  
    const updateStateData = (data, setData) => {
      const updatedData = data.map((item) => {
        if (item.id === id) {
          const newAmount = field === "amount" ? parseFloat(value) || 0 : parseFloat(item.amount) || 0;
  
          const totalAmount = data.reduce(
            (sum, curr) => (curr.id === id ? sum : sum + parseFloat(curr.amount || 0)),
            newAmount
          );
  
          if (totalAmount > BudgetAmendmentAmount) {
            toast.error("Total amount cannot exceed the Budget amendment!");
            return item;
          }
  
          const newPercentage =
            BudgetAmendmentAmount > 0
              ? ((newAmount / BudgetAmendmentAmount) * 100).toFixed(2)
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
  
    if (BudgetAmendmentDetails && BudgetAmendmentDetails.length > 0) {
      updateStateData(BudgetAmendmentDetails, setBudgetAmendmentDetails);
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
      // setBudgetAmendmentDetails([]);
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
        // Find the default year based on tfy_current_year or editBudgetAmendment.tbm_fy_year_id
        const defaultYear = editBudgetAmendment ? 
          options.find((option) => option.value === editBudgetAmendment.tbm_fy_year_id): // Fallback to editBudgetAmendment year
          options.find((option) => option.currentYear === "Y"); // Prioritize current year

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
          (option) => option.value === editBudgetAmendment.tbm_foundation_id
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
          (option) => option.value === editBudgetAmendment.tbm_project_stage_id
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

  const detailsofBudgetAmendmentDetails = async (BudgetAmendmentIds, ProjectStagesIds) => {
    try {
        // Map the selected states to extract the state values (IDs)
        const BudgetAmendment_id = BudgetAmendmentIds;
        const project_id = ProjectStagesIds;
    
        // Create the request payload
        const BudgetAmendment_ids = {
            budget_ids: BudgetAmendment_id,
            projet_ids: project_id,
        };

        // Make the API call to fetch districts based on the selected BudgetAmendment IDs
        const eduresponse = await fetchBudgetAmendmentDetails(BudgetAmendment_ids);
    
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
            setBudgetAmendmentDetails(tableData);
        } else {
            console.error("Failed to fetch BudgetAmendment:", message);
        }
    } catch (error) {
        console.error("Error fetching financial years:", error);
    }
  };

  useEffect(() => {
    detailsofFinancialList();
    detailsofFoundationList();
    detailsofProjectStageList();
    if (editBudgetAmendment) {
      setFormData(editBudgetAmendment);
      detailsofBudgetAmendmentDetails(editBudgetAmendment.tbm_id, editBudgetAmendment.tbm_project_stage_id);
    }
  }, [editBudgetAmendment]);

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
      if (editBudgetAmendment) {
        detailsofBudgetAmendmentDetails(editBudgetAmendment.tbm_id, selectedOption.value);
      }
    }
  };

  const submit = (e) => {
    e.preventDefault();    
    if (parseFloat(formData.tbm_budget_amount) !== totalAmount) {
      toast.error("Amendment amount vs total amount mismatch");
    }else{
      if (educationData.length > 0) {
        var allData = educationData
      }else{
        allData = BudgetAmendmentDetails
      }
      
      const BudgetAmendmentData = {
        tbm_id: formData.tbm_id,
        tbm_fy_year_id: selectedYear.value,
        tbm_foundation_id: formData.tbm_foundation_id,
        tbm_project_stage_id: formData.tbm_project_stage_id,
        tbm_budget_amount: formData.tbm_budget_amount,
        educationData: allData,
      };
      
      createBudgetAmendment(BudgetAmendmentData)
        .then((res) => {
          toast.success(res.message);
          changeModalStatus("user_update_modal", false);
          initiatedBudgetAmendmentDatatable(datatable_url);
        })
        .catch((error) => {
          toast.error(error.response.data.message);
          initiatedBudgetAmendmentDatatable(datatable_url);
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
                name="tbm_fy_year_id"
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
                    {BudgetAmendmentDetails && BudgetAmendmentDetails.length > 0
                    ? BudgetAmendmentDetails.map((item) => (
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
