import React, { useState, useEffect } from 'react';
import { userListRoleIdWiseApi } from '../../services/User-service';
import { Modal, Dropdown, Button } from "react-bootstrap";
import { getCurrentUserDetails } from "../../auth/auth";
import ScaleLoader from "react-spinners/ScaleLoader";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";
import { allRoles } from '../../services/Role-service';
import { submitApprovalPath, getLandMenuApi } from "../../services/ApprovalPath-Service.js";
import ApprovalFormItems from './ApprovalFormItems.jsx';
const ApprovalPathView = ({ show, changeModalStatus, refreshTable ,approvarDetails,approvalId}) => {
    
    
// console.log("ffffff ",approvarDetails);
function handleModalClose() {
    changeModalStatus("view_approval_path_modal", false);
  }
    
      
    

  return (
   <>

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
          <Modal.Title>Approval Rule Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>

        <div>
      <h5>Approval Name: {approvarDetails.tac_module_name}</h5>
      <table border="1" className="table">
        <thead>
          <tr>
            <th>Role</th>
            <th>User</th>
            <th>Forward</th>
            <th>Approver Index</th>
          </tr>
        </thead>
        <tbody>
          {approvarDetails.approvers.map((approver) => (
            <tr key={approver.taca_approver_index}>
              <td>{approver.label}</td>
              <td>{approver.label}</td>
              <td>{approver.taca_forward_option}</td>
              <td>{approver.taca_approver_index}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
         
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
  
    </div>


   </>
  )
}

export default ApprovalPathView;