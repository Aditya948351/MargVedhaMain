import React from "react";
import { Container, Row, Col, Card, Badge, Button, ListGroup } from "react-bootstrap";
import { FaUserShield, FaCity, FaChartLine, FaShieldAlt, FaHistory, FaProjectDiagram } from "react-icons/fa";

export default function AdminProfile() {
  const adminInfo = {
    name: "Nashik Traffic Commissioner",
    email: "admin@nashikcity.gov.in",
    role: "System Administrator",
    department: "Nashik Smart City Development Corp (NSCDCL)",
    id: "MV-ADMIN-001",
    since: "March 2026"
  };

  const logs = [
    { action: "Adaptive Signal Timing Overrode", target: "CBS Circle", time: "10 mins ago" },
    { action: "Fine Issued (MH 15 LB 7524)", target: "Overspeeding", time: "1 hour ago" },
    { action: "Community Post Moderated", target: "Spam Flag", time: "3 hours ago" },
    { action: "Sarvam AI Sync Complete", target: "10 Junctions", time: "5 hours ago" },
  ];

  return (
    <Container fluid className="py-4 px-lg-5" style={{ minHeight: "100vh", background: "#0f172a" }}>
      {/* Admin Header */}
      <div className="mb-5 p-5 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 shadow-2xl position-relative overflow-hidden" 
           style={{ background: 'linear-gradient(135deg, #1e40af 0%, #312e81 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="position-absolute top-0 end-0 p-4 opacity-10">
          <FaUserShield size={200} />
        </div>
        <Row className="align-items-center position-relative">
          <Col md={2} className="text-center mb-4 mb-md-0">
            <div className="avatar-xl bg-white bg-opacity-10 p-1 rounded-circle d-inline-block border border-white border-opacity-20 shadow">
              <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px' }}>
                <FaUserShield className="text-primary" size={60} />
              </div>
            </div>
          </Col>
          <Col md={10}>
            <div className="ps-md-4">
              <Badge bg="info" className="mb-2 px-3 py-2 text-uppercase ls-2 fw-black small">Level: Supreme Controller</Badge>
              <h1 className="text-white fw-black mb-1">{adminInfo.name}</h1>
              <div className="text-white text-opacity-75 small fw-bold d-flex gap-4">
                <span><FaCity className="me-2 text-info" />{adminInfo.department}</span>
                <span><FaShieldAlt className="me-2 text-success" />{adminInfo.role}</span>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Row className="g-5">
        {/* Left: Clearance & Stats */}
        <Col lg={4}>
          <Card className="bg-dark border-0 shadow-lg mb-5 glass-dark rounded-2xl">
            <Card.Header className="bg-transparent border-secondary py-4 px-4">
              <h6 className="text-white mb-0 fw-bold">ADMIN CLEARANCE</h6>
            </Card.Header>
            <Card.Body className="p-4">
              <ListGroup variant="flush" className="bg-transparent">
                {[
                  { label: "Admin ID", value: adminInfo.id },
                  { label: "Access Tier", value: "Level 10 (Full)" },
                  { label: "Email", value: adminInfo.email },
                  { label: "Active Since", value: adminInfo.since },
                ].map((item, i) => (
                  <ListGroup.Item key={i} className="bg-transparent border-secondary border-opacity-20 px-0 d-flex justify-content-between">
                    <span className="text-muted small fw-bold">{item.label}</span>
                    <span className="text-white small fw-black">{item.value}</span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Button variant="outline-info" className="w-100 mt-4 py-3 fw-bold rounded-xl ls-1">REQUEST SECURITY KEY UPDATE</Button>
            </Card.Body>
          </Card>

          <Card className="bg-dark border-0 shadow-lg glass-dark rounded-2xl">
            <Card.Header className="bg-transparent border-secondary py-4 px-4 d-flex justify-content-between align-items-center">
              <h6 className="text-white mb-0 fw-bold">CONTROL METRICS</h6>
              <FaChartLine className="text-info" />
            </Card.Header>
            <Card.Body className="p-4">
              <div className="mb-4">
                <div className="d-flex justify-content-between text-white small mb-2">
                  <span>Decision Accuracy</span>
                  <span className="text-info fw-black">94.2%</span>
                </div>
                <div className="progress bg-secondary bg-opacity-20" style={{ height: '8px' }}>
                  <div className="progress-bar bg-info" style={{ width: '94%' }}></div>
                </div>
              </div>
              <div className="mb-2">
                <div className="d-flex justify-content-between text-white small mb-2">
                  <span>System Reliability</span>
                  <span className="text-success fw-black">99.9%</span>
                </div>
                <div className="progress bg-secondary bg-opacity-20" style={{ height: '8px' }}>
                  <div className="progress-bar bg-success" style={{ width: '99%' }}></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right: Recent Logged Activities */}
        <Col lg={8}>
          <Card className="bg-dark border-0 shadow-lg glass-dark rounded-2xl h-100">
            <Card.Header className="bg-transparent border-secondary py-4 px-4 d-flex justify-content-between align-items-center">
              <h6 className="text-white mb-0 fw-bold ls-1">ADMINISTRATIVE ACTION LOGS</h6>
              <FaHistory className="text-muted" />
            </Card.Header>
            <Card.Body className="p-0">
              <div className="list-group list-group-flush bg-transparent">
                {logs.map((log, i) => (
                  <div key={i} className="list-group-item bg-transparent border-secondary border-opacity-10 p-4 hover-highlight transition-all">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-2 rounded bg-primary bg-opacity-10 text-primary">
                          <FaProjectDiagram size={14} />
                        </div>
                        <div className="text-white fw-bold small">{log.action}</div>
                      </div>
                      <span className="text-muted xsmall fw-bold">{log.time}</span>
                    </div>
                    <div className="ps-5 text-muted xsmall fw-bold">TARGET: <span className="text-info">{log.target}</span></div>
                  </div>
                ))}
              </div>
              <div className="p-4 text-center">
                <Button variant="link" className="text-info text-decoration-none xsmall fw-black ls-2">VIEW ALL CONSOLE LOGS</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>{`
        .fw-black { font-weight: 900; }
        .ls-1 { letter-spacing: 1px; }
        .ls-2 { letter-spacing: 2px; }
        .xsmall { font-size: 0.65rem; }
        .glass-dark { background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.05) !important; }
        .rounded-3xl { border-radius: 24px; }
        .rounded-2xl { border-radius: 16px; }
        .rounded-xl { border-radius: 12px; }
        .hover-highlight:hover { background: rgba(255,255,255,0.03); cursor: pointer; }
      `}</style>
    </Container>
  );
}
