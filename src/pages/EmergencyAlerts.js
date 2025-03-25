import React, { useState, useEffect } from "react";
import axios from "axios";

const EmergencyAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const SERVER_URL = "http://127.0.0.1:5000/emergency-alerts"; // Update with your Flask API endpoint

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get(SERVER_URL);
        setAlerts(response.data);
        setLoading(false);

        // Check for accident alerts and call ambulance
        response.data.forEach((alert) => {
          if (alert.type === "Accident" && alert.severity === "High") {
            callAmbulance(alert.location);
          }
        });

      } catch (error) {
        console.error("Error fetching emergency alerts:", error);
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000); // Fetch alerts every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const callAmbulance = (location) => {
    alert(`🚑 Ambulance called to: ${location}`);
    // You can integrate an actual ambulance API call here if needed.
  };

  return (
    <div className="container text-center p-4">
      <h1>⚠️ Emergency Alerts</h1>
      <p>Monitor emergency situations in real-time.</p>

      {loading ? (
        <p>Loading alerts...</p>
      ) : alerts.length === 0 ? (
        <p>No active emergency alerts.</p>
      ) : (
        <div className="alert-container">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`alert alert-${alert.type === "Accident" ? "danger" : "warning"}`}
            >
              <h4>🚨 {alert.type} Alert</h4>
              <p><strong>Location:</strong> {alert.location}</p>
              <p><strong>Severity:</strong> {alert.severity}</p>
              {alert.type === "Accident" && alert.severity === "High" && (
                <button className="btn btn-danger" onClick={() => callAmbulance(alert.location)}>
                  🚑 Call Ambulance
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmergencyAlerts;
