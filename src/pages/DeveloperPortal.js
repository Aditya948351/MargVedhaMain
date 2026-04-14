import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Table, Badge, Breadcrumb } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaDownload, FaCode, FaDatabase, FaArrowLeft, FaTable, FaFileCsv, FaClock } from "react-icons/fa";

const DeveloperPortal = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("2026-04-03");
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(12);
  const [previewData, setPreviewData] = useState([]);

  // Generate Dummy Data for the preview and download
  const generateData = (date, start, end) => {
    const junctions = ["Nashik Central", "CBS Square", "Mumbai Naka", "Gangapur Road"];
    const data = [];
    
    for (let h = start; h <= end; h++) {
      junctions.forEach(j => {
        data.push({
          timestamp: `${date} ${String(h).padStart(2, '0')}:00:00`,
          junction: j,
          flow_rate: Math.floor(Math.random() * 500) + 200,
          density: (Math.random() * 0.8 + 0.1).toFixed(2),
          avg_speed: Math.floor(Math.random() * 40) + 20,
          status: Math.random() > 0.8 ? "Congested" : "Clear"
        });
      });
    }
    return data;
  };

  useEffect(() => {
    setPreviewData(generateData(selectedDate, startHour, endHour).slice(0, 8));
  }, [selectedDate, startHour, endHour]);

  const handleDownload = () => {
    const fullData = generateData(selectedDate, startHour, endHour);
    const headers = ["Timestamp", "Junction", "Flow Rate (vph)", "Density", "Avg Speed (km/h)", "Status"];
    const csvContent = [
      headers.join(","),
      ...fullData.map(row => 
        `${row.timestamp},${row.junction},${row.flow_rate},${row.density},${row.avg_speed},${row.status}`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `margvedha_traffic_data_${selectedDate}_${startHour}-${endHour}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="developer-portal bg-slate-50 min-vh-100 font-sans text-slate-900 pb-5">
      {/* Navbar Overlay */}
      <nav className="px-4 py-3 bg-white border-bottom border-slate-200 shadow-sm sticky-top z-1050">
        <Container className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img 
              src="https://github.com/Aditya948351/Used-Images/blob/main/MargVedha-logo.png?raw=true" 
              alt="MargVedha Logo" 
              style={{ height: '35px', objectFit: 'contain' }}
            />
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <span className="fw-black ls-1 tracking-tighter fs-5">DEV <span className="text-blue-600">PORTAL</span></span>
          </div>
          <Button variant="outline-slate" className="rounded-pill border-slate-200 fw-bold xsmall px-3" onClick={() => navigate("/")}>
            <FaArrowLeft className="me-2" /> Back to Home
          </Button>
        </Container>
      </nav>

      <Container className="pt-5">
        <Row className="mb-4 align-items-center">
            <Col md={8}>
                <Badge bg="blue-100" className="text-blue-600 px-3 py-2 rounded-pill fw-bold mb-3 ls-1">OPEN DATA INITIATIVE</Badge>
                <h1 className="fw-black tracking-tighter display-5 mb-2">Urban Data for <span className="text-blue-600 italic">Builders.</span></h1>
                <p className="lead text-slate-500">Access high-fidelity historical and real-time synchronized traffic datasets for Nashik City.</p>
            </Col>
            <Col md={4} className="text-md-end">
                <Button 
                    variant="primary" 
                    className="rounded-2xl px-4 py-3 fw-black shadow-lg shadow-blue-500/20 w-100 w-md-auto"
                    onClick={handleDownload}
                >
                    <FaDownload className="me-2" /> Download Dataset (.csv)
                </Button>
            </Col>
        </Row>

        <Row className="g-4">
            <Col lg={4}>
                <Card className="border-0 shadow-sm rounded-[2rem] p-4 bg-white sticky-top" style={{ top: '100px' }}>
                    <div className="d-flex align-items-center gap-2 mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><FaDatabase size={14} /></div>
                        <h5 className="fw-black mb-0">Selection Controls</h5>
                    </div>

                    <Form>
                        <Form.Group className="mb-4">
                            <Form.Label className="xsmall fw-black text-slate-400 ls-1 uppercase">Select Date</Form.Label>
                            <Form.Select 
                                className="border-0 bg-slate-50 rounded-xl py-3 fw-bold shadow-sm"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            >
                                <option value="2026-04-03">3 April 2026</option>
                                <option value="2026-04-04">4 April 2026 (Live)</option>
                            </Form.Select>
                        </Form.Group>

                        <Row className="g-3 mb-4">
                            <Col xs={6}>
                                <Form.Label className="xsmall fw-black text-slate-400 ls-1 uppercase">Start Hour</Form.Label>
                                <Form.Select 
                                    className="border-0 bg-slate-50 rounded-xl py-3 fw-bold shadow-sm"
                                    value={startHour}
                                    onChange={(e) => setStartHour(parseInt(e.target.value))}
                                >
                                    {[...Array(24)].map((_, i) => (
                                        <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col xs={6}>
                                <Form.Label className="xsmall fw-black text-slate-400 ls-1 uppercase">End Hour</Form.Label>
                                <Form.Select 
                                    className="border-0 bg-slate-50 rounded-xl py-3 fw-bold shadow-sm"
                                    value={endHour}
                                    onChange={(e) => setEndHour(parseInt(e.target.value))}
                                >
                                    {[...Array(24)].map((_, i) => (
                                        <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                                    ))}
                                </Form.Select>
                            </Col>
                        </Row>

                        <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 border-dashed mb-4">
                            <p className="xsmall text-blue-600 fw-bold mb-1 d-flex align-items-center gap-2">
                                <FaClock /> DATA AVAILABILITY
                            </p>
                            <p className="xsmall text-slate-500 mb-0">Public API provides access to the last 48 hours of telemetry data with 1-second resolution.</p>
                        </div>
                        
                        <Button 
                            variant="white" 
                            className="w-100 border-slate-200 rounded-xl py-2 fw-black small text-slate-600 transition-all hover:bg-slate-50"
                        >
                            <FaCode className="me-2" /> View API Docs
                        </Button>
                    </Form>
                </Card>
            </Col>

            <Col lg={8}>
                <Card className="border-0 shadow-sm rounded-[2rem] p-0 bg-white overflow-hidden">
                    <div className="p-4 border-bottom bg-white d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                            <FaTable className="text-slate-400" />
                            <h5 className="fw-black mb-0">Dataset Preview</h5>
                        </div>
                        <Badge bg="success-soft" className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-2 rounded-pill font-mono">
                            JSON / CSV Available
                        </Badge>
                    </div>
                    <div className="table-responsive">
                        <Table hover className="mb-0">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="xsmall fw-black ps-4 py-3 ls-1 text-slate-400 border-0">TIMESTAMP</th>
                                    <th className="xsmall fw-black py-3 ls-1 text-slate-400 border-0">JUNCTION</th>
                                    <th className="xsmall fw-black text-center py-3 ls-1 text-slate-400 border-0">FLOW</th>
                                    <th className="xsmall fw-black text-center py-3 ls-1 text-slate-400 border-0">DENSITY</th>
                                    <th className="xsmall fw-black text-center py-3 ls-1 text-slate-400 border-0">SPEED</th>
                                    <th className="xsmall fw-black pe-4 text-end py-3 ls-1 text-slate-400 border-0">STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.map((row, i) => (
                                    <tr key={i} className="align-middle">
                                        <td className="ps-4 py-3 xsmall fw-bold text-slate-600">{row.timestamp}</td>
                                        <td className="py-3"><span className="fw-bold">{row.junction}</span></td>
                                        <td className="py-3 text-center fw-bold">{row.flow_rate}</td>
                                        <td className="py-3 text-center"><Badge bg="slate-100" className="text-slate-600 border-0">{row.density}</Badge></td>
                                        <td className="py-3 text-center fw-bold text-blue-600">{row.avg_speed} km/h</td>
                                        <td className="pe-4 py-3 text-end">
                                            <Badge bg={row.status === 'Congested' ? 'rose-100' : 'emerald-100'} className={row.status === 'Congested' ? 'text-rose-600' : 'text-emerald-600'}>
                                                {row.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    <div className="p-4 bg-slate-50 text-center border-top">
                        <p className="xsmall text-slate-400 fw-medium mb-0">Showing top 8 results. Full dataset includes up to 86,400 rows per day per junction.</p>
                    </div>
                </Card>

                {/* Additional Dev Info */}
                <Row className="mt-4 g-4">
                    <Col md={6}>
                        <Card className="border-0 shadow-sm rounded-3xl p-4 bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
                            <h5 className="fw-black mb-3">Postman Collection</h5>
                            <p className="small opacity-80 mb-4">Jumpstart your integration with our official workspace containing pre-configured traffic endpoints.</p>
                            <Button variant="white" className="bg-white text-indigo-600 rounded-xl fw-black small border-0 py-2 w-100">Fork Collection</Button>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="border-0 shadow-sm rounded-3xl p-4 bg-white border border-slate-100">
                            <h5 className="fw-black mb-3">Model Schemas</h5>
                            <p className="small text-slate-500 mb-4">Detailed definitions of our BoT-SORT output objects and YOLO inference confidence mapping.</p>
                            <Button variant="slate-900" className="bg-slate-900 text-white border-0 rounded-xl fw-black small py-2 w-100">Explore Docs</Button>
                        </Card>
                    </Col>
                </Row>
            </Col>
        </Row>
      </Container>

      <style>{`
        .ls-1 { letter-spacing: 1px; }
        .fw-black { font-weight: 950; }
        .xsmall { font-size: 0.65rem; }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-2xl { border-radius: 1rem; }
        .rounded-3xl { border-radius: 1.5rem; }
        .cursor-pointer { cursor: pointer; }
        .bg-gradient-to-br { background: linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to)); }
        .from-indigo-600 { --tw-gradient-from: #4f46e5; }
        .to-blue-700 { --tw-gradient-to: #1d4ed8; }
      `}</style>
    </div>
  );
};

export default DeveloperPortal;
