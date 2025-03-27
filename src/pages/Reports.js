import React, { useState } from "react";
import { Row, Col, Button, Card } from "react-bootstrap";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const mapContainerStyle = { width: "100%", height: "400px" };
const center = { lat: 37.7749, lng: -122.4194 }; // Default center (San Francisco)

const Reports = () => {
  const [activeTab, setActiveTab] = useState("incident");
  const [subTab, setSubTab] = useState("activeIncident");
  const [historicalSubTab, setHistoricalSubTab] = useState("trafficTrends");

  
  const dailyTrafficVolume = [
    { day: "Mon", volume: 1200 },
    { day: "Tue", volume: 1500 },
    { day: "Wed", volume: 1800 },
    { day: "Thu", volume: 1700 },
    { day: "Fri", volume: 1600 },
    { day: "Sat", volume: 1400 },
    { day: "Sun", volume: 1300 },
  ];

  const dailyCongestionLevels = [
    { day: "Mon", congestion: 30 },
    { day: "Tue", congestion: 40 },
    { day: "Wed", congestion: 45 },
    { day: "Thu", congestion: 42 },
    { day: "Fri", congestion: 38 },
    { day: "Sat", congestion: 25 },
    { day: "Sun", congestion: 20 },
  ];

  const trafficIncidents = [
    { type: "Accidents", count: 10 },
    { type: "Roadblocks", count: 5 },
    { type: "Stalled Vehicles", count: 7 },
  ];

  const hourlyTrafficPattern = [
    { hour: "00:00", traffic: 50 },
    { hour: "03:00", traffic: 80 },
    { hour: "06:00", traffic: 200 },
    { hour: "09:00", traffic: 500 },
    { hour: "12:00", traffic: 600 },
    { hour: "15:00", traffic: 550 },
    { hour: "18:00", traffic: 700 },
    { hour: "21:00", traffic: 400 },
  ];

  const locationTrafficData = [
    { location: "Downtown", traffic: 5000 },
    { location: "Highway 1", traffic: 7000 },
    { location: "Suburb A", traffic: 4000 },
    { location: "Industrial Area", traffic: 3000 },
    { location: "Mall District", traffic: 6500 },
  ];
  const weatherImpactData = [
    { condition: "Sunny", traffic: 1200, congestion: 30 },
    { condition: "Rainy", traffic: 900, congestion: 50 },
    { condition: "Snowy", traffic: 700, congestion: 70 },
    { condition: "Foggy", traffic: 800, congestion: 60 },
    { condition: "Windy", traffic: 1100, congestion: 40 },
  ];
   
   const [activeIncidents, setActiveIncidents] = useState([
    { id: 1, time: "14:50:00", location: "Downtown Junction", type: "Roadblock", severity: "Medium", lat: 37.7749, lng: -122.4194 },
    { id: 2, time: "14:45:00", location: "Highway 1", type: "Accident", severity: "High", lat: 37.7849, lng: -122.4094 }
  ]);

  const [resolvedIncidents, setResolvedIncidents] = useState([
    { id: 3, time: "14:30:00", location: "Amrutdham", type: "Stalled Vehicle", severity: "Low" }
  ]);

 
  const handleResolve = (id) => {
    const resolvedItem = activeIncidents.find((incident) => incident.id === id);
    setResolvedIncidents([...resolvedIncidents, resolvedItem]);
    setActiveIncidents(activeIncidents.filter((incident) => incident.id !== id));
  };

  return (
    <div className="p-4">
      <h2>Reports</h2>

      {/* Main Tabs */}
      <Row className="mb-4 d-flex gap-3">
        <Col md="auto">
          <Button variant={activeTab === "incident" ? "primary" : "light"} onClick={() => setActiveTab("incident")}>
            Incident
          </Button>
        </Col>
        <Col md="auto">
          <Button variant={activeTab === "historicalAnalysis" ? "primary" : "light"} onClick={() => setActiveTab("historicalAnalysis")}>
            Historical Analysis
          </Button>
        </Col>
      </Row>

      
      {activeTab === "incident" && (
        <Row className="mb-3 d-flex gap-2">
          <Col md="auto">
            <Button variant={subTab === "activeIncident" ? "success" : "light"} onClick={() => setSubTab("activeIncident")}>
              Active Incidents
            </Button>
          </Col>
          <Col md="auto">
            <Button variant={subTab === "resolvedIncident" ? "success" : "light"} onClick={() => setSubTab("resolvedIncident")}>
              Resolved Incidents
            </Button>
          </Col>
          <Col md="auto">
            <Button variant={subTab === "incidentMap" ? "success" : "light"} onClick={() => setSubTab("incidentMap")}>
              Incident Map
            </Button>
          </Col>
        </Row>
      )}

      
      {activeTab === "incident" && subTab === "activeIncident" && (
        <div>
          <h3>Active Incidents</h3>
          {activeIncidents.length === 0 ? (
            <p>No active incidents.</p>
          ) : (
            activeIncidents.map((incident) => (
              <Card key={incident.id} className="mb-3">
                <Card.Body>
                  <Card.Title>
                    {incident.type} - {incident.severity}
                  </Card.Title>
                  <Card.Text>
                    <strong>Location:</strong> {incident.location} <br />
                    <strong>Time:</strong> {incident.time}
                  </Card.Text>
                  <Button variant="danger" onClick={() => handleResolve(incident.id)}>
                    Mark Resolved
                  </Button>
                </Card.Body>
              </Card>
            ))
          )}
        </div>
      )}

      
      {activeTab === "incident" && subTab === "resolvedIncident" && (
        <div>
          <h3>Resolved Incidents</h3>
          {resolvedIncidents.length === 0 ? (
            <p>No resolved incidents.</p>
          ) : (
            resolvedIncidents.map((incident) => (
              <Card key={incident.id} className="mb-3">
                <Card.Body>
                  <Card.Title>
                    {incident.type} - {incident.severity}
                  </Card.Title>
                  <Card.Text>
                    <strong>Location:</strong> {incident.location} <br />
                    <strong>Time:</strong> {incident.time}
                  </Card.Text>
                  <span className="badge bg-success">Resolved</span>
                </Card.Body>
              </Card>
            ))
          )}
        </div>
      )}

     
      {activeTab === "incident" && subTab === "incidentMap" && (
        <div>
          <h3>Incident Map</h3>
          <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
            <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={12}>
              {activeIncidents.map((incident) => (
                <Marker key={incident.id} position={{ lat: incident.lat, lng: incident.lng }} />
              ))}
            </GoogleMap>
          </LoadScript>
        </div>
      )}


     

      
      {activeTab === "historicalAnalysis" && (
        <Row className="mb-3 d-flex gap-2">
          <Col md="auto">
            <Button
              variant={historicalSubTab === "trafficTrends" ? "info" : "light"}
              onClick={() => setHistoricalSubTab("trafficTrends")}
            >
              Traffic Trends
            </Button>
          </Col>
          <Col md="auto">
                  <Button
                    variant={historicalSubTab === "hourlyPattern" ? "info" : "light"}
                    onClick={() => setHistoricalSubTab("hourlyPattern")}
                  >
                    Hourly Pattern
                  </Button>
                </Col>
                <Col md="auto">
                  <Button
                    variant={historicalSubTab === "locationAnalysis" ? "info" : "light"}
                    onClick={() => setHistoricalSubTab("locationAnalysis")}
                  >
                    Location Analysis
                  </Button>
                </Col>
                <Col md="auto">
                  <Button
                    variant={historicalSubTab === "weatherImpact" ? "info" : "light"}
                    onClick={() => setHistoricalSubTab("weatherImpact")}
                  >
                    Weather Impact
                  </Button>
                </Col>
              </Row>
            )}
      
          
      
      <div className="mt-3 p-3 border rounded">
        {activeTab === "historicalAnalysis" && historicalSubTab === "trafficTrends" && (
          <>
            <h3>Traffic Trends</h3>

            <h5>Daily Traffic Volume</h5>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrafficVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="volume" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>

            <h5>Daily Congestion Levels</h5>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyCongestionLevels}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="congestion" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>

            <h5>Traffic Incidents</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trafficIncidents}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          
          </>
          
        )}
      </div>
      <div className="mt-3 p-3 border rounded">
        {activeTab === "historicalAnalysis" && historicalSubTab === "hourlyPattern" && (
          <>
            <h3>Hourly Traffic Pattern</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyTrafficPattern}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="traffic" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
            <h5>Key Insights </h5>
            <h5>-peak morning traffic occurs between 8:00-9.00 AM</h5>
            <h5>-peak evening traffic occurs between 5:00-6.00 PM</h5>
            <h5>-Lowest traffic volume is between 2:00-4.00 AM</h5>
            <h5>-Congestion levels closely follow traffic volume patterns</h5>

          </>
        )}
      </div>

      <div className="mt-3 p-3 border rounded">
        {activeTab === "historicalAnalysis" && historicalSubTab === "locationAnalysis" && (
          <>
            <h3>Historical Traffic Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart layout="vertical" data={locationTrafficData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="location" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="traffic" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
            <h5>Key Insights </h5>
            <h5>-Downtown has the highest traffic volume and congestion</h5>
            <h5>-East Avenue has the lowest traffic and congetion</h5>
            <h5>-Main Street and west bridge have similar congestion levels despite different vehicle counts</h5>
          </>
            
          
        )}
      
            
      </div>'
      <div className="mt-3 p-3 border rounded">
        {activeTab === "historicalAnalysis" && historicalSubTab === "weatherImpact" && (
          <>
            <h3>Weather Impact on Traffic</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weatherImpactData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="condition" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="traffic" fill="#8884d8" name="Traffic Volume" />
                <Bar dataKey="congestion" fill="#82ca9d" name="Congestion Level (%)" />
              </BarChart>
            </ResponsiveContainer>
            <h5>Key Insights </h5>
            <h5>-Snowy conditions have the highest congestion levels despite lower traffic.</h5>
            <h5>-Sunny weather results in the highest traffic volume but lowest congestion.</h5>
            <h5>-Rainy and foggy conditions significantly impact congestion.</h5>
          </>
        )}
      </div>
    </div>
    
  );
};

export default Reports;
