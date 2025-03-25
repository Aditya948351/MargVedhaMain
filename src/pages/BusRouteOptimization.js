import React, { useEffect, useState } from "react";
import TrafficMonitoringMap from "./TrafficMonitoringMap"; // Import the map component

const BusRouteOptimization = () => {
  // State for traffic and bus stop data
  const [trafficData, setTrafficData] = useState([]);
  const [busStops, setBusStops] = useState([]);
  const [analytics, setAnalytics] = useState({ buses: 0, passengers: 0, efficiency: 0 });

  // Fetch Data from Flask Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://your-flask-server-ip:5000/api/traffic-data"); // Change to your Flask API URL
        const data = await response.json();
        setTrafficData(data.traffic_status);
        setBusStops(data.bus_stops);
        setAnalytics({
          buses: data.total_buses,
          passengers: data.passengers_on_board,
          efficiency: data.route_efficiency,
        });
      } catch (error) {
        console.error("Error fetching traffic data:", error);
      }
    };

    fetchData();

    // Refresh data every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container text-center p-4">
      <h1 className="text-2xl font-bold">🚎 Bus Route Optimization</h1>
      <p className="text-gray-600">
        Dynamic Route planning based on passenger demand and traffic using Ticket Booking
      </p>

      {/* Grid Layout - Left Panel (Scrollable) & Right Panel (Fixed) */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        {/* Left Panel: Scrollable Content */}
        <div className="bg-gray-200 p-4 rounded-lg shadow-lg h-[500px] overflow-y-auto">
          <h2 className="text-lg font-bold">📍 Traffic Status</h2>
          <div className="text-left mt-2 space-y-2">
            {trafficData.length > 0 ? (
              trafficData.map((traffic, index) => <p key={index}>{traffic}</p>)
            ) : (
              <p>Loading traffic data...</p>
            )}
          </div>

          <h2 className="mt-4 text-lg font-bold">🚏 Nearby Bus Stops</h2>
          <ul className="text-left mt-2 space-y-1">
            {busStops.length > 0 ? (
              busStops.map((stop, index) => <li key={index}>📍 {stop}</li>)
            ) : (
              <p>Loading bus stops...</p>
            )}
          </ul>

          <h2 className="mt-4 text-lg font-bold">📊 Analytics</h2>
          <div className="text-left mt-2 space-y-2">
            <p>🚌 Total Buses Running: <b>{analytics.buses}</b></p>
            <p>👥 Passengers on Board: <b>{analytics.passengers}</b></p>
            <p>⚡ Route Efficiency: <b>{analytics.efficiency}%</b></p>
          </div>
        </div>

        {/* Right Panel: Fixed Map */}
        <div className="bg-white p-4 rounded-lg shadow-lg h-[500px] flex justify-center items-center">
          <TrafficMonitoringMap />
        </div>
      </div>
    </div>
  );
};

export default BusRouteOptimization;
