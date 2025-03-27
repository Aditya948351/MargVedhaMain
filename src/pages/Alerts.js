import React, { useState } from "react";
import { Container, Row, Col, Card, Table, Modal, Button, Form } from "react-bootstrap";
import { FaTrafficLight, FaExclamationTriangle, FaRoad, FaChartBar } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const Alerts = ({ isAdmin = true }) => {
  // State for storing reported incidents
  const [incidents, setIncidents] = useState([]);

  // State for modal form
  const [showModal, setShowModal] = useState(false);
  const [location, setLocation] = useState("");
  const [issue, setIssue] = useState("");
  const [reportedBy, setReportedBy] = useState("");

  // Chart Data (Dynamically updates)
  const chartData = {
    labels: ["Accidents", "Roadworks", "Traffic Jams", "Weather Issues"],
    datasets: [
      {
        label: "Reported Cases",
        data: [
          incidents.filter((i) => i.issue.includes("Accident")).length,
          incidents.filter((i) => i.issue.includes("Roadwork")).length,
          incidents.filter((i) => i.issue.includes("Traffic")).length,
          incidents.filter((i) => i.issue.includes("Weather")).length,
        ],
        backgroundColor: ["#ffcc00", "#ff5733", "#3498db", "#2ecc71"],
      },
    ],
  };

  // Handle submitting a new incident (Admin only)
  const handleReportIncident = (e) => {
    e.preventDefault();
    if (isAdmin) {
      setIncidents([...incidents, { location, issue, reportedBy }]);
      setShowModal(false); // Close modal after submission
      setLocation("");
      setIssue("");
      setReportedBy("");
    } else {
      alert("Only admins can report incidents!");
    }
  };

  return (
    <Container fluid className="mt-4" style={{ marginLeft: "250px" }}> {/* Adjust for sidebar */}
      {/* Header */}
      <Row className="text-center mb-4">
        <Col>
          <h1 className="fw-bold text-warning">
            <FaTrafficLight className="me-2" /> Live Traffic Alerts & Reports
          </h1>
          <p className="text-muted">
            Stay updated with real-time traffic incidents and roadwork reports.
          </p>
        </Col>
      </Row>

      {/* Report Incident Button (Always Visible) */}
      <Row className="justify-content-center mb-4">
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

      {/* Display Table & Graph only if incidents exist */}
      {incidents.length > 0 && (
        <>
          {/* Live Reports Table */}
          <Row className="justify-content-center">
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

          {/* Traffic Reports Graph */}
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
        </>
      )}

      {/* Modal for Reporting Incidents */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Report an Incident</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleReportIncident}>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Issue</Form.Label>
              <Form.Control
                type="text"
                placeholder="Describe the issue"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Reported By</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="success" type="submit" className="w-100">
              Submit Report
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Alerts;
