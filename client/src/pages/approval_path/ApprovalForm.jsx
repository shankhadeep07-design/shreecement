import React, { useState, useEffect } from 'react';
import { userListRoleIdWiseApi } from '../../services/User-service';
import { Modal, Dropdown, Button } from "react-bootstrap";
import { getCurrentUserDetails } from "../../auth/auth";
import ScaleLoader from "react-spinners/ScaleLoader";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";
import { allRoles } from '../../services/Role-service.js';
import { submitApprovalPath, getLandMenuApi } from "../../services/ApprovalPath-Service.js";
import ApprovalFormItems from './ApprovalFormItems.jsx';


const ApprovalForm = ({ show, changeModalStatus, refreshTable ,approvarDetails,approvalId}) => {
  const [formData, setFormData] = useState({
    tac_id: '',
    tac_module_id: '',
    approval_channel_approvers: [
      { taca_approval_channel_id: '', tac_role_id: '', tac_user_id: '', taca_forward_option: 'no', taca_approver_index: 1, users: [] }
    ],
  });
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null); // Initialize selectedModule state
  const [loading, setLoading] = useState(false); // Assuming you want to manage loading state

  useEffect(() => {
    if (show) {
      // Fetch roles on modal show
      allRoles().then(response => {
        if (response.status) {
          const formatedRecords = response.data?.map(obj => ({
            label: obj?.trl_role_name,
            value: obj?.trl_role_id,
            slug: obj?.trl_role_slug,
            isDisabled: false
          }));
          setRoles(formatedRecords);
        } else {
          toast.error(response.message);
        }
      }).catch(err => {
        toast.error(err.message);
      });
    }
  }, [show]);

  const moduleList = [
    { label: 'Head Office Proposal', value: 'head_office_proposal' },
    { label: 'Region Proposal', value: 'region_proposal' },
    { label: 'CSR/PD Budget', value: 'csr_budget' },
    { label: 'CAS Budget', value: 'cas_budget' },
    { label: 'Budget Shuffling', value: 'budget_shuffling' },
    { label: 'Budget Amendment', value: 'budget_amendment' }
  ];

  useEffect(() => {
    if (approvarDetails && Object.keys(approvarDetails).length > 0) {
      // Set the selected module based on approvarDetails
      const selectedModuleData = moduleList.find(module => module.value === approvarDetails.tac_module_id);

      setSelectedModule(selectedModuleData);
  
      // Populate formData for editing
      setFormData(prevState => ({
        ...prevState,
        tac_id: approvarDetails?.tac_id || '', // Ensure tac_id exists, otherwise default to empty string
        tac_module_id: approvarDetails?.tac_module_id || '', // Ensure tac_module_id exists, otherwise default to empty string
        approval_channel_approvers: approvarDetails?.approvers?.map(approver => ({
          tac_role_id: approver?.taca_role_id || '', // Ensure tac_role_id exists, otherwise default to empty string
          tac_user_id: approver?.taca_user_id || '', // Ensure tac_user_id exists, otherwise default to empty string
          taca_approver_index: approver?.taca_approver_index || 0, // Ensure taca_approver_index exists, otherwise default to 0
          taca_forward_option: approver?.taca_forward_option || 0, // Ensure taca_forward_option exists, otherwise default to 0
          users: approver?.users || [], // Ensure users is an array, otherwise default to an empty array
        })) || [{ taca_approval_channel_id: '', tac_role_id: '', tac_user_id: '', taca_approver_index: 1, users: [] }], // Ensure approval_channel_approvers exists, otherwise default to an empty array
      }));
    }
  }, [approvarDetails]);
  
  


  

  const userListFun = (role_id, index) => {
    userListRoleIdWiseApi(role_id)
      .then((response) => {
        if (response) {
          const updatedApprovers = [...formData.approval_channel_approvers];
          const usersRec = response.data?.map(obj => ({
            label: obj?.name,
            value: obj?.id,
            isDisabled: false
          }));
          updatedApprovers[index].users = usersRec; // Set fetched users for the row
          updatedApprovers[index].tac_user_id = ''; // Reset user selection for the row
          setFormData({ ...formData, approval_channel_approvers: updatedApprovers });
        } else {
          toast.error(response.message);
        }
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  const handleRoleChange = (index, roleId) => {
    const updatedApprovers = [...formData.approval_channel_approvers];
    const previousRoleId = updatedApprovers[index].tac_role_id;
    updatedApprovers[index].tac_role_id = roleId;

    setFormData({ ...formData, approval_channel_approvers: updatedApprovers });

    // Update the selected roles state
    const updatedSelectedRoles = [...selectedRoles];
    if (previousRoleId) {
      const prevIndex = updatedSelectedRoles.indexOf(previousRoleId);
      if (prevIndex !== -1) {
        updatedSelectedRoles.splice(prevIndex, 1);
      }
    }
    if (roleId) {
      updatedSelectedRoles.push(roleId);
    }
    setSelectedRoles(updatedSelectedRoles);

    if (roleId) {
      userListFun(roleId, index);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedApprovers = [...formData.approval_channel_approvers];
    updatedApprovers[index][field] = value;
    setFormData({ ...formData, approval_channel_approvers: updatedApprovers });
  };

  const addRow = () => {
    setFormData({
      ...formData,
      approval_channel_approvers: [
        ...formData.approval_channel_approvers,
        { taca_approval_channel_id: '', tac_role_id: '', tac_user_id: '', taca_approver_index: formData.approval_channel_approvers.length + 1, users: [] },
      ],
    });
  };

  const removeRow = (index) => {
    const updatedApprovers = formData.approval_channel_approvers.filter((_, i) => i !== index);
    const reIndexedApprovers = updatedApprovers.map((approver, idx) => ({
      ...approver,
      taca_approver_index: idx + 1,
    }));
    setFormData({ ...formData, approval_channel_approvers: reIndexedApprovers });
  };

  function handleModalClose() {
    changeModalStatus("add_approval_path_modal", false);
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate module selection
    if (!selectedModule) {
      alert("Please select a module.");
      return;
    }

    // Validate approvers
    for (let i = 0; i < formData.approval_channel_approvers.length; i++) {
      const approver = formData.approval_channel_approvers[i];
      if (!approver.tac_role_id) {
        alert(`Role is missing in row ${i + 1}`);
        return;
      }
      // if (!approver.tac_user_id) {
      //   alert(`User is missing in row ${i + 1}`);
      //   return;
      // }
    }

    // Prepare data for submission
    const payload = {
      tac_id: formData.tac_id,
      module_id: selectedModule.value,
      approvers: formData.approval_channel_approvers.map((approver) => ({
        role_id: approver.tac_role_id,
        user_id: '',
        approver_index: approver.taca_approver_index,
        forward_option: approver.taca_forward_option,
      })),
    };

    // console.log(payload);return;

    // Submit the data (replace with actual API call)
    setLoading(true); // Show loading spinner
    submitApprovalPath({ data: payload }).then((response) => {
      if (response.status) {
        toast.success(response.message);
        refreshTable();
        handleModalClose();
      } else {
        toast.error(response.message);
      }
      setLoading(false); // Hide loading spinner
    }).catch((err) => {
      setLoading(false); // Hide loading spinner
      toast.error(err.message);
    });
  };

  return (
    <div className="modal-container">
      <Modal
        show={show}
        onHide={handleModalClose}
        size="lg"
        id="add_approval_path_modal"
        backdrop="static"
        backdropClassName="custom-backdrop"
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Approval Rule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="approval_path_form" id="approval_path_form" onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-lg-12 mb-3">
                <label htmlFor="approval_path_name" className="form-label">
                  Select Module <span className="text-danger">*</span>
                </label>
                <Select
                  options={moduleList}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  value={selectedModule}
                  onChange={(option) => setSelectedModule(option)}
                  required
                />
              </div>
            </div>
            <h2>Approval Form</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Role</th>
                  {/* <th>User</th> */}
                  <th>Forward</th>
                  <th>Approver Index</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
              {formData.approval_channel_approvers.map((approver, index) => {
                const availableRoles = roles.map((role) => ({
                    ...role,
                    isDisabled: formData.approval_channel_approvers.some(
                    (otherApprover, otherIndex) =>
                        otherIndex !== index && otherApprover.tac_role_id === role.value
                    ),
                }));

                return (
                    <ApprovalFormItems
                    key={index}
                    approver={approver}
                    index={index}
                    availableRoles={availableRoles}
                    handleRoleChange={handleRoleChange}
                    handleInputChange={handleInputChange}
                    addRow={addRow}
                    removeRow={removeRow}
                    />
                );
            })}


              </tbody>
            </table>
            
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button
            variant="primary"
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <ScaleLoader color="#fff" height={30} /> : "Submit"}
          </Button>
        </Modal.Footer>
      </Modal>
  
    </div>
  );
};

export default ApprovalForm;
