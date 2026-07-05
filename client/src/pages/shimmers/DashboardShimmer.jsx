import React from "react";
import { ShimmerTable, ShimmerSectionHeader, ShimmerButton, ShimmerThumbnail } from "react-shimmer-effects";

function DashboarShimmer(){
    return (
        <>
            <div className="mt-3">
                <div className="px-3 mb-3">
                    <div className="mx-1 shimmer-animation shimmer-span rounded-pill"></div>
                </div>
                <div className="row px-3">
                    <div className="col-md-12">
                        <div className="dashboard-filter-search-container">
                            <div className="filter-search">
                                <div></div>
                                <ShimmerThumbnail height={40} rounded/>
                            </div>
                            <div className="filter-search">
                                <div></div>
                                <ShimmerThumbnail height={40} rounded/>
                            </div>
                            <div className="filter-search">
                                <div></div>
                                <ShimmerThumbnail height={40} rounded/>
                            </div>
                            <div className="filter-search">
                                <div></div>
                                <ShimmerThumbnail height={40} rounded/>
                            </div>
                            <div className="filter-search">
                                <div></div>
                                <ShimmerThumbnail height={40} rounded/>
                            </div>

                            <div className="filter-search-button">
                                <div></div>
                                <ShimmerThumbnail height={40} rounded/>
                            </div>
                        </div>
                    </div>
                    {/* <div className="col-md-2">
                        <ShimmerThumbnail height={40} rounded/>
                    </div>
                    <div className="col-md-2">
                        <ShimmerThumbnail height={40} rounded/>
                    </div>
                    <div className="col-md-2">
                        <ShimmerThumbnail height={40} rounded/>
                    </div>
                    <div className="col-md-2">
                        <ShimmerThumbnail height={40} rounded/>
                    </div>
                    <div className="col-md-2">
                        <ShimmerThumbnail height={40} rounded/>
                    </div> */}
                </div>
                <div className="row px-3">
                    <div className="col-md-4">
                        <ShimmerThumbnail height={100} rounded/>
                    </div>
                    <div className="col-md-4">
                        <ShimmerThumbnail height={100} rounded/>
                    </div>
                    <div className="col-md-4">
                        <ShimmerThumbnail height={100} rounded/>
                    </div>
                </div>
                <div className="row px-3">
                    <div className="col-md-4">
                        <ShimmerThumbnail height={100} rounded/>
                    </div>
                    <div className="col-md-4">
                        <ShimmerThumbnail height={100} rounded/>
                    </div>
                    <div className="col-md-4">
                        <ShimmerThumbnail height={100} rounded/>
                    </div>
                </div>

                <div className="row px-3">
                    <div className="col-md-4">
                        <ShimmerThumbnail height={300} rounded/>
                    </div>
                    <div className="col-md-4">
                        <ShimmerThumbnail height={300} rounded/>
                    </div>
                    <div className="col-md-4">
                        <ShimmerThumbnail height={300} rounded/>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DashboarShimmer;