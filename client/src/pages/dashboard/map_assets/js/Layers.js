
import { Style, Fill, Stroke, Text,Circle,Icon  } from 'ol/style';
import { Vector as VectorLayer } from 'ol/layer';
import { TileWMS, Vector as VectorSource } from 'ol/source';
import { GeoJSON } from 'ol/format';
import TileLayer from 'ol/layer/Tile';
import point1 from '../img/1.png';
import point2 from '../img/2.png';
import point3 from '../img/3.png';
import point4 from '../img/4.png';
import point5 from '../img/5.png';
import point6 from '../img/6.png';
import point7 from '../img/7.png';
import point8 from '../img/8.png';
import point9 from '../img/9.png';
import point10 from '../img/10.png';
import point11 from '../img/11.png';
import point12 from '../img/12.png';
import point13 from '../img/13.png';
import point14 from '../img/14.png';



var MAP_BASE_URL = import.meta.env.REACT_APP_API_URL;

// var plots_url = MAP_BASE_URL + '/map/plots';
// var format = "image/png";
// export const plots = new TileLayer({
//   visible: true,
//   source: new TileWMS({
//     url: "https://localhost:8080/geoserver/lams_standard/wms",
//     params: {
//       FORMAT: format,
//       VERSION: "1.1.1",
//       tiled: true,
//       STYLES: "",
//       LAYERS: "lams_standard:t_plot_map",
//       exceptions: "application/vnd.ogc.se_inimage",
//       tilesOrigin: 74.35295104980469 + "," + 26.010154724121094,
//     },
//   }),
// });



// var villageLayer_url = MAP_BASE_URL + '/map/villageLayers';
// export const villageLayer = new TileLayer({
//   visible: true,
//   source: new TileWMS({
//     url: "https://localhost:8080/geoserver/lams_standard/wms",
//     params: {
//       FORMAT: format,
//       VERSION: "1.1.1",
//       tiled: true,
//       STYLES: "",
//       LAYERS: "lams_standard:t_villages",
//       exceptions: "application/vnd.ogc.se_inimage",
//       tilesOrigin: 74.35343928157126 + "," + 26.01054684944762,
//     },
//   }),
// });
        

var state_url = MAP_BASE_URL + '/map/state';
export const stateLayer = new VectorLayer({
    name: 'state',
    source: new VectorSource({
        url: state_url,
        format: new GeoJSON({
            defaultDataProjection: 'EPSG:4326',
            projection: 'EPSG:3857'
        })
    }),
    style: function (feature, resolution) {
       
        var style = new Style({
            fill: new Fill({
                color: 'transparent',
            }),
            stroke: new Stroke({
                color: 'yellow',
                width: 2
            }),
            text: new Text({
                fill: new Fill({
                    color: 'white'
                }),
                stroke: new Stroke({
                    color: 'rgba(0, 0, 0, 1)',
                    width: 2
                }),
                font: 'Normal 14px Arial',
                text: feature.get('name')

            })
        });

        return style;
    },
    visible: true
})

var district_url = MAP_BASE_URL + '/map/map_fetch_district/tsl0000000020';
export const newDistrictLayer = new VectorLayer({
    name: 'state',
    source: new VectorSource({
        url: district_url,
        format: new GeoJSON({
            defaultDataProjection: 'EPSG:4326',
            projection: 'EPSG:3857'
        })
    }),
    style: function (feature, resolution) {
       
        var style = new Style({
            fill: new Fill({
                color: 'transparent',
            }),
            stroke: new Stroke({
                color: 'white',
                width: 2.5
            }),
            text: new Text({
                fill: new Fill({
                    color: 'white'
                }),
                stroke: new Stroke({
                    color: 'rgba(0, 0, 0, 1)',
                    width: 2
                }),
                font: 'Normal 14px Arial',
                text: feature.get('name')

            })
        });

        return style;
    },
    visible: true
});


let state_id = 'tsl0000000020';
let district_id = 'tdl0000000021';
let block_id = '';
let village_id = '';
let piller = 'tpsm0000000001';
let piller_type = 'daily';
let piller_form = 'tem0000000046';
let from_date = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
let to_date = new Date().toISOString().split('T')[0];

let points_params = {
    state_id,
    district_id,
    block_id,
    village_id,
    piller,
    piller_type,
    piller_form,
    from_date,
    to_date
};

let filtared_points_url = MAP_BASE_URL + '/map/map_filtered_points?' + new URLSearchParams(points_params).toString();

