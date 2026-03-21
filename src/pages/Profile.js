import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Container, Row, Col, Card, Alert, Spinner, ProgressBar, Badge } from "react-bootstrap";
import { FaUserCircle, FaMapMarkerAlt, FaCarSide, FaTrafficLight, FaStar, FaBusAlt, FaClock, FaAward } from "react-icons/fa";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import "./Profile.css";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { id } = useParams();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        let q;
        if (id && id !== 'admin') {
          // View specific junction if ID is provided
          q = query(collection(db, "traffic_police"), where("junctionId", "==", parseInt(id)));
        } else {
          // Default to logged-in user's email
          q = query(collection(db, "traffic_police"), where("email", "==", user.email));
        }
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          setProfileData(snapshot.docs[0].data());
        } else {
          // Check if admin
          if (user.email === 'admin@nashikcity.gov.in' || id === 'admin') {
            setProfileData({
              officerName: "Nashik City Authority",
              junctionName: "Headquarters (Admin)",
              email: "admin@nashikcity.gov.in",
              liveVehicleCount: "City-Wide Access",
              status: "Super Admin"
            });
          } else {
             setError("Profile data not found in Firestore.");
          }
        }
      } catch (err) {
        console.error("Error fetching profile from Firestore:", err);
        setError("Failed to load profile data. Permission denied or network error.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, id]);

  if (loading) {
    return <div className="text-center mt-5"><Spinner animation="border" variant="light" /></div>;
  }

  if (error) {
    return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  }

  return (
    <Container fluid className="profile-container mt-2">
      <Row className="justify-content-center w-100 m-0">
        <Col lg={10} xl={9}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0 text-dark fw-bold">Officer Profile</h3>
          </div>
          <Card className="dashboard-large-card border-0 shadow-lg" style={{ background: 'var(--card-bg)', color: 'var(--text-primary)' }}>
            <Card.Body className="p-4 p-md-5">
              <Row className="align-items-center border-bottom pb-4 mb-4 text-center text-md-start">
                <Col md={3} className="mb-3 mb-md-0 d-flex justify-content-center">
                   <div className="profile-avatar">
                     <FaUserCircle size={90} className="text-primary" />
                   </div>
                </Col>
                <Col md={9}>
                   <h2 className="fw-bold mb-1">{profileData?.officerName || "Unknown Officer"}</h2>
                   <p className="text-muted fs-5 mb-0">{profileData?.email}</p>
                   {profileData?.status === "Super Admin" && <Badge bg="primary" className="mt-3 text-uppercase px-3 py-2 rounded-pill shadow-sm">City Administrator</Badge>}
                </Col>
              </Row>

              <Row className="g-4 mb-5">
                <Col md={4}>
                  <div className="info-box d-flex flex-column p-4 rounded bg-white shadow-sm border border-light h-100">
                    <div className="d-flex align-items-center mb-3">
                      <div className="icon-wrapper border border-danger border-opacity-25 bg-danger text-white me-3 bg-opacity-75 shadow-sm">
                        <FaMapMarkerAlt size={20} />
                      </div>
                      <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Assigned Junction</small>
                    </div>
                    <div className="fs-5 fw-semibold mt-auto" style={{ color: 'var(--text-primary)' }}>{profileData?.junctionName || "N/A"}</div>
                  </div>
                </Col>
                
                <Col md={4}>
                  <div className="info-box d-flex flex-column p-4 rounded bg-white shadow-sm border border-light h-100">
                    <div className="d-flex align-items-center mb-3">
                      <div className="icon-wrapper border border-info border-opacity-25 bg-info text-white me-3 bg-opacity-75 shadow-sm">
                        <FaCarSide size={20} />
                      </div>
                      <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Live Traffic Density</small>
                    </div>
                    <div className="fs-4 fw-bold mt-auto" style={{ color: 'var(--text-primary)' }}>
                      {profileData?.liveVehicleCount || 0} <span className="text-muted fs-6 fw-normal">vehicles</span>
                    </div>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="info-box d-flex flex-column p-4 rounded bg-white shadow-sm border border-light h-100">
                    <div className="d-flex align-items-center mb-3">
                      <div className="icon-wrapper border border-success border-opacity-25 bg-success text-white me-3 bg-opacity-75 shadow-sm">
                        <FaTrafficLight size={20} />
                      </div>
                      <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>Current Status</small>
                    </div>
                    <div className="fs-4 fw-bold mt-auto" style={{ color: 'var(--text-primary)' }}>
                      {profileData?.status === "Congested" && <span className="text-danger">Congested</span>}
                      {profileData?.status === "Clear" && <span className="text-success">Clear</span>}
                      {(profileData?.status !== "Congested" && profileData?.status !== "Clear") && <span>{profileData?.status || "Active"}</span>}
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Performance & Rewards Section */}
              <div className="mt-4 pt-2">
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 border-bottom pb-3">
                  <h4 className="fw-bold mb-3 mb-md-0 text-dark"><FaAward className="text-warning me-2" /> Performance & Rewards</h4>
                  <Badge bg="warning" text="dark" className="px-4 py-2 fs-6 rounded-pill shadow-sm border border-warning">
                    <FaStar className="mb-1 me-1" /> Gold Member
                  </Badge>
                </div>
                
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden mt-3" style={{ background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid rgba(0,0,0,0.08) !important' }}>
                  <Card.Body className="p-4">
                    <Row className="g-4 mb-4">
                      
                      <Col xs={12} md={4}>
                        <div className="d-flex align-items-center p-3 rounded" style={{ background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(0,0,0,0.03)' }}>
                          <div className="icon-wrapper bg-warning bg-opacity-25 text-warning me-3 shadow-sm" style={{width: '50px', height: '50px', borderRadius: '14px', border: '1px solid rgba(245, 158, 11, 0.3)'}}>
                            <FaStar size={24} />
                          </div>
                          <div>
                            <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{fontSize: '0.75rem', letterSpacing: '0.5px'}}>Reward Points</small>
                            <h4 className="fw-bold text-dark mb-0 fs-3">1,250</h4>
                          </div>
                        </div>
                      </Col>
                      
                      <Col xs={12} md={4}>
                        <div className="d-flex align-items-center p-3 rounded" style={{ background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(0,0,0,0.03)' }}>
                          <div className="icon-wrapper bg-primary bg-opacity-25 text-primary me-3 shadow-sm" style={{width: '50px', height: '50px', borderRadius: '14px', border: '1px solid rgba(59, 130, 246, 0.3)'}}>
                            <FaBusAlt size={22} />
                          </div>
                          <div>
                            <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{fontSize: '0.75rem', letterSpacing: '0.5px'}}>Buses Prioritized</small>
                            <h4 className="fw-bold text-dark mb-0 fs-3">42</h4>
                          </div>
                        </div>
                      </Col>
                      
                      <Col xs={12} md={4}>
                        <div className="d-flex align-items-center p-3 rounded" style={{ background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(0,0,0,0.03)' }}>
                          <div className="icon-wrapper bg-success bg-opacity-25 text-success me-3 shadow-sm" style={{width: '50px', height: '50px', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.3)'}}>
                            <FaClock size={22} />
                          </div>
                          <div>
                            <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{fontSize: '0.75rem', letterSpacing: '0.5px'}}>Shift Logged</small>
                            <h4 className="fw-bold text-dark mb-0 fs-3">18h</h4>
                          </div>
                        </div>
                      </Col>
                      
                    </Row>
                    
                    <div className="px-3 pt-2 mt-3">
                       <div className="d-flex justify-content-between align-items-end mb-2">
                          <span className="text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Next Tier: Platinum</span>
                          <span className="text-dark fw-bold">1,250 <span className="text-muted fw-normal">/ 2,000 pts</span></span>
                       </div>
                       <ProgressBar variant="warning" now={62.5} style={{ height: '12px', backgroundColor: 'rgba(0,0,0,0.08)' }} className="shadow-sm" />
                    </div>
                  </Card.Body>
                </Card>
              </div>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
