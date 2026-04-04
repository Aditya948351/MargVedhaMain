import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Spinner, Table } from "react-bootstrap";
import { FaExclamationTriangle, FaCheckCircle, FaClock, FaCircle } from "react-icons/fa";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";

const IncidentHub = () => {
  const [incidents, setIncidents] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Live incidents from simulation
    const unsubInc = onSnapshot(collection(db, "incidents"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIncidents(data);
      setLoading(false);
    });

    // Citizen reports from Android app
    const unsubReports = onSnapshot(collection(db, "citizen_reports"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(data);
    });

    return () => { unsubInc(); unsubReports(); };
  }, []);

  const activeIncidents = incidents.filter(i => i.active);
  const resolvedIncidents = incidents.filter(i => !i.active);

  const getSeverityColor = (s) => s === "High" ? "#ef4444" : s === "Medium" ? "#f59e0b" : "#10b981";
  const getTypeIcon = (t) => {
    switch (t) {
      case "accident": return "🚗💥";
      case "construction": return "🚧";
      case "vip_movement": return "🚔";
      case "waterlogging": return "🌊";
      case "road_block": return "🪵";
      default: return "⚠️";
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-5 text-center">
        <Spinner animation="border" variant="danger" />
        <p className="mt-3 text-secondary fw-bold">Scanning Incident Network...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4" style={{ background: "#0b1120", minHeight: "100vh", color: "#e2e8f0" }}>
      <div className="mb-4">
        <h2 className="fw-black d-flex align-items-center gap-3">
          <div className="p-2 rounded-3" style={{ background: "rgba(239,68,68,0.2)" }}>
            <FaExclamationTriangle style={{ color: "#f87171" }} />
          </div>
          INCIDENT HUB
        </h2>
        <p className="text-secondary fw-bold mb-0">Live incident tracking & citizen reports across Nashik</p>
      </div>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0">
            <Card.Body>
              <div className="small text-secondary fw-bold mb-2">ACTIVE INCIDENTS</div>
              <h2 className="fw-black mb-0" style={{ color: "#ef4444" }}>{activeIncidents.length}</h2>
              <div className="small mt-2" style={{ color: "#64748b" }}>Requiring attention</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0">
            <Card.Body>
              <div className="small text-secondary fw-bold mb-2">RESOLVED</div>
              <h2 className="fw-black mb-0" style={{ color: "#10b981" }}>{resolvedIncidents.length}</h2>
              <div className="small mt-2" style={{ color: "#64748b" }}>Cleared this session</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0">
            <Card.Body>
              <div className="small text-secondary fw-bold mb-2">CITIZEN REPORTS</div>
              <h2 className="fw-black mb-0" style={{ color: "#818cf8" }}>{reports.length}</h2>
              <div className="small mt-2" style={{ color: "#64748b" }}>From Android app</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0">
            <Card.Body>
              <div className="small text-secondary fw-bold mb-2">AVG CLEARANCE ETA</div>
              <h2 className="fw-black mb-0" style={{ color: "#f59e0b" }}>
                {activeIncidents.length ? Math.round(activeIncidents.reduce((a, i) => a + (i.clearance_eta_min || 30), 0) / activeIncidents.length) : 0}m
              </h2>
              <div className="small mt-2" style={{ color: "#64748b" }}>Estimated resolution time</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Active Incidents Table */}
      <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0 mb-4">
        <Card.Header className="bg-transparent border-0 py-3 d-flex justify-content-between align-items-center">
          <span className="fw-black" style={{ color: "#94a3b8" }}>🔴 ACTIVE INCIDENTS</span>
          <Badge bg="danger" className="px-3 py-2 rounded-pill">{activeIncidents.length} LIVE</Badge>
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0 table-borderless" style={{ color: "#e2e8f0" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <th className="ps-3 small fw-black" style={{ color: "#64748b" }}>Type</th>
                <th className="small fw-black" style={{ color: "#64748b" }}>Junction</th>
                <th className="small fw-black" style={{ color: "#64748b" }}>Description</th>
                <th className="small fw-black text-center" style={{ color: "#64748b" }}>Severity</th>
                <th className="small fw-black text-center" style={{ color: "#64748b" }}>ETA</th>
              </tr>
            </thead>
            <tbody>
              {activeIncidents.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-4 text-secondary">No active incidents — network clear ✅</td></tr>
              ) : activeIncidents.map(inc => (
                <tr key={inc.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td className="ps-3 fs-5">{getTypeIcon(inc.type)}</td>
                  <td>
                    <div className="fw-bold small">{inc.junction_name}</div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>{inc.junction_id}</div>
                  </td>
                  <td className="small">{inc.description || inc.type}</td>
                  <td className="text-center">
                    <Badge style={{ background: getSeverityColor(inc.severity) + "22", color: getSeverityColor(inc.severity), border: `1px solid ${getSeverityColor(inc.severity)}44` }}
                      className="px-2 py-1 rounded-pill fw-bold small">
                      {inc.severity}
                    </Badge>
                  </td>
                  <td className="text-center">
                    <span className="fw-black" style={{ color: "#f59e0b" }}>
                      <FaClock className="me-1" style={{ fontSize: 10 }} />{inc.clearance_eta_min || "?"}m
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Citizen Reports */}
      {reports.length > 0 && (
        <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0">
          <Card.Header className="bg-transparent border-0 py-3 d-flex justify-content-between align-items-center">
            <span className="fw-black" style={{ color: "#94a3b8" }}>📱 CITIZEN REPORTS (from Android App)</span>
            <Badge bg="primary" className="px-3 py-2 rounded-pill">{reports.length} REPORTS</Badge>
          </Card.Header>
          <Card.Body className="p-0">
            <Table hover responsive className="mb-0 table-borderless" style={{ color: "#e2e8f0" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="ps-3 small fw-black" style={{ color: "#64748b" }}>Image</th>
                  <th className="small fw-black" style={{ color: "#64748b" }}>Type</th>
                  <th className="small fw-black" style={{ color: "#64748b" }}>Description</th>
                  <th className="small fw-black" style={{ color: "#64748b" }}>Status</th>
                  <th className="small fw-black" style={{ color: "#64748b" }}>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td className="ps-3">
                      {r.image_url ? (
                        <img 
                          src={r.image_url} 
                          alt="Report" 
                          className="rounded" 
                          style={{ width: "40px", height: "40px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }} 
                        />
                      ) : (
                        <div className="rounded bg-dark d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px", border: "1px solid rgba(255,255,255,0.05)" }}>
                          📷
                        </div>
                      )}
                    </td>
                    <td className="fw-bold small align-middle" style={{ color: "#818cf8" }}>{r.type || "Report"}</td>
                    <td className="small align-middle">{r.description || "No description"}</td>
                    <td className="align-middle">
                      <Badge bg={r.status === "resolved" ? "success" : "warning"} className="rounded-pill small">
                        {r.status || "Pending"}
                      </Badge>
                    </td>
                    <td className="small align-middle" style={{ color: "#64748b" }}>{r.submitted_at || r.timestamp || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default IncidentHub;
