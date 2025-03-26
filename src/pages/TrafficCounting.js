import React, { useState, useEffect } from "react";
import { Card, Button, Table, Spinner } from "react-bootstrap";
import { FaCar, FaChartLine, FaSyncAlt } from "react-icons/fa";

const TrafficCounting = () => {
  const [trafficStats, setTrafficStats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrafficData();
  }, []);

  const fetchTrafficData = () => {
    setLoading(true);
    // Simulating AI-based vehicle detection data
    setTimeout(() => {
      setTrafficStats([
        { type: "Cars", count: Math.floor(Math.random() * 1000) },
        { type: "Bikes", count: Math.floor(Math.random() * 500) },
        { type: "Buses", count: Math.floor(Math.random() * 100) },
        { type: "Trucks", count: Math.floor(Math.random() * 150) },
      ]);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="p-4">
      <h2 className="text-primary"><FaCar /> Live Traffic Data</h2>
      <p>🚗 Real-time vehicle count based on AI-powered YOLOv8 detection.</p>

      <Card className="shadow-lg border-0">
        <Card.Body>
          <Card.Title>📈 Vehicle Detection Summary</Card.Title>

          {loading ? (
            <Spinner animation="border" variant="primary" />
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Vehicle Type</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {trafficStats.map((stat, index) => (
                  <tr key={index}>
                    <td>{stat.type}</td>
                    <td className="text-success"><strong>{stat.count}</strong></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          <Button variant="dark" onClick={fetchTrafficData} disabled={loading}>
            {loading ? "Updating..." : "🔄 Refresh Data"} <FaSyncAlt />
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TrafficCounting;
