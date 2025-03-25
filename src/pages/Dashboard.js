import React from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import { FaTrafficLight, FaBus, FaLock, FaExclamationTriangle, FaMoneyBill, FaCar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";



const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="p-4">
      <h2>📊 Dashboard - Traffic Monitoring System</h2>
      <p>Monitor real-time traffic conditions and optimize routes efficiently.</p>

      {/* 🚦 Real-time Traffic & Bus Route Optimization */}
      <Row className="mb-4">
        <Col md={6}>
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

        <Col md={6}>
          <Card className="shadow-lg border-0">
            <Card.Body>
              <Card.Title>
                <FaBus className="text-success" /> Bus Route Optimization
              </Card.Title>
              <Card.Text>Dynamic route planning based on passenger demand & traffic.</Card.Text>
              <Button variant="success">🗺️ View Routes</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 🔐 Blockchain Ticketing & 🚨 Emergency Response */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-lg border-0">
            <Card.Body>
              <Card.Title>
                <FaLock className="text-info" /> Blockchain Ticketing
              </Card.Title>
              <Card.Text>Secure & transparent ticketing system for public transport.</Card.Text>
              <Button variant="info">💳 View Transactions</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
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
        <Col md={6}>
          <Card className="shadow-lg border-0">
            <Card.Body>
              <Card.Title>
                <FaMoneyBill className="text-warning" /> Automatic Fare Adjustments
              </Card.Title>
              <Card.Text>Dynamic fare calculation for taxis & rickshaws based on traffic.</Card.Text>
              <Button variant="warning">💵 View Fare Updates</Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-lg border-0">
            <Card.Body>
              <Card.Title>
                <FaCar className="text-primary" /> YOLOv8 Traffic Calculation
              </Card.Title>
              <Card.Text>Live vehicle count based on AI object detection and Historical Analysis.</Card.Text>
              <Button variant="dark">🚗 View Traffic Data</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
