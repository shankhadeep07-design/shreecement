// UnitsDropdown.js
import React, { useState, useEffect, useRef } from "react";
import acquiredarea from "../../assets/images/acquired-area.png";
import NoPlots from "../../assets/images/no-plots.png";
import disputeLand from "../../assets/images/dispute-land.png";
import Employment from "../../assets/images/employment.png";

import Highcharts from "highcharts";
import Highcharts3D from "highcharts/highcharts-3d";
import accessibility from "highcharts/modules/accessibility"; // Import the 3D module

import "../../assets/css/dashboard.css";

import $ from "jquery";
import DashboarShimmer from "../shimmers/DashboardShimmer";

function UnitsDropdown({ permissions }) {
  const [shimmerLoader, setShimmerLoader] = useState(true);
  Highcharts3D(Highcharts);
  accessibility(Highcharts);
  Highcharts.setOptions({
    accessibility: {
      enabled: true,
    },
  });
  return (
    <div className="card dashboard-container-card">
      {shimmerLoader && <DashboarShimmer />}

      <div style={{ display: shimmerLoader ? "none" : "block" }}>
        <div
          className="card-body border bg-light mb-3 py-0"
          style={{ borderRadius: "7px" }}
        >
          <div className="row">
            <div className="col-lg-12">
              <div className="dashboard-heading">
                <h5>Dashboard </h5>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body py-0">
          {!permissions && (
            <div className="text-center">
              You don't have permission to access this module.
            </div>
          )}
          <div className="row">
            <div className="dashboard-container px-0">
              <div className="row pb-2">
                {/* Total Required Area */}
                {(permissions?.indexOf("total_required_area") > -1 ||
                  permissions == "*") && (
                  <div className="col-xl-4 mt-2">
                    <div className="gradient-style1 text-white box-shadow border-radius-10 height-100-p widget-style3">
                      <div className="d-flex flex-wrap align-items-center">
                        <div className="widget-icon">
                          <div className="icon">
                            <img src={acquiredarea} className="w-100" alt="" />
                          </div>
                        </div>
                        <div className="widget-data">
                          <div className="weight-400 font-16">
                            Total Required Area{" "}
                            <small style={{ fontSize: "10px" }}>acre</small>
                          </div>
                          <div className="weight-300 font-30">
                            0.00
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Total Purchased Area */}
                {(permissions?.indexOf("area_purchased") > -1 ||
                  permissions == "*") && (
                  <div className="col-xl-4 mt-2">
                    <div className="gradient-style4 text-white box-shadow border-radius-10 height-100-p widget-style3">
                      <div className="d-flex flex-wrap align-items-center">
                        <div className="widget-icon">
                          <div className="icon">
                            <img src={Employment} className="w-100" alt="" />
                          </div>
                        </div>
                        <div className="widget-data">
                          <div className="weight-400 font-16">
                            Area Purchased {""}
                            <small style={{ fontSize: "10px" }}>acre</small>
                          </div>
                          <div className="weight-300 font-30">
                            0.00
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Total Acquired Areas */}
                {(permissions?.indexOf("area_acquired") > -1 ||
                  permissions == "*") && (
                  <div className="col-xl-4 mt-2">
                    <div className="gradient-style3 text-white box-shadow border-radius-10 height-100-p widget-style3">
                      <div className="d-flex flex-wrap align-items-center">
                        <div className="widget-icon">
                          <div className="icon">
                            <img src={disputeLand} className="w-100" alt="" />
                          </div>
                        </div>
                        <div className="widget-data">
                          <div className="weight-400 font-16">
                            Area Acquired {""}
                            <small style={{ fontSize: "10px" }}>acre</small>
                          </div>
                          <div className="weight-300 font-30">
                            0.00
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Total Area Procured */}
                {(permissions?.indexOf("area_procured") > -1 ||
                  permissions == "*") && (
                  <div className="col-xl-4 mt-2">
                    <div className="gradient-style2 text-white box-shadow border-radius-10 height-100-p widget-style3">
                      <div className="d-flex flex-wrap align-items-center">
                        <div className="widget-icon">
                          <div className="icon">
                            <img src={NoPlots} className="w-100" alt="" />
                          </div>
                        </div>
                        <div className="widget-data">
                          <div className="weight-400 font-16">
                            Area Procured {""}
                            {/* (Purchased + Acquired) */}
                            <small style={{ fontSize: "10px" }}>acre</small>
                          </div>
                          <div className="weight-300 font-30">
                            0.00
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Total alanced Area */}

                {(permissions?.indexOf("balance_area") > -1 ||
                  permissions == "*") && (
                  <div className="col-xl-4 mt-2">
                    <div className="gradient-style2 text-white box-shadow border-radius-10 height-100-p widget-style3">
                      <div className="d-flex flex-wrap align-items-center">
                        <div className="widget-icon">
                          <div className="icon">
                            <img src={NoPlots} className="w-100" alt="" />
                          </div>
                        </div>
                        <div className="widget-data">
                          <div className="weight-400 font-16">
                            Balance Area {""}
                            <small style={{ fontSize: "10px" }}>acre</small>
                          </div>
                          <div className="weight-300 font-30">
                            0.00
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Total Legal Cases */}
                {(permissions?.indexOf("legal_cases") > -1 ||
                  permissions == "*") && (
                  <div className="col-xl-4 mt-2">
                    <div className="gradient-style2 text-white box-shadow border-radius-10 height-100-p widget-style3">
                      <div className="d-flex flex-wrap align-items-center">
                        <div className="widget-icon">
                          <div className="icon">
                            <img src={NoPlots} className="w-100" alt="" />
                          </div>
                        </div>
                        <div className="widget-data">
                          <div className="weight-400 font-16">
                            Legal Cases
                            {/* <small style={{ fontSize: "10px" }}>acre</small> */}
                          </div>
                          <div className="weight-300 font-30">
                            0.00
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnitsDropdown;
