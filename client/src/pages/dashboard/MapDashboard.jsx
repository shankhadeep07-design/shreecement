import React, { useState, useEffect, useRef } from "react";

import ScaleLoader from "react-spinners/ScaleLoader";

import "ol/ol.css";
import "./map_assets/css/popup.css";
import "./map_assets/css/map.css";
// import {init} from './map_assets/js/map_halper';
import { BingMaps, Vector as VectorSource } from "ol/source";
import { DragBox, Select as interactionSelect } from "ol/interaction";
import { GeoJSON } from "ol/format";
import { transform } from "ol/proj";
import { Style, Fill, Stroke, Text } from "ol/style";
import { boundingExtent } from "ol/extent";
import {toast} from "react-toastify";
import Overlay from "ol/Overlay";
import { ImCross } from "react-icons/im";

//----------------------------------  Layer Section ----------------------------------------------------------------
import {
  stateLayer,
  districtLayer,
  filteredPointsLayer,
} from "./map_assets/js/Layers";
//------------------------End Layer Section ----------------------------------------------------------------

import {
  stateMapList,
  singleDistrictMap,
  getVillageDetailsForMapByBlock,
  map_fetch_popover_details_api,
  villageMapListApi,
  districtListApi,
  districtMapDetails,
  blockMapList,
} from "../../services/Map-service.js";

//-----------------------End Service --------------------

import Select from "react-select";
import { init, bingLayer, plotselect } from "./map_assets/js/MyMap";
// import { themeList } from "../../services/Master-service.js";
import { privateAxios } from "../../services/Helper";
import { fetchFoundationByStateId, fetchFoundationLists, fetchProjectStageLists, fetchStateByFoundationIds } from "../../services/Master-service.js";

import aerialView from "../../assets/images/aerial-view.png";
import aerialLabelView from "../../assets/images/aerial-label-view.png";
import roadView from "../../assets/images/road-view.png";
import roadDarkView from "../../assets/images/road-dark-view.png";


