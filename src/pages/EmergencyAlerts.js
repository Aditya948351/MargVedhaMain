import React, { useState } from "react";
import { Container, Row, Col, Card, Badge, Button, ProgressBar } from "react-bootstrap";
import { FaAmbulance, FaFireExtinguisher, FaShieldAlt, FaMapMarkedAlt, FaPlus, FaBell, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import TrafficMonitoringMap from "./TrafficMonitoringMap";

const responseTimeData = [
  { time: "12:00", oldETA: 14, newETA: 8 },
  { time: "13:00", oldETA: 15, newETA: 7 },
  { time: "14:00", oldETA: 18, newETA: 9 },
  { time: "15:00", oldETA: 22, newETA: 10 },
  { time: "16:00", oldETA: 26, newETA: 12 },
  { time: "17:00", oldETA: 32, newETA: 14 },
  { time: "18:00", oldETA: 35, newETA: 15 },
];

const initialAlerts = [
  { id: "EM-1042", type: "Ambulance", location: "Udyog Bhavan, FDA office to Civil Hospital", status: "Active Preemption", priority: "Critical", icon: <FaAmbulance /> },
  { id: "EM-1043", type: "Fire Engine", location: "ITI Signal Sector 2", status: "Pending Route Clear", priority: "Critical", icon: <FaFireExtinguisher /> },
  { id: "EM-1044", type: "Police Convoy", location: "Croma - Inox Signal", status: "Active Preemption", priority: "High", icon: <FaShieldAlt /> },
];

const EmergencyAlerts = () => {
    const [alerts, setAlerts] = useState(initialAlerts);
    const [globalOverride, setGlobalOverride] = useState(false);

    const handleClearRoute = (index) => {
        const newAlerts = [...alerts];
        newAlerts[index].status = "Active Preemption";
        setAlerts(newAlerts);
    };

  return (
    <Container fluid className="dashboard-container pb-5 mt-4">
      <Row className="align-items-center mb-4 pt-3">
        <Col>
          <h2 className="fw-bold text-dark mb-1"><FaExclamationTriangle className="me-2 text-danger" /> Emergency Corridors</h2>
          <p className="text-muted mb-0">Officer Control Panel: Preempt signals and clear immediate paths for First Responders.</p>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        {/* KPI 1 */}
        <Col xs={12} md={4}>
          <Card className={`shadow-sm border-0 rounded-4 p-4 h-100 ${globalOverride ? 'bg-danger text-white' : 'bg-white'}`}>
             <div className="d-flex justify-content-between align-items-center mb-3">
               <div>
                  <h6 className={`fw-bold mb-0 text-uppercase small ${globalOverride ? 'text-light' : 'text-muted'}`}>System Override Status</h6>
                  <h3 className="fw-bold mb-0 mt-1">{globalOverride ? "ALL SIGNALS RED" : "Automatic Mode"}</h3>
               </div>
               <div className={`p-3 rounded-circle ${globalOverride ? 'bg-white text-danger bg-opacity-25' : 'bg-danger bg-opacity-10 text-danger'}`}>
                  <FaExclamationTriangle size={24} />
               </div>
             </div>
             {globalOverride ? (
                 <Button variant="light" className="w-100 fw-bold rounded-pill text-danger mt-2 alert-pulse" onClick={() => setGlobalOverride(false)}>Deactivate Master Override</Button>
             ) : (
                 <Button variant="danger" className="w-100 fw-bold rounded-pill mt-2" onClick={() => setGlobalOverride(true)}>Trigger Master Freeze</Button>
             )}
          </Card>
        </Col>

        {/* KPI 2 */}
        <Col xs={12} md={4}>
          <Card className="shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
             <div className="d-flex justify-content-between align-items-center mb-3">
               <div>
                  <h6 className="fw-bold mb-0 text-muted text-uppercase small">Avg Ambulance ETA</h6>
                  <h2 className="fw-bold mb-0 text-dark mt-1">6.2 <span className="text-muted fs-6 fw-normal">mins</span> <span className="badge bg-success ms-2 fs-6">↓ 42%</span></h2>
               </div>
               <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle">
                  <FaAmbulance size={24} />
               </div>
             </div>
             <ProgressBar now={80} variant="success" className="rounded-pill" style={{height: 6}} />
             <small className="text-muted mt-2 d-block">Time saved using dynamic green corridors.</small>
          </Card>
        </Col>

        {/* KPI 3 */}
        <Col xs={12} md={4}>
          <Card className="shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
             <div className="d-flex justify-content-between align-items-center mb-3">
               <div>
                  <h6 className="fw-bold mb-0 text-muted text-uppercase small">Active Preemptions</h6>
                  <h2 className="fw-bold mb-0 text-dark mt-1">{alerts.filter(a => a.status === 'Active Preemption').length} <span className="text-muted fs-6 fw-normal">corridors</span></h2>
               </div>
               <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                  <FaMapMarkedAlt size={24} />
               </div>
             </div>
             <ProgressBar now={30} variant="primary" className="rounded-pill" style={{height: 6}} />
             <small className="text-muted mt-2 d-block">Percentage of city grid currently locked for emergencies.</small>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Active Emergency Feed */}
        <Col xs={12} lg={4}>
          <Card className="shadow-sm border-0 rounded-4 h-100 bg-white">
            <Card.Header className="bg-white border-bottom border-light p-4">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center">
                  <span className="position-relative me-3">
                      <FaBell className="text-danger" />
                      <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle alert-pulse">
                          <span className="visually-hidden">New alerts</span>
                      </span>
                  </span>
                  Live Dispatch Feed
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
               <div className="list-group list-group-flush">
                   {alerts.map((alert, idx) => (
                       <div key={idx} className="list-group-item p-4 border-light border-bottom">
                           <div className="d-flex justify-content-between align-items-start mb-2">
                               <div className="d-flex align-items-center gap-2">
                                   <div className={`p-2 rounded bg-${alert.priority === 'Critical' ? 'danger' : 'warning'} text-white`}>
                                       {alert.icon}
                                   </div>
                                   <div>
                                       <h6 className="fw-bold text-dark mb-0">{alert.type}</h6>
                                       <small className="text-muted">{alert.id}</small>
                                   </div>
                               </div>
                               <Badge bg={alert.priority === 'Critical' ? 'danger' : 'warning'} pill>{alert.priority}</Badge>
                           </div>
                           <p className="text-muted small mb-3"><FaMapMarkedAlt className="me-2" />{alert.location}</p>
                           {alert.status === 'Active Preemption' ? (
                               <div className="d-flex align-items-center text-success small fw-bold bg-success bg-opacity-10 py-2 px-3 rounded text-center justify-content-center w-100">
                                   <FaCheck className="me-2" /> Corridor Cleared & Routing
                               </div>
                           ) : (
                               <Button variant="outline-danger" size="sm" className="w-100 fw-bold rounded-pill" onClick={() => handleClearRoute(idx)}>
                                   <FaPlus className="me-2" /> Force Clear Route Now
                               </Button>
                           )}
                       </div>
                   ))}
               </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Map and Chart Area */}
        <Col xs={12} lg={8} className="d-flex flex-column gap-4">
            <Card className="shadow-sm border-0 rounded-4 overflow-hidden bg-white w-100">
                <Card.Header className="bg-white border-0 pt-4 pb-0 px-4">
                   <h5 className="fw-bold text-dark mb-0">Tactical Responder Map</h5>
                   <p className="text-muted small">Green links indicate actively preempted signals securing intersection paths.</p>
                </Card.Header>
                <Card.Body className="p-3">
                    <div className="position-relative w-100 rounded-4 overflow-hidden border border-light" style={{height: 350}}>
                        {/* We reuse TrafficMonitoringMap as the base map layer */}
                        <TrafficMonitoringMap />
                        <div className="position-absolute bottom-0 end-0 m-3 d-flex flex-column gap-2" style={{zIndex: 400}}>
                            <Badge bg="danger" className="p-2 shadow-sm text-start"><FaAmbulance className="me-2"/> Active Ambulance</Badge>
                            <Badge bg="success" className="p-2 shadow-sm text-start"><FaCheck className="me-2"/> Preempted Path</Badge>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <Card className="shadow-sm border-0 rounded-4 p-4 bg-white">
                <div className="mb-4">
                  <h5 className="fw-bold text-dark mb-1">Response Time Analytics (Standard vs Dynamic Routing)</h5>
                  <p className="text-muted small mb-0">Comparing baseline historical ETA without AI Preemption vs. Actual current ETA.</p>
                </div>
                <div style={{ height: 250 }} className="w-100">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={responseTimeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorOld" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.5}/>
                             <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="oldETA" name="Baseline ETA (mins)" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorOld)" />
                        <Area type="monotone" dataKey="newETA" name="AI Preempted ETA (mins)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorNew)" />
                     </AreaChart>
                  </ResponsiveContainer>
                </div>
            </Card>
        </Col>
      </Row>
      <style>{`
        .alert-pulse {
            animation: pulse-animation 2s infinite;
        }
        @keyframes pulse-animation {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </Container>
  );
};

export default EmergencyAlerts;
