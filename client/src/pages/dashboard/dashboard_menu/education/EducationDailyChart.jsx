import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import exportingInit from "highcharts/modules/exporting";
import exportDataInit from "highcharts/modules/export-data";

import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { EducationChildChartDailyApi } from "../../../../Services/Dashboard-service";

exportingInit(Highcharts);
exportDataInit(Highcharts);

export default function EducationDailyChart({ formData }) {
    const [chartOptions, setChartOptions] = useState([]);
    
    useEffect(() => {
        EducationChildChartDailyApi(formData)
            .then((res) => {
                const datasets = res.data || {};
                const { aslc_data = [], e_center_data = [], navodaya_data = [], pratibha_data = [] } = datasets;
                
                // Function to format data
                const formatChartData = (data, title, yAxisTitle) => ({
                    chart: { type: "column" },
                    title: { text: title },
                    xAxis: { 
                        categories: data.map(item => item.village_name),
                        title: { text: "Villages" }
                    },
                    yAxis: { 
                        min: 0, 
                        title: { text: yAxisTitle } 
                    },
                    series: [{
                        name: yAxisTitle,
                        data: data.map(item => parseInt(item.total_enrolled_students || item.students_taken_admission || 0))
                    }],
                    credits: { enabled: false }
                });

                setChartOptions([
                    formatChartData(aslc_data, "ASLC Data", "Total Enrolled Students"),
                    formatChartData(e_center_data, "E-Center Data", "Total Enrolled Students"),
                    formatChartData(navodaya_data, "Navodaya Data", "Total Enrolled Students"),
                    formatChartData(pratibha_data, "Pratibha Data", "Students Taken Admission")
                ]);
            })
            .catch((err) => {
                toast.error(err.response?.data?.message || "Error fetching data");
            });
    }, [formData]);

    return (
        <div className="row dash-chart-section">
            {chartOptions.map((options, index) => (
                <div className="col-md-6" key={index}>
                    <HighchartsReact highcharts={Highcharts} options={options} />
                </div>
            ))}
        </div>
    );
}
