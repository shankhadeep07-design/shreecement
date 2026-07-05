import React, { useState, useRef, useEffect } from "react";
import "ol/ol.css";
import "../map_assets/css/map.css";
import { useSelector, useDispatch } from "react-redux";
import { toggleImagery } from "../../../redux/slices/GISMapSlice";

export const BaseMapImagerySetComponent = () => {
    const GISMapState = useSelector((state) => state.GISMapSlice);
    const dispatch = useDispatch();
    const handleImageryChange = (imagery) => {
        if(imagery){
            dispatch(toggleImagery(imagery));
        }
    }
    return (
        <div
            style={{
                height: "100%",
                overflowY: "auto",
            }}
        >
            <div className="heading-panel bg-dark text-light">Base Map</div>
            <div className="panel-content">
                <div className="map-view-thumb-section">
                    {
                        GISMapState?.imagery?.map(obj => {
                            return (
                                <div className="map-view-box mb-2">
                                    <div className="card mb-3">
                                        <div className="card-body p-1">
                                            <a
                                                className="changeLayerCustom"
                                                data-id={obj?.value}
                                                onClick={() => handleImageryChange(obj?.value)}
                                            >
                                                <img
                                                    src={obj?.image}
                                                    alt={obj?.value}
                                                    className="img-fluid"
                                                />
                                            </a>
                                        </div>
                                        <div className="card-footer p-1">{obj?.value}</div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    );
};
