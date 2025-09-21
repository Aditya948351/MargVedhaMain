import React, { useState } from "react";
import { Container, Row, Col, Card, Table, Modal, Button, Form } from "react-bootstrap";
import { FaTrafficLight, FaExclamationTriangle, FaRoad, FaChartBar, FaMapMarkerAlt } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from "chart.js";


ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const Alerts = ({ isAdmin = true }) => {
  const [incidents, setIncidents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState([28.7041, 77.1025]); // Default: Delhi
  const [issue, setIssue] = useState("");
  const [reportedBy, setReportedBy] = useState("");

  
  const issueOptions = ["Accident", "Roadwork", "Traffic Jam", "Weather Issue"];
  const adminOptions = ["Admin (ID=01)", "Admin (ID=02)", "Admin (ID=03)"];

  
  const handleLocationChange = async (e) => {
    const loc = e.target.value;
    setLocation(loc);
    if (loc) {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${loc}`);
        const data = await response.json();
        if (data.length > 0) {
          setCoordinates([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    }
  };

  
  const handleReportIncident = (e) => {
    e.preventDefault();
    if (isAdmin) {
      setIncidents([...incidents, { location, issue, reportedBy, coordinates }]);
      setShowModal(false);
      setLocation("");
      setIssue("");
      setReportedBy("");
    } else {
      alert("Only admins can report incidents!");
    }
  };

  
  const chartData = {
    labels: ["Accidents", "Roadworks", "Traffic Jams", "Weather Issues"],
    datasets: [
      {
        label: "Reported Cases",
        data: [
          incidents.filter((i) => i.issue === "Accident").length,
          incidents.filter((i) => i.issue === "Roadwork").length,
          incidents.filter((i) => i.issue === "Traffic Jam").length,
          incidents.filter((i) => i.issue === "Weather Issue").length,
        ],
        backgroundColor: ["#ffcc00", "#ff5733", "#3498db", "#2ecc71"],
      },
    ],
  };

  return (
    <Container fluid className="mt-4">
      <Col md={10} className="mx-auto">
        
        <Row className="text-center mb-4">
          <Col>
            <h1 className="fw-bold text-warning">
              <FaTrafficLight className="me-2" /> Live Traffic Alerts & Reports 
            </h1>
            <h2 color="#ffffff">In Development </h2>
            <p className="text-muted">Stay updated with real-time traffic incidents and roadwork reports.</p>
          </Col>
        </Row>

        
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h4 className="text-info fw-bold">
                  <FaMapMarkerAlt className="me-2" /> Live Map View
                </h4>
                <MapContainer center={coordinates} zoom={13} style={{ height: "350px", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={coordinates}>
                    <Popup>{location || "Current Map View"}</Popup>
                  </Marker>
                </MapContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        
        <Row className="justify-content-center my-4">
          <Col md={6} className="text-center">
            <Card className="shadow-sm border-0 p-3">
              <Card.Body>
                <h4 className="text-success">
                  <FaRoad className="me-2" /> Report a Traffic Issue
                </h4>
                <p className="text-muted">Admins can report roadblocks, traffic jams, or accidents.</p>
                <Button className="btn btn-warning fw-bold" onClick={() => setShowModal(true)}>
                  Report Now
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

                
                {incidents.length > 0 && (
          <Row className="justify-content-center mt-4">
            <Col md={8}>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <h4 className="text-danger fw-bold">
                    <FaExclamationTriangle className="me-2" /> Current Live Alerts
                  </h4>
                  <Table striped bordered hover responsive className="mt-3">
                    <thead className="table-dark">
                      <tr>
                        <th>Location</th>
                        <th>Issue</th>
                        <th>Reported By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incidents.map((incident, index) => (
                        <tr key={index}>
                          <td>{incident.location}</td>
                          <td>{incident.issue}</td>
                          <td>{incident.reportedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        
        <Row className="justify-content-center mt-4">
          <Col md={8}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h4 className="text-primary fw-bold">
                  <FaChartBar className="me-2" /> Traffic Reports Overview
                </h4>
                <Bar data={chartData} />
              </Card.Body>
            </Card>
          </Col>
        </Row>



        
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Report an Incident</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleReportIncident}>
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control type="text" placeholder="Enter location" value={location} onChange={handleLocationChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Issue</Form.Label>
                <Form.Select value={issue} onChange={(e) => setIssue(e.target.value)} required>
                  <option value="">Select an issue</option>
                  {issueOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Reported By</Form.Label>
                <Form.Select value={reportedBy} onChange={(e) => setReportedBy(e.target.value)} required>
                  <option value="">Select reporter</option>
                  {adminOptions.map((admin, index) => (
                    <option key={index} value={admin}>{admin}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Button variant="success" type="submit" className="w-100">Submit Report</Button>
            </Form>
          </Modal.Body>
        </Modal>
      </Col>
    </Container>
  );
};

export default Alerts;
