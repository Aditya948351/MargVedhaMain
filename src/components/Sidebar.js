import React from "react";
import { Link } from "react-router-dom";
import {
  FaTachometerAlt,
  FaMapMarkerAlt,
  FaCamera,
  FaBell,
  FaChartBar,
  FaCog,
} from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Marg Vedha</h2>
      <ul>
        <li>
          <Link to="/" className="sidebar-link">
            <FaTachometerAlt className="sidebar-icon" /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/google-map" className="sidebar-link">
            <FaMapMarkerAlt className="sidebar-icon" /> Signal Location
          </Link>
        </li>
        <li>
          <Link to="/camera-feeds" className="sidebar-link">
            <FaCamera className="sidebar-icon" /> Camera Feeds
          </Link>
        </li>
        <li>
          <Link to="/traffic-alerts" className="sidebar-link">
            <FaBell className="sidebar-icon" /> Traffic Alerts
          </Link>
        </li>
        <li>
          <Link to="/reports" className="sidebar-link">
            <FaChartBar className="sidebar-icon" /> Reports
          </Link>
        </li>
        <li>
          <Link to="/settings" className="sidebar-link">
            <FaCog className="sidebar-icon" /> Settings
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
