import { useEffect } from "react";
import { Style, Fill, Stroke, Text, Circle as CircleStyle } from "ol/style";
import { Vector as VectorLayer } from "ol/layer";
import { TileWMS, Vector as VectorSource, BingMaps } from "ol/source";
import { GeoJSON } from "ol/format";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";

import Circle from "ol/geom/Circle.js";
import Feature from "ol/Feature.js";
import { useSelector } from "react-redux";

var MAP_BASE_URL = import.meta.env.VITE_APP_MAP_BASE_LAYER;
var format = "image/png";

const bingApiKey = import.meta.env.VITE_APP_BING_MAP_API_KEY;

// export const getBaseLayers = (styles) => {
//   return styles?.map((obj, index) => {
//     return new TileLayer({
//       visible: obj?.visible,
//       preload: Infinity,
//       name: obj?.key,
//       source: new BingMaps({
//         key: bingApiKey,
//         imagerySet: obj?.value,
//         placeholderTiles: false,
//       }),
//     });
//   });
// };

export const getBaseLayers = (styles) => {
  return styles?.map((obj) => {
    return new TileLayer({
      visible: obj?.visible ?? true,
      preload: Infinity,
      title: obj?.key,     // similar to "title"
      name: obj?.key,      // keep if you're using it elsewhere
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        attributions: "Tiles © Esri",
        maxZoom: 18,
      }),
    });
  });
};

export const buildWMSLayer = (obj) => {
  return new TileLayer({
    visible: false,
    name: `${obj?.tls_table_name}`,
    source: new TileWMS({
      url: `${MAP_BASE_URL}`,
      params: {
        FORMAT: format,
        VERSION: "1.1.1",
        tiled: true,
        STYLES: "",
        LAYERS: `${import.meta.env.VITE_APP_GEOSERVER_WORKSPACE_NAME}:${obj?.tls_table_name}`,
        exceptions: "application/vnd.ogc.se_inimage",
        tilesOrigin: 74.35343928157126 + "," + 26.01054684944762,
      },
    }),
  });
};
// export const vectorLayer = new VectorLayer({
//   name: "plot_map",
//   source: new VectorSource({
//     format: new GeoJSON(),
//     url: `${import.meta.env.VITE_APP_API_URL}/map/plots`,
//   }),
//   style: function (feature, resolution) {
//     var style = new Style({
//       fill: new Fill({
//         color: "#02EF99",
//       }),
//       stroke: new Stroke({
//         color: "rgba(128,128,128,0.1)",
//         width: 2,
//       }),
//       text: new Text({
//         fill: new Fill({
//           color: "white",
//         }),
//         stroke: new Stroke({
//           color: "rgba(0, 0, 0, 1)",
//           width: 2,
//         }),
//         //font : 'Normal 14px Arial',
//         text: feature.get("plot_no"),
//       }),
//     });
//     //if(map.getView().getZoom() > 10){
//     return style;
//     //}
//   },
// });

export const plotMap = () => {
  return new TileLayer({
    visible: true,
    name: "plot_map",
    source: new TileWMS({
      url: `${MAP_BASE_URL}`,
      params: {
        FORMAT: format,
        VERSION: "1.1.1",
        tiled: true,
        STYLES: "",
        LAYERS: `${import.meta.env.VITE_APP_GEOSERVER_WORKSPACE_NAME}:t_plot_map`,
        exceptions: "application/vnd.ogc.se_inimage",
        tilesOrigin: 76.11380004882812 + "," + 15.493141174316406,
      },
    }),
  });
};

export const plotMapNumber = () => {
  return new TileLayer({
    visible: true,
    name: "plot_map",
    source: new TileWMS({
      url: `${MAP_BASE_URL}`,
      params: {
        FORMAT: format,
        VERSION: "1.1.1",
        tiled: true,
        STYLES: "",
        LAYERS: `${import.meta.env.VITE_APP_GEOSERVER_WORKSPACE_NAME}:t_plot_map_number`,
        exceptions: "application/vnd.ogc.se_inimage",
        tilesOrigin: 76.11380004882812 + "," + 15.493141174316406,
      },
    }),
  });
};

export const tsrDoneLayer = (visiBleStatus) => {
  return new TileLayer({
    visible: visiBleStatus || false,
    name: "tsr_done",
    source: new TileWMS({
      url: `${MAP_BASE_URL}`,
      params: {
        FORMAT: format,
        VERSION: "1.1.1",
        tiled: true,
        STYLES: "",
        LAYERS: `${import.meta.env.VITE_APP_GEOSERVER_WORKSPACE_NAME}:t_plot_map_tsr_done`,
        exceptions: "application/vnd.ogc.se_inimage",
        tilesOrigin: 76.11380004882812 + "," + 15.493141174316406,
      },
    }),
  });
};
