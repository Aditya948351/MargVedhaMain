import React from "react";
import { Card, Button, ListGroup, Alert } from "react-bootstrap";
import { FaExclamationTriangle, FaPhoneAlt, FaMapMarkedAlt } from "react-icons/fa";

const EmergencyAlerts = () => {
  const alerts = [
    { id: 1, location: "Downtown", severity: "High", status: "Ongoing" },
    { id: 2, location: "Highway 17", severity: "Medium", status: "Responding" },
    { id: 3, location: "Suburb Sector 5", severity: "Low", status: "Cleared" },
  ];

  return (
    <div className="p-4">
      <h2 className="text-danger"><FaExclamationTriangle /> Emergency Alerts</h2>
      <p>Stay updated with real-time emergency situations and accident reports.</p>

      <Alert variant="danger">
        🚨 Live Alert: Major accident reported on <strong>Highway 17</strong>! Emergency teams dispatched.
      </Alert>

      <Card className="shadow-lg border-0">
        <Card.Body>
          <Card.Title className="text-danger">
            <FaMapMarkedAlt /> Emergency Incidents
          </Card.Title>
          <ListGroup>
            {alerts.map(alert => (
              <ListGroup.Item key={alert.id}>
                <strong>{alert.location}</strong> - Severity: <span className="text-danger">{alert.severity}</span> - Status: <em>{alert.status}</em>
              </ListGroup.Item>
            ))}
          </ListGroup>
          <Button variant="danger" className="mt-3">
            🚑 Call Emergency Services <FaPhoneAlt />
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EmergencyAlerts;
