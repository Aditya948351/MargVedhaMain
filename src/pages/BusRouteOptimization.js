import React, { useEffect, useState } from "react";
import TrafficMonitoringMap from "./TrafficMonitoringMap";

const BusRouteOptimization = () => {
  const [trafficStatus, setTrafficStatus] = useState([]);
  const [busStops, setBusStops] = useState([]);
  const [analytics, setAnalytics] = useState({ totalBuses: 0, passengersOnBoard: 0, routeEfficiency: 0 });
  const [predictedScores, setPredictedScores] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/traffic-data"); 
        const data = await response.json();
        setTrafficStatus(data.traffic_status);
        setBusStops(data.bus_stops);
        setAnalytics({
          totalBuses: data.total_buses,
          passengersOnBoard: data.passengers_on_board,
          routeEfficiency: data.route_efficiency,
        });

        const scoreResponse = await fetch("http://localhost:5000/api/predicted-scores");
        const scoreData = await scoreResponse.json();
        setPredictedScores(scoreData.scores);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container text-center p-4">
      <h1 className="text-2xl font-bold"> Bus Route Optimization</h1>
      <p className="text-gray-600">Dynamic Route planning based on passenger demand and traffic.</p>

      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="bg-gray-200 p-4 rounded-lg shadow-lg h-[500px] overflow-y-auto">
          <h2 className="text-lg font-bold"> Traffic Status</h2>
          <div className="text-left mt-2 space-y-2">
            {trafficStatus.length > 0 ? (
              trafficStatus.map((traffic, index) => (
                <p key={index}><b>{traffic.location}:</b> {traffic.report}</p>
              ))
            ) : (
              <p>Loading traffic data...</p>
            )}
          </div>

          <h2 className="mt-4 text-lg font-bold"> Nearby Bus Stops</h2>
          <ul className="text-left mt-2 space-y-1">
            {busStops.length > 0 ? (
              busStops.map((stop, index) => <ul key={index}> {stop}</ul>)
            ) : (
              <p>Loading bus stops...</p>
            )}
          </ul>

          <h2 className="mt-4 text-lg font-bold">📊 Analytics</h2>
          <div className="text-left mt-2 space-y-2">
            <p>🚌 Total Buses Running: <b>{analytics.totalBuses}</b></p>
            <p>👥 Passengers on Board: <b>{analytics.passengersOnBoard}</b></p>
            <p>⚡ Route Efficiency: <b>{analytics.routeEfficiency}%</b></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg h-[500px] flex justify-center items-center">
          <TrafficMonitoringMap />
        </div>
      </div>
    </div>
  );
};

export default BusRouteOptimization;
