import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Alert, Form, Button } from "react-bootstrap";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // On successful login, App.js logic will typically handle routing,
      // but we can explicitly push to dashboard here just in case.
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-image-section">
          <img src="/logo.svg" alt="Marg Vedha Logo" className="login-logo" />
          <h2>Nashik City Traffic Control</h2>
          <p>Government Authority & Traffic Police Portal</p>
        </div>
        
        <div className="login-form-section">
          <div className="login-header">
            <h3>Welcome Back</h3>
            <p>Please enter your official credentials to access the dashboard.</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleLogin} className="login-form">
            <Form.Group controlId="email">
              <Form.Label>Official Email UI</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email (e.g., admin@nashikpolice.gov.in)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="btn-login"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Login to Portal"}
            </Button>
          </Form>

          <div className="login-footer">
            <p>Authorized personnel only. Citizen portal is arriving soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
