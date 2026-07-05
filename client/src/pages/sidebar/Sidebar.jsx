import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Collapse } from 'react-bootstrap';
import logo from "../../assets/images/logo.jpg";
import logoSm  from "../../assets/images/shreecement-sm-logo.png";
import "./sidebar.css";
import { HiOutlineReceiptTax } from "react-icons/hi";
import { RiAdminFill } from "react-icons/ri";
import { FaMapLocationDot } from "react-icons/fa6";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { MdManageHistory, MdGrade, MdHome, MdSettings, MdAssignment, MdQuiz, MdGroups, MdPhotoLibrary } from "react-icons/md";
import { RiSurveyLine } from "react-icons/ri";
import { TbReport } from "react-icons/tb";
import { getParentModulePermissionFun } from "../../helper/common";

export const Sidebar = ({ sidebarState }) => {
  const [activeElements, setActiveElements] = useState(1);
  const [activeSubMenu, setActiveSubMenu] = useState(1);
  const [parentModulePermissions, setParentModulePermissions] = useState(
    [
      // Admin Management
      'users',
      'role',

      // Master Management
      'pillar_list',
      'foundation',
      'master',
      'faculty',

      // Location Management
      'state',
      'district',
      'block',
      'village',

      // Budget Management
      'budget',
      'budget_amendment'
    ]
  );

  const handleMenuClick = (index) => {
    setActiveElements((prevActive) => (prevActive === index ? null : index));
  };

  const handleSubMenuClick = (menu) => {
    setActiveSubMenu((prev) => (prev === menu ? "" : menu));
  };

  useEffect(() => {

    getParentModulePermissionFun('new_project')
      .then((module) => {

        setParentModulePermissions(module);
      })
      .catch((error) => {
        console.error('Error fetching module permissions:', error);
      });
  }, []);




  return (
    <aside className={`modern-sidebar-pane ${sidebarState}`}>
      {/* Brand Logo */}
      <div className="sidebar-logo-area">
        <div className="logo-container-glass">
          <img src={logo} alt="Shree Cement" className=""  />
        </div>
        <span className="sidebar-brand">
           <img src={logoSm} alt="Shree Cement" className=""  />
        </span>
      </div>

      <div className="sidebar-scroll-zone">
        <nav>
          <ul id="sidebarnav" className="sidebarnav sidebar-nav-list">
            {/* --------------------------------- Dashboard ---------------------------------- */}
            <li
              className={`sidebar-item ${activeElements === 1 ? "in" : ""
                } cursor-pointer`}
              onClick={() => handleMenuClick(1)}
            >
              <NavLink to="/admin/dashboard" className="sidebar-link">
                <span>
                  <i className="ti ti-activity-heartbeat"></i>
                </span>
                <span className="hide-menu">Dashboard</span>
              </NavLink>
            </li>
            {/* --------------------------------- Map ---------------------------------- */}


            {
              Array.isArray(parentModulePermissions) &&
              parentModulePermissions.some(permission => ['map'].includes(permission)) && (
                <li
                  className={`sidebar-item ${activeElements === 2 ? "in" : ""
                    } cursor-pointer`}
                  onClick={() => handleMenuClick(2)}
                >
                  <NavLink to="/admin/map" className="sidebar-link">
                    <span>
                      <i className="ti ti-map"></i>
                    </span>
                    <span className="hide-menu">Map</span>
                  </NavLink>
                </li>
              )}

            {/* --------------------------------- Admin Management ---------------------------------- */}
            {
              Array.isArray(parentModulePermissions) &&
              parentModulePermissions.some(permission => ['users', 'role', 'approval'].includes(permission)) && (
                <li
                  className={`sidebar-item ${activeElements === 3 ? "in" : ""
                    } cursor-pointer`}
                >
                  <div
                    id={activeElements === 3 ? "red-bg" : ""}
                    className={`sidebar-link has-arrow ${activeElements === 3 ? "active" : ""}`}
                    onClick={() => handleMenuClick(3)}
                    aria-controls="admin-management-collapse"
                    aria-expanded={activeElements === 3}
                  >
                    <span className="d-flex">
                      <RiAdminFill />
                    </span>
                    <span className="hide-menu">Admin Management</span>
                  </div>

                  <Collapse in={activeElements === 3}>
                    <ul id="admin-management-collapse" className="first-level list-unstyled ps-4">
                      {
                        parentModulePermissions.some(permission => permission === 'users') && (
                          <li className="sidebar-item mt-2">
                            <NavLink to="/admin/users" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-user-circle"></i>
                              </div>
                              <span className="hide-menu">Users Master</span>
                            </NavLink>
                          </li>
                        )}

                      {
                        parentModulePermissions.some(permission => permission === 'role') && (
                          <li className="sidebar-item mt-2">
                            <NavLink to="/admin/role" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-user-circle"></i>
                              </div>
                              <span className="hide-menu">Role Master</span>
                            </NavLink>
                          </li>
                        )}
                      {
                        parentModulePermissions.some(permission => permission === 'approval') && (
                          <li className="sidebar-item mt-2 mb-2">
                            <NavLink to="/admin/approval_path" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-route"></i>
                              </div>
                              <span className="hide-menu">Approval Path</span>
                            </NavLink>
                          </li>
                        )}
                    </ul>
                  </Collapse>
                </li>
              )}

            {/* --------------------------------- Start Location Data Management ---------------------------------- */}

            {
              Array.isArray(parentModulePermissions) &&
              parentModulePermissions.some(permission => [
                'state',
                'district',
                'block',
                'village',
                'gram_panchayat',
                'revenue_village',
                'village',
                'type_of_village',
                'distance_from_plant'

              ].includes(permission)) && (
                <li
                  className={`sidebar-item ${activeElements === 4 ? "in" : ""
                    } cursor-pointer`}
                >
                  <div
                    id={activeElements === 4 ? "red-bg" : ""}
                    className={`sidebar-link has-arrow ${activeElements === 4 ? "active" : ""}`}
                    onClick={() => handleMenuClick(4)}
                    aria-controls="location-management-collapse"
                    aria-expanded={activeElements === 4}
                  >
                    <span className="d-flex">
                      <FaMapLocationDot />
                    </span>
                    <span className="hide-menu">Location Management</span>
                  </div>

                  <Collapse in={activeElements === 4}>
                    <ul id="location-management-collapse" className="first-level list-unstyled ps-4">
                      {
                        parentModulePermissions.some(permission => permission === 'state') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/state" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-map-pin"></i>
                              </div>
                              <span className="hide-menu">State</span>
                            </NavLink>
                          </li>
                        )}

                      {
                        parentModulePermissions.some(permission => permission === 'district') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/district" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-map-pin"></i>
                              </div>
                              <span className="hide-menu">District</span>
                            </NavLink>
                          </li>
                        )}

                      {
                        parentModulePermissions.some(permission => permission === 'block') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/block" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-map-pin"></i>
                              </div>
                              <span className="hide-menu">Block</span>
                            </NavLink>
                          </li>
                        )}

                      {
                        parentModulePermissions.some(permission => permission === 'gram_panchayat') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/gram-panchayat" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-map-pin"></i>
                              </div>
                              <span className="hide-menu">Gram Panchayat</span>
                            </NavLink>
                          </li>
                        )}

                      {
                        parentModulePermissions.some(permission => permission === 'revenue_village') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/revenue-village" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-map-pin"></i>
                              </div>
                              <span className="hide-menu">Revenue Village</span>
                            </NavLink>
                          </li>
                        )}

                      {
                        parentModulePermissions.some(permission => permission === 'village') && (

                          <li className="sidebar-item">
                            <NavLink to="/admin/village" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-map-pin"></i>
                              </div>
                              <span className="hide-menu">Village/Hamlet</span>
                            </NavLink>
                          </li>
                        )}

                      

                      {
                        parentModulePermissions.some(permission => permission === 'distance_from_plant') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/distance-from-plant" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                 <i className="ti ti-map-pin"></i>
                              </div>
                              <span className="hide-menu">Distance from Plant </span>
                            </NavLink>
                          </li>
                        )}


                      {/* 
                    {
                      parentModulePermissions.some(permission => permission === 'village') && (
                        <li className="sidebar-item">
                          <NavLink to="/admin/location" className="sidebar-link">
                            <div className="round-16 d-flex align-items-center justify-content-center">
                              <i className="ti ti-user-circle"></i>
                            </div>
                            <span className="hide-menu">Location</span>
                          </NavLink>
                        </li>
                      )} */}

                    </ul>
                  </Collapse>
                </li>
              )}

            {/* --------------------------------- End Location Data Management ---------------------------------- */}

            {/* --------------------------------- Start Priority Alignment Master Management ---------------------------------- */}
            {
              Array.isArray(parentModulePermissions) &&
              parentModulePermissions.some(permission => [
                'unit_master',
                'schedule_vii',
                'sdg',
                'theme',
                'type_of_beneficiary',
                'activities',
                'outcome_indicators',
                'category',
                'kpi_master',

              ].includes(permission)) && (

                <li
                  className={`sidebar-item ${activeElements === 5 ? "in" : ""
                    } cursor-pointer`}
                >
                  <div
                    id={activeElements === 5 ? "red-bg" : ""}
                    className={`sidebar-link has-arrow ${activeElements === 5 ? "active" : ""}`}
                    onClick={() => handleMenuClick(5)}
                    aria-controls="unit-master-collapse"
                    aria-expanded={activeElements === 5}
                  >
                    <span className="d-flex">
                      <i className="ti ti-list-numbers"></i>
                    </span>
                    <span className="hide-menu">Master Management</span>
                  </div>

                  <Collapse in={activeElements === 5}>
                    <ul id="unit-master-collapse" className="first-level list-unstyled ps-4">




                      {
                        parentModulePermissions.some(permission => permission === 'unit_master') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/unit-master" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-building"></i>
                              </div>
                              <span className="hide-menu">Unit Master</span>
                            </NavLink>
                          </li>
                        )}


                     


                      {
                        parentModulePermissions.some(permission => permission === 'sdg') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/sdg-master-list" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-world"></i>
                              </div>
                              <span className="hide-menu">SDGs mapping</span>
                            </NavLink>
                          </li>
                        )}


                      {/* {
                        parentModulePermissions.some(permission => permission === 'theme') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/theme" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-user-circle"></i>
                              </div>
                              <span className="hide-menu">Theme List</span>
                            </NavLink>
                          </li>
                        )} */}

                        
                         {
                        parentModulePermissions.some(permission => permission === 'schedule_vii') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/schedule-seven-master-list" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-list-details"></i>
                              </div>
                              <span className="hide-menu">Thematic Area Master list</span>
                            </NavLink>
                          </li>
                        )}



                      <li className="sidebar-item">
                        <NavLink to="/admin/sub-theme" className="sidebar-link">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-user-circle"></i>
                          </div>
                          <span className="hide-menu">Sub Theme</span>
                        </NavLink>
                      </li>

                      {
                        parentModulePermissions.some(permission => permission === 'type_of_beneficiary') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/type-of-beneficiary" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                  <i className="ti ti-users"></i>
                              </div>
                              <span className="hide-menu">Type of Beneficiary</span>
                            </NavLink>
                          </li>
                        )}


                      {/* {
                        parentModulePermissions.some(permission => permission === 'activities') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/activity-master-list" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                 <i className="ti ti-clipboard-list"></i>
                              </div>
                              <span className="hide-menu">Activity List</span>
                            </NavLink>
                          </li>
                        )} */}

                      {/* {
                        parentModulePermissions.some(permission => permission === 'sub_activity_list') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/sub-activity-master-list" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-user-circle"></i>
                              </div>
                              <span className="hide-menu">Sub Activity List</span>
                            </NavLink>
                          </li>
                      )} */}

                      {
                        parentModulePermissions.some(permission => permission === 'kpi_master') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/kpi-master" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                               <i className="ti ti-chart-bar"></i>
                              </div>
                              <span className="hide-menu">KPI Master</span>
                            </NavLink>
                          </li>
                        )}

                      {
                        parentModulePermissions.some(permission => permission === 'outcome_indicators') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/kpi-outcome-indicators" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-chart-line"></i>
                              </div>
                              <span className="hide-menu">KPIs / Outcome Indicators</span>
                            </NavLink>
                          </li>
                        )}

                      <li className="sidebar-item">
                        <NavLink to="/admin/kpi-variable" className="sidebar-link">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                             <i className="ti ti-adjustments"></i>
                          </div>
                          <span className="hide-menu">KPI Variable</span>
                        </NavLink>
                      </li>


                      {
                        parentModulePermissions.some(permission => permission === 'category') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/category" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-category"></i>
                              </div>
                              <span className="hide-menu">Category</span>
                            </NavLink>
                          </li>
                        )}


                      {/* {
                      {
                      parentModulePermissions.some(permission => permission === 'focus_area_list') && (
                        <li className="sidebar-item">
                          <NavLink to="/admin/sub-schedule" className="sidebar-link">
                            <div className="round-16 d-flex align-items-center justify-content-center">
                              <i className="ti ti-user-circle"></i>
                            </div>
                            <span className="hide-menu">Sub Schedule</span>
                          </NavLink>
                        </li>
                      )}

                    
                      parentModulePermissions.some(permission => permission === 'focus_area_list') && (
                        <li className="sidebar-item">
                          <NavLink to="/admin/focus-area-master-list" className="sidebar-link">
                            <div className="round-16 d-flex align-items-center justify-content-center">
                              <i className="ti ti-user-circle"></i>
                            </div>
                            <span className="hide-menu">Focus Area Master list</span>
                          </NavLink>
                        </li>
                      )} */}






                      {/* {
                      parentModulePermissions.some(permission => permission === 'sdgs') && (
                        <li className="sidebar-item">
                          <NavLink to="/admin/national-indicator-framework" className="sidebar-link">
                            <div className="round-16 d-flex align-items-center justify-content-center">
                              <i className="ti ti-user-circle"></i>
                            </div>
                            <span className="hide-menu">National Indicator Framework </span>
                          </NavLink>
                        </li>
                      )}


                      {
                      parentModulePermissions.some(permission => permission === 'profit_center') && (
                        <li className="sidebar-item">
                          <NavLink to="/admin/profit-center-master-list" className="sidebar-link">
                            <div className="round-16 d-flex align-items-center justify-content-center">
                              <i className="ti ti-user-circle"></i>
                            </div>
                            <span className="hide-menu">Profit Center Master list</span>
                          </NavLink>
                        </li>
                      )}


                    {
                      parentModulePermissions.some(permission => permission === 'schedule_seven_list') && (
                        <li className="sidebar-item">
                          <NavLink to="/admin/project-type-master-list" className="sidebar-link">
                            <div className="round-16 d-flex align-items-center justify-content-center">
                              <i className="ti ti-user-circle"></i>
                            </div>
                            <span className="hide-menu">Project Type List</span>
                          </NavLink>
                        </li>
                      )}


                    {
                      parentModulePermissions.some(permission => permission === 'focus_area_list') && (
                        <li className="sidebar-item">
                          <NavLink to="/admin/sub-project-type" className="sidebar-link">
                            <div className="round-16 d-flex align-items-center justify-content-center">
                              <i className="ti ti-user-circle"></i>
                            </div>
                            <span className="hide-menu">Sub Project Type List</span>
                          </NavLink>
                        </li>
                      )} */}







                      {/* {
                        parentModulePermissions.some(permission => permission === 'category') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/master-list" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-user-circle"></i>
                              </div>
                              <span className="hide-menu">Master list</span>
                            </NavLink>
                          </li>
                        )} */}

                    </ul>
                  </Collapse>
                </li>
              )}

            {/* --------------------------------- End Priority Alignment Master Management ---------------------------------- */}

            {/* --------------------------------- Start Budget Master Management ---------------------------------- */}
            {/* {
              Array.isArray(parentModulePermissions) &&
              parentModulePermissions.some(permission => ['budget_management'].includes(permission)) && (

                <li
                  className={`sidebar-item ${activeElements === 7 ? "in" : ""
                    } cursor-pointer`}
                >
                  <div
                    id={activeElements === 7 ? "red-bg" : ""}
                    className="sidebar-link has-arrow"
                    onClick={() => handleMenuClick(7)}
                  >
                    <span className="d-flex">
                      <i className="ti ti-chart-pie"></i>
                    </span>
                    <span className="hide-menu">Budget Master Management</span>
                  </div>

                  <Collapse in={activeElements === 7}>
                    <ul className="first-level list-unstyled ps-4">



                    </ul>
                  </Collapse>
                </li>
              )} */}

            {/* --------------------------------- End Budget Master Management ---------------------------------- */}


            {/* --------------------------------- Start Budgeting Master Management ---------------------------------- */}
            {
              Array.isArray(parentModulePermissions) &&
              parentModulePermissions.some(permission => ['budget_planning_entry'].includes(permission)) && (

                <li
                  className={`sidebar-item ${activeElements === 6 ? "in" : ""
                    } cursor-pointer`}
                >
                  <div
                    id={activeElements === 6 ? "red-bg" : ""}
                    className="sidebar-link has-arrow"
                    onClick={() => handleMenuClick(6)}
                  >
                    <span className="d-flex">
                      <i className="ti ti-coin-rupee"></i>
                    </span>
                    <span className="hide-menu">Budget Planning</span>
                  </div>

                  <Collapse in={activeElements === 6}>
                    <ul className="first-level list-unstyled ps-4">

                      {
                        parentModulePermissions.some(permission => permission === 'budget_planning_entry') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/budgeting/budgeting-management" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-currency-rupee"></i>
                              </div>
                              <span className="hide-menu">Budget planning Entry</span>
                            </NavLink>
                          </li>
                        )}

                      {/* {
                        parentModulePermissions.some(permission => permission === 'budget_transfer_list') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/budgeting/budget-transfer-master" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-user-circle"></i>
                              </div>
                              <span className="hide-menu">Budget transfer Master List</span>
                            </NavLink>
                          </li>
                        )} */}

                    </ul>
                  </Collapse>
                </li>
              )}

            {/* --------------------------------- End Budgeting Master Management ---------------------------------- */}

            {/* --------------------------------- Start Proposal ---------------------------------- */}
            {/* {
              Array.isArray(parentModulePermissions) &&
              parentModulePermissions.some(permission => ['proposal'].includes(permission)) && (

                <li
                  className={`sidebar-item ${activeElements === 9 ? "in" : ""
                    } cursor-pointer`}
                >
                  <div
                    id={activeElements === 9 ? "red-bg" : ""}
                    className="sidebar-link has-arrow"
                    onClick={() => handleMenuClick(9)}
                  >
                    <span className="d-flex">
                      <i className="ti ti-file-text"></i>
                    </span>
                    <span className="hide-menu">Proposal</span>
                  </div>

                  <Collapse in={activeElements === 9}>
                    <ul className="first-level list-unstyled ps-4">

                      {
                        parentModulePermissions.some(permission => permission === 'proposal') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/proposal/proposal-list" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-user-circle"></i>
                              </div>
                              <span className="hide-menu">Proposal List</span>
                            </NavLink>
                          </li>
                        )}

                    </ul>
                  </Collapse>
                </li>
              )} */}

            {/* --------------------------------- End Proposal ---------------------------------- */}

            {/* --------------------------------- Start Project ---------------------------------- */}
            {
              Array.isArray(parentModulePermissions) &&
              parentModulePermissions.some(permission => ['project'].includes(permission)) && (

                <li
                  className={`sidebar-item ${activeElements === 7 ? "in" : ""
                    } cursor-pointer`}
                >
                  <div
                    id={activeElements === 7 ? "red-bg" : ""}
                    className="sidebar-link has-arrow"
                    onClick={() => handleMenuClick(7)}
                  >
                    <span className="d-flex">
                      <i className="ti ti-layout"></i>
                    </span>
                    <span className="hide-menu">Project</span>
                  </div>

                  <Collapse in={activeElements === 7}>
                    <ul className="first-level list-unstyled ps-4">

                      {
                        parentModulePermissions.some(permission => permission === 'project') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/project/project-list" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                 <i className="ti ti-briefcase"></i>
                              </div>
                              <span className="hide-menu">Project List</span>
                            </NavLink>
                          </li>
                        )}

                      {/* {
                        parentModulePermissions.some(permission => permission === 'project_monitoring') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/project/monitoring" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-user-circle"></i>
                              </div>
                            
                            </NavLink>
                          </li>
                        )} */}

                    </ul>
                  </Collapse>
                </li>
              )}

            {/* --------------------------------- End Project ---------------------------------- */}



            {/* --------------------------------- Start Employee Volunteering Master ---------------------------------- */}
            {
              Array.isArray(parentModulePermissions) &&
              parentModulePermissions.some(permission => ['employee_volunteer_list', 'events', 'my_events', 'comming_soon_events'].includes(permission)) && (

                <li
                  className={`sidebar-item ${activeElements === 8 ? "in" : ""
                    } cursor-pointer`}
                >
                  <div
                    id={activeElements === 8 ? "red-bg" : ""}
                    className="sidebar-link has-arrow"
                    onClick={() => handleMenuClick(8)}
                  >
                    <span className="d-flex">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar-event-fill" viewBox="0 0 16 16">
                        <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2m-3.5-7h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5" />
                      </svg>
                    </span>
                    <span className="hide-menu">Employee Volunteering</span>
                  </div>

                  <Collapse in={activeElements === 8}>
                    <ul className="first-level list-unstyled ps-4">

                      {/* {
                        parentModulePermissions.some(permission => permission === 'employee_volunteering') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/employee_volunteering" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-user-circle"></i>
                              </div>
                              <span className="hide-menu">Employee Volunteering List</span>
                            </NavLink>
                          </li>
                        )
                      } */}
                      {
                        parentModulePermissions.some(permission => permission === 'employee_volunteer_list') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/employee_volunteer_list" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-users"></i>
                              </div>
                              <span className="hide-menu">Employee volunteer list</span>
                            </NavLink>
                          </li>
                        )
                      }
                      {
                        parentModulePermissions.some(permission => permission === 'events') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/event" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-calendar-event"></i>
                              </div>
                              <span className="hide-menu">Events</span>
                            </NavLink>
                          </li>
                        )
                      }
                      {
                        parentModulePermissions.some(permission => permission === 'my_events') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/my_events" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-calendar-user"></i>
                              </div>
                              <span className="hide-menu">My Events</span>
                            </NavLink>
                          </li>
                        )
                      }
                      {
                        parentModulePermissions.some(permission => permission === 'comming_soon_events') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/comming_soon_events" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                  <i className="ti ti-calendar-time"></i>
                              </div>
                              <span className="hide-menu">Coming Events</span>
                            </NavLink>
                          </li>
                        )
                      }




                    </ul>
                  </Collapse>
                </li>
              )}

            {/* --------------------------------- End Employee Volunteering Master ---------------------------------- */}


            {/* --------------------------------- Start Ngo Master ---------------------------------- */}
            {
              Array.isArray(parentModulePermissions) &&
              parentModulePermissions.some(permission => ['ngo_list', 'ngo_profile'].includes(permission)) && (

                <li
                  className={`sidebar-item ${activeElements === 9 ? "in" : ""
                    } cursor-pointer`}
                >
                  <div
                    id={activeElements === 9 ? "red-bg" : ""}
                    className="sidebar-link has-arrow"
                    onClick={() => handleMenuClick(9)}
                  >
                    <span className="d-flex">
                      <i className="ti ti-users"></i>
                    </span>
                    <span className="hide-menu">NGO</span>
                  </div>

                  <Collapse in={activeElements === 9}>
                    <ul className="first-level list-unstyled ps-4">

                      {
                        parentModulePermissions.some(permission => permission === 'ngo_list') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/ngo/ngo-master-list" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                               <i className="ti ti-building-community"></i>
                              </div>
                              <span className="hide-menu">NGO Master List</span>
                            </NavLink>
                          </li>
                        )}

                      {
                        parentModulePermissions.some(permission => permission === 'ngo_profile') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/ngo/ngo-profile-master-list" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-id"></i>
                              </div>
                              <span className="hide-menu">NGO Profile</span>
                            </NavLink>
                          </li>
                        )}

                    </ul>
                  </Collapse>
                </li>
              )}

            {/* --------------------------------- End Ngo Master ---------------------------------- */}


            {/* --------------------------------- Start Vendor Master ---------------------------------- */}

            {
              Array.isArray(parentModulePermissions) &&
              parentModulePermissions.some(permission => ['vendor'].includes(permission)) && (
                <li
                  className={`sidebar-item ${activeElements === 10 ? "in" : ""
                    } cursor-pointer`}
                >
                  <div
                    id={activeElements === 10 ? "red-bg" : ""}
                    className="sidebar-link has-arrow"
                    onClick={() => handleMenuClick(10)}
                  >
                    <span className="d-flex">
                      <i className="ti ti-users"></i>
                    </span>
                    <span className="hide-menu">Vendor</span>
                  </div>

                  <Collapse in={activeElements === 10}>
                    <ul className="first-level list-unstyled ps-4">


                      <li className="sidebar-item">
                        <NavLink to="/admin/vendor/vendor-master-list" className="sidebar-link">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-user-circle"></i>
                          </div>
                          <span className="hide-menu">Vendor Master List</span>
                        </NavLink>
                      </li>




                    </ul>
                  </Collapse>
                </li>
              )}


            {/* --------------------------------- End Vendor Master ---------------------------------- */}
            {
              Array.isArray(parentModulePermissions) &&
              parentModulePermissions.some(permission => ['gallery'].includes(permission)) && (
                <li
                  className={`sidebar-item ${activeElements === 11 ? "in" : ""
                    } cursor-pointer`}
                >
                  <div
                    id={activeElements === 11 ? "red-bg" : ""}
                    className="sidebar-link has-arrow"
                    onClick={() => handleMenuClick(11)}
                  >
                    <span className="d-flex">
                      <i className="ti ti-photo"></i>
                    </span>
                    <span className="hide-menu">Gallery</span>
                  </div>

                  <Collapse in={activeElements === 11}>
                    <ul className="first-level list-unstyled ps-4">

                      {
                        parentModulePermissions.some(permission => permission === 'case_studies') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/gallery/gallery-list" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-photo"></i>
                              </div>
                              <span className="hide-menu">Gallery List</span>
                            </NavLink>
                          </li>
                        )}




                    </ul>
                  </Collapse>
                </li>
              )}



            {/* --------------------------------- Start Best Practice ---------------------------------- */}
            {
              Array.isArray(parentModulePermissions) &&
              parentModulePermissions.some(permission => ['case_studies'].includes(permission)) && (

                <li
                  className={`sidebar-item ${activeElements === 12 ? "in" : ""
                    } cursor-pointer`}
                >
                  <div
                    id={activeElements === 12 ? "red-bg" : ""}
                    className="sidebar-link has-arrow"
                    onClick={() => handleMenuClick(12)}
                  >
                    <span className="d-flex">
                      <i className="ti ti-award"></i>
                    </span>
                    <span className="hide-menu">Case Studies</span>
                  </div>

                  <Collapse in={activeElements === 12}>
                    <ul className="first-level list-unstyled ps-4">

                      {
                        parentModulePermissions.some(permission => permission === 'case_studies') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/case-study/case-study-master-list" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                 <i className="ti ti-file-text"></i>
                              </div>
                              <span className="hide-menu">Case Studies List</span>
                            </NavLink>
                          </li>
                        )}

                    </ul>
                  </Collapse>
                </li>
              )}

            {/* --------------------------------- End Best Practice ---------------------------------- */}


            {/* --------------------------------- Document Management ---------------------------------- */}
            {
              Array.isArray(parentModulePermissions) &&
              parentModulePermissions.some(permission => ['document_management'].includes(permission)) && (

                <li
                  className={`sidebar-item ${activeElements === 13 ? "in" : ""
                    } cursor-pointer`}
                >
                  <div
                    id={activeElements === 13 ? "red-bg" : ""}
                    className="sidebar-link has-arrow"
                    onClick={() => handleMenuClick(13)}
                  >
                    <span className="d-flex">
                      <i className="ti ti-folder"></i>
                    </span>
                    <span className="hide-menu">Document Management</span>
                  </div>

                  <Collapse in={activeElements === 13}>
                    <ul className="first-level list-unstyled ps-4">

                      {
                        parentModulePermissions.some(permission => permission === 'document_management') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/document-management/document-management-list" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                 <i className="ti ti-files"></i>
                              </div>
                              <span className="hide-menu">Document Management List</span>
                            </NavLink>
                          </li>
                        )}

                    </ul>
                  </Collapse>
                </li>
              )}

            {/* --------------------------------- End Document Management ---------------------------------- */}


            {/* --------------------------------- Start Report ---------------------------------- */}
            {
              Array.isArray(parentModulePermissions) &&
              parentModulePermissions.some(permission => ['reports'].includes(permission)) && (

                <li
                  className={`sidebar-item ${activeElements === 14 ? "in" : ""
                    } cursor-pointer`}
                >
                  <div
                    id={activeElements === 14 ? "red-bg" : ""}
                    className="sidebar-link has-arrow"
                    onClick={() => handleMenuClick(14)}
                  >
                    <span className="d-flex">
                      <i className="ti ti-chart-bar"></i>
                    </span>
                    <span className="hide-menu">Report</span>
                  </div>

                  <Collapse in={activeElements === 14}>
                    <ul className="first-level list-unstyled ps-4">

                      {
                        parentModulePermissions.some(permission => permission === 'reports') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/report/report-list" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                  <i className="ti ti-report"></i>
                              </div>
                              <span className="hide-menu">Report List</span>
                            </NavLink>
                          </li>
                        )}

                    </ul>
                  </Collapse>
                </li>
              )}

            {/* --------------------------------- End Report ---------------------------------- */}






            {/* --------------------------------- Start Audit Report ---------------------------------- */}

            {
              Array.isArray(parentModulePermissions) &&
              parentModulePermissions.some(permission => ['login_logout_audit', 'master_data_audit', 'budget_audit', 'project_audit' , 'event_audit', 'document_audit' ].includes(permission)) && (
              <li
                className={`sidebar-item ${activeElements === 15 ? "in" : ""} cursor-pointer`}
              >
                <div
                  id={activeElements === 15 ? "red-bg" : ""}
                  className="sidebar-link has-arrow"
                  onClick={() => handleMenuClick(15)}
                >
                  <span className="d-flex">
                    <i className="ti ti-chart-bar"></i>
                  </span>
                  <span className="hide-menu">Audit Reports</span>
                </div>

                <Collapse in={activeElements === 15}>
                  <ul className="first-level list-unstyled ps-4">

                    {/* Login Logout Audit */}
                    <li className="sidebar-item">
                      <NavLink
                        to="/admin/audit-report/login-logout"
                        className="sidebar-link"
                      >
                        <div className="round-16 d-flex align-items-center justify-content-center">
                          <i className="ti ti-login"></i>
                        </div>
                        <span className="hide-menu">Login Logout</span>
                      </NavLink>
                    </li>

                    {/* Master Data Audit */}
                    <li className="sidebar-item">
                      <NavLink
                        to="/admin/audit-report/master"
                        className="sidebar-link"
                      >
                        <div className="round-16 d-flex align-items-center justify-content-center">
                          <i className="ti ti-database"></i>
                        </div>
                        <span className="hide-menu">Master Data</span>
                      </NavLink>
                    </li>


                    <li className="sidebar-item">
                      <NavLink
                        to="/admin/audit-report/budget"
                        className="sidebar-link"
                      >
                        <div className="round-16 d-flex align-items-center justify-content-center">
                          <i className="ti ti-database"></i>
                        </div>
                        <span className="hide-menu">Budget</span>
                      </NavLink>
                    </li>

                    <li className="sidebar-item">
                      <NavLink
                        to="/admin/audit-report/project"
                        className="sidebar-link"
                      >
                        <div className="round-16 d-flex align-items-center justify-content-center">
                          <i className="ti ti-database"></i>
                        </div>
                        <span className="hide-menu">Project</span>
                      </NavLink>
                    </li>

                      <li className="sidebar-item">
                      <NavLink
                        to="/admin/audit-report/event"
                        className="sidebar-link"
                      >
                        <div className="round-16 d-flex align-items-center justify-content-center">
                          <i className="ti ti-database"></i>
                        </div>
                        <span className="hide-menu">Event</span>
                      </NavLink>
                    </li>

                      <li className="sidebar-item">
                      <NavLink
                        to="/admin/audit-report/document"
                        className="sidebar-link"
                      >
                        <div className="round-16 d-flex align-items-center justify-content-center">
                          <i className="ti ti-database"></i>
                        </div>
                        <span className="hide-menu">Document</span>
                      </NavLink>
                    </li>

                  </ul>
                </Collapse>
              </li>
            )}

            {/* --------------------------------- End Audit Report ---------------------------------- */}


            {/* {
              Array.isArray(parentModulePermissions) &&
              parentModulePermissions.some(permission => ['budget', 'budget_amendment'].includes(permission)) && (
                <li
                  className={`sidebar-item ${activeElements === 8 ? "in" : ""
                    } cursor-pointer`}
                >
                  <div
                    id={activeElements === 8 ? "red-bg" : ""}
                    className="sidebar-link has-arrow"
                    onClick={() => handleMenuClick(8)}
                  >
                    <span>
                      <FaIndianRupeeSign />
                    </span>
                    <span className="hide-menu">Budget</span>
                  </div>
                  <Collapse in={activeElements === 8}>
                    <ul className="first-level list-unstyled ps-4">
                      {
                        parentModulePermissions.some(permission => permission === 'budget') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/budget" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-book"></i>
                              </div>
                              <span className="hide-menu">Budget</span>
                            </NavLink>
                          </li>
                        )}

                      {
                        parentModulePermissions.some(permission => permission === 'budget_amendment') && (
                          <li className="sidebar-item">
                            <NavLink to="/admin/budget/amendment" className="sidebar-link">
                              <div className="round-16 d-flex align-items-center justify-content-center">
                                <i className="ti ti-book"></i>
                              </div>
                              <span className="hide-menu"> Budget Amendment</span>
                            </NavLink>
                          </li>
                        )}
                    </ul>
                  </Collapse>
                </li>
              )} */}



          </ul>
        </nav>

      </div>
    </aside>

  );
};
