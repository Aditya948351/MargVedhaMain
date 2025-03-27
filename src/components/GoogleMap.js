import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const signalLocations = [
  { id: 1, lat: 19.076, lng: 72.8777 }, // Example coordinates for Mumbai
  { id: 2, lat: 28.7041, lng: 77.1025 }, // Example coordinates for Delhi
  { id: 3, lat: 12.9716, lng: 77.5946 }, // Example coordinates for Bangalore
];

const OpenStreetMap = () => {
  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "400px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {signalLocations.map((signal) => (
        <Marker key={signal.id} position={[signal.lat, signal.lng]}>
          <Popup>Signal {signal.id} Location</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default OpenStreetMap;
