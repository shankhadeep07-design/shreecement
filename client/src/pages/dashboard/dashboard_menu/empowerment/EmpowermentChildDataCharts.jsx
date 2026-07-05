import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { EmpowermentChildChartApi,EducationChildChartDailyApi } from "../../../../Services/Dashboard-service";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";



export default function EmpowermentChildDataCharts({ formData }) {
    const [chartsData, setChartsData] = useState([]);
    const [chartsDataDaily, setChartsDataDaily] = useState([]);
    const [activeKey, setActiveKey] = useState("0"); // Default open to Yearly Data
    
    useEffect(() => {
        EmpowermentChildChartApi(formData)
        .then((res) => {
            const datasets = res.data || {}; // API response with multiple datasets
            let charts = [];
    
            // Define dataset-specific mappings
            const fieldMappings = {
                flowriculture_result: {
                    title: "Floriculture Farming",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "Trainees"],
                },
                sponsorship_result: {
                    title: "Sponsorship Vocational Skills",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "Beneficiaries"],
                },
                vtc_result: {
                    title: "Vocational Training Center",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "Trainees"],
                },
                gcs_result: {
                    title: "Grain Cash Seed Bank",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "Farmers"],
                },
                horticulture_result: {
                    title: "Horticulture Plantaion",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "Farmers Trained"],
                },
                iga_result: {
                    title: "Income Generation Activities",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "People Benefited"],
                },
                shg_result: {
                    title: "Self Help Groups",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "Members Enrolled"],
                },
                tailoring_result: {
                    title: "Tailoring",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "Tailoring Enrolled"],
                },
                veg_result: {
                    title: "Vegetable Cultivation",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "Farmers Trained"],
                },
                collective_marketing_result: {
                    title: "Collective Marketing Initiatives",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "People Benefited"],
                },
                veterinary_result: {
                    title: "Veterinary Programs",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "Farmers Trained"],
                },
                swi_result: {
                    title: "System Of Wheat Intensification",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "People Benefited"],
                },
                cemca_farmers_training_result: {
                    title: "CEMCA Farmers",
                    year: "tfy_year_label",
                    centers: "no_of_centers",
                    students: "no_of_students_benefited",
                    seriesNames: ["", "Farmers Trained"],
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
                            chart: { type: "column" },
                            title: { text: title },
                            credits: {
                                enabled: false, // Disable the Highcharts credits
                            },
                            xAxis: {
                                categories: categories,
                                labels: {
                                  style: {
                                    fontSize: '10px' // Adjust the font size as needed
                                  }
                                }
                            },
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
                                {
                                    name: seriesNames[0], // Custom name for Centers
                                    type: "column",
                                    data: '',
                                    color: getColor(key, "column"),
                                },
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
            flowriculture_result: ["#8e44ad", "#3498db"], // Purple, Blue
            sponsorship_result: ["#f39c12", "#e74c3c"], // Orange, Red
            vtc_result: ["#27ae60", "#2980b9"], // Green, Dark Blue
            gcs_result: ["#d35400", "#2ecc71"], // Dark Orange, Green
            horticulture_result: ["#9b59b6", "#f1c40f"], // Violet, Yellow
            iga_result: ["#16a085", "#c0392b"], // Teal, Dark Red
            shg_result: ["#34495e", "#f4d03f"], // Dark Gray, Bright Yellow
            tailoring_result: ["#e74c3c", "#3498db"], // Red, Blue
            veg_result: ["#2ecc71", "#d35400"], // Green, Dark Orange
            collective_marketing_result: ["#8e44ad", "#2ecc71"], // Purple, Green
            veterinary_result: ["#0072bc", "#e67e22"], // Blue, Dark Orange
            swi_result: ["#7f8c8d", "#f39c12"], // Gray, Orange
            cemca_farmers_training_result: ["#1abc9c", "#8e44ad"], // Turquoise, Purple
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
