import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Spinner, Table } from "react-bootstrap";
import { FaBus, FaRoute, FaClock, FaCircle } from "react-icons/fa";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const PublicTransport = () => {
  const [busRoutes, setBusRoutes] = useState([]);
  const [junctions, setJunctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubBus = onSnapshot(collection(db, "bus_routes"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBusRoutes(data);
      setLoading(false);
    });

    const unsubJunc = onSnapshot(collection(db, "junctions"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJunctions(data);
    });

    return () => { unsubBus(); unsubJunc(); };
  }, []);

  const totalPassengerLoad = busRoutes.reduce((a, r) => a + (r.total_vehicle_load || 0), 0);
  const avgEta = busRoutes.length ? Math.round(busRoutes.reduce((a, r) => a + (r.eta_minutes || 0), 0) / busRoutes.length) : 0;
  const heavyRoutes = busRoutes.filter(r => r.congestion === "Heavy").length;

  const getCongestionColor = (c) => c === "Heavy" ? "#ef4444" : c === "Moderate" ? "#f59e0b" : "#10b981";

  // Compute surge multiplier based on junction traffic near stops
  const computeSurge = (stops) => {
    if (!stops || !junctions.length) return 1.0;
    const totalTraffic = stops.reduce((a, stopId) => {
      const j = junctions.find(jn => jn.junction_id === stopId);
      return a + (j ? j.total_vehicles : 0);
    }, 0);
    if (totalTraffic > 120) return 2.5;
    if (totalTraffic > 80) return 1.8;
    if (totalTraffic > 40) return 1.3;
    return 1.0;
  };

  if (loading) {
    return (
      <Container fluid className="py-5 text-center">
        <Spinner animation="border" variant="success" />
        <p className="mt-3 text-secondary fw-bold">Loading Transit Network...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4" style={{ background: "#0b1120", minHeight: "100vh", color: "#e2e8f0" }}>
      <div className="mb-4">
        <h2 className="fw-black d-flex align-items-center gap-3">
          <div className="p-2 rounded-3" style={{ background: "rgba(16,185,129,0.2)" }}>
            <FaBus style={{ color: "#34d399" }} />
          </div>
          PUBLIC TRANSPORT HUB
        </h2>
        <p className="text-secondary fw-bold mb-0">Live bus ETAs & auto-rickshaw surge monitoring</p>
      </div>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0">
            <Card.Body>
              <div className="small text-secondary fw-bold mb-2">ACTIVE ROUTES</div>
              <h2 className="fw-black mb-0" style={{ color: "#34d399" }}>{busRoutes.length}</h2>
              <div className="small mt-2" style={{ color: "#64748b" }}>City bus services tracked</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0">
            <Card.Body>
              <div className="small text-secondary fw-bold mb-2">AVG ETA</div>
              <h2 className="fw-black mb-0" style={{ color: "#818cf8" }}>{avgEta}m</h2>
              <div className="small mt-2" style={{ color: "#64748b" }}>Average across all routes</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0">
            <Card.Body>
              <div className="small text-secondary fw-bold mb-2">HEAVY ROUTES</div>
              <h2 className="fw-black mb-0" style={{ color: "#ef4444" }}>{heavyRoutes}</h2>
              <div className="small mt-2" style={{ color: "#64748b" }}>Routes with severe congestion</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0">
            <Card.Body>
              <div className="small text-secondary fw-bold mb-2">TOTAL VEHICLE LOAD</div>
              <h2 className="fw-black mb-0" style={{ color: "#f59e0b" }}>{totalPassengerLoad}</h2>
              <div className="small mt-2" style={{ color: "#64748b" }}>Vehicles on route corridors</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bus Routes Table */}
      <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0 mb-4">
        <Card.Header className="bg-transparent border-0 py-3 fw-black" style={{ color: "#94a3b8" }}>
          🚌 LIVE BUS ROUTE ETAs
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0 table-borderless" style={{ color: "#e2e8f0" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <th className="ps-3 small fw-black" style={{ color: "#64748b" }}>Route</th>
                <th className="small fw-black" style={{ color: "#64748b" }}>Name</th>
                <th className="small fw-black text-center" style={{ color: "#64748b" }}>ETA</th>
                <th className="small fw-black text-center" style={{ color: "#64748b" }}>Congestion</th>
                <th className="small fw-black text-center" style={{ color: "#64748b" }}>Vehicle Load</th>
                <th className="small fw-black text-center" style={{ color: "#64748b" }}>Auto Surge</th>
              </tr>
            </thead>
            <tbody>
              {busRoutes.map(route => {
                const surge = computeSurge(route.stops);
                return (
                  <tr key={route.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td className="ps-3">
                      <Badge bg="primary" className="px-2 py-1 rounded-pill fw-bold">{route.route_id}</Badge>
                    </td>
                    <td>
                      <div className="fw-bold small">{route.route_name}</div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>{(route.stops || []).length} stops</div>
                    </td>
                    <td className="text-center">
                      <span className="fw-black" style={{ color: "#818cf8" }}>
                        <FaClock className="me-1" style={{ fontSize: 10 }} />{route.eta_minutes}m
                      </span>
                    </td>
                    <td className="text-center">
                      <Badge style={{ background: getCongestionColor(route.congestion) + "22", color: getCongestionColor(route.congestion), border: `1px solid ${getCongestionColor(route.congestion)}44` }}
                        className="px-2 py-1 rounded-pill fw-bold small">
                        <FaCircle className="me-1" style={{ fontSize: 5 }} />{route.congestion}
                      </Badge>
                    </td>
                    <td className="text-center fw-bold small">{route.total_vehicle_load || 0}</td>
                    <td className="text-center">
                      <span className="fw-black" style={{ color: surge > 1.5 ? "#ef4444" : surge > 1.0 ? "#f59e0b" : "#10b981" }}>
                        {surge.toFixed(1)}x
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Stop-Level Breakdown */}
      <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0">
        <Card.Header className="bg-transparent border-0 py-3 fw-black" style={{ color: "#94a3b8" }}>
          🛑 STOP-LEVEL TRAFFIC BREAKDOWN
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            {busRoutes.map(route => (
              <Col md={6} lg={4} key={route.id}>
                <div style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: 16 }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Badge bg="primary" className="rounded-pill fw-bold">{route.route_id}</Badge>
                    <span className="small fw-bold" style={{ color: getCongestionColor(route.congestion) }}>{route.congestion}</span>
                  </div>
                  <div className="small fw-bold mb-2" style={{ color: "#94a3b8" }}>{route.route_name}</div>
                  {(route.stops || []).map((stopId, i) => {
                    const j = junctions.find(jn => jn.junction_id === stopId);
                    const count = j ? j.total_vehicles : 0;
                    return (
                      <div key={i} className="d-flex justify-content-between align-items-center mb-1">
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>
                          <FaCircle className="me-1" style={{ fontSize: 5, color: count > 40 ? "#ef4444" : count > 15 ? "#f59e0b" : "#10b981" }} />
                          {j ? j.location : stopId}
                        </span>
                        <span className="fw-bold" style={{ fontSize: 11, color: count > 40 ? "#ef4444" : "#94a3b8" }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PublicTransport;
