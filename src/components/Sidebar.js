import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaCamera, FaBell, FaChartBar, FaCog, FaGithub, FaSignOutAlt, FaUserCircle, FaBrain, FaLeaf, FaChartLine, FaFileExport, FaCity, FaTools } from "react-icons/fa";
import { Button, Container, Navbar, Nav, Dropdown } from "react-bootstrap";
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
    <Navbar expand="lg" className="top-navbar-unified py-3 shadow-lg glass-navbar" sticky="top">
      <Container fluid className="px-lg-5">
        <Navbar.Brand className="d-flex align-items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-primary p-2 rounded-lg shadow-primary shadow-sm d-flex align-items-center justify-content-center">
            <FaTachometerAlt className="text-white fs-5" />
          </div>
          <span className="fs-5 fw-black text-slate-800 tracking-tighter ls-1">
            {isAdmin ? "NASHIK ADMIN" : "MARG VEDHA"}
          </span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 bg-dark bg-opacity-10" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto gap-1 gap-lg-3 py-3 py-lg-0">
            {isAdmin ? (
              <>
                <NavLink to="/admin" className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}>
                  <FaTachometerAlt className="icon" /> Operational Center
                </NavLink>
                <NavLink to="/ml-trainers" className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}>
                  <FaBrain className="icon text-primary" /> ML Trainers
                </NavLink>
                <NavLink to="/reports" className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}>
                  <FaFileExport className="icon" /> Reports
                </NavLink>
                <Dropdown className="d-flex align-items-center">
                  <Dropdown.Toggle variant="link" className="nav-link-item d-flex align-items-center gap-2 border-0 text-decoration-none dropdown-custom">
                    <FaTools className="icon" /> Intelligence Modules
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="bg-white border-light shadow-2xl glass-dropdown mt-2 p-2 rounded-xl">
                    <Dropdown.Item onClick={() => navigate('/network-analytics')} className="dropdown-nav-item py-2 px-3 rounded-lg"><FaChartLine className="me-2"/> Network Analytics</Dropdown.Item>
                    <Dropdown.Item onClick={() => navigate('/incident-hub')} className="dropdown-nav-item py-2 px-3 rounded-lg"><FaBell className="me-2"/> Incident Hub</Dropdown.Item>
                    <Dropdown.Item onClick={() => navigate('/public-transport')} className="dropdown-nav-item py-2 px-3 rounded-lg"><FaCity className="me-2"/> Public Transport</Dropdown.Item>
                    <Dropdown.Item onClick={() => navigate('/enforcement')} className="dropdown-nav-item py-2 px-3 rounded-lg"><FaCamera className="me-2"/> Enforcement</Dropdown.Item>
                    <Dropdown.Item onClick={() => navigate('/TrafficCounting')} className="dropdown-nav-item py-2 px-3 rounded-lg"><FaBrain className="me-2 text-warning"/> AI Traffic Radar</Dropdown.Item>
                    <Dropdown.Item onClick={() => navigate('/EcoImpact')} className="dropdown-nav-item py-2 px-3 rounded-lg"><FaLeaf className="me-2 text-success"/> Environment</Dropdown.Item>
                    <Dropdown.Item onClick={() => navigate('/suggestions')} className="dropdown-nav-item py-2 px-3 rounded-lg"><FaBrain className="me-2 text-primary"/> Advice AI</Dropdown.Item>
                    <Dropdown.Item onClick={() => navigate('/intelligence')} className="dropdown-nav-item py-2 px-3 rounded-lg"><FaCity className="me-2 text-info"/> City Intelligence</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}>
                  <FaTachometerAlt className="icon" /> Command Center
                </NavLink>
                <NavLink to="/live-feed" className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}>
                  <FaCamera className="icon" /> Live Surveillance
                </NavLink>
                <NavLink to="/TrafficCounting" className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}>
                  <FaBrain className="icon text-primary" /> AI Police Radar
                </NavLink>
                <Dropdown className="d-flex align-items-center">
                  <Dropdown.Toggle variant="link" className="nav-link-item d-flex align-items-center gap-2 border-0 text-decoration-none dropdown-custom">
                    <FaTools className="icon" /> Operational Tools
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="bg-white border-light shadow-2xl glass-dropdown mt-2 p-2 rounded-xl">
                    <Dropdown.Item onClick={() => navigate('/network-analytics')} className="dropdown-nav-item py-2 px-3 rounded-lg"><FaChartLine className="me-2"/> Grid Analytics</Dropdown.Item>
                    <Dropdown.Item onClick={() => navigate('/incident-hub')} className="dropdown-nav-item py-2 px-3 rounded-lg"><FaBell className="me-2 text-danger"/> Emergency Hub</Dropdown.Item>
                    <Dropdown.Item onClick={() => navigate('/google-map')} className="dropdown-nav-item py-2 px-3 rounded-lg"><FaCity className="me-2 text-info"/> Tactical Map</Dropdown.Item>
                    <Dropdown.Item onClick={() => navigate('/reports')} className="dropdown-nav-item py-2 px-3 rounded-lg"><FaFileExport className="me-2 text-success"/> Reports Center</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            )}
          </Nav>

          <Nav className="gap-2 align-items-center h-100 mt-2 mt-lg-0 pt-2 pt-lg-0 border-top border-secondary border-lg-0 mt-lg-0 border-opacity-25">
            <Button variant="outline-dark" size="sm" className="rounded-xl border-0 shadow-sm px-3 hover-lift d-none d-xl-flex align-items-center" onClick={() => window.open('https://github.com/Aditya948351/MargVedhaMain', '_blank')}>
              <FaGithub className="me-2" /> GitHub
            </Button>
            <Button variant="outline-info" size="sm" className="rounded-xl bg-info bg-opacity-10 border-0 shadow-sm px-3 hover-lift d-flex align-items-center" onClick={goToProfile}>
              <FaUserCircle className="me-2" /> Profile
            </Button>
            <Button variant="outline-dark" size="sm" className="rounded-xl bg-slate-100 border-0 shadow-sm px-3 hover-lift d-flex align-items-center" onClick={() => navigate("/settings")}>
              <FaCog className="me-2" /> Settings
            </Button>
            <Button variant="danger" size="sm" className="rounded-xl shadow-lg px-4 fw-bold hover-lift d-flex align-items-center ms-lg-2" onClick={() => signOut(auth)}>
              <FaSignOutAlt className="me-2" /> Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>

      <style>{`
        .glass-navbar { background: rgba(255, 255, 255, 0.8) !important; backdrop-filter: blur(20px); border-bottom: 1px solid rgba(0,0,0,0.05) !important; }
        .nav-link-item { color: #64748b !important; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding: 0.6rem 1.25rem !important; border-radius: 12px; transition: all 0.2s ease; display: flex; align-items: center; gap: 10px; margin: 0 4px; text-decoration: none !important; }
        .nav-link-item:hover { color: #0f172a !important; background: rgba(0,0,0,0.05); transform: translateY(-1px); }
        .nav-link-item.active { color: #3b82f6 !important; background: rgba(59, 130, 246, 0.08); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1); }
        .dropdown-custom::after { display: none !important; }
        .glass-dropdown { backdrop-filter: blur(25px); border: 1px solid rgba(0,0,0,0.05) !important; box-shadow: var(--shadow-lg) !important; }
        .dropdown-nav-item { color: #64748b !important; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.5px; }
        .dropdown-nav-item:hover { background: rgba(59, 130, 246, 0.05) !important; color: #3b82f6 !important; padding-left: 1.5rem !important; }
        .fw-black { font-weight: 900; }
        .tracking-tighter { letter-spacing: -0.05em; }
        .ls-1 { letter-spacing: 1px; }
        .hover-lift:hover { transform: translateY(-2px); transition: transform 0.2s; }
        .rounded-xl { border-radius: 12px; }
        .rounded-lg { border-radius: 8px; }
        .text-slate-800 { color: #1e293b; }
      `}</style>
    </Navbar>
  );
};

export default Sidebar;

