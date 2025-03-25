import React from "react";
import TrafficMonitoringMap from "./TrafficMonitoringMap"; // Import the map component

const BusRouteOptimization = () => {
  return (
    <div className="container text-center p-4">
      <h1>🚎 Bus Route Optimization</h1>
      <p>Dynamic Route planning based on passenger demand and traffic using Ticket Booking</p>
      
      {/* Display the Map Below */}
      <TrafficMonitoringMap />
    </div>
  );
};

export default BusRouteOptimization;
