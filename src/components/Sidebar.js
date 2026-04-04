import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaCamera, FaBell, FaChartBar, FaCog, FaGithub, FaSignOutAlt, FaUserCircle, FaBrain, FaLeaf, FaChartLine, FaFileExport, FaCity } from "react-icons/fa";
import { Button } from "react-bootstrap";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const isAdmin = user && user.email === 'admin@nashikcity.gov.in';

  const goToProfile = () => {
    if (!user) return;
    if (isAdmin) {
      navigate('/profile/admin');
    } else {
      const match = user.email.match(/police(\d+)@/);
      if (match) {
        navigate(`/profile/${match[1]}`);
      } else {
        navigate('/profile');
      }
    }
  };

  return (
    <div className="top-navbar">
      <div className="brand d-flex align-items-center">
        <FaTachometerAlt className="text-primary me-2 fs-4" />
        <span className="fs-5 fw-bold text-white tracking-wide">
          {isAdmin ? "NASHIK ADMIN" : "MARG VEDHA"}
        </span>
      </div>

      <div className="nav-links">
        {isAdmin ? (
          <>
            <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <FaTachometerAlt className="icon" /> Operation Center
            </NavLink>
            <NavLink to="/network-analytics" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <FaChartLine className="icon" /> Network Analytics
            </NavLink>
            <NavLink to="/incident-hub" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <FaBell className="icon" /> Incident Hub
            </NavLink>
            <NavLink to="/public-transport" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <FaCity className="icon" /> Public Transport
            </NavLink>
            <NavLink to="/lstm-studio" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <FaBrain className="icon text-primary" /> AI & ML Studio
            </NavLink>
            <NavLink to="/enforcement" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <FaCamera className="icon" /> Enforcement
            </NavLink>
            <NavLink to="/EcoImpact" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <FaLeaf className="icon text-success" /> Environment
            </NavLink>
            <NavLink to="/suggestions" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <FaBrain className="icon text-primary" /> Advice AI
            </NavLink>
            <NavLink to="/intelligence" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <FaCity className="icon text-info" /> City Intelligence
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <FaFileExport className="icon" /> Reports
            </NavLink>
          </>
        ) : (
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <FaTachometerAlt className="icon" /> Local Dashboard
          </NavLink>
        )}
      </div>

      <div className="nav-actions">
        <Button variant="outline-light" size="sm" onClick={() => window.open('https://github.com/Aditya948351/MargVedhaMain', '_blank')}>
          <FaGithub className="me-2" /> GitHub
        </Button>
        <Button variant="outline-info" size="sm" onClick={goToProfile}>
          <FaUserCircle className="me-2" /> Profile
        </Button>
        <Button variant="outline-light" size="sm" onClick={() => navigate("/settings")}>
          <FaCog className="me-2" /> Settings
        </Button>
        <Button variant="danger" size="sm" onClick={() => signOut(auth)}>
          <FaSignOutAlt className="me-2" /> Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
