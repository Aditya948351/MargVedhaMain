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
          <Popup className="premium-popup" maxWidth={300}>
            <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <video 
                src="https://res.cloudinary.com/dsj0vaews/video/upload/v1774117387/eeololastomdbamjbs9a.mp4" 
                autoPlay loop muted playsInline
                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
              />
              <div style={{ padding: '12px' }}>
                <strong style={{ fontSize: '14px', color: '#1e293b' }}>{point.name}</strong>
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#64748b' }}>
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>● LIVE</span> 3D Simulation Feed
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default TrafficMonitoringMap;
