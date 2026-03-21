import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Table, Badge, Spinner, Button } from "react-bootstrap";
import { FaCity, FaMapMarkedAlt, FaTrafficLight, FaCarSide, FaUserShield, FaExternalLinkAlt } from "react-icons/fa";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [policeData, setPoliceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoliceData = async () => {
      try {
        const q = query(collection(db, "traffic_police"), orderBy("junctionId", "asc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPoliceData(data);
      } catch (error) {
        console.error("Error fetching police data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPoliceData();
  }, []);

  const totalVehicles = policeData.reduce((acc, curr) => acc + (curr.liveVehicleCount || 0), 0);
  const congestedJunctions = policeData.filter(p => p.status === "Congested").length;

  return (
    <Container fluid className="admin-dashboard-container">
      <Row className="mb-4">
        <Col>
          <h2 className="text-white"><FaUserShield className="me-2 text-primary" /> City Authority Control Room</h2>
          <p className="text-muted">Nashik Central Command - Real-Time Overview of all 20 Junctions</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}>
          <Card className="metric-card border-left-primary">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted text-uppercase mb-1">Total Monitored Intersections</h6>
                  <h2 className="mb-0 text-white">20</h2>
                </div>
                <div className="icon-circle bg-primary-soft">
                  <FaCity className="text-primary fs-3" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="metric-card border-left-success">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted text-uppercase mb-1">Total Active Vehicles (City-Wide)</h6>
                  <h2 className="mb-0 text-white">{loading ? <Spinner animation="border" size="sm" /> : totalVehicles.toLocaleString()}</h2>
                </div>
                <div className="icon-circle bg-success-soft">
                  <FaCarSide className="text-success fs-3" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="metric-card border-left-danger">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted text-uppercase mb-1">Congested Intersections</h6>
                  <h2 className="mb-0 text-white">{loading ? <Spinner animation="border" size="sm" /> : congestedJunctions}</h2>
                </div>
                <div className="icon-circle bg-danger-soft">
                  <FaTrafficLight className="text-danger fs-3" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={5} className="mb-4">
          <Card className="h-100 bg-dark-card border-0">
            <Card.Header className="bg-transparent border-bottom border-secondary pt-4 pb-3">
              <h5 className="mb-0 text-white"><FaMapMarkedAlt className="me-2 text-primary" /> Live 3D City Map</h5>
            </Card.Header>
            <Card.Body className="p-0 position-relative" style={{ minHeight: "400px" }}>
              <video 
                src="https://res.cloudinary.com/dsj0vaews/video/upload/v1774117387/eeololastomdbamjbs9a.mp4" 
                autoPlay loop muted playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", opacity: 0.9 }} 
              />
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
                {policeData.map((j) => (
                  <div key={j.id} style={{
                    position: "absolute",
                    top: `${Math.random() * 80 + 10}%`, 
                    left: `${Math.random() * 80 + 10}%`, 
                    background: j.status === "Congested" ? "rgba(239, 68, 68, 0.9)" : j.status === "Clear" ? "rgba(16, 185, 129, 0.9)" : "rgba(245, 158, 11, 0.9)",
                    width: "12px", height: "12px", borderRadius: "50%",
                    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                    border: "2px solid white",
                    cursor: "pointer",
                    transform: "translate(-50%, -50%)"
                  }} title={`${j.junctionName} - ${j.status}`} />
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={7} className="mb-4">
          <Card className="h-100 bg-dark-card border-0">
            <Card.Header className="bg-transparent border-bottom border-secondary pt-4 pb-3">
              <h5 className="mb-0 text-white">Active Traffic Police Units</h5>
            </Card.Header>
            <Card.Body className="p-0 table-responsive" style={{ maxHeight: "500px" }}>
              {loading ? (
                <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
              ) : (
                <Table hover variant="dark" className="mb-0 align-middle">
                  <thead className="sticky-top bg-dark">
                    <tr>
                      <th>#</th>
                      <th>Junction Name</th>
                      <th>Assigned Officer Email</th>
                      <th className="text-center">Live Count</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policeData.map((row) => (
                      <tr key={row.junctionId}>
                        <td>{row.junctionId}</td>
                        <td className="fw-bold">
                          {row.junctionName}
                          <Link to={`/profile/${row.junctionId}`} className="ms-2">
                            <FaExternalLinkAlt size={12} className="text-primary mb-1" />
                          </Link>
                        </td>
                        <td className="text-muted"><small>{row.email}</small></td>
                        <td className="text-center fw-bold fs-5 text-info">{row.liveVehicleCount}</td>
                        <td>
                          {row.status === 'Congested' ? <Badge bg="danger">Congested</Badge> : 
                           row.status === 'Clear' ? <Badge bg="success">Clear</Badge> : 
                           <Badge bg="warning text-dark">Active</Badge>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
