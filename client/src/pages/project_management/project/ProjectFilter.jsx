import React, {useState, useEffect} from 'react'
import {useLoading} from '../../../context/LoadingContext';
import {
    dashboardDistrictNAmes,
    dashboardStateNames,
    dashboardTalukasNAmes,
    dashboardUnitNAmes,
    dashboardVillageNAmes,
  } from "../../../Services/Dashboard-service";
  import {
    getFilterOptions
  } from "../../../Services/Plot-service";
  import Select from "react-select";

const ProjectFilter = ({getFilterVal}) => {
    let {loading, setLoading} = useLoading(false);
    const [selectedStateOption, setSelectedStateOption] = useState(null);
    const [state_list, setState_list] = useState([]);
    const [district_list, setDistrict_list] = useState([]);
    const [taluka_list, setTaluka_list] = useState([]);
    const [unit_list, setUnit_list] = useState([]);
    const [village_list_filter, setVillage_List_filter] = useState([]);

    const [state_id, setStateId] = useState(null);
    const [district_id, setDistrictId] = useState(null);
    const [taluka_id, setTalukaId] = useState(null);

    const [selectedDistrictOption, setSelectedDistrictOption] = useState(null);
    const [selectedTalukaOption, setSelectedTalukaOption] = useState(null);
    const [selectedUnitOption, setSelectedUnitOption] = useState(null);
    const [selectedVillageOptionFilter, setVillageOptionFilter] = useState(null);

    const [selectedPlotOptionOnFilter, setSelectedPlotOptionFilter] = useState(null);
    const [village_list, setVillageList] = useState([]);
    const [selectedOwnerOnFilter, setSelectedOwnerOnFilter] = useState(null);
    const [selectedModeOnFilter, setSelectedModeOnFilter] = useState(null);
    const [selectedTypeOnFilter, setSelectedTypeOnFilter] = useState(null)

    const [plot_list, setPlotList] = useState([]);
    const [owner_list, setOwnerList] = useState([]);
    

  const [toBeFilterData, setToBeFilterData] = useState({
    tpl_state_id: "",
    tpl_district_id: "",
    tpl_taluka_id: "",
    tpl_unit_id: "",
    tpl_village_id: "",
    tpl_plot_id: "",
  });

  
  const handleStateChange = (selectedVillageOption) => {
    var stateId = selectedVillageOption.value;
    
    //Setting all filter list
    setStateId(stateId);
    setDistrict_list(null);
    setTaluka_list(null);
    setUnit_list(null);
    setVillageList(null);
    setPlotList(null);

  

    //Setting all state options
    setSelectedStateOption(selectedVillageOption);
    setSelectedDistrictOption(null);
    setSelectedTalukaOption(null);
    setSelectedUnitOption(null);
    setVillageOptionFilter(null);
    setSelectedPlotOptionFilter(null);
    dashboardDistrictNAmes(stateId).then((districts) => {
      const allDistricts = districts.data;
      setDistrict_list(allDistricts);
    });

    setToBeFilterData({
      ...toBeFilterData,
      ["tpl_state_id"]: stateId,
      ["tpl_district_id"]: null,
      ["tpl_taluka_id"]: null,
      ["tpl_unit_id"]: null,
      ["tpl_village_id"]: null,
      ["tpl_plot_id"]: null,
    });
  };
  const handleDistrictChange = (selectedVillageOption) => {
    // console.log(selectedDistrictOption);

    var districtId = selectedVillageOption.value;

    setDistrictId(districtId);
    setTaluka_list(null);
    setUnit_list(null);
    setVillageList(null);
    setPlotList(null);

    setSelectedDistrictOption(selectedVillageOption);
    setSelectedTalukaOption(null);
    setSelectedUnitOption(null);
    setVillageOptionFilter(null);
    setSelectedPlotOptionFilter(null);

    dashboardTalukasNAmes(state_id, districtId).then((talukas) => {
      const allTalukas = talukas;
      setTaluka_list(allTalukas.data);
    });

    setToBeFilterData({
      ...toBeFilterData,
      ["tpl_district_id"]: districtId,
      ["tpl_taluka_id"]: null,
      ["tpl_unit_id"]: null,
      ["tpl_village_id"]: null,
      ["tpl_plot_id"]: null,
    });
  };
  const handleTalukaChange = (selectedVillageOption) => {
    var talukaId = selectedVillageOption.value;
    setSelectedTalukaOption(selectedVillageOption);
    setTalukaId(talukaId);
    setUnit_list(null);
    setVillageList(null);
    setPlotList(null);

    dashboardUnitNAmes(state_id, district_id, talukaId).then((units) => {
      const allUnits = units;
      setUnit_list(allUnits.data);
    });

    setToBeFilterData({
      ...toBeFilterData,
      ["tpl_taluka_id"]: talukaId,
      ["tpl_unit_id"]: null,
      ["tpl_village_id"]: null,
      ["tpl_plot_id"]: null,
    });
  };
  const handleUnitChange = (selectedVillageOption) => {
    // console.log(selectedVillageOption);

    var unitId = selectedVillageOption.value;
    setSelectedUnitOption(selectedVillageOption);
    setVillageList(null);
    setPlotList(null);
    setVillageOptionFilter(null);
    setSelectedPlotOptionFilter(null);
    dashboardVillageNAmes(state_id, district_id, taluka_id, unitId).then(
      (villages) => {
        const allVillages = villages;
        setVillage_List_filter(allVillages.data);
        // console.log(allVillages.data);
      }
    );

    setToBeFilterData({
      ...toBeFilterData,
      ["tpl_unit_id"]: unitId,
      ["tpl_village_id"]: null,
      ["tpl_plot_id"]: null,
    });
  };
  const handleVillageChange =async (selectedVillageOption) => {
    var villageId = selectedVillageOption.value;
    setVillageOptionFilter(selectedVillageOption);
     setSelectedPlotOptionFilter(null);

    setToBeFilterData({
      ...toBeFilterData,
      ["tpl_village_id"]: villageId,
    });
  };

  

  const renderStateList = () => {
    return state_list?.map((data) => ({
      label: data.tsl_state_name,
      value: data.tsl_state_id,
    }));
  };

  const renderDistrictList = () => {
    return district_list?.map((data) => ({
      label: data.tdl_district_name,
      value: data.tdl_district_id,
    }));
  };

  const renderTalukaList = () => {
    return taluka_list?.map((data) => ({
      label: data.ttll_taluka_name,
      value: data.ttll_taluka_id,
    }));
  };

  const renderUnitList = () => {
    return unit_list?.map((data) => ({
      label: data.tun_name,
      value: data.tun_id,
    }));
  };

  const renderVillageList = () => {
    return village_list_filter?.map((data) => ({
      label: data.tvl_village_name,
      value: data.tvl_village_id,
    }));
  };
  
  const resetFiter = () => {
    setLoading(true);
    getFilterOptions().then((data) => {
      setState_list(data?.data);
      setDistrict_list(null);
      setUnit_list(null);
      setVillage_List_filter(null);
      setTaluka_list(null);
      
      setSelectedStateOption(null);
      setSelectedDistrictOption(null);
      setSelectedTalukaOption(null);
      setSelectedUnitOption(null);
      setVillageOptionFilter(null);
      

      setToBeFilterData({
        tpl_state_id: "",
        tpl_district_id: "",
        tpl_taluka_id: "",
        tpl_unit_id: "",
        tpl_village_id: "",
        tpl_plot_id: ""
      });
      setLoading(false);
    });
  };

  

  useEffect(() => {
    getFilterOptions().then((data) => {
      setState_list(data.data);
    });
  }, []);

  useEffect(()=>{
    getFilterVal(toBeFilterData);
  }, [toBeFilterData, getFilterVal]);


  return (
    <>
        <form id="filter_plots">
        <div className="row mt-4" style={{ alignItems: "end" }}>
        {/* State */}
        <div className="col-md-3">
            <div className="mb-3">
            <label
                htmlFor="exampleFormControlInput1"
                className="form-label">
                State
            </label>
            <Select
                value={selectedStateOption}
                onChange={handleStateChange}
                options={renderStateList()}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                menuPortalTarget={document.body}
            />
            </div>
        </div>

        {/* District */}
        <div className="col-md-3">
            <div className="mb-3">
            <label
                htmlFor="exampleFormControlInput1"
                className="form-label">
                District
            </label>
            <Select
                value={selectedDistrictOption}
                onChange={handleDistrictChange}
                options={renderDistrictList()}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                menuPortalTarget={document.body}
            />
            </div>
        </div>

        {/* Taluk */}
        <div className="col-md-3">
            <div className="mb-3">
            <label
                htmlFor="exampleFormControlInput1"
                className="form-label">
                Talukas
            </label>
            <Select
                value={selectedTalukaOption}
                onChange={handleTalukaChange}
                options={renderTalukaList()}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                menuPortalTarget={document.body}
            />
            </div>
        </div>

        {/* Unit */}
        <div className="col-md-3">
            <div className="mb-3">
            <label
                htmlFor="exampleFormControlInput1"
                className="form-label">
                Unit
            </label>
            <Select
                value={selectedUnitOption}
                onChange={handleUnitChange}
                options={renderUnitList()}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                menuPortalTarget={document.body}
            />
            </div>
        </div>

        {/* Village */}
        <div className="col-md-3">
            <div className="mb-3">
            <label
                htmlFor="exampleFormControlInput1"
                className="form-label">
                Village
            </label>
            <Select
                value={selectedVillageOptionFilter}
                onChange={handleVillageChange}
                options={renderVillageList()}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                menuPortalTarget={document.body}
            />
            </div>
        </div>
        {/* Filter Button  */}
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
    </>
  )
}

export default ProjectFilter;