export const pointsLayer = new VectorLayer({
        name: 'filtared_points',
        source: new VectorSource({
            url: filtared_points_url,
            format: new GeoJSON({
                defaultDataProjection: 'EPSG:4326',
                projection: 'EPSG:3857', // Ensure correct projection for your map
            }),
        }),
        style: function (feature, resolution) {

            var pointImage;
            var theme = feature.get("theme");

            // Conditional check for 'theme'
            if (theme === 'CC') {
                pointImage = point1;  // Replace with your CD-specific icon path
            } else if (theme === 'CD') {
                pointImage = point2;  // Replace with your DD-specific icon path
            }else {
                pointImage = point14;  // Fallback icon path
            }

            var style = new Style({
                // image: new Circle({
                //     radius: 8,
    
                //     fill: new Fill({
                //         color: "rgb(255,255,0)",
                //     }),
    
                //     stroke: new Stroke({
                //         color: "rgb(0,0,0)",
                //         width: 3,
                //     }),
                // }),

                
                image: new Icon({
                    src: pointImage, // Replace with your icon path
                    scale: 0.1, // Adjust the scale as needed
                    anchor: [0.5, 1], // Adjust anchor to position the icon correctly
                }),
                text: new Text({
                    fill: new Fill({
                        color: "white",
                    }),
                    stroke: new Stroke({
                        color: "rgba(0, 0, 0, 1)",
                        width: 2,
                    }),
                    font: "Normal 16px Arial",
                    text: feature.get("twhp_gis_id"),
                    offsetY: 17,
                }),
            });
    
            return style;
        },
        visible: true,
});



export const districtLayer = (district_id) => {

    var district_url = MAP_BASE_URL + '/map/map_fetch_district/' + district_id;

    return new VectorLayer({
        name: 'district',
        source: new VectorSource({
            url: district_url,
            format: new GeoJSON({
                defaultDataProjection: 'EPSG:4326',
                projection: 'EPSG:3857', // Ensure correct projection for your map
            }),
        }),
        style: function (feature, resolution) {
            const featureColor = feature.get('color') || 'rgba(0, 0, 255, 0.6)';  // Fallback color if 'color' is missing
            const featureName = feature.get('name') || 'Unknown';  // Fallback name

            var style = new Style({
                fill: new Fill({
                    color: featureColor,
                }),
                stroke: new Stroke({
                    color: 'black',
                    width: 1,
                }),
                text: new Text({
                    fill: new Fill({
                        color: 'white',
                    }),
                    stroke: new Stroke({
                        color: 'rgba(0, 0, 0, 1)',
                        width: 2,
                    }),
                    font: 'Normal 14px Arial',
                    text: featureName,  // Display feature name
                }),
            });

            return style;
        },
        visible: true,
    });
}

export const filteredPointsLayer = (filters = {}) => {

    // Construct query parameters for filters
    const queryParams = new URLSearchParams(filters).toString();

    // Append filters to the URL
    var filtared_points_url = `${MAP_BASE_URL}/map/map_filtered_points?${queryParams}`;

    return new VectorLayer({
        name: 'filtared_points',
        source: new VectorSource({
            url: filtared_points_url,
            format: new GeoJSON({
                defaultDataProjection: 'EPSG:4326',
                projection: 'EPSG:3857', // Ensure correct projection for your map
            }),
        }),
        style: function (feature, resolution) {

            var pointImage;
            var theme = feature.get("theme");

            // Conditional check for 'theme'
            if (theme === 'CC') {
                pointImage = point1;  // Replace with your CD-specific icon path
            } else if (theme === 'CD') {
                pointImage = point2;  // Replace with your DD-specific icon path
            }else {
                pointImage = point14;  // Fallback icon path
            }

            var style = new Style({
                // image: new Circle({
                //     radius: 8,
    
                //     fill: new Fill({
                //         color: "rgb(255,255,0)",
                //     }),
    
                //     stroke: new Stroke({
                //         color: "rgb(0,0,0)",
                //         width: 3,
                //     }),
                // }),

                
                image: new Icon({
                    src: pointImage, // Replace with your icon path
                    scale: 0.1, // Adjust the scale as needed
                    anchor: [0.5, 1], // Adjust anchor to position the icon correctly
                }),
                text: new Text({
                    fill: new Fill({
                        color: "white",
                    }),
                    stroke: new Stroke({
                        color: "rgba(0, 0, 0, 1)",
                        width: 2,
                    }),
                    font: "Normal 16px Arial",
                    text: feature.get("twhp_gis_id"),
                    offsetY: 17,
                }),
            });
    
            return style;
        },
        visible: true,
    });
}

