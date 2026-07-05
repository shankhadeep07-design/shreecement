import Map from 'ol/Map';
import View from 'ol/View';
import { ScaleLine, OverviewMap, FullScreen, MousePosition } from 'ol/control';
import { defaults } from 'ol/control/defaults';
import { createStringXY, toStringHDMS } from 'ol/coordinate';
import { Style, Fill, Stroke, Text, Circle, RegularShape, Icon } from 'ol/style';
import { Tile as TileLayer, Vector as VectorLayer, Tile } from 'ol/layer';
import { BingMaps, TileWMS, Vector as VectorSource, OSM } from 'ol/source';
import { GeoJSON } from 'ol/format';
import Overlay from 'ol/Overlay';
import { fromLonLat, transform } from 'ol/proj';
import { unByKey } from 'ol/Observable';
import { DragBox, Modify, Draw } from 'ol/interaction';
import { LineString, Point } from 'ol/geom';
import { Circle as GeomCircle } from 'ol/geom';
import { boundingExtent } from 'ol/extent';
import { Feature } from 'ol';

import { privateAxios } from "../../../../Services/Helper";

import $ from 'jquery';
// import { map } from './MyMap';

import { plots, villageLayer, govt_land, private_land, purchased_land, not_purchased_land, partially_purchased_land } from '../js/Layers';

var scaleBarOptionsContainer = document.getElementById('scaleBarOptions');
var unitsSelect = document.getElementById('units');
var typeSelect = document.getElementById('type');
var stepsRange = document.getElementById('steps');
var scaleTextCheckbox = document.getElementById('showScaleText');
var invertColorsCheckbox = document.getElementById('invertColors');
var container = document.getElementById('popup');

var closer = document.getElementById('popup-closer');

var control;
var xoomOut;
var xoomIn;

export var bingLayer = new TileLayer({
    name: 'bingLayer',
    preload: Infinity,
    visible: true,
    source: new BingMaps({
        key: 'AnObC3Et-5WiYvAPWJDzRcz7bZQxW9aJCbwc1M2d063x9tf0UCasetzWGLAnxpMs',
        imagerySet: 'AerialWithLabels'
    })
});


var plotTooltip = new Overlay( /** @type {olx.OverlayOptions} */({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
}));

var scaleLineControl = new ScaleLine();
var overviewControl = new OverviewMap();
var fullscreenControl = new FullScreen();
var mousePositionControl = new MousePosition({
    coordinateFormat: createStringXY(6),
    projection: 'EPSG:4326',
    // comment the following two lines to have the mouse position
    // be placed within the map.
    className: 'custom-mouse-position',
    target: document.getElementById('mouse-position'),
    undefinedHTML: '&nbsp;'
});

export var plotselect = new VectorLayer({
    name: 'plotselect',
    style: function (feature, resolution) {
        var style = new Style({
            fill: new Fill({
                color: 'transparent',
            }),
            stroke: new Stroke({
                color: 'blue',
                width: 3
            })
        });
        return style;
    },
    visible: true
});




