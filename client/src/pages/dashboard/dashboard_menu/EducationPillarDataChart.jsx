import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import React, { useEffect, useState } from "react";
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { dashBoardPillarDataByID } from "../../../Services/Dashboard-service";
import { currentFinancialYear, fetchCasteLists, fetchGenderLists, fetchSocioEconomicLists, fetchVillagesLists, fetchVulnerabilityLists } from "../../../Services/Master-service";
import EducationChildDataChart from "./education/EducationChildDataChart";
import EducationDailyChart from "./education/EducationDailyChart";


const EducationPillarDataChartList = () => {
    const navigate = useNavigate();
    const [filterValues, setFilterValues] = useState({});

    const [typeOptions, setTypeOptions] = useState([{label:'Yearly',value:'yearly'},{label:'Daily',value:'daily'}]);
    const [selectedType, setSelectedType] = useState(null);
    const [yearFromOptions, setYearFromOptions] = useState([]);
    const [yearToOptions, setYearToOptions] = useState([]);
    const [selectedYearFrom, setSelectedYearFrom] = useState(null);
    const [selectedYearTo, setSelectedYearTo] = useState(null);
    const [villageOptions, setVillageOptions] = useState([]);
    const [selectedVillage, setSelectedVillage] = useState(null);
    const [renderGenders, setRenderGenders] = useState([]);
    const [selectedGenders, setSelectedGenders] = useState(null);
    const [renderCastes, setRenderCastes] = useState([]);
    const [selectedCastes, setSelectedCastes] = useState(null);
    const [renderSocioEconomics, setRenderSocioEconomics] = useState([]);
    const [selectedSocioEconomics, setSelectedSocioEconomics] = useState(null);
    const [renderVulnerabilitys, setRenderVulnerabilitys] = useState([]);
    const [selectedVulnerabilitys, setSelectedVulnerabilitys] = useState(null);
    const [genderCategories, setGenderCategories] = useState([]);
    const [maleData, setMaleData] = useState([]);
    const [femaleData, setFemaleData] = useState([]);
    const [casteCategories, setCasteCategories] = useState([]);
    const [generalData, setGeneralData] = useState([]);
    const [obcData, setOBCData] = useState([]);
    const [scData, setSCData] = useState([]);
    const [stData, setSTData] = useState([]);
    const [vulnerabilityCategories, setVulnerabilityCategories] = useState([]);
    const [studentData, setStudentData] = useState([]);
    const [beneficiaryData, setBeneficiaryData] = useState([]);
    const [farmerData, setFarmerData] = useState([]);
    const [socioEconomicCategories, setSocioeconomicCategories] = useState([]);
    const [aplData, setAPLData] = useState([]);
    const [bplData, setBPLData] = useState([]);

    const [formData, setFormData] = useState({
        type: "yearly",
        village: "",
        year_from: "",
        year_to: "",
        gender: "",
        caste: "",
        socio_economic: "",
        vulnerability: "",
    });
    const [toBeFilterData, setToBeFilterData] = useState({
        type: "",
        village: "",
        year_from: "",
        year_to: "",
        gender: "",
        caste: "",
        socio_economic: "",
    });

    const detailsofEducationPillarGenderChart = async (filters = null) => {
        try {
        
            let requestData = { select_pillar: "education" };
    
            if (filters) {
                requestData.filters = filters; // Send filters when available
            }
    
            const response = await dashBoardPillarDataByID(requestData);
            
    
            if (response.status === 1) {
                const groupedData = response?.data?.total_gender_education_year?.reduce((acc, item) => {
                    if (!acc[item.tfy_year]) {
                        acc[item.tfy_year] = { yearLabel: item.tfy_year_label, Male: 0, Female: 0 };
                    }
                    acc[item.tfy_year][item.tgm_name] = parseInt(item.gender_count, 10);
                    return acc;
                }, {});
    
                // Extract categories (years) and series data
                const newCategories = Object.values(groupedData).map((item) => item.yearLabel);
                const newMaleData = Object.values(groupedData).map((item) => item.Male || 0);
                const newFemaleData = Object.values(groupedData).map((item) => item.Female || 0);
    
                // Update state
                setGenderCategories(newCategories);
                setMaleData(newMaleData);
                setFemaleData(newFemaleData);

                const groupedCasteData = response?.data?.total_caste_education_year?.reduce((acc, item) => {
                    if (!acc[item.tfy_year]) {
                        acc[item.tfy_year] = { yearLabel: item.tfy_year_label, General: 0, OBC: 0, SC: 0, ST: 0 };
                    }
                    acc[item.tfy_year][item.tcm_name] = parseInt(item.caste_count, 10);
                    return acc;
                }, {});
    
                // Extract categories (years) and series data
                const newCasteCategories = Object.values(groupedCasteData).map((item) => item.yearLabel);
                const newGeneralData = Object.values(groupedCasteData).map((item) => item.General || 0);
                const newOBCData = Object.values(groupedCasteData).map((item) => item.OBC || 0);
                const newSCData = Object.values(groupedCasteData).map((item) => item.SC || 0);
                const newSTData = Object.values(groupedCasteData).map((item) => item.ST || 0);
    
                // Update state
                setCasteCategories(newCasteCategories);
                setGeneralData(newGeneralData);
                setOBCData(newOBCData);
                setSCData(newSCData);
                setSTData(newSTData);

                const groupedVulnerabilityData = response?.data?.total_vulnerability_education_year.reduce((acc, item) => {
                    if (!acc[item.tfy_year]) {
                        acc[item.tfy_year] = { yearLabel: item.tfy_year_label, Student: 0, Beneficiary: 0, Farmer: 0 };
                    }
                    acc[item.tfy_year][item.tvm_name] = parseInt(item.vulnerability_count, 10);
                    return acc;
                }, {});
        
                // Extract categories (years) and series data
                const newVulnerabilityCategories = Object.values(groupedVulnerabilityData).map((item) => item.yearLabel);
                const newStudentData = Object.values(groupedVulnerabilityData).map((item) => item.Student || 0);
                const newBeneficiaryData = Object.values(groupedVulnerabilityData).map((item) => item.Beneficiary || 0);
                const newFarmerData = Object.values(groupedVulnerabilityData).map((item) => item.Farmer || 0);
        
                setVulnerabilityCategories(newVulnerabilityCategories);
                setStudentData(newStudentData);
                setBeneficiaryData(newBeneficiaryData);
                setFarmerData(newFarmerData);

                const groupedSocioEconomicData = response?.data?.total_socio_economic_education_year?.reduce((acc, item) => {
                    if (!acc[item.tfy_year]) {
                        acc[item.tfy_year] = { yearLabel: item.tfy_year_label, APL: 0, BPL: 0 };
                    }
                    acc[item.tfy_year][item.tsem_background] = parseInt(item.socio_economic_count, 10);
                    return acc;
                }, {});
    
                // Extract categories (years) and series data
                const newSocioeconomicCategories = Object.values(groupedSocioEconomicData).map((item) => item.yearLabel);
                const newAPLData = Object.values(groupedSocioEconomicData).map((item) => item.APL || 0);
                const newBPLData = Object.values(groupedSocioEconomicData).map((item) => item.BPL || 0);
    
                // Update state
                setSocioeconomicCategories(newSocioeconomicCategories);
                setAPLData(newAPLData);
                setBPLData(newBPLData);
            }
        } catch (error) {
            console.error("Error fetching financial years:", error);
        }
    };
    
    // Call function on component mount (to load last 3 years by default)
    useEffect(() => {
        detailsofEducationPillarGenderChart();
    }, []);

    const detailsofFinancialList = async () => {

        try {
            const response = await currentFinancialYear();
            if (response.status === 1) {
                const options = response.data.map((data) => ({
                    value: data.tfy_id,
                    label: data.tfy_year,
                }));
                setYearFromOptions(options);
                setYearToOptions(options);
            }
        } catch (error) {
            console.error("Error fetching financial years:", error);
        }
    }

    const detailsofVillageList = async () => {

        try {
            const response = await fetchVillagesLists();

            if (response.status === 1) {
                const options = response.data.map((data) => ({
                    value: data.tvl_village_id,
                    label: data.tvl_village_name,
                }));
                setVillageOptions(options);
            }
        } catch (error) {
            console.error("Error fetching villages:", error);
        }
    }

    const detailsofGenderList = async () => {

        try {
            const response = await fetchGenderLists();

            if (response.status === 1) {
                const options = response.data.map((data) => ({
                    value: data.tgm_id,
                    label: data.tgm_name,
                }));
                setRenderGenders(options);
            }
        } catch (error) {
            console.error("Error fetching Genders:", error);
        }
    }

    const detailsofCasteList = async () => {

        try {
            const response = await fetchCasteLists();

            if (response.status === 1) {
                const options = response.data.map((data) => ({
                    value: data.tcm_id,
                    label: data.tcm_name,
                }));
                setRenderCastes(options);

            }
        } catch (error) {
            console.error("Error fetching Castes:", error);
        }
    }

    const detailsofSocioEconomicList = async () => {

        try {
            const response = await fetchSocioEconomicLists();

            if (response.status === 1) {
                const options = response.data.map((data) => ({
                    value: data.tsem_id,
                    label: data.tsem_background,
                }));
                setRenderSocioEconomics(options);
            }
        } catch (error) {
            console.error("Error fetching SocioEconomics:", error);
        }
    }

    const detailsofVulnerabilityList = async () => {

        try {
            const response = await fetchVulnerabilityLists();

            if (response.status === 1) {
                const options = response.data.map((data) => ({
                    value: data.tvm_id,
                    label: data.tvm_name,
                }));
                setRenderVulnerabilitys(options);

            }
        } catch (error) {
            console.error("Error fetching Vulnerabilitys:", error);
        }
    }

    useEffect(() => {

        detailsofFinancialList();
        detailsofVillageList();
        detailsofGenderList();
        detailsofCasteList();
        detailsofSocioEconomicList();
        detailsofVulnerabilityList();
    }, []);


    const handleSelectChange = (selectedOption, { name }) => {
 
        setFormData((prevData) => ({
            ...prevData,
            [name]: selectedOption ? selectedOption.value : null, // Update the formData for the respective field
        }));


        if (name === "year_from") {
            setSelectedYearFrom(selectedOption);
        } else if (name === "year_to") {
            setSelectedYearTo(selectedOption);
        } else if (name === "village") {
            setSelectedVillage(selectedOption);
        } else if (name === "gender") {
            setSelectedGenders(selectedOption);
        } else if (name === "caste") {
            setSelectedCastes(selectedOption);
        } else if (name === "socio_economic") {
            setSelectedSocioEconomics(selectedOption);
        } else if (name === "vulnerability") {
            setSelectedVulnerabilitys(selectedOption);
        
        } else if (name === "type") {
            setSelectedType(selectedOption);
        }
    };


    const resetFiter = () => {

        // Reset all filter-related state variables
        setSelectedYearFrom(null);
        setSelectedYearTo(null);
        setSelectedVillage(null);
        setSelectedGenders(null);
        setSelectedVulnerabilitys(null);
        setSelectedCastes(null);
        setSelectedSocioEconomics(null);
        setSelectedType(null);

        setFormData({
            type: "",
            village: "",
            year_from: "",
            year_to: "",
            gender: "",
            caste: "",
            socio_economic: "",
            vulnerability: "",
        });

        setToBeFilterData({
            village: "",
            year_from: "",
            year_to: "",
            gender: "",
            caste: "",
            socio_economic: "",
        });

        setFilterValues({});
        detailsofEducationPillarGenderChart();
    };

    const searchFiter = () => {

        const data = {
            village: selectedVillage?.value || "",
            year_from: selectedYearFrom?.value || "",
            year_to: selectedYearTo?.value || "",
            gender: formData.gender || "",
            caste: formData.caste || "",
            socio_economic: formData.socio_economic || "",
            vulnerability: formData.vulnerability || "",
        };
    
        setToBeFilterData(data);
    
        // Call the function after setting the filters
        setTimeout(() => {
            detailsofEducationPillarGenderChart(data);
        }, 100);
    };


    // const genderOptions = {
    //     chart: {
    //         type: "column",
    //         backgroundColor: 'transparent'
    //     },
    //     credits: {
    //         enabled: false
    //     },
    //     title: {
    //         text: "",
            
    //     },
    //     xAxis: {
    //         categories: genderCategories, // Extract year labels
    //         title: {
    //             text: "",
    //             style: {
    //                 color: "#34495e",
    //                 fontSize: "14px",
    //                 fontWeight: "bold"
    //             }
    //         }
    //     },
    //     yAxis: {
    //         title: {
    //             enabled: false // Hide the y-axis title
    //         },
    //         labels: {
    //             enabled: false // Hide the y-axis labels
    //         }
    //     },
    //     plotOptions: {
    //         column: {
    //             dataLabels: {
    //                 enabled: true, // Show labels on columns
    //             },
    //         },
    //         line: {
    //             dataLabels: {
    //                 enabled: true, // Show labels on lines
    //             },
    //         },
    //     },
    //     series: [
    //         maleData.some((value) => value > 0) && {
    //             name: "Male",
    //             data: maleData.map((value) => (value > 0 ? value : null)).filter((value) => value !== null), // Hide 0 values
    //             color: "#3498db",
    //         },
    //         femaleData.some((value) => value > 0) && {
    //             name: "Female",
    //             data: femaleData.map((value) => (value > 0 ? value : null)).filter((value) => value !== null), // Hide 0 values
    //             color: "#e74c3c",
    //         },
    //     ].filter(Boolean), // Remove empty series
    // };

    const genderOptions = {
        chart: {
            type: "bar",
            backgroundColor: 'transparent'
        },
        credits: {
            enabled: false
        },
        title: {
            text: ""
        },
        xAxis: {
            categories: genderCategories,
            title: {
                text: "",
                style: {
                    color: "#34495e",
                    fontSize: "14px",
                    fontWeight: "bold"
                }
            }
        },
        yAxis: {
            title: {
                enabled: false
            },
            labels: {
                enabled: false
            }
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true,
                },
            },
            line: {
                dataLabels: {
                    enabled: true,
                },
            },
        },
        series: [
            maleData.some(value => value > 0) && {
                name: "Male",
                data: maleData.map(value => (value > 0 ? value : null)).filter(value => value !== null),
                color: "#3498db",
            },
            femaleData.some(value => value > 0) && {
                name: "Female",
                data: femaleData.map(value => (value > 0 ? value : null)).filter(value => value !== null),
                color: "#e74c3c",
            },
        ].filter(Boolean)
    };

    
    const casteOptions = {
        chart: {
          type: "bar",
          backgroundColor: 'transparent'
        },
        credits: {
            enabled: false
        },
        title: {
          text: "",
        },
        xAxis: {
          categories: casteCategories,
          title: {
            text: "",
          },
        },
        yAxis: {
            title: {
                enabled: false
            },
            labels: {
                enabled: false
            }
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true,
                },
            },
            line: {
                dataLabels: {
                    enabled: true,
                },
            },
        },
        series: [
            generalData.some(value => value > 0) && {
                name: "General",
                data: generalData.map(value => (value > 0 ? value : null)).filter(value => value !== null),
                color: "#3498db",
            },
            obcData.some(value => value > 0) && {
                name: "OBC",
                data: obcData.map(value => (value > 0 ? value : null)).filter(value => value !== null),
                color: "#2980b9",
            },
            scData.some(value => value > 0) && {
                name: "SC",
                data: scData.map(value => (value > 0 ? value : null)).filter(value => value !== null),
                color: "#e74c3c",
            },
            stData.some(value => value > 0) && {
                name: "ST",
                data: stData.map(value => (value > 0 ? value : null)).filter(value => value !== null),
                color: "#27ae60",
            },
        ].filter(Boolean)
    };

    const vulnerabilityOptions = {
        chart: {
            type: "column",
            backgroundColor: "transparent"
        },
        credits: {
            enabled: false
        },
        title: {
            text: "",
        },
        xAxis: {
            categories: vulnerabilityCategories,
            title: {
                text: "",
            },
        },
        yAxis: {
            title: {
                enabled: false
            },
            labels: {
                enabled: false
            }
        },
        plotOptions: {
            column: {
                borderRadius: 10, // Rounded corners for columns
                pointPadding: 0.2,
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return `${this.y.toLocaleString()}`; // Convert to Lakhs
                    },
                },
            },
            series: {
                marker: {
                    symbol: "square", // Checkbox-like markers
                },
            },
            line: {
                dataLabels: {
                    enabled: true,
                },
            },
        },
        series: [
            studentData.some(value => value > 0) && {
                name: "Student",
                data: studentData,
                color: "#3498db",
            },
            beneficiaryData.some(value => value > 0) && {
                name: "Beneficiary",
                data: beneficiaryData,
                color: "#27ae60", // Proper green shade
            },
            farmerData.some(value => value > 0) && {
                name: "Farmer",
                data: farmerData,
                color: "#2980b9", // Proper blue shade
            },
        ].filter(Boolean)
    };
    

    const socioEconomicOptions = {
        chart: {
            type: "line",
            backgroundColor: "transparent"
        },
        credits: {
            enabled: false
        },
        title: {
            text: "",
        },
        xAxis: {
            categories: socioEconomicCategories,
            title: {
                text: "",
            },
        },
        yAxis: {
            title: {
                enabled: false
            },
            labels: {
                enabled: false
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true,
                },
                marker: {
                    enabled: true,
                    symbol: "circle"
                }
            },
        },
        series: [
            aplData.some(value => value > 0) && {
                name: "APL",
                data: aplData,
                color: "#3498db", // Blue
            },
            bplData.some(value => value > 0) && {
                name: "BPL",
                data: bplData,
                color: "#e74c3c", // Red
            },
        ].filter(Boolean)
    };
    
    

    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{ duration: 2000 }}
                reverseOrder={false}></Toaster>

            <span className="position-absolute trigger"></span>

            {/* This is a side bar */}

            <div className="home-content">
                <div className="card pb-1">
                    <div className="card-header fw-bold d-flex justify-content-between align-items-center py-2 px-3">
                        <h3 className="mb-0 float-left pt-1">
                           Education
                        </h3>
                        <div className="float-right">

                            <button
                                type="button"
                                className="btn btn-sm btn-dark"
                                data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-controls="collapseExample"
                            >
                                <i class="fa-solid fa-filter-list"></i> Filter
                            </button>
                            <button type="button" className="btn btn-sm btn-dark ms-2" onClick={() => navigate(`/admin/dashboard`)}>
                                <i class="far fa-arrow-circle-left"></i> Back
                            </button>
                        </div>
                    </div>
  </div>

                    <div className="card-body1 px-1 at-elevation-z6 table-box">
                        <div class="collapse" id="collapseExample">
                            <div class="">
                                <form id="filter_plots">
                                    <div className="row mt-4" style={{ alignItems: "end" }}>
                                        {/* Village */}
                                        <div className="col-md-3">
                                            <div className="mb-3">
                                                <label
                                                    htmlFor="exampleFormControlInput1"
                                                    className="form-label">
                                                    Type
                                                </label>
                                                <Select
                                                    name="type"
                                                    id="type"
                                                    options={typeOptions}
                                                    value={selectedType}
                                                    onChange={(selectedOption) => handleSelectChange(selectedOption, { name: "type" })}
                                                    placeholder="Select Type"
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                        </div>
                                        

                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <label
                                                            htmlFor="exampleFormControlInput1"
                                                            className="form-label">
                                                            From Year
                                                        </label>
                                                        <Select
                                                            name="year"
                                                            id="financialYear"
                                                            options={yearFromOptions}
                                                            value={selectedYearFrom} // Directly use selectedYear
                                                            isSearchable={true}
                                                            onChange={(selectedOption) => handleSelectChange(selectedOption, { name: "year_from" })}
                                                            placeholder="Select Year"
                                                            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                        />
                                                    </div>
                                                </div>
        
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <label
                                                            htmlFor="exampleFormControlInput1"
                                                            className="form-label">
                                                            To Year
                                                        </label>
                                                        <Select
                                                            name="year"
                                                            id="financialYear"
                                                            options={yearToOptions}
                                                            value={selectedYearTo} // Directly use selectedYear
                                                            isSearchable={true}
                                                            onChange={(selectedOption) => handleSelectChange(selectedOption, { name: "year_to" })}
                                                            placeholder="Select Year"
                                                            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                        />
                                                    </div>
                                                </div>
                                            
                                        

                                        <div className="col-md-3">
                                            <div className="mb-3">
                                                <label
                                                    htmlFor="exampleFormControlInput1"
                                                    className="form-label">
                                                    Village
                                                </label>
                                                <Select
                                                    name="village"
                                                    id="village"
                                                    options={villageOptions}
                                                    value={selectedVillage}
                                                    onChange={(selectedOption) => handleSelectChange(selectedOption, { name: "village" })}
                                                    placeholder="Select Village"
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                        </div>

                                        {
                                            selectedType?.value == 'yearly' ? (
                                            <>
                                        <div className="col-md-3">
                                            <div className="mb-3">
                                                <label
                                                    htmlFor="exampleFormControlInput1"
                                                    className="form-label">
                                                    Gender
                                                </label>
                                                <Select
                                                    name="gender"
                                                    options={renderGenders}
                                                    onChange={handleSelectChange}
                                                    value={selectedGenders}
                                                    placeholder="Select Gender"
                                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-3">
                                            <div className="mb-3">
                                                <label
                                                    htmlFor="exampleFormControlInput1"
                                                    className="form-label">
                                                    Caste
                                                </label>
                                                <Select
                                                    name="caste"
                                                    options={renderCastes}
                                                    onChange={handleSelectChange}
                                                    value={selectedCastes}
                                                    placeholder="Select Caste"

                                                />
                                            </div>
                                        </div>

                                        </>
                                            ):""
                                        }

                                        {
                                            selectedType?.value == 'yearly' ? (
                                            <>
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <label
                                                            htmlFor="exampleFormControlInput1"
                                                            className="form-label">
                                                            Socio-economic
                                                        </label>
                                                        <Select
                                                            name="socio_economic"
                                                            options={renderSocioEconomics}
                                                            onChange={handleSelectChange}
                                                            placeholder="Select Socio-economic"
                                                            value={selectedSocioEconomics}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <label
                                                            htmlFor="exampleFormControlInput1"
                                                            className="form-label">
                                                            Vulnerability
                                                        </label>
                                                        <Select
                                                            name="vulnerability"
                                                            options={renderVulnerabilitys}
                                                            onChange={handleSelectChange}
                                                            value={selectedVulnerabilitys}
                                                            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                            ):""
                                        }

                                        {/* Filter Button  */}
                                        <div className="col-md-2">
                                            <div className="mb-3 d-flex">
                                                <button
                                                    type="button"
                                                    className="btn btn-success ml-2"
                                                    onClick={searchFiter}
                                                >
                                                    Search
                                                </button>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="mb-3 d-flex">
                                                <button
                                                    type="button"
                                                    className="btn btn-dark ml-2"
                                                    onClick={resetFiter}>
                                                    Reset
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        
                        {
                            formData?.type == 'yearly' && (
                                <>

                                <div className="row dash-chart-section">
                        
                                    <div className="col-lg-6 mb-3">
                                        <div className="card m-0" style={{backgroundColor:'rgba(255,255,255,0.6)'}}>
                                            <div className="card-header">
                                                <h5 class="mb-0 float-left">Gender</h5>
                                            </div>
                                            <div className="card-body text-center">
                                                <HighchartsReact highcharts={Highcharts} options={genderOptions} />
                                            </div>
                                        </div>
                                    </div>
                                
                                    <div className="col-lg-6 mb-3">
                                        <div className="card m-0" style={{backgroundColor:'rgba(255,255,255,0.6)'}}>
                                            <div className="card-header">
                                                <h5 class="mb-0 float-left">Caste</h5>
                                            </div>
                                            <div className="card-body">
                                                <HighchartsReact highcharts={Highcharts} options={casteOptions} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-lg-6 mb-3">
                                        <div className="card m-0" style={{backgroundColor:'rgba(255,255,255,0.6)'}}>
                                            <div className="card-header">
                                                <h5 class="mb-0 float-left">Vulnerability</h5>
                                            </div>
                                            <div className="card-body">
                                                <HighchartsReact highcharts={Highcharts} options={vulnerabilityOptions} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-lg-6 mb-3">
                                        <div className="card m-0" style={{backgroundColor:'rgba(255,255,255,0.6)'}}>
                                            <div className="card-header">
                                                <h5 class="mb-0 float-left">Socio Economic</h5>
                                            </div>
                                            <div className="card-body">
                                                <HighchartsReact highcharts={Highcharts} options={socioEconomicOptions} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                </>
                            )
                        }                
                        

                        {
                            formData?.type == 'daily' && (
                            <>
                                
                                <EducationDailyChart formData={formData}/>
                            
                            </>
                        )}

                        {/* Child part start */}
                        <div className="row dash-chart-section">
                            <EducationChildDataChart formData={formData}/>
                        </div>

                    </div>
              
            </div>
        </>
    )
}

export default EducationPillarDataChartList;