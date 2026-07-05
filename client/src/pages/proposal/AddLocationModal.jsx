import React, { useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat, transform } from "ol/proj";

const AddLocationModal = ({ show, onHide, latitude, longitude }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const lat = latitude ? Number(latitude) : 23.297;
  const lon = longitude ? Number(longitude) : 77.638;
  const initMap = () => {
    if (!mapRef.current) return;

    // Destroy old map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setTarget(null);
    }

    mapInstanceRef.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({


        // center: fromLonLat([
        //   Number(longitude) || 0,
        //   Number(latitude) || 0,
        // ]),
        center: fromLonLat([lon, lat]),



        zoom: 13,
      }),
    });

    mapInstanceRef.current.updateSize();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      onEntered={initMap}   // ⭐ THIS IS THE KEY
      size="xl"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Location Preview</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="location-pre-view"
          ref={mapRef}
          style={{
            height: "450px",
            width: "80%",
            background: "#eee",
          }}
        />
      </Modal.Body>

      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddLocationModal;
