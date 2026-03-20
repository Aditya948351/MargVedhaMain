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
    <Container className="profile-container mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="profile-card border-0 text-white shadow-lg">
            <Card.Body className="p-5 text-center">
              <div className="profile-avatar mb-4">
                <FaUserCircle size={100} className="text-primary" />
              </div>
              <h2 className="fw-bold mb-1">{profileData?.officerName || "Unknown Officer"}</h2>
              <p className="text-muted mb-4 fs-5">{profileData?.email}</p>
              
              <hr className="border-secondary opacity-25" />

              <Row className="mt-4 text-start g-3">
                <Col xs={12}>
                  <div className="info-box d-flex align-items-center p-3 bg-dark-soft rounded shadow-sm">
                    <div className="icon-wrapper bg-danger-soft text-danger me-3"><FaMapMarkerAlt size={24} /></div>
                    <div>
                      <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>Assigned Junction</small>
                      <div className="fs-5 fw-semibold text-white">{profileData?.junctionName || "N/A"}</div>
                    </div>
                  </div>
                </Col>
                
                <Col xs={12}>
                  <div className="info-box d-flex align-items-center p-3 bg-dark-soft rounded shadow-sm">
                    <div className="icon-wrapper bg-info-soft text-info me-3"><FaCarSide size={24} /></div>
                    <div>
                      <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>Live Traffic</small>
                      <div className="fs-5 fw-bold text-white mb-0">{profileData?.liveVehicleCount || 0} <span className="text-muted fs-6 fw-normal">vehicles</span></div>
                    </div>
                  </div>
                </Col>

                <Col xs={12}>
                  <div className="info-box d-flex align-items-center p-3 bg-dark-soft rounded shadow-sm">
                    <div className="icon-wrapper bg-success-soft text-success me-3"><FaTrafficLight size={24} /></div>
                    <div>
                      <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>Current Status</small>
                      <div className="fs-5 fw-bold text-white mb-0">
                        {profileData?.status || "Active"}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Performance & Rewards Section */}
              <div className="mt-5 text-start">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="fw-bold mb-0 text-white"><FaAward className="text-warning me-2" /> Performance & Rewards</h5>
                  <Badge bg="warning" text="dark" className="px-3 py-2 fs-6 rounded-pill shadow-sm">
                    <FaStar className="mb-1 me-1" /> Gold Member
                  </Badge>
                </div>
                
                <Card className="bg-dark-soft border-0 shadow-sm rounded-4 mb-4">
                  <Card.Body className="p-4">
                    <Row className="g-3 mb-4">
                      
                      <Col xs={12} className="border-bottom border-secondary border-opacity-25 pb-3">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <div className="icon-wrapper bg-warning bg-opacity-10 text-warning me-3" style={{width: '40px', height: '40px', borderRadius: '10px'}}><FaStar size={20} /></div>
                            <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.75rem', letterSpacing: '0.5px'}}>Reward Points</small>
                          </div>
                          <h4 className="fw-bold text-white mb-0">1,250</h4>
                        </div>
                      </Col>
                      
                      <Col xs={12} className="border-bottom border-secondary border-opacity-25 pb-3">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <div className="icon-wrapper bg-primary bg-opacity-10 text-primary me-3" style={{width: '40px', height: '40px', borderRadius: '10px'}}><FaBusAlt size={20} /></div>
                            <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.75rem', letterSpacing: '0.5px'}}>Buses Prioritized</small>
                          </div>
                          <h4 className="fw-bold text-white mb-0">42</h4>
                        </div>
                      </Col>
                      
                      <Col xs={12}>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <div className="icon-wrapper bg-success bg-opacity-10 text-success me-3" style={{width: '40px', height: '40px', borderRadius: '10px'}}><FaClock size={20} /></div>
                            <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.75rem', letterSpacing: '0.5px'}}>Shift Logged</small>
                          </div>
                          <h4 className="fw-bold text-white mb-0">18h</h4>
                        </div>
                      </Col>
                      
                    </Row>
                    
                    <div className="px-2 mt-2">
                       <div className="d-flex justify-content-between align-items-end mb-2">
                          <span className="text-muted fw-semibold" style={{ fontSize: '0.85rem' }}>Next Tier: Platinum</span>
                          <span className="text-white fw-bold">1,250 / 2,000 pts</span>
                       </div>
                       <ProgressBar variant="warning" now={62.5} style={{ height: '8px' }} />
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
