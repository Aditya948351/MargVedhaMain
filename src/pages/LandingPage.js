import React from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaBrain, FaMapMarkerAlt, FaMicrochip, FaArrowRight, FaChartLine, FaShieldAlt } from "react-icons/fa";

const LandingPage = () => {
  const navigate = useNavigate();

  const techPillars = [
    {
      icon: <FaMicrochip className="text-blue-500" />,
      title: "Vision Core: YOLOv11 & BoT-SORT",
      description: "Real-time, edge-processed vehicle telemetry. Our computer vision engine tracks 99.4% of city flow with zero-latency identification.",
      tag: "PERCEPTION"
    },
    {
      icon: <FaBrain className="text-indigo-500" />,
      title: "Cognitive Engine: Q-Learning",
      description: "Autonomous signal timing that learns from Nashik's unique traffic patterns. We don't just clear roads; we optimize psychological wait times.",
      tag: "DECISION"
    },
    {
      icon: <FaShieldAlt className="text-emerald-500" />,
      title: "Command: Dynamic Corridors",
      description: "A* and Dijkstra powered emergency routing. When a life is on the line, MargVedha clears a 0-latency path through the urban jungle.",
      tag: "ACTION"
    }
  ];

  return (
    <div className="landing-page bg-slate-50 min-vh-100 font-sans text-slate-900 overflow-x-hidden">
      {/* Navbar Overlay */}
      <nav className="fixed-top px-4 py-3 bg-white/80 backdrop-blur-xl border-bottom border-slate-200 z-1050 shadow-sm">
        <Container className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <img 
              src="https://github.com/Aditya948351/Used-Images/blob/main/MargVedha-logo.png?raw=true" 
              alt="MargVedha Logo" 
              style={{ height: '45px', objectFit: 'contain' }}
            />
          </div>
          <div className="d-flex align-items-center gap-4">
             <Button variant="link" className="text-slate-600 fw-bold text-decoration-none d-none d-md-block xsmall ls-1" onClick={() => navigate("/developers")}>FOR DEVELOPERS</Button>
             <Button variant="link" className="text-slate-600 fw-bold text-decoration-none d-none d-md-block xsmall ls-1">PUBLIC DATA</Button>
             <Button 
               variant="primary" 
               className="rounded-pill px-4 py-2 fw-black small shadow-lg shadow-blue-500/20"
               onClick={() => navigate("/login")}
             >
               LOGIN
             </Button>
          </div>
        </Container>
      </nav>
      {/* Hero Section */}
      <section className="hero-section d-flex align-items-center position-relative overflow-hidden" style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '80px' }}>
         <div className="hero-bg-overlay absolute inset-0 opacity-[0.25] z-0 pointer-events-none" style={{ 
            backgroundImage: 'url("https://imgs.search.brave.com/G1x35ifL6T4kcIpvvROIOEjAYn2kRP2iU0tdFi03Zuw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/a2Fwc2NoLm5ldC9f/UmVzb3VyY2VzL1Bl/cnNpc3RlbnQvMzk3/ZGE0ODg5MWM4MjBm/OWU1ODYyYjBhODg1/MWQ2NWYwNmFjNzQx/OC9DVl9JVFNfSW50/ZWxsaWdlbnQtVHJh/bnNwb3J0LVN5c3Rl/bS5qcGc")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
         }}></div>
        <Container>
          <Row className="align-items-center">
            <Col lg={7} className="mb-5 mb-lg-0 text-center text-lg-start">
              <Badge bg="blue-100" className="text-blue-600 px-3 py-2 rounded-pill fw-bold mb-3 ls-1">Smart City Infrastructure • 2026</Badge>
              <h1 className="display-3 fw-black tracking-tighter mb-4" style={{ lineHeight: '0.90' }}>
                Intelligence in <span className="text-blue-600">Motion.</span> <br />
                Nashik City Refined.
              </h1>
              <p className="lead text-slate-500 mb-5 max-w-lg mx-auto mx-lg-0" style={{ lineHeight: '1.6' }}>
                In collaboration with the <span className="text-indigo-600 fw-bold">Sarvam AI</span> Indian model. 
                Integrating perceptual vision with cognitive optimization to eliminate congestion.
              </p>
              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                 <Button 
                    variant="slate-900" 
                    className="bg-slate-900 text-white rounded-2xl px-5 py-3 fw-bold shadow-xl transition-all hover:scale-105"
                    onClick={() => navigate("/login")}
                 >
                    Official Login
                 </Button>
                 <Button 
                    variant="white" 
                    className="bg-white border-slate-200 rounded-2xl px-5 py-3 fw-bold shadow-sm transition-all hover:bg-slate-50 d-flex align-items-center gap-2"
                    as="a"
                    href="https://youtu.be/CYYZTJ4r36I"
                    target="_blank"
                 >
                    Watch System Overview <FaArrowRight size={12} />
                 </Button>
              </div>
              
              <div className="mt-5 d-flex align-items-center gap-4 justify-content-center justify-content-lg-start opacity-75">
                 <div className="text-center">
                    <h5 className="fw-black mb-0">14%</h5>
                    <p className="xsmall text-slate-400 fw-bold">DELAY REDUCTION</p>
                 </div>
                 <div className="h-4 w-px bg-slate-300"></div>
                 <div className="text-center">
                    <h5 className="fw-black mb-0">2.1s</h5>
                    <p className="xsmall text-slate-400 fw-bold">AVG RESPONSE</p>
                 </div>
                 <div className="h-4 w-px bg-slate-300"></div>
                 <div className="text-center">
                    <h5 className="fw-black mb-0">99.4%</h5>
                    <p className="xsmall text-slate-400 fw-bold">ACCURACY RATE</p>
                 </div>
              </div>
            </Col>
            <Col lg={5}>
               <div className="relative p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[3rem] shadow-2xl animate-float">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-inner border border-white/20 p-2">
                     {/* SaaS Preview Mockup */}
                     <div className="mockup-header p-3 border-bottom d-flex align-items-center justify-content-between bg-slate-50">
                        <div className="d-flex gap-1">
                           <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                           <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                        </div>
                        <Badge bg="success" className="smaller px-2 py-1 flex items-center gap-1"><span className="flex h-1 w-1 rounded-full bg-white animate-ping"></span> Live Sensors Active</Badge>
                     </div>
                     <div className="mockup-body p-3">
                        <div className="mb-3 d-flex justify-content-between align-items-center">
                           <h6 className="text-[10px] fw-black text-slate-400 ls-2 uppercase">Command Preview</h6>
                           <Badge bg="blue-100" className="text-blue-600 xsmall border-0 shadow-sm">Nashik Central</Badge>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 mb-3 grayscale opacity-80 hover:grayscale-0 transition-all duration-700">
                           <div className="d-flex justify-content-between mb-2">
                              <span className="xsmall fw-black text-slate-500 font-sans">TRAFFIC DENSITY</span>
                              <span className="xsmall fw-black text-slate-900">HIGH</span>
                           </div>
                           <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                              <div className="w-75 h-100 bg-blue-500"></div>
                           </div>
                        </div>
                        <div className="rounded-2xl overflow-hidden h-40 border shadow-inner bg-slate-900 relative">
                           <video 
                              src="https://res.cloudinary.com/dsj0vaews/video/upload/v1774117387/eeololastomdbamjbs9a.mp4"
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-100 h-100 object-fit-cover opacity-70"
                           />
                           <div className="absolute top-0 left-0 p-2 d-flex justify-content-between w-100">
                              <Badge bg="white" className="text-slate-900 xsmall border-0 shadow-sm opacity-90">3D SIMULATION LIVE</Badge>
                           </div>
                        </div>
                     </div>
                  </div>
                  {/* Decorative Elements */}
                  <div className="absolute -top-6 -right-6 w-16 h-16 bg-indigo-500 rounded-2xl rotate-12 -z-1 border-4 border-white shadow-xl opacity-20"></div>
                  <div className="absolute -bottom-10 -left-10 p-4 bg-white rounded-3xl shadow-2xl border border-slate-100 z-1 d-none d-lg-block">
                     <div className="d-flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><FaChartLine /></div>
                        <div>
                           <p className="xsmall text-slate-400 fw-bold mb-0">OPTIMIZATION GAIN</p>
                           <h5 className="fw-black mb-0 text-emerald-600">+22.4%</h5>
                        </div>
                     </div>
                  </div>
               </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Technology Pillars */}
      <section className="pillars-section py-10 bg-white">
        <Container>
          <div className="text-center mb-5 pb-5">
             <Badge bg="slate-100" className="text-slate-500 px-3 py-2 rounded-full fw-bold mb-3 ls-1">THE ENGINE</Badge>
             <h2 className="fw-black tracking-tighter fs-1 mb-3">Adaptive Intelligence Layer</h2>
             <p className="text-slate-400 max-w-lg mx-auto fw-medium">MargVedha's architecture is built to respond to both microscopic street-level events and global macroeconomic shifts.</p>
          </div>
          
          <Row className="mb-10 pb-5 align-items-center">
              <Col lg={4}>
                 <div className="p-4 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group h-100 min-h-[450px] d-flex flex-column justify-content-between">
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                    <div>
                      <h6 className="text-[10px] text-blue-400 ls-2 uppercase font-black mb-3">SARVAM TACTICAL ADVISORY</h6>
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/10 mb-4 transition-all group-hover:border-blue-500/50">
                         <div className="d-flex items-center gap-2 mb-2">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                            <span className="xsmall text-rose-500 fw-black">SARVAM-M AI PREDICTION: ACTIVE SCENARIO</span>
                         </div>
                         <p className="text-[11px] text-slate-300 leading-normal mb-0">
                            "Geopolitical tensions (Iran-War) indicate a 15% fuel hike. MargVedha models suggest a 12% shift to public transit."
                         </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <Button variant="outline-light" className="w-100 xsmall py-2 border-slate-700 hover:bg-blue-600 hover:border-blue-600 transition-all rounded-xl fw-bold">VIEW TACTICAL LOGS</Button>
                    </div>
                 </div>
              </Col>

              <Col lg={4} className="mt-4 mt-lg-0">
                 <div className="p-4 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group h-100 min-h-[450px] d-flex flex-column justify-content-between">
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
                    <div>
                      <h6 className="text-[10px] text-emerald-400 ls-2 uppercase font-black mb-3">CORE OPTIMIZATION ENGINE</h6>
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/10 mb-4 transition-all group-hover:border-emerald-500/50">
                         <div className="d-flex items-center gap-2 mb-2">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="xsmall text-emerald-500 fw-black">Q-LEARNING & GAUSS SEIDEL: V3.0</span>
                         </div>
                         <p className="text-[11px] text-slate-300 leading-normal mb-0">
                            "Converging Reinforcement Learning with Gauss-Seidel iterative methods for 8ms junction flow optimization."
                         </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <img 
                         src="https://res.cloudinary.com/dsj0vaews/image/upload/q_auto/f_auto/v1775298499/vedekw6zqtoreyrxp7kt.jpg" 
                         alt="Q-Learning & Gauss Seidel Logic" 
                         className="w-100 rounded-2xl mb-4 border border-white/10 shadow-lg object-fit-cover"
                         style={{ height: '160px' }}
                      />
                      <Button variant="outline-light" className="w-100 xsmall py-2 border-slate-700 hover:bg-emerald-600 hover:border-emerald-600 transition-all rounded-xl fw-bold">VIEW CORE LOGIC (V3.0)</Button>
                    </div>
                 </div>
              </Col>
             <Col lg={8} className="ps-lg-5 mt-5 mt-lg-0">
                <div className="d-flex flex-column gap-4">
                   <div className="d-flex gap-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl h-fit"><FaChartLine /></div>
                      <div>
                         <h5 className="fw-black mb-1">Indian Model: Sarvam AI Integration</h5>
                         <p className="small text-slate-500 mb-0">Harnessing local intelligence. Sarvam powers our tactical reports, delivering high-fidelity situational awareness specialized for the Indian subcontinent.</p>
                      </div>
                   </div>
                   <div className="d-flex gap-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl h-fit"><FaMapMarkerAlt /></div>
                      <div>
                         <h5 className="fw-black mb-1">AI-Driven ML Insights</h5>
                         <p className="small text-slate-500 mb-0">Beyond vision. Our system predicts bottlenecks before they occur using a proprietary ensemble of YOLOv11 and Q-Learning optimized datasets.</p>
                      </div>
                   </div>
                </div>
             </Col>
          </Row>

          <Row className="g-4">
            {techPillars.map((pillar, idx) => (
              <Col md={4} key={idx}>
                <Card className="h-100 border-0 p-4 rounded-[2rem] bg-slate-50 border border-slate-100 transition-all hover:-translate-y-2 hover:shadow-xl group">
                  <div className="p-3 bg-white rounded-2xl shadow-sm d-inline-block mb-4 transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-blue-500/30">
                    <span className="fs-4 d-flex">{pillar.icon}</span>
                  </div>
                  <Badge bg="white" className="text-slate-400 xsmall border border-slate-200 d-table mb-3">{pillar.tag}</Badge>
                  <h4 className="fw-black mb-3">{pillar.title}</h4>
                  <p className="text-slate-500 small" style={{ lineHeight: '1.7' }}>{pillar.description}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* System Deep-Dive Media - Auto-Scrolling Gallery */}
      <section className="media-section py-10 bg-slate-50 overflow-hidden">
        <Container fluid className="px-0">
          <div className="text-center mb-5 pb-5">
             <Badge bg="blue-100" className="text-blue-600 px-3 py-2 rounded-full fw-bold mb-3 ls-1">SYSTEM ARCHITECTURE</Badge>
             <h2 className="fw-black tracking-tighter fs-1 mb-3">Operational Intelligence & Network Reach</h2>
             <p className="text-slate-400 max-w-lg mx-auto fw-medium">Visualizing the hierarchy of our real-time traffic monitoring nodes and the reach of our urban sensor network.</p>
          </div>
          
          <div className="scrolling-container position-relative">
            <div className="scrolling-track d-flex gap-4 px-4">
              {[
                { title: "Visual Architecture", tag: "NODE HIERARCHY", src: "https://res.cloudinary.com/dsj0vaews/image/upload/v1775297699/jgdjuxtgs3h62luzarjx.jpg" },
                { title: "Nashik Network Reach", tag: "20 ACTIVE NODES", src: "https://res.cloudinary.com/dsj0vaews/image/upload/v1775297733/siwdpuen54spewx3fryj.png" },
                { title: "AI-Driven Logic", tag: "CORE OPTIMIZATION", src: "https://res.cloudinary.com/dsj0vaews/image/upload/v1775298499/vedekw6zqtoreyrxp7kt.jpg" },
                // Duplicate for seamless scroll
                { title: "Visual Architecture", tag: "NODE HIERARCHY", src: "https://res.cloudinary.com/dsj0vaews/image/upload/v1775297699/jgdjuxtgs3h62luzarjx.jpg" },
                { title: "Nashik Network Reach", tag: "20 ACTIVE NODES", src: "https://res.cloudinary.com/dsj0vaews/image/upload/v1775297733/siwdpuen54spewx3fryj.png" },
                { title: "AI-Driven Logic", tag: "CORE OPTIMIZATION", src: "https://res.cloudinary.com/dsj0vaews/image/upload/v1775298499/vedekw6zqtoreyrxp7kt.jpg" }
              ].map((item, i) => (
                <Card key={i} className="border-0 shadow-lg rounded-[2.5rem] overflow-hidden group flex-shrink-0" style={{ width: '450px' }}>
                    <div className="p-4 bg-white border-bottom d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="fw-black mb-1">{item.title}</h6>
                            <p className="text-[10px] text-slate-400 fw-bold mb-0">{item.tag}</p>
                        </div>
                        <Badge bg="blue-50" className="text-blue-600 rounded-pill px-2 py-1 smaller">MargVedha 3.0</Badge>
                    </div>
                    <div className="bg-white p-2 h-[320px]">
                        <img 
                            src={item.src} 
                            alt={item.title} 
                            className="w-100 h-100 object-fit-contain rounded-[2rem] transition-all group-hover:scale-105"
                        />
                    </div>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>
      {/* Ecosystem Scaling Section */}
      <section className="ecosystem-section py-10 bg-white">
        <Container>
          <Row className="g-4 align-items-center py-5 border-top border-slate-200">
             <Col lg={5} className="order-2 order-lg-1">
                <Badge bg="indigo-100" className="text-indigo-600 px-3 py-2 rounded-pill fw-bold mb-3 ls-1">ECOSYSTEM SCALING</Badge>
                <h3 className="fw-black display-6 tracking-tighter mb-4">A Unified Network for Citizens & Authorities</h3>
                <p className="text-slate-500 mb-4 ls-sm" style={{ lineHeight: '1.8' }}>
                   MargVedha isn't just a dashboard. It's a cross-platform ecosystem, integrating local authorities via the 
                   Command Center with the public through our Citizen Application. Our system is built to scale 
                   seamlessly across cities, starting with the Nashik Metropolitan area.
                </p>
                <ul className="list-unstyled space-y-4 mb-5">
                   {[
                      "Citizen Support Android/iOS Portal", 
                      "Police Analytics Web Dashboard", 
                      "Public Transit Optimization Flow", 
                      "Emergency Green Corridor Activation"
                   ].map((item, i) => (
                      <li key={i} className="d-flex align-items-center gap-3 mb-3">
                         <div className="p-1 rounded-full bg-indigo-500"><FaArrowRight size={8} color="white" /></div>
                         <span className="fw-bold text-slate-700">{item}</span>
                      </li>
                   ))}
                </ul>
                <Button variant="indigo" className="bg-indigo-600 border-0 text-white rounded-2xl px-5 py-3 fw-bold shadow-xl shadow-indigo-500/20" onClick={() => navigate("/developers")}>Explore Developer Portal</Button>
             </Col>
             <Col lg={7} className="order-1 order-lg-2 ps-lg-5 mb-5 mb-lg-0">
                <div className="p-2 bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden transform hover:translate-y-[-10px] transition-all">
                    <img 
                        src="https://res.cloudinary.com/dsj0vaews/image/upload/v1775297698/pttutnbrfoqyhyfwuwmo.png" 
                        alt="Citizen App & Dashboard Ecosystem" 
                        className="w-100 h-100 object-fit-contain rounded-[3rem]"
                    />
                </div>
             </Col>
          </Row>
        </Container>
      </section>

      {/* Video Overview Section */}
      <section className="video-overview pt-10 pb-10 bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          <Container className="relative">
              <div className="mb-5 text-center">
                 <Badge bg="primary" className="bg-blue-600 px-3 py-2 rounded-pill fw-bold mb-3 ls-1">FULL SYSTEM OVERVIEW</Badge>
                 <h2 className="fw-black tracking-tighter fs-1 mb-3 text-white">Watch MargVedha in Action</h2>
                 <p className="text-slate-400 max-w-lg mx-auto">A deep-dive technical walkthrough of the core simulation, AI inference, and deployment roadmap.</p>
              </div>
              <div className="max-w-4xl mx-auto rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.3)] border-8 border-slate-800 bg-slate-900 p-0 transform hover:scale-[1.01] transition-all">
                  <div className="ratio ratio-16x9">
                      <iframe 
                        src="https://www.youtube.com/embed/CYYZTJ4r36I?si=SWi9ZEt4pQxpyCWx" 
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        referrerPolicy="strict-origin-when-cross-origin" 
                        allowFullScreen
                      ></iframe>
                  </div>
              </div>
          </Container>
      </section>

      {/* Footer */}
      <footer className="footer-section py-8 bg-slate-50 border-top border-slate-200">
         <Container>
            <Row className="gy-4 align-items-center">
               <Col md={4} className="text-center text-md-start">
                  <img 
                    src="https://github.com/Aditya948351/Used-Images/blob/main/MargVedha-logo.png?raw=true" 
                    alt="MargVedha Logo" 
                    style={{ height: '35px', filter: 'grayscale(1)' }}
                    className="mb-3 opacity-50"
                  />
                  <p className="text-slate-400 xsmall fw-bold mb-0">MARGVEDHA TRAFFIC INTELLIGENCE PLATFORM</p>
                  <p className="text-slate-400 xsmall fw-medium">Unified Urban Operating System • Nashik Smart City</p>
               </Col>
               <Col md={4} className="text-center">
                  <Badge bg="white" className="text-slate-900 border border-slate-200 px-3 py-2 rounded-2xl ls-1">IN COLLABORATION WITH SARVAM AI</Badge>
               </Col>
               <Col md={4} className="text-center text-md-end">
                  <div className="d-flex gap-4 justify-content-center justify-content-md-end mb-2">
                     <Button variant="link" className="text-slate-500 fw-bold xsmall text-decoration-none p-0">API DOCS</Button>
                     <Button variant="link" className="text-slate-500 fw-bold xsmall text-decoration-none p-0">TERMS</Button>
                     <Button variant="link" className="text-slate-500 fw-bold xsmall text-decoration-none p-0" onClick={() => navigate("/login")}>ADMIN CONSOLE</Button>
                  </div>
                  <p className="text-slate-300 xsmall mb-0">© 2026 Nashik Smart City Dev Corp. Ltd.</p>
               </Col>
            </Row>
         </Container>
      </footer>

      <style>{`
        .ls-1 { letter-spacing: 1px; }
        .ls-2 { letter-spacing: 2px; }
        .fw-black { font-weight: 950; }
        .xsmall { font-size: 0.65rem; }
        .mockup-header { border-top-left-radius: 2rem; border-top-right-radius: 2rem; }
        .smaller { font-size: 0.55rem; }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .tracking-tighter { letter-spacing: -0.05em; }
        
        .bg-gradient-to-br { background: linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to)); }
        .from-blue-500 { --tw-gradient-from: #3b82f6; }
        .hero-section { z-index: 1; }
        .to-indigo-600 { --tw-gradient-to: #4f46e5; }
        
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .absolute { position: absolute; }
        
        .landing-page { scroll-behavior: smooth; }

        .scrolling-container {
          overflow: hidden;
          width: 100%;
        }
        .scrolling-track {
          display: flex;
          width: calc(450px * 6 + 1.5rem * 6);
          animation: scroll 40s linear infinite;
        }
        .scrolling-track:hover {
          animation-play-state: paused;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-450px * 3 - 1.5rem * 3)); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
