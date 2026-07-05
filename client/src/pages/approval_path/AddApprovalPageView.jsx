import React, { useState, useEffect } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Modal, Button } from 'react-bootstrap';

import { CiMenuKebab } from "react-icons/ci";
import {  copyApprovalPath, createApprovalPath, rolesList, updateApprovalPath } from "../../services/Role-service";
import { fetchAllApprovalMasterList, getDepartmentsApi, getUnitList } from "../../services/Master-service";
import { MdDelete } from "react-icons/md";
import { FaBuilding, FaCopy } from "react-icons/fa";
import { FaBuildingUser } from "react-icons/fa6";
import { motion, AnimatePresence } from 'framer-motion';
import { TiDelete } from "react-icons/ti";
import { IoMdAdd } from "react-icons/io";
import { FaArrowLeft } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import Select from "react-select";
import { getAllApprovalListDetails } from "../../services/ApprovalPath-Service";
export default function AddApprovalPageView() {
  const navigate=useNavigate();
    const [flowData, setFlowData] = useState([]);
    const [idCounter, setIdCounter] = useState(1);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [dopDropdown, setDopDropdown] = useState({});
const [departmentDependentRole, setDepartmentDependentRole] = useState([]);
const [approvalPathDetails, setApprovalPathDetails] = useState({});

  const [initiatorName, setInitiatorName] = useState("");
const [approvalMasterList,setApprovalMasterList]=useState([]);

      const [addNewApprovalPath,setAddNewApprovalPath] = useState({
        tac_module_name:"",
        tac_approval_master_id:"",
        tac_initiator_role_id:"",
        tac_approval_json:"",
        tac_status:"",
        tac_from_amount: "",
        tac_to_amount: "",
        tac_approved_type: "",
        tac_bu_id: "",
      })

      const { id } = useParams();
      const approvalPathId=id;

      const approvalPathDetailsFun = ()=>{
        getAllApprovalListDetails(approvalPathId).then((res)=>{
          if(res.status==1){
            
            console.log("res?.data[0] ",res?.data[0]);
            

            let data=res?.data[0]?.tac_approval_json;            
            setFlowData(data || []);
            setAddNewApprovalPath({
              tac_module_name:res?.data[0]?.tac_module_name,
              tac_approval_master_id:res?.data[0]?.tac_approval_master_id,
              tac_initiator_role_id:res?.data[0]?.tac_initiator_role_id,
              tac_status:res?.data[0]?.tac_status,
              tac_from_amount: res?.data[0]?.tac_from_amount,
              tac_to_amount: res?.data[0]?.tac_to_amount,
              tac_approved_type: res?.data[0]?.tac_approved_type,
              tac_bu_id: res?.data[0]?.tac_bu_id,
            })

            console.log("data[0] ",data[0].department);

            

          setInitiatorName(res?.data[0]?.trl_role_name);
            

            setDepartmentDependentRole(data[0]?.department)

          }
        }).catch((err)=>{
          console.log(err);
        })
      }


      useEffect(()=>{
        approvalPathDetailsFun();
      },[approvalPathId])
      
      


    // Fetch roles
    const fetchRoles = async () => {
      try {
        const response = await rolesList();
        // console.log("response.data ",response.data);
        
        setRoles(response.data); // assuming response.data = [{ id, name }]
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    const approvalMasterListFun = async () => {
      
      try {
        const response = await fetchAllApprovalMasterList();
       
        
        if (response && Array.isArray(response.data)) {
          setApprovalMasterList(response.data);
        } else {
          setApprovalMasterList([]);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    }



  
    // Fetch departments
    const getDepartmentsFun = async () => {
      try {
        const response = await getDepartmentsApi();
        setDepartments(response.data); // assuming response.data = [{ id, name }]
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
  
    const getLocationsFun = async () => {
      try {
        const response = await getUnitList();
        if (response && Array.isArray(response.data)) {
          setLocations(response.data);
        }
      } catch (error) {
        console.error("Error fetching Units:", error);
      }
    };

    const [locations, setLocations] = useState([]);

    useEffect(() => {
      fetchRoles();
      getDepartmentsFun();
      approvalMasterListFun();
      getLocationsFun();
    }, []);
  
    const addApproval = () => {
      const newApproval = {
        master_id: idCounter,
        sequence: flowData.length + 1,
        role_name: "",
        role_id: "",
        forward: "no",
        dop: "",
        dop_min: 0,
        dop_max: 0,
        dop_total: 0,
        department: [],
      };
      setFlowData([...flowData, newApproval]);
      setIdCounter(idCounter + 1);
    };
  
    const deleteApproval = (index) => {
      const updated = flowData.filter((_, i) => i !== index);
      updated.forEach((item, idx) => (item.sequence = idx + 1));
      setFlowData(updated);
    };
  
    const updateRole = (aIndex, key, value,role_name_key,roleName) => {

      if (key === "role_id") {
        const updated = [...flowData];
        updated[aIndex].role_id = value;
        updated[aIndex].role_name = roleName;
        setFlowData(updated);
        return;
      }else{
        const updated = [...flowData];
        updated[aIndex][key] = value;
        setFlowData(updated);
      }

      
    };
  
    const addDepartment = (aIndex) => {
      const updated = [...flowData];
      updated[aIndex].department.push({
        forward_path_id: aIndex + 1,
        department_name: "",
        department_id: "",
        forward: "yes",
        forward_roles: [],
      });
      setFlowData(updated);
    };
  
    const deleteDepartment = (aIndex, dIndex) => {
      const updated = [...flowData];
      updated[aIndex].department.splice(dIndex, 1);
      setFlowData(updated);
    };
  
    const updateDepartmentId = (aIndex, dIndex, value) => {
      const updated = [...flowData];
      updated[aIndex].department[dIndex].department_id = value;
      setFlowData(updated);
    };
  
    const addRoleToDepartment = (aIndex, dIndex) => {
      const updated = [...flowData];
      updated[aIndex].department[dIndex].forward_roles.push({
        forward_role_id: "",
        forward_role_name: "",
        forward_sequence:
          updated[aIndex].department[dIndex].forward_roles.length + 1,
      });
      setFlowData(updated);
    };
  
    const deleteRole = (aIndex, dIndex, rIndex) => {
      const updated = [...flowData];
      updated[aIndex].department[dIndex].forward_roles.splice(rIndex, 1);     
      setFlowData(updated);
      
    };
  
    const updateForwardRoleId = (aIndex, dIndex, rIndex, value) => {
      const updated = [...flowData];
      updated[aIndex].department[dIndex].forward_roles[rIndex].forward_role_id = value;
      setFlowData(updated);
    };



    const getColorClass = (index) => {
        const colorClasses = ["red-bg", "yellow-bg", "blue-bg", "green-bg"];
        return colorClasses[index % colorClasses.length];
    };


    const [showLeftPanel, setShowLeftPanel] = useState(true);
    const [transitionDelayed, setTransitionDelayed] = useState(false);


  const handleCloseOpenDiv = () => {
    setShowLeftPanel(!showLeftPanel);
  };

  
  const handleShowLeftPanel = () => {
    setShowLeftPanel(true);
    // Start the delayed transition after 500ms
    setTimeout(() => {
      setTransitionDelayed(true);
    }, 100);
  };

  let inputChange = (event, field) => {
    const actualValue = event.target.value;
    setAddNewApprovalPath({
      ...addNewApprovalPath,
      [field]: actualValue,
    });
  };

  const handleSelectChange = (name, selectedOption) => {
    
    setAddNewApprovalPath({
        ...addNewApprovalPath,
        [name]: selectedOption ? selectedOption.target.value : '',
    });
};

  
const [showConfirmModal, setShowConfirmModal] = useState(false);

const confirmCopy = () => {
  const addNewJson = [...flowData];
  const updatedPath = { ...addNewApprovalPath, tac_approval_json: addNewJson };
  setAddNewApprovalPath(updatedPath);

  if (approvalPathId) {
    copyApprovalPath(approvalPathId, updatedPath)
      .then((res) => {
        if (res.status) {
          toast.success(res.message);
          navigate(`/admin/approval_path`);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
  setShowConfirmModal(false);
};

const handleCopyClick = (e) => {
  e.preventDefault();
  setShowConfirmModal(true); // open confirmation modal
};




  return (
    <>
      <div className="d-sm-flex d-block align-items-center justify-content-between page-header-breadcrumb">
        <h4 className="fw-medium mb-0">CSR Budget</h4>
        <div className="ms-sm-1 ms-0">
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="javascript:void(0);">CSR Budget</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                list
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* <DraggableList/> */}
      <Toaster
        position="top-right"
        toastOptions={{ duration: 2000 }}
        reverseOrder={false}
      ></Toaster>

      <span className="position-absolute trigger"></span>

     


      <div className="main-content app-content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xl-12">
              <div className="card custom-card">
                <div className="card-header d-flex justify-content-between">


                  
                  <div className="card-title">Approval Path</div>
                  <div>

                    <Link to={`/admin/approval_path`}>
                      <button type="button" className="btn btn-sm btn-dark">
                        Back
                      </button>
                      
                    </Link>
                    
                  </div>
                </div>
                <div className="card-body">

                <div className="row">
                  <div className="form-group col-md-3 mb-2">
                    <label className="form-label">
                      Approval Type <span className="text-danger">*</span>
                    </label>

                    <select
                      value={addNewApprovalPath.tac_approval_master_id}
                      disabled
                      className="form-select form-select-sm"
                    >
                      <option value="">-- Select Type --</option>
                      {approvalMasterList.map((role) => (
                        <option
                          key={role.taml_id}
                          value={role.taml_id}
                          data-role_name={role.taml_approval_name}
                        >
                          {role.taml_approval_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {approvalMasterList.find(
                    (m) =>
                      m.taml_id == addNewApprovalPath.tac_approval_master_id,
                  )?.taml_slug === "project" && (
                    <div className="form-group col-md-3 mb-2">
                      <label className="form-label">
                        Approval Approved Type{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <select
                        value={addNewApprovalPath.tac_approved_type}
                        disabled
                        className="form-select form-select-sm"
                      >
                        <option value="">-- Select Type --</option>
                        <option value="under_approved">Under Approved</option>
                        <option value="other_than_approved_annual_budget">
                          Other Then Approved Annual Budget
                        </option>
                      </select>
                    </div>
                  )}

                  <div className="form-group col-md-3 mb-2">
                    <label className="form-label">From Amount</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={addNewApprovalPath.tac_from_amount}
                      readOnly
                    />
                  </div>

                  <div className="form-group col-md-3 mb-2">
                    <label className="form-label">To Amount</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={addNewApprovalPath.tac_to_amount}
                      readOnly
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="form-group col-md-3 mb-2">
                    <label className="form-label">
                      Unit <span className="text-danger">*</span>
                    </label>

                    <select
                      value={addNewApprovalPath.tac_bu_id || ""}
                      disabled
                      className="form-select form-select-sm"
                    >
                      <option value="">-- Select Unit --</option>
                      {locations.map((bu) => (
                        <option key={bu.value} value={bu.value}>
                          {bu.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group col-md-3 mb-2">
                    <label className="form-label">
                      Initiator Role <span className="text-danger">*</span>
                    </label>
                    <select
                      disabled
                      value={addNewApprovalPath.tac_initiator_role_id}
                      className="form-select form-select-sm"
                    >
                      <option value="">-- Select Role --</option>
                      {roles.map((role) => (
                        <option key={role.trl_role_id} value={role.trl_role_id}>
                          {role.trl_role_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group col-md-3 mb-2">
                    <label className="form-label">Details Info</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={addNewApprovalPath.tac_module_name}
                      readOnly={true}
                    />
                  </div>
                </div>


                    <div className="row">
                    

      
      <motion.div
          className={showLeftPanel ? "col-md-12" : transitionDelayed ? "col-md-12" : "col-md-7"}  // Dynamically toggle class based on state
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.1, ease: "easeInOut" }}
          
        >

                        {!showLeftPanel && (
          <button className="btn btn-sm btn-success mb-2" onClick={handleShowLeftPanel}>
            <FaArrowRight />
          </button>
        )}

                            <div className="card table-responsive">
                                <div id="wrapper" className="workflow-path">
                                    
                                    <div className="branch lv1 initiate-lvl-1">

                                        {
                                            flowData.length > 0 &&
                                            <span className="label circle-initiate">  {initiatorName}</span>
                                        }

                                        
                                        {flowData.map((master, mIndex) => (
                                            <div className="entry"  key={mIndex}>
                                                <span className={`label ${getColorClass(mIndex)}`}>
                                                {master.sequence} - {master.role_name}
                                                </span>
                                                {
                                                master.forward === "yes" &&
                                                    <div className="branch lv2">
                                                        {master.department.map((dept, deptIndex) => (
                                                        <div className={`entry ${master.department.length == 1 ? 'sole' : ''}`} key={deptIndex}>
                                                            <span className={`label ${getColorClass(deptIndex)}`}>
                                                            Dept : {dept.department_name} 
                                                            </span>

                                                                {
                                                                    dept.forward_roles.length > 0 &&
                                                                    <div className="branch lv3" style={{ display: 'flex' }}>
                                                                        {dept.forward_roles.map((role, roleIndex) => (
                                                                            
                                                                            
                                                                                (roleIndex === 0) ? (
                                                                                  <div className={`entry sole`} key={roleIndex}>
                                                                                    <span className={`label ${getColorClass(deptIndex)}`}>
                                                                                      {`Role: ${role.forward_role_name}`}
                                                                                    </span>
                                                                                  </div>
                                                                                ) : (
                                                                                  <div className={`entry sole`} key={roleIndex} style={{ marginLeft: '199px' }}>
                                                                                    <span className={`label ${getColorClass(deptIndex)}`}>
                                                                                      {`Role: ${role.forward_role_name}`}
                                                                                    </span>
                                                                                  </div>
                                                                                )
                                                                              
                                                                               
                                                                            
                                                                        ))}
                                                                    </div>
                                                                }

                                                        </div>
                                                        ))}
                                                    </div>
                                                }
                                            
                                            </div>
                                        ))}
                                    </div>


                                    
                                    
                                </div>
                            </div>
                            </motion.div>

                                        {
                                          addNewApprovalPath.tac_status == 'active' &&
                                          <div className="row text-center mt-3">
                                          <div className="col-md-12">
                                          <button type="button" className="btn btn-primary col-sm-4" onClick={handleCopyClick}>
                                            <span className="d-flex align-items-center justify-content-center">
                                              <FaCopy className="me-1" />  Copy Approval Path
                                            </span>
                                            
                                          </button>

                                          </div>
                                        </div>
                                        }

                            
                                      
                    </div>
                   

                    

                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
          <div className="modal-backdrop">
            <div className="modal">
              <p>Are you sure you want to copy this approval path?</p>
              <button onClick={confirmCopy}>Yes, Copy</button>
              <button onClick={() => setShowConfirmModal(false)}>Cancel</button>
            </div>
          </div>
        )}

        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Copy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to copy this approval path?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmCopy}>
            Yes, Copy
          </Button>
        </Modal.Footer>
      </Modal>



      


    </>
  )
}
