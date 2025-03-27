import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Card, Button, Row, Col, Modal } from "react-bootstrap";
import { FaVideo, FaMapMarkerAlt, FaTrafficLight } from "react-icons/fa";
import "leaflet/dist/leaflet.css";


const signalLocations = [
  { id: 1, name: "Vidya Vikas Circle", lat: 20.01021, lon: 73.76414, camera: 1 },
  { id: 2, name: "Spectrum", lat: 20.00724, lon: 73.77148, camera: 2 },
  { id: 3, name: "Bus Stop", lat: 20.00387, lon: 73.77042, camera: 3 },
  { id: 4, name: "Theatre", lat: 20.00587, lon: 73.76331, camera: 4 },
];


const videoSources = {
  1: "/vidya_vikas_camera1.mp4",
  2: "/spectrum_camera2.mp4",
  3: "/bus_stop_camera3.mp4",
  4: "/theatre_camera4.mp4",
};

const CameraFeed = () => {
  const [showVideo, setShowVideo] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [videoKey, setVideoKey] = useState(Date.now()); 

  
  const handleShowVideo = (signal) => {
    setSelectedSignal(signal);
    setVideoKey(Date.now()); // Refresh video source
    setShowVideo(true);
  };

  return (
    <div className="p-4">
      
      <h2>
        <FaTrafficLight className="text-danger" /> Traffic Camera Feeds
      </h2>
      <p>Monitor live camera feeds from different traffic signals.</p>

      
      <Card className="shadow-lg mb-4">
        <Card.Body>
          <Card.Title>
            <FaMapMarkerAlt className="text-primary" /> Signal Locations on Map
          </Card.Title>
          <MapContainer
            center={[20.00724, 73.77148]} 
            zoom={15}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {signalLocations.map((signal) => (
              <Marker key={signal.id} position={[signal.lat, signal.lon]}>
                <Popup>{signal.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </Card.Body>
      </Card>

     
      {signalLocations.map((signal) => (
        <Card key={signal.id} className="shadow-lg mb-4">
          <Card.Body>
            <Card.Title>
              <FaTrafficLight className="text-danger" /> {signal.name} - Camera {signal.camera}
            </Card.Title>
            <Row>
              <Col>
                <Button
                  variant="dark"
                  className="w-100"
                  onClick={() => handleShowVideo(signal)}
                >
                  <FaVideo /> Camera {signal.camera}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}

     
      <Modal show={showVideo} onHide={() => setShowVideo(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedSignal?.name} - Camera {selectedSignal?.camera} Feed
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedSignal ? (
            <video key={videoKey} width="100%" controls autoPlay muted>
              <source src="./video_feed1.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <p>Loading video...</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CameraFeed;
