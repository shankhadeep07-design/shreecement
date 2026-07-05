import React, { useState, useRef, useEffect } from "react";
import "ol/ol.css";
import "../map_assets/css/map.css";
import { useSelector, useDispatch } from "react-redux";
import { toggleStaticLayer, toggleWMSLayer } from "../../../redux/slices/GISMapSlice";

export const LayerLegendComponent = () => {
    const GISMapState = useSelector((state) => state.GISMapSlice);
    const dispatch = useDispatch();

    const handleStaticLayersChange = (layer_type) => {
        console.log(layer_type);
        
        dispatch(toggleStaticLayer(layer_type));
    }

    const handleWMSLayersChange = (index) => {
        dispatch(toggleWMSLayer(index));
    }


    return (
        <div>
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
                                value="base_map"
                                checked={GISMapState?.staticLayers?.base_map}
                                onChange={() => handleStaticLayersChange('base_map')}
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

                        {/* <li className="has" style={{ borderBottom: "0" }}>
                            <input
                                type="checkbox"
                                className="layer"
                                value="plot_map"
                                checked={GISMapState?.staticLayers?.plot_map}
                                onChange={() => handleStaticLayersChange('plot_map')}
                            />

                            <i
                                className="colorpick-btn"
                                style={{
                                    border: "3px solid #fe0077",
                                    position: "relative",
                                    top: "5px",
                                    margin: "0 10px",
                                }}
                            ></i>

                            <label>Plot Map</label>
                        </li> */}


                        {
                            GISMapState?.wmsLayers?.map((obj, index) => {
                                return (
                                    <li className="has">
                                        <input
                                            type="checkbox"
                                            className="layer"
                                            value={index}
                                            checked={obj?.visible}
                                            onChange={() => handleWMSLayersChange(index)}
                                        />

                                        <i
                                            className="colorpick-btn"
                                            style={{
                                                border: "3px solid #838383",
                                                position: "relative",
                                                top: "5px",
                                                margin: "0 10px",
                                            }}
                                        ></i>
                                        <label>{obj?.tls_layer_name}</label>
                                    </li>
                                )
                            })
                        }


                    </ul>
                </div>
            </div>
        </div>
    );
};
