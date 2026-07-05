import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import React, { useEffect, useRef, useState } from "react";
import SetPageTitle from "../../Components/SetPageTitle.js";

import { Button, Modal } from "react-bootstrap";
import "../../assets/css/dashboard.css";

import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../../assets/css/dashboard.css";
import {
  dashBoardBudgetActualData,
  dashBoardBudgetExpenseData,
  dashBoardPillarData,
  dashBoardTotalCountPillar,
} from "../../services/Dashboard-service.js";
import { ActivityWise } from "./ActivityWise.jsx";
import { PillarDataChart } from "./dashboard_menu/PillarDataChartModal.jsx";
import MapDashboard from "./MapDashboard.jsx";
import { userDetails } from "../../auth/auth.js";
import VolunteerDashboard from "./VolunteerDashboard.jsx";
import AdminEventDashboard from "./AdminEventDashboard.jsx";
import ParentDashboard from "./ParentDashboard.jsx";

// ── Dashboard: Role-based router (no hooks — safe for early returns) ──────────
export const Dashboard = () => {
  SetPageTitle("Dashboard");
  const user     = userDetails();
  console.log(user);
  const user_type = user?.user_type || "";

  if (user_type === "employee_volunteer") return <VolunteerDashboard />;
  if (user_type === "CSR volunteering Event login") return <AdminEventDashboard />;
  
  return <ParentDashboard />;
};


