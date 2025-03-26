import React from "react";
import { Card, Row, Col, Button, Container } from "react-bootstrap";  // Add Container
import { FaTrafficLight, FaBus, FaLock, FaExclamationTriangle, FaMoneyBill, FaCar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <Container className="p-4">
      <h2>📊 Dashboard - Traffic Monitoring System</h2>
      <p>Monitor real-time traffic conditions and optimize routes efficiently.</p>

      {/* 🚦 Real-time Traffic & Bus Route Optimization */}
      <Row className="mb-4">
        <Col xs={12} md={6} className="mb-3"> {/* Full width on mobile */}
          <Card className="shadow-lg border-0">
            <Card.Body>
              <Card.Title>
                <FaTrafficLight className="text-danger" /> Real-time Traffic Monitoring
              </Card.Title>
              <Card.Text>Live traffic updates using AI-based YOLOv8 vehicle detection.</Card.Text>
              <Button variant="primary" onClick={() => navigate("/live-Feed")}>🔴 Live Feed</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} className="mb-3">
          <Card className="shadow-lg border-0">
            <Card.Body>
              <Card.Title>
                <FaBus className="text-success" /> Bus Route Optimization
              </Card.Title>
              <Card.Text>Dynamic route planning based on passenger demand & traffic.</Card.Text>
              <Button variant="success" onClick={() => navigate("/BusRouteOptimization")}>🗺️ View Routes</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 🔐 Blockchain Ticketing & 🚨 Emergency Response */}
      <Row className="mb-4">
        <Col xs={12} md={6} className="mb-3">
          <Card className="shadow-lg border-0">
            <Card.Body>
              <Card.Title>
                <FaLock className="text-info" /> Blockchain Ticketing
              </Card.Title>
              <Card.Text>Secure & transparent ticketing system for public transport.</Card.Text>
              <Button variant="info" onClick={() => navigate("/BlockChainTicketing")}>💳 View Transactions</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} className="mb-3">
          <Card className="shadow-lg border-0">
            <Card.Body>
              <Card.Title>
                <FaExclamationTriangle className="text-danger" /> Emergency Response
              </Card.Title>
              <Card.Text>Integrates with emergency services for quick accident response.</Card.Text>
              <Button variant="danger" onClick={() => navigate("/EmergencyAlerts")}>🚑 Emergency Alerts</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 💰 Fare Adjustments & 🚗 YOLOv8 Vehicle Counting */}
      <Row className="mt-4">
        <Col xs={12} md={6} className="mb-3">
          <Card className="shadow-lg border-0">
            <Card.Body>
              <Card.Title>
                <FaMoneyBill className="text-warning" /> Automatic Fare Adjustments
              </Card.Title>
              <Card.Text>Dynamic fare calculation for taxis & rickshaws based on traffic.</Card.Text>
              <Button variant="warning" onClick={() => navigate("/AutoFareAdjustments")}>💵 View Fare Updates</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} className="mb-3">
          <Card className="shadow-lg border-0">
            <Card.Body>
              <Card.Title>
                <FaCar className="text-primary" /> YOLOv8 Traffic Calculation
              </Card.Title>
              <Card.Text>Live vehicle count based on AI object detection from roads.</Card.Text>
              <Button variant="dark" onClick={() => navigate("/TrafficCounting")}>🚗 View Traffic Data</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
