import React, { useEffect, useState } from 'react'
import Select from 'react-select';
import { getAllStateApi } from "../../Services/State-service";
import {
  getDistrictByStateId,
} from "../../Services/District-service";

import {
  getAllTalukaByStateAndDistrictAndTaluka, getAllUnitApi, getAllAssingnedUnitApi
} from "../../Services/unit-service";
import {
  getAllTalukaByStateAndDistrict,
} from "../../Services/Taluka-service";
import "../../helper/right-menu";
import { dashboardVillageNAmes } from '../../Services/Dashboard-service';
import axios from 'axios';
import { getPlotListAsPerVillages, getMapPlotListAsPerVillages } from '../../Services/Plot-service';

import {Button} from 'react-bootstrap';

const SideBArMap = ({
  sendSingleVillageMapToMapjs,
  sendSinglePlotMapToMapjs,
  restFilter,
  setLoading
}) => {
  const queryParameters = new URLSearchParams(window.location.search);
  const get_plot_map_id = queryParameters.get("plot_id");
  let [loadingcolor] = useState("#ffffff");

  const [infoState, setInfoState] = useState(false);
  const [layerLagendState, setLayerLagendState] = useState(false);
  const [baseMapState, setBaseMap] = useState(false);
  const [measurementState, setMeasurementState] = useState(false);
  const [drawCircelState, setDrawCircelState] = useState(false);
  const [filterState, setFilterState] = useState(false);
  const [color, setColor] = useState("#00ff00");
  const [transparency, setTransparency] = useState(0);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [measurementUnit, setMeasurementUnit] = useState("kilometer");
  const [fontFamily, setFontFamily] = useState(0);
  const [fontSize, setFontSize] = useState(14);
  const [fontBackground, setFontBackground] = useState("#000000");
  const [drawCircle, setDrawCircle] = useState(2);
  const [divisionsList, setDivisionsList] = useState([]);
  const [villageList, setVillageList] = useState([]);
  const [plotList, setPlotList] = useState([]);
  const [divisionId, setDivisionId] = useState("");
  const [plotId, setPlotId] = useState("");
  const [divisionOption, setDivisionOption] = useState(null);
  const [villageOption, setVillageOption] = useState(null);
  const [myMap, setMap] = useState([]);
  const [boxZoom, setBoxZoom] = useState(false);

  const [addVillage, setAddVillage] = useState({
    tvl_village_name: "",
    tvl_tsl_state_id: "",
    tvl_tdl_district_id: "",
    tvl_ttll_taluka_id: "",
    tvl_tun_id: "",
  });

  const [village_edit, setEditVillage_edit] = useState({
    tvl_village_name: "",
    tvl_village_id: "",
    tvl_tsl_state_id: "",
    tvl_tdl_district_id: "",
    tvl_ttll_taluka_id: "",
    tvl_tun_id: "",
  });

  const [alreadySelectedStateOption, setAlreadySelectedStateOption] =
    useState(null);

  const [alreadySelectedDistrictOption, setAlreadySelectedDistrictOption] =
    useState(null);

  //------------------------- Filter Part Start -------------------------------

  ////////////////////////state of states start///////////////////////
  const [state_list, set_state_list] = useState([]);
  const [state_list_update, set_state_list_update] = useState([]);
  const [selectedStateOption, setSelectedStateOption] = useState(null);
  const [state_id, setStateId] = useState(null);
  ////////////////////////state of states end///////////////////////

  ////////////////////////district of states start///////////////////////
  const [district_list, set_district_list] = useState([]);
  const [district_list_update, set_district_list_update] = useState([]);
  const [selectedDistrictOption, setSelectedDistrictOption] = useState(null);
  const [district_id, setDistrictId] = useState(null);
  ////////////////////////district of states end///////////////////////

  ////////////////////////Taluka  of states start///////////////////////
  const [taluka_list, set_taluka_list] = useState([]);
  const [taluka_list_update, set_taluka_list_update] = useState([]);
  const [selectedTalukaOption, setSelectedTalukaOption] = useState(null);
  const [taluka_id, setTalukaId] = useState(null);
  const [alreadySelectedTalukaOption, setAlreadySelectedTalukaOption] =
    useState(null);
  ////////////////////////Taluka of states end///////////////////////

  ///////////////////////Unit of States Start///////////////////
  const [unit_list, set_unit_list] = useState([]);
  const [unit_list_update, set_unit_list_update] = useState([]);
  const [selectedUnitOption, setSelectedUnitOption] = useState(null);
  const [unit_id, setUnitId] = useState(null);
  const [alreadySelectedUnitOption, setAlreadySelectedUnitOption] =
    useState(null);
  ///////////////////////Unit of States End///////////////////

  ///////////////////////Village of States Start///////////////////
  const [village_list, set_village_list] = useState([]);
  const [village_list_update, set_village_list_update] = useState([]);
  const [selectedVillageOption, setSelectedVillageOption] = useState(null);
  const [village_id, setVillageId] = useState(null);

  useEffect(() => {
    // getAllstateList();
    getAllUnitList();
  }, []);

  const handleTalukaChange = (selectedVillageOption) => {

    var talukaId = selectedVillageOption.value;
    var talukaName = selectedVillageOption.label;


    setTalukaId(talukaId);
    setSelectedTalukaOption(selectedVillageOption);
    setSelectedUnitOption(null);
    setSelectedVillageOption(null);

    getAllTalukaByStateAndDistrictAndTaluka(
      state_id,
      district_id,
      taluka_id
    ).then((data) => {

      set_unit_list(data.data);
    });

    setAddVillage({
      ...addVillage,
      tvl_ttll_taluka_id: talukaId,
    });
  };
  const handleUnitChange = (selectedVillageOption) => {


    var unitId = selectedVillageOption.value;

    setUnitId(unitId);
    setSelectedUnitOption(selectedVillageOption);
    setSelectedVillageOption(null);

    setVillageOption(null);
    setPlotId(null);
    setPlotList(null);

    // restFilter();

    dashboardVillageNAmes(state_id, district_id, taluka_id, unitId).then(
      (villages) => {
        const allVillages = villages;
        setVillageList(allVillages.data);

      }
    );

    setAddVillage({
      ...addVillage,
      tvl_tun_id: unitId,
    });
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
    return villageList?.map((data) => ({
      label: data.tvl_village_name,
      value: data.tvl_village_id,
    }));
  };
  const getAllstateList = (callback = null) => {
    getAllStateApi("")
      .then((data) => {
        let all_client = data.data;
        set_state_list(all_client);
        setLoading(false);
      })
      .catch((error) => {
        //    toast.error(error);
      });
  };

  const getAllUnitList = (callback = null) => {
    getAllAssingnedUnitApi()
      .then((data) => {
        console.log(data);
        let all_client = data.data;
        set_unit_list(all_client);
        // setLoading(false);
      })
      .catch((error) => {
        //    toast.error(error);
      });
  };
  const handleVillageChange = (getVillageData) => {
    // setLoading(true);
    setVillageOption(getVillageData);
    var getVillageId = getVillageData.value;
    const villageData = async () => {
      try {
        // Make a GET request to your API to fetch the GeoJSON data
        const response = await axios.get(
          `http://localhost:5000/api/v1/map/villageLayers/${getVillageId}`
        );

        sendSingleVillageMapToMapjs(response.data);
      } catch (error) {
        console.error("Error fetching village data:", error);
      }
    };

    villageData();

    getMapPlotListAsPerVillages(getVillageId).then((response) => {
      setPlotId(null);
      // setLoading(false);
      setPlotList(response.data);
    });

    

    
    // var plot_list = {
    //   unit_id: divisionId,
    //   village_id: getVillageId,
    // };
  };
  const getPlotdetailsFun = (plotData) => {
    setPlotId(plotData);

    var plotId = plotData.value;
    sendSinglePlotMapToMapjs(plotId)
    // const villageData = async () => {
    //   try {
    //     // Make a GET request to your API to fetch the GeoJSON data
    //     const response = await axios.get(
    //       `http://localhost:5000/api/v1/map/plots/${plotId}`
    //     );
    //     sendSinglePlotMapToMapjs(response.data);
    //   } catch (error) {
    //     console.error("Error fetching village data:", error);
    //   }
    // };

    // villageData();


  };

  const handleStateChange = (selectedVillageOption) => {
 

    var stateId = selectedVillageOption.value;

    setStateId(stateId);
    set_district_list(null);
    set_taluka_list(null);
    getDistrictByStateId(stateId).then((data) => {
      set_district_list(data.data);
    });
    setSelectedStateOption(selectedVillageOption);
    setSelectedDistrictOption(null)
    setSelectedTalukaOption(null)
    setSelectedUnitOption(null)
    setSelectedVillageOption(null)


    setAddVillage({
      ...addVillage,
      tvl_tsl_state_id: stateId,
    });
  };

  const renderStateList = () => {
    return state_list?.map((data) => ({
      label: data.tsl_state_name,
      value: data.tsl_state_id,
    }));
  };

  ////////////////////////////state operation end/////////////////////////////

  const handleDistrictChange = (selectedVillageOption) => {


    var districtId = selectedVillageOption.value;

 

    setDistrictId(districtId);
    set_taluka_list(null);
    getAllTalukaByStateAndDistrict(state_id, districtId).then((data) => {
      set_taluka_list(data.data);
    });
    setSelectedDistrictOption(selectedVillageOption);
   setSelectedTalukaOption(null);
   setSelectedUnitOption(null);
   setSelectedVillageOption(null);

    setAddVillage({
      ...addVillage,
      tvl_tdl_district_id: districtId,
    });
  };

  const renderDistrictList = () => {
    return district_list?.map((data) => ({
      label: data.tdl_district_name,
      value: data.tdl_district_id,
    }));
    };
    
    const renderPlotList = () => {
      return plotList?.map((data) => ({
        label: data.tpm_plot_no,
        value: data.tpm_plot_id,
      }));
    };

  return (
    <>
      <div className="">
        {/* <div style={{ display: filterState ? "block" : "none" }}> */}
        <div>
          <div className="heading-panel bg-dark text-light">Filter By</div>

          <div className="m-3">
            <form method="POST" action="{{ route('plots.filter') }}">
              <div className="filter-body mostly-customized-scrollbar">
                <article className="card-group-item">
                  <div className="filter-content">
                    <div className="card-body py-2">
                      <div className="form-row">
                        <div className="form-group col-md-12 mb-1">
                          <label>Unit</label>
                          <Select
                            value={selectedUnitOption}
                            onChange={handleUnitChange}
                            options={renderUnitList()}
                          />
                        </div>
                        <div className="form-group col-md-12 mb-1">
                          <label>Village</label>
                          <Select
                            value={villageOption}
                            onChange={handleVillageChange}
                            options={renderVillageList()}
                          />
                        </div>
                        <div className="form-group col-md-12 mb-1">
                          <label>Plots</label>
                          <Select
                            value={plotId}
                            onChange={getPlotdetailsFun}
                            options={renderPlotList()}
                            styles={{height:"100px"}}
                          />
                        </div>

                        <div className="form-group col-md-12 mb-1 float-right">
                            <Button
                              variant="dark"
                              size="sm"
                              onClick={() => {
                                restFilter();
                                setSelectedStateOption(null);
                                setSelectedDistrictOption(null)
                                setSelectedTalukaOption(null)
                                setSelectedUnitOption(null)
                                setVillageOption(null)
                                setPlotId(null)

                                set_district_list(null)
                                set_taluka_list(null)
                                // set_unit_list(null)
                                setVillageList(null)
                                setPlotList(null)
                              }}
                              >
                              Reset
                            </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBArMap