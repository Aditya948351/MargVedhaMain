import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Button, Spinner, Modal } from "react-bootstrap";
import { FaBrain, FaUser, FaLightbulb, FaSync, FaMapMarkerAlt, FaExclamationTriangle, FaTrafficLight, FaTools, FaBus } from "react-icons/fa";

const SARVAM_API_KEY = "sk_wajkrjjw_D129eXthDsNC46eozPXL5nCC";

const CITIZEN_SCENARIOS = [
  {
    id: 1, name: "Ravi Kumar", age: 42, junction: "CBS Circle", hour: "08:15 AM",
    lang: "hi", vehicles: 78,
    feedback: "CBS चौक पर बहुत ज्यादा भीड़ है। मुझे ऑफिस जाने में 30 मिनट की देरी हो गई। सिग्नल बहुत धीरे बदलता है।",
    category: "Congestion"
  },
  {
    id: 2, name: "Priya Deshmukh", age: 28, junction: "Gangapur Road", hour: "09:00 AM",
    lang: "mr", vehicles: 45,
    feedback: "गंगापूर रोडवर स्कूल बस उशिरा आली. मुलांना खूप वेळ थांबावे लागले. यासाठी वेगळी बस लेन हवी आहे.",
    category: "School Zone"
  },
  {
    id: 3, name: "Suresh Patil", age: 55, junction: "Satpur MIDC", hour: "06:00 PM",
    lang: "mr", vehicles: 120,
    feedback: "कारखाना सुटताना MIDC गेटवर 200+ दुचाकी एकत्र येतात. हे रोज होते. वेगळ्या वेळेची गरज आहे.",
    category: "Industrial Peak"
  },
  {
    id: 4, name: "Anjali Mehta", age: 35, junction: "Mumbai Naka", hour: "05:30 PM",
    lang: "en", vehicles: 95,
    feedback: "Mumbai Naka signal timing is too short for pedestrians. Cars block the crossing. Need longer pedestrian phase.",
    category: "Pedestrian Safety"
  },
  {
    id: 5, name: "Raj Sharma", age: 22, junction: "College Road", hour: "10:30 AM",
    lang: "en", vehicles: 30,
    feedback: "College Road is clear today but the AI app suggested a longer route. The suggestion needs improvement during off-peak hours.",
    category: "AI Routing Feedback"
  },
  {
    id: 6, name: "Meena Joshi", age: 48, junction: "Trimbak Naka", hour: "07:00 AM",
    lang: "mr", vehicles: 15,
    feedback: "त्र्यंबक नाका येथे पाण्याची समस्या आहे. पावसाळ्यात रस्ता बुडतो. तातडीने ड्रेनेज दुरुस्ती करावी.",
    category: "Infrastructure"
  },
  {
    id: 7, name: "Arun Ghodke", age: 38, junction: "Dwarka Circle", hour: "08:45 AM",
    lang: "hi", vehicles: 60,
    feedback: "द्वारका सर्किल पर AI सिग्नल से बहुत फर्क पड़ा है। पहले 25 मिनट लगते थे, अब 10 मिनट में निकल जाता हूं।",
    category: "AI Success"
  },
  {
    id: 8, name: "Sneha Kulkarni", age: 31, junction: "Panchavati", hour: "11:00 AM",
    lang: "mr", vehicles: 22,
    feedback: "पंचवटीत N-4 बस वेळेवर येते आता. MargVedha अ‍ॅपवर ETA दाखवतो त्यामुळे प्रवास सोपा झाला आहे.",
    category: "Bus Feedback"
  },
  {
    id: 9, name: "Vivek Nair", age: 45, junction: "Nashik Road", hour: "07:30 PM",
    lang: "en", vehicles: 88,
    feedback: "Evening peak on Nashik Road is unmanageable. 3 roads merge and there is no coordination. Need dedicated turn lanes.",
    category: "Infrastructure"
  },
  {
    id: 10, name: "Kavita Bhosale", age: 26, junction: "Bytco Point", hour: "02:00 PM",
    lang: "mr", vehicles: 18,
    feedback: "बाइटको पॉईंटला दुपारी रिक्षांची गर्दी असते. त्यांनी नियम पाळत नाहीत. कठोर कारवाई आवश्यक आहे.",
    category: "Enforcement"
  }
];

const categoryColors = {
  "Congestion": "danger", "School Zone": "warning", "Industrial Peak": "warning",
  "Pedestrian Safety": "info", "AI Routing Feedback": "primary", "Infrastructure": "secondary",
  "AI Success": "success", "Bus Feedback": "success", "Enforcement": "danger"
};

const langLabel = { en: "🇬🇧 EN", hi: "🇮🇳 HI", mr: "🟠 MR" };

async function callSarvam(citizenFeedbacks) {
  const narratives = citizenFeedbacks.map((c, i) =>
    `- [${c.junction} | ${c.category}]: "${c.feedback}"`
  ).join("\n");

  const systemPrompt = `You are a Senior Traffic Engineer for Nashik City. 
    Analyze multilingual citizen reports and provide strictly structured technical recommendations.
    DO NOT include any introductory or concluding remarks. DO NOT say "Here is the analysis" or "I have analyzed".
    
    Format your response EXACTLY like this:
    ### URGENT_ACTIONS:
    (List top 3 most critical junction-specific fixes)
    
    ### SIGNAL_TIMINGS:
    (Technical timing adjustments for specific junctions)
    
    ### INFRASTRUCTURE:
    (Drainage, road repair, or lane marking suggestions based on feedback)
    
    ### PUBLIC_TRANSPORT:
    (Bus ETA or route improvements)`;

  const userPrompt = `Analyze these reports and provide strictly structured feedback:\n${narratives}`;

  const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SARVAM_API_KEY}`
    },
    body: JSON.stringify({
      model: "sarvam-m",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Sarvam API error: ${response.status} – ${err}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No recommendations available.";
}

const AnalysisSection = ({ title, icon, content, color }) => (
  <div className="mb-4">
    <div className="d-flex align-items-center mb-2">
      <div className={`p-2 rounded bg-${color} text-white me-3 d-flex align-items-center justify-content-center`} style={{ width: '36px', height: '36px' }}>{icon}</div>
      <h6 className="mb-0 text-white text-uppercase fw-bold" style={{ letterSpacing: '1px', fontSize: '0.85rem' }}>{title}</h6>
    </div>
    <div className="ps-4 border-start border-secondary ms-3" style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6' }}>
      {content || "No data available for this section."}
    </div>
  </div>
);

export default function CitizenSuggestions() {
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const runAnalysis = async () => {
    setLoading(true); setError(""); setAiAnalysis("");
    try {
      const result = await callSarvam(CITIZEN_SCENARIOS);
      setAiAnalysis(result);
      setLastUpdated(new Date().toLocaleTimeString("en-IN"));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { runAnalysis(); }, []);

  const parseAnalysis = (text) => {
    const sections = { urgent: "", signals: "", infra: "", transport: "" };
    if (!text) return sections;
    
    const parts = text.split(/### [A-Z_]+:/g);
    if (parts.length >= 5) {
      sections.urgent = parts[1].trim();
      sections.signals = parts[2].trim();
      sections.infra = parts[3].trim();
      sections.transport = parts[4].trim();
    } else {
      sections.urgent = text;
    }
    return sections;
  };

  const parsed = parseAnalysis(aiAnalysis);

  const hourStats = {
    total: CITIZEN_SCENARIOS.length,
    highTraffic: CITIZEN_SCENARIOS.filter(c => c.vehicles > 60).length,
    categories: [...new Set(CITIZEN_SCENARIOS.map(c => c.category))].length
  };

  return (
    <Container fluid className="py-4 px-lg-5" style={{ minHeight: "100vh", background: "#0f172a" }}>
      {/* Header */}
      <Row className="mb-5 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary p-3 rounded-lg shadow-primary shadow">
              <FaBrain className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-white mb-1 fw-bold tracking-tight">Suggestions Engine</h2>
              <p className="text-muted mb-0 small text-uppercase fw-bold ls-2">
                NASHIK SMART CITY CONTROL • AI ANALYTICS UNIT
              </p>
            </div>
          </div>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          {lastUpdated && <Badge bg="dark" className="border border-secondary py-2 px-3 text-success d-flex align-items-center">LATEST SYNC: {lastUpdated}</Badge>}
          <Button variant="primary" className="px-4 fw-bold shadow-lg" onClick={runAnalysis} disabled={loading}>
            <FaSync className={`me-3 ${loading ? "fa-spin" : ""}`} />
            {loading ? "PROCESSING..." : "RUN ANALYSIS"}
          </Button>
        </Col>
      </Row>

      {/* Hero Stats */}
      <Row className="mb-5 g-4">
        {[
          { label: "Total Reports", value: hourStats.total, color: "primary", icon: <FaUser /> },
          { label: "Critical Hubs", value: hourStats.highTraffic, color: "danger", icon: <FaMapMarkerAlt /> },
          { label: "Policy Areas", value: hourStats.categories, color: "info", icon: <FaLightbulb /> },
          { label: "AI Model", value: "Sarvam-105B", color: "success", icon: <FaBrain /> },
        ].map((stat, i) => (
          <Col lg={3} sm={6} key={i}>
            <Card className="bg-dark border-0 h-100 shadow-xl" style={{ minHeight: '120px' }}>
              <Card.Body className="d-flex align-items-center gap-4 py-4">
                <div className={`p-3 rounded bg-opacity-10 bg-${stat.color} text-${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <h4 className="mb-0 fw-bold text-white">{stat.value}</h4>
                  <div className="text-muted small text-uppercase fw-bold ls-1" style={{ fontSize: '0.65rem' }}>{stat.label}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-5">
        {/* Left: Feedback Stream */}
        <Col lg={7}>
          <Card className="bg-dark border-0 shadow-lg overflow-hidden glass-dark">
            <Card.Header className="bg-transparent border-secondary py-4 px-4 d-flex justify-content-between align-items-center">
              <h6 className="text-white mb-0 fw-bold ls-1">LIVE FEEDBACK STREAM</h6>
              <div className="d-flex align-items-center gap-2">
                <span className="pulse-dot"></span>
                <span className="text-muted small fw-bold">REAL-TIME</span>
              </div>
            </Card.Header>
            <Card.Body className="p-0" style={{ maxHeight: "680px", overflowY: "auto" }}>
              {CITIZEN_SCENARIOS.map((c) => (
                <div
                  key={c.id}
                  className="p-4 border-bottom border-secondary transition-all"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedCitizen(c)}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2 px-3 rounded bg-primary text-white fw-bold small">{c.name[0]}</div>
                      <div>
                        <div className="text-white fw-bold small">{c.name}</div>
                        <div className="text-muted xsmall">{c.junction} • {c.hour}</div>
                      </div>
                    </div>
                    <Badge bg={categoryColors[c.category] || "secondary"} className="text-uppercase" style={{ fontSize: '0.6rem' }}>{c.category}</Badge>
                  </div>
                  <div className="text-light small opacity-75" style={{ lineHeight: '1.5' }}>
                    {c.feedback}
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Right: AI Insights */}
        <Col lg={5}>
          <Card className="bg-dark border-0 shadow-lg h-100 glass-dark">
            <Card.Header className="bg-transparent border-secondary py-4 px-4 d-flex justify-content-between align-items-center">
              <h6 className="text-white mb-0 fw-bold">ENGINE RECOMMENDATIONS</h6>
              <Badge bg="primary" className="small">AI-DRIVEN</Badge>
            </Card.Header>
            <Card.Body className="p-4" style={{ background: 'rgba(0,0,0,0.2)' }}>
              {loading ? (
                <div className="text-center py-5 h-100 d-flex flex-column justify-content-center align-items-center">
                  <Spinner animation="border" variant="primary" className="mb-3" />
                  <div className="text-primary small fw-bold text-uppercase" style={{ letterSpacing: '2px' }}>Analyzing Reports...</div>
                </div>
              ) : error ? (
                <div className="text-center py-5">
                  <FaExclamationTriangle className="text-danger mb-3" size={32} />
                  <p className="text-danger small">{error}</p>
                  <Button size="sm" variant="outline-danger" onClick={runAnalysis}>RETRY ENGINE</Button>
                </div>
              ) : (
                <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                  {!aiAnalysis ? (
                    <div className="text-center text-muted py-5 small italic">Initialize engine to generate insights.</div>
                  ) : (
                    <>
                      <AnalysisSection title="Urgent Actions" icon={<FaExclamationTriangle />} content={parsed.urgent} color="danger" />
                      <AnalysisSection title="Signal Timings" icon={<FaTrafficLight />} content={parsed.signals} color="warning" />
                      <AnalysisSection title="Infrastructure" icon={<FaTools />} content={parsed.infra} color="info" />
                      <AnalysisSection title="Transit & Routes" icon={<FaBus />} content={parsed.transport} color="success" />
                    </>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detail Modal */}
      <Modal show={!!selectedCitizen} onHide={() => setSelectedCitizen(null)} centered size="lg" contentClassName="bg-dark text-white border-0 shadow-2xl">
        <Modal.Header closeButton className="bg-dark text-white border-0">
          <Modal.Title className="fw-bold">{selectedCitizen?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light p-4">
          <Row className="mb-4 g-4">
            <Col md={6}>
              <div className="p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10 h-100">
                <div className="text-primary xsmall fw-bold text-uppercase ls-2 mb-2">Location</div>
                <div className="text-white h5 fw-bold mb-1"><FaMapMarkerAlt className="me-2 text-primary" />{selectedCitizen?.junction}</div>
              </div>
            </Col>
            <Col md={6}>
              <div className="p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10 h-100">
                <div className="text-info xsmall fw-bold text-uppercase ls-2 mb-2">Metrics</div>
                <div className="text-white h5 fw-bold mb-1">{selectedCitizen?.vehicles} Vehicles Scanned</div>
              </div>
            </Col>
          </Row>
          <div className="mb-2">
            <div className="text-white xsmall fw-bold text-uppercase ls-2 mb-3">Citizen Feedback</div>
            <div className="p-4 rounded bg-white bg-opacity-5 border border-white border-opacity-10" style={{ fontSize: '1.2rem', lineHeight: '1.6', fontStyle: 'italic' }}>
              "{selectedCitizen?.feedback}"
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <style>{`
        .ls-1 { letter-spacing: 1px; }
        .ls-2 { letter-spacing: 2px; }
        .xsmall { font-size: 0.65rem; }
        .glass-dark { background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(10px); }
        .pulse-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; display: inline-block; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
      `}</style>
    </Container>
  );
}
