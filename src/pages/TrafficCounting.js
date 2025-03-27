import React, { useState, useEffect } from "react";
import { Card, Button, Table, Spinner } from "react-bootstrap";
import { FaCar, FaSyncAlt, FaHistory } from "react-icons/fa";
import { collection, getDocs, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase"; 

const TrafficCounting = () => {
  const [latestTraffic, setLatestTraffic] = useState(null);
  const [trafficHistory, setTrafficHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trafficRef = collection(db, "traffic_data");

    
    const q = query(trafficRef, orderBy("timestamp", "desc"), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setLatestTraffic(snapshot.docs[0].data());
      }
    });

    
    const fetchHistoricalData = async () => {
      const querySnapshot = await getDocs(query(trafficRef, orderBy("timestamp", "desc")));
      const historyData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTrafficHistory(historyData);
    };

    fetchHistoricalData();
    return () => unsubscribe(); 
  }, []);

  const fetchTrafficData = async () => {
    setLoading(true);
    setTimeout(async () => {
      const querySnapshot = await getDocs(query(collection(db, "traffic_data"), orderBy("timestamp", "desc"), limit(1)));
      if (!querySnapshot.empty) {
        setLatestTraffic(querySnapshot.docs[0].data()); 
      }
      setLoading(false);
    }, 2000);
  };

  
  const getCongestionLevel = (totalVehicles) => {
    if (totalVehicles > 50) {
      return <span className="text-danger">🔴 High</span>;
    } else if (totalVehicles > 30) {
      return <span className="text-warning">🟠 Medium</span>;
    } else {
      return <span className="text-success">🟢 Low</span>;
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-primary"><FaCar /> Live Traffic Data</h2>
      <p> Real-time vehicle count based on AI-powered YOLOv8 detection.</p>

      <Card className="shadow-lg border-0 mb-4">
        <Card.Body>
          <Card.Title> Latest Vehicle Detection</Card.Title>
          {loading ? (
            <Spinner animation="border" variant="primary" />
          ) : latestTraffic ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Cars</th>
                  <th>Bikes</th>
                  <th>Buses</th>
                  <th>Trucks</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{new Date(latestTraffic.timestamp).toLocaleTimeString()}</td>
                  <td className="text-success"><strong>{latestTraffic.car_count}</strong></td>
                  <td className="text-primary"><strong>{latestTraffic.motorcycle_count}</strong></td>
                  <td className="text-warning"><strong>{latestTraffic.bus_count}</strong></td>
                  <td className="text-danger"><strong>{latestTraffic.truck_count}</strong></td>
                </tr>
              </tbody>
            </Table>
          ) : (
            <p>No data available</p>
          )}

          <Button variant="dark" onClick={fetchTrafficData} disabled={loading}>
            {loading ? "Updating..." : "🔄 Refresh Data"} <FaSyncAlt />
          </Button>
        </Card.Body>
      </Card>

      
      <Card className="shadow-lg border-0">
        <Card.Body>
          <Card.Title>📜 Historical Traffic Data <FaHistory /></Card.Title>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Cars</th>
                <th>Bikes</th>
                <th>Buses</th>
                <th>Trucks</th>
                <th>Total Vehicles</th>
                <th>Traffic Congestion</th> {/* ✅ New Column */}
              </tr>
            </thead>
            <tbody>
              {trafficHistory.map((stat, index) => (
                <tr key={index}>
                  <td>{new Date(stat.timestamp).toLocaleTimeString()}</td>
                  <td className="text-success"><strong>{stat.car_count}</strong></td>
                  <td className="text-primary"><strong>{stat.motorcycle_count}</strong></td>
                  <td className="text-warning"><strong>{stat.bus_count}</strong></td>
                  <td className="text-danger"><strong>{stat.truck_count}</strong></td>
                  <td className="text-dark"><strong>{stat.total_vehicles}</strong></td>
                  <td>{getCongestionLevel(stat.total_vehicles)}</td> {/* ✅ New Logic */}
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TrafficCounting;