var visit_health_point_url = MAP_BASE_URL + '/map/visit_yearly_health_points';
export const visitHealthPointLayer = new VectorLayer({
        name: 'visit_health_yearly_point',
        source: new VectorSource({
            url: visit_health_point_url,
            format: new GeoJSON({
                defaultDataProjection: 'EPSG:4326',
                projection: 'EPSG:3857', // Ensure correct projection for your map
            }),
        }),
        style: function (feature, resolution) {

            var pointImage;
            var theme = feature.get("theme");

            // Conditional check for 'theme'
            if (theme === 'CC') {
                pointImage = point1;  // Replace with your CD-specific icon path
            } else if (theme === 'CD') {
                pointImage = point2;  // Replace with your DD-specific icon path
            }else {
                pointImage = point14;  // Fallback icon path
            }

            var style = new Style({
                // image: new Circle({
                //     radius: 8,
    
                //     fill: new Fill({
                //         color: "rgb(255,255,0)",
                //     }),
    
                //     stroke: new Stroke({
                //         color: "rgb(0,0,0)",
                //         width: 3,
                //     }),
                // }),

                
                image: new Icon({
                    src: pointImage, // Replace with your icon path
                    scale: 0.1, // Adjust the scale as needed
                    anchor: [0.5, 1], // Adjust anchor to position the icon correctly
                }),
                text: new Text({
                    fill: new Fill({
                        color: "white",
                    }),
                    stroke: new Stroke({
                        color: "rgba(0, 0, 0, 1)",
                        width: 2,
                    }),
                    font: "Normal 16px Arial",
                    text: feature.get("twhp_gis_id"),
                    offsetY: 17,
                }),
            });
    
            return style;
        },
        visible: true,
});


export const visitPointLayerFun = (district_id,theme_code= null) => {


    if (theme_code === null) {
        var district_url = MAP_BASE_URL + '/map/map_fetch_visit_points/' + district_id;
       
    } else {
        var district_url = MAP_BASE_URL + '/map/map_fetch_visit_points';
    }

    return new VectorLayer({
        name: 'visit_point',
        source: new VectorSource({
            url: district_url,
            format: new GeoJSON({
                defaultDataProjection: 'EPSG:4326',
                projection: 'EPSG:3857', // Ensure correct projection for your map
            }),
        }),
        style: function (feature, resolution) {

            var pointImage;
            var theme = feature.get("theme");

            // Conditional check for 'theme'
            if (theme === 'CC') {
                pointImage = point1;  // Replace with your CD-specific icon path
            } else if (theme === 'CD') {
                pointImage = point2;  // Replace with your DD-specific icon path
            } else if (theme === 'CE') {
                pointImage = point3;  // Replace with your DD-specific icon path
            } else if (theme === 'CF') {
                pointImage = point4;  // Replace with your DD-specific icon path
            } else if (theme === 'CG') {
                pointImage = point5;  // Replace with your DD-specific icon path
            } else if (theme === 'CH') {
                pointImage = point6;  // Replace with your DD-specific icon path
            } else if (theme === 'CI') {
                pointImage = point7;  // Replace with your DD-specific icon path
            } else if (theme === 'CL') {
                pointImage = point8;  // Replace with your DD-specific icon path
            } else if (theme === 'CN') {
                pointImage = point9;  // Replace with your DD-specific icon path
            } else if (theme === 'CO') {
                pointImage = point10;  // Replace with your DD-specific icon path
            } else if (theme === 'CP') {
                pointImage = point11;  // Replace with your DD-specific icon path
            } else if (theme === 'CR') {
                pointImage = point12;  // Replace with your DD-specific icon path
            } else if (theme === 'CS') {
                pointImage = point13;  // Replace with your DD-specific icon path
            } else {
                pointImage = point14;  // Fallback icon path
            }

            var style = new Style({
                // image: new Circle({
                //     radius: 8,
    
                //     fill: new Fill({
                //         color: "rgb(255,255,0)",
                //     }),
    
                //     stroke: new Stroke({
                //         color: "rgb(0,0,0)",
                //         width: 3,
                //     }),
                // }),

                
                image: new Icon({
                    src: pointImage, // Replace with your icon path
                    scale: 0.1, // Adjust the scale as needed
                    anchor: [0.5, 1], // Adjust anchor to position the icon correctly
                }),
                text: new Text({
                    fill: new Fill({
                        color: "white",
                    }),
                    stroke: new Stroke({
                        color: "rgba(0, 0, 0, 1)",
                        width: 2,
                    }),
                    font: "Normal 16px Arial",
                    text: feature.get("twhp_gis_id"),
                    offsetY: 17,
                }),
            });
    
            return style;
        },
        visible: true,
    });
}



var private_land_url = MAP_BASE_URL + '/map/private_land';
export const private_land = new VectorLayer({
    name: 'private_land',
    source: new VectorSource({
        url: private_land_url,
        format: new GeoJSON({
            defaultDataProjection: 'EPSG:4326',
            projection: 'EPSG:3857'
        })
    }),
    style: function (feature, resolution) {
        var style = new Style({
            fill: new Fill({
                color: '#f28f18',
            }),
            stroke: new Stroke({
                color: '#f28f18',
                width: 2
            }),
            text: new Text({
                fill: new Fill({
                    color: 'white'
                }),
                stroke: new Stroke({
                    color: 'rgba(0, 0, 0, 1)',
                    width: 2
                }),
                font: 'Normal 14px Arial',
                text: feature.get('plot_no')

            })
        });
        return style;
    },
    visible: false
})

