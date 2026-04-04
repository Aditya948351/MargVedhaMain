import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Modal } from "react-bootstrap";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { FaCity, FaTrafficLight, FaExclamationTriangle, FaBusAlt, FaRobot, FaNetworkWired } from "react-icons/fa";

// Sub-components
import JunctionGrid from "../components/CityIntelligence/JunctionGrid";
import DirectionalModal from "../components/CityIntelligence/DirectionalModal";
import NetworkView from "../components/CityIntelligence/NetworkView";
import IncidentPanel from "../components/CityIntelligence/IncidentPanel";
import TransportPanel from "../components/CityIntelligence/TransportPanel";
import AIInsightsPanel from "../components/CityIntelligence/AIInsightsPanel";

import "./CityIntelligence.css";

const CityIntelligence = () => {
  const [activeJunction, setActiveJunction] = useState(null); // For Directional Modal

  // Live State from Firestore
  const [junctions, setJunctions] = useState({});
  const [networkStats, setNetworkStats] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [transportData, setTransportData] = useState([]);
  const [aiInsights, setAiInsights] = useState({});

  useEffect(() => {
    // 1. Junctions & Network Stats
    const unsubJunc = onSnapshot(collection(db, "junctions"), (snapshot) => {
      const juncMap = {};
      const stats = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        // Map backend schema to UI schema
        juncMap[doc.id] = {
          id: doc.id,
          name: data.location,
          total_vehicles: data.total_vehicles,
          congestion: data.congestion_level?.toLowerCase() === 'high' ? 'red' : 
                      data.congestion_level?.toLowerCase() === 'moderate' ? 'yellow' : 'green',
          signal_status: data.signal_phase?.startsWith('GREEN') ? 'GREEN' : 'RED',
          directions: {
             N: { vehicle_count: data.north || 0, wait_time: 30, violations: 0, status: data.n_status || 'Low' },
             S: { vehicle_count: data.south || 0, wait_time: 30, violations: 0, status: data.s_status || 'Low' },
             E: { vehicle_count: data.east || 0,  wait_time: 30, violations: 0, status: data.e_status || 'Low' },
             W: { vehicle_count: data.west || 0,  wait_time: 30, violations: 0, status: data.w_status || 'Low' }
          }
        };
        stats.push({ name: data.location, congestionScore: data.total_vehicles });
      });
      setJunctions(juncMap);
      setNetworkStats(stats.sort((a,b) => b.congestionScore - a.congestionScore));
    });

    // 2. Incidents
    const unsubInc = onSnapshot(collection(db, "incidents"), (snapshot) => {
      const active = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(inc => inc.active !== false);
      setIncidents(active);
    });

    // 3. Public Transport
    const unsubBus = onSnapshot(collection(db, "bus_routes"), (snapshot) => {
      const routes = snapshot.docs.map(doc => ({ 
        route: doc.data().route_name, 
        delay_mins: Math.max(0, doc.data().eta_minutes - 20),
        speed_kmh: Math.floor(40 - (doc.data().total_vehicle_load / 10)),
        type: 'Bus' 
      }));
      // Add fake auto data for completeness as in mock
      routes.push({ type: 'Auto', demand: 'High', dynamic_fare_multiplier: 1.5 });
      setTransportData(routes);
    });

    // 4. Derived AI Insights
    setAiInsights({
      next5Mins: "Predictive model warming up...",
      rlDecision: incidents.length > 0 ? `Bypassing around ${incidents[0].junction_name}` : "Optimal flow maintained.",
      greenAllocations: {} 
    });

    return () => { unsubJunc(); unsubInc(); unsubBus(); };
  }, [incidents.length]);

  return (
    <Container fluid className="city-intelligence-container py-4">
      {/* Header */}
      <div className="mb-5 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="fw-black text-3xl mb-1 d-flex align-items-center gap-3 text-slate-800 dark:text-white">
             <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><FaCity /></div>
             Smart City Analytics Hub
          </h1>
          <p className="text-slate-500 fw-bold mb-0">Unified Real-Time Operations • 20 Active Junctions</p>
        </div>
        <Badge bg="success" className="px-3 py-2 text-sm rounded-full shadow d-flex align-items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> FULL NETWORK SYNC
        </Badge>
      </div>

      <Row className="g-4">
        {/* Left Column: Grid and Network */}
        <Col xl={8} lg={7}>
           {/* Section A: Junction Grid */}
           <Card className="border-0 shadow-sm rounded-3xl mb-4 bg-white dark:bg-slate-800 overflow-hidden">
             <Card.Header className="bg-transparent border-0 pt-4 pb-0">
               <h5 className="font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                 <FaTrafficLight className="text-blue-500"/> Live Junction Overview (J1-J20)
               </h5>
             </Card.Header>
             <Card.Body>
                <JunctionGrid junctions={junctions} onJunctionClick={(j) => setActiveJunction(j)} />
             </Card.Body>
           </Card>

           {/* Section C: Network View */}
           <Card className="border-0 shadow-sm rounded-3xl bg-white dark:bg-slate-800 overflow-hidden">
             <Card.Header className="bg-transparent border-0 pt-4 pb-0">
               <h5 className="font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                 <FaNetworkWired className="text-indigo-500"/> City Network Congestion Analysis
               </h5>
             </Card.Header>
             <Card.Body>
                <NetworkView data={networkStats} />
             </Card.Body>
           </Card>
        </Col>

        {/* Right Column: AI, Incidents, Transport */}
        <Col xl={4} lg={5} className="d-flex flex-column gap-4">
           
           {/* Section F: AI Insights */}
           <Card className="border-0 shadow-sm rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-800 text-white overflow-hidden">
             <Card.Body>
                <h5 className="font-bold flex items-center gap-2 mb-4 text-indigo-300">
                  <FaRobot /> AI Intelligence & RL Engine
                </h5>
                <AIInsightsPanel data={aiInsights} />
             </Card.Body>
           </Card>

           {/* Section D: Incidents */}
           <Card className="border-0 shadow-sm rounded-3xl bg-white dark:bg-slate-800 overflow-hidden">
             <Card.Body>
                <h5 className="font-bold flex items-center gap-2 mb-4 text-red-500">
                  <FaExclamationTriangle /> Active Incidents
                </h5>
                <IncidentPanel incidents={incidents} />
             </Card.Body>
           </Card>

           {/* Section E: Public Transport */}
           <Card className="border-0 shadow-sm rounded-3xl bg-white dark:bg-slate-800 overflow-hidden">
             <Card.Body>
                <h5 className="font-bold flex items-center gap-2 mb-4 text-emerald-500">
                  <FaBusAlt /> Public Transport & Mobility
                </h5>
                <TransportPanel data={transportData} />
             </Card.Body>
           </Card>

        </Col>
      </Row>

      {/* Section B: Directional View Modal */}
      <DirectionalModal 
          show={!!activeJunction} 
          junction={activeJunction ? junctions[activeJunction] : null}
          onHide={() => setActiveJunction(null)} 
      />

    </Container>
  );
};

export default CityIntelligence;
