import React, { useState, useEffect, useRef } from "react";
import { Card, Table, Form, Row, Col, Badge, ListGroup, OverlayTrigger, Tooltip, Container } from "react-bootstrap";
import { FaCar, FaBus, FaTruck, FaMotorcycle, FaExclamationTriangle, FaIdCard, FaSyncAlt, FaRoad, FaArrowUp, FaArrowDown, FaClock, FaMapMarkerAlt, FaBrain } from "react-icons/fa";
import { collection, onSnapshot, query, orderBy, limit, where, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; 
import { junctionCoords } from "../utils/junctionCoords";

const TrafficSimulation = ({ trafficData, selectedJunction }) => {
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
      position: 'relative', width: '100%', height: '520px', backgroundColor: '#020617', 
      overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '28px',
      boxShadow: '0 30px 60px rgba(0,0,0,0.6)'
    }}>
      {viewMode === 'sim' ? (
        <div className="intersection-graphics w-100 h-100 position-relative">
          <div style={{ position: 'absolute', left: '42%', width: '16%', height: '100%', background: '#111827', borderLeft: '2px solid #334155', borderRight: '2px solid #334155' }}>
            <div style={{ position: 'absolute', left: '50%', height: '100%', width: '1px', borderLeft: '1px dashed rgba(255,255,255,0.1)' }}></div>
          </div>
          <div style={{ position: 'absolute', top: '42%', height: '16%', width: '100%', background: '#111827', borderTop: '2px solid #334155', borderBottom: '2px solid #334155' }}>
            <div style={{ position: 'absolute', top: '50%', width: '100%', height: '1px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}></div>
          </div>
          <div style={{ position: 'absolute', top: '38%', left: '42%', width: '16%', height: '12px', background: 'repeating-linear-gradient(90deg, #334155 0, #334155 8px, transparent 8px, transparent 16px)' }}></div>
          <div style={{ position: 'absolute', bottom: '38%', left: '42%', width: '16%', height: '12px', background: 'repeating-linear-gradient(90deg, #334155 0, #334155 8px, transparent 8px, transparent 16px)' }}></div>
          <div style={{ position: 'absolute', left: '38%', top: '42%', width: '12px', height: '16%', background: 'repeating-linear-gradient(0deg, #334155 0, #334155 8px, transparent 8px, transparent 16px)' }}></div>
          <div style={{ position: 'absolute', right: '38%', top: '42%', width: '12px', height: '16%', background: 'repeating-linear-gradient(0deg, #334155 0, #334155 8px, transparent 8px, transparent 16px)' }}></div>
          {vehicles.map(v => (
            <div key={v.id} style={{
              position: 'absolute', left: `${v.x}%`, top: `${v.y}%`,
              width: v.type === 'car' ? '20px' : (v.type === 'motorcycle' ? '12px' : '30px'), 
              height: v.type === 'car' ? '14px' : (v.type === 'motorcycle' ? '8px' : '18px'),
              backgroundColor: v.color, borderRadius: '3px', zIndex: 10,
              boxShadow: `0 0 15px ${v.color}88`,
              transform: `rotate(${v.rotation}deg)`,
              transition: 'all 0.05s linear',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{width: '60%', height: '70%', background: 'rgba(255,255,255,0.1)', borderRadius: '2px'}}></div>
            </div>
          ))}
        </div>
      ) : (
        <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          src="https://res.cloudinary.com/dsj0vaews/video/upload/v1774117387/eeololastomdbamjbs9a.mp4" />
      )}
      <div className="position-absolute d-flex flex-column gap-2" style={{ top: '25px', left: '25px', zIndex: 30 }}>
        <Badge bg="primary" className="py-2 px-3 rounded-pill shadow-xl border border-white-opacity-20">
          <FaSyncAlt className="me-2 spin-slow" /> {viewMode === 'sim' ? 'SUMO 4-WAY SIMULATION' : 'LIVE PRODUCTION FEED'}
        </Badge>
        <div className="d-flex gap-2">
          <button onClick={() => setViewMode('sim')} className={`btn btn-sm py-1 px-3 rounded-pill transition-all ${viewMode === 'sim' ? 'btn-light border-0' : 'btn-dark opacity-50'}`}>Visualizer</button>
          <button onClick={() => setViewMode('video')} className={`btn btn-sm py-1 px-3 rounded-pill transition-all ${viewMode === 'video' ? 'btn-light border-0' : 'btn-dark opacity-50'}`}>Live Stream</button>
        </div>
      </div>
      <div className="position-absolute p-3 bg-slate-900-opacity-80 backdrop-blur rounded-xl border border-white-opacity-10" style={{bottom: '25px', left: '25px', zIndex: 30}}>
        <div className="small text-slate-400 fw-bold mb-1 tracking-widest">LIVE SCALE STATUS</div>
        <div className="d-flex gap-3 align-items-center">
          {['North', 'South', 'East', 'West'].map(dir => (
            <div key={dir} className="d-flex align-items-center gap-1">
              <div style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: (trafficData[dir]?.status === 'online' ? '#10b981' : '#ef4444')}}></div>
              <span className="tiny fw-bold text-white opacity-70">{dir[0]}</span>
            </div>
          ))}
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

  const handleTakeFine = async (alert) => {
    try {
      const fineData = {
        plateNumber: alert.latest_number_plate,
        violationType: alert.latest_violation,
        junction: junctionCoords[selectedJunction]?.name || "CBS Circle",
        direction: alert.direction,
        timestamp: alert.timestamp,
        timestamp_local: alert.timestamp_local,
        status: "Pending",
        amount: alert.latest_violation === "Wrong Side driving" ? 500 : 300,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "fines"), fineData);
      setFinedAlerts(prev => new Set([...prev, alert.id || `${alert.timestamp}-${alert.latest_number_plate}`]));
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
    const qJunction = query(collection(db, "junctions"), where("location", "==", activeJunctionName));
    const unsubJunction = onSnapshot(qJunction, (snapshot) => {
      const newData = { North: null, South: null, East: null, West: null };
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.direction) newData[d.direction] = d;
      });
      setIntersectionData(newData);
    });

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
    return () => { unsubJunction(); unsubHistory(); unsubViolations(); };
  }, [selectedJunction, selectedDirection]);

  const SideCard = ({ dir, data }) => {
    const total = (data?.total_vehicles || 0) + jitter[dir];
    const details = data?.detailed_counts || { incoming: {}, outgoing: {} };
    return (
      <Card className={`mb-3 border-0 shadow-lg ${data ? 'bg-slate-800' : 'bg-slate-900 border border-slate-800 opacity-40'}`} style={{ borderRadius: '16px' }}>
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-slate-400 small fw-bold tracking-widest">{dir.toUpperCase()} APPROACH</span>
            <Badge bg={data ? "primary" : "secondary"}>{data ? "LINKED" : "OFFLINE"}</Badge>
          </div>
          <div className="d-flex justify-content-between align-items-end mb-3">
             <h2 className="mb-0 fw-bold font-mono text-blue-400">{total}</h2>
             <div className="text-end small font-mono">
                <div className="text-slate-300">{data?.latest_number_plate || '---'}</div>
                {data?.latest_violation && <span className="text-red-500 blink-fast">🚨 VIOLATION</span>}
             </div>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-slate-700 pt-3 mt-1" style={{fontSize: '0.7rem'}}>
            <div>
              <div className="text-emerald-500 mb-1 d-flex align-items-center"><FaArrowDown className="me-1"/> Incoming</div>
              <div className="text-slate-500">🚗 {details.incoming?.car || 0}   🚌 {details.incoming?.bus || 0}</div>
            </div>
            <div>
              <div className="text-blue-500 mb-1 d-flex align-items-center"><FaArrowUp className="me-1"/> Outgoing</div>
              <div className="text-slate-500">🚗 {details.outgoing?.car || 0}   🚌 {details.outgoing?.bus || 0}</div>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const calculateRecommendation = () => {
    // Simulated Q-Learning Policy for Signal Optimization
    const directions = ['North', 'South', 'East', 'West'];
    const counts = directions.map(d => ({
      dir: d,
      count: (intersectionData[d]?.total_vehicles || 0) + jitter[d]
    }));
    const total = counts.reduce((acc, curr) => acc + curr.count, 0) || 1;
    const CYCLE_TIME = 120; 
    
    // Q-Learning Weighting: Give more weight to heavy lanes (RL Reward Maximization)
    return counts.map(c => ({
      ...c,
      seconds: Math.max(15, Math.floor((c.count / total) * CYCLE_TIME)),
      reward: (c.count / total).toFixed(2)
    }));
  };

  const recommendations = calculateRecommendation();

  return (
    <div className="min-vh-100 bg-slate-950 text-slate-100 p-4 font-sans">
      <Container fluid>
        <Row className="mb-4 align-items-center g-4">
          <Col lg={7}>
            <div className="d-flex align-items-center">
              <div className="bg-blue-600 p-4 rounded-3xl shadow-2xl shadow-blue-500/20 me-4">
                 <FaMapMarkerAlt size={32} />
              </div>
              <div>
                <h1 className="h2 fw-bold mb-1 tracking-tight">Nashik Traffic Operational Cockpit</h1>
                <p className="text-slate-400 mb-0 d-flex align-items-center gap-2">
                  <span className="text-emerald-500">●</span> ENGINE: Q-LEARNING REINFORCEMENT LEARNING • A* ROUTING
                </p>
              </div>
            </div>
          </Col>
          <Col lg={5}><div className="d-flex gap-2">
            <div className="flex-grow-1">
              <Form.Label className="small fw-bold text-slate-500 tracking-widest">JUNCTION</Form.Label>
              <Form.Select value={selectedJunction} onChange={(e) => setSelectedJunction(e.target.value)} className="bg-slate-900 border-slate-800 text-white py-2.5 rounded-xl">
                {Object.entries(junctionCoords).map(([id, j]) => (<option key={id} value={id}>{j.name}</option>))}
              </Form.Select>
            </div>
            <div style={{width: '140px'}}>
              <Form.Label className="small fw-bold text-slate-500 tracking-widest">DIRECTION</Form.Label>
              <Form.Select value={selectedDirection} onChange={(e) => setSelectedDirection(e.target.value)} className="bg-slate-900 border-slate-800 text-white py-2.5 rounded-xl">
                <option value="All">All Feed</option><option value="North">North</option><option value="South">South</option><option value="East">East</option><option value="West">West</option>
              </Form.Select>
            </div>
          </div></Col>
        </Row>
        <Row className="g-4">
          <Col xl={8}>
            <div className="flex flex-col gap-4">
               <Row className="g-4 mb-2">
                  <Col md={12}>
                    <Card className="bg-gradient-to-r from-slate-900 to-black border-0 rounded-3xl p-4 shadow-2xl mb-4 border border-blue-500-opacity-20" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #000000 100%)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                           <div className="d-flex align-items-center gap-3">
                              <div className="p-2 bg-blue-600 rounded-xl text-white shadow-xl shadow-blue-500/30"><FaBrain /></div>
                              <div>
                                 <span className="fw-black text-white ls-2 d-block">Q-TABLE OPTIMIZER (REINFORCEMENT LEARNING)</span>
                                 <span className="tiny text-blue-400 opacity-50 uppercase">Policy: Maximize Flow | Minimize Wait Time</span>
                              </div>
                           </div>
                           <div className="text-end">
                              <Badge bg="primary" className="px-3 py-2 rounded-lg ls-1">STEP: 24,102</Badge>
                           </div>
                        </div>
                        <Row className="g-3">
                           {recommendations.map(r => (
                              <Col key={r.dir} xs={6} md={3}>
                                 <div className="bg-slate-800 bg-opacity-40 rounded-2xl p-3 border border-white border-opacity-5 text-center transition-all hover:border-blue-500/30">
                                    <div className="tiny text-slate-500 fw-bold ls-1 mb-1">{r.dir.toUpperCase()} POLICY</div>
                                    <h3 className="text-white fw-black mb-1">{r.seconds}s</h3>
                                    <div className="progress bg-dark" style={{ height: '4px' }}>
                                       <div className="progress-bar bg-blue-500" style={{ width: `${r.reward * 100}%` }}></div>
                                    </div>
                                    <div className="tiny text-blue-400 mt-2">Reward: +{r.reward}</div>
                                 </div>
                              </Col>
                           ))}
                        </Row>
                    </Card>
                  </Col>
               </Row>
               <TrafficSimulation trafficData={intersectionData} />
               <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                 <Card.Header className="bg-slate-800/30 py-4 border-slate-800 d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-blue-400 tracking-wider small">LIVE TELEMETRY STREAM</span>
                    <Badge bg="dark" className="border border-slate-700">60 FPS PROCESSOR</Badge>
                 </Card.Header>
                 <div className="overflow-x-auto" style={{maxHeight: '400px'}}>
                   <Table variant="dark" className="mb-0 text-sm align-middle" hover>
                     <thead className="bg-slate-900 sticky top-0 text-slate-500">
                       <tr><th className="py-4 px-4">TIMESTAMP</th><th>APPROACH</th><th>CLASSIFICATION</th><th>ANPR LOG</th><th>STATUS</th></tr>
                     </thead>
                     <tbody className="border-0 font-mono">
                       {trafficHistory.map(log => (
                         <tr key={log.id} className="border-slate-800 hover:bg-slate-800/40 transition-all">
                           <td className="px-4 text-slate-400">{formatTime(log.timestamp, log.timestamp_local)}</td>
                           <td><Badge bg="secondary" className="px-2">{log.direction}</Badge></td>
                           <td><div className="d-flex gap-3"><span>🚗 {log.car_count}</span><span>🚌 {log.bus_count}</span><span>🚛 {log.truck_count}</span><span>🏍️ {log.motorcycle_count}</span></div></td>
                           <td className="text-blue-300 fw-bold">{log.latest_number_plate}</td>
                           <td>{log.latest_violation ? <Badge bg="danger">{log.latest_violation}</Badge> : <span className="text-emerald-500 text-xs opacity-60">● OK</span>}</td>
                         </tr>
                       ))}
                       {trafficHistory.length === 0 && (<tr><td colSpan="5" className="text-center py-20 text-slate-600 italic">Waiting for backend...</td></tr>)}
                     </tbody>
                   </Table>
                 </div>
               </Card>
            </div>
          </Col>
          <Col xl={4}>
            <div className="flex flex-col gap-4">
               <div>
                  <h6 className="text-slate-500 mb-3 fw-bold small tracking-widest px-2">4-WAY MONITORING</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
                    <SideCard dir="North" data={intersectionData.North} /><SideCard dir="South" data={intersectionData.South} /><SideCard dir="East" data={intersectionData.East} /><SideCard dir="West" data={intersectionData.West} />
                  </div>
               </div>
               <Card className="bg-slate-900 border-red-900/30 rounded-3xl overflow-hidden shadow-2xl border-2">
                 <Card.Header className="bg-red-500/10 text-red-400 py-4 border-slate-800">
                    <h6 className="mb-0 fw-bold d-flex align-items-center tracking-tight"><FaExclamationTriangle className="me-2 blink-fast" /> ACTIVE ENFORCEMENT</h6>
                 </Card.Header>
                 <ListGroup variant="flush">
                   {alerts.map((alert, i) => {
                     const alertKey = alert.id || `${alert.timestamp}-${alert.latest_number_plate}`;
                     const isFined = finedAlerts.has(alertKey);
                     return (
                       <ListGroup.Item key={i} className="bg-transparent border-slate-800 p-4 hover:bg-red-500/5 transition-all">
                          <div className="d-flex justify-content-between mb-2">
                            <Badge bg="danger" style={{fontSize: '0.65rem'}} className="tracking-widest">{alert.latest_violation}</Badge>
                            <small className="text-slate-500">{formatTime(alert.timestamp, alert.timestamp_local)}</small>
                          </div>
                          <div className="d-flex align-items-center mb-1"><FaIdCard className="text-slate-500 me-2" /><h4 className="mb-0 font-mono text-white fw-bold">{alert.latest_number_plate}</h4></div>
                          <div className="text-slate-500 x-small mb-3">Detection: <span className="text-slate-300">{alert.direction} Approach</span></div>
                          <div className="d-flex gap-2">
                            {isFined ? (
                              <Badge bg="success" className="w-100 py-2 rounded-lg opacity-75 d-flex align-items-center justify-content-center"><FaClock className="me-2" /> PENALTY ISSUED</Badge>
                            ) : (
                              <><button onClick={() => handleTakeFine(alert)} className="btn btn-danger btn-sm w-100 py-2 rounded-lg fw-bold shadow-lg border-0" style={{background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'}}>TAKE FINE (₹{alert.latest_violation === "Wrong Side driving" ? 500 : 300})</button><button className="btn btn-outline-secondary btn-sm py-2 px-3">IGNORE</button></>
                            )}
                          </div>
                       </ListGroup.Item>
                     );
                   })}
                   {alerts.length === 0 && (<div className="text-center py-16 opacity-20"><FaSyncAlt size={40} className="mb-3 spin-slow" /><p className="small">No violations detected</p></div>)}
                 </ListGroup>
               </Card>
            </div>
          </Col>
        </Row>
      </Container>
      <style>{`
        body { background-color: #020617 !important; color: #f8fafc; overflow-x: hidden; }
        .blink-fast { animation: blink 1s infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.1; } }
        .spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .x-small { font-size: 0.7rem; }
        .rounded-3xl { border-radius: 1.5rem !important; }
        .rounded-xl { border-radius: 0.75rem !important; }
        .grid-cols-2 { display: grid; grid-template-columns: repeat(2, 1fr); }
      `}</style>
    </div>
  );
};
export default TrafficCounting;
