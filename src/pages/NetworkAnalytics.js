import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Spinner, Table } from "react-bootstrap";
import { FaProjectDiagram, FaNetworkWired, FaArrowUp, FaArrowDown, FaCircle } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const NetworkAnalytics = () => {
  const [junctions, setJunctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "junctions"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => (b.total_vehicles || 0) - (a.total_vehicles || 0));
      setJunctions(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const totalVehicles = junctions.reduce((a, j) => a + (j.total_vehicles || 0), 0);
  const avgCongestion = junctions.length ? (junctions.filter(j => j.congestion_level === "High").length / junctions.length * 100).toFixed(1) : 0;
  const gridSaturation = junctions.length ? (totalVehicles / (junctions.length * 60) * 100).toFixed(1) : 0;
  const topCritical = junctions.filter(j => (j.total_vehicles || 0) > 50);

  const chartData = junctions.slice(0, 15).map(j => ({
    name: (j.location || j.junction_id || "").split(" ")[0],
    vehicles: j.total_vehicles || 0,
    congestion: j.congestion_level === "High" ? 90 : j.congestion_level === "Moderate" ? 55 : 20,
  }));

  const getBarColor = (val) => val > 50 ? "#ef4444" : val > 20 ? "#f59e0b" : "#10b981";

  if (loading) {
    return (
      <Container fluid className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-secondary fw-bold">Connecting to Network Mesh...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4" style={{ background: "#0b1120", minHeight: "100vh", color: "#e2e8f0" }}>
      <div className="mb-4">
        <h2 className="fw-black d-flex align-items-center gap-3">
          <div className="p-2 rounded-3" style={{ background: "rgba(99,102,241,0.2)" }}>
            <FaNetworkWired style={{ color: "#818cf8" }} />
          </div>
          NETWORK ANALYTICS
        </h2>
        <p className="text-secondary fw-bold mb-0">Real-time graph-theory analysis across {junctions.length} nodes</p>
      </div>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0">
            <Card.Body>
              <div className="small text-secondary fw-bold mb-2">CITY-WIDE VEHICLE LOAD</div>
              <h2 className="fw-black mb-0" style={{ color: "#818cf8" }}>{totalVehicles.toLocaleString()}</h2>
              <div className="small mt-2" style={{ color: "#64748b" }}>Across {junctions.length} active nodes</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0">
            <Card.Body>
              <div className="small text-secondary fw-bold mb-2">GRID SATURATION INDEX</div>
              <h2 className="fw-black mb-0" style={{ color: parseFloat(gridSaturation) > 70 ? "#ef4444" : parseFloat(gridSaturation) > 40 ? "#f59e0b" : "#10b981" }}>
                {gridSaturation}%
              </h2>
              <div className="small mt-2" style={{ color: "#64748b" }}>Network capacity utilization</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0">
            <Card.Body>
              <div className="small text-secondary fw-bold mb-2">CRITICAL NODES</div>
              <h2 className="fw-black mb-0" style={{ color: "#ef4444" }}>{topCritical.length}</h2>
              <div className="small mt-2" style={{ color: "#64748b" }}>Junctions above capacity (&gt;50)</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0">
            <Card.Body>
              <div className="small text-secondary fw-bold mb-2">CONGESTION RATIO</div>
              <h2 className="fw-black mb-0" style={{ color: "#f59e0b" }}>{avgCongestion}%</h2>
              <div className="small mt-2" style={{ color: "#64748b" }}>Percentage of high-congestion nodes</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0">
            <Card.Header className="bg-transparent border-0 py-3 fw-black" style={{ color: "#94a3b8" }}>
              JUNCTION VEHICLE DISTRIBUTION
            </Card.Header>
            <Card.Body style={{ height: "380px" }}>
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
        <Col lg={4}>
          <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)", maxHeight: "450px", overflowY: "auto" }} className="border-0">
            <Card.Header className="bg-transparent border-0 py-3 fw-black" style={{ color: "#94a3b8" }}>
              CONGESTION RANKING (LIVE)
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="mb-0 table-borderless" style={{ color: "#e2e8f0" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <th className="ps-3 small fw-black" style={{ color: "#64748b" }}>#</th>
                    <th className="small fw-black" style={{ color: "#64748b" }}>Junction</th>
                    <th className="text-end pe-3 small fw-black" style={{ color: "#64748b" }}>Load</th>
                  </tr>
                </thead>
                <tbody>
                  {junctions.map((j, i) => (
                    <tr key={j.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <td className="ps-3">
                        <Badge bg="dark" className="border border-white border-opacity-10" style={{ minWidth: 28 }}>{i + 1}</Badge>
                      </td>
                      <td>
                        <div className="fw-bold small">{j.location || j.junction_id}</div>
                        <div style={{ fontSize: 10, color: "#64748b" }}>
                          <FaCircle style={{ color: j.congestion_level === "High" ? "#ef4444" : j.congestion_level === "Moderate" ? "#f59e0b" : "#10b981", fontSize: 6 }} className="me-1" />
                          {j.congestion_level || "Low"}
                        </div>
                      </td>
                      <td className="text-end pe-3 fw-black" style={{ color: (j.total_vehicles || 0) > 50 ? "#ef4444" : (j.total_vehicles || 0) > 20 ? "#f59e0b" : "#10b981" }}>
                        {j.total_vehicles || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NetworkAnalytics;
