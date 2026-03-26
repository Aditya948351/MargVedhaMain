import React from "react";
import { Container, Row, Col, Card, Badge, ProgressBar } from "react-bootstrap";
import { FaLeaf, FaWind, FaClock, FaCar, FaChartArea } from "react-icons/fa";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
} from "recharts";

const POLLUTION_DATA = [
  { time: "06:00", pm25: 45, co2: 120, baseline: 40 },
  { time: "09:00", pm25: 85, co2: 250, baseline: 42 },
  { time: "12:00", pm25: 65, co2: 180, baseline: 41 },
  { time: "15:00", pm25: 75, co2: 210, baseline: 40 },
  { time: "18:00", pm25: 95, co2: 290, baseline: 43 },
  { time: "21:00", pm25: 55, co2: 150, baseline: 41 },
];

const SAVED_DATA = [
  { junction: "CBS Circle", saved: 45, fuel: 12 },
  { junction: "Mumbai Naka", saved: 32, fuel: 8 },
  { junction: "Panchavati", saved: 28, fuel: 7 },
  { junction: "Dwarka", saved: 55, fuel: 15 },
  { junction: "College Rd", saved: 15, fuel: 4 },
];

export default function EnvironmentalImpact() {
  return (
    <Container fluid className="py-4 px-lg-5" style={{ minHeight: "100vh", background: "#0f172a" }}>
      {/* Header */}
      <div className="mb-5">
        <div className="d-flex align-items-center gap-3 mb-2">
          <div className="bg-success bg-opacity-10 p-3 rounded-circle border border-success border-opacity-20">
            <FaLeaf className="text-success" size={28} />
          </div>
          <div>
            <h2 className="text-white mb-0 fw-bold tracking-tight">Environmental Impact</h2>
            <p className="text-muted small text-uppercase fw-bold ls-2">Sustainability & Carbon Offset Analytics</p>
          </div>
        </div>
      </div>

      {/* Hero Metrics */}
      <Row className="mb-5 g-4">
        {[
          { label: "CO2 Offset", value: "1,240 kg", sub: "Monthly Total", color: "success", icon: <FaLeaf /> },
          { label: "Traffic Time Saved", value: "482 Hours", sub: "Since Deployment", color: "primary", icon: <FaClock /> },
          { label: "City PM 2.5", value: "68 µg/m³", sub: "Moderate", color: "warning", icon: <FaWind /> },
          { label: "Fuel Saved", value: "315 Liters", sub: "Est. Savings", color: "info", icon: <FaCar /> },
        ].map((stat, i) => (
          <Col lg={3} sm={6} key={i}>
            <Card className="bg-dark border-0 shadow-lg h-100" style={{ background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(10px)' }}>
              <Card.Body className="p-4">
                <div className={`text-${stat.color} mb-3`} style={{ opacity: 0.8 }}>{stat.icon}</div>
                <h3 className="text-white fw-black mb-1">{stat.value}</h3>
                <div className="text-muted xsmall fw-bold text-uppercase ls-1 mb-2">{stat.label}</div>
                <Badge bg={stat.color} bg-opacity-10 className={`text-${stat.color} fw-bold`}>{stat.sub}</Badge>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-5">
        {/* Pollution Trend */}
        <Col lg={8}>
          <Card className="bg-dark border-0 shadow-lg rounded-2xl overflow-hidden glass-dark">
            <Card.Header className="bg-transparent border-secondary py-4 px-4">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="text-white mb-0 fw-bold ls-1">CITY POLLUTION TREND (PM 2.5)</h6>
                <Badge bg="success" className="px-3 py-2">LIVE SENSORS</Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-4" style={{ height: "400px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={POLLUTION_DATA}>
                  <defs>
                    <linearGradient id="colorPm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="pm25" stroke="#10b981" fillOpacity={1} fill="url(#colorPm)" strokeWidth={3} />
                  <Area type="monotone" dataKey="baseline" stroke="#64748b" fill="transparent" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Junction Savings */}
        <Col lg={4}>
          <Card className="bg-dark border-0 shadow-lg rounded-2xl h-100 glass-dark">
            <Card.Header className="bg-transparent border-secondary py-4 px-4">
              <h6 className="text-white mb-0 fw-bold ls-1">JUNCTION-WISE SAVINGS</h6>
            </Card.Header>
            <Card.Body className="p-4">
              {SAVED_DATA.map((d, i) => (
                <div key={i} className="mb-4">
                  <div className="d-flex justify-content-between text-white small mb-2">
                    <span className="fw-bold">{d.junction}</span>
                    <span className="text-success fw-black">+{d.saved}m saved</span>
                  </div>
                  <ProgressBar now={d.saved} variant="success" className="bg-secondary bg-opacity-10" style={{ height: '6px' }} />
                  <div className="text-muted xsmall mt-1">{d.fuel}L fuel saved today</div>
                </div>
              ))}
              <div className="mt-5 p-4 rounded-xl bg-primary bg-opacity-10 border border-primary border-opacity-20">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <FaChartArea className="text-primary" />
                  <div className="text-white small fw-bold">Psychological Score</div>
                </div>
                <div className="h4 text-white fw-black mb-1">8.2 / 10</div>
                <div className="text-muted small">Resident satisfaction has increased by <span className="text-primary fw-bold">14%</span> since adaptive signal deployment.</div>
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
