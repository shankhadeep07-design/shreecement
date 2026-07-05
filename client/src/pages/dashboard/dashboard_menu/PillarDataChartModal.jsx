import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import React, { useEffect, useState } from "react";
// import { Toaster } from "react-toastify";
import Select from "react-select";
import { dashBoardPillarDataByID } from "../../../Services/Dashboard-service";
import { fetchCasteLists, fetchGenderLists, fetchSocioEconomicLists, fetchVulnerabilityLists, getBlockApi } from "../../../Services/Master-service";

export const PillarDataChart = ({selectedId}) => {
    
    const [blockOptions, setBlockOptions] = useState([]);
    const [renderGenders, setRenderGenders] = useState([]);
    const [renderCastes, setRenderCastes] = useState([]);
    const [renderSocioEconomics, setRenderSocioEconomics] = useState([]);
    const [renderVulnerabilitys, setRenderVulnerabilitys] = useState([]);
    const [pillarDatas, setPillarDatas] = useState([]);
    const [pillarName, setPillarName] = useState([]);
    const [formData, setFormData] = useState({
        selected_Id: selectedId,
        location_name: "",
        village: "",
        year: "",
        gender: "",
        caste: "",
        socio_economic: "",
        vulnerability: "",
    });
    const [filters, setFilters] = useState({
        gender: null,
        caste: null,
        socio_economic: null,
        vulnerability: null,
    });

    useEffect(() => {
        if (selectedId) {
            detailsofBlockList();
            detailsofGenderList();
            detailsofCasteList();
            detailsofSocioEconomicList();
            detailsofVulnerabilityList();
        }

    }, [selectedId]);



    useEffect(() => {
        switch (selectedId) {
            case "tpsm0000000001":
                setPillarName("Education");
                break;
            case "tpsm0000000002":
                setPillarName("Health");
                break;
            default:
                setPillarName("");
        }
    }, [selectedId]);
    
   
    const detailsofBlockList = async () => {
        
        try {
            const response = await getBlockApi();
            
            if (response.status === 1) {
                const options = response.data.map((data) => ({
                    value: data.tbl_block_id,
                    label: data.tbl_block_name,
                }));
                setBlockOptions(options);              
            }
        } catch (error) {
            console.error("Error fetching Blocks:", error);
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
   
    const detailsofPillarWiseData = async () => {
        
        if (!selectedId) return;
        try {
            const selected_id = selectedId;

            // Create the request payload
            const selected_ids = {
                selected_ids: selected_id,
                gender: filters.gender?.value || null,
                caste: filters.caste?.value || null,
                socio_economic: filters.socio_economic?.value || null,
                vulnerability: filters.vulnerability?.value || null,
            };
            const response = await dashBoardPillarDataByID(selected_ids);
            
            if (response.status === 1) {
                
                const pillarData = response.data?.[0]?.total_education_year?.map((item) => {
                    return {
                        fy_id: item.tfy_id,
                        categories: item.tfy_year,
                        pillar_value: item.total_count,
                        gender: item.gender,
                        caste: item.caste,
                        socio_economic: item.socio_economic,
                        vulnerability: item.vulnerability,
                    };
                }) || [];

                setPillarDatas(pillarData);              
            }
        } catch (error) {
            console.error("Error fetching Blocks:", error);
        }
    }

    useEffect(() => {
        if (selectedId) {
            detailsofPillarWiseData();
        }
    }, [selectedId, filters]);

    
    const handleSelectChange = (selectedOption, field) => {
        setFilters(prev => ({ ...prev, [field]: selectedOption }));
    };

    // Reset filters
    const resetFilters = () => {
        setFilters({
            gender: null,
            caste: null,
            socio_economic: null,
            vulnerability: null,
        });
    };

    Highcharts.setOptions({
        accessibility: {
          enabled: true,
        },
    });

    const pillarDataOptions = {
        chart: {
            type: "column",
        },
        title: {
            text: "",
        },
        xAxis: {
            categories: pillarDatas?.map((item)=>(item.categories)),
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
        },
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
                name: "Beneficiaries",
                type: "column",
                data: pillarDatas?.map((item)=>Number(item.pillar_value)),
                color: "#FF4B4B",
            },
        ],
    };
  
  return (
    <>

        <form id="user_submit" className="my_form">

            <div className="row">

                

                <div className="col-md-3">
                    <div className="mb-3">
                        <label className="form-label">Gender</label>
                        <Select
                            name="gender"
                            options={renderGenders}
                            onChange={(selected) => handleSelectChange(selected, "gender")}
                            value={filters.gender}
                        />
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="mb-3">
                        <label className="form-label">Cast</label>
                        <Select
                            name="caste"
                            options={renderCastes}
                            onChange={(selected) => handleSelectChange(selected, "caste")}
                            value={filters.caste}
                        />
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="mb-3">
                        <label className="form-label">Socio-economic</label>
                        <Select
                            name="socio_economic"
                            options={renderSocioEconomics}
                            onChange={(selected) => handleSelectChange(selected, "socio_economic")}
                            value={filters.socio_economic}
                        />
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="mb-3">
                        <label className="form-label">Vulnerability</label>
                        <Select
                            name="vulnerability"
                            options={renderVulnerabilitys}
                            onChange={(selected) => handleSelectChange(selected, "vulnerability")}
                            value={filters.vulnerability}
                        />
                    </div>
                </div>

                <div className="col-md-12 text-center">
                    <button type="button" className="btn btn-secondary" onClick={resetFilters}>
                        Reset Filters
                    </button>
                </div>

            </div>

        </form>
        <div className="row dash-chart-section">
        
            <div className="col-lg-12">
                <div className="card m-0">
                <div className="card-header">
                    <h5 class="mb-0 float-left">{pillarName ? pillarName : ''} wise</h5>
                </div>
                <div className="card-body text-center">
                {pillarDatas.length > 0 ? (
                    <HighchartsReact highcharts={Highcharts} options={pillarDataOptions} />
                ) : null}
                </div>
                </div>
            </div>
        </div>
    </>
  );
};
