import React, { useState } from "react";
import { Container, Row, Col, Card, Badge, Button, Table, ProgressBar } from "react-bootstrap";
import { FaMoneyBillWave, FaChartLine, FaLock, FaUnlock, FaCar } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

const surgeData = [
  { time: "08:00", density: 40, multiplier: 1.0 },
  { time: "09:00", density: 85, multiplier: 1.8 },
  { time: "10:00", density: 95, multiplier: 2.5 },
  { time: "11:00", density: 60, multiplier: 1.4 },
  { time: "12:00", density: 45, multiplier: 1.1 },
  { time: "13:00", density: 50, multiplier: 1.2 },
  { time: "14:00", density: 30, multiplier: 1.0 },
];

const initialZones = [
  { id: "Z-Central", name: "CBS & M.G. Road", currentSurge: "2.5x", trend: "up", baseFare: "₹50", active: true },
  { id: "Z-North", name: "Panchavati", currentSurge: "1.2x", trend: "stable", baseFare: "₹40", active: true },
  { id: "Z-South", name: "Nashik Road Station", currentSurge: "1.8x", trend: "up", baseFare: "₹65", active: true },
  { id: "Z-West", name: "Gangapur Road", currentSurge: "1.0x", trend: "down", baseFare: "₹45", active: true },
  { id: "Z-East", name: "Adgaon Naka", currentSurge: "1.0x", trend: "stable", baseFare: "₹30", active: true },
];

