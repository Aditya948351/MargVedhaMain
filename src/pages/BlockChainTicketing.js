import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Table, ProgressBar } from "react-bootstrap";
import { FaLink, FaShieldAlt, FaServer, FaEthereum, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

const analyticsData = [
  { day: "Mon", revenue: 4200, fraud: 120 },
  { day: "Tue", revenue: 4800, fraud: 80 },
  { day: "Wed", revenue: 5100, fraud: 45 },
  { day: "Thu", revenue: 4600, fraud: 200 },
  { day: "Fri", revenue: 6200, fraud: 310 },
  { day: "Sat", revenue: 7500, fraud: 400 },
  { day: "Sun", revenue: 7100, fraud: 250 },
];

const generateHash = () => {
    return '0x' + [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
};

const initialTransactions = [
  { id: "#TX-9921", hash: generateHash(), type: "Pass Scan", status: "Verified", time: "Just now" },
  { id: "#TX-9920", hash: generateHash(), type: "Ticket Issued", status: "Verified", time: "1 min ago" },
  { id: "#TX-9919", hash: generateHash(), type: "Wallet Topup", status: "Pending", time: "2 mins ago" },
  { id: "#TX-9918", hash: generateHash(), type: "Pass Scan", status: "Rejected", time: "3 mins ago" },
  { id: "#TX-9917", hash: generateHash(), type: "Monthly Renewal", status: "Verified", time: "5 mins ago" },
];

const BlockChainTicketing = () => {
  const [transactions, setTransactions] = useState(initialTransactions);

  // Simulate incoming live blocks
  useEffect(() => {
    const interval = setInterval(() => {
       const newTx = {
          id: `#TX-${Math.floor(1000 + Math.random() * 9000)}`,
          hash: generateHash(),
          type: Math.random() > 0.5 ? "Pass Scan" : "Ticket Issued",
          status: Math.random() > 0.1 ? "Verified" : "Rejected",
          time: "Just now"
       };
       setTransactions(prev => [newTx, ...prev.slice(0, 4)]);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container fluid className="dashboard-container pb-5 mt-4">
      <Row className="align-items-center mb-4 pt-3">
        <Col>
          <h2 className="fw-bold text-dark mb-1"><FaLink className="me-2 text-primary" /> Transit Ticketing Audit</h2>
          <p className="text-muted mb-0">Officer View: Decentralized Ledger & Fraud Detection Analytics</p>
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        {/* KPI 1 */}
        <Col xs={12} md={4}>
          <Card className="shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
             <div className="d-flex justify-content-between align-items-center mb-3">
               <div>
                  <h6 className="fw-bold mb-0 text-muted text-uppercase small">Daily Validations</h6>
                  <h2 className="fw-bold mb-0 text-dark mt-1">48,291</h2>
               </div>
               <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle">
                  <FaShieldAlt size={24} />
               </div>
             </div>
             <ProgressBar now={85} variant="success" className="rounded-pill" style={{height: 6}} />
             <small className="text-muted mt-2 d-block">85% daily average capacity reached.</small>
          </Card>
        </Col>

        {/* KPI 2 */}
        <Col xs={12} md={4}>
          <Card className="shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
             <div className="d-flex justify-content-between align-items-center mb-3">
               <div>
                  <h6 className="fw-bold mb-0 text-muted text-uppercase small">Network Node Status</h6>
                  <h2 className="fw-bold mb-0 text-dark mt-1">12 / 12 <span className="text-success fs-6 fw-normal">Online</span></h2>
               </div>
               <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                  <FaServer size={24} />
               </div>
             </div>
             <ProgressBar now={100} variant="primary" className="rounded-pill" style={{height: 6}} />
             <small className="text-muted mt-2 d-block">All distributed validators synchronized.</small>
          </Card>
        </Col>

        {/* KPI 3 */}
        <Col xs={12} md={4}>
          <Card className="shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
             <div className="d-flex justify-content-between align-items-center mb-3">
               <div>
                  <h6 className="fw-bold mb-0 text-muted text-uppercase small">Smart Contract Gas Avg</h6>
                  <h2 className="fw-bold mb-0 text-dark mt-1">0.0014 <span className="text-muted fs-6 fw-normal">POL</span></h2>
               </div>
               <div className="bg-secondary bg-opacity-10 text-secondary p-3 rounded-circle">
                  <FaEthereum size={24} />
               </div>
             </div>
             <ProgressBar now={15} variant="secondary" className="rounded-pill" style={{height: 6}} />
             <small className="text-muted mt-2 d-block">Network congestion is currently low.</small>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Fraud Analytics Chart */}
        <Col xs={12} lg={7}>
          <Card className="shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
            <div className="mb-4">
              <h5 className="fw-bold text-dark mb-1">Validation Volume vs. Fraud Attempts</h5>
              <p className="text-muted small mb-0">System identified irregular cryptographic signatures or double-spend tickets.</p>
            </div>
            <div style={{ height: 320 }} className="w-100">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={analyticsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar yAxisId="left" dataKey="revenue" name="Valid Scans (x10)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                    <Bar yAxisId="right" dataKey="fraud" name="Fraud Blocked" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                 </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Live Transaction Ledger */}
        <Col xs={12} lg={5}>
          <Card className="shadow-sm border-0 rounded-4 h-100 bg-white overflow-hidden">
             <Card.Header className="bg-white border-bottom border-light p-4">
                <div className="d-flex justify-content-between align-items-center">
                   <h5 className="fw-bold text-dark mb-0"><span className="spinner-grow spinner-grow-sm text-success me-2" role="status" aria-hidden="true"></span>Live Block Ledger</h5>
                   <Badge bg="dark" text="light" className="px-3 py-2 rounded-pill"><FaEthereum className="me-1"/> Polygon PoS</Badge>
                </div>
             </Card.Header>
             <Card.Body className="p-0">
                <Table responsive hover className="mb-0 text-nowrap">
                   <thead className="bg-light">
                      <tr>
                         <th className="border-0 text-muted small fw-bold px-4 pt-3 pb-2 w-25">TX ID</th>
                         <th className="border-0 text-muted small fw-bold pt-3 pb-2 w-50">Operation Hash</th>
                         <th className="border-0 text-muted small fw-bold pt-3 pb-2 w-25 text-end px-4">Status</th>
                      </tr>
                   </thead>
                   <tbody>
                      {transactions.map((tx, idx) => (
                         <tr key={idx} className={idx === 0 ? "bg-primary bg-opacity-10 transition-all" : "transition-all"}>
                            <td className="align-middle px-4 py-3">
                               <div className="fw-bold text-dark">{tx.id}</div>
                               <small className="text-muted">{tx.type}</small>
                            </td>
                            <td className="align-middle py-3">
                               <div className="font-monospace small text-muted text-truncate" style={{maxWidth: '150px'}}>
                                  {tx.hash}
                               </div>
                               <small className="text-primary">{tx.time}</small>
                            </td>
                            <td className="align-middle text-end px-4 py-3">
                               {tx.status === 'Verified' && <Badge bg="success" pill className="px-3"><FaCheckCircle className="me-1"/> Verified</Badge>}
                               {tx.status === 'Pending' && <Badge bg="warning" text="dark" pill className="px-3">Pending</Badge>}
                               {tx.status === 'Rejected' && <Badge bg="danger" pill className="px-3"><FaExclamationCircle className="me-1"/> Rejected</Badge>}
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

export default BlockChainTicketing;