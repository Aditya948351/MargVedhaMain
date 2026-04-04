import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { junctionCoords } from "../utils/junctionCoords";

// Fix default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const SignalMapView = ({ height = "450px" }) => {
  const [junctions, setJunctions] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "junctions"), (snapshot) => {
      setJunctions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const getSignalColor = (j) => {
    if (j.green_corridor_active) return "#3b82f6"; // Blue pulse for corridor
    const phase = j.signal_phase || "";
    if (phase.includes("GREEN")) return "#10b981";
    if (phase === "YELLOW") return "#f59e0b";
    return "#ef4444"; // RED or default
  };

  const getCongestionColor = (count) => {
    if (count > 50) return "#ef4444";
    if (count > 20) return "#f59e0b";
    return "#10b981";
  };

  // Build edges between junctions for road visualization
  const edges = [];
  const NEIGHBOURS = {
    cbs_circle: ["bytco_point","ashok_stambh","lekha_nagar","upnagar"],
    nashik_road: ["makhmalabad_naka","dwarka_circle","shalimar"],
    gangapur_road: ["trimbak_naka","indiranagar","untwadi"],
    dwarka_circle: ["nashik_road","rajiv_gandhi_bhavan","shalimar"],
    rajiv_gandhi_bhavan: ["dwarka_circle","college_road","ashok_stambh"],
    college_road: ["rajiv_gandhi_bhavan","upnagar","cbs_circle"],
    mumbai_naka: ["lekha_nagar","pathardi_phata","bytco_point"],
    ashok_stambh: ["cbs_circle","rajiv_gandhi_bhavan","bytco_point"],
    shalimar: ["nashik_road","dwarka_circle","upnagar"],
    bytco_point: ["cbs_circle","ashok_stambh","mumbai_naka"],
    pathardi_phata: ["mumbai_naka","ambad_link_road","satpur_midc"],
    ambad_link_road: ["pathardi_phata","satpur_midc"],
    satpur_midc: ["ambad_link_road","makhmalabad_naka","nashik_road"],
    trimbak_naka: ["gangapur_road","panchavati","indiranagar"],
    lekha_nagar: ["cbs_circle","mumbai_naka"],
    upnagar: ["cbs_circle","college_road","shalimar"],
    indiranagar: ["gangapur_road","trimbak_naka","untwadi"],
    untwadi: ["gangapur_road","indiranagar","cbs_circle"],
    makhmalabad_naka: ["nashik_road","satpur_midc","shalimar"],
    panchavati: ["trimbak_naka","cbs_circle","upnagar"],
  };

  const seen = new Set();
  Object.entries(NEIGHBOURS).forEach(([from, nbs]) => {
    const fromCoord = junctionCoords[from];
    if (!fromCoord) return;
    nbs.forEach(to => {
      const key = [from, to].sort().join("-");
      if (seen.has(key)) return;
      seen.add(key);
      const toCoord = junctionCoords[to];
      if (!toCoord) return;
      edges.push([[fromCoord.lat, fromCoord.lng], [toCoord.lat, toCoord.lng]]);
    });
  });

  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
      <MapContainer
        center={[19.9975, 73.7898]}
        zoom={13}
        style={{ height, width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
        />

        {/* Draw road edges */}
        {edges.map((positions, i) => (
          <Polyline key={i} positions={positions} color="rgba(100,116,139,0.4)" weight={2} dashArray="6 4" />
        ))}

        {/* Junction markers */}
        {junctions.map(j => {
          const coords = junctionCoords[j.junction_id];
          if (!coords) return null;
          const color = getSignalColor(j);
          const count = j.total_vehicles || 0;

          return (
            <CircleMarker
              key={j.id}
              center={[coords.lat, coords.lng]}
              radius={j.green_corridor_active ? 14 : 10}
              fillColor={color}
              color={j.green_corridor_active ? "#60a5fa" : "rgba(255,255,255,0.3)"}
              weight={j.green_corridor_active ? 3 : 2}
              opacity={1}
              fillOpacity={0.85}
            >
              <Popup>
                <div style={{ minWidth: 200 }}>
                  <h6 style={{ fontWeight: 800, marginBottom: 4 }}>{j.location || j.junction_id}</h6>
                  <div style={{ fontSize: 12 }}>
                    <div><strong>Vehicles:</strong> {count}</div>
                    <div><strong>Signal:</strong> <span style={{ color }}>{j.signal_phase}</span></div>
                    <div><strong>Congestion:</strong> <span style={{ color: getCongestionColor(count) }}>{j.congestion_level}</span></div>
                    <div><strong>Override:</strong> {j.signal_override || "AUTO"}</div>
                    {j.green_corridor_active && (
                      <div style={{ color: "#3b82f6", fontWeight: 700, marginTop: 4 }}>🚑 GREEN CORRIDOR ACTIVE</div>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default SignalMapView;
