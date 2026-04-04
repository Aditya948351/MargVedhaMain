import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const signalLocations = [
  { id: 1, lat: 20.0266, lng: 73.8008, name: "Tarwala / MERI Signal" },
  { id: 2, lat: 19.9931021, lng: 73.7400, name: "ITI Signal" },
  { id: 3, lat: 19.9794898, lng: 73.807147, name: "Croma - Inox Signal" },
  { id: 4, lat: 19.9923162, lng: 73.750222, name: "Udyog Bhavan, FDA office" },
  { id: 5, lat: 19.9938375, lng: 73.7540119, name: "ABB Circle" },
  { id: 6, lat: 19.9935865, lng: 73.750615, name: "ITI Signal Post Office" },
  { id: 7, lat: 20.0006831, lng: 73.7824909, name: "CBS SIGNAL" },
  { id: 8, lat: 19.9707554, lng: 73.8354263, name: "Jailroad Signal" },
  { id: 9, lat: 20.0068889, lng: 73.7848611, name: "Ashok Stambh" },
  { id: 10, lat: 20.012348, lng: 73.790323, name: "Nashik Municipal Corporation" }
];

const OpenStreetMap = () => {
  return (
    <MapContainer center={[19.99, 73.78]} zoom={12} style={{ height: "400px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {signalLocations.map((signal) => (
        <Marker key={signal.id} position={[signal.lat, signal.lng]}>
          <Popup>{signal.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default OpenStreetMap;
