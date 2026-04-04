import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Badge, Spinner, Button, Form, Modal } from "react-bootstrap";
import { FaCity, FaTrafficLight, FaCarSide, FaUserShield, FaWind, FaSmile, FaProjectDiagram, FaSyncAlt, FaAmbulance, FaPlay, FaStop, FaPowerOff, FaCircle } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { collection, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import SignalMapView from "../components/SignalMapView";
import "./AdminDashboard.css";

const FLASK_URL = "http://localhost:5000";

const AdminDashboard = () => {
  const [junctions, setJunctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simRunning, setSimRunning] = useState(false);
  const [simCycle, setSimCycle] = useState(0);
  const [showCorridorModal, setShowCorridorModal] = useState(false);
  const [corridorStart, setCorridorStart] = useState("");
  const [corridorEnd, setCorridorEnd] = useState("");
  const [corridorActive, setCorridorActive] = useState(false);

  // Live Firestore listener
  useEffect(() => {
    const unsubJunctions = onSnapshot(collection(db, "junctions"), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.total_vehicles || 0) - (a.total_vehicles || 0));
      setJunctions(data);
      setLoading(false);
    });

    const unsubSettings = onSnapshot(doc(db, "settings", "green_corridor"), (d) => {
      if (d.exists()) {
        setCorridorActive(d.data().active || false);
      }
    });

    return () => {
      unsubJunctions();
      unsubSettings();
    };
  }, []);

  // Poll simulation status
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`${FLASK_URL}/api/status`);
        const data = await res.json();
        setSimRunning(data.running);
        setSimCycle(data.cycle);
      } catch (e) { /* Flask not running */ }
    }, 5000);
    return () => clearInterval(poll);
  }, []);

  const totalVehicles = junctions.reduce((a, j) => a + (j.total_vehicles || 0), 0);
  const congestedCount = junctions.filter(j => j.congestion_level === "High").length;
  // const corridorActive = junctions.some(j => j.green_corridor_active); // Now managed by dedicated listener above

  const chartData = junctions.slice(0, 12).map(j => ({
    name: (j.location || "").split(" ")[0],
    vehicles: j.total_vehicles || 0,
  }));

  // ── Actions ────────────────────────────────────────────────────────────────
  const startSimulation = async () => {
    try {
      await fetch(`${FLASK_URL}/start`, { method: "POST" });
      setSimRunning(true);
    } catch (e) {
      alert("⚠️ Cannot reach Flask backend at localhost:5000.\nMake sure to run: python traffic_simulation_api.py");
    }
  };

  const stopSimulation = async () => {
    try {
      await fetch(`${FLASK_URL}/stop`, { method: "POST" });
      setSimRunning(false);
    } catch (e) { console.error(e); }
  };

  const handleSignalOverride = async (junctionId, newPhase) => {
    try {
      await updateDoc(doc(db, "junctions", junctionId), { signal_override: newPhase });
    } catch (e) { console.error("Override error:", e); }
  };

  const triggerGreenCorridor = async () => {
    if (!corridorStart || !corridorEnd) return;
    try {
      // Set the global green corridor settings
      await setDoc(doc(db, "settings", "green_corridor"), { 
        active: true, 
        start_id: corridorStart, 
        end_id: corridorEnd,
        timestamp: new Date().toISOString()
      });
      setCorridorActive(true); // Optimistic UI
      setShowCorridorModal(false);
    } catch (e) { 
      console.error("Corridor error:", e);
      alert("Failed to activate Green Corridor. Check console for details.");
    }
  };

  const clearGreenCorridor = async () => {
    try {
      await updateDoc(doc(db, "settings", "green_corridor"), { active: false });
      setCorridorActive(false); // Optimistic UI
    } catch (e) {
      // If doc doesn't exist, use setDoc
      await setDoc(doc(db, "settings", "green_corridor"), { active: false });
      setCorridorActive(false);
    }
  };

  const getBarColor = (val) => val > 50 ? "#ef4444" : val > 20 ? "#f59e0b" : "#10b981";

  return (
    <Container fluid className="admin-dashboard-container py-4">
      {/* Header */}
      <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="fw-black ls-1 mb-1 d-flex align-items-center gap-3" style={{ fontSize: "1.6rem" }}>
            <div className="bg-indigo-600 p-2 rounded-xl glow-indigo text-white"><FaUserShield /></div>
            CITY AUTHORITY CONTROL ROOM
          </h1>
          <p className="text-secondary fw-bold mb-0 opacity-75">Nashik Central Command • Real-Time AI Traffic Ecosystem</p>
        </div>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <Badge bg="dark" className="p-2 rounded-2xl border border-white border-opacity-10 d-flex align-items-center gap-2">
            <FaCircle style={{ color: simRunning ? "#10b981" : "#64748b", fontSize: 8 }} />
            <span className={`fw-black ${simRunning ? "text-emerald-400" : "text-secondary"}`} style={{ fontSize: 11 }}>
              {simRunning ? `ENGINE ON • CYCLE ${simCycle}` : "ENGINE OFFLINE"}
            </span>
          </Badge>
          {!simRunning ? (
            <Button variant="success" size="sm" className="rounded-pill px-3 fw-bold" onClick={startSimulation}>
              <FaPlay className="me-1" /> Start Simulation
            </Button>
          ) : (
            <Button variant="outline-danger" size="sm" className="rounded-pill px-3 fw-bold" onClick={stopSimulation}>
              <FaStop className="me-1" /> Stop
            </Button>
          )}
          {corridorActive ? (
            <Button variant="outline-info" size="sm" className="rounded-pill px-3 fw-bold" onClick={clearGreenCorridor}>
              🚑 Clear Corridor
            </Button>
          ) : (
            <Button variant="info" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => setShowCorridorModal(true)}>
              <FaAmbulance className="me-1" /> Green Corridor
            </Button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="metric-card border-left-primary">
            <Card.Body>
              <h6 className="xsmall mb-2">Active Junctions</h6>
              <h2 className="fw-black mb-0">{junctions.length} <small className="fs-6 opacity-40">LIVE</small></h2>
              <div className="text-indigo-400 xsmall fw-bold mt-2 d-flex align-items-center gap-2">
                <FaProjectDiagram /> DIJKSTRA ROUTING
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card border-left-success">
            <Card.Body>
              <h6 className="xsmall mb-2">Vehicle Telemetry</h6>
              <h2 className="fw-black mb-0">{loading ? "..." : totalVehicles.toLocaleString()}</h2>
              <div className="text-emerald-400 xsmall fw-bold mt-2">
                ↑ LIVE FROM FIRESTORE
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card border-left-danger">
            <Card.Body>
              <h6 className="xsmall mb-2">Critical Nodes</h6>
              <h2 className="fw-black mb-0">{congestedCount} <small className="fs-6 opacity-40">HIGH</small></h2>
              <div className="text-rose-400 xsmall fw-bold mt-2 d-flex align-items-center gap-2">
                <FaWind /> ABOVE CAPACITY
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card border-left-warning">
            <Card.Body>
              <h6 className="xsmall mb-2">Green Corridor</h6>
              <h2 className="fw-black mb-0">
                {corridorActive ? <span className="text-info">ACTIVE 🚑</span> : <span className="opacity-40">STANDBY</span>}
              </h2>
              <div className="text-amber-400 xsmall fw-bold mt-2 d-flex align-items-center gap-2">
                <FaAmbulance /> EMERGENCY SYSTEM
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Signal Map (Embedded) */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="bg-dark-card border-0 shadow-2xl">
            <Card.Header className="bg-transparent border-0 text-slate-300 fw-black py-3 ls-1 d-flex justify-content-between align-items-center">
              <span>🗺️ LIVE SIGNAL MAP — 20 JUNCTIONS</span>
              <Badge bg="dark" className="border border-white border-opacity-10 px-3 py-2">
                <FaCircle style={{ color: "#10b981", fontSize: 6 }} className="me-2" />REAL-TIME
              </Badge>
            </Card.Header>
            <Card.Body className="p-2">
              <SignalMapView height="420px" />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts + Signal Control */}
      <Row className="mb-4 g-4">
        <Col lg={7}>
          <Card className="bg-dark-card border-0 shadow-2xl">
            <Card.Header className="bg-transparent border-0 text-slate-300 fw-black py-3 ls-1">
              LIVE TRAFFIC VOLUME BY JUNCTION
            </Card.Header>
            <Card.Body style={{ height: "350px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-25} textAnchor="end" height={60} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} itemStyle={{ color: "#fff" }} />
                  <Bar dataKey="vehicles" radius={[6, 6, 0, 0]} name="Vehicles">
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={getBarColor(entry.vehicles)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="bg-dark-card border-0 shadow-2xl" style={{ maxHeight: 440, overflowY: "auto" }}>
            <Card.Header className="bg-transparent border-0 text-slate-300 fw-black py-3 ls-1">
              🚦 SIGNAL OVERRIDE CONTROL
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="mb-0 table-borderless" size="sm">
                <thead style={{ position: "sticky", top: 0, background: "#1e293b", zIndex: 1 }}>
                  <tr>
                    <th className="ps-3 small fw-black" style={{ color: "#64748b" }}>Junction</th>
                    <th className="small fw-black text-center" style={{ color: "#64748b" }}>Phase</th>
                    <th className="small fw-black text-center" style={{ color: "#64748b" }}>Override</th>
                  </tr>
                </thead>
                <tbody>
                  {junctions.map(j => (
                    <tr key={j.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <td className="ps-3">
                        <div className="fw-bold small text-light">{j.location}</div>
                        <div style={{ fontSize: 9, color: "#64748b" }}>{j.total_vehicles || 0} vehicles</div>
                      </td>
                      <td className="text-center">
                        <Badge bg="dark" className="border border-white border-opacity-10 px-2 py-1 small"
                          style={{ color: (j.signal_phase || "").includes("GREEN") ? "#10b981" : "#ef4444" }}>
                          {j.signal_phase || "—"}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Form.Select size="sm" style={{ width: 120, background: "#0f172a", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.1)", fontSize: 10 }}
                          value={j.signal_override || "AUTO"}
                          onChange={(e) => handleSignalOverride(j.junction_id, e.target.value)}>
                          <option value="AUTO">🤖 AUTO</option>
                          <option value="GREEN_NS">🟢 GREEN N-S</option>
                          <option value="GREEN_EW">🟢 GREEN E-W</option>
                          <option value="GREEN_ALL">🟢 ALL GREEN</option>
                          <option value="RED_ALL">🔴 ALL RED</option>
                        </Form.Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Junction Telemetry Table */}
      <Row>
        <Col xl={12}>
          <Card className="bg-dark-card border-0 shadow-2xl">
            <Card.Header className="bg-transparent border-bottom border-white border-opacity-10 py-3 px-4 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-black ls-1">JUNCTION TELEMETRY & DIRECTIONAL FLOW</h5>
              <Badge className="bg-indigo-600 bg-opacity-20 text-indigo-400 border border-indigo-500 border-opacity-30 px-3 py-2 rounded-lg">
                LIVE FIRESTORE
              </Badge>
            </Card.Header>
            <Card.Body className="p-0 overflow-hidden" style={{ maxHeight: 450, overflowY: "auto" }}>
              {loading ? (
                <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
              ) : (
                <Table hover responsive className="mb-0 table-borderless">
                  <thead style={{ position: "sticky", top: 0, background: "#1e293b", zIndex: 1 }}>
                    <tr>
                      <th className="ps-4">Intersection</th>
                      <th className="text-center">North</th>
                      <th className="text-center">South</th>
                      <th className="text-center">East</th>
                      <th className="text-center">West</th>
                      <th className="text-center">Total</th>
                      <th className="pe-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {junctions.map(j => (
                      <tr key={j.id}>
                        <td className="ps-4">
                          <div className="fw-black text-indigo-400">{j.location}</div>
                          <div className="tiny text-slate-500 fw-bold">{j.junction_id}</div>
                        </td>
                        <td className="text-center">
                          <Badge bg="dark" className="border border-white border-opacity-10 text-slate-300 px-2 py-1">
                            {j.north || 0}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <Badge bg="dark" className="border border-white border-opacity-10 text-slate-300 px-2 py-1">
                            {j.south || 0}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <Badge bg="dark" className="border border-white border-opacity-10 text-slate-300 px-2 py-1">
                            {j.east || 0}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <Badge bg="dark" className="border border-white border-opacity-10 text-slate-300 px-2 py-1">
                            {j.west || 0}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <span className="fw-black" style={{ color: (j.total_vehicles || 0) > 50 ? "#ef4444" : (j.total_vehicles || 0) > 20 ? "#f59e0b" : "#10b981" }}>
                            {j.total_vehicles || 0}
                          </span>
                        </td>
                        <td className="pe-4">
                          <Badge bg={j.congestion_level === "High" ? "danger" : j.congestion_level === "Moderate" ? "warning" : "success"}
                            className="px-3 py-2 rounded-pill fw-black ls-1">
                            {(j.congestion_level || "Low").toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Green Corridor Modal */}
      <Modal show={showCorridorModal} onHide={() => setShowCorridorModal(false)} centered>
        <Modal.Header closeButton style={{ background: "#1e293b", color: "#e2e8f0", border: "none" }}>
          <Modal.Title className="fw-black">🚑 Activate Green Corridor</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: "#1e293b", color: "#e2e8f0" }}>
          <p className="small text-secondary">Ambulance Route Planning: Select the entry and exit points to calculate the fastest path and clear signals.</p>
          
          <div className="mb-3">
            <label className="xsmall fw-black text-indigo-400 ls-1 mb-2">PICKUP POINT (START)</label>
            <Form.Select
              style={{ background: "#0f172a", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.1)" }}
              value={corridorStart}
              onChange={(e) => setCorridorStart(e.target.value)}>
              <option value="">Choose Start Junction...</option>
              {junctions.map(j => (
                <option key={j.id} value={j.junction_id}>{j.location}</option>
              ))}
            </Form.Select>
          </div>

          <div>
            <label className="xsmall fw-black text-amber-400 ls-1 mb-2">DESTINATION (END)</label>
            <Form.Select
              style={{ background: "#0f172a", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.1)" }}
              value={corridorEnd}
              onChange={(e) => setCorridorEnd(e.target.value)}>
              <option value="">Choose End Junction...</option>
              {junctions.map(j => (
                <option key={j.id} value={j.junction_id}>{j.location}</option>
              ))}
            </Form.Select>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ background: "#1e293b", border: "none" }}>
          <Button variant="secondary" onClick={() => setShowCorridorModal(false)}>Cancel</Button>
          <Button variant="info" className="fw-bold px-4" onClick={triggerGreenCorridor} disabled={!corridorStart || !corridorEnd}>
            <FaAmbulance className="me-2" />Activate Emergency Path
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
