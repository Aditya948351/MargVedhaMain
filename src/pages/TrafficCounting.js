import React, { useState, useEffect } from "react";
import { Card, Button, Table, Spinner, Form } from "react-bootstrap";
import { FaCar, FaSyncAlt, FaHistory } from "react-icons/fa";
import { collection, getDocs, onSnapshot, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "../firebase"; 
import { junctionCoords } from "../utils/junctionCoords";

const TrafficCounting = () => {
  const [latestTraffic, setLatestTraffic] = useState(null);
  const [trafficHistory, setTrafficHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [selectedJunction, setSelectedJunction] = useState("1"); // Default to CBS Circle

  useEffect(() => {
    const activeJunctionName = junctionCoords[selectedJunction]?.name || "CBS Circle";
    const trafficRef = collection(db, "traffic_data");
    
    // Live update for the selected junction
    const q = query(
      trafficRef, 
      where("location", "==", activeJunctionName),
      orderBy("timestamp", "desc"), 
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setLatestTraffic(snapshot.docs[0].data());
        setLastSync(new Date());
      } else {
        setLatestTraffic(null);
      }
    });

    // Historical data for the selected junction
    const fetchHistoricalData = async () => {
      const histQuery = query(
        trafficRef, 
        where("location", "==", activeJunctionName),
        orderBy("timestamp", "desc"),
        limit(50)
      );
      const querySnapshot = await getDocs(histQuery);
      const historyData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTrafficHistory(historyData);
    };

    fetchHistoricalData();
    return () => unsubscribe(); 
  }, [selectedJunction]);

  const fetchTrafficData = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(query(collection(db, "traffic_data"), orderBy("timestamp", "desc"), limit(1)));
      if (!querySnapshot.empty) {
        setLatestTraffic(querySnapshot.docs[0].data()); 
        setLastSync(new Date());
      } else {
        console.warn("No traffic data found in collection 'traffic_data'");
      }
    } catch (error) {
      console.error("Error fetching traffic data:", error);
      alert("Failed to fetch live traffic data. Please check your connection.");
    } finally {
      setLoading(false);
    }
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
      <p> Real-time vehicle count based on AI-powered YOLO detection.</p>

      <div className="mb-4" style={{ maxWidth: "300px" }}>
        <label className="form-label font-bold text-slate-700">Select Junction:</label>
        <select 
          className="form-select shadow-sm"
          value={selectedJunction}
          onChange={(e) => setSelectedJunction(e.target.value)}
        >
          {Object.entries(junctionCoords).map(([id, data]) => (
            <option key={id} value={id}>{data.name}</option>
          ))}
        </select>
      </div>

      <Card className="shadow-lg border-0 mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Card.Title className="mb-0">Latest Vehicle Detection</Card.Title>
            {lastSync && <small className="text-muted">Last Sync: {lastSync.toLocaleTimeString()}</small>}
          </div>
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
