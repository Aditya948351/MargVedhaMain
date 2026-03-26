import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Table, Badge, Spinner, Button } from "react-bootstrap";
import { FaCity, FaMapMarkedAlt, FaTrafficLight, FaCarSide, FaUserShield, FaExternalLinkAlt, FaWind, FaSmile, FaProjectDiagram, FaSyncAlt } from "react-icons/fa";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [policeData, setPoliceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoliceData = async () => {
      try {
        const q = query(collection(db, "traffic_police"), orderBy("junctionId", "asc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPoliceData(data);
      } catch (error) {
        console.error("Error fetching police data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPoliceData();
  }, []);

  const totalVehicles = policeData.reduce((acc, curr) => acc + (curr.liveVehicleCount || 0), 0);
  const congestedJunctions = policeData.filter(p => p.status === "Congested").length;
  
  // Psychological & ML Mock Data for Graphs
  const chartData = policeData.map(p => ({
    name: p.junctionName,
    vehicles: p.liveVehicleCount || 0,
    pm25: 40 + (p.liveVehicleCount / 4) + Math.random() * 10,
    frustration: p.status === 'Congested' ? 8.5 : p.status === 'Clear' ? 2.1 : 5.4
  })).slice(0, 10);

  const avgFrustration = (chartData.reduce((acc, curr) => acc + curr.frustration, 0) / (chartData.length || 1)).toFixed(1);

  return (
    <Container fluid className="admin-dashboard-container">
      <Row className="mb-4">
        <Col>
          <h2 className="text-white"><FaUserShield className="me-2 text-primary" /> City Authority Control Room</h2>
          <p className="text-muted">Nashik Central Command - Real-Time Overview of all 20 Junctions</p>
        </Col>
      </Row>

        <Col md={3}>
          <Card className="metric-card border-left-primary bg-dark border-0 shadow">
            <Card.Body>
              <h6 className="text-muted text-uppercase xsmall mb-1">City Scale</h6>
              <h2 className="text-white mb-0">20 <small className="fs-6 opacity-50">Hubs</small></h2>
              <div className="text-primary xsmall fw-bold mt-2"><FaProjectDiagram /> A* ROUTING ACTIVE</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card border-left-success bg-dark border-0 shadow">
            <Card.Body>
              <h6 className="text-muted text-uppercase xsmall mb-1">Live Vehicle Flow</h6>
              <h2 className="text-white mb-0">{loading ? "..." : totalVehicles.toLocaleString()}</h2>
              <div className="text-success xsmall fw-bold mt-2">↑ 12% FROM PREV HOUR</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card border-left-danger bg-dark border-0 shadow">
            <Card.Body>
              <h6 className="text-muted text-uppercase xsmall mb-1">Pollution Index</h6>
              <h2 className="text-white mb-0">74 <small className="fs-6 opacity-50">PM2.5</small></h2>
              <div className="text-danger xsmall fw-bold mt-2"><FaWind /> MODERATE RISK</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="metric-card border-left-warning bg-dark border-0 shadow">
            <Card.Body>
              <h6 className="text-muted text-uppercase xsmall mb-1">Psychology Index</h6>
              <h2 className="text-white mb-0">{avgFrustration} <small className="fs-6 opacity-50">/ 10</small></h2>
              <div className="text-warning xsmall fw-bold mt-2"><FaSmile /> FRUSTRATION LEVEL</div>
            </Card.Body>
          </Card>
        </Col>

      <Row className="mb-5">
        <Col lg={8}>
          <Card className="bg-dark-card border-0 shadow-lg h-100">
            <Card.Header className="bg-transparent border-secondary text-white fw-bold py-3">
              LIVE TRAFFIC VOLUME VS PM 2.5 (TOP 10 JUNCTIONS)
            </Card.Header>
            <Card.Body style={{ height: "350px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} angle={-30} textAnchor="end" height={60} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="vehicles" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Vehicles" />
                  <Bar dataKey="pm25" fill="#10b981" radius={[4, 4, 0, 0]} name="PM 2.5" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="bg-dark-card border-0 shadow-lg h-100">
            <Card.Header className="bg-transparent border-secondary text-white fw-bold py-3">
              FRUSTRATION INDEX HEATMAP
            </Card.Header>
            <Card.Body style={{ height: "350px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" hide />
                  <YAxis domain={[0, 10]} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="frustration" stroke="#f59e0b" strokeWidth={3} dot={{ r: 6 }} name="Psych Score" />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4 g-4">
           {/* New Operational Status Card */}
           <Col lg={12}>
              <div className="bg-slate-900 border border-white border-opacity-10 p-4 rounded-3xl shadow-xl d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-4">
                   <div className="p-3 bg-emerald-600 bg-opacity-20 text-emerald-500 rounded-2xl border border-emerald-500 border-opacity-20 animate-pulse">
                      <FaSyncAlt className="spin-slow" />
                   </div>
                   <div>
                      <h5 className="text-white fw-bold mb-1">Q-LEARNING AGENT: ACTIVE</h5>
                      <p className="text-slate-400 small mb-0 ls-1">Policy Optimizer running on Nashik Urban Grid | Learning Step: 24,102</p>
                   </div>
                </div>
                <div className="d-flex gap-5 px-4">
                   <div className="text-center">
                      <div className="text-slate-500 tiny fw-bold ls-1 mb-1">LATENCY REDUCTION</div>
                      <div className="text-blue-400 fw-black fs-5">18.4%</div>
                   </div>
                   <div className="text-center border-left border-white border-opacity-10 ps-5">
                      <div className="text-slate-500 tiny fw-bold ls-1 mb-1">FUEL SAVED (EST)</div>
                      <div className="text-emerald-400 fw-black fs-5">420L/Day</div>
                   </div>
                </div>
              </div>
           </Col>
        </Row>

        <Row>
        <Col xl={12} className="mb-4">
          <Card className="bg-dark-card border-0 shadow-lg">
            <Card.Header className="bg-transparent border-bottom border-secondary pt-4 pb-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-white">4-Way Junction Telemetry & Multi-Modal Enforcement</h5>
              <Badge bg="primary">A* ALGORITHM ENABLED</Badge>
            </Card.Header>
            <Card.Body className="p-0 table-responsive">
              {loading ? (
                <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
              ) : (
                <Table hover variant="dark" className="mb-0 align-middle">
                  <thead>
                    <tr className="text-uppercase xsmall text-muted">
                      <th>ID</th>
                      <th>Intersection</th>
                      <th className="text-center">North (In/Out)</th>
                      <th className="text-center">South (In/Out)</th>
                      <th className="text-center">East (In/Out)</th>
                      <th className="text-center">West (In/Out)</th>
                      <th className="text-center">Psych Level</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policeData.map((row) => (
                      <tr key={row.id}>
                        <td>{row.junctionId}</td>
                        <td className="fw-bold text-info">{row.junctionName}</td>
                        <td className="text-center text-white-50 small">
                          {Math.floor(row.liveVehicleCount/4)} / {Math.floor(row.liveVehicleCount/5)}
                        </td>
                        <td className="text-center text-white-50 small">
                          {Math.floor(row.liveVehicleCount/4.2)} / {Math.floor(row.liveVehicleCount/4.8)}
                        </td>
                        <td className="text-center text-white-50 small">
                          {Math.floor(row.liveVehicleCount/3.8)} / {Math.floor(row.liveVehicleCount/5.2)}
                        </td>
                        <td className="text-center text-white-50 small">
                          {Math.floor(row.liveVehicleCount/4.5)} / {Math.floor(row.liveVehicleCount/4.5)}
                        </td>
                        <td className="text-center fw-bold">
                          <span className={row.status === 'Congested' ? 'text-danger' : 'text-success'}>
                            {row.status === 'Congested' ? '8.2/10' : '2.4/10'}
                          </span>
                        </td>
                        <td>
                          <Badge bg={row.status === 'Congested' ? 'danger' : 'success'} className="ls-1">
                            {row.status}
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
    </Container>
  );
};

export default AdminDashboard;
