import React from "react";
import { ShimmerTable, ShimmerSectionHeader, ShimmerButton } from "react-shimmer-effects";

function PlotListShimmer({header}){
    // console.log(header);
    return (
        <>
            <div className="mt-3">
                {
                    (header != false) && 
                    <ShimmerSectionHeader subTitle={false} />
                }
                
                <div className="d-flex justify-content-between align-items-center">
                    <ShimmerButton size="sm"/>
                    <ShimmerButton size="sm"/>
                </div>
                <ShimmerTable row={5} col={10}/>
            </div>
            
        </>
    );
}
export default PlotListShimmer;