import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Image,
  Badge,
  Table,
  Dropdown,
} from "react-bootstrap";
import {
  FaTrafficLight,
  FaBus,
  FaLock,
  FaExclamationTriangle,
  FaMoneyBill,
  FaCar,
  FaSignOutAlt,
  FaCube,
  FaChartLine,
  FaUsers,
  FaAmbulance,
  FaUpload,
  FaExpandAlt,
  FaMapMarkerAlt,
  FaRobot,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";

/**
 * Unified Dashboard.jsx
 * - Inline <style> block embedded (no external CSS file needed)
 * - margin-left: 100px (space for persistent sidebar)
 * - Exactly 2 cards per row (Col md={6})
 * - Added Intersection selector (4 intersections)
 * - "Get AI Decisions" panel with signal statuses (Red/Green)
 * - Preserves: 3D Simulation modal + override, 1-hour prediction, uploads, legacy cards
 *
 * Usage:
 * <Dashboard onLogout={handleLogout} />
 */

/* --- Sample / demo data --- */
const sampleTrafficData = [
  { time: "09:00", vehicles: 120, predicted: 125 },
  { time: "09:10", vehicles: 140, predicted: 138 },
  { time: "09:20", vehicles: 190, predicted: 185 },
  { time: "09:30", vehicles: 220, predicted: 210 },
  { time: "09:40", vehicles: 260, predicted: 255 },
  { time: "09:50", vehicles: 230, predicted: 240 },
  { time: "10:00", vehicles: 210, predicted: 215 },
];

const intersectionsList = [
  {
    id: "gangapur",
    label: "Gangapur Road",
    cams: [{ id: "CAM101", vehicles: 240, congestion: "High" }],
  },
  {
    id: "college",
    label: "College Road",
    cams: [{ id: "CAM102", vehicles: 179, congestion: "Medium" }],
  },
  {
    id: "nashik",
    label: "Nashik Road",
    cams: [{ id: "CAM103", vehicles: 310, congestion: "Very High" }],
  },
  {
    id: "sharanpur",
    label: "Sharanpur Road",
    cams: [{ id: "CAM104", vehicles: 128, congestion: "Low" }],
  },
];

const initialSignalState = {
  "Gangapur Rd - North": "green",
  "Gangapur Rd - South": "red",
  "College Rd - East": "green",
  "College Rd - West": "red",
  "Nashik Rd - East": "red",
  "Sharanpur Rd - North": "green",
};

const nashikJunctions = [
  { id: 1, name: "CBS Circle", top: "45%", left: "50%" },
  { id: 2, name: "Ashok Stambh", top: "35%", left: "48%" },
  { id: 3, name: "Raviwar Karanja", top: "30%", left: "55%" },
  { id: 4, name: "Panchavati Karanja", top: "25%", left: "60%" },
  { id: 5, name: "Dwarka Circle", top: "60%", left: "65%" },
  { id: 6, name: "Mumbai Naka", top: "55%", left: "40%" },
  { id: 7, name: "City Centre Mall Signal", top: "48%", left: "30%" },
  { id: 8, name: "Trimbak Naka", top: "40%", left: "38%" },
  { id: 9, name: "Bapu Pool", top: "65%", left: "75%" },
  { id: 10, name: "Upnagar Naka", top: "75%", left: "70%" },
  { id: 11, name: "Bytco Point", top: "85%", left: "68%" },
  { id: 12, name: "Satpur Garware Point", top: "35%", left: "20%" },
  { id: 13, name: "ITI Signal", top: "45%", left: "22%" },
  { id: 14, name: "Pappu Samosa Signal", top: "50%", left: "52%" },
  { id: 15, name: "Govind Nagar Square", top: "60%", left: "45%" },
  { id: 16, name: "Indira Nagar Jogging Track", top: "65%", left: "50%" },
  { id: 17, name: "Pathardi Phata", top: "75%", left: "45%" },
  { id: 18, name: "Makhmalabad Naka", top: "15%", left: "50%" },
  { id: 19, name: "Mhasrul Naka", top: "10%", left: "60%" },
  { id: 20, name: "Adgaon Naka", top: "15%", left: "80%" }
];

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [trafficData, setTrafficData] = useState(sampleTrafficData);
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [simOverride, setSimOverride] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedIntersection, setSelectedIntersection] = useState(intersectionsList[0].id);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiDecisions, setAiDecisions] = useState(null);
  const [signalState, setSignalState] = useState(initialSignalState);

  const simulationUrl = "https://traffic-optimization-system.vercel.app/";

  /* Demo live update: keep charts lively; replace with real feed in production */
  useEffect(() => {
    const interval = setInterval(() => {
      setTrafficData((prev) => {
        const last = prev[prev.length - 1];
        const nextVehicles = Math.max(
          50,
          Math.round(last.vehicles + (Math.random() - 0.45) * 40)
        );
        const nextPred = Math.round(nextVehicles + (Math.random() - 0.3) * 20);
        const time = new Date();
        const minutes = time.getMinutes();
        const hh = time.getHours();
        const fmt = `${String(hh).padStart(2, "0")}:${String(
          minutes - (minutes % 10)
        ).padStart(2, "0")}`;
        const next = [...prev.slice(-6), { time: fmt, vehicles: nextVehicles, predicted: nextPred }];
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  /* Mock AI decisions (replace with real API call) */
  const fetchAiDecisions = () => {
    // Simulate network call latency
    setAiModalOpen(true);
    setAiDecisions(null);
    setTimeout(() => {
      const decisions = {
        summary: "Optimize signals on Nashik Road & Gangapur corridor; Create green corridor for upcoming ambulance route.",
        actions: [
          { id: 1, action: "Increase green on Nashik Rd by 20s", impact: "Reduce queue by ~30%" },
          { id: 2, action: "Prioritize Bus Route on College Rd (demand-based)", impact: "Reduce bus delays" },
          { id: 3, action: "Activate emergency green corridor (estimated time saved: 5 min)", impact: "Life-saving" },
        ],
        suggestedSignalStates: {
          "Gangapur Rd - North": "green",
          "Gangapur Rd - South": "green",
          "College Rd - East": "green",
          "College Rd - West": "red",
          "Nashik Rd - East": "red",
          "Sharanpur Rd - North": "green",
        },
      };
      setAiDecisions(decisions);
      setSignalState(decisions.suggestedSignalStates);
    }, 1200);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((file) => {
      return { file, url: URL.createObjectURL(file), name: file.name };
    });
    setUploadedImages((s) => [...mapped, ...s].slice(0, 8));
  };

  const removeImage = (idx) => setUploadedImages((s) => s.filter((_, i) => i !== idx));

  const openSim = (feature) => {
    setSimModalOpen(true);
    setSimOverride(false);
  };

  const overrideSim = () => setSimOverride(true);

  const getCurrentIntersectionData = () =>
    intersectionsList.find((it) => it.id === selectedIntersection) || intersectionsList[0];

  /* KPI static (demo) — you can replace these with computed values from real APIs */
  const kpi = {
    liveDensity: "70%",
    totalVehicles: 1064,
    congestion: "Very High",
    distribution: { veryHigh: 1, high: 2, medium: 1, low: 1 },
  };

  return (
    <Container fluid className="dashboard-container">

      <Row className="align-items-center mb-4">
        <Col>
          <h3 className="mb-0">🚦 Authority Dashboard 📶</h3>
          <p className="text-muted mb-0">Realtime monitoring • 1-hour prediction • 3D simulation preview</p>
        </Col>
      </Row>

      {/* KPI Row (two per row) */}
      <Row className="g-4">
        <Col xs={12} md={6}>
          <Card className="dashboard-large-card p-3 dashboard-bg-ice">
            <div>
              <Card.Title><FaChartLine className="me-2" /> Live Traffic Overview</Card.Title>
              <Card.Subtitle className="text-muted">Average across all monitored locations</Card.Subtitle>
            </div>

            <div style={{ display: "flex", gap: 18, marginTop: 12, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 34, fontWeight: 700 }}>{kpi.liveDensity}</div>
                <div className="dashboard-muted">Live Traffic Density</div>
              </div>

              <div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{kpi.totalVehicles}</div>
                <div className="dashboard-muted">Total Vehicles (monitored)</div>
              </div>

              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{kpi.congestion}</div>
                <div className="dashboard-muted">Congestion Level (distribution)</div>
                <div style={{ marginTop: 8 }}>
                  <Badge bg="danger" className="me-1">Very High: {kpi.distribution.veryHigh}</Badge>
                  <Badge bg="warning" className="me-1">High: {kpi.distribution.high}</Badge>
                  <Badge bg="primary" className="me-1">Medium: {kpi.distribution.medium}</Badge>
                  <Badge bg="success">Low: {kpi.distribution.low}</Badge>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
              <div className="dashboard-muted">Traffic Map • Real-time density visualization</div>
              <div>
                <Button variant="outline-primary" className="me-2" onClick={() => openSim("MapPreview")}>Map Preview</Button>
                <Button variant="primary" onClick={() => navigate("/map")}>Open Map</Button>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="dashboard-large-card p-3 dashboard-bg-warm">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <Card.Title><FaTrafficLight className="me-2" /> Per-Intersection Snapshot</Card.Title>
                <Card.Subtitle className="text-muted">Select an intersection to view detailed metrics</Card.Subtitle>
              </div>
              <div>
                <Form.Select value={selectedIntersection} onChange={(e) => setSelectedIntersection(e.target.value)}>
                  {intersectionsList.map((it) => (
                    <option key={it.id} value={it.id}>{it.label}</option>
                  ))}
                </Form.Select>
              </div>
            </div>

            {/* Intersection details: cameras + small stats */}
            <div style={{ marginTop: 14 }}>
              <h6 style={{ marginBottom: 8 }}>{getCurrentIntersectionData().label}</h6>

              <Table size="sm" bordered responsive>
                <thead>
                  <tr>
                    <th>Camera</th>
                    <th>Location</th>
                    <th>Vehicles</th>
                    <th>Congestion</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentIntersectionData().cams.map((cam) => (
                    <tr key={cam.id}>
                      <td>{cam.id}</td>
                      <td>{getCurrentIntersectionData().label}</td>
                      <td>{cam.vehicles}</td>
                      <td>{cam.congestion}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <div style={{ flex: 1 }}>
                  <small className="dashboard-muted">Live Traffic Density</small>
                  <div style={{ fontWeight: 700 }}>{Math.round((getCurrentIntersectionData().cams.reduce((s, c) => s + c.vehicles, 0) / 3) || 70)}%</div>
                </div>
                <div style={{ flex: 1 }}>
                  <small className="dashboard-muted">Active Cameras</small>
                  <div style={{ fontWeight: 700 }}>{getCurrentIntersectionData().cams.length}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <small className="dashboard-muted">Top Concern</small>
                  <div style={{ fontWeight: 700 }}>{getCurrentIntersectionData().cams[0].congestion}</div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end" style={{ marginTop: 12 }}>
              <Button variant="outline-secondary" onClick={() => navigate("/intersection-details")}>Open Details</Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Primary row: Prediction chart + Intersection KPIs */}
      <Row className="g-4 mt-3">
        <Col xs={12} md={6}>
          <Card className="dashboard-large-card p-3">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <Card.Title><FaChartLine className="me-2" /> Live Traffic Volume & Prediction</Card.Title>
                <Card.Subtitle className="text-muted">Vehicle counts — rolling 1 hour</Card.Subtitle>
              </div>
              <div>
                <Button variant="outline-secondary" className="me-2" onClick={() => navigate("/TrafficCounting")}>Open</Button>
                <Button variant="outline-primary" onClick={() => navigate("/export-traffic-csv")}>Export</Button>
              </div>
            </div>

            <div className="dashboard-graph-area mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="vehicles" stroke="#2b7cff" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="predicted" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
              <div className="dashboard-muted">Last updated: live (demo)</div>
              <div className="dashboard-status-group">
                <Badge bg="success">Healthy</Badge>
                <Badge bg="light" text="dark" className="ms-2">Avg speed: 32 km/h</Badge>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="dashboard-large-card p-3">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <Card.Title><FaTrafficLight className="me-2" /> Intersection Health & Signals</Card.Title>
                <Card.Subtitle className="text-muted">Occupancy, queue lengths, violations & signal states</Card.Subtitle>
              </div>
              <div>
                <Button variant="outline-secondary" onClick={() => navigate("/kpi-dashboard")}>Open KPIs</Button>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={trafficData}>
                  <defs>
                    <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2b7cff" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#2b7cff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area type="monotone" dataKey="vehicles" stroke="#2b7cff" strokeWidth={2} fillOpacity={1} fill="url(#colorVehicles)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Card.Text className="mb-1"><strong>Top Concern</strong></Card.Text>
                  <small className="dashboard-muted">Queue at Central Ave — suggest +15s green</small>
                </div>
                <div>
                  <Button variant="primary" className="me-2" onClick={() => navigate("/signal-adjust")}>Apply RL Suggestion</Button>
                  <Button variant="outline-info" onClick={() => fetchAiDecisions()}><FaRobot className="me-2" /> Get AI Decisions</Button>
                </div>
              </div>

              {/* Signal states */}
              <div style={{ marginTop: 12 }}>
                <h6 style={{ marginBottom: 8 }}>Signal States</h6>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {Object.keys(signalState).map((k) => (
                    <div key={k} className="p-2 mb-2 rounded bg-white border" style={{ minWidth: 200 }}>
                      <span className={`signal-dot ${signalState[k] === "green" ? "signal-green" : "signal-red"}`} aria-hidden="true" />
                      <strong className="text-dark">{k}</strong>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: "4px" }}>
                        {signalState[k].toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Legacy / secondary cards (2 per row) */}
      <Row className="g-4 mt-3">
        <Col xs={12} md={6}>
          <Card className="dashboard-medium-card p-3">
            <Card.Title><FaBus className="me-2" /> Bus Route Optimization</Card.Title>
            <Card.Text>Dynamic route planning based on passenger demand & traffic.</Card.Text>
            <Button variant="success" onClick={() => navigate("/BusRouteOptimization")}>🗺️ View Routes</Button>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="dashboard-medium-card p-3">
            <Card.Title><FaLock className="me-2" /> Secure Ticketing (Blockchain)</Card.Title>
            <Card.Text>Secure & transparent ticketing system for public transport.</Card.Text>
            <Button variant="info" onClick={() => navigate("/BlockChainTicketing")}>💳 View Transactions</Button>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="dashboard-medium-card p-3">
            <Card.Title><FaExclamationTriangle className="me-2" /> Emergency Response</Card.Title>
            <Card.Text>Integrates with emergency services for quick accident response.</Card.Text>
            <Button variant="danger" onClick={() => navigate("/EmergencyAlerts")}>🚑 Emergency Alerts</Button>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="dashboard-medium-card p-3">
            <Card.Title><FaMoneyBill className="me-2" /> Automatic Fare Adjustments</Card.Title>
            <Card.Text>Dynamic fare calculation for taxis & rickshaws based on traffic.</Card.Text>
            <Button variant="warning" onClick={() => navigate("/AutoFareAdjustments")}>💵 View Fare Updates</Button>
          </Card>
        </Col>
      </Row>

      {/* Uploads + Quick Actions (2 per row) */}
      <Row className="g-4 mt-3">
        <Col xs={12} md={6}>
          <Card className="p-3">
            <Card.Title><FaUpload className="me-2" /> Attach Images / Footage</Card.Title>
            <Card.Text className="dashboard-muted">Upload camera snapshots, incident images. (Max 8 thumbnails)</Card.Text>

            <Form>
              <Form.Group controlId="uploadImages" className="d-flex gap-2 align-items-center">
                <Form.Control type="file" accept="image/*" multiple onChange={handleImageUpload} />
                <Button variant="outline-secondary" onClick={() => setUploadedImages([])}>Clear</Button>
              </Form.Group>
            </Form>

            <div className="d-flex gap-2 flex-wrap mt-3">
              {uploadedImages.length === 0 && <small className="dashboard-muted">No images uploaded yet</small>}
              {uploadedImages.map((img, idx) => (
                <div key={idx} style={{ position: "relative" }}>
                  <Image src={img.url} className="dashboard-upload-thumb" />
                  <Button size="sm" variant="danger" style={{ position: "absolute", top: -8, right: -8, borderRadius: "50%" }} onClick={() => removeImage(idx)}>×</Button>
                  <div className="dashboard-thumb-label">{img.name}</div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="p-3">
            <Card.Title><FaUsers className="me-2" /> Quick Actions</Card.Title>
            <div className="d-grid gap-2">
              <Button variant="outline-primary" onClick={() => navigate("/CitizenReports")}>Open Reports</Button>
              <Button variant="outline-warning" onClick={() => navigate("/EmergencyCorridors")}>Activate Corridor</Button>
              <Button variant="outline-success" onClick={() => navigate("/analytics")}>Open Analytics</Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Historical / Location Analysis (two per row) */}
      <Row className="g-4 mt-3">
        <Col xs={12} md={6}>
          <Card className="dashboard-medium-card p-3">
            <Card.Title>Historical Traffic Analysis</Card.Title>
            <Card.Subtitle className="text-muted">Last 7 Days — Trends & hourly patterns</Card.Subtitle>

            <div style={{ height: 180, marginTop: 12 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "GangapurRoad", v: 240 },
                  { name: "CollegeRoad", v: 179 },
                  { name: "NashikRoad", v: 310 },
                  { name: "SharanpurRoad", v: 128 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="v" fill="#2b7cff" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ marginTop: 8 }}>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>Nashik Road has the highest traffic volume and congestion.</li>
                <li>Sharanpur Road has the lowest traffic volume and congestion.</li>
                <li>Gangapur & Trimbak show similar congestion despite different counts.</li>
              </ul>
            </div>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="dashboard-medium-card p-3">
            <Card.Title>Traffic Monitoring Data</Card.Title>
            <Card.Subtitle className="text-muted">Live camera table across monitored locations</Card.Subtitle>

            <Table size="sm" responsive className="mt-3">
              <thead>
                <tr>
                  <th>Camera</th>
                  <th>Location</th>
                  <th>Vehicles</th>
                  <th>Congestion</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>CAM101</td><td>Gangapur Road</td><td>240</td><td>High</td></tr>
                <tr><td>CAM102</td><td>College Road</td><td>179</td><td>Medium</td></tr>
                <tr><td>CAM103</td><td>Nashik Road</td><td>310</td><td>Very High</td></tr>
                <tr><td>CAM104</td><td>Sharanpur Road</td><td>128</td><td>Low</td></tr>
                <tr><td>CAM105</td><td>Trimbak Road</td><td>207</td><td>High</td></tr>
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>

      {/* 3D Simulation map preview */}
      <Modal show={simModalOpen} onHide={() => setSimModalOpen(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title><FaMapMarkerAlt className="me-2 text-primary" /> Live 3D Simulation Map - Nashik City</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ minHeight: 600, padding: 0, position: "relative", background: "#111827" }}>
          
          <img 
            src="/nashik_3d_map.png" 
            alt="Nashik 3D Map Preview" 
            style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", opacity: 0.8 }} 
            onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=2000&auto=format&fit=crop"; }}
          />

          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
            {nashikJunctions.map((j) => (
              <div
                key={j.id}
                className="map-marker-hover"
                style={{
                  position: "absolute",
                  top: j.top,
                  left: j.left,
                  transform: "translate(-50%, -50%)",
                  background: "rgba(15, 23, 42, 0.9)",
                  border: "2px solid #3b82f6",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  boxShadow: "0 0 12px rgba(59, 130, 246, 0.6)",
                  transition: "all 0.2s"
                }}
              >
                <div style={{
                  background: "#10b981", 
                  width: "10px", 
                  height: "10px", 
                  borderRadius: "50%", 
                  marginRight: "6px",
                  boxShadow: "0 0 8px #10b981"
                }}></div>
                {j.id}. {j.name}
              </div>
            ))}
          </div>

        </Modal.Body>
        <Modal.Footer>
          <div className="w-100 d-flex justify-content-between align-items-center text-muted">
            <small>Traffic overlay actively tracking 20 main junctions in Nashik.</small>
            <Button variant="secondary" onClick={() => setSimModalOpen(false)}>Close Map</Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* AI Decisions modal */}
      <Modal show={aiModalOpen} onHide={() => setAiModalOpen(false)} centered size="lg">
        <Modal.Header closeButton><Modal.Title>AI Decisions</Modal.Title></Modal.Header>
        <Modal.Body>
          {!aiDecisions ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status" />
              <div className="mt-2">Fetching AI decisions...</div>
            </div>
          ) : (
            <div>
              <h6>Summary</h6>
              <p>{aiDecisions.summary}</p>
              <h6>Actions</h6>
              <ul>
                {aiDecisions.actions.map((a) => <li key={a.id}><strong>{a.action}:</strong> {a.impact}</li>)}
              </ul>
              <h6>Suggested Signal States</h6>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.keys(aiDecisions.suggestedSignalStates).map((k) => (
                  <div key={k} style={{ padding: 8, borderRadius: 8, background: "#fff", boxShadow: "0 4px 8px rgba(0,0,0,0.04)" }}>
                    <span className={`signal-dot ${aiDecisions.suggestedSignalStates[k] === "green" ? "signal-green" : "signal-red"}`} />
                    {k} — {aiDecisions.suggestedSignalStates[k].toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setAiModalOpen(false)}>Close</Button></Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Dashboard;
