import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, InputGroup } from "react-bootstrap";
import { FaUserShield, FaLock } from "react-icons/fa";

const Home = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "margvedha01@gmail.com" && password === "DR@123") {
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
      navigate("/dashboard");
    } else {
      alert("Invalid Credentials! Please try again.");
    }
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundImage: "url('https://source.unsplash.com/1600x900/?technology,security')", backgroundSize: "cover", backgroundPosition: "center" }}>
      <Card className="shadow-lg border-0 text-white" style={{ maxWidth: "400px", width: "100%", borderRadius: "15px", padding: "30px", backdropFilter: "blur(15px)", background: "rgba(0, 0, 0, 0.5)" }}>
        <Card.Body className="text-center">
          <h2 className="text-warning fw-bold mb-4"><FaUserShield className="me-2" /> Admin Login</h2>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Email Address</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-warning text-dark border-0"><FaUserShield /></InputGroup.Text>
                <Form.Control type="email" placeholder="Enter email" className="bg-dark text-white border-0 rounded-end"
                  value={email} onChange={(e) => setEmail(e.target.value)} required />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Password</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-warning text-dark border-0"><FaLock /></InputGroup.Text>
                <Form.Control type="password" placeholder="Enter password" className="bg-dark text-white border-0 rounded-end"
                  value={password} onChange={(e) => setPassword(e.target.value)} required />
              </InputGroup>
            </Form.Group>

            <Button variant="warning" type="submit" className="w-100 fw-bold shadow">Login</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Home;
