import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import exportingInit from "highcharts/modules/exporting";
import exportDataInit from "highcharts/modules/export-data";

import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { EducationChildChartApi,EducationChildChartDailyApi } from "../../../../Services/Dashboard-service";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";


exportingInit(Highcharts);
exportDataInit(Highcharts);

export default function EducationChildDataCharts({ formData }) {
    const [chartsData, setChartsData] = useState([]);
    const [chartsDataDaily, setChartsDataDaily] = useState([]);
    const [activeKey, setActiveKey] = useState("0"); // Default open to Yearly Data
    
    useEffect(() => {
        EducationChildChartApi(formData)
            .then((res) => {
                const datasets = res.data || {}; // API response with multiple datasets
                let charts = [];

                // Define dataset-specific mappings
                const fieldMappings = {
                    learning_result: {
                        title: "E-Learning and Education Centers",
                        year: "tfy_year_label",
                        centers: "no_of_centers",
                        students: "no_of_students_benefited",
                        seriesNames: ["", "Students Enrolled"],
                    },
                    goverment_school_result: {
                        title: "Government Schools Support",
                        year: "tfy_year_label",
                        centers: "no_of_centers",
                        students: "no_of_students_benefited",
                        seriesNames: ["", "Govt. School Students"],
                    },
                    anganwadi_result: {
                        title: "Anganwadi Centers",
                        year: "tfy_year_label",
                        centers: "no_of_centers",
                        students: "no_of_students_benefited",
                        seriesNames: ["", "Anganwadi Centers"],
                    },
                    aslc_result: {
                        title: "After School Learning Centers",
                        year: "tfy_year_label",
                        centers: "no_of_centers",
                        students: "no_of_students_benefited",
                        seriesNames: ["", "After School Learning Center Students"],
                    },
                    coding_class_result: {
                        title: "Coding Classes",
                        year: "tfy_year_label",
                        centers: "no_of_centers",
                        students: "no_of_students_benefited",
                        seriesNames: ["", "Coding Class Students"],
                    },
                    // kidsmart_result: {
                    //     title: "Kidsmart Program",
                    //     year: "tfy_year_label",
                    //     centers: "no_of_centers",
                    //     students: "no_of_students_benefited",
                    //     seriesNames: ["", "Kidsmart Students"],
                    // },
                    // navigator_gooru_result: {
                    //     title: "Navigator Gooru Program",
                    //     year: "tfy_year_label",
                    //     centers: "no_of_centers",
                    //     students: "no_of_students_benefited",
                    //     seriesNames: ["", "Navigator Gooru Students"],
                    // },
                    navodaya_result: {
                        title: "Navodaya Coaching Centers",
                        year: "tfy_year_label",
                        centers: "no_of_centers",
                        students: "no_of_students_benefited",
                        seriesNames: ["", "Navodaya Students"],
                    },
                    pratibha_result: {
                        title: "Pratibha Library",
                        year: "tfy_year_label",
                        centers: "no_of_centers",
                        students: "no_of_students_benefited",
                        seriesNames: ["", "Pratibha Students"],
                    },
                    school_bus_result: {
                        title: "School Bus Service",
                        year: "tfy_year_label",
                        centers: "no_of_centers",
                        students: "no_of_students_benefited",
                        seriesNames: ["", "Students Transported"],
                    },
                    village_library_result: {
                        title: "Community Library",
                        year: "tfy_year_label",
                        centers: "no_of_centers",
                        students: "no_of_students_benefited",
                        seriesNames: ["", "Library Members"],
                    },
                    village_res_center_result: {
                        title: "Village Resource Centers",
                        year: "tfy_year_label",
                        centers: "no_of_centers",
                        students: "no_of_students_benefited",
                        seriesNames: ["", "Resource Center Visitors"],
                    },
                };
                

                Object.entries(datasets).forEach(([key, dataset]) => {
                    if (Array.isArray(dataset) && fieldMappings[key]) {
                        const { title, year, centers, students, seriesNames } = fieldMappings[key];
                        // console.log(year);
                        
                        const categories = dataset.map((item) => item[year]);
                        const centersData = dataset.map((item) => Number(item[centers]) || 0);
                        const studentsData = dataset.map((item) => Number(item[students]) || 0);

                        // charts.push({
                        //     title, // Custom dataset-specific title
                        //     options: {
                        //         credits: {
                        //             enabled: false, // Disable the Highcharts credits
                        //         },
                        //         chart: { type: "column" },
                        //         title: { text: title },
                        //         xAxis: { categories },
                        //         yAxis: [
                        //             { title: { text: seriesNames[0] }, min: 0 ,labels: { enabled: false }},
                        //             { title: { text: seriesNames[1] }, opposite: true },
                        //         ],
                        //         series: [
                        //             {
                        //                 name: seriesNames[0], // Custom name for Centers
                        //                 type: "column",
                        //                 data: centersData,
                        //                 color: getColor(key, "column"),
                        //             },
                        //             {
                        //                 name: seriesNames[1], // Custom name for Students
                        //                 type: "line",
                        //                 data: studentsData,
                        //                 color: getColor(key, "line"),
                        //                 yAxis: 1,
                        //             },
                        //         ],
                        //     },
                        // });

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
                                    { title: { text: seriesNames[0] }, min: 0, labels: { enabled: false } },
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
            learning_result: ["#0072bc", "#d9534f"], // Blue, Red
            goverment_school_result: ["#f39c12", "#28a745"], // Orange, Green
            anganwadi_result: ["#8e44ad", "#ff5733"], // Purple, Red-Orange
            aslc_result: ["#16a085", "#f1c40f"], // Teal, Yellow
            coding_class_result: ["#2980b9", "#c0392b"], // Dark Blue, Dark Red
            kidsmart_result: ["#9b59b6", "#2ecc71"], // Violet, Green
            navigator_gooru_result: ["#34495e", "#f39c12"], // Dark Gray, Orange
            navodaya_result: ["#e67e22", "#1abc9c"], // Orange, Turquoise
            pratibha_result: ["#d35400", "#8e44ad"], // Dark Orange, Purple
            school_bus_result: ["#f4d03f", "#e74c3c"], // Bright Yellow, Red
            village_library_result: ["#2ecc71", "#3498db"], // Green, Light Blue
            village_res_center_result: ["#7f8c8d", "#e67e22"], // Gray, Dark Orange
        };
        return colors[key]?.[type === "column" ? 0 : 1] || "#000"; // Default to black
    };
    

    return (
        <div className="">
        <Accordion activeKey={activeKey} onSelect={(e) => setActiveKey(e)} >
            {/* Yearly Data Accordion */}
            {
                formData.type == 'yearly' && (
                    <Accordion.Item eventKey="0"  style={{background:'rgba(255,255,255,0.6)'}}>
                    <Accordion.Header><h4>Yearly Performance</h4></Accordion.Header>
                    <Accordion.Body className="px-0">
                        <div className="row">
                            {chartsData
                                
                                .map((chart, index) => (
                                    <div className="col-lg-4 mb-3" key={index}>
                                        <Card className="yearly-data-card">
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
