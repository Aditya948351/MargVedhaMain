import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { junctionCoords } from "../utils/junctionCoords";
import { Card, Badge, Spinner } from "react-bootstrap";
import { FaTrafficLight, FaVideo, FaMapMarkerAlt, FaLocationArrow } from "react-icons/fa";

// Fix for default Leaflet icon issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const LocationMarker = () => {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
};

const MapComponent = ({ height = "500px", showUserLocation = false }) => {
  const [junctions, setJunctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "traffic_police"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJunctions(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const getStatusColor = (count) => {
    if (count > 100) return "#ef4444"; // Red - Congested
    if (count > 50) return "#f59e0b"; // Amber - Moderate
    return "#10b981"; // Green - Clear
  };

  const createCustomIcon = (count) => {
    return L.divIcon({
      className: "custom-div-icon",
      html: `<div style="background-color: ${getStatusColor(count)}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
               <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
             </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3 fw-bold text-slate-500">Initializing Real-time Map...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-[2rem] overflow-hidden border border-slate-200 shadow-xl">
      <MapContainer
        center={[20.0016, 73.7853]}
        zoom={14}
        style={{ height, width: "100%" }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {junctions.map((j) => {
          const coords = junctionCoords[j.junctionId];
          if (!coords) return null;

          return (
            <Marker
              key={j.id}
              position={[coords.lat, coords.lng]}
              icon={createCustomIcon(j.liveVehicleCount)}
            >
              <Popup className="premium-popup" maxWidth={350} minWidth={300}>
                <Card className="border-0 shadow-none">
                  <div className="relative rounded-t-lg overflow-hidden h-40 bg-slate-900">
                    <video
                      src="https://res.cloudinary.com/dsj0vaews/video/upload/v1774117387/eeololastomdbamjbs9a.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute top-3 right-3">
                       <Badge bg="danger" className="animate-pulse flex items-center gap-1">
                         <FaVideo /> 3D SIMULATION
                       </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-white text-[10px] font-bold">
                       LIVE FEED • {j.junctionName}
                    </div>
                  </div>
                  <Card.Body className="p-4 bg-white rounded-b-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="text-slate-900 font-bold text-sm mb-0 flex items-center gap-2">
                           <FaMapMarkerAlt className="text-blue-500" /> {j.junctionName}
                        </h5>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">
                           Current status: <span className="font-bold" style={{ color: getStatusColor(j.liveVehicleCount)}}>{j.status}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-slate-900 leading-none">
                          {j.liveVehicleCount}
                        </span>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Vehicles</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3">
                       <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                          <span>Congestion Index</span>
                          <span>{Math.round((j.liveVehicleCount / 200) * 100)}%</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-500" 
                            style={{ 
                              width: `${Math.min(100, (j.liveVehicleCount / 200) * 100)}%`,
                              backgroundColor: getStatusColor(j.liveVehicleCount)
                            }}
                          ></div>
                       </div>
                    </div>

                    <button className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2">
                       <FaTrafficLight /> Full Analytics View
                    </button>
                  </Card.Body>
                </Card>
              </Popup>
            </Marker>
          );
        })}

        {showUserLocation && <LocationMarker />}
      </MapContainer>
      
      {/* Floating Controls Overlay */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
         <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/50 space-y-3">
            <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Legend</h6>
            <div className="flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
               <span className="text-[10px] font-bold text-slate-700">Clear (0-50)</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-amber-500"></div>
               <span className="text-[10px] font-bold text-slate-700">Moderate (51-100)</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-rose-500"></div>
               <span className="text-[10px] font-bold text-slate-700">Congested (&gt;100)</span>
            </div>
         </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
         <div className="bg-slate-900/80 backdrop-blur-xl px-6 py-3 rounded-full border border-slate-700 shadow-2xl flex items-center gap-4">
            <div className="flex items-center gap-2">
               <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
               <span className="text-xs text-white font-bold whitespace-nowrap">Live Network</span>
            </div>
            <div className="h-4 w-px bg-slate-700"></div>
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Auto-syncing active sensors</span>
         </div>
      </div>
    </div>
  );
};

export default MapComponent;
