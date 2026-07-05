import React, {useEffect, useState} from "react";
import { Modal, Dropdown, Button } from "react-bootstrap";
import { getCurrentUserDetails } from "../../auth/auth";
import toast, { Toaster } from "react-hot-toast";
import ScaleLoader from "react-spinners/ScaleLoader";

import Select from "react-select";
import $ from "jquery";

import {useLoading} from '../../context/LoadingProvider'

import { useSelector, useDispatch } from "react-redux";

import { setApprovers, handleEnableDisabledRole, setIntemators, clearAllState, setFormData, setRoles, setModule, setState } from "../../redux/slices/ApprovalPathSlice.js";

import {ApprovalPathListItem} from './ApprovalPathListItem';

import { allRoles } from "../../services/Role-service.js";
import { submitApprovalPath, getLandMenuApi } from "../../services/ApprovalPath-Service.js";

import {
  dashboardStateNames
} from "../../services/Dashboard-service.js";


export function AddApprovalPath ({show, changeModalStatus, refreshTable}) {


  const [formData,setFormData] = useState({
    'tac_module_id' : '',
    'approval_channel_approvers' : [
      {'taca_approval_channel_id':'','tac_role_id' : '','tac_user_id' : '','taca_approver_index':1}
    ]
  });

  const moduleList = [
    {
      label : 'Budget',
      value : 'budget',
    },
    {
      label : 'Budget Shuffling',
      value : 'budget_shuffling',
    },
    {
      label : 'Budget Amendment',
      value : 'budget_amendment',
    }  
  ];

  const [userListData, setUserListData] = useState([]);


  var dispatch = useDispatch();
  var approvalPathState = useSelector(
    (state) => state.ApprovalPath
  );
  const {loading, setLoading} = useLoading(false);



  useEffect(() => {
    if(show){


      allRoles().then(response => {
        if(response.status){
          var formatedRecords = response.data?.map(obj => {
            return {
              label : obj?.trl_role_name,
              value : obj?.trl_role_id,
              slug : obj?.trl_role_slug,
              isDisabled : false
            }
          })
          dispatch(setRoles(formatedRecords));

          dispatch(handleEnableDisabledRole());
        }else{
          toast.error(response.message);  
        }
      }).catch(err => {
        toast.error(err.message);
      }) 
  
    }

    
  },[show]);


  


  function handleClickOnAddNewApprover(){
    var initApprovers = {...approvalPathState.singleObj}
    initApprovers.id = Date.now();
    dispatch(setApprovers(initApprovers))
  }

  function handleClickOnAddNewIntemator(){
    var initIntemators = {...approvalPathState.singleObj};
    initIntemators.id = Date.now();
    dispatch(setIntemators(initIntemators))
  }

  function handleChange(type, option){
    dispatch(setFormData({
      key : type,
      value : option
    }))
  }

  function handleSubmit(e){
    e.preventDefault();
    var formData = {...approvalPathState?.formData};
    formData.approvers = approvalPathState?.approvers;
    formData.intemators = approvalPathState?.intemators;
    setLoading(true);
    submitApprovalPath({data : formData}).then((response) => {
      if(response.status){
        toast.success(response.message);
        refreshTable();
        handleModalClose();
        setLoading(false);
      }else{
        setLoading(false);
        toast.error(response.message);
      }
    }).catch((err) => {
      setLoading(false);
      toast.error(err.message);
    })
  }

  function handleModalClose(){
    changeModalStatus("add_approval_path_modal", false);
    dispatch(clearAllState());
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
          scrollable={true}
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Approval Rule</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form className="approval_path_form" id="approval_path_form" onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-lg-12 mb-3">
                  <label htmlFor="approval_path_name" class="form-label">Select Module <span className="text-danger">*</span></label>
                  <Select
                  options={moduleList}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  menuPortalTarget={document.body}
                  value={approvalPathState?.formData?.module}
                  onChange={(option) => {
                    handleChange('module', option);
                  }}
                  isClearable
                  required
                  />
                </div>


                <div className="col-lg-12 mb-3">
                  <div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <label class="form-label approver_path_heading">Add Approvers Role<span className="text-danger">*</span></label><br/>
                        <small>
                          <span><i class="fa-solid fa-circle-info"></i></span>
                          <span style={{marginLeft : "5px"}}>Who will be able to take any action in approvals</span>
                        </small>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-dark"
                        onClick={handleClickOnAddNewApprover}
                        >
                          <i class="fa-solid fa-plus"></i> Add new row
                      </button>
                    </div>
                    <hr className="my-2"/>
                  </div>
                  
                  <div className="reorderable-list">
                    <ul>
                      {formData?.approval_channel_approvers?.map((obj, index) => {
                        return(
                          <ApprovalPathListItem isDeletable={index > 0 ? false : true} suffix_title="Approver" key={index} index={index} id={obj?.id} option={obj?.option} type="approver"/>
                        )
                        
                      })}
                    </ul>
                    
                  </div>
                </div>

                {/* <div className="col-lg-12 mb-3">
                <div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <label class="form-label approver_path_heading">Add Intemator <span className="text-danger">*</span></label><br/>
                        <small>
                          <span><i class="fa-solid fa-circle-info"></i></span>
                          <span style={{marginLeft : "5px"}}>Who will be able to only view the approvals</span>
                        </small>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-dark-outline"
                        onClick={handleClickOnAddNewIntemator}
                        >
                          <i class="fa-solid fa-plus"></i> Add new row
                      </button>
                    </div>
                    <hr className="my-2"/>
                  </div>
                  <div className="reorderable-list">
                    <ul>
                      {approvalPathState?.intemators?.map((obj, index) => {
                        return(
                          <ApprovalPathListItem isDeletable={index > 0 ? false : true} button_status={true} suffix_title="Intemator" option={obj?.option} index={index} id={obj?.id} type="intemator"/>
                        )
                        
                      })}
                    </ul>
                    
                  </div>
                </div> */}
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "flex-end",
              }}>
              <div className=""></div>
              <div className="">
                <button className="btn btn-primary m-2" form="approval_path_form">Submit</button>
              </div>
            </div>
          </Modal.Footer>
        </Modal>
        
      </div>
      </>
  )
}