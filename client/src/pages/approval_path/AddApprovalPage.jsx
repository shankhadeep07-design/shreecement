import React, { useState, useEffect } from "react";
import ScaleLoader from "react-spinners/ScaleLoader";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import { CiMenuKebab } from "react-icons/ci";
import {
  createApprovalPath,
  rolesList,
  updateApprovalPath,
} from "../../Services/Role-service";
import {
  fetchAllApprovalMasterList,
  getDepartmentsApi,
  getUnitList,
} from "../../Services/Master-service";
import { MdDelete } from "react-icons/md";
import { FaBuilding } from "react-icons/fa";
import { FaBuildingUser } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { TiDelete } from "react-icons/ti";
import { IoMdAdd } from "react-icons/io";
import { FaArrowLeft } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";
import Select from "react-select";
import { getAllApprovalListDetails } from "../../Services/ApprovalPath-Service";
import RolesArraySchema from "./ApprovalSchema";
import { Popconfirm } from "antd";

export default function AddApprovalPage() {
  const navigate = useNavigate();
  const [flowData, setFlowData] = useState([]);
  const [idCounter, setIdCounter] = useState(1);
  const [roles, setRoles] = useState([]);
  const [departmentRoles, setDepartmentRoles] = useState({});
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [initiatorName, setInitiatorName] = useState("");
  const [departmentDependentRole, setDepartmentDependentRole] = useState([]);
  const [approvalPathDetails, setApprovalPathDetails] = useState({});

  const [approvalMasterList, setApprovalMasterList] = useState([]);
  const [errors, setErrors] = useState({});

  const [addNewApprovalPath, setAddNewApprovalPath] = useState({
    tac_module_name: "",
    tac_approval_master_id: "",
    tac_initiator_role_id: "",
    tac_bu_id: "",
    tac_approval_json: [],
    tac_from_amount: "",
    tac_to_amount: "",
    tac_approved_type: "",
  });

  const { id } = useParams();
  const approvalPathId = id;

  const approvalPathDetailsFun = () => {
    getAllApprovalListDetails(approvalPathId)
      .then((res) => {
        if (res.status == 1) {
          // console.log("res?.data[0] ",res?.data[0]);

          let data = res?.data[0]?.tac_approval_json;
          setFlowData(data || []);
          setAddNewApprovalPath({
            tac_module_name: res?.data[0]?.tac_module_name,
            tac_from_amount: res?.data[0]?.tac_from_amount,
            tac_to_amount: res?.data[0]?.tac_to_amount,
            tac_approval_master_id: res?.data[0]?.tac_approval_master_id,
            tac_initiator_role_id: res?.data[0]?.tac_initiator_role_id,
            tac_bu_id: res?.data[0]?.tac_bu_id,
            tac_approved_type: res?.data[0]?.tac_approved_type,
          });

          setInitiatorName(res?.data[0]?.trl_role_name);

          setDepartmentDependentRole(data[0]?.department);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    approvalPathDetailsFun();
  }, [approvalPathId]);

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const response = await rolesList();
      setRoles(response.data);

      let role_data = response.data.reduce((acc, role) => {
        const department = role.trl_department || "unknown"; // fallback for null/undefined
        if (!acc[department]) {
          acc[department] = [];
        }
        acc[department].push(role);
        return acc;
      }, {});
      setDepartmentRoles(role_data);
      console.log("role_data ", role_data);
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
        console.error("Invalid data format received:", response);
        setApprovalMasterList([]); // Optionally reset to empty array
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setApprovalMasterList([]); // Optionally reset to empty array on failure
    }
  };

  // Fetch locations
 const getLocationsFun = async () => {
  try {
    const response = await getUnitList();

    console.log(" Unit Response:", response?.data);

    if (response && Array.isArray(response.data)) {
      setLocations(response.data);
    } else {
      setLocations([]);
    }
  } catch (error) {
    console.error("Error fetching Units:", error);
    setLocations([]);
  }
};

  // Fetch departments
  const getDepartmentsFun = async () => {
    try {
      const response = await getDepartmentsApi();
      setDepartments(response.data); // assuming response.data = [{ id, name }]
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  useEffect(() => {
    fetchRoles();
    getLocationsFun();
    getDepartmentsFun();
    approvalMasterListFun();
  }, []);

  //Handel Role By department wise
  const handleRoleByDepartment = (department) => {
    const roles = departmentRoles[department] || [];
    return roles.map((role) => ({
      value: role.trl_role_id,
      label: role.trl_role_name,
    }));
  };

  // Add approval row
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

  // Delete approval row
  const deleteApproval = (index) => {
    const updated = flowData.filter((_, i) => i !== index);
    updated.forEach((item, idx) => (item.sequence = idx + 1));
    setFlowData(updated);
  };

  // Update approval row
  const updateRole = (aIndex, key, value, role_name_key, roleName) => {
    if (key === "role_id") {
      const updated = [...flowData];
      updated[aIndex].role_id = value;
      updated[aIndex].role_name = roleName;
      setFlowData(updated);
      return;
    } else {
      const updated = [...flowData];
      updated[aIndex][key] = value;
      setFlowData(updated);
    }
  };

  // Add department row
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

  // Delete department row
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

  // Add role to department row
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

  // Delete role to department row
  // const deleteRole = (aIndex, dIndex, rIndex) => {
  //   const updated = [...flowData];
  //   updated[aIndex].department[dIndex].forward_roles.splice(rIndex, 1);
  //   setFlowData(updated);
  // };

  const deleteRole = (aIndex, dIndex, rIndex) => {
    const updated = [...flowData];

    // Remove the role
    updated[aIndex].department[dIndex].forward_roles.splice(rIndex, 1);

    // Reassign forward_sequence
    updated[aIndex].department[dIndex].forward_roles = updated[
      aIndex
    ].department[dIndex].forward_roles.map((role, index) => ({
      ...role,
      forward_sequence: index + 1,
    }));

    setFlowData(updated);
  };

  const updateForwardRoleId = (aIndex, dIndex, rIndex, value) => {
    const updated = [...flowData];
    updated[aIndex].department[dIndex].forward_roles[rIndex].forward_role_id =
      value;
    setFlowData(updated);
  };

  // Get color class
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

  const numberChange = (e, name) => {
    let value = e.target.value;

    // Remove everything except digits
    value = value
      .replace(/[^0-9.]/g, "") // remove non-numeric except dot
      .replace(/(\..*)\./g, "$1"); // allow only one dot

    // Limit to 2 decimal places
    if (value.includes(".")) {
      const [intPart, decPart] = value.split(".");
      value = intPart + "." + decPart.slice(0, 2);
    }

    setAddNewApprovalPath((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, selectedOption) => {
    const selectedValue = selectedOption.target.value;
    const selectedOptionData =
      selectedOption.target.options[selectedOption.target.selectedIndex];
    const roleName = selectedOptionData.getAttribute("data-role_name");
    const taml_slug = selectedOptionData.getAttribute("data-taml_slug");
    console.log(roleName);

    setAddNewApprovalPath({
      ...addNewApprovalPath,
      [name]: selectedOption ? selectedOption.target.value : "",
      ...(name === "tac_approval_master_id" &&
        taml_slug !== "project" && { tac_approved_type: "" }),
    });

    if (name === "tac_initiator_role_id") {
      setInitiatorName(roleName || "");
    }
  };

  //   const validateApprovalJson = (data) => {

  //     if (!Array.isArray(data) || data.length === 0) {
  //         console.error("Approval JSON is empty or not an array.");
  //         return false;
  //     }

  //     for (const item of data) {
  //         // Check if it has 'department' (means department type approval)
  //         if (item.department && Array.isArray(item.department)) {
  //             for (const dept of item.department) {
  //                 if (!dept.department_id || !dept.department_name || !dept.forward) {
  //                     console.error("Missing required department fields in: ", dept);
  //                     return false;
  //                 }

  //                 if (!Array.isArray(dept.forward_roles) || dept.forward_roles.length === 0) {
  //                     console.error("Missing forward roles for department: ", dept.department_name);
  //                     return false;
  //                 }

  //                 for (const role of dept.forward_roles) {
  //                     if (!role.forward_role_id || !role.forward_role_name || !role.forward_sequence) {
  //                         console.error("Missing required fields in forward role:", role);
  //                         return false;
  //                     }
  //                 }
  //             }
  //         } else {
  //             // Else, it must be a direct role approval
  //             if (!item.role_id || !item.role_name || !item.forward) {
  //                 console.error("Missing required role fields in:", item);
  //                 return false;
  //             }
  //         }
  //     }

  //     return true;
  // };

  const validateApprovalJson = (approvalData) => {
    console.log("approvalData ", approvalData);
    console.log("flowData ", flowData);
    console.log("addNewApprovalPath ", addNewApprovalPath);

    if (!approvalData || !Array.isArray(approvalData)) {
      return { valid: false, message: "Approval Data is not a valid array!" };
    }

    if (!addNewApprovalPath.tac_approval_master_id) {
      return { valid: false, message: "Missing Approval Type!" };
    }

    // if (!addNewApprovalPath.tac_bu_id) {
    //   return { valid: false, message: "Missing Business Unit!" };
    // }

    if (!addNewApprovalPath.tac_initiator_role_id) {
      return { valid: false, message: "Missing Initiator Role!" };
    }

    const selectedMaster = approvalMasterList.find(
      (m) => m.taml_id == addNewApprovalPath.tac_approval_master_id,
    );
    if (
      selectedMaster?.taml_slug === "project" &&
      !addNewApprovalPath.tac_approved_type
    ) {
      return { valid: false, message: "Missing Approval Approved Type!" };
    }
    console.log("approvalData.length ", approvalData.length);
    if (approvalData.length === 0) {
      return { valid: false, message: "Approval Data is empty!" };
    }

    for (let index = 0; index < approvalData.length; index++) {
      const item = approvalData[index];

      // Department check
      if (item.department) {
        if (!Array.isArray(item.department)) {
          return {
            valid: false,
            message: `Department is not an array at item index ${index + 1}.`,
          };
        }

        if (item.department.length > 0) {
          for (let dIndex = 0; dIndex < item.department.length; dIndex++) {
            const dept = item.department[dIndex];

            if (!dept.department_id) {
              return {
                valid: false,
                message: `Missing Department  at department index ${
                  dIndex + 1
                } in item ${index + 1}.`,
              };
            }
            if (!dept.department_name) {
              return {
                valid: false,
                message: `Missing department_name at department index ${
                  dIndex + 1
                } in item ${index + 1}.`,
              };
            }
            if (!dept.forward) {
              return {
                valid: false,
                message: `Missing forward field at department index ${
                  dIndex + 1
                } in item ${index + 1}.`,
              };
            }
            if (
              !Array.isArray(dept.forward_roles) ||
              dept.forward_roles.length === 0
            ) {
              return {
                valid: false,
                message: `Forward roles missing at department index ${
                  dIndex + 1
                } in item ${index + 1}.`,
              };
            }

            for (let rIndex = 0; rIndex < dept.forward_roles.length; rIndex++) {
              const role = dept.forward_roles[rIndex];
              if (!role.forward_role_id) {
                return {
                  valid: false,
                  message: `Missing forward role id at role ${
                    rIndex + 1
                  } in department ${dIndex + 1} of item ${index + 1}.`,
                };
              }
              if (!role.forward_role_name) {
                return {
                  valid: false,
                  message: `Missing forward role name at role ${
                    rIndex + 1
                  } in department ${dIndex + 1} of item ${index + 1}.`,
                };
              }
              if (!role.forward_sequence) {
                return {
                  valid: false,
                  message: `Missing forward sequence at role ${
                    rIndex + 1
                  } in department ${dIndex + 1} of item ${index + 1}.`,
                };
              }
            }
          }
        }
      }

      // Role based validation
      if (!item.role_id) {
        return {
          valid: false,
          message: `Missing Role Id at item ${index + 1}.`,
        };
      }
      if (!item.role_name) {
        return {
          valid: false,
          message: `Missing Role Name at item ${index + 1}.`,
        };
      }
      if (!item.forward) {
        return {
          valid: false,
          message: `Missing forward field at item ${index + 1}.`,
        };
      }
    }

    return { valid: true, message: "Validation passed!" };
  };

  // Form submit
  const handleFormSubmit = (e) => {
    e.preventDefault();

    const addNewJson = [...flowData];

    addNewApprovalPath.tac_approval_json = addNewJson;

    setAddNewApprovalPath(addNewApprovalPath);
    // console.log("addNewApprovalPath ",addNewApprovalPath);
    // return;

    const validationResult = validateApprovalJson(addNewJson);

    if (!validationResult.valid) {
      toast.error(validationResult.message); // showing error toast
      return;
    }

    if (approvalPathId) {
      updateApprovalPath(approvalPathId, addNewApprovalPath)
        .then((res) => {
          if (res.status) {
            toast.success(res.message);
            navigate(`/admin/approval_path`);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      createApprovalPath(addNewApprovalPath)
        .then((res) => {
          if (res.status) {
            toast.success(res.message);
            navigate(`/admin/approval_path`);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }

    toast.success("Approval Path saved successfully!");
  };

  return (
    <>
      {/* <div className="d-sm-flex d-block align-items-center justify-content-between page-header-breadcrumb">
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
      </div> */}

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
            <div className="home-content approval-path-section">
              <div className="card pb-3">
                <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
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
                        onChange={(selectedOption) => {
                          handleSelectChange(
                            "tac_approval_master_id",
                            selectedOption,
                          );
                        }}
                        className="form-select form-select-sm"
                      >
                        <option value="">-- Select Type --</option>
                        {approvalMasterList.length > 0 &&
                          approvalMasterList.map((role) => (
                            <option
                              key={role.taml_id}
                              value={role.taml_id}
                              data-role_name={role.taml_approval_name}
                              data-taml_slug={role.taml_slug}
                            >
                              {role.taml_approval_name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {approvalMasterList.find(
                      (m) => m.taml_id == addNewApprovalPath.tac_approval_master_id,
                    )?.taml_slug === "project" && (
                      <div className="form-group col-md-3 mb-2">
                        <label className="form-label">
                          Approval Approved Type{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <select
                          value={addNewApprovalPath.tac_approved_type}
                          onChange={(e) =>
                            handleSelectChange("tac_approved_type", e)
                          }
                          className="form-select form-select-sm"
                        >
                          <option value="">-- Select Type --</option>
                          <option value="under_approved_annual_budget">Under Approved Annual Budget</option>
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
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="form-control form-control-sm"
                        onChange={(e) => {
                          numberChange(e, "tac_from_amount");
                        }}
                        value={addNewApprovalPath.tac_from_amount}
                        name="tac_from_amount"
                        placeholder="From Amount"
                        required
                      />
                    </div>

                    <div className="form-group col-md-3 mb-2">
                      <label className="form-label">To Amount</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="form-control form-control-sm"
                        onChange={(e) => {
                          numberChange(e, "tac_to_amount");
                        }}
                        value={addNewApprovalPath.tac_to_amount}
                        name="tac_to_amount"
                        placeholder="To Amount"
                        required
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
                        onChange={(e) => handleSelectChange("tac_bu_id", e)}
                        className="form-select form-select-sm"
                      >
                        <option value="">-- Select Unit --</option>

                        {locations.length > 0 ? (
                          locations.map((bu) => (
                            <option
                              key={bu.value}
                              value={bu.value}
                              data-role_name={bu.label}
                            >
                              {bu.label}
                            </option>
                          ))
                        ) : (
                          <option disabled>No Units Found</option>
                        )}
                      </select>
                    </div>

                    <div className="form-group col-md-3 mb-2">
                      <label className="form-label">
                        Initiator Role <span className="text-danger">*</span>
                      </label>
                      <select
                        value={addNewApprovalPath.tac_initiator_role_id}
                        onChange={(selectedOption) => {
                          handleSelectChange(
                            "tac_initiator_role_id",
                            selectedOption,
                          );
                        }}
                        className="form-select form-select-sm"
                      >
                        <option value="">-- Select Role --</option>
                        {roles.map((role) => (
                          <option
                            key={role.trl_role_id}
                            value={role.trl_role_id}
                            data-role_name={role.trl_role_name}
                          >
                            {role.trl_role_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group col-md-6 mb-2">
                      <label className="form-label">Details Info</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        onChange={(e) => {
                          inputChange(e, "tac_module_name");
                        }}
                        value={addNewApprovalPath.tac_module_name}
                        name="tac_module_name"
                        placeholder="Details Info"
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <AnimatePresence mode="wait">
                      {showLeftPanel && (
                        <motion.div
                          className="col-md-6 h-100"
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          transition={{ duration: 0.1, ease: "easeInOut" }} // Smoother transition
                        >
                          <div className="card approval-flow-card">
                            <div className="card-header d-flex justify-content-between mb-0 align-items-center">
                              <h6 className="mb-0">Approval Flow Builder</h6>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={addApproval}
                              >
                                <FaPlus /> Add Approval
                              </button>
                              <button
                                className="btn btn-sm btn-warning"
                                onClick={(e) => handleCloseOpenDiv()}
                              >
                                <FaArrowLeft />
                              </button>
                            </div>
                            <div className="card-body">
                              {flowData.map((approval, aIndex) => (
                                <div
                                  key={aIndex}
                                  className="card mt-3 mb-3 shadow-sm"
                                >
                                  <div
                                    style={{
                                      fontSize: "31px",
                                      lineHeight: "16px",
                                      position: "absolute",
                                      right: "-12px",
                                      top: "-16px",
                                      zIndex: "1",
                                    }}
                                  >
                                    {/* <TiDelete
                                      className="text-danger"
                                      onClick={() => deleteApproval(aIndex)}
                                      title="Remove Role"
                                    /> */}
                                    <Popconfirm
                                      title="Delete Permission"
                                      description="Are you sure you want to delete?"
                                      okText="Yes"
                                      cancelText="No"
                                      okButtonProps={{ danger: true }}
                                      onConfirm={() => deleteApproval(aIndex)}
                                    >
                                      <TiDelete
                                        className="text-danger"
                                        title="Remove Role"
                                      />
                                    </Popconfirm>
                                  </div>
                                  <div className="card-header mb-0 rounded-2 bg-light d-flex border align-items-center justify-content-between">
                                    <div className="d-flex align-items-center justify-content-between">
                                      <h6 className="mb-0 d-flex align-items-center justify-content-center mr-5">
                                        <label style={{ width: "50px" }}>
                                          {approval.sequence} -{" "}
                                        </label>{" "}
                                        <label className="fw-semibold me-1 ml-2">
                                          Role
                                        </label>
                                        <select
                                          value={approval.role_id}
                                          onChange={(e) => {
                                            const selectedIndex =
                                              e.target.selectedIndex;
                                            const selectedOption =
                                              e.target.options[selectedIndex];
                                            const roleName =
                                              selectedOption.getAttribute(
                                                "data-role_name",
                                              );
                                            const roleId = e.target.value;

                                            // Find full role object by roleId
                                            const matchedRole = roles.find(
                                              (role) =>
                                                role.trl_role_id === roleId,
                                            );

                                            if (matchedRole) {
                                              // console.log("Matched Role Object:", matchedRole);

                                              const updatedFlowData =
                                                flowData.map((item) => {
                                                  if (
                                                    item.sequence ===
                                                    approval.sequence
                                                  ) {
                                                    const updated = [
                                                      ...flowData,
                                                    ];
                                                    updated[aIndex].dop_max =
                                                      matchedRole.trl_max_access_amount;
                                                    updated[aIndex].dop_min =
                                                      matchedRole.trl_min_access_amount;
                                                    updated[aIndex].dop_total =
                                                      matchedRole.trl_access_amount;
                                                    setFlowData(updated);
                                                  }
                                                });
                                            }

                                            // console.log("flowData ",flowData);

                                            updateRole(
                                              aIndex,
                                              "role_id",
                                              roleId,
                                              "role_name",
                                              roleName,
                                            );
                                          }}
                                          className="form-select form-select-sm"
                                        >
                                          <option value="">
                                            -- Select Role --
                                          </option>
                                          {roles.map((role) => (
                                            <option
                                              key={role.trl_role_id}
                                              value={role.trl_role_id}
                                              data-role_name={
                                                role.trl_role_name
                                              }
                                            >
                                              {role.trl_role_name}
                                            </option>
                                          ))}
                                        </select>
                                      </h6>

                                      <div className="d-flex align-items-center">
                                        {/* <div className="d-flex">
                                          <label className="fw-semibold me-2 ms-1">
                                            Can Forward
                                          </label>

                                          <input
                                            type="checkbox"
                                            className="me-2"
                                            checked={approval.forward === "yes"}
                                            onChange={(e) =>
                                              updateRole(
                                                aIndex,
                                                "forward",
                                                e.target.checked ? "yes" : "no",
                                                "",
                                                ""
                                              )
                                            }
                                          />
                                        </div>
                                        <div className="d-flex gap-1 pl-2">
                                          <label className="fw-semibold ms-2 text-dark ">
                                            DOP
                                          </label>

                                          <div>
                                            <input
                                              type="checkbox"
                                              checked={approval.dop === "yes"}
                                              onChange={(e) => {
                                                const isChecked =
                                                  e.target.checked;

                                                updateRole(
                                                  aIndex,
                                                  "dop",
                                                  isChecked ? "yes" : "no",
                                                  "",
                                                  "",
                                                );
                                              }}
                                            />
                                          </div>
                                        </div> */}



                                      </div>
                                    </div>
                                  </div>
                                  <div className="card-body py-0">
                                    {/* Conditional Dropdown */}
                                    <AnimatePresence mode="wait">
                                      {approval.dop === "yes" && (
                                        <motion.div
                                          className="row mt-2"
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{
                                            opacity: 1,
                                            height: "auto",
                                          }}
                                          exit={{ opacity: 0, height: 0 }}
                                          transition={{ duration: 0.3 }}
                                        >
                                          <div className="col-md-4">
                                            <input
                                              type="text"
                                              className="form-control form-control-sm mb-2"
                                              placeholder="Min DOP"
                                              onChange={(e) => {
                                                inputChange(e, "dop_min");
                                              }}
                                              value={approval.dop_min}
                                              readOnly={true}
                                            />
                                          </div>
                                          <div className="col-md-4">
                                            <input
                                              type="text"
                                              className="form-control form-control-sm mb-2"
                                              placeholder="Max DOP"
                                              onChange={(e) => {
                                                inputChange(e, "dop_max");
                                              }}
                                              value={approval.dop_max}
                                              readOnly={true}
                                            />
                                          </div>
                                          <div className="col-md-4">
                                            <input
                                              type="text"
                                              className="form-control form-control-sm"
                                              placeholder="Total DOP"
                                              onChange={(e) => {
                                                inputChange(e, "dop_total");
                                              }}
                                              value={approval.dop_total}
                                              readOnly={true}
                                            />
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>

                                    {/* Show department only if forward is yes */}
                                    <AnimatePresence mode="wait">
                                      {approval.forward === "yes" && (
                                        <>
                                          <motion.div
                                            className="mt-2"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                              opacity: 1,
                                              height: "auto",
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                          >
                                            <button
                                              className="btn btn-sm btn-success mb-3"
                                              onClick={() =>
                                                addDepartment(aIndex)
                                              }
                                              title="Add Department"
                                            >
                                              + Add Department
                                            </button>

                                            {approval.department.map(
                                              (dept, dIndex) => (
                                                <div
                                                  key={dIndex}
                                                  className="mb-3 border rounded p-2"
                                                >
                                                  <div className="d-flex gap-2 align-items-center mb-2">
                                                    <select
                                                      value={dept.department_id}
                                                      onChange={(e) => {
                                                        const updated = [
                                                          ...flowData,
                                                        ];
                                                        const selectedIndex =
                                                          e.target
                                                            .selectedIndex;
                                                        const selectedOption =
                                                          e.target.options[
                                                            selectedIndex
                                                          ];
                                                        const department_name =
                                                          selectedOption.getAttribute(
                                                            "data-department_name",
                                                          );

                                                        updated[
                                                          aIndex
                                                        ].department[
                                                          dIndex
                                                        ].department_id =
                                                          e.target.value;
                                                        updated[
                                                          aIndex
                                                        ].department[
                                                          dIndex
                                                        ].department_name =
                                                          department_name;
                                                        setFlowData(updated);

                                                        // Extract department_ids from flowData
                                                        const flowDeptIds =
                                                          flowData.flatMap(
                                                            (item) =>
                                                              item.department.map(
                                                                (dept) =>
                                                                  dept.department_id,
                                                              ),
                                                          );

                                                        const uniqueDeptIds = [
                                                          ...new Set(
                                                            flowDeptIds,
                                                          ),
                                                        ];

                                                        // Step 2: Group roles by department
                                                        const groupedRolesByDept =
                                                          uniqueDeptIds.map(
                                                            (deptId) => {
                                                              const matchedRoles =
                                                                roles
                                                                  .filter(
                                                                    (role) =>
                                                                      role.trl_department ===
                                                                        deptId ||
                                                                      role.td_id ===
                                                                        deptId,
                                                                  )
                                                                  .map(
                                                                    (role) => ({
                                                                      forward_role_id:
                                                                        role.trl_role_id,
                                                                      forward_role_name:
                                                                        role.trl_role_name,
                                                                    }),
                                                                  );

                                                              return {
                                                                department_id:
                                                                  deptId,
                                                                forward_roles:
                                                                  matchedRoles,
                                                              };
                                                            },
                                                          );

                                                        // // Filter roles that match department_id from flowData
                                                        // const matchedRoles = roles.filter(role =>
                                                        //   flowDeptIds.includes(role.trl_department)
                                                        // );

                                                        // const matchedRoleIds = roles
                                                        //       .filter(role => flowDeptIds.includes(role.trl_department || role.td_id))
                                                        //       .map(role => ({
                                                        //         trl_role_id: role.trl_role_id,
                                                        //         trl_role_name: role.trl_role_name
                                                        //       }));

                                                        setDepartmentDependentRole(
                                                          groupedRolesByDept,
                                                        );

                                                        // setFlowData(updated2);
                                                      }}
                                                      className="form-select form-select-sm"
                                                    >
                                                      <option value="">
                                                        -- Select Department --
                                                      </option>
                                                      {departments.map((d) => (
                                                        <option
                                                          key={d.td_id}
                                                          data-department_name={
                                                            d.td_department_name
                                                          }
                                                          value={d.td_id}
                                                        >
                                                          {d.td_department_name}
                                                        </option>
                                                      ))}
                                                    </select>

                                                    <button
                                                      className="btn btn-sm btn-danger px-1"
                                                      style={{
                                                        fontSize: "18px",
                                                        lineHeight: "18px",
                                                      }}
                                                    >
                                                      <MdDelete
                                                        onClick={() =>
                                                          deleteDepartment(
                                                            aIndex,
                                                            dIndex,
                                                          )
                                                        }
                                                      />
                                                    </button>
                                                    <button
                                                      className="btn btn-sm btn-primary px-1"
                                                      style={{
                                                        fontSize: "18px",
                                                        lineHeight: "18px",
                                                      }}
                                                      onClick={() =>
                                                        addRoleToDepartment(
                                                          aIndex,
                                                          dIndex,
                                                        )
                                                      }
                                                      title="Add Role"
                                                    >
                                                      <IoMdAdd />
                                                    </button>
                                                  </div>

                                                  {/* Forward Roles */}
                                                  {dept.forward_roles.map(
                                                    (role, rIndex) => (
                                                      <div
                                                        key={rIndex}
                                                        className="d-flex gap-2 align-items-center mb-2 ms-4 role-dropdown"
                                                      >
                                                        <Select
                                                          name="role"
                                                          value={{
                                                            value:
                                                              role.forward_role_id,
                                                            label:
                                                              role.forward_role_name,
                                                          }}
                                                          options={handleRoleByDepartment(
                                                            dept.department_id,
                                                          )}
                                                          onChange={(e) => {
                                                            const selectedIndex =
                                                              rIndex;
                                                            const roleName =
                                                              e.label;

                                                            const updated = [
                                                              ...flowData,
                                                            ];
                                                            updated[
                                                              aIndex
                                                            ].department[
                                                              dIndex
                                                            ].forward_roles[
                                                              rIndex
                                                            ].forward_role_id =
                                                              e.value;
                                                            updated[
                                                              aIndex
                                                            ].department[
                                                              dIndex
                                                            ].forward_roles[
                                                              rIndex
                                                            ].forward_role_name =
                                                              roleName;
                                                            setFlowData(
                                                              updated,
                                                            );
                                                          }}
                                                        />

                                                        <button
                                                          className="btn btn-sm btn-danger px-1"
                                                          style={{
                                                            fontSize: "18px",
                                                            lineHeight: "18px",
                                                          }}
                                                          onClick={() =>
                                                            deleteRole(
                                                              aIndex,
                                                              dIndex,
                                                              rIndex,
                                                            )
                                                          }
                                                        >
                                                          <MdDelete />
                                                        </button>
                                                      </div>
                                                    ),
                                                  )}
                                                </div>
                                              ),
                                            )}
                                          </motion.div>
                                        </>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {/* <h5>Generated JSON</h5>{" "}
                            <pre className="bg-light p-3 rounded border">
                              {JSON.stringify(flowData, null, 2)}
                            </pre> */}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div
                      className={
                        showLeftPanel
                          ? "col-md-6"
                          : transitionDelayed
                            ? "col-md-12"
                            : "col-md-6"
                      } // Dynamically toggle class based on state
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.1, ease: "easeInOut" }}
                    >
                      {!showLeftPanel && (
                        <button
                          className="btn btn-sm btn-success mb-2"
                          onClick={handleShowLeftPanel}
                        >
                          <FaArrowRight />
                        </button>
                      )}

                      <div className="card table-responsive">
                        <div id="wrapper" className="workflow-path">
                          <div className="branch lv1 initiate-lvl-1">
                            {flowData.length > 0 && (
                              <span className="label circle-initiate">
                                {initiatorName}
                              </span>
                            )}

                            {flowData.map((master, mIndex) => (
                              <div className="entry" key={mIndex}>
                                <span
                                  className={`label ${getColorClass(mIndex)}`}
                                >
                                  {master.sequence} - {master.role_name}
                                </span>
                                {master.forward === "yes" && (
                                  <div className="branch lv2">
                                    {master.department.map(
                                      (dept, deptIndex) => (
                                        <div
                                          className={`entry ${
                                            master.department.length == 1
                                              ? "sole"
                                              : ""
                                          }`}
                                          key={deptIndex}
                                        >
                                          <span
                                            className={`label ${getColorClass(
                                              deptIndex,
                                            )}`}
                                          >
                                            {dept.department_name}{" "}
                                            {deptIndex + 1}
                                          </span>

                                          {dept.forward_roles.length > 0 && (
                                            <div
                                              className="branch lv3"
                                              style={{ display: "flex" }}
                                            >
                                              {dept.forward_roles.map(
                                                (role, roleIndex) =>
                                                  roleIndex === 0 ? (
                                                    <div
                                                      className={`entry sole`}
                                                      key={roleIndex}
                                                    >
                                                      <span
                                                        className={`label ${getColorClass(
                                                          deptIndex,
                                                        )}`}
                                                      >
                                                        {`Role: ${role.forward_role_name}`}
                                                      </span>
                                                    </div>
                                                  ) : (
                                                    <div
                                                      className={`entry sole`}
                                                      key={roleIndex}
                                                      style={{
                                                        marginLeft: "199px",
                                                      }}
                                                    >
                                                      <span
                                                        className={`label ${getColorClass(
                                                          deptIndex,
                                                        )}`}
                                                      >
                                                        {`Role: ${role.forward_role_name}`}
                                                      </span>
                                                    </div>
                                                  ),
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    <div className="col-sm-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        onClick={handleFormSubmit}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}
