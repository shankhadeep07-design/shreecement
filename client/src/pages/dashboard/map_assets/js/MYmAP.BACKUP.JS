import { Style, Fill, Stroke, Text } from "ol/style";
import { Vector as VectorLayer } from "ol/layer";
import { TileWMS, Vector as VectorSource } from "ol/source";
import { GeoJSON } from "ol/format";
import TileLayer from "ol/layer/Tile";

var MAP_BASE_URL = process.env.REACT_APP_API_URL;

var plots_url = MAP_BASE_URL + "/map/plots";
var format = "image/png";
export const plots = new TileLayer({
  visible: true,
  source: new TileWMS({
    url: "https://lams.shreecement.com/geoserver/shree_cement/wms",
    params: {
      FORMAT: format,
      VERSION: "1.1.1",
      tiled: true,
      STYLES: "",
      LAYERS: "shree_cement:t_plot_map",
      exceptions: "application/vnd.ogc.se_inimage",
      tilesOrigin: 74.35295104980469 + "," + 26.010154724121094,
    },
  }),
});

var villageLayer_url = MAP_BASE_URL + "/map/villageLayers";
export const villageLayer = new TileLayer({
  visible: true,
  source: new TileWMS({
    url: "https://lams.shreecement.com/geoserver/shree_cement/wms",
    params: {
      FORMAT: format,
      VERSION: "1.1.1",
      tiled: true,
      STYLES: "",
      LAYERS: "shree_cement:t_villages",
      exceptions: "application/vnd.ogc.se_inimage",
      tilesOrigin: 74.35343928157126 + "," + 26.01054684944762,
    },
  }),
});

var govt_land_url = MAP_BASE_URL + "/map/govt_land";
export const govt_land = new VectorLayer({
  name: "govt_land",
  source: new VectorSource({
    url: govt_land_url,
    format: new GeoJSON({
      defaultDataProjection: "EPSG:4326",
      projection: "EPSG:3857",
    }),
  }),
  style: function (feature, resolution) {
    var style = new Style({
      fill: new Fill({
        color: "#FC57FF",
      }),
      stroke: new Stroke({
        color: "#FC57FF",
        width: 2,
      }),
      text: new Text({
        fill: new Fill({
          color: "white",
        }),
        stroke: new Stroke({
          color: "rgba(0, 0, 0, 1)",
          width: 2,
        }),
        font: "Normal 14px Arial",
        text: feature.get("plot_no"),
      }),
    });
    return style;
  },
  visible: false,
});

var private_land_url = MAP_BASE_URL + "/map/private_land";
export const private_land = new VectorLayer({
  name: "private_land",
  source: new VectorSource({
    url: private_land_url,
    format: new GeoJSON({
      defaultDataProjection: "EPSG:4326",
      projection: "EPSG:3857",
    }),
  }),
  style: function (feature, resolution) {
    var style = new Style({
      fill: new Fill({
        color: "#f28f18",
      }),
      stroke: new Stroke({
        color: "#f28f18",
        width: 2,
      }),
      text: new Text({
        fill: new Fill({
          color: "white",
        }),
        stroke: new Stroke({
          color: "rgba(0, 0, 0, 1)",
          width: 2,
        }),
        font: "Normal 14px Arial",
        text: feature.get("plot_no"),
      }),
    });
    return style;
  },
  visible: false,
});

var purchased_land_url = MAP_BASE_URL + "/map/purchased_land";
export const purchased_land = new VectorLayer({
  name: "purchased_land",
  source: new VectorSource({
    url: purchased_land_url,
    format: new GeoJSON({
      defaultDataProjection: "EPSG:4326",
      projection: "EPSG:3857",
    }),
  }),
  style: function (feature, resolution) {
    var style = new Style({
      fill: new Fill({
        color: "rgba(18, 218, 15, 0.7)",
      }),
      stroke: new Stroke({
        color: "rgba(18, 218, 15, 1)",
        width: 2,
      }),
      text: new Text({
        fill: new Fill({
          color: "white",
        }),
        stroke: new Stroke({
          color: "rgba(0, 0, 0, 1)",
          width: 2,
        }),
        font: "Normal 14px Arial",
        text: feature.get("plot_no"),
      }),
    });
    return style;
  },
  visible: false,
});

var not_purchased_land_url = MAP_BASE_URL + "/map/not_purchased_land";
export const not_purchased_land = new VectorLayer({
  name: "not_purchased_land",
  source: new VectorSource({
    url: not_purchased_land_url,
    format: new GeoJSON({
      defaultDataProjection: "EPSG:4326",
      projection: "EPSG:3857",
    }),
  }),
  style: function (feature, resolution) {
    var style = new Style({
      fill: new Fill({
        color: "rgba(0, 100, 0, 0.9)",
      }),
      stroke: new Stroke({
        color: "rgba(0, 100, 0, 1)",
        width: 2,
      }),
      text: new Text({
        fill: new Fill({
          color: "white",
        }),
        stroke: new Stroke({
          color: "rgba(0, 0, 0, 1)",
          width: 2,
        }),
        font: "Normal 14px Arial",
        text: feature.get("plot_no"),
      }),
    });
    return style;
  },
  visible: false,
});

var partially_purchased_land_url =
  MAP_BASE_URL + "/map/partially_purchased_land";
export const partially_purchased_land = new VectorLayer({
  name: "partially_purchased_land",
  source: new VectorSource({
    url: partially_purchased_land_url,
    format: new GeoJSON({
      defaultDataProjection: "EPSG:4326",
      projection: "EPSG:3857",
    }),
  }),
  style: function (feature, resolution) {
    var style = new Style({
      fill: new Fill({
        color: "rgba(0, 191, 177, 0.7)",
      }),
      stroke: new Stroke({
        color: "rgba(0, 191, 177, 1)",
        width: 2,
      }),
      text: new Text({
        fill: new Fill({
          color: "white",
        }),
        stroke: new Stroke({
          color: "rgba(0, 0, 0, 1)",
          width: 2,
        }),
        font: "Normal 14px Arial",
        text: feature.get("plot_no"),
      }),
    });
    return style;
  },
  visible: false,
});
