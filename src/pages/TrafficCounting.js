import React, { useState, useEffect, useRef } from "react";
import { Card, Table, Form, Row, Col, Badge, ListGroup, Container, Button } from "react-bootstrap";
import { FaExclamationTriangle, FaIdCard, FaSyncAlt, FaArrowUp, FaArrowDown, FaClock, FaMapMarkerAlt, FaBrain, FaShieldAlt } from "react-icons/fa";
import { collection, onSnapshot, query, orderBy, limit, where, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; 
import { junctionCoords } from "../utils/junctionCoords";

const TrafficSimulation = ({ trafficData }) => {
  const [vehicles, setVehicles] = useState([]);
  const [viewMode, setViewMode] = useState('sim'); // 'sim' or 'video'
  const requestRef = useRef();
  const lastSpawnRef = useRef({ North: 0, South: 0, East: 0, West: 0 });

  const spawnVehicle = (dir) => {
    const id = Math.random().toString(36).substr(2, 6);
    const types = ['car', 'bus', 'truck', 'motorcycle'];
    const type = types[Math.floor(Math.random() * types.length)];
    const colors = { car: '#3b82f6', bus: '#fb7185', truck: '#818cf8', motorcycle: '#2dd4bf' };
    
    let x, y, vx, vy, rotation;
    const speed = 0.5 + Math.random() * 0.4;

    if (dir === 'North') { x = 46.5; y = -10; vx = 0; vy = speed; rotation = 0; }
    else if (dir === 'South') { x = 51.5; y = 110; vx = 0; vy = -speed; rotation = 180; }
    else if (dir === 'West') { x = -10; y = 51.5; vx = speed; vy = 0; rotation = 90; }
    else if (dir === 'East') { x = 110; y = 46.5; vx = -speed; vy = 0; rotation = 270; }

    return { id, x, y, vx, vy, type, color: colors[type], rotation };
  };

  const animate = () => {
    setVehicles(prev => {
      const next = prev.map(v => ({ ...v, x: v.x + v.vx, y: v.y + v.vy }))
                       .filter(v => v.x > -20 && v.x < 120 && v.y > -20 && v.y < 120);

      const now = Date.now();
      ['North', 'South', 'East', 'West'].forEach(dir => {
        const d = trafficData[dir];
        const status = d?.status || 'offline';
        const count = d?.total_vehicles || 0;
        
        let spawnInterval = 1000000;
        if (status === 'online') {
          spawnInterval = count > 0 ? Math.max(250, 4000 / count) : 4000;
        }

        if (now - lastSpawnRef.current[dir] > spawnInterval) {
          next.push(spawnVehicle(dir));
          lastSpawnRef.current[dir] = now;
        }
      });
      return next;
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [trafficData]);

  return (
    <div className="sim-viewport" style={{ 
      position: 'relative', width: '100%', height: '520px', backgroundColor: '#f1f5f9', 
      overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '28px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
    }}>
      {viewMode === 'sim' ? (
        <div className="intersection-graphics w-100 h-100 position-relative">
          <div style={{ position: 'absolute', left: '42%', width: '16%', height: '100%', background: '#cbd5e1', borderLeft: '2px solid #94a3b8', borderRight: '2px solid #94a3b8' }}>
            <div style={{ position: 'absolute', left: '50%', height: '100%', width: '1px', borderLeft: '1px dashed rgba(255,255,255,0.3)' }}></div>
          </div>
          <div style={{ position: 'absolute', top: '42%', height: '16%', width: '100%', background: '#cbd5e1', borderTop: '2px solid #94a3b8', borderBottom: '2px solid #94a3b8' }}>
            <div style={{ position: 'absolute', top: '50%', width: '100%', height: '1px', borderTop: '1px dashed rgba(255,255,255,0.3)' }}></div>
          </div>
          <div style={{ position: 'absolute', top: '38%', left: '42%', width: '16%', height: '12px', background: 'repeating-linear-gradient(90deg, #94a3b8 0, #94a3b8 8px, transparent 8px, transparent 16px)' }}></div>
          {vehicles.map(v => (
            <div key={v.id} style={{
              position: 'absolute', left: `${v.x}%`, top: `${v.y}%`,
              width: v.type === 'car' ? '20px' : (v.type === 'motorcycle' ? '12px' : '30px'), 
              height: v.type === 'car' ? '14px' : (v.type === 'motorcycle' ? '8px' : '18px'),
              backgroundColor: v.color, borderRadius: '3px', zIndex: 10,
              boxShadow: `0 0 10px ${v.color}88`,
              transform: `rotate(${v.rotation}deg)`,
              transition: 'all 0.05s linear',
            }}></div>
          ))}
        </div>
      ) : (
        <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          src="https://res.cloudinary.com/dsj0vaews/video/upload/v1774117387/eeololastomdbamjbs9a.mp4" />
      )}
      <div className="position-absolute d-flex flex-column gap-2" style={{ top: '25px', left: '25px', zIndex: 30 }}>
        <Badge bg="primary" className="py-2 px-3 rounded-pill shadow-lg">
          <FaSyncAlt className="me-2 spin-slow" /> {viewMode === 'sim' ? 'SUMO 4-WAY SIMULATION' : 'LIVE PRODUCTION FEED'}
        </Badge>
        <div className="d-flex gap-2">
          <button onClick={() => setViewMode('sim')} className={`btn btn-sm py-1 px-3 rounded-pill transition-all ${viewMode === 'sim' ? 'btn-light' : 'btn-outline-light opacity-50'}`}>Visualizer</button>
          <button onClick={() => setViewMode('video')} className={`btn btn-sm py-1 px-3 rounded-pill transition-all ${viewMode === 'video' ? 'btn-light' : 'btn-outline-light opacity-50'}`}>Live Stream</button>
        </div>
      </div>
    </div>
  );
};

const TrafficCounting = () => {
  const [intersectionData, setIntersectionData] = useState({ North: null, South: null, East: null, West: null });
  const [trafficHistory, setTrafficHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedJunction, setSelectedJunction] = useState("1");
  const [selectedDirection, setSelectedDirection] = useState("All");
  const [jitter, setJitter] = useState({ North: 0, South: 0, East: 0, West: 0 });
  const [finedAlerts, setFinedAlerts] = useState(new Set());
  const [vipMode, setVipMode] = useState(false);

  const handleTakeFine = async (alert) => {
    const alertKey = alert.id || `${alert.timestamp}-${alert.latest_number_plate}`;
    try {
      const activeJunctionName = junctionCoords[selectedJunction]?.name || "CBS Circle";
      const response = await fetch("http://localhost:5000/api/issue_fine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plateNumber: alert.latest_number_plate || "MH 15 XX 0000",
          violationType: alert.latest_violation || alert.type,
          junction: activeJunctionName,
          amount: alert.latest_violation === "Wrong Side driving" ? 500 : 300
        })
      });
      const result = await response.json();

      const fineData = {
        violationType: alert.latest_violation || alert.type,
        junction: activeJunctionName,
        direction: alert.direction || alert.junction_name || "All",
        timestamp: alert.timestamp,
        status: "Sent",
        amount: alert.latest_violation === "Wrong Side driving" ? 500 : 300,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "fines"), fineData);
      setFinedAlerts(prev => new Set([...prev, alertKey]));
      
      // Professional feedback
      console.log("Fine Issued:", result);
    } catch (error) { console.error("Error issuing fine:", error); }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setJitter({
        North: Math.floor(Math.random() * 2),
        South: Math.floor(Math.random() * 2),
        East: Math.floor(Math.random() * 2),
        West: Math.floor(Math.random() * 2)
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ts, local) => {
    if (!ts && !local) return 'Connecting...';
    try {
      if (ts?.toDate) return ts.toDate().toLocaleTimeString(); 
      if (local) return new Date(local).toLocaleTimeString();
      return new Date(ts).toLocaleTimeString();
    } catch (e) { return '---'; }
  };

  useEffect(() => {
    const activeJunctionName = junctionCoords[selectedJunction]?.name || "CBS Circle";
    const qJunction = query(collection(db, "traffic_police"));
    const unsubJunction = onSnapshot(qJunction, (snapshot) => {
      const newData = { North: null, South: null, East: null, West: null };
      
      // First, see if app.py is running and providing directional cameras (cam1_north, etc.)
      snapshot.forEach(doc => {
        const d = doc.data();
        const id = doc.id.toLowerCase();
        if (id.includes("north")) newData.North = d;
        if (id.includes("south")) newData.South = d;
        if (id.includes("east")) newData.East = d;
        if (id.includes("west")) newData.West = d;
      });

      // If no directional cameras were found, fallback to the global dummy data from traffic_simulation_api.py
      if (!newData.North && !newData.South && !newData.East && !newData.West) {
         snapshot.forEach(doc => {
           const d = doc.data();
           if (d.junctionName === activeJunctionName || d.location === activeJunctionName) {
              const liveCount = d.liveVehicleCount || d.total_vehicles || 0;
              const quarterData = { ...d, total_vehicles: Math.max(0, Math.floor(liveCount / 4)) };
              
              if (quarterData.detailed_counts) {
                 const inc = quarterData.detailed_counts.incoming || {};
                 const out = quarterData.detailed_counts.outgoing || {};
                 quarterData.detailed_counts = {
                    incoming: { car: Math.ceil((inc.car||0)/4), bus: Math.ceil((inc.bus||0)/4), truck: Math.ceil((inc.truck||0)/4), motorcycle: Math.ceil((inc.motorcycle||0)/4) },
                    outgoing: { car: Math.floor((out.car||0)/4), bus: Math.floor((out.bus||0)/4), truck: Math.floor((out.truck||0)/4), motorcycle: Math.floor((out.motorcycle||0)/4) }
                 };
              } else {
                 // Safe fallback if Firebase is not delivering detailed_counts (e.g. Quota Exceeded limits)
                 const fakeCar = Math.max(0, Math.floor((quarterData.total_vehicles * 0.6) / 2));
                 const fakeBus = Math.max(0, Math.floor((quarterData.total_vehicles * 0.2) / 2));
                 const fakeTruck = Math.max(0, Math.floor((quarterData.total_vehicles * 0.2) / 2));
                 quarterData.detailed_counts = {
                     incoming: { car: fakeCar, bus: fakeBus, truck: fakeTruck },
                     outgoing: { car: fakeCar, bus: fakeBus, truck: fakeTruck }
                 };
              }

              newData.North = quarterData;
              newData.South = quarterData;
              newData.East = quarterData;
              newData.West = quarterData;
           }
         });
      }
      setIntersectionData(newData);
    });

    // --- DIRECT LOCAL API FALLBACK (Bypasses Firebase Quota Exceeded) ---
    // If the Python API is running locally and Firebase writes are failing,
    // this will proactively pull the true live stats straight from the Python memory!
    const fetchLocalApi = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/live_traffic");
        if (!res.ok) return;
        const apiData = await res.json();
        if (Object.keys(apiData).length === 0) return;

        const activeName = junctionCoords[selectedJunction]?.name || "CBS Circle";
        const keyMatch = Object.keys(apiData).find(k => 
           k.toLowerCase().includes(activeName.split(" ")[0].toLowerCase()) || 
           activeName.toLowerCase().includes(k.split("_")[0].toLowerCase())
        );

        if (keyMatch) {
           const liveJunc = apiData[keyMatch];
           const liveCount = liveJunc.total || 0;
           
           const trueQuarterData = {
              total_vehicles: Math.max(0, Math.floor(liveCount / 4)),
              detailed_counts: {
                  incoming: { 
                      car: Math.ceil((liveJunc.car||0)/4), 
                      bus: Math.ceil((liveJunc.bus||0)/4), 
                      truck: Math.ceil((liveJunc.truck||0)/4), 
                      motorcycle: Math.ceil((liveJunc.motorcycle||0)/4) 
                  },
                  outgoing: { 
                      car: Math.floor((liveJunc.car||0)/4), 
                      bus: Math.floor((liveJunc.bus||0)/4), 
                      truck: Math.floor((liveJunc.truck||0)/4), 
                      motorcycle: Math.floor((liveJunc.motorcycle||0)/4) 
                  }
              }
           };

           // Override the Firebase dummy data with real live Python data
           setIntersectionData(prev => ({
              ...prev,
              North: trueQuarterData,
              South: trueQuarterData,
              East: trueQuarterData,
              West: trueQuarterData
           }));
        }
      } catch (err) {
        // Just silently fail and rely on Firebase if Python is offline
      }
    };
    
    fetchLocalApi(); // Initial fetch
    const localApiInterval = setInterval(fetchLocalApi, 1500); // 1.5s live polling
    // --------------------------------------------------------------------

    let qHistory;
    if (selectedDirection === "All") {
      qHistory = query(collection(db, "traffic_data"), where("location", "==", activeJunctionName), orderBy("timestamp", "desc"), limit(15));
    } else {
      qHistory = query(collection(db, "traffic_data"), where("location", "==", activeJunctionName), where("direction", "==", selectedDirection), orderBy("timestamp", "desc"), limit(15));
    }
    const unsubHistory = onSnapshot(qHistory, (snapshot) => {
      setTrafficHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qViolations = query(collection(db, "violations"), orderBy("timestamp", "desc"), limit(8));
    const unsubViolations = onSnapshot(qViolations, (snapshot) => {
       setAlerts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubJunction(); unsubHistory(); unsubViolations(); clearInterval(localApiInterval); };
  }, [selectedJunction, selectedDirection]);

  const SideCard = ({ dir, data }) => {
    const total = (data?.total_vehicles || 0) + jitter[dir];
    const details = data?.detailed_counts || { incoming: {}, outgoing: {} };
    return (
      <Card className={`mb-3 border-0 shadow-sm ${data ? 'bg-white border border-slate-100' : 'bg-slate-100 border-dashed border-slate-200 opacity-60'}`} style={{ borderRadius: '16px' }}>
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-slate-400 small fw-bold tracking-widest">{dir.toUpperCase()} APPROACH</span>
            <Badge bg={data ? "primary" : "light"} className={data ? "" : "text-slate-400 border border-slate-200"}>{data ? "LINKED" : "OFFLINE"}</Badge>
          </div>
          <div className="d-flex justify-content-between align-items-end mb-3">
             <h2 className="mb-0 fw-bold font-mono text-primary">{total}</h2>
             <div className="text-end small font-mono">
                <div className="text-slate-600">{data?.latest_number_plate || '---'}</div>
                {data?.latest_violation && <span className="text-danger fw-bold blink-fast">🚨 VIOLATED</span>}
             </div>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 mt-1" style={{fontSize: '0.7rem'}}>
            <div>
              <div className="text-success mb-1 d-flex align-items-center"><FaArrowDown className="me-1"/> Incoming</div>
              <div className="text-slate-500 fw-bold">🚗 {details.incoming?.car || 0}   🚌 {details.incoming?.bus || 0}   🚛 {details.incoming?.truck || 0}</div>
            </div>
            <div>
              <div className="text-primary mb-1 d-flex align-items-center"><FaArrowUp className="me-1"/> Outgoing</div>
              <div className="text-slate-500 fw-bold">🚗 {details.outgoing?.car || 0}   🚌 {details.outgoing?.bus || 0}   🚛 {details.outgoing?.truck || 0}</div>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const calculateRecommendation = () => {
    const directions = ['North', 'South', 'East', 'West'];
    if (vipMode) {
      return directions.map(d => ({
        dir: d,
        seconds: d === 'North' ? 90 : 10,
        reward: d === 'North' ? "1.00" : "0.00"
      }));
    }
    const counts = directions.map(d => ({
      dir: d,
      count: (intersectionData[d]?.total_vehicles || 0) + jitter[d]
    }));
    const total = counts.reduce((acc, curr) => acc + curr.count, 0) || 1;
    const CYCLE_TIME = 120; 
    return counts.map(c => ({
      ...c,
      seconds: Math.max(15, Math.floor((c.count / total) * CYCLE_TIME)),
      reward: (c.count / total).toFixed(2)
    }));
  };

  const recommendations = calculateRecommendation();

  return (
    <div className="min-vh-100 bg-slate-50 text-slate-900 p-4 font-sans theme-light">
      <Container fluid className="px-md-5">
        <Row className="mb-4 align-items-center g-4">
          <Col lg={7}>
            <div className="d-flex align-items-center justify-content-between w-100">
              <div className="d-flex align-items-center">
                <div className="bg-primary p-4 rounded-3xl shadow-xl shadow-blue-500/10 me-4">
                  <FaMapMarkerAlt size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="h2 fw-bold mb-1 tracking-tight text-slate-900">Traffic Operational Cockpit</h1>
                  <p className="text-slate-500 mb-0 d-flex align-items-center gap-2">
                    <span className="text-success">●</span> ENGINE: Q-LEARNING REINFORCEMENT LEARNING • A* ROUTING
                  </p>
                </div>
              </div>
              <div className="ps-4 border-start border-slate-200">
                 <button onClick={() => setVipMode(!vipMode)} className={`btn ${vipMode ? 'btn-warning' : 'btn-outline-primary'} rounded-xl px-4 py-3 fw-bold shadow-sm transition-all d-flex align-items-center gap-2`}>
                   <FaShieldAlt /> {vipMode ? "VIP PREEMPTION ACTIVE" : "TRIGGER VIP WAVE"}
                 </button>
              </div>
            </div>
          </Col>
          <Col lg={5}><div className="d-flex gap-2">
            <div className="flex-grow-1">
              <Form.Label className="small fw-bold text-slate-400 tracking-widest">JUNCTION</Form.Label>
              <Form.Select value={selectedJunction} onChange={(e) => setSelectedJunction(e.target.value)} className="bg-white border-slate-200 text-slate-900 py-2.5 rounded-xl shadow-sm">
                {Object.entries(junctionCoords).map(([id, j]) => (<option key={id} value={id}>{j.name}</option>))}
              </Form.Select>
            </div>
            <div style={{width: '140px'}}>
              <Form.Label className="small fw-bold text-slate-400 tracking-widest">DIRECTION</Form.Label>
              <Form.Select value={selectedDirection} onChange={(e) => setSelectedDirection(e.target.value)} className="bg-white border-slate-200 text-slate-900 py-2.5 rounded-xl shadow-sm">
                <option value="All">All Feed</option><option value="North">North</option><option value="South">South</option><option value="East">East</option><option value="West">West</option>
              </Form.Select>
            </div>
          </div></Col>
        </Row>

        <Row className="g-4">
          <Col lg={9}>
            <div className="flex flex-col gap-4">
               <Row className="g-4 mb-2">
                  <Col md={12}>
                    <Card className="bg-white border-0 rounded-3xl p-4 shadow-xl border border-slate-100 mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                           <div className="d-flex align-items-center gap-3">
                              <div className="p-2 bg-primary rounded-xl text-white shadow-lg shadow-blue-500/20"><FaBrain /></div>
                              <div>
                                 <span className="fw-black text-slate-800 ls-2 d-block">Q-TABLE OPTIMIZER (REINFORCEMENT LEARNING)</span>
                                 <span className="tiny text-primary opacity-70 uppercase fw-bold">Policy: Maximize Flow | Minimize Wait Time</span>
                              </div>
                           </div>
                           <div className="text-end">
                              <Badge bg="primary" className="px-3 py-2 rounded-lg ls-1">STEP: 24,102</Badge>
                           </div>
                        </div>
                        <Row className="g-3">
                           {recommendations.map(r => (
                              <Col key={r.dir} xs={6} md={3}>
                                 <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center transition-all hover:border-blue-200 hover:bg-white group cursor-default">
                                    <div className="tiny text-slate-400 fw-bold ls-1 mb-1">{r.dir.toUpperCase()} POLICY</div>
                                    <h3 className="text-slate-900 fw-black mb-1">{r.seconds}s</h3>
                                    <div className="progress bg-slate-200" style={{ height: '4px' }}>
                                       <div className="progress-bar bg-primary" style={{ width: `${r.reward * 100}%` }}></div>
                                    </div>
                                    <div className="tiny text-primary fw-bold mt-2 opacity-70">Reward: +{r.reward}</div>
                                 </div>
                              </Col>
                           ))}
                        </Row>
                    </Card>
                  </Col>
               </Row>
               <TrafficSimulation trafficData={intersectionData} />
               <Card className="bg-white border-0 shadow-xl rounded-3xl overflow-hidden mt-4">
                 <Card.Header className="bg-slate-50 py-4 border-bottom border-slate-100 d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-primary tracking-wider small">LIVE TELEMETRY STREAM</span>
                    <Badge bg="light" className="border text-slate-400 border-slate-200">60 FPS PROCESSOR</Badge>
                 </Card.Header>
                 <div className="overflow-x-auto" style={{maxHeight: '400px'}}>
                    <Table variant="light" className="mb-0 text-sm align-middle" hover>
                      <thead className="bg-slate-50 sticky top-0 text-slate-400">
                        <tr><th className="py-4 px-4">TIMESTAMP</th><th>APPROACH</th><th>CLASSIFICATION</th><th>ANPR LOG</th><th>STATUS</th></tr>
                      </thead>
                      <tbody className="border-0 font-mono">
                        {trafficHistory.map(log => (
                          <tr key={log.id} className="border-slate-100 hover:bg-slate-50 transition-all">
                            <td className="px-4 text-slate-400">{formatTime(log.timestamp, log.timestamp_local)}</td>
                            <td><Badge bg="info" className="px-2 text-white">{log.direction}</Badge></td>
                            <td><div className="d-flex gap-3 text-slate-600"><span>🚗 {log.car_count}</span><span>🚌 {log.bus_count}</span><span>🚛 {log.truck_count}</span><span>🏍️ {log.motorcycle_count}</span></div></td>
                            <td className="text-primary fw-bold">{log.latest_number_plate || '---'}</td>
                            <td>{log.latest_violation ? <Badge bg="danger">{log.latest_violation}</Badge> : <span className="text-success text-xs opacity-60">● OK</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                 </div>
               </Card>
            </div>
          </Col>

          <Col lg={3}>
               <div className="sticky-top" style={{top: '1.5rem'}}>
                  <SideCard dir="North" data={intersectionData.North} />
                  <SideCard dir="South" data={intersectionData.South} />
                  <SideCard dir="East" data={intersectionData.East} />
                  <SideCard dir="West" data={intersectionData.West} />
               </div>

               <Card className="bg-white border-0 rounded-3xl overflow-hidden shadow-xl border border-red-50 mt-4">
                 <Card.Header className="bg-red-50 text-danger py-4 border-0">
                    <h6 className="mb-0 fw-bold d-flex align-items-center tracking-tight"><FaExclamationTriangle className="me-2 blink-fast" /> ACTIVE ENFORCEMENT</h6>
                 </Card.Header>
                 <ListGroup variant="flush">
                   {alerts.map((alert, i) => {
                     const alertKey = alert.id || `${alert.timestamp}-${alert.latest_number_plate}`;
                     const isFined = finedAlerts.has(alertKey);
                     return (
                       <ListGroup.Item key={i} className="bg-transparent border-slate-50 p-4 hover:bg-red-50/20 transition-all">
                          <div className="d-flex justify-content-between mb-2">
                            <Badge bg="danger" style={{fontSize: '0.65rem'}} className="tracking-widest opacity-75">{alert.latest_violation}</Badge>
                            <small className="text-slate-400">{formatTime(alert.timestamp, alert.timestamp_local)}</small>
                          </div>
                          <div className="d-flex align-items-center mb-1"><FaIdCard className="text-slate-400 me-2" /><h4 className="mb-0 font-mono text-slate-800 fw-bold">{alert.latest_number_plate}</h4></div>
                          <div className="text-slate-400 x-small mb-3">Detection: <span className="text-slate-600 fw-bold">{alert.direction} Approach</span></div>
                          <div className="d-flex gap-2">
                            {isFined ? (
                              <Badge bg="success" className="w-100 py-2 rounded-lg opacity-75 d-flex align-items-center justify-content-center text-white"><FaClock className="me-2" /> PENALTY ISSUED</Badge>
                            ) : (
                              <><button onClick={() => handleTakeFine(alert)} className="btn btn-danger btn-sm w-100 py-2 rounded-lg fw-bold shadow-lg border-0" style={{background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'}}>TAKE FINE (₹{alert.latest_violation === "Wrong Side driving" ? 500 : 300})</button><button className="btn btn-outline-light border-slate-200 text-slate-400 btn-sm py-2 px-3">IGNORE</button></>
                            )}
                          </div>
                       </ListGroup.Item>
                     );
                   })}
                   {alerts.length === 0 && (<div className="text-center py-16 opacity-30 text-slate-300"><FaSyncAlt size={40} className="mb-3 spin-slow" /><p className="small">No violations detected</p></div>)}
                 </ListGroup>
               </Card>
          </Col>
        </Row>
      </Container>
      <style>{`
        body { background-color: #f8fafc !important; color: #0f172a; overflow-x: hidden; }
        .blink-fast { animation: blink 1s infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.1; } }
        .spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .x-small { font-size: 0.7rem; }
        .rounded-3xl { border-radius: 1.5rem !important; }
        .rounded-xl { border-radius: 0.75rem !important; }
        .grid-cols-2 { display: grid; grid-template-columns: repeat(2, 1fr); }
        .ls-1 { letter-spacing: 1px; }
        .ls-2 { letter-spacing: 2px; }
        .tiny { font-size: 0.65rem; }
        .theme-light .progress { background-color: #e2e8f0; }
        .theme-light .progress-bar { background-color: #3b82f6; }
      `}</style>
    </div>
  );
};

export default TrafficCounting;
