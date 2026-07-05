import React, { useEffect, useState } from "react";
import { ShimmerTable, ShimmerSectionHeader, ShimmerButton, ShimmerBadge, ShimmerThumbnail } from "react-shimmer-effects";

function FormShimmer({ cols, rows }) {
  const [html, setHtml] = useState([]);

  useEffect(() => {
    if (cols && rows) {
      const newHtml = [];
      for (let i = 1; i <= rows; i++) {
        for (let j = 1; j <= cols; j++) {
          newHtml.push(<div className="col-lg-6" key={Math.random() * 10}>
            <ShimmerThumbnail height={40} rounded/>
        </div>);
        }
      }
      setHtml(newHtml);
    }
  }, [cols, rows]);

  return (
    <div className="mt-3">
      <div className="row">
        <div className="col-lg-3">
          <ShimmerThumbnail height={40} rounded/>
        </div>
        <div className="col-lg-3">
          <ShimmerThumbnail height={40} rounded/>
        </div>
        <div className="col-lg-3">
          <ShimmerThumbnail height={40} rounded/>
        </div>
        <div className="col-lg-3">
          <ShimmerThumbnail height={40} rounded/>
        </div>
      </div>
      <div className="row">
        {html}
      </div>
    </div>
  );
}

export default FormShimmer;
