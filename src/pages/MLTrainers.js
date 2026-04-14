import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Form, Badge, Modal, Spinner, ProgressBar } from "react-bootstrap";
import { FaBrain, FaGlobeAmericas, FaGasPump, FaNewspaper, FaMicrochip, FaRobot, FaArrowRight, FaChartPie, FaExclamationTriangle, FaLightbulb, FaShieldAlt, FaRoute } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { analyzeScenario } from "../utils/sarvamService";

const TRAINER_CARDS = [
  {
    id: "scenario",
    title: "Global Scenario Simulator",
    description: "Simulate real-world events (like IRAN-WAR) and their impact on Nashik's logistics and traffic flow.",
    icon: <FaGlobeAmericas className="text-warning" />,
    badge: "ADMIN ONLY",
    color: "warning"
  },
  {
    id: "fuel",
    title: "Fuel Mix Optimizer",
    description: "Analyze and manage city fuel consumption (Petrol, Diesel, EV, CNG) based on current vehicle density.",
    icon: <FaGasPump className="text-info" />,
    badge: "PREDICTIVE",
    color: "info"
  },
  {
    id: "traffic",
    title: "LSTM Traffic Flow",
    description: "Train time-series models on historical junction data to predict tomorrow's peak congestion.",
    icon: <FaBrain className="text-primary" />,
    badge: "TENSORFLOW",
    color: "primary"
  },
  {
    id: "psych",
    title: "Psychological Impact",
    description: "Understand the human cost of traffic. Predict frustration levels and citizen sentiment shifts.",
    icon: <FaLightbulb className="text-success" />,
    badge: "RANDOM FOREST",
    color: "success"
  }
];

