import React, { useState } from "react";
import { Container, Row, Col, Card, Badge, Button, Form, ProgressBar } from "react-bootstrap";
import { FaBus, FaMapMarkerAlt, FaExclamationTriangle, FaChartArea, FaSatelliteDish } from "react-icons/fa";
import { XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import TrafficMonitoringMap from "./TrafficMonitoringMap";

const sampleMLData = [
  { time: "08:00", density: 40, waitTime: 5 },
  { time: "08:30", density: 60, waitTime: 8 },
  { time: "09:00", density: 90, waitTime: 18 },
  { time: "09:30", density: 85, waitTime: 15 },
  { time: "10:00", density: 50, waitTime: 7 },
  { time: "10:30", density: 30, waitTime: 3 },
];

const BusRouteOptimization = () => {
  const [overrideActive, setOverrideActive] = useState(false);
  const [priorityCorridor, setPriorityCorridor] = useState("Nashik Road");

  const [liveNodes] = useState([
    { location: "Vidya Vikas Circle", status: "Nominal", variant: "success", wait: "2m" },
    { location: "Spectrum Junction", status: "High Priority", variant: "warning", wait: "9m" },
    { location: "College Road East", status: "Critical Congestion", variant: "danger", wait: "18m" },
  ]);

  return (
    <Container fluid className="dashboard-container pb-5 mt-4">
      <Row className="align-items-center mb-4 pt-3">
        <Col>
          <h2 className="fw-bold text-dark mb-1"><FaBus className="me-2 text-primary" /> Bus Route Prioritization</h2>
          <p className="text-muted mb-0">Officer Control Panel: Monitor and intervene in ML-driven transit routing.</p>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        {/* Officer KPI 1 */}
        <Col xs={12} md={4}>
          <Card className="shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
             <div className="d-flex justify-content-between align-items-center mb-3">
               <div>
                  <h6 className="fw-bold mb-0 text-muted text-uppercase small">Active Prioritized Buses</h6>
                  <h2 className="fw-bold mb-0 text-dark mt-1">114 <span className="text-success fs-6 fw-normal">↑ 12 online</span></h2>
               </div>
               <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                  <FaBus size={24} />
               </div>
             </div>
             <ProgressBar now={75} variant="primary" className="rounded-pill" style={{height: 6}} />
             <small className="text-muted mt-2 d-block">75% of fleet operating within target wait times.</small>
          </Card>
        </Col>

        {/* Officer KPI 2 */}
        <Col xs={12} md={4}>
          <Card className="shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
             <div className="d-flex justify-content-between align-items-center mb-3">
               <div>
                  <h6 className="fw-bold mb-0 text-muted text-uppercase small">Total Delay Saved (Today)</h6>
                  <h2 className="fw-bold mb-0 text-dark mt-1">42 <span className="text-muted fs-6 fw-normal">hours</span></h2>
               </div>
               <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle">
                  <FaChartArea size={24} />
               </div>
             </div>
             <ProgressBar now={88} variant="success" className="rounded-pill" style={{height: 6}} />
             <small className="text-muted mt-2 d-block">AI Preemption efficiency is currently very high.</small>
          </Card>
        </Col>

        {/* Officer KPI 3 */}
        <Col xs={12} md={4}>
          <Card className="shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
             <div className="d-flex justify-content-between align-items-center mb-3">
               <div>
                  <h6 className="fw-bold mb-0 text-muted text-uppercase small">ML Confidence Score</h6>
                  <h2 className="fw-bold mb-0 text-dark mt-1">92.4%</h2>
               </div>
               <div className="bg-info bg-opacity-10 text-info p-3 rounded-circle">
                  <FaSatelliteDish size={24} />
               </div>
             </div>
             <ProgressBar now={92} variant="info" className="rounded-pill" style={{height: 6}} />
             <small className="text-muted mt-2 d-block">Model validation against live sensor data.</small>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
         {/* Live Tactical Map */}
         <Col xs={12} lg={8}>
            <Card className="shadow-sm border-0 rounded-4 overflow-hidden h-100 bg-white">
              <Card.Header className="bg-white border-0 pt-4 pb-0 px-4">
                 <h5 className="fw-bold text-dark mb-0"><FaMapMarkerAlt className="me-2 text-danger"/> Tactical Transit Map</h5>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="position-relative w-100 rounded-4 overflow-hidden border border-light" style={{height: 400}}>
                   <TrafficMonitoringMap />
                   {overrideActive && (
                     <div className="position-absolute top-0 start-0 m-3 p-3 bg-danger bg-opacity-75 text-white rounded-3 shadow" style={{zIndex: 1000}}>
                        <h6 className="fw-bold mb-1"><FaExclamationTriangle className="me-2" /> MANUAL OVERRIDE ACTIVE</h6>
                        <small>Corridor: {priorityCorridor}</small>
                     </div>
                   )}
                </div>
              </Card.Body>
            </Card>
         </Col>

         {/* Officer Manual Overrides & Analytics */}
         <Col xs={12} lg={4}>
            {/* System Override */}
            <Card className="shadow-sm border-0 rounded-4 p-4 mb-4 bg-white border-top border-5 border-warning">
               <h5 className="fw-bold text-dark mb-3">System Overrides</h5>
               <Form.Group className="mb-3">
                 <Form.Label className="small fw-bold text-muted">Force Preemption Corridor</Form.Label>
                 <Form.Select className="fw-semibold bg-light" value={priorityCorridor} onChange={(e) => setPriorityCorridor(e.target.value)}>
                   <option>Nashik Road</option>
                   <option>Gangapur Road</option>
                   <option>College Road</option>
                   <option>Trimbak Road</option>
                 </Form.Select>
               </Form.Group>
               
               <div className="d-grid gap-2">
                 {overrideActive ? (
                   <Button variant="danger" className="fw-bold rounded-pill" onClick={() => setOverrideActive(false)}>Release Override</Button>
                 ) : (
                   <Button variant="warning" className="fw-bold rounded-pill text-dark" onClick={() => setOverrideActive(true)}>Engage Forced Priority</Button>
                 )}
               </div>
            </Card>

            {/* Active Node Status */}
            <Card className="shadow-sm border-0 rounded-4 p-4 bg-white h-100">
               <h5 className="fw-bold text-dark mb-4">Critical Nodes Tracking</h5>
               <div className="d-flex flex-column gap-3">
                 {liveNodes.map((node, idx) => (
                   <div key={idx} className="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                      <div>
                         <h6 className="fw-bold text-dark mb-1">{node.location}</h6>
                         <Badge bg={node.variant} pill>{node.status}</Badge>
                      </div>
                      <div className="text-end">
                         <div className="small text-muted fw-bold text-uppercase">Wait</div>
                         <div className={`fw-bold text-${node.variant} fs-5`}>{node.wait}</div>
                      </div>
                   </div>
                 ))}
               </div>
            </Card>
         </Col>
      </Row>

      {/* Analytics Chart Row */}
      <Row className="g-4 mt-2">
         <Col xs={12}>
           <Card className="shadow-sm border-0 rounded-4 p-4 bg-white">
             <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                   <h5 className="fw-bold text-dark mb-1">Wait Time vs. Traffic Density</h5>
                   <p className="text-muted small mb-0">ML preemption impact across the grid over the last 3 hours.</p>
                </div>
             </div>
             <div style={{ height: 250 }} className="w-100">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sampleMLData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                       </linearGradient>
                       <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                     <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                     <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                     <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                     <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}/>
                     <Area yAxisId="left" type="monotone" dataKey="waitTime" name="Wait (mins)" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorWait)" />
                     <Area yAxisId="right" type="monotone" dataKey="density" name="Density (%)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorDensity)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
           </Card>
         </Col>
      </Row>
    </Container>
  );
};

export default BusRouteOptimization;
