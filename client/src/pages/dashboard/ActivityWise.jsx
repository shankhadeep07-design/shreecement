import React, { useState, useEffect } from "react";
import SetPageTitle from "../../Components/SetPageTitle.js";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Select from "react-select";
import "../../assets/css/dashboard.css";

import "../../assets/css/dashboard.css";
import { currentFinancialYear } from "../../services/Master-service.js";
import { dashBoardActivityData, dashBoardBudgetActualData, dashBoardPillarData, dashBoardTotalCountPillar } from "../../services/Dashboard-service.js";
// import Highcharts3D from "highcharts/highcharts-3d";

// Initialize 3D module
// Highcharts3D(Highcharts);


export const ActivityWise = () => {
  
  const [activitychartData, setActivityChartData] = useState([]);
  const [fromYear, setFromYear] = useState("");
  const [toYear, setToYear] = useState("");

  useEffect(() => {
    detailsofActivityChart();
  }, []);

  useEffect(() => {
    detailsofActivityChart();
  }, [fromYear, toYear]);


  const detailsofActivityChart = async () => {

    try {
      const queryParams = new URLSearchParams();
      if (fromYear) queryParams.append("fromYear", fromYear);
      if (toYear) queryParams.append("toYear", toYear);

      const response = await dashBoardActivityData(queryParams.toString());
      if (response.status === 1) {
        
        const data = response.data?.[0]?.activity_data;
        
        // Update the state with the processed data
        setActivityChartData(data);
      }

    } catch (error) {
        console.error("Error fetching financial years:", error);
    }
  }


  Highcharts.setOptions({
    accessibility: {
      enabled: true,
    },
  });
  

  // Process data for Highcharts
  const categories = [...new Set(activitychartData.map((item) => item.financial_year))]; // Unique years

  const series = [
    {
      name: "Education",
      type: "column",
      data: activitychartData
        .filter((item) => item.tpsm_name === "Education")
        .map((item) => parseFloat(item.total_budget_amount.toFixed(2))) ,
      color: "#2F77D3",
      marker: {
        symbol: "circle",
      },
       dataLabels: {
      enabled: true, 
      style: {
        fontSize: "18px", 
        fontWeight: "bold",  
        color: "#000000",  
      },
    },
    },
    {
      name: "Health",
      type: "column",
      data: activitychartData
        .filter((item) => item.tpsm_name === "Health, Hygiene & Sanitation")
        .map((item) => parseFloat(item.total_budget_amount.toFixed(2))) ,
      color: "green",
      marker: {
        symbol: "circle",
      },
      dataLabels: {
        enabled: true, 
        style: {
          fontSize: "18px", 
          fontWeight: "bold",  
          color: "#000000",  
        },
      },
    },
    {
      name: "Empowerment",
      type: "column",
      data: activitychartData
        .filter((item) => item.tpsm_name === "Empowerment & Livelihood")
        .map((item) => parseFloat(item.total_budget_amount.toFixed(2))) ,
      color: "#FF4B4B",
      marker: {
        symbol: "circle",
      },
      dataLabels: {
        enabled: true, 
        style: {
          fontSize: "18px", 
          fontWeight: "bold",  
          color: "#000000",  
        },
      },
    },
    {
      name: "Community",
      type: "column",
      data: activitychartData
        .filter((item) => item.tpsm_name === "Community Development")
        .map((item) => parseFloat(item.total_budget_amount.toFixed(2))) ,
      color: "yellow",
      marker: {
        symbol: "circle",
      },
      dataLabels: {
        enabled: true, 
        style: {
          fontSize: "18px", 
          fontWeight: "bold",  
          color: "#000000",  
        },
      },
    },
  ];


  const activity_wise_options = {
    chart: {
        type: 'column',
        backgroundColor: null,
        options3d: {
            enabled: true,  // Enable 3D effect
            alpha: 0,      // Tilt angle
            beta: 9,       // Rotation angle
            depth: 45,      // Column depth
            viewDistance: 80
        }
    },
    title: {
        text: ''
    },
    xAxis: {
        categories: categories,
        crosshair: true,
        labels: {
            skew3d: true, // Slight 3D text effect
            style: {
                fontSize: '14px'
            }
        }
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Values'
        },
        labels: {
            skew3d: true // Slight 3D text effect
        }
    },
    tooltip: {
        shared: true,
        pointFormatter: function () {
            return `<span style="color:${this.color}">\u25CF</span> ${this.series.name}: <b>${this.y} (in lakhs)</b><br/>`;
        }
    },
    plotOptions: {
        column: {
            depth: 40,            // Makes columns appear 3D
            borderRadius: 8,      // Rounded top edges
            pointPadding: 0.2,
            borderWidth: 0,
            dataLabels: {
                enabled: true // Show labels on columns
            }
        }
    },
    series
};

  return (
    <>
        <div className="col-lg-12">
            <div className="card m-0">
                <div className="card-header">
                  
                    <div class="mb-0 float-right">
                    <label>From Year: </label>
                        <select onChange={(e) => setFromYear(e.target.value)}>
                        <option value="">Select</option>
                        <option value="TFY0000000022">2020</option>
                        <option value="TFY0000000023">2021</option>
                        <option value="TFY0000000024">2022</option>
                        <option value="TFY0000000025">2023</option>
                        <option value="TFY0000000026">2024</option>
                        <option value="TFY0000000027">2025</option>
                        </select>
                        <label>To Year: </label>
                        <select onChange={(e) => setToYear(e.target.value)}>
                        <option value="">Select</option>
                        <option value="TFY0000000022">2020</option>
                        <option value="TFY0000000023">2021</option>
                        <option value="TFY0000000024">2022</option>
                        <option value="TFY0000000025">2023</option>
                        <option value="TFY0000000026">2024</option>
                        <option value="TFY0000000027">2025</option>
                        </select>
                    </div>
                </div>
                <div className="card-body text-center">
                    <HighchartsReact highcharts={Highcharts} options={activity_wise_options} />
                </div>
            </div>
        </div>
    </>
  );
};
