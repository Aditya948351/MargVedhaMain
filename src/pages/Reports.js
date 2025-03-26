import React, { useState } from "react";
import { Row, Col, Button } from "react-bootstrap";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("incident");
  const [subTab, setSubTab] = useState("activeIncident"); // Default sub-tab for "Incident"
  const [historicalSubTab, setHistoricalSubTab] = useState("trafficTrends"); // Default sub-tab for "Historical Analysis"

  return (
    <div className="p-4">
      <h2>Reports</h2>

      {/* Main Tabs */}
      <Row className="mb-4 d-flex gap-3">
        <Col md="auto">
          <Button
            variant={activeTab === "incident" ? "primary" : "light"}
            onClick={() => setActiveTab("incident")}
          >
            Incident
          </Button>
        </Col>
        <Col md="auto">
          <Button
            variant={activeTab === "historicalAnalysis" ? "primary" : "light"}
            onClick={() => setActiveTab("historicalAnalysis")}
          >
            Historical Analysis
          </Button>
        </Col>
      </Row>

      {/* Sub-Tabs for "Incident" */}
      {activeTab === "incident" && (
        <Row className="mb-3 d-flex gap-2">
          <Col md="auto">
            <Button
              variant={subTab === "activeIncident" ? "success" : "light"}
              onClick={() => setSubTab("activeIncident")}
            >
              Active Incident
            </Button>
          </Col>
          <Col md="auto">
            <Button
              variant={subTab === "resolvedIncident" ? "success" : "light"}
              onClick={() => setSubTab("resolvedIncident")}
            >
              Resolved Incident
            </Button>
          </Col>
          <Col md="auto">
            <Button
              variant={subTab === "incidentMap" ? "success" : "light"}
              onClick={() => setSubTab("incidentMap")}
            >
              Incident Map
            </Button>
          </Col>
        </Row>
      )}

      {/* Sub-Tabs for "Historical Analysis" */}
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

      {/* Content Section */}
      <div className="mt-3 p-3 border rounded">
        {activeTab === "incident" && (
          <>
            {subTab === "activeIncident" && <p>Showing Active Incidents...</p>}
            {subTab === "resolvedIncident" && <p>Showing Resolved Incidents...</p>}
            {subTab === "incidentMap" && <p>Displaying Incident Map...</p>}
          </>
        )}

        {activeTab === "historicalAnalysis" && (
          <>
            {historicalSubTab === "trafficTrends" && <p>Analyzing Traffic Trends...</p>}
            {historicalSubTab === "hourlyPattern" && <p>Analyzing Hourly Patterns...</p>}
            {historicalSubTab === "locationAnalysis" && <p>Performing Location Analysis...</p>}
            {historicalSubTab === "weatherImpact" && <p>Assessing Weather Impact...</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
