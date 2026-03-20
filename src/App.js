import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
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
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    // Optional: No real logout now, since we always authenticate
    console.log("Logout disabled in bypass mode.");
  };

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>;
  }

  return (
    <div className="app-layout">
      {user && <Sidebar />}

      <div className={user ? "content-area" : ""}>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />

          {/* Protected Routes */}
          <Route path="/" element={
            user ? (user.email === 'admin@nashikcity.gov.in' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />) : <Navigate to="/login" />
          } />
          
          <Route path="/admin" element={
            user && user.email === 'admin@nashikcity.gov.in' ? <AdminDashboard /> : <Navigate to={user ? "/dashboard" : "/login"} />
          } />
          
          <Route path="/dashboard" element={
            user && user.email !== 'admin@nashikcity.gov.in' ? <Dashboard onLogout={handleLogout} /> : <Navigate to={user ? "/admin" : "/login"} />
          } />

          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/profile/:id" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/google-map" element={user ? <MapLocation /> : <Navigate to="/login" />} />
          <Route path="/camera-feeds" element={user ? <CameraFeeds /> : <Navigate to="/login" />} />
          <Route path="/traffic-alerts" element={user ? <Alerts /> : <Navigate to="/login" />} />
          <Route path="/reports" element={user ? <Reports /> : <Navigate to="/login" />} />
          <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
          <Route path="/live-feed" element={user ? <LiveFeed /> : <Navigate to="/login" />} />
          <Route path="/EmergencyAlerts" element={user ? <EmergencyAlerts /> : <Navigate to="/login" />} />
          <Route path="/TrafficCounting" element={user ? <TrafficCounting /> : <Navigate to="/login" />} />
          <Route path="/BusRouteOptimization" element={user ? <BusRouteOptimization /> : <Navigate to="/login" />} />
          <Route path="/BlockChainTicketing" element={user ? <BlockChainTicketing /> : <Navigate to="/login" />} />
          <Route path="/AutoFareAdjustments" element={user ? <AutoFareAdjustments /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