export function init() {
    var newLocation = fromLonLat([75.848897,18.789591]);
    var map = new Map({
        controls: defaults({
            attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                collapsible: false
            })
        }).extend([
            mousePositionControl, fullscreenControl
        ]),
        overlays: [plotTooltip],
        layers: [
          
            bingLayer, villageLayer, plots, plotselect, govt_land, private_land, purchased_land, not_purchased_land, partially_purchased_land,
        ],
        target: 'map',
        view: new View({
          
            center: newLocation,
            zoom: 17,
            maxZoom: 19,
        })
    })

    var popup = new Overlay({
        element: document.getElementById('popup')
    });
    map.addOverlay(popup);
     map.addOverlay(plotTooltip);
    map.on('singleclick', function (evt) {
        alert("single click")
        var content = document.getElementById('popup-content');
        if (content != null) {

            var data_state = content.getAttribute('data-state');
            var data_state = false;
            if (data_state == false) {
                var coordinate = evt.coordinate;
            
                var hdms = toStringHDMS(transform(coordinate, 'EPSG:3857', 'EPSG:4326'));
                var coordinate2 = transform(coordinate, 'EPSG:3857', 'EPSG:4326');

                
                var obj = {
                    coordinate: coordinate2
                }       

                
                    var container = document.getElementById('popup');
                    var plotTooltip = new Overlay( /** @type {olx.OverlayOptions} */({
                        element: container,
                        autoPan: true,
                        autoPanAnimation: {
                            duration: 250
                        }
                    }));

                privateAxios.post('map/map_fetch_popover', obj).then((response) => {
                    console.log(response.data.data);
                    console.log('container', container);

                    $('#popup').show();
                    content.innerHTML = response.data.data;
                   
                   
                console.log('tool', plotTooltip);
                plotTooltip.setPosition(coordinate);
                popup.setPosition(coordinate);

                });
            }
        }
    });

    $('#popup-closer').on('click', () => {
        plotTooltip.setPosition(undefined);
        $('#popup-closer').blur();
        $('#popup').hide();
        return false;
    });



    // ---------------------------------------  Measurement ----------------------------------

   
    var showSegments = document.getElementById('segments');
    var clearPrevious = document.getElementById('clearMeasure');
    var measurementUnit = document.getElementById('measurementUnit');
    var free = document.getElementById("freehand");
    var modifyMeasure = document.getElementById("modify");

    var strokeColor = 'rgba(0, 255, 0, 0.5)';
    var strokeTransparency = 1;
    var strokeLineDash = [10, 5];
    var strokeWidth = 2;

    var drawType;

    var fontFamily = 'Helvetica(sans - serif)';
    var fontSize = 16;
    var fontBackground = 'rgba(0, 0, 0, 1)';

    var measuredValue = 0;
    var strokeSl = 1;

    var mlengthsrc = new VectorSource({ wrapX: false });
    var mareasrc = new VectorSource({ wrapX: false });

    function hexToRgb(str) {
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/ig.test(str)) {
            var hex = str.substr(1);
            hex = hex.length == 3 ? hex.replace(/(.)/g, '$1$1') : hex;
            var rgb = parseInt(hex, 16);
            return [(rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255].join(',');
        }
        return false;
    }

    var style = new Style({
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new Stroke({
            color: strokeColor,
            lineDash: strokeLineDash,
            width: strokeWidth,
        }),
        image: new Circle({
            radius: 5,
            stroke: new Stroke({
                color: strokeColor,
            }),
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.2)',
            }),
        }),
    });

    var labelStyle = new Style({
        text: new Text({
            font: '20px Calibri,sans-serif',
            fill: new Fill({
                color: 'rgba(255, 255, 255, 1)',
            }),
            backgroundFill: new Fill({
                color: 'rgba(0, 255, 0, 0.7)',
            }),
            padding: [3, 3, 3, 3],
            textBaseline: 'bottom',
            offsetY: -15,
        }),
        image: new RegularShape({
            radius: 8,
            points: 3,
            angle: Math.PI,
            displacement: [0, 10],
            fill: new Fill({
                color: 'rgba(0, 0, 0, 0.7)',
            }),
        }),
    });

    var tipStyle = new Style({
        text: new Text({
            font: '12px Calibri,sans-serif',
            fill: new Fill({
                color: 'rgba(255, 255, 255, 1)',
            }),
            backgroundFill: new Fill({
                color: 'rgba(0, 0, 0, 0.4)',
            }),
            padding: [2, 2, 2, 2],
            textAlign: 'left',
            offsetX: 15,
        }),
    });

    var modifyStyle = new Style({
        image: new Circle({
            radius: 5,
            stroke: new Stroke({
                color: 'rgba(0, 255, 0, 0.7)',
            }),
            fill: new Fill({
                color: 'rgba(0, 0, 0, 0.4)',
            }),
        }),
        text: new Text({
            text: 'Drag to modify',
            font: '12px Calibri,sans-serif',
            fill: new Fill({
                color: 'rgba(255, 255, 255, 1)',
            }),
            backgroundFill: new Fill({
                color: 'rgba(0, 0, 0, 0.7)',
            }),
            padding: [2, 2, 2, 2],
            textAlign: 'left',
            offsetX: 15,
        }),
    });

    var segmentStyle = new Style({
        text: new Text({
            font: '12px Calibri,sans-serif',
            fill: new Fill({
                color: 'rgba(255, 255, 255, 1)',
            }),
            backgroundFill: new Fill({
                color: 'rgba(0, 0, 0, 0.4)',
            }),
            padding: [2, 2, 2, 2],
            textBaseline: 'bottom',
            offsetY: -12,
        }),
        image: new RegularShape({
            radius: 6,
            points: 3,
            angle: Math.PI,
            displacement: [0, 8],
            fill: new Fill({
                color: 'rgba(0, 0, 0, 0.4)',
            }),
        }),
    });

    function refreshStyle() {
        strokeColor = hexToRgb(document.getElementById('strokeColor').value);
        strokeTransparency = (100 - parseFloat(document.getElementById('strokeTransparency').value)) / 100;
        var strokeLineDash_value = '0,0'; //document.getElementById('strokeLineDash').value;
        if (strokeLineDash_value == '0,0') strokeLineDash = [0, 0];
        if (strokeLineDash_value == '10,10') strokeLineDash = [10, 10];
        if (strokeLineDash_value == '10,15') strokeLineDash = [10, 15];
        strokeWidth = document.getElementById('strokeWidth').value;
        fontFamily = document.getElementById('fontFamily').value;
        fontSize = document.getElementById('fontSize').value;
        fontBackground = document.getElementById('fontBackground').value;

        style = new Style({
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.2)',
            }),
            stroke: new Stroke({
                color: 'rgba(' + strokeColor + ', ' + strokeTransparency + ')',
                lineDash: strokeLineDash,
                width: strokeWidth,
            }),
            image: new Circle({
                radius: 5,
                stroke: new Stroke({
                    color: strokeColor,
                }),
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 0.2)',
                }),
            }),
        });

        labelStyle = new Style({
            text: new Text({
                font: fontSize + 'px ' + fontFamily,
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 1)',
                }),
                backgroundFill: new Fill({
                    color: fontBackground,
                }),
                padding: [3, 3, 3, 3],
                textBaseline: 'bottom',
                offsetY: -15,
            }),
            image: new RegularShape({
                radius: 8,
                points: 3,
                angle: Math.PI,
                displacement: [0, 10],
                fill: new Fill({
                    // color: 'rgba(0, 0, 0, 0.7)',
                    color: fontBackground,
                }),
            }),
        });
    }

    var segmentStyles = [segmentStyle];

    var formatLength = function (line) {
        var length = line.getLength();
        let output;
        if (measurementUnit.value == 'kilometer') {
            output = Math.round((length / 1000) * 100) / 100 + ' km';
        } else if (measurementUnit.value == 'meter') {
            output = Math.round(length * 100) / 100 + ' m';
        }
        else if (measurementUnit.value == 'squarefoot') {
            output = Math.round((length * 0.09290304) * 100) / 100 + ' ft';
        }
        return output;
    };

    var formatArea = function (polygon) {
        var area = polygon.getArea();
        console.log(area);
        let output;
        if (area > 10000) {
            output = Math.round((area / 1000000) * 100) / 100 + ' km\xB2';
        } else {
            
            output = Math.round((area * 0.09290304) * 100) / 100 + ' ft\xB2';
        }
        return output;
    };

    var raster = new Tile({
        source: new OSM()
    });

    var source = new VectorSource();

    var modify = new Modify({ source: source, style: modifyStyle });

    var tipPoint;

    function styleFunction(feature, segments, drawType, tip) {
        var styles = [style];
        var geometry = feature.getGeometry();
        var type = geometry.getType();
        var point, label, line;
        if (!drawType || drawType === type) {
            if (type === 'Polygon') {
                point = geometry.getInteriorPoint();
                label = formatArea(geometry);
                line = new LineString(geometry.getCoordinates()[0]);
            } else if (type === 'LineString') {
                point = new Point(geometry.getLastCoordinate());
                label = formatLength(geometry);
                line = geometry;
            }
        }
        if (segments && line) {
            var count = 0;
            line.forEachSegment(function (a, b) {
                var segment = new LineString([a, b]);
                var label = formatLength(segment);
                if (segmentStyles.length - 1 < count) {
                    segmentStyles.push(segmentStyle.clone());
                }
                var segmentPoint = new Point(segment.getCoordinateAt(0.5));
                segmentStyles[count].setGeometry(segmentPoint);
                segmentStyles[count].getText().setText(label);
                styles.push(segmentStyles[count]);
                count++;
            });
        }
        if (label) {
            labelStyle.setGeometry(point);
            labelStyle.getText().setText(label);
            styles.push(labelStyle);

            measuredValue = label;
        }
        if (
            tip &&
            type === 'Point' &&
            !modify.getOverlay().getSource().getFeatures().length
        ) {
            tipPoint = geometry;
            tipStyle.getText().setText(tip);
            styles.push(tipStyle);
        }
        return styles;
    }

    var vector = new VectorLayer({
        source: source,
        style: function (feature) {
            return styleFunction(feature, showSegments.checked);
        },
    });

    map.addLayer(vector);
    map.addInteraction(modify);

    var draw; // global so we can remove it later

    $('.measure_area_length').on('click', function () {

        drawType = $(this).attr("data-name");
        addInteraction1(drawType)
    })

    function addInteraction1(measureType) {
        drawType = measureType;
        map.removeInteraction(draw);
        var freeType = free.checked ? true : false;
        var activeTip =
            'Click to continue drawing the ' +
            (drawType === 'Polygon' ? 'polygon' : 'line');
        var idleTip = 'Click to start measuring';
        var tip = idleTip;
        draw = new Draw({
            source: source,
            type: drawType,
            freehand: freeType,
            style: function (feature) {
                return styleFunction(feature, showSegments.checked, drawType, tip);
            },
        });
        draw.on('drawstart', function () {
            refreshStyle();
            if (clearPrevious.checked) {
                source.clear();
            }
            modify.setActive(false);
            tip = activeTip;
        });
        draw.on('drawend', function () {
            modifyStyle.setGeometry(tipPoint);
            if (modifyMeasure.checked) {
                modify.setActive(true);
            }
            map.once('pointermove', function () {
                modifyStyle.setGeometry();
            });
            tip = idleTip;

            console.log(tipPoint)
           
            $('#measured_value').append("<tr><td>" + strokeSl + "</td>" + "<td>" + measuredValue + "</td></tr>");
            strokeSl++;
        });

        if (modifyMeasure.checked) {
            modify.setActive(true);
        } else {
            modify.setActive(false);
        }
        map.addInteraction(draw);
    }

   
    free.onchange = function () {
        if (free.checked) {
            showSegments.disabled = true;
            showSegments.checked = false;
            modifyMeasure.disabled = true;
            modifyMeasure.checked = false;
        } else {
            showSegments.disabled = false;
            modifyMeasure.disabled = false;
        }

        if (draw != undefined) {
            map.removeInteraction(draw);
            addInteraction1(drawType);
        }


    };

    modifyMeasure.onchange = function () {

        if (draw != undefined) {
            map.removeInteraction(draw);
            addInteraction1(drawType);
        }


    };

    showSegments.onchange = function () {
        vector.changed();

        console.log(draw);

        if (draw != undefined) {
            draw.getOverlay().changed();
        }


    };

    function removeTip(id) {
        helpMsg = '';
        var i = 0;
        map.getOverlays().getArray().slice(0).forEach(function (overlay) {
            i = overlay.get('id');
            if (id == 'all' || id == i)
                map.removeOverlay(overlay);
        });
    }

    var helpMsg = '';
    var helpTooltip = '';

    function createHelpTooltip(helpTooltipElement) {
        if (helpTooltipElement) {
           
            helpTooltipElement.parentNode.removeChild(helpTooltipElement);
        }
        helpTooltipElement = document.createElement('div');
        helpTooltipElement.className = 'measuretip';
        helpTooltip = new Overlay({
            element: helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left'
        });
        map.addOverlay(helpTooltip);
        if (helpMsg)
            helpTooltipElement.style.display = '';
        else
            helpTooltipElement.style.display = 'none';
    }
    var measureTooltipElement = '';
    function createMeasureTooltip() {
        if (measureTooltipElement) {
            measureTooltipElement.parentNode.removeChild(measureTooltipElement);
        }
        measureTooltipElement = document.createElement('div');
        measureTooltipElement.className = 'measuretip tooltip-measure';
        var measureTooltip = new Overlay({
            element: measureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center'
        });
        map.addOverlay(measureTooltip);
    }

    $('#clearMeasure').on('click', function () {
        map.removeInteraction(draw);
        removeTip('all');
        mareasrc.clear();
        mlengthsrc.clear();
        var cnt = 1;

    })






    // --------------------------------------- End Measurement --------------------------------


    // --------------------------------------- Draw Circel -------------------------------------

    var coordinates;
    var circleRadius;
    var isCircleDrawingActive;

    const el_drawCircleCheckBox = document.getElementById('drawCircleCheckBox');
  
    const el_drawCircle = document.getElementById('drawCircle');

    el_drawCircleCheckBox.onchange = function (event) {
        if (this.checked == true) {
            isCircleDrawingActive = true;
            el_drawCircle.removeAttribute("disabled");
        } else {
            isCircleDrawingActive = false;
            el_drawCircle.setAttribute("disabled", "disabled");

            removeLayer('circleLayer');
            removeLayer('markerLayer');
        }
    }

   

    el_drawCircle.onchange = function (event) {
        circleRadius = this.value * 100;

        if (coordinates === undefined) {
            el_drawCircle.setAttribute("disabled", "disabled");
        } else {
            drawCircleInMeter(map, coordinates, circleRadius);
        }
    };


    map.on('click', function (evt) {
        if (!isCircleDrawingActive) {
            return;
        }

        coordinates = transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');

        el_drawCircle.removeAttribute("disabled");

        if (circleRadius === undefined) {
            drawCircleInMeter(map, coordinates, el_drawCircle.value * 100);
        } else {
            drawCircleInMeter(map, coordinates, circleRadius);
        }
    });

    function zoomToLayerExtent(lyr) {
      
        var layer;
        var layers = map.getLayers();
        var length = layers.getLength();
        for (var i = 0; i < length; i++) {
            if (lyr === layers.item(i).get('name')) {
                var extent = layers.item(i).getSource().getExtent();
                if (extent[0] != 'Infinity') {
                    //map.beforeRender(pan);	
                    map.getView().fit(extent, map.getSize(), {
                        padding: [20, 20, 20, 20],
                        constrainResolution: false
                    });
                    return;
                }
            }
        }
    }

    var drawCircleInMeter = function (map, latlong, radius) {
        var lat = latlong[0];
        var lng = latlong[1];

        var center = [lat, lng];
        center = transform(center, 'EPSG:4326', 'EPSG:3857');
        var view = map.getView();
        var projection = view.getProjection();
        var resolutionAtEquator = view.getResolution();
       

        var circle = new GeomCircle(center, radius);
        var circleFeature = new Feature(circle);
        // Source and vector layer

        var circleSource = new VectorSource({
            projection: 'EPSG:4326'
        });
        circleSource.addFeature(circleFeature);
        var circleLayer = new VectorLayer({
            name: 'circleLayer',
            source: circleSource,
            style: function (feature, resolution) {
                var style = new Style({
                    fill: new Fill({
                        color: 'rgba(100, 20, 0, 0.2)',
                    }),
                    stroke: new Stroke({
                        color: '#ff3300',
                        width: 3
                    })
                });
                return style;
            }
        });
        removeLayer('circleLayer');
        map.addLayer(circleLayer);

        var markerGeometry = new Point(center);
        var markerFeature = new Feature({
            geometry: markerGeometry
        });

        var markerStyle = new Icon(({
            src: 'https://icons-for-free.com/iconfiles/png/32/map+marker+navigation+pin+icon-1320196420884154895.png'
        }));

        markerFeature.setStyle(new Style({
            image: markerStyle,
        }));

        var vectorSource = new VectorSource({
            features: [markerFeature]
        });

        var markerLayer = new VectorLayer({
            name: 'markerLayer',
            visible: true,
            source: vectorSource
        });
        removeLayer('markerLayer');
        map.addLayer(markerLayer);

        zoomToLayerExtent('circleLayer');
    }

    function removeLayer(lyr) {
        var layers = map.getLayers();
        var length = layers.getLength();
        for (var i = 0; i < length; i++) {
            if (lyr === layers.item(i).get('name')) {
                map.removeLayer(layers.item(i));
                break;
            }
        }
    }

    // --------------------------------------- End  Draw Circel  --------------------------------


    return map;

}

