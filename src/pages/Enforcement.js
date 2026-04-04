import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Spinner, Table } from "react-bootstrap";
import { FaCamera, FaShieldAlt, FaMoneyBill, FaCircle } from "react-icons/fa";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";

const Enforcement = () => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "violations"), orderBy("timestamp", "desc"), limit(50)),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setViolations(data);
        setLoading(false);
      },
      (err) => {
        console.error("Violations listener error:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const totalFines = violations.reduce((a, v) => a + (v.fine_amount || 0), 0);

  const violationBreakdown = {};
  violations.forEach(v => {
    violationBreakdown[v.type] = (violationBreakdown[v.type] || 0) + 1;
  });

  const getTypeColor = (t) => {
    switch (t) {
      case "Helmet Missing": return "#ef4444";
      case "Signal Jump": return "#f59e0b";
      case "Wrong Way Driving": return "#7c3aed";
      case "Overspeeding": return "#f97316";
      case "Triple Riding": return "#ec4899";
      default: return "#64748b";
    }
  };

  const getTypeEmoji = (t) => {
    switch (t) {
      case "Helmet Missing": return "🪖";
      case "Signal Jump": return "🚦";
      case "Wrong Way Driving": return "↩️";
      case "Overspeeding": return "💨";
      case "Triple Riding": return "🛵";
      default: return "⚠️";
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-5 text-center">
        <Spinner animation="border" variant="warning" />
        <p className="mt-3 text-secondary fw-bold">Loading Enforcement Data...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4" style={{ background: "#0b1120", minHeight: "100vh", color: "#e2e8f0" }}>
      <div className="mb-4">
        <h2 className="fw-black d-flex align-items-center gap-3">
          <div className="p-2 rounded-3" style={{ background: "rgba(245,158,11,0.2)" }}>
            <FaShieldAlt style={{ color: "#fbbf24" }} />
          </div>
          ENFORCEMENT PANEL
        </h2>
        <p className="text-secondary fw-bold mb-0">AI-powered violation detection & automated E-Challans</p>
      </div>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0">
            <Card.Body>
              <div className="small text-secondary fw-bold mb-2">TOTAL VIOLATIONS</div>
              <h2 className="fw-black mb-0" style={{ color: "#ef4444" }}>{violations.length}</h2>
              <div className="small mt-2" style={{ color: "#64748b" }}>Detected this session</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0">
            <Card.Body>
              <div className="small text-secondary fw-bold mb-2">FINES COLLECTED</div>
              <h2 className="fw-black mb-0" style={{ color: "#10b981" }}>₹{totalFines.toLocaleString()}</h2>
              <div className="small mt-2" style={{ color: "#64748b" }}>Automated E-Challans</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0">
            <Card.Body>
              <div className="small text-secondary fw-bold mb-2">TOP VIOLATION</div>
              <h2 className="fw-black mb-0" style={{ color: "#f59e0b", fontSize: 18 }}>
                {Object.entries(violationBreakdown).sort((a,b) => b[1] - a[1])[0]?.[0] || "—"}
              </h2>
              <div className="small mt-2" style={{ color: "#64748b" }}>Most frequent type</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0">
            <Card.Body>
              <div className="small text-secondary fw-bold mb-2">UNIQUE TYPES</div>
              <h2 className="fw-black mb-0" style={{ color: "#818cf8" }}>{Object.keys(violationBreakdown).length}</h2>
              <div className="small mt-2" style={{ color: "#64748b" }}>Categories of violation</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Violation Type Breakdown */}
      <Row className="g-4 mb-4">
        {Object.entries(violationBreakdown).map(([type, count]) => (
          <Col key={type} md={2} sm={4} xs={6}>
            <div className="text-center p-3 rounded-3" style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="fs-3 mb-1">{getTypeEmoji(type)}</div>
              <div className="fw-black fs-5" style={{ color: getTypeColor(type) }}>{count}</div>
              <div style={{ fontSize: 10, color: "#64748b" }} className="fw-bold">{type}</div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Violations Log Table */}
      <Card style={{ background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.08)" }} className="border-0">
        <Card.Header className="bg-transparent border-0 py-3 d-flex justify-content-between align-items-center">
          <span className="fw-black" style={{ color: "#94a3b8" }}>📋 VIOLATION LOG (Last 50)</span>
          <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill fw-bold">{violations.length} ENTRIES</Badge>
        </Card.Header>
        <Card.Body className="p-0" style={{ maxHeight: 500, overflowY: "auto" }}>
          <Table hover responsive className="mb-0 table-borderless" style={{ color: "#e2e8f0" }}>
            <thead style={{ position: "sticky", top: 0, background: "#1e293b", zIndex: 1 }}>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <th className="ps-3 small fw-black" style={{ color: "#64748b" }}>Type</th>
                <th className="small fw-black" style={{ color: "#64748b" }}>Junction</th>
                <th className="small fw-black text-center" style={{ color: "#64748b" }}>Fine</th>
                <th className="small fw-black text-center" style={{ color: "#64748b" }}>Status</th>
                <th className="small fw-black" style={{ color: "#64748b" }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {violations.map(v => (
                <tr key={v.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td className="ps-3">
                    <span className="me-2">{getTypeEmoji(v.type)}</span>
                    <span className="small fw-bold" style={{ color: getTypeColor(v.type) }}>{v.type}</span>
                  </td>
                  <td className="small">{v.junction_name}</td>
                  <td className="text-center fw-black small" style={{ color: "#10b981" }}>₹{v.fine_amount || 0}</td>
                  <td className="text-center">
                    <Badge bg="success" className="rounded-pill small">{v.status}</Badge>
                  </td>
                  <td className="small" style={{ color: "#64748b" }}>
                    {v.timestamp ? new Date(v.timestamp).toLocaleTimeString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Enforcement;
