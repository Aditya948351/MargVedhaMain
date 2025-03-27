import React, { useState } from "react";
import { Card, Button, Table, Alert } from "react-bootstrap";
import { FaMoneyBill, FaSyncAlt } from "react-icons/fa";

const AutoFareAdjustments = () => {
  const [fares, setFares] = useState([
    { vehicle: "Taxi", baseFare: "₹3.00", currentFare: "₹4.50" },
    { vehicle: "Rickshaw", baseFare: "₹2.00", currentFare: "₹3.25" },
    { vehicle: "Bus", baseFare: "₹1.50", currentFare: "₹₹1.75" },
  ]);

  const handleUpdateFares = () => {
    // Simulating dynamic fare changes
    const updatedFares = fares.map(fare => ({
      ...fare,
      currentFare: `₹${(parseFloat(fare.baseFare.slice(1)) + Math.random() * 2).toFixed(2)}`
    }));
    setFares(updatedFares);
  };

  return (
    <div className="p-4">
      <h2 className="text-warning"><FaMoneyBill /> Automatic Fare Adjustments</h2>
      <p>Dynamic fare calculation based on traffic congestion and demand.</p>

      <Alert variant="info">💡 Fares are updated based on live traffic data.</Alert>

      <Card className="shadow-lg border-0">
        <Card.Body>
          <Card.Title>📊 Current Fare Updates</Card.Title>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Base Fare</th>
                <th>Current Fare</th>
              </tr>
            </thead>
            <tbody>
              {fares.map((fare, index) => (
                <tr key={index}>
                  <td>{fare.vehicle}</td>
                  <td>{fare.baseFare}</td>
                  <td className="text-success"><strong>{fare.currentFare}</strong></td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button variant="warning" onClick={handleUpdateFares}>
            🔄 Refresh Fares <FaSyncAlt />
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AutoFareAdjustments;
