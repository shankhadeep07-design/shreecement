import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Map from "ol/Map";
import View from "ol/View";
import { Overlay } from "ol";
import { Vector as VectorSource } from "ol/source";
import { GeoJSON } from "ol/format";
import { getCenter } from "ol/extent";
import { fromLonLat, transform } from "ol/proj";
import "ol/ol.css";
import "./map_assets/css/popup.css";
import "./map_assets/css/map.css";
import "../map/map_assets/css/map.css";
import FullScreen from "ol/control/FullScreen";

import {
  plotMap,
  plotMapNumber,
  tsrDoneLayer,
  getBaseLayers,
  buildWMSLayer
} from "./map_assets/js/Layers";
import { useLoading } from "../../context/LoadingContext";

import Draw from "ol/interaction/Draw";
import { getLength, getArea } from "ol/sphere";

import { LineString, Polygon } from "ol/geom.js";

import { unByKey } from "ol/Observable.js";

import { Circle as CircleStyle, Fill, Text, Stroke, Style } from "ol/style.js";

import { TileWMS } from "ol/source";
import TileLayer from "ol/layer/Tile";

import { useSelector, useDispatch } from "react-redux";

import { LayerLegendComponent } from "./sidebar_components/LayerLegendComponent";
import { BaseMapImagerySetComponent } from "./sidebar_components/BaseMapImagerySetComponent";
import { FilterComponent } from "./sidebar_components/FilterComponent";
import { activeSideBarElement, setWMSLayers, fetchWMSLayers } from "../../redux/slices/GISMapSlice";

export const MapComponent = () => {
  var mapRef = useRef();
  const GISMapState = useSelector((state) => state.GISMapSlice);
  var [map, setMap] = useState(null);
  const dispatch = useDispatch();

  const handleClickOnSideBarElement = (key) => {
    dispatch(activeSideBarElement({ key: key }));
  };

  useEffect(() => {
    const styles = GISMapState?.imagery;
    const extent = GISMapState?.extent;
    const transformedExtent = extent.map((coord, index) => index % 2 === 0 ? fromLonLat([extent[index], extent[index + 1]])[0] : fromLonLat([extent[index - 1], extent[index]])[1]);
    var baseLayers = getBaseLayers(styles);
    var plotMapLayer = plotMap();
    var plotMapNum = plotMapNumber();
    var tsrDone = tsrDoneLayer(GISMapState?.staticLayers?.tsr_done);
    var t_map = new Map({
      target: mapRef.current,
      layers : [...baseLayers, plotMapLayer, plotMapNum, tsrDone],
      view: new View({
        center: fromLonLat(GISMapState?.center),
        zoom: GISMapState?.zoom,
        maxZoom: GISMapState?.maxZoom,
        // extent : transformedExtent
      }),
    });
    dispatch(fetchWMSLayers((response) => {
      response?.data?.map(obj => {
        var layer = buildWMSLayer(obj);
        t_map.addLayer(layer);
      })
    }));
    t_map.addControl(new FullScreen());
    setMap(t_map);
    return () => t_map.setTarget(null);
  }, []);

  useEffect(() => {
    Object.keys(GISMapState?.staticLayers)?.map(name => {
      map?.getLayers()?.getArray()?.map(layer => {
        if(name != 'base_map' && name == layer?.get('name')){
            layer.setVisible(GISMapState?.staticLayers[name]);
        }
      })
    })
  },[GISMapState?.staticLayers])

  useEffect(() => {

    GISMapState?.wmsLayers?.map(obj => {
      map?.getLayers()?.getArray()?.map(layer => {
        if(obj?.tls_table_name == layer?.get('name')){
            layer.setVisible(obj?.visible);
        }
      })
    })
  },[GISMapState?.wmsLayers])

  useEffect(() => {
    GISMapState?.imagery?.map(obj => {
      var layer = getLayerByName(map, obj?.key)
      layer?.setVisible(obj?.visible);
    })
  },[GISMapState?.imagery])

  function getLayerByName(map, layerName) {
    const layers = map?.getLayers()?.getArray();
    return layers?.find(layer => layer?.get('name') === layerName);
  }

  return (
    <div className="App">
      <div className="map-container my-1 mr-2">
        <div className="map_left_panel">
          <div ref={mapRef} id="map" />
          
        </div>
        <div className="map_right_panel">
          <div className="right-pannel">
            <ul className="menu nav nav-pills nav-tabs" role="tablist">
              <li
                className={
                  GISMapState?.sideBarElements?.layer_legend
                    ? "nav-item active"
                    : "nav-item"
                }
              >
                <a
                  className="nav-link-m"
                  title="Layer Legend"
                  onClick={() => {
                    handleClickOnSideBarElement("layer_legend");
                  }}
                >
                  <i className="ti ti-map-search"></i>
                </a>
              </li>

              <li
                className={
                  GISMapState?.sideBarElements?.base_map_imagery
                    ? "nav-item active"
                    : "nav-item"
                }
              >
                <a
                  className="nav-link-m"
                  title="Base Map"
                  onClick={() => {
                    handleClickOnSideBarElement("base_map_imagery");
                  }}
                >
                  <i className="fas fa-chart-pie"></i>
                </a>
              </li>

              {/* <li
                className={
                  GISMapState?.sideBarElements?.measurement
                    ? "nav-item active"
                    : "nav-item"
                }
              >
                <a
                  className="nav-link-m"
                  title="Measurement"
                  onClick={() => {
                    handleClickOnSideBarElement("measurement");
                  }}
                >
                  <i className="fa-solid fa-ruler"></i>
                </a>
              </li> */}

              <li
                className={
                  GISMapState?.sideBarElements?.filter
                    ? "nav-item active"
                    : "nav-item"
                }
              >
                <a
                  className="nav-link-m"
                  title="Filter"
                  onClick={() => {
                    handleClickOnSideBarElement("filter");
                  }}
                >
                  <i className="fa-solid fa-filter-list"></i>
                </a>
              </li>
            </ul>
          </div>

          {(GISMapState?.sideBarElements?.layer_legend ||
            GISMapState?.sideBarElements?.base_map_imagery ||
            GISMapState?.sideBarElements?.filter) && (
            <div className="right-collapse-panel">
              <div className="side-menu mostly-customized-scrollbar">
                <div className="header d-none">
                  <i className="fas fa-chevron-left close-side"></i>
                </div>

                {GISMapState?.sideBarElements?.layer_legend && (
                  <LayerLegendComponent />
                )}

                {GISMapState?.sideBarElements?.base_map_imagery && (
                  <BaseMapImagerySetComponent />
                )}

                {GISMapState?.sideBarElements?.filter && <FilterComponent />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