// ── Legacy admin dashboard (kept for reference, hidden by default) ─────────────
const InnerDashboard = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [filters, setFilters] = useState({ date_from: "", date_to: "" });
  const [budgetActualOptions, setBudgetActualOptions] = useState();
  const [pillarOptions, setpillarOptions] = useState();
  const [educationTotalCount, setEducationTotalCount] = useState(0); // Default selected year
  const [healthTotalCount, setHealthTotalCount] = useState(0); // Default selected year
  const [empowermentTotalCount, setEmpowermentTotalCount] = useState(0); // Default selected year
  const [communityTotalCount, setCommunityTotalCount] = useState(0); // Default selected year
  const [budgetExpense, setBudgetExpense] = useState({}); // Default selected year
  const navigate = useNavigate();

  const handleNavigation = (id) => {
    if (id === "education") {
      navigate(`/admin/dashboard/education`);
    } else if (id === "health") {
      navigate(`/admin/dashboard/health`);
    } else if (id === "empowerment") {
      navigate(`/admin/dashboard/empowerment`);
    } else {
      toast(
        <div>
          <i
            className="fa-regular fa-circle-xmark"
            style={{ color: "red", marginRight: "8px" }}
          ></i>
          <h5 style={{ display: "inline", color: "red" }}>No Data Available</h5>
        </div>
      );
    }
  };

  useEffect(() => {
    detailsofBudgetActualChart();
    detailsofBudgetExpenseChart();
    detailsofPillarChart();
    detailsofTotalCountPillar();
  }, []);

  const detailsofBudgetActualChart = async () => {
    try {
      const response = await dashBoardBudgetActualData();
      if (response.status === 1) {
        const options = response.data.map((item) => ({
          tfy_id: item.fy_year_id,
          tfy_year_no: item.tfy_year_label,
          total_budget_amount: parseFloat((item.budget + (item.budget_amendment || 0)).toFixed(2)), // Total Budget = Budget + Amendment
          total_actual_amount: parseFloat((item.expense_amount || 0).toFixed(2)),
          budget: parseFloat((item.budget || 0).toFixed(2)), // Store budget separately
          budget_amendment: parseFloat((item.budget_amendment || 0).toFixed(2)), // Store amendment separately
          categories: `FY ${item.tfy_year_label}`,
        }));
  
        // Update the state with the processed options
        setBudgetActualOptions(options);
      }
    } catch (error) {
      console.error("Error fetching budget data:", error);
    }
  };
  
  
  
  const detailsofBudgetExpenseChart = async () => {
    try {
      const response = await dashBoardBudgetExpenseData();
      if (
        response.status === 1 &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const budgetData = response.data[0]?.budget_expense_data || [];

        if (!Array.isArray(budgetData)) {
          console.error("Invalid budget data format");
          return;
        }

        // Sum total_budget_amount
        const totalBudgetAmount = budgetData.reduce(
          (sum, item) => sum + (item.total_budget_amount || 0),
          0
        );

        // Aggregate total of monthlyAmounts
        let totalMergedMonthlyAmount = 0;
        budgetData.forEach((item) => {
          if (Array.isArray(item.month_json)) {
            item.month_json.forEach((monthItem) => {
              if (
                monthItem.monthlyAmounts &&
                typeof monthItem.monthlyAmounts === "object"
              ) {
                totalMergedMonthlyAmount += Object.values(
                  monthItem.monthlyAmounts
                ).reduce((sum, value) => sum + (value || 0), 0);
              }
            });
          }
        });

        const totalBudgetAmountNumber = parseFloat(
          totalBudgetAmount,
          2
        ).toFixed();
        const totalMergedMonthlyAmountNumber = parseFloat(
          totalMergedMonthlyAmount,
          2
        ).toFixed();

        setBudgetExpense({
          total_Amount: totalBudgetAmountNumber,
          total_Expense: totalMergedMonthlyAmountNumber,
        });
      } else {
        console.error("Invalid response format or empty data");
      }
    } catch (error) {
      console.error("Error fetching financial years:", error);
    }
  };

  const detailsofPillarChart = async () => {
    try {
      const response = await dashBoardPillarData();
      if (response.status === 1) {
        const options = response.data?.[0]?.pillar_data.reduce((acc, curr) => {
          // Find if an entry with the same `tpsm_id`, `tpsm_name`, and `tbm_id` already exists
          const existing = acc.find(
            (item) =>
              item.tpsm_id === curr.tpsm_id && item.tpsm_name === curr.tpsm_name
          );

          // Calculate the sum of `monthlyAmounts` if `tabm_month_json` is not null
          const totalActualAmount = curr.tabm_month_json
            ? curr.tabm_month_json.reduce((sum, monthItem) => {
                const monthlyAmounts = Object.values(
                  monthItem.monthlyAmounts || {}
                );
                return (
                  sum +
                  monthlyAmounts.reduce((total, value) => total + value, 0)
                );
              }, 0)
            : 0;

          if (existing) {
            // Update the existing entry
            existing.total_budget_amount += curr.total_budget_amount;
            existing.total_actual_amount += totalActualAmount;
          } else {
            // Add a new entry
            acc.push({
              tpsm_id: curr.tpsm_id,
              tpsm_name: curr.tpsm_name,
              total_budget_amount: curr.total_budget_amount,
              total_actual_amount: totalActualAmount,
            });
          }

          return acc;
        }, []);

        // Update the state with the processed data
        setpillarOptions(options);
      }
    } catch (error) {
      console.error("Error fetching financial years:", error);
    }
  };

  const detailsofTotalCountPillar = async () => {
    try {
      const response = await dashBoardTotalCountPillar(filters);
      if (response.status === 1) {
        setEducationTotalCount(response.data?.[0]?.total_education_count_year);
        setHealthTotalCount(response.data?.[0]?.total_health_count_year);
        setEmpowermentTotalCount(
          response.data?.[0]?.total_empowerment_count_year
        );
        setCommunityTotalCount(response.data?.[0]?.total_community_count_year);
      }
    } catch (error) {
      console.error("Error fetching financial years:", error);
    }
  };

  const handleReset = () => {
    setFilters({ date_from: "", date_to: "" });
    detailsofTotalCountPillar();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  Highcharts.setOptions({
    accessibility: {
      enabled: true,
    },
  });

  const options = {
    
    chart: {
      type: "column",
      
    },
    credits: {
      enabled: false,
    },
    title: {
      text: "",
    },
    legend: {
      align: "left",
      verticalAlign: "top",
      layout: "horizontal",
      itemStyle: {
        fontWeight: "bold",
      },
      symbolWidth: 14,
      symbolHeight: 14,
      symbolRadius: 2, // Checkbox-like legend symbols
    },
    xAxis: {
      categories: budgetActualOptions?.map((item) => item.categories),
      crosshair: true,
      lineWidth: 0,
      minorGridLineWidth: 0,
      lineColor: "transparent",
    },
    yAxis: {
      min: 0,
      title: {
        text: "",
      },
    },
    plotOptions: {
      column: {
        borderRadius: 10,
        pointPadding: 0.2,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          allowOverlap: true, // Force display even if they overlap
          crop: false, // Prevent cutting off labels
          overflow: "none", // Allow labels outside chart bounds if necessary
          style: {
            fontWeight: "bold",
            textOutline: "none", // Improve visibility
            fontSize: "9px",
          },
          formatter: function () {
            return `${this.y.toLocaleString()}`;
          },
        },
      },
    },
    series: [
      
      {
        name: "Total Budget(In Lakhs ₹)",
        type: "column",
        data: budgetActualOptions?.map((item) => ({
          y: parseFloat(item.total_budget_amount.toFixed(2)), // Budget + Amendment
          budget: parseFloat(item.budget.toFixed(2)),
          amendment: parseFloat(item.budget_amendment.toFixed(2)),
        })),
        color: "green",
        
      },
      {
        name: "Total Expense(In Lakhs ₹)",
        type: "column",
        data: budgetActualOptions?.map((item) =>
          parseFloat(item.total_actual_amount.toFixed(2))
        ),
        color: "#FF4B4B",
        
      },
    ],
    tooltip: {
      shared: true,
      useHTML: true,
      formatter: function () {
        const point = this.points[0]?.point || {};
        return `<b>${this.x}</b><br/>
                <span style="color:green">\u25A0</span> Total Budget: ₹${point.y.toLocaleString()} L<br/>
                <span style="color:#2F7ED8">\u25A0</span> Budget: ₹${point.budget.toLocaleString()} L<br/>
                <span style="color:#492970">\u25A0</span> Amendment: ₹${point.amendment.toLocaleString()} L<br/>
                <span style="color:#FF4B4B">\u25A0</span> Total Expense: ₹${this.points[1]?.y.toLocaleString()} L`;
      },
    },
  };
  

  // Handle column click
  const handleColumnClick = (event) => {
    const pointId = event.point.options.id; // Get the id from the column point
    setSelectedId(pointId);
    setModalOpen(true);
  };

  const pillar_wise_options = {
    chart: {
      type: "column",
    },
    title: {
      text: "Pillar wise",
    },
    xAxis: {
      categories: pillarOptions?.map((item) => item.tpsm_name),
      crosshair: true,
    },
    yAxis: {
      min: 0,
      title: {
        text: "Values",
      },
    },
    tooltip: {
      shared: true,
      pointFormatter: function () {
        return `<span style="color:${this.color}">\u25CF</span> ${this.series.name}: <b>${this.y} (in lakhs)</b><br/>`;
      },
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: true, // Show labels on columns
        },
        borderRadius: 4,
        pointPadding: 0.2,
        borderWidth: 0,
        cursor: "pointer", // Show a pointer cursor on hover
        events: {
          click: handleColumnClick, // Handle column click
        },
      },
      line: {
        dataLabels: {
          enabled: true, // Show labels on lines
        },
      },
    },
    series: [
      {
        name: "Actual",
        type: "column",
        data: pillarOptions?.map((item) => ({
          y: parseFloat(item.total_actual_amount.toFixed(2)),
          id: item.tpsm_id, // Attach the ID here
        })),
        color: "#2F77D3",
      },
      {
        name: "Plan",
        type: "line",
        data: pillarOptions?.map((item) =>
          parseFloat(item.total_budget_amount.toFixed(2))
        ),
        color: "#FF4B4B",
        marker: {
          symbol: "circle",
        },
      },
    ],
  };

  const chartRef = useRef(null);
  const options1 = {
    chart: {
      type: "pie",
      options3d: {
        enabled: true,
        alpha: 45, // 3D Tilt
        beta: 0,
        depth: 50, // Depth effect
        viewDistance: 25,
      },
    },
    credits: {
      enabled: false,
    },
    title: {
      text: "Budget vs Expenses (In Lakhs ₹)",
      style: {
        fontSize: "13px", // Adjust the size as needed
        fontWeight: "bold", // Optional: Make it bold for better readability
      },
    },
    
    plotOptions: {
      pie: {
        allowPointSelect: true,
        depth: 50,
        innerSize: "60%", // This makes it a Donut Chart
        dataLabels: {
          enabled: true,
          format: "{point.name}: {point.y}",
          style: {
            fontSize: "14px",
            fontWeight: "bold",
          },
        },
      },
    },
    series: [
      {
        name: "Amount",
        type: "pie",
        keys: ["name", "y", "selected", "sliced"],
        data: [
          ["Budget", parseInt(budgetExpense?.total_Amount) || 0],
          ["Expenses", parseInt(budgetExpense?.total_Expense) || 0],
        ],
        showInLegend: true,
      },
    ],
  };

  //My code
  const [key, setKey] = useState("home");

  return (
    <>
    <h1>Dashboard</h1>
    <h2>Comming Soon....................</h2>
      <div className="dashboard-container-card my-3 d-none-important">
        <div className="row dashtop-section">
          <div className="row">
            <div className="col-lg-12 d-flex justify-content-between align-items-center">
              <h3>Piller Information</h3>
              <div class="custom-filter-section">
                <a
                  href="javascript:void(0);"
                  class="filter-link dropdown-toggle d-flex"
                  id="mainHeaderProfile"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  data-bs-auto-close="false"
                >
                  <span className="text me-2">Filter</span>{" "}
                  <div className="btn btn-sm btn-dark">
                    <i className="ti ti-filter"></i>
                  </div>
                </a>
                <ul class="dropdown-menu dropdown-menu-end position-fixed">
                  <div className="card">
                    <div className="card-header d-flex justify-content-between">
                      <h5 className="mb-0">Filter</h5>
                      <a
                        className="text-danger"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault(); // Prevent default anchor behavior
                          const dropdownMenu = e.currentTarget
                            .closest(".custom-filter-section")
                            .querySelector(".dropdown-menu");
                          if (dropdownMenu) {
                            dropdownMenu.classList.toggle("show"); // Toggle the dropdown
                          } else {
                            console.error("Dropdown menu not found");
                          }
                        }}
                        aria-expanded="false"
                      >
                        <i className="fas fa-times"></i>
                      </a>
                    </div>
                    <div className="card-body p-2">
                     <div className="row align-items-end">
                        {/* Date */}
                        <div className="col-md-12">
                          <div className="mb-2">
                            <label
                              htmlFor="exampleFormControlInput1"
                              className="form-label"
                            >
                              Date
                            </label>
                            <div className="row">
                              {/* Date From */}
                              <div className="col-md-6">
                                <div className="mb-3">
                                  <label
                                    htmlFor="exampleFormControlInput1"
                                    className="form-label"
                                  >
                                    Date From
                                  </label>
                                  <input
                                    type="date"
                                    name="date_from"
                                    id="date_from"
                                    value={filters.date_from}
                                    onChange={handleInputChange}
                                    className="form-control"
                                  />
                                </div>
                              </div>

                              {/* Date to */}
                              <div className="col-md-6">
                                <div className="mb-3">
                                  <label
                                    htmlFor="exampleFormControlInput1"
                                    className="form-label"
                                  >
                                    Date to
                                  </label>
                                  <input
                                    type="date"
                                    name="date_to"
                                    id="date_to"
                                    value={filters.date_to}
                                    onChange={handleInputChange}
                                    min={filters.date_from}
                                    className="form-control"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleReset}
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={detailsofTotalCountPillar}
                        className="btn btn-dark ms-2"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-lg-12">
            <div className="dash-left-section">
              <div className="row dashboard-container">
                <div className="col-lg-3 mb-3">
                  <div className="box-shadow bg-white border-radius-10 height-100-p widget-style3">
                    <div className="d-flex flex-wrap align-items-center">
                      <div className="widget-icon red-bg-50">
                        <div className="icon">
                          <i class="fas fa-book-open red-text-50"></i>
                        </div>
                      </div>
                      <div className="widget-data">
                          <b className="font-20">Education</b>
                        <div className="weight-300 font-30">
                          {educationTotalCount ? educationTotalCount : 0}
                        </div>
                        <div className="font-16">
                          No of Beneficiaries
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 mb-3">
                  <div className="box-shadow bg-white border-radius-10 height-100-p widget-style3">
                    <div className="d-flex flex-wrap align-items-center">
                      <div className="widget-icon green-bg-50">
                        <div className="icon">
                          <i class="fas fa-heartbeat green-text-50"></i>
                        </div>
                      </div>
                      <div className="widget-data">
                      <b className="font-20">Health</b>
                        <div className="weight-300 font-30">
                          {healthTotalCount ? healthTotalCount : 0}
                        </div>
                        <div className="weight-400 font-16">No of Beneficiaries</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 mb-3">
                  <div className="box-shadow bg-white border-radius-10 height-100-p widget-style3">
                    <div className="d-flex flex-wrap align-items-center">
                      <div className="widget-icon yellow-bg-50">
                        <div className="icon">
                          <i class="fas fa-book-reader yellow-text-50"></i>
                        </div>
                      </div>
                      <div className="widget-data">
                      <b className="font-20">Empowerment</b>
                        <div className="weight-300 font-30">
                          {empowermentTotalCount ? empowermentTotalCount : 0}
                        </div>
                        <div className="weight-400 font-16">No of Beneficiaries</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 mb-3">
                  <div className="box-shadow bg-white border-radius-10 height-100-p widget-style3">
                    <div className="d-flex flex-wrap align-items-center">
                      <div className="widget-icon blue-bg-50">
                        <div className="icon">
                          <i class="fad fa-users-class blue-text-50"></i>
                        </div>
                      </div>
                      <div className="widget-data">
                      <b className="font-20">Community</b>
                        <div className="weight-300 font-30">
                          {communityTotalCount ? communityTotalCount : 0}
                        </div>
                        <div className="weight-400 font-16">No of Beneficiaries</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row dash-chart-section">
                <div className="col-lg-9">
                  <div className="card m-0">
                    <div className="card-header">
                      {/* <h5 class="mb-0 float-left">Budget V/S Expenses</h5> */}
                    </div>
                    <div className="card-body text-center">
                      <div className="row">
                        <div className="col-lg-5">
                          <HighchartsReact
                            highcharts={Highcharts}
                            options={options1}
                            ref={chartRef}
                            style={{ height: "100px" }}
                          />
                        </div>
                        <div className="col-lg-7">
                          <HighchartsReact
                            highcharts={Highcharts}
                            options={options}
                            style={{ height: "100px" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3">
                  <div className="card dashboard-menu m-0">
                    <div className="card-header">
                      <h5 class="mb-0 float-left">Dashboard Menu</h5>
                    </div>
                    <div className="card-body">
                      <ul>
                        <li
                          className="menu-li-section"
                          onClick={() => handleNavigation("education")}
                        >
                          <div>
                            <p className="d-flex align-items-center">
                              <span className="circle-dot color-1 me-2"></span>
                              Education <i class="fas fa-long-arrow-right ms-2"></i>
                            </p>
                            <small className="ms-3">More Details Information</small>
                          </div>

                          <div className="menu-circle color-1">
                            
                          <div className="widget-icon red-bg-50">
                        <div className="icon">
                          <i class="fas fa-book-open red-text-50"></i>
                        </div>
                      </div>
                          </div>
                        </li>
                        <li
                          className="menu-li-section"
                          onClick={() => handleNavigation("health")}
                        >
                          <div>
                          <p className="d-flex align-items-center">
                            <span className="circle-dot color-2 me-2"></span>
                            Health <i class="fas fa-long-arrow-right ms-2"></i>
                          </p>
                          <small className="ms-3">More Details Information</small>
                          </div>
                          <div className="menu-circle color-2">
                          <div className="widget-icon green-bg-50">
                        <div className="icon">
                          <i class="fas fa-heartbeat green-text-50"></i>
                        </div>
                      </div>
                          </div>
                        </li>
                        <li
                          className="menu-li-section"
                          onClick={() => handleNavigation("empowerment")}
                        >
                          <div>
 <p className="d-flex align-items-center">
                            <span className="circle-dot color-3 me-2"></span>
                            Empowerment <i class="fas fa-long-arrow-right ms-2"></i>
                          </p>
                          <small className="ms-3">More Details Information</small>
                          </div>
                         
                          <div className="menu-circle color-3">
                          <div className="widget-icon yellow-bg-50">
                        <div className="icon">
                          <i class="fas fa-book-reader yellow-text-50"></i>
                        </div>
                      </div>
                          </div>
                        </li>
                        <li
                          className="menu-li-section"
                          onClick={() => handleNavigation("community")}
                        >
                          <div>
                          <p className="d-flex align-items-center">
                            <span className="circle-dot color-4 me-2"></span>
                            Community <i class="fas fa-long-arrow-right ms-2"></i>
                          </p>
                          <small className="ms-3">More Details Information</small></div>
                          <div className="menu-circle color-4">
                          <div className="widget-icon blue-bg-50">
                        <div className="icon">
                          <i class="fad fa-users-class blue-text-50"></i>
                        </div>
                      </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row dash-chart-section my-4">
                <div className="col-lg-12">
                  <div className="card m-0">
                    <div className="card-header">
                      <h5 class="mb-0 float-left">Map</h5>
                    </div>
                    <div className="card-body">
                      <MapDashboard />
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Wise Chart Show */}
              <div
                className="row dash-chart-section mt-10"
              >
                <Tabs
                  id="controlled-tab-example"
                  activeKey={key}
                  onSelect={(k) => setKey(k)}
                  className="mb-3 dash-tab-section"
                >
                  <Tab eventKey="home" title="Total Budget">
                    <ActivityWise />
                  </Tab>
                  {/* <Tab eventKey="profile" title="Total no of Proposal">
                  <ActivityWise /> 
                  </Tab>
                  <Tab eventKey="contact" title="Total no of Project">
                  <ActivityWise /> 
                  </Tab> */}
                </Tabs>
              </div>
              {/* Activity Wise Chart End */}
            </div>
          </div>
        </div>

        <div className="allModals">
          {/* Update User Modal Start */}
          <Modal
            open={isModalOpen}
            onCancel={() => setModalOpen(false)}
            centered
            size="lg"
            maskClosable={false}
            id="pillar_wise_modal"
          >
            
              
            
            
              <PillarDataChart open={isModalOpen} selectedId={selectedId} />
            
            
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Close
              </Button>
            
          </Modal>
          {/* Update User Modal End */}
        </div>
      </div>
    </>
  );
};
