import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Form } from "react-bootstrap";
import { FaCog, FaBell, FaPalette, FaLanguage, FaQuestionCircle } from "react-icons/fa";

const Settings = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [fontSize, setFontSize] = useState(localStorage.getItem("fontSize") || "medium");
  const [highContrast, setHighContrast] = useState(localStorage.getItem("highContrast") === "true");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "English");
  const [activeTab, setActiveTab] = useState("account");

  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    document.body.classList.remove("small-font", "medium-font", "large-font");
    document.body.classList.add(`${fontSize}-font`);
    if (highContrast) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }
  }, [theme, fontSize, highContrast]);

  return (
    <div className="p-4">
      <h2>⚙️ Settings</h2>
      <p>Customize your preferences for a better experience.</p>

      
      <Row className="mb-4">
        <Col md={2}>
          <Button variant={activeTab === "account" ? "primary" : "light"} onClick={() => setActiveTab("account")}>
            <FaCog /> Account
          </Button>
        </Col>
        <Col md={2}>
          <Button variant={activeTab === "notifications" ? "primary" : "light"} onClick={() => setActiveTab("notifications")}>
            <FaBell /> Notifications
          </Button>
        </Col>
        <Col md={2}>
          <Button variant={activeTab === "appearance" ? "primary" : "light"} onClick={() => setActiveTab("appearance")}>
            <FaPalette /> Appearance
          </Button>
        </Col>
        <Col md={2}>
          <Button variant={activeTab === "language" ? "primary" : "light"} onClick={() => setActiveTab("language")}>
            <FaLanguage /> Language
          </Button>
        </Col>
        <Col md={2}>
          <Button variant={activeTab === "help" ? "primary" : "light"} onClick={() => setActiveTab("help")}>
            <FaQuestionCircle /> Help
          </Button>
        </Col>
      </Row>

      
      {activeTab === "account" && (
        <Card className="shadow-lg border-0">
          <Card.Body>
            <Card.Title>Account Settings</Card.Title>
            <p>Manage your account details.</p>
            <Button variant="success">Update Profile</Button>
          </Card.Body>
        </Card>
      )}

      
      {activeTab === "notifications" && (
        <Card className="shadow-lg border-0">
          <Card.Body>
            <Card.Title>Notification Preferences</Card.Title>
            <Form.Check type="checkbox" label="Email Notifications" />
            <Form.Check type="checkbox" label="Push Notifications" />
          </Card.Body>
        </Card>
      )}

      
      {activeTab === "appearance" && (
        <Card className="shadow-lg border-0">
          <Card.Body>
            <Card.Title>Appearance Settings</Card.Title>
            <Form.Group>
              <Form.Label>Theme</Form.Label>
              <Form.Select value={theme} onChange={(e) => {
                setTheme(e.target.value);
                localStorage.setItem("theme", e.target.value);
              }}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Font Size</Form.Label>
              <Form.Select value={fontSize} onChange={(e) => {
                setFontSize(e.target.value);
                localStorage.setItem("fontSize", e.target.value);
              }}>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </Form.Select>
            </Form.Group>

            <Form.Check 
              type="checkbox" 
              label="Enable High Contrast" 
              checked={highContrast} 
              onChange={() => {
                setHighContrast(!highContrast);
                localStorage.setItem("highContrast", !highContrast);
              }} 
            />
          </Card.Body>
        </Card>
      )}

      
      {activeTab === "language" && (
        <Card className="shadow-lg border-0">
          <Card.Body>
            <Card.Title>Language Preferences</Card.Title>
            <Form.Group>
              <Form.Label>Select Language</Form.Label>
              <Form.Select value={language} onChange={(e) => {
                setLanguage(e.target.value);
                localStorage.setItem("language", e.target.value);
              }}>
                <option value="English">English</option>
                <option value="Spanish">Español</option>
                <option value="German">Deutsch</option>
                <option value="French">Français</option>
              </Form.Select>
            </Form.Group>
          </Card.Body>
        </Card>
      )}

      
      {activeTab === "help" && (
        <Card className="shadow-lg border-0">
          <Card.Body>
            <Card.Title>Help & Updates</Card.Title>
            <Button variant="warning">Check for Updates</Button>
            <p>For support, visit our Help Center.</p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Settings;
