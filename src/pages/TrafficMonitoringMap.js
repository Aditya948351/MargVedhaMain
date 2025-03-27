import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";


const cameraIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/565/565547.png", // Camera Icon URL
  iconSize: [32, 32], // Size of the icon
  iconAnchor: [16, 32], // Anchor position
  popupAnchor: [0, -32] // Popup position
});


const intersections = [
  { name: "Vidya Vikas Circle", lat: 20.01021, lon: 73.76414 },
  { name: "Spectrum", lat: 20.00724, lon: 73.77148 },
  { name: "Intersection 3", lat: 20.00387, lon: 73.77042 },
  { name: "Theatre", lat: 20.00587, lon: 73.76331 }
];


const shortestPath = intersections.map(point => [point.lat, point.lon]);

const TrafficMonitoringMap = () => {
  return (
    <MapContainer center={[20.00724, 73.77148]} zoom={15} style={{ height: "400px", width: "100%" }}>
      
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

     
      <Polyline positions={shortestPath} color="blue" weight={5} />

     
      {intersections.map((point, index) => (
        <Marker key={index} position={[point.lat, point.lon]} icon={cameraIcon}>
          <Popup>
            <strong>{point.name}</strong>
            <br />
            📷 Camera Monitoring Active
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default TrafficMonitoringMap;