export default function MapDashboard() {
  const queryParameters = new URLSearchParams(window.location.search);
  const get_plot_map_id = queryParameters.get("plot_id");

  // let {loading, setLoading} = useLoading(false);
  let [loadingcolor] = useState("#ffffff");

  const [popupDetails, setPopupDetails] = useState('');

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
  const [villageList, setVillageList] = useState([]);
  const [divisionId, setDivisionId] = useState("");
  const [divisionOption, setDivisionOption] = useState(null);
  const [myMap, setMap] = useState([]);
  const [boxZoom, setBoxZoom] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [addVillage, setAddVillage] = useState({
    tvl_village_name: "",
    tvl_tsl_state_id: "",
    tvl_tdl_district_id: "",
    tvl_ttll_taluka_id: "",
    tvl_tun_id: "",
  });

  const [filterForm, setFilterForm] = useState({
    state_id: "tsl0000000020",
    district_id: "tdl0000000021",
    block_id: "TBL0000000029",
    village_id: "",
    piller: "tpsm0000000001",
    piller_type: "daily",
    piller_form: "tem0000000046",
    from_date: "",
    to_date: "",
  });

  
  const [piller, setPiller] = useState([]);
  const [pillerType, setPillerType] = useState([]);
  const [pillerFormList, setPillerFormList] = useState([]);
  const [pillerForm, setPillerForm] = useState([]);

  var popupRef = useRef(null);
  var popupElRef = useRef(null);
  var mapClickeRef = useRef(null);
  const mapRef = useRef(null);

  //------------------------- Filter Part Start -------------------------------

  ////////////////////////state of states start///////////////////////
  const [state_list, set_state_list] = useState([]);
  ////////////////////////state of states end///////////////////////

  ////////////////////////district of states start///////////////////////
  const [district_list, set_district_list] = useState([]);
  const [district_id, setDistrictId] = useState(null);
  ////////////////////////district of states end///////////////////////

  ////////////////////////Block  of states start///////////////////////
  const [block_list, set_block_list] = useState([]);
  const [blockMapDetails, setBlockMapDetails] = useState(null);
  ////////////////////////Block of states end///////////////////////

  ////////////////////////Village  of states start///////////////////////
  const [villageOptions, setVillageOptions] = useState([]);
  ////////////////////////Village of states end///////////////////////



  //---------------------------- Filter section ---------------------------//
  const [errors, setErrors] = useState({});
  const fetchData = async () => {

     getAllDistrictList('tsl0000000020');
     getAllBlockList('tdl0000000021');

     getAllVillageList('TBL0000000029');

      const state_ids = {
        state_ids: 'tpsm0000000001'
      };
      const response = await fetchFoundationByStateId(state_ids);

      const { data, status, message } = response;

      if (status === 1) {
        const p_type = [...new Set(data.map(item => item.tem_type))].map(item => ({ value: item, label: item })); 
        

        setPillerType(p_type);

        
        const filteredForms = data
          .filter(item => 
            item.tem_project_stage_id === "tpsm0000000001" 
            && item.tem_type === p_type[1].value
          )
          .map(item => ({
            value: item.tem_id,
            label: item.tem_name,
            type: item.tem_type
          }));
          
          setPillerForm(filteredForms);
          setPillerFormList(data);
          setAddVillage({
            ...addVillage,
            tvl_tsl_state_id: 20,
          });

          
          setFilterForm(prevState => ({
            ...prevState,
            piller: "tpsm0000000001",
            piller_type: p_type[1].value,
            piller_form: filteredForms[1].value,
            from_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
            to_date: new Date().toISOString().split('T')[0],
          }));

      } else {
        console.error('Failed to fetch state:', message);
      }
  };

  useEffect(() => {

    fetchData();
  }, []);


  const detailsofProjectStageList = async () => {
    try {
      const response = await fetchProjectStageLists();

      if (response.status === 1) {
        const options = response.data.map((data) => ({
          value: data.tpsm_id,
          label: data.tpsm_name,
          slug: data.tpsm_slug,
        }));
        setPiller(options);
     
      }
    } catch (error) {
      console.error("Error fetching ProjectStages:", error);
    }
  };

 const handleFilterSubmit = () => {
 
  const { state_id, district_id, block_id, village_id, piller, piller_type, piller_form, from_date, to_date } = filterForm;
  let newErrors = {};

  // Validate fields
  if (!piller) newErrors.piller = "Piller is required.";
  if (!piller_type) newErrors.piller_type = "Piller Type is required.";
  if (!piller_form) newErrors.piller_form = "Piller Form is required.";

  // If errors exist, update state and return
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setErrors({}); // Clear errors if all fields are valid

  const data = {state_id, district_id, block_id, village_id, piller, piller_type, piller_form, from_date, to_date };

  

  var layer = filteredPointsLayer(data);

  // Check if layer exists before removing
  const existingLayer = myMap
    .getLayers()
    .getArray()
    .find((l) => l.values_.name === layer.values_.name);

  if (existingLayer) {
    myMap.removeLayer(existingLayer);
  }

  addLayerFun(layer);
};


  
  const handleFilterChange = (value,type) => {
    setFilterForm({
      ...filterForm,
      [type]: value
    });

    

    if(type == 'piller'){
      fetchFoundation(value);
    }

    
    if(type == 'piller_type'){
      setPillerForm(pillerFormList.filter((item) => item.tem_type == value).map((item) => ({
        value: item.tem_id,
        label: item.tem_name,
      })));
    }

  };

  
  const fetchFoundation = async (stateIds) => {
    
      const state_id = stateIds;
  
      // Create the request payload
      const state_ids = {
        state_ids: state_id
      };
      
      // Make the API call to fetch districts based on the selected state IDs
      const response = await fetchFoundationByStateId(state_ids);

      // Assuming the response structure you provided
      const { data, status, message } = response;
  
     

      if (status === 1) {

        const p_type = [...new Set(data.map(item => item.tem_type))].map(item => ({ value: item, label: item })); 
        setPillerType(p_type);
        setPillerFormList(data);
          
  
      } else {
        console.error('Failed to fetch state:', message);
      }

  };

  //-------------------------------- Filter section end ----------------------------////




  ////////////////////////////state operation start/////////////////////////////
  const getAllstateList = (callback = null) => {
    stateMapList("")
      .then((data) => {
        let all_client = data.data;
        set_state_list(all_client);
        // setLoading(false);
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  const getAllDistrictList = (stateId) => {

    districtListApi({state_id:stateId})
      .then((data) => {
        let all_client = data.data;
        set_district_list(data.data);
        // setLoading(false);
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  const getAllBlockList = (districtId) => {

    blockMapList({district_id:districtId})
      .then((data) => {
        let all_client = data.data;
        set_block_list(data.data);
        // setLoading(false);
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  const getAllVillageList = (block_id) => {

    var data = {
      block_id: block_id,
    };

    villageMapListApi(data).then((data) => {
      setVillageOptions(data.data.villages);
    }).catch((error) => {
      toast.error(error);
    });
  };

  const handleStateChange = (selectedVillageOption) => {  
    var stateId = selectedVillageOption.value;
    setFilterForm({ ...filterForm, ["state_id"]: stateId });
    set_district_list(null);
    setBlockMapDetails(null);
    var state_data = {
      state_id: stateId,
    };

    districtMapDetails(state_data).then((data) => {

      getAllDistrictList(stateId);

      
      var layer = districtLayer(stateId);

      // Check if layer exists before removing
      const existingLayer = myMap
        .getLayers()
        .getArray()
        .find((l) => l.values_.name === layer.values_.name);
      if (existingLayer) {
        myMap.removeLayer(existingLayer);
      }

      addLayerFun(layer);

      data_response = data.data.state_extent.st_extent;

      if (data_response) {
        var data_response = data_response.replace("BOX", "");
        var data_response = data_response.replace("(", "");
        var data_response = data_response.replace(")", "");
        var data_response = data_response.replace(",", " ");
        var data_response = data_response.replace('"', "");
        var data_response = data_response.replace('"', "");
        var data_response = data_response.split(" ");
        var minx = data_response[0];
        var miny = data_response[1];
        var maxx = data_response[2];
        var maxy = data_response[3];

        setExtent(minx, miny, maxx, maxy);
      }
    });

    

    setAddVillage({
      ...addVillage,
      tvl_tsl_state_id: stateId,
    });
  };

  const addLayerFun = (layer) => {
    myMap.removeLayer(layer);
    myMap.addLayer(layer);
  };

  const renderStateList = () => {
    return state_list?.map((data) => ({      
      label: data.tsl_state_name,
      value: data.tsl_state_id,
    }));
  };

  useEffect(() => {
    if (state_list?.length) {
      const defaultStateId = 25;
      const defaultStateOption = state_list.find(state => state.tsl_state_id === defaultStateId);
  
      if (defaultStateOption) {
        const formattedOption = {
          label: defaultStateOption.tsl_state_name,
          value: defaultStateOption.tsl_state_id
        };
        handleStateChange(formattedOption);      // trigger related updates
      }
    }
  }, [state_list]);

  ////////////////////////////state operation end/////////////////////////////

  
  ////////////////////////////Dustrict operation/////////////////////////////
  const handleDistrictChange = (selectedVillageOption) => {

    var districtId = selectedVillageOption.value;
    setFilterForm({ ...filterForm, ["district_id"]: districtId });
    set_block_list([]);
    setBlockMapDetails(null);
    singleDistrictMap(districtId)
      .then((data) => {
          getAllBlockList(districtId);
        var data_response = data.data.district_extent.st_extent;

        if (data_response) {
          var data_response = data_response.replace("BOX", "");
          var data_response = data_response.replace("(", "");
          var data_response = data_response.replace(")", "");
          var data_response = data_response.replace(",", " ");
          var data_response = data_response.replace('"', "");
          var data_response = data_response.replace('"', "");
          var data_response = data_response.split(" ");
          var minx = data_response[0];
          var miny = data_response[1];
          var maxx = data_response[2];
          var maxy = data_response[3];

          setExtent(minx, miny, maxx, maxy);
        }

        //Do not delete this comment
        // var layer = visitPointLayerFun(districtId);

        // Check if layer exists before removing
        // const existingLayer = myMap.getLayers().getArray().find(l => l.values_.name === layer.values_.name);
        // if (existingLayer) {
        //   myMap.removeLayer(existingLayer);
        // }

        // addLayerFun(layer);
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || error.message || "An error occurred";

        toast.error(errorMessage);
      });
  };

  const renderDistrictList = () => {
    return district_list?.map((data) => ({
      label: data.tdl_district_name,
      value: data.tdl_district_id,
    }));
  };

  ////////////////////////////Dustrict operation End/////////////////////////////


  ////////////////////////////Block operation /////////////////////////////

  const renderBlockList = () => {
    return block_list?.map((data) => ({
      label: data.tbl_block_name,
      value: data.tbl_block_id,
    }));
  };

  const handleBlockChange = (selectedVillageOption) => {

    var blockId = selectedVillageOption.value;
    var blockName = selectedVillageOption.label;

    setFilterForm({ ...filterForm, ["block_id"]: blockId });

    var data = {
      state_id: filterForm.state_id,
      district_id: filterForm.district_id,
      block_id: blockId,
    };
    setVillageOptions([]);
    // villageMapListApi(data).then((data) => {
    //   setVillageOptions(data.data.villages);
    // });

    getAllVillageList(blockId);

  };
  ////////////////////////////Block operation End/////////////////////////////


  ////////////////////////////Village operation /////////////////////////////

  const renderVillageList = () => {
    return villageOptions?.map((data) => ({
      label: data.tvl_village_name,
      value: data.tvl_village_id,
    }));
  };

  const handleVillageChange = (selectedVillageOption) => {

    var villageId = selectedVillageOption.value;
    var villageName = selectedVillageOption.label;
    setFilterForm({ ...filterForm, ["village_id"]: villageId });

  };

  ////////////////////////////Village operation End/////////////////////////////


  //-----------------------------  Map Start --------------------

    // Use a ref to store the latest filterForm state
    const filterFormRef = useRef(filterForm);

    // Update the ref whenever filterForm changes
    useEffect(() => {
      filterFormRef.current = filterForm;
    }, [filterForm]);
  // Single click event handler
  const handleMapClick = (event) => {
    const coordinate = event.coordinate;
    console.log(coordinate);

    var actCoordinate = transform(coordinate, "EPSG:3857", "EPSG:4326");
    const obj = {
      coordinate: actCoordinate,
    };

    let foundOgcFid = null; // To store the found ogc_fid

    // Iterate over the features at the clicked pixel
    mapRef.current.forEachFeatureAtPixel(event.pixel, function (feature) {
      var ogc_fid = feature.get("ogc_fid"); // Assuming the feature contains 'ogc_fid'

      if (ogc_fid) {
        foundOgcFid = ogc_fid; // Store the ogc_fid
        return true; // Return true to stop further iteration
      }
    });

    // Get the latest filterForm values from the ref
    const latestFilterForm = filterFormRef.current;

    if (foundOgcFid) {
      console.log("Latest filterForm:", latestFilterForm);

      obj.ogc_fid = foundOgcFid;
      obj.piller = latestFilterForm.piller;
      obj.piller_type = latestFilterForm.piller_type;
      obj.piller_form = latestFilterForm.piller_form;
      obj.from_date = latestFilterForm.from_date;
      obj.to_date = latestFilterForm.to_date;

      map_fetch_popover_details_api(obj).then((response) => {
        setPopupDetails(response.data);
        popupRef.current.setPosition(coordinate);
        popupElRef.current.style.display = "block";
      });
    } else {
      console.log("No feature with OGC FID found.");
    }
  };
  useEffect(function () {
    detailsofProjectStageList();
    getAllstateList();
    // themeListFun();
    // getAllDivisionsList();
    var map = init();
    mapRef.current = map; 
    setMap(map);

    popupRef.current = new Overlay({
      element: popupElRef.current,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });

    map.addOverlay(popupRef.current);
    // mapClickeRef.current = map.on("singleclick", (event) => {
    //   const coordinate = event.coordinate;
    //   console.log(coordinate);
      
    //   var actCoordinate = transform(coordinate, "EPSG:3857", "EPSG:4326");
    //   const obj = {
    //     coordinate: actCoordinate,
    //   };

    //   let foundOgcFid = null; // To store the found ogc_fid

    //   // Iterate over the features at the clicked pixel
    //   map.forEachFeatureAtPixel(event.pixel, function (feature) {
    //     var ogc_fid = feature.get("ogc_fid"); // Assuming the feature contains 'ogc_fid'

        
    //     if (ogc_fid) {
    //       foundOgcFid = ogc_fid; // Store the ogc_fid
    //       return true; // Return true to stop further iteration
    //     }
    //   });

    //   // If an ogc_fid was found, proceed with further logic
    //   if (foundOgcFid) {
    //     console.log(filterForm);
        
    //     obj.ogc_fid = foundOgcFid; // Add the ogc_fid to your object
    //     obj.piller = filterForm.piller;
    //     obj.piller_type = filterForm.piller_type;
    //     obj.piller_form = filterForm.piller_form;
    //     obj.from_date = filterForm.from_date;
    //     obj.to_date = filterForm.to_date;
        

    //     map_fetch_popover_details_api(obj).then((response) => {
    //       setPopupDetails(response.data);
    //       popupRef.current.setPosition(coordinate);
    //       popupElRef.current.style.display = "block";
    //   });
        
    //   } else {
    //     console.log("No feature with OGC FID found.");
    //   }
    // });
    // Attach click event
    mapClickeRef.current = map.on("singleclick", handleMapClick);
    return () => map.setTarget(null);

    // setTimeout(function () {
    // }, 1000);
  }, []);

  useEffect(
    function () {
      if (get_plot_map_id !== null && myMap.length == undefined) {
        // setLoading(true);
        setTimeout(function () {
          //getPlotdetailsFun(atob(get_plot_map_id));
          // setLoading(false);
        }, 1000);
      }
    },
    [myMap]
  );

  function setLayerVisibility(lyr, tf) {
    var layers = myMap.getLayers();
    var length = layers.getLength();

    for (var i = 0; i < length; i++) {
      if (lyr === layers.item(i).get("name")) {
        layers.item(i).setVisible(tf);
        break;
      }
    }
  }

  const changeLayerView = (layerName, event) => {
    setLayerVisibility(layerName, event.target.checked);
  };

  //Map Label
  const changeLayerLabel = (labelName) => {
    var bingSource = new BingMaps({
      key: "AnObC3Et-5WiYvAPWJDzRcz7bZQxW9aJCbwc1M2d063x9tf0UCasetzWGLAnxpMs",
      imagerySet: labelName,
    });
    bingLayer.setSource(bingSource);
  };

  const boxZoomFun = () => {
    setBoxZoom(!boxZoom);
    var dragBox = new DragBox();
    myMap.addInteraction(dragBox);
    dragBox.on("boxend", function () {
      var extent = dragBox.getGeometry().getExtent();
      myMap.getView().fit(extent);
    });
  };

  ///--------------------------------- Map -------------------------------

  var style_selected = function (feature) {
    var style = new Style({
      fill: new Fill({
        color: "rgba(222, 49, 99, 0.5)",
      }),
      stroke: new Stroke({
        color: "orange",
        width: 2,
      }),
      text: new Text({
        fill: new Fill({
          color: "white",
        }),
        stroke: new Stroke({
          color: "rgba(0, 0, 0, 1)",
          width: 3,
        }),
        font: "Normal 10px Arial",
        text: feature.get("thr_no"),
      }),
    });
    return style;
  };

  function addInteraction(layer) {
    var layersToSelect = [bingLayer, stateLayer];

    // Add 'layer' only if it's defined
    if (layer) {
      layersToSelect.push(layer);
    }

    var Select = new interactionSelect({
      style: style_selected,
      layers: layersToSelect,
    });

    myMap.addInteraction(Select);
  }

  function setExtent(minx, miny, maxx, maxy) {
    var minx = parseFloat(minx);
    var miny = parseFloat(miny);
    var maxx = parseFloat(maxx);
    var maxy = parseFloat(maxy);
    //alert(minx);

    var bottomLeft = transform([minx, miny], "EPSG:4326", "EPSG:3857");
    var topRight = transform([maxx, maxy], "EPSG:4326", "EPSG:3857");
    var extent = new boundingExtent([bottomLeft, topRight]);
    myMap.getView().fit(extent, myMap.getSize(), {
      padding: [50, 50, 50, 50],
      constrainResolution: true,
    });
    addInteraction();
  }

  const rightPanel = (name, status) => {
    setLayerLagendState(false);
    setBaseMap(false);
    setMeasurementState(false);
    setDrawCircelState(false);
    setFilterState(false);

    switch (name) {
      case "LayerLegend":
        setLayerLagendState(status);
        break;
      case "BaseMap":
        setBaseMap(status);
        break;
      case "Measurement":
        setMeasurementState(status);
        break;
      case "Filter":
        setFilterState(status);
        break;
      case "DrawCircle":
        setDrawCircelState(status);
        break;

      default:
        break;
    }
  };

  return (
    <>
      <div className="row py-2 px-0">
          <div className="col-md-3">
          
          <Select
            name="state"
            value={renderStateList()?.find(option => option.value === filterForm.state_id)}
            onChange={handleStateChange}
            options={renderStateList()}
            placeholder="Select State"
          />
        </div>
         <div className="col-md-3">
          <Select
            name="district"
            value={renderDistrictList()?.find(option => option.value === filterForm.district_id)}
            onChange={handleDistrictChange}
            options={renderDistrictList()}
            placeholder="Select District"
          />
        </div> 
         <div className="col-md-3">
           <Select
           name="block"
                value={renderBlockList()?.find(option => option.value === filterForm.block_id)}
                onChange={handleBlockChange}
                options={renderBlockList()}
                placeholder="Select Block"
              /> 
        </div> 
          <div className="col-md-3">
              <Select
              name="village"
                    value={renderVillageList()?.find(option => option.value === filterForm.village_id)}
                    onChange={handleVillageChange}
                    options={renderVillageList()}
                    placeholder="Select Village"
                  /> 
          </div> 
      </div>

      <div className="row py-2 px-0">
        
        <div className="col-md-2">
          <Select
            name="piller"
            value={piller.find((option) => option.value === filterForm.piller)}
            onChange={(e) => handleFilterChange(e.value, "piller")}
            options={piller}
            placeholder="Select Piller"
          />
          {errors.piller && <div className="text-danger">{errors.piller}</div>}
        </div>

        <div className="col-md-1">
          <Select
            name="piller_type"
            value={pillerType.find((option) => option.value === filterForm.piller_type)}
            onChange={(e) => handleFilterChange(e.value, "piller_type")}
            options={pillerType}
            placeholder="Select Piller Type"
          />
          {errors.piller_type && <div className="text-danger">{errors.piller_type}</div>}
        </div>

        <div className="col-md-2">
          <Select
            name="piller_form"
            value={pillerForm.find((option) => option.value === filterForm.piller_form)}
            onChange={(e) => handleFilterChange(e.value, "piller_form")}
            options={pillerForm}
            placeholder="Select Piller Form"
          />
          {errors.piller_form && <div className="text-danger">{errors.piller_form}</div>}
        </div>
        <div className="col-md-2">
          <input type="date" name="from_date" onChange={(e) => handleFilterChange(e.target.value, "from_date")} id="" className="form-control" value={filterForm.from_date} />
        
        </div>
        <div className="col-md-2">
        <input type="date" name="to_date" onChange={(e) => handleFilterChange(e.target.value, "to_date")} id="" className="form-control" value={filterForm.to_date} />
        
        </div>
        <div className="col-md-1">
          <button className="btn btn-primary" onClick={handleFilterSubmit}>Search</button>
        </div>
      </div>

      <div className="dashboard-map map-container mx-2">
        <div className=" map_left_panel">
          <div
            id="map"
            className="map"
            style={{ height: "100%", width: "100%" }}
          ></div>
          <div id="progress"></div>
          <div id="mouse-position"></div>

          {/* <div id="popup" className="ol-popup">
                <a
                  id="popup-closer"
                  className="ol-popup-closer"
                  style={{ zIndex: "10000", float: "right", width: "100%" }}>
                  <i
                    className="fa fa-times"
                    aria-hidden="true"
                    style={{ float: "right", margin: "5px -54px 4px 0px" }}></i>
                </a>
                <div id="popup-content"></div>
              </div> */}

          <div
            ref={popupElRef}
            className="ol-popup"
            style={{ display: "none" }}
          >
            <div className="ol-popup-content">
              <div class="popup">
                <div class="popup-header d-flex justify-content-between mb-2">
                  <span className="fw-bold text-primary">
                    Visit information
                  </span>
                  <button
                    class="btn btn-sm btn-danger"
                    onClick={() => {
                      if (popupRef.current) {
                        popupRef.current.setPosition(undefined);
                      }
                      return false;
                    }}
                  >
                    <ImCross />
                  </button>
                </div>

                {popupDetails ? (
                  <>
                    <div className="custom-table-section">
                      <div className="tablescroll">
                      <div dangerouslySetInnerHTML={{ __html: popupDetails }} />
                      </div>
                      <div class="popup-content">
                        <div className="w-100"></div>
                      </div>
                      <div class="popup-buttons">
                        {/* <button
                          class="ok-button"
                          onClick={() => {
                            var pname = btoa(popupDetails?.project_name);
                            var id = btoa(popupDetails?.project_id);
                            popupDetails?.project_name &&
                              popupDetails?.project_id &&
                              navigate(
                                `/admin/project-management/acquisition-activity/${pname}/${id}/khasra-number?search=${popupDetails?.tpm_plot_no}`
                              );
                          }}
                        >
                          View
                        </button> */}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center">Data doesn't exists.</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-filter-panel filter-content">
          <div className="card-body py-2"></div>
        </div>

        <div className=" map_right_panel d-none">
          <div className="right-pannel">
            <ul className="menu nav nav-tabs" role="tablist">
              <li className="nav-item">
                <a
                  className="nav-link-m"
                  onClick={() => rightPanel("LayerLegend", !layerLagendState)}
                  title="Layer Legend"
                >
                  <i className="ti ti-map-search"></i>
                </a>
              </li>

              <li className="nav-item">
                <a
                  className="nav-link-m"
                  onClick={() => rightPanel("BaseMap", !baseMapState)}
                  title="Base Map"
                >
                  <i className="ti ti-map"></i>
                </a>
              </li>

              {/* <li className="nav-item">
                    <a
                      className="nav-link-m"
                      onClick={() => rightPanel("Measurement", !measurementState)}
                      title="Measurement">
                      <i className="fas fa-cogs"></i>
                    </a>
                  </li>*/}

              <li className="nav-item">
                <a
                  className="nav-link-m"
                  onClick={() => rightPanel("Filter", !filterState)}
                  title="Filter"
                >
                  <i className="ti ti-search"></i>
                </a>
              </li>
            </ul>
          </div>

          <div
            className="right-collapse-panel "
            style={{
              display:
                layerLagendState ||
                baseMapState ||
                measurementState ||
                filterState ||
                drawCircelState
                  ? "block"
                  : "none",
            }}
          >
            <div className="side-menu mostly-customized-scrollbar">
              <div className="header d-none">
                <i className="fas fa-chevron-left close-side"></i>
              </div>

              <div style={{ display: layerLagendState ? "block" : "none" }}>
                <div className="heading-panel bg-dark text-light">
                  Layer Legend
                </div>

                <div className="panel-content">
                  <div className="layer-section">
                    <ul className="tree">
                      <li className="has">
                        <input
                          type="checkbox"
                          className="layer"
                          onChange={(e) => changeLayerView("bingLayer", e)}
                          defaultChecked={true}
                          value="bingLayer"
                        />

                        <i
                          className="colorpick-btn"
                          style={{
                            backgroundColor: "#ccc",
                            position: "relative",
                            top: "5px",
                            margin: "0 10px",
                          }}
                        ></i>

                        <label>Base Map</label>
                      </li>

                      <li className="has">
                        <input
                          type="checkbox"
                          className="layer"
                          onChange={(e) => changeLayerView("state", e)}
                          defaultChecked={true}
                          value="state"
                        />

                        <i
                          className="colorpick-btn"
                          style={{
                            border: "3px solid #10B447",
                            position: "relative",
                            top: "5px",
                            margin: "0 10px",
                          }}
                        ></i>

                        <label>State</label>
                      </li>

                      <li></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div style={{ display: baseMapState ? "block" : "none" }}>
                <div className="heading-panel bg-dark text-light">Base Map</div>
                <div className="panel-content">
                  <div className="map-view-thumb-section">
                    <div className="map-view-box mb-2">
                      <div className="card mb-3">
                        <div className="card-body p-1">
                          <a
                            className="changeLayerCustom"
                            onClick={(e) => changeLayerLabel("Aerial")}
                            data-id="Aerial"
                          >
                            <img
                              src={aerialView}
                              alt=""
                              className="img-fluid"
                            />
                          </a>
                        </div>
                        <div className="card-footer p-1">Aerial</div>
                      </div>
                    </div>

                    <div className="map-view-box">
                      <div className="card mb-3">
                        <div className="card-body p-1">
                          <a
                            className="changeLayerCustom"
                            onClick={(e) =>
                              changeLayerLabel("AerialWithLabelsOnDemand")
                            }
                            data-id="AerialWithLabelsOnDemand"
                          >
                            <img
                              src={aerialLabelView}
                              alt=""
                              className="img-fluid"
                            />
                          </a>
                        </div>
                        <div className="card-footer p-1">
                          Aerial with Labels
                        </div>
                      </div>
                    </div>

                    <div className="map-view-box">
                      <div className="card mb-3">
                        <div className="card-body p-1">
                          <a
                            className="changeLayerCustom"
                            onClick={(e) => changeLayerLabel("RoadOnDemand")}
                            data-id="RoadOnDemand"
                          >
                            <img
                              src={roadView}
                              alt=""
                              className="img-fluid"
                            />
                          </a>
                        </div>
                        <div className="card-footer p-1">Road</div>
                      </div>
                    </div>

                    <div className="map-view-box">
                      <div className="card mb-3">
                        <div className="card-body p-1">
                          <a
                            className="changeLayerCustom"
                            onClick={(e) => changeLayerLabel("CanvasDark")}
                            data-id="CanvasDark"
                          >
                            <img
                              src={roadDarkView}
                              alt=""
                              className="img-fluid"
                            />
                          </a>
                        </div>
                        <div className="card-footer p-1">Road dark</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: measurementState ? "block" : "none" }}>
                <div className="heading-panel bg-dark text-light">
                  Measurement
                </div>
                <div className="panel-content">
                  <form>
                    <section className="divider">
                      <label className="d-block" htmlFor="measure-type">
                        Measurement type &nbsp;
                      </label>

                      <div>
                        <a
                          className="btn btn-outline-secondary btn-sm measure_area_length"
                          data-name="LineString"
                        >
                          Measure Length
                        </a>
                        <a
                          className="btn btn-outline-secondary btn-sm measure_area_length"
                          data-name="Polygon"
                        >
                          Measure Area
                        </a>
                      </div>
                    </section>

                    <section className="divider mb-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value=""
                          id="segments"
                        />
                        <label className="form-check-label" htmlFor="segments">
                          Show segment lengths
                        </label>
                      </div>
                    </section>

                    <section className="divider mb-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value=""
                          id="clearMeasure"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="clearMeasure"
                        >
                          Clear previous measure
                        </label>
                      </div>
                    </section>

                    <section className="divider mb-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="freehand"
                        />
                        <label className="form-check-label" htmlFor="clear">
                          Freehand Measuring
                        </label>
                      </div>
                    </section>

                    <section className="divider">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="modify"
                        />
                        <label className="form-check-label" htmlFor="clear">
                          Allow Modify
                        </label>
                      </div>
                    </section>

                    <fieldset className="mb-3">
                      <legend> Stroke</legend>
                      <section className="divider">
                        <label className="d-block" htmlFor="strokeColor">
                          Color:&nbsp;
                        </label>
                        <input
                          className="form-control form-control-sm w-50"
                          type="color"
                          onChange={(e) => setColor(e.target.value)}
                          id="strokeColor"
                          name="strokeColor"
                          value={color}
                        />
                      </section>
                      <section className="divider">
                        <label className="d-block" htmlFor="strokeTransparency">
                          Transparency:&nbsp;
                        </label>
                        <input
                          className="w-100"
                          type="range"
                          onChange={(e) => setTransparency(e.target.value)}
                          value={transparency}
                          id="strokeTransparency"
                          name="strokeTransparency"
                          min="0"
                          max="100"
                        />
                      </section>
                      <section className="divider">
                        <label className="d-block" htmlFor="strokeLineDash">
                          Line style:&nbsp;
                        </label>

                        <div className="img-ddl-wrapper">
                          <select className="vodiapicker">
                            <option
                              value="en"
                              className="test"
                              data-thumbnail="{{ asset('assets/img/solid-line.png') }}"
                            ></option>
                            <option
                              value="au"
                              data-thumbnail="{{ asset('assets/img/dashed-line.png') }}"
                            ></option>
                            <option
                              value="uk"
                              data-thumbnail="{{ asset('assets/img/dot-line.png') }}"
                            ></option>
                            <option
                              value="cn"
                              data-thumbnail="{{ asset('assets/img/dashed-dot-line.png') }}"
                            ></option>
                          </select>

                          <div className="lang-select">
                            <button className="btn-select" value=""></button>
                            <div className="b">
                              <ul id="a"></ul>
                            </div>
                          </div>
                        </div>
                      </section>
                      <section className="divider mb-1">
                        <label className="d-block" htmlFor="strokeWidth">
                          Width:&nbsp;
                        </label>
                        <input
                          className="form-control form-control-sm"
                          onChange={(e) => setStrokeWidth(e.target.value)}
                          value={strokeWidth}
                          type="number"
                          id="strokeWidth"
                          name="strokeWidth"
                          min="1"
                          max="5"
                        />
                      </section>
                    </fieldset>

                    <section className="divider">
                      <label className="d-block" htmlFor="measurementUnit">
                        Measurement unit:&nbsp;
                      </label>
                      <select
                        className="form-control form-control-sm"
                        onChange={(e) => setMeasurementUnit(e.target.value)}
                        value={measurementUnit}
                        id="measurementUnit"
                      >
                        <option value="kilometer">Kilometer</option>
                        <option value="meter">Meter</option>
                      </select>
                    </section>

                    <fieldset className="mb-3">
                      <legend> Font Style</legend>
                      <section className="divider">
                        <label className="d-block" htmlFor="fontFamily">
                          Family:&nbsp;
                        </label>
                        <select
                          className="form-control form-control-sm"
                          onChange={(e) => setFontFamily(e.target.value)}
                          value={fontFamily}
                          id="fontFamily"
                        >
                          <option value="Helvetica,sans-serif">
                            Helvetica (sans-serif)
                          </option>
                          <option value="Arial,sans-serif">
                            Arial (sans-serif)
                          </option>
                          <option value="Arial Black,sans-serif">
                            Arial Black (sans-serif)
                          </option>
                          <option value="Verdana,sans-serif">
                            Verdana (sans-serif)
                          </option>
                          <option value="Tahoma,sans-serif">
                            Tahoma (sans-serif)
                          </option>
                          <option value="Trebuchet MS,sans-serif">
                            Trebuchet MS (sans-serif)
                          </option>
                          <option value="Impact,sans-serif">
                            Impact (sans-serif)
                          </option>
                          <option value="Gill Sans,sans-serif">
                            Gill Sans (sans-serif)
                          </option>
                          <option value="Times New Roman,serif">
                            Times New Roman (serif)
                          </option>
                          <option value="Georgia,serif">Georgia (serif)</option>
                          <option value="Palatino,serif">
                            Palatino (serif)
                          </option>
                          <option value="Baskerville,serif">
                            Baskerville (serif)
                          </option>
                          <option value="Andalé Mono,monospace">
                            Andalé Mono (monospace)
                          </option>
                          <option value="Courier,monospace">
                            Courier (monospace)
                          </option>
                          <option value="Lucida,monospace">
                            Lucida (monospace)
                          </option>
                          <option value="Monaco,monospace">
                            Monaco (monospace)
                          </option>
                          <option value="Bradley Hand,cursive">
                            Bradley Hand (cursive)
                          </option>
                          <option value="Brush Script MT,cursive">
                            Brush Script MT (cursive)
                          </option>
                          <option value="Luminari,fantasy">
                            Luminari (fantasy)
                          </option>
                          <option value="Comic Sans MS,cursive">
                            Comic Sans MS (cursive)
                          </option>
                        </select>
                      </section>
                      <section className="divider">
                        <label className="d-block" htmlFor="fontSize">
                          Size:&nbsp;
                        </label>
                        <input
                          className="form-control form-control-sm"
                          onChange={(e) => setFontSize(e.target.value)}
                          value={fontSize}
                          type="number"
                          id="fontSize"
                          name="fontSize"
                          min="10"
                          max="50"
                        />
                      </section>
                      <section className="divider mb-1">
                        <label className="d-block" htmlFor="fontBackground">
                          Background Color:&nbsp;
                        </label>
                        <input
                          className="form-control form-control-sm w-25"
                          onChange={(e) => setFontBackground(e.target.value)}
                          value={fontBackground}
                          type="color"
                          id="fontBackground"
                          name="fontBackground"
                        />
                      </section>
                    </fieldset>
                  </form>
                </div>
              </div>

              <div style={{ display: filterState ? "block" : "none" }}>
                <div className="heading-panel bg-dark text-light">
                  Filter By
                </div>

                <div className=" p-3">
                  <form
                    method="POST"
                    action="{{ route('plots.filter') }}"
                  ></form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {blockMapDetails ? (
        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 mt-4">
          <div className="card mb-0 h-100 project-details-dash">
            <div className="card-header mb-0 py-2">
              <h5 className="mb-0">Project Details</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3">
                  <div
                    className="card border"
                    onMouseEnter={() => setShowPopup(true)}
                    onMouseLeave={() => setShowPopup(false)}
                    style={{ position: "relative" }}
                  >
                    <div className="bg-success mb-0  text-light text-center p-2">
                      <b>Total Project</b>
                    </div>

                    <div className="card-body text-center">
                      <h5>{blockMapDetails.project_list.length} </h5>
                      {/* Popup */}
                      {showPopup && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            backgroundColor: "#fff",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                            padding: "10px",
                            zIndex: 10,
                            width: "200px",
                            maxHeight: "150px",
                            overflowY: "auto",
                          }}
                        >
                          <ul
                            style={{ listStyle: "none", margin: 0, padding: 0 }}
                          >
                            {blockMapDetails.project_list.map(
                              (project, index) => (
                                <li key={index} style={{ marginBottom: "5px" }}>
                                  {project.project}{" "}
                                  {/* Access the property you want to display */}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3">
                  <div className="card mb-0">
                    <div className="bg-info mb-0  text-light text-center p-2">
                      <b>Total Activity</b>
                    </div>
                    <div className="card-body text-center">
                      <h5>
                        {" "}
                        {
                          blockMapDetails.project_village_count
                            .distinct_project_count
                        }
                      </h5>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3">
                  <div className="card mb-0">
                    <div className="bg-primary mb-0  text-light text-center p-2">
                      <b>Total Budget</b>
                    </div>
                    <div className="card-body text-center">
                      <h5> {blockMapDetails.budget.total_budget}</h5>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3">
                  <div className="card mb-0">
                    <div className="bg-dark mb-0  text-light text-center p-2">
                      <b>Total Expences</b>
                    </div>
                    <div className="card-body text-center">
                      <h5>{blockMapDetails.expence.total_expence}</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
