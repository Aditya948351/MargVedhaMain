import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Alerts from "./pages/Alerts";
import LiveFeed from "./pages/LiveFeed";
import MapLocation from "./pages/MapLocation";
import CameraFeeds from "./pages/CameraFeeds";
import EmergencyAlerts from "./pages/EmergencyAlerts";
import TrafficCounting from "./pages/TrafficCounting";
import BusRouteOptimization from "./pages/BusRouteOptimization";
import BlockChainTicketing from "./pages/BlockChainTicketing";
import AutoFareAdjustments from "./pages/AutoFareAdjustments";
import Home from "./pages/Home";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load authentication state from localStorage on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Logout function
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
  };

  return (
    <div className="d-flex">
      {/* Show Sidebar only if logged in */}
      {isAuthenticated && <Sidebar />}

      <div className="content-area w-100">
        <Routes>
          {/* Pass setIsAuthenticated to Home for login handling */}
          <Route path="/" element={<Home setIsAuthenticated={setIsAuthenticated} />} />

          {/* Protected routes (only accessible after login) */}
          {isAuthenticated ? (
            <>
              <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} />} />
              <Route path="/google-map" element={<MapLocation />} />
              <Route path="/camera-feeds" element={<CameraFeeds />} />
              <Route path="/traffic-alerts" element={<Alerts />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/live-feed" element={<LiveFeed />} />
              <Route path="/EmergencyAlerts" element={<EmergencyAlerts />} />
              <Route path="/TrafficCounting" element={<TrafficCounting />} />
              <Route path="/BusRouteOptimization" element={<BusRouteOptimization />} />
              <Route path="/BlockChainTicketing" element={<BlockChainTicketing />} />
              <Route path="/AutoFareAdjustments" element={<AutoFareAdjustments />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/" />} />
          )}
        </Routes>
      </div>
    </div>
  );
}

export default App;
