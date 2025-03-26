import React from "react";
import { Routes, Route } from "react-router-dom";
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


function App() {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="content-area">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/google-map" element={<MapLocation />} />
          <Route path="/camera-feeds" element={<CameraFeeds />} />
          <Route path="/traffic-alerts" element={<Alerts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/live-Feed" element={<LiveFeed />} />
          <Route path="/EmergencyAlerts" element={<EmergencyAlerts/>} />
          <Route path="/TrafficCounting" element={<TrafficCounting/>} />
          <Route path="/BusRouteOptimization" element={<BusRouteOptimization/>} />
          <Route path="/BlockChainTicketing" element={<BlockChainTicketing/>} />
          <Route path="/AutoFareAdjustments" element={<AutoFareAdjustments/>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
