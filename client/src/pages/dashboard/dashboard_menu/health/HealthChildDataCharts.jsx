import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { HealthChildChartApi,EducationChildChartDailyApi } from "../../../../Services/Dashboard-service";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";


export default function HealthChildDataCharts({ formData }) {
    const [chartsData, setChartsData] = useState([]);
    const [chartsDataDaily, setChartsDataDaily] = useState([]);
    const [activeKey, setActiveKey] = useState("0"); // Default open to Yearly Data
    
    useEffect(() => {
        HealthChildChartApi(formData)
        .then((res) => {
            const datasets = res.data || {}; // API response with multiple datasets
            let charts = [];
    
            // Define dataset-specific mappings
            const fieldMappings = {
                toilet_result: {
                    title: "Community Toilet",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "Village Community"],
                },
                cancer_test_camp_result: {
                    title: "Cancer Test Camps",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "People Tested"],
                },
                clinic_result: {
                    title: "Medical Clinics",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "Patients Treated"],
                },
                day_care_result: {
                    title: "Day Care Centers",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "Children Enrolled"],
                },
                fogging_result: {
                    title: "Fogging Initiative",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "Population Covered"],
                },
                health_camp_result: {
                    title: "Health Camps",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "People Treated"],
                },
                isl_result: {
                    title: "Individual Toilet",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "Students Enrolled"],
                },
                mmu_result: {
                    title: "Mobile Medical Unit",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "Patients Treated"],
                },
                nutrition_result: {
                    title: "Nutrition Centers",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "Beneficiaries"],
                },
                water_atm_result: {
                    title: "RO Water ATM Plant",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "People Served"],
                },
            };
    
            Object.entries(datasets).forEach(([key, dataset]) => {
                if (Array.isArray(dataset) && fieldMappings[key]) {
                    const { title, year, centers, students, seriesNames } = fieldMappings[key];
    
                    const categories = dataset.map((item) => item[year]);
                    const centersData = dataset.map((item) => Number(item[centers]) || 0);
                    const studentsData = dataset.map((item) => Number(item[students]) || 0);
    
                    charts.push({
                        title, // Custom dataset-specific title
                        options: {
                            credits: {
                                enabled: false, // Disable the Highcharts credits
                            },
                            chart: { type: "column" },
                            title: { text: title },
                            xAxis: { categories },
                            yAxis: [
                                { title: { text: seriesNames[0] },labels: { enabled: false } },
                                { title: { text: seriesNames[1] }, opposite: true },
                            ],
                            plotOptions: {
                                column: {
                                    dataLabels: {
                                        enabled: true, // Show labels on columns
                                    },
                                },
                                line: {
                                    dataLabels: {
                                        enabled: true, // Show labels on lines
                                    },
                                    
                                },
                            },
                            series: [
                                // {
                                //     name: seriesNames[0], // Custom name for Centers
                                //     type: "column",
                                //     data: '',
                                //     color: getColor(key, "column"),
                                // },
                                {
                                    name: seriesNames[1], // Custom name for Students
                                    type: "line",
                                    data: studentsData,
                                    color: getColor(key, "line"),
                                    yAxis: 1,
                                    
                                },
                            ],
                        },
                    });
                }
            });
    
            setChartsData(charts); // Set all charts data
        })
        .catch((err) => {
            toast.error(err.response?.data?.message || "Error fetching data");
        });
    

            // EducationChildChartDailyApi(formData)
            // .then((res) => {
            //     const datasets = res.data || {}; // API response with multiple datasets
            //     let charts = [];

            //     // Define dataset-specific mappings
            //     const fieldMappings = {
            //         learning_result: {
            //             title: "E-Learning and Education Centers",
            //             year: "tfy_year",
            //             centers: "no_of_centers",
            //             students: "no_of_students_benefited",
            //             seriesNames: ["Learning Centers", "Students Enrolled"],
            //         },
            //         goverment_school_result: {
            //             title: "Government Schools Performance",
            //             year: "tfy_year",
            //             centers: "no_of_centers",
            //             students: "no_of_students_benefited",
            //             seriesNames: ["Govt. Schools", "Govt. School Students"],
            //         },
            //         anganwadi_result: {
            //             title: "Anganwadi Performance",
            //             year: "tfy_year",
            //             centers: "no_of_centers",
            //             students: "no_of_students_benefited",
            //             seriesNames: ["Anganwadi", "Anganwadi Students"],
            //         },
            //         aslc_result: {
            //             title: "After School Learning Center",
            //             year: "tfy_year",
            //             centers: "no_of_centers",
            //             students: "no_of_students_benefited",
            //             seriesNames: ["After School Learning Center", "After School Learning Center Students"],
            //         },
            //     };
                

            //     Object.entries(datasets).forEach(([key, dataset]) => {
            //         if (Array.isArray(dataset) && fieldMappings[key]) {
            //             const { title, year, centers, students, seriesNames } = fieldMappings[key];

            //             const categories = dataset.map((item) => item[year]);
            //             const centersData = dataset.map((item) => Number(item[centers]) || 0);
            //             const studentsData = dataset.map((item) => Number(item[students]) || 0);

            //             charts.push({
            //                 title, // Custom dataset-specific title
            //                 options: {
            //                     chart: { type: "column" },
            //                     title: { text: title },
            //                     xAxis: { categories },
            //                     yAxis: [
            //                         { title: { text: seriesNames[0] }, min: 0 },
            //                         { title: { text: seriesNames[1] }, opposite: true },
            //                     ],
            //                     series: [
            //                         {
            //                             name: seriesNames[0], // Custom name for Centers
            //                             type: "column",
            //                             data: centersData,
            //                             color: getColor(key, "column"),
            //                         },
            //                         {
            //                             name: seriesNames[1], // Custom name for Students
            //                             type: "line",
            //                             data: studentsData,
            //                             color: getColor(key, "line"),
            //                             yAxis: 1,
            //                         },
            //                     ],
            //                 },
            //             });
            //         }
            //     });

            //     setChartsDataDaily(charts); // Set all charts data
            // })
            // .catch((err) => {
            //     toast.error(err.response?.data?.message || "Error fetching data");
            // });

    }, [formData]);

    // Function to generate dataset-specific colors
    const getColor = (key, type) => {
        const colors = {
            cancer_test_camp_result: ["#e74c3c", "#f1c40f"], // Red, Yellow
            clinic_result: ["#3498db", "#2ecc71"], // Blue, Green
            day_care_result: ["#9b59b6", "#f39c12"], // Violet, Orange
            fogging_result: ["#1abc9c", "#e67e22"], // Turquoise, Dark Orange
            health_camp_result: ["#d35400", "#8e44ad"], // Dark Orange, Purple
            isl_result: ["#7f8c8d", "#2980b9"], // Gray, Dark Blue
            mmu_result: ["#34495e", "#f4d03f"], // Dark Gray, Bright Yellow
            nutrition_result: ["#2ecc71", "#c0392b"], // Green, Dark Red
            toilet_result: ["#16a085", "#ff5733"], // Teal, Red-Orange
            water_atm_result: ["#0072bc", "#d9534f"], // Blue, Red
        };
        return colors[key]?.[type === "column" ? 0 : 1] || "#000"; // Default to black
    };
    
    

    return (
        <div className="">
        <Accordion activeKey={activeKey} onSelect={(e) => setActiveKey(e)}>
            {/* Yearly Data Accordion */}
            {
                formData.type == 'yearly' && (
                    <Accordion.Item eventKey="0">
                    <Accordion.Header>Yearly Data</Accordion.Header>
                    <Accordion.Body className="px-0">
                        <div className="row">
                            {chartsData
                                
                                .map((chart, index) => (
                                    <div className="col-lg-4 mb-3" key={index}>
                                        <Card>
                                            <Card.Header>
                                                {/* <h5 className="mb-0">{chart.title}</h5> */}
                                            </Card.Header>
                                            <Card.Body>
                                                <HighchartsReact highcharts={Highcharts} options={chart.options} />
                                            </Card.Body>
                                        </Card>
                                    </div>
                                ))}
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
                )
            }
            

            {/* Daily Data Accordion */}

            {
                formData.type == 'daily' && (
                    <Accordion.Item eventKey="0">
                    <Accordion.Header>Daily Data</Accordion.Header>
                    <Accordion.Body>
                        
                    </Accordion.Body>
                </Accordion.Item>
                )
            }
            
        </Accordion>

        <Toaster />
    </div>
    );
}