export default function MLTrainers() {
  const [activeTab, setActiveTab] = useState("cards"); 
  const [loading, setLoading] = useState(false);
  const [scenarioResult, setScenarioResult] = useState(null);
  const [parsedMetrics, setParsedMetrics] = useState(null);
  
  // Scenario Form States
  const [scenarioName, setScenarioName] = useState("Impact of IRAN-WAR on Fuel Supply");
  const [impactFactor, setImpactFactor] = useState("High Fuel Price Hike (15-20%)");
  const [newsSnippet, setNewsSnippet] = useState("Global supply chains disrupted; Crude oil prices hit 2-year high. Indian markets react with heavy volatility.");

  const handleRunScenario = async () => {
    setLoading(true);
    setScenarioResult(null);
    setParsedMetrics(null);
    try {
      const baseMetrics = {
        city: "Nashik",
        junctions: 4,
        total_vehicles: 5000,
        fuel_mix: { petrol: "40%", diesel: "30%", ev: "20%", cng: "10%" }
      };
      
      const rawResult = await analyzeScenario({
        name: scenarioName,
        impactFactor,
        newsSnippet,
        baseMetrics
      });
      
      // Parse Metrics JSON
      const parts = rawResult.split("---METRICS---");
      setScenarioResult(parts[0].trim());
      
      if (parts.length > 1) {
        try {
          const metrics = JSON.parse(parts[1].trim());
          setParsedMetrics(metrics);
        } catch (e) {
          console.error("Failed to parse AI metrics:", e);
        }
      }
    } catch (error) {
      alert("Error analyzing scenario: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderGauge = (score) => {
    const data = [
      { name: 'Impact', value: score },
      { name: 'Remaining', value: 100 - score },
    ];
    const COLORS = [score > 70 ? '#ef4444' : score > 40 ? '#f59e0b' : '#10b981', 'rgba(255,255,255,0.05)'];

    return (
      <div className="position-relative d-flex justify-content-center align-items-center" style={{ height: '180px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="80%"
              startAngle={180}
              endAngle={0}
              innerRadius={70}
              outerRadius={90}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="position-absolute" style={{ bottom: '20%' }}>
          <h2 className="text-slate-900 fw-black mb-0">{score}%</h2>
          <div className="text-slate-500 xsmall fw-bold text-center">CRITICALITY</div>
        </div>
      </div>
    );
  };

  const renderScenarioSimulator = () => (
    <div className="animate-fade-in">
      <Button variant="link" className="text-muted p-0 mb-4 text-decoration-none d-flex align-items-center gap-2 hover-light" onClick={() => setActiveTab("cards")}>
        <FaArrowRight style={{ transform: 'rotate(180deg)' }} /> BACK TO TRAINERS HUB
      </Button>

      <Row className="g-4">
        <Col lg={4}>
          <Card className="bg-white border-0 shadow-2xl glass-card rounded-2xl h-100 border-start border-warning border-opacity-40">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-warning bg-opacity-10 p-3 rounded-xl border border-warning border-opacity-20 shadow-warning-sm">
                  <FaGlobeAmericas className="text-warning fs-3" />
                </div>
                <div>
                  <h4 className="text-slate-900 fw-black mb-0">Scenario Input</h4>
                  <p className="text-slate-500 small text-uppercase fw-bold ls-1 mb-0">Admin Parameters</p>
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label className="text-slate-500 xsmall fw-bold text-uppercase ls-1">Scenario Name</Form.Label>
                <Form.Control 
                  type="text" 
                  value={scenarioName} 
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="bg-slate-50 border-light text-slate-900 py-3 rounded-xl fs-6"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-slate-500 xsmall fw-bold text-uppercase ls-1">Primary Impact Factor</Form.Label>
                <Form.Control 
                  type="text" 
                  value={impactFactor} 
                  onChange={(e) => setImpactFactor(e.target.value)}
                  className="bg-slate-50 border-light text-slate-900 py-2 rounded-xl"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="text-slate-500 xsmall fw-bold text-uppercase ls-1">Contextual News Feed</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3}
                  value={newsSnippet} 
                  onChange={(e) => setNewsSnippet(e.target.value)}
                  className="bg-slate-50 border-light text-slate-900 py-2 rounded-xl small"
                />
              </Form.Group>

              <Button 
                variant="warning" 
                className="w-100 py-3 fw-black ls-1 rounded-xl shadow-lg border-0 d-flex align-items-center justify-content-center glow-btn-warning"
                onClick={handleRunScenario}
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" className="me-2"/> : <FaRobot className="me-2" />}
                GENERATE ANALYSIS
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <div className="d-flex flex-column gap-4 h-100">
            {/* Visual Analytics Row */}
            <Row className="g-4">
              <Col md={5}>
                <Card className="bg-white border-0 shadow-lg rounded-2xl glass-card h-100">
                  <Card.Body className="p-4 d-flex flex-column align-items-center justify-content-center">
                    {parsedMetrics ? renderGauge(parsedMetrics.impact_score) : (
                      <div className="text-center opacity-25">
                         <FaChartPie size={80} className="mb-3 text-slate-900" />
                         <div className="small fw-bold text-slate-900">AWAITING SCORE</div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col md={7}>
                <Card className="bg-white border-0 shadow-lg rounded-2xl glass-card h-100">
                  <Card.Body className="p-4">
                    <h6 className="text-slate-500 xsmall fw-bold text-uppercase ls-2 mb-4">PREDICTED TRAFFIC SHIFT (%)</h6>
                    <div style={{ height: '140px' }}>
                       {parsedMetrics ? (
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                              { name: 'Normal', value: 100 },
                              { name: 'Scenario', value: 100 + (parsedMetrics.traffic_shift || 0) }
                            ]}>
                               <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                               <YAxis hide domain={[0, 150]} />
                               <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                                  { [0, 1].map((i) => <Cell key={i} fill={i === 0 ? '#3b82f6' : '#f59e0b'} />) }
                               </Bar>
                               <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            </BarChart>
                         </ResponsiveContainer>
                       ) : (
                         <div className="h-100 d-flex align-items-center justify-content-center opacity-25 fw-bold small">AWAITING CHART DATA</div>
                       )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Tactical Briefing Row */}
            <Card className="bg-white border-0 shadow-2xl glass-card rounded-2xl flex-grow-1 overflow-hidden">
              <Card.Header className="bg-transparent border-0 py-3 px-4 d-flex justify-content-between align-items-center border-bottom border-light">
                 <h6 className="text-slate-900 mb-0 fw-bold d-flex align-items-center"><FaShieldAlt className="me-2 text-warning" /> TACTICAL COMMAND BRIEFING</h6>
                 {parsedMetrics && <Badge bg="warning" text="dark" className="xsmall fw-black">ADAPTIVE MODE ACTIVE</Badge>}
              </Card.Header>
              <Card.Body className="p-4 overflow-auto scrollbox-custom" style={{ maxHeight: '400px' }}>
                 {!scenarioResult && !loading && (
                   <div className="h-100 d-flex flex-column justify-content-center align-items-center text-center opacity-25 py-5">
                     <FaMicrochip size={60} className="mb-3" />
                     <h5 className="fw-bold">Ready for Simulation</h5>
                   </div>
                 )}

                 {loading && (
                   <div className="h-100 d-flex flex-column justify-content-center align-items-center text-center py-5">
                     <div className="spinner-orbit mb-4"></div>
                     <h5 className="text-warning fw-bold animate-pulse">Running Neural Simulation...</h5>
                   </div>
                 )}

                 {scenarioResult && (
                   <div className="animate-slide-up">
                     <Row className="g-3 mb-4">
                        <Col md={4}>
                           <div className="p-3 bg-slate-50 rounded-xl border border-warning border-opacity-20 h-100 shadow-sm">
                             <div className="text-warning xsmall fw-bold mb-2 ls-1">OVERALL IMPACT</div>
                             <div className="text-slate-800 small fw-bold" style={{ lineHeight: '1.4' }}>{scenarioResult.match(/\*\*IMPACT\*\*:(.*?)\n/)?.[1] || "High priority supply disruption detected."}</div>
                           </div>
                        </Col>
                        <Col md={4}>
                           <div className="p-3 bg-slate-50 rounded-xl border border-info border-opacity-20 h-100 shadow-sm">
                             <div className="text-info xsmall fw-bold mb-2 ls-1">FUEL STRATEGY</div>
                             <div className="text-slate-800 small fw-bold" style={{ lineHeight: '1.4' }}>{scenarioResult.match(/\*\*STRATEGY\*\*:(.*?)\n/)?.[1] || "Prioritizing EV fleet for essential routes."}</div>
                           </div>
                        </Col>
                        <Col md={4}>
                           <div className="p-3 bg-slate-50 rounded-xl border border-success border-opacity-20 h-100 d-flex flex-column shadow-sm">
                             <div className="text-success xsmall fw-bold mb-2 ls-1">ACTION COMMAND</div>
                             <div className="text-slate-800 small fw-bold flex-grow-1" style={{ lineHeight: '1.4' }}>{scenarioResult.match(/\*\*ACTION\*\*:(.*?)$/s)?.[1] || "Deploy auxiliary bus fleet immediately."}</div>
                           </div>
                        </Col>
                     </Row>
                     
                     <div className="p-4 bg-slate-100 bg-opacity-50 rounded-2xl border border-light">
                        <h6 className="text-muted xsmall fw-bold mb-3 ls-2">DETAILED AI NARRATIVE</h6>
                        <div className="text-light small opacity-75" style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                           {scenarioResult.replace(/\*\*[A-Z]+\*\*:(.*?)\n/g, "")}
                        </div>
                     </div>
                   </div>
                 )}
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );

  return (
    <Container fluid className="py-4 px-lg-5" style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      {/* Page Header */}
      <div className="mb-5 py-3 border-bottom border-light d-flex justify-content-between align-items-center">
        <div>
          <h1 className="text-slate-900 fw-black tracking-tighter mb-1 fs-2">AI & ML TRAINERS</h1>
          <p className="text-slate-500 mb-0 d-flex align-items-center gap-2 text-uppercase ls-2 fw-bold small">
            <FaMicrochip className="text-primary" /> Predictive Intelligence Management
          </p>
        </div>
        <div className="d-none d-md-block text-end">
            <Badge bg="white" className="border border-light py-2 px-3 text-primary d-flex align-items-center gap-2 shadow-sm">
                <div className="pulse-dot-primary"></div> ENGINE STATUS: OPTIMIZED
            </Badge>
        </div>
      </div>

      {activeTab === "cards" ? (
        <Row className="g-4">
          {TRAINER_CARDS.map((card) => (
            <Col lg={3} md={6} key={card.id}>
              <Card 
                className="bg-white border-0 shadow-lg rounded-2xl h-100 glass-card-hover cursor-pointer transition-all border-top-glow"
                onClick={() => card.id === "scenario" ? setActiveTab("scenario") : alert("Trainer dataset is being synchronized...")}
                style={{ "--glow-color": `var(--bs-${card.color})` }}
              >
                <Card.Body className="p-4 d-flex flex-column">
                  <div className="mb-4 d-flex justify-content-between align-items-start">
                    <div className={`p-3 rounded-xl bg-${card.color} bg-opacity-10 border border-${card.color} border-opacity-20`}>
                      {card.icon}
                    </div>
                    <Badge bg={card.color} text={card.color === 'warning' ? 'dark' : 'white'} className="xsmall fw-bold px-2 py-1">{card.badge}</Badge>
                  </div>
                  <h5 className="text-slate-900 fw-bold mb-2">{card.title}</h5>
                  <p className="text-slate-500 xsmall" style={{ lineHeight: '1.6' }}>{card.description}</p>
                  <div className="mt-auto d-flex align-items-center gap-2 text-primary xsmall fw-bold opacity-0 transition-hover">
                    LAUNCH TRAINER <FaArrowRight />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : activeTab === "scenario" ? (
        renderScenarioSimulator()
      ) : null}

      <style>{`
        .fw-black { font-weight: 900; }
        .ls-1 { letter-spacing: 1px; }
        .ls-2 { letter-spacing: 2px; }
        .xsmall { font-size: 0.65rem; }
        .glass-card { background: rgba(255, 255, 255, 0.6); backdrop-filter: blur(16px); border: 1px solid rgba(0,0,0,0.03) !important; }
        .glass-card-hover:hover { background: rgba(255, 255, 255, 0.95); transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important; }
        .glass-card-hover:hover .transition-hover { opacity: 1; transform: translateX(5px); }
        .border-top-glow::before { content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: var(--glow-color); opacity: 0.3; }
        .rounded-xl { border-radius: 12px; }
        .rounded-2xl { border-radius: 20px; }
        .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1); }
        .shadow-warning-sm { box-shadow: 0 0 20px rgba(255, 193, 7, 0.1); }
        .glow-btn-warning { box-shadow: 0 0 25px rgba(255, 193, 7, 0.3); transition: all 0.2s; }
        .glow-btn-warning:hover { transform: scale(1.02); box-shadow: 0 0 35px rgba(255, 193, 7, 0.4); }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-pulse { animation: pulse 2s infinite; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .6; } }
        .spinner-orbit { width: 40px; height: 40px; border: 3px solid rgba(255, 193, 7, 0.1); border-radius: 50%; border-top-color: #ffc107; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pulse-dot-primary { width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; animation: pulse-glow 2s infinite; }
        @keyframes pulse-glow { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }
        .scrollbox-custom::-webkit-scrollbar { width: 5px; }
        .scrollbox-custom::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .scrollbox-custom::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
        .hover-light:hover { color: #f8fafc !important; }
      `}</style>
    </Container>
  );
}
