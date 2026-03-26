import React from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { FaDatabase, FaDownload, FaBrain, FaCogs, FaProjectDiagram, FaFileCsv } from "react-icons/fa";
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from "recharts";

const VEHICLE_MIX = [
  { name: 'Petrol', value: 400, color: '#ef4444' },
  { name: 'Diesel', value: 300, color: '#f59e0b' },
  { name: 'Electric', value: 200, color: '#10b981' },
  { name: 'CNG', value: 100, color: '#3b82f6' },
];

const SCATTER_DATA = [
  { density: 20, delay: 5, psych: 2 },
  { density: 40, delay: 15, psych: 4 },
  { density: 60, delay: 35, psych: 7 },
  { density: 80, delay: 55, psych: 9 },
  { density: 100, delay: 85, psych: 10 },
  { density: 50, delay: 20, psych: 5 },
  { density: 70, delay: 45, psych: 8 },
];

export default function MLAnalytics() {
  const downloadDataset = () => {
    window.open("/nashik_traffic_psych_data.csv", "_blank");
  };

  return (
    <Container fluid className="py-4 px-lg-5" style={{ minHeight: "100vh", background: "#0f172a" }}>
      {/* Header */}
      <div className="mb-5 d-flex justify-content-between align-items-end">
        <div>
          <div className="d-flex align-items-center gap-3 mb-2">
            <div className="bg-primary bg-opacity-10 p-3 rounded-xl border border-primary border-opacity-20">
              <FaDatabase className="text-primary" size={28} />
            </div>
            <div>
              <h2 className="text-white mb-0 fw-bold tracking-tight">ML Analytics & Datasets</h2>
              <p className="text-muted small text-uppercase fw-bold ls-2">Advanced Predictive Modelling Hub</p>
            </div>
          </div>
        </div>
        <Button variant="primary" onClick={downloadDataset} className="px-4 py-3 fw-bold shadow-lg d-flex align-items-center gap-3 rounded-xl mb-2">
          <FaDownload /> DOWNLOAD 5K ROW DATASET (CSV)
        </Button>
      </div>

      <Row className="mb-5 g-4">
        {[
          { label: "Dataset Size", value: "5,000 Rows", icon: <FaFileCsv />, color: "info" },
          { label: "ML Model", value: "Random Forest", icon: <FaBrain />, color: "primary" },
          { label: "Data Quality", value: "98.2%", icon: <FaCogs />, color: "success" },
          { label: "Training Epochs", value: "450 (Mock)", icon: <FaProjectDiagram />, color: "warning" },
        ].map((stat, i) => (
          <Col lg={3} sm={6} key={i}>
            <Card className="bg-dark border-0 shadow-lg rounded-xl glass-dark">
              <Card.Body className="p-4 d-flex align-items-center gap-4">
                <div className={`p-3 rounded-lg bg-${stat.color} bg-opacity-10 text-${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <h4 className="text-white fw-black mb-0">{stat.value}</h4>
                  <div className="text-muted xsmall fw-bold text-uppercase ls-1">{stat.label}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-5">
        {/* Scatter Chart: Density vs Delay */}
        <Col lg={8}>
          <Card className="bg-dark border-0 shadow-lg rounded-2xl glass-dark">
            <Card.Header className="bg-transparent border-secondary py-4 px-4">
              <h6 className="text-white mb-0 fw-bold">TRAFFIC DENSITY VS. PSYCHOLOGICAL FRUSTRATION</h6>
            </Card.Header>
            <Card.Body className="p-4" style={{ height: "450px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" dataKey="density" name="Density" unit=" veh/km" stroke="#94a3b8" />
                  <YAxis type="number" dataKey="delay" name="Delay" unit=" min" stroke="#94a3b8" />
                  <ZAxis type="number" dataKey="psych" range={[50, 400]} name="Frustration" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                  />
                  <Scatter name="NASHIK-UNIT-1" data={SCATTER_DATA} fill="#3b82f6" />
                </ScatterChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Pie Chart: Vehicle Composition */}
        <Col lg={4}>
          <Card className="bg-dark border-0 shadow-lg rounded-2xl glass-dark">
            <Card.Header className="bg-transparent border-secondary py-4 px-4">
              <h6 className="text-white mb-0 fw-bold">VEHICLE FUEL COMPOSITION</h6>
            </Card.Header>
            <Card.Body className="p-4 d-flex flex-column" style={{ height: "450px" }}>
              <ResponsiveContainer width="100%" height="70%">
                <PieChart>
                  <Pie
                    data={VEHICLE_MIX}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {VEHICLE_MIX.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4">
                {VEHICLE_MIX.map((v, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mb-2 px-3">
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: v.color }}></div>
                      <span className="text-muted small">{v.name}</span>
                    </div>
                    <span className="text-white fw-bold small">{v.value}</span>
                  </div>
                ))}
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
        .rounded-xl { border-radius: 12px; }
        .rounded-2xl { border-radius: 16px; }
      `}</style>
    </Container>
  );
}