const AutoFareAdjustments = () => {
    const [zones, setZones] = useState(initialZones);
    const [freezeAll, setFreezeAll] = useState(false);

    const toggleZoneSurge = (index) => {
        const newZones = [...zones];
        newZones[index].active = !newZones[index].active;
        setZones(newZones);
    };

    const toggleGlobalFreeze = () => {
        setFreezeAll(!freezeAll);
        const newZones = zones.map(z => ({...z, active: freezeAll})); // If freezing all, set active to false. If unfreezing, set all active.
        setZones(newZones);
    }

  return (
    <Container fluid className="dashboard-container pb-5 mt-4">
      <Row className="align-items-center mb-4 pt-3">
        <Col>
          <h2 className="fw-bold text-dark mb-1"><FaMoneyBillWave className="me-2 text-primary" /> Dynamic Congestion Fares</h2>
          <p className="text-muted mb-0">Officer Control Panel: Monitor and regulate AI-driven transit pricing algorithms.</p>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        {/* KPI 1 */}
        <Col xs={12} md={4}>
          <Card className={`shadow-sm border-0 rounded-4 p-4 h-100 ${freezeAll ? 'bg-warning text-dark' : 'bg-white'}`}>
             <div className="d-flex justify-content-between align-items-center mb-3">
               <div>
                  <h6 className={`fw-bold mb-0 text-uppercase small ${freezeAll ? 'text-dark opacity-75' : 'text-muted'}`}>System Pricing State</h6>
                  <h3 className="fw-bold mb-0 mt-1">{freezeAll ? "SURGE FROZEN" : "Dynamic Auto"}</h3>
               </div>
               <div className={`p-3 rounded-circle ${freezeAll ? 'bg-dark bg-opacity-10 text-dark' : 'bg-warning bg-opacity-10 text-warning'}`}>
                  {freezeAll ? <FaLock size={24} /> : <FaUnlock size={24} />}
               </div>
             </div>
             {freezeAll ? (
                 <Button variant="dark" className="w-100 fw-bold rounded-pill mt-2" onClick={toggleGlobalFreeze}>Resume Dynamic Pricing</Button>
             ) : (
                 <Button variant="warning" className="w-100 fw-bold rounded-pill text-dark mt-2" onClick={toggleGlobalFreeze}>Freeze All Surge Pricing (Crisis Mode)</Button>
             )}
          </Card>
        </Col>

        {/* KPI 2 */}
        <Col xs={12} md={4}>
          <Card className="shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
             <div className="d-flex justify-content-between align-items-center mb-3">
               <div>
                  <h6 className="fw-bold mb-0 text-muted text-uppercase small">City-Wide Avg Multiplier</h6>
                  <h2 className="fw-bold mb-0 text-dark mt-1">1.4x <span className="badge bg-danger ms-2 fs-6">↑ 0.2x</span></h2>
               </div>
               <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                  <FaChartLine size={24} />
               </div>
             </div>
             <ProgressBar now={40} variant="primary" className="rounded-pill" style={{height: 6}} />
             <small className="text-muted mt-2 d-block">Overall urban transportation cost index.</small>
          </Card>
        </Col>

        {/* KPI 3 */}
        <Col xs={12} md={4}>
          <Card className="shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
             <div className="d-flex justify-content-between align-items-center mb-3">
               <div>
                  <h6 className="fw-bold mb-0 text-muted text-uppercase small">Congestion Reduction Est.</h6>
                  <h2 className="fw-bold mb-0 text-dark mt-1">12.5% <span className="text-muted fs-6 fw-normal">diverted</span></h2>
               </div>
               <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle">
                  <FaCar size={24} />
               </div>
             </div>
             <ProgressBar now={12.5} variant="success" className="rounded-pill" style={{height: 6}} />
             <small className="text-muted mt-2 d-block">Traffic volume deterred by current surge pricing.</small>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Surge vs Density Chart */}
        <Col xs={12} lg={7}>
          <Card className="shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
            <div className="mb-4">
              <h5 className="fw-bold text-dark mb-1">Traffic Density vs. Fare Multiplier</h5>
              <p className="text-muted small mb-0">Historical correlation of the pricing algorithm matching vehicle density curves.</p>
            </div>
            <div style={{ height: 350 }} className="w-100">
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={surgeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="density" name="Traffic Density (%)" stroke="#3b82f6" strokeWidth={3} dot={{r:4}} activeDot={{r: 8}} />
                    <Line yAxisId="right" type="monotone" dataKey="multiplier" name="Surge Multiplier (x)" stroke="#f59e0b" strokeWidth={3} dot={{r:4}} activeDot={{r: 8}} />
                 </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Local Zonal Control */}
        <Col xs={12} lg={5}>
          <Card className="shadow-sm border-0 rounded-4 h-100 bg-white overflow-hidden">
             <Card.Header className="bg-white border-bottom border-light p-4">
                 <h5 className="fw-bold text-dark mb-0">Zonal Pricing Controls</h5>
                 <p className="text-muted small mb-0">Independently freeze specific sectors.</p>
             </Card.Header>
             <Card.Body className="p-0">
                <Table responsive hover className="mb-0 align-middle">
                   <thead className="bg-light">
                      <tr>
                         <th className="border-0 text-muted small fw-bold px-4 pt-3 pb-2 w-50">Zone</th>
                         <th className="border-0 text-muted small fw-bold pt-3 pb-2 text-center">Multiplier</th>
                         <th className="border-0 text-muted small fw-bold pt-3 pb-2 px-4 text-end">Action</th>
                      </tr>
                   </thead>
                   <tbody>
                      {zones.map((zone, idx) => (
                         <tr key={idx} className={!zone.active ? "bg-warning bg-opacity-10" : ""}>
                            <td className="px-4 py-3">
                               <div className="fw-bold text-dark">{zone.name}</div>
                               <small className="text-muted text-uppercase">{zone.id} · Base: {zone.baseFare}</small>
                            </td>
                            <td className="text-center py-3">
                               {zone.active ? (
                                   <Badge bg={parseFloat(zone.currentSurge) > 1.5 ? 'danger' : (parseFloat(zone.currentSurge) > 1.0 ? 'warning' : 'success')} pill className="fs-6 px-3">
                                       {zone.currentSurge}
                                   </Badge>
                               ) : (
                                   <Badge bg="secondary" pill className="fs-6 px-3">
                                       <FaLock className="me-1" /> 1.0x (Frozen)
                                   </Badge>
                               )}
                            </td>
                            <td className="text-end px-4 py-3">
                               <Button 
                                  variant={zone.active ? "outline-danger" : "outline-success"} 
                                  size="sm" 
                                  className="fw-bold rounded-pill"
                                  onClick={() => toggleZoneSurge(idx)}
                               >
                                   {zone.active ? "Freeze" : "Unfreeze"}
                               </Button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </Table>
             </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AutoFareAdjustments;
