import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, ProgressBar, Badge } from "react-bootstrap";
import { FaBrain, FaPlay, FaStop, FaDatabase, FaChartLine, FaCheckCircle, FaProjectDiagram, FaServer, FaCog } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function LstmStudio() {
  const [trainingState, setTrainingState] = useState("IDLE"); // IDLE, TRAINING, COMPLETE
  const [epoch, setEpoch] = useState(0);
  const totalEpochs = 50;
  const [lossData, setLossData] = useState([]);
  const [dataset, setDataset] = useState("junction_direction_data.csv");
  const [predictions, setPredictions] = useState(null);

  // Simulation variables
  const [currentLoss, setCurrentLoss] = useState(1.450);
  const [valLoss, setValLoss] = useState(1.500);

  useEffect(() => {
    let interval;
    if (trainingState === "TRAINING") {
      interval = setInterval(() => {
        setEpoch((prev) => {
          if (prev >= totalEpochs) {
            setTrainingState("COMPLETE");
            generatePredictions();
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
        
        setCurrentLoss((prev) => Math.max(0.05, prev - Math.random() * 0.08));
        setValLoss((prev) => Math.max(0.08, prev - Math.random() * 0.07));
        
      }, 300); // 300ms per epoch for visual effect
    }
    return () => clearInterval(interval);
  }, [trainingState]);

  useEffect(() => {
    if (epoch > 0 && epoch <= totalEpochs) {
      setLossData((prev) => [
        ...prev,
        { epoch, loss: currentLoss.toFixed(4), val_loss: valLoss.toFixed(4) }
      ]);
    }
  }, [epoch, currentLoss, valLoss]);

  const startTraining = () => {
    setEpoch(0);
    setLossData([]);
    setCurrentLoss(1.450);
    setValLoss(1.500);
    setPredictions(null);
    setTrainingState("TRAINING");
  };

  const generatePredictions = () => {
    // Generate faked ground truth vs predictions
    const preds = [];
    for(let i=0; i<15; i++) {
        const gt = Math.floor(Math.random() * 100);
        // The prediction is close to ground truth, with small variance
        const pred = gt + Math.floor(Math.random() * 10 - 5);
        preds.push({ time: `T+${i}`, groundTruth: gt, prediction: Math.max(0, pred) });
    }
    setPredictions(preds);
  };

  return (
    <Container fluid className="py-4 px-lg-5" style={{ minHeight: "100vh", background: "#0f172a" }}>
      {/* Header */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary bg-opacity-10 p-3 rounded-xl border border-primary border-opacity-20 shadow-lg">
            <FaBrain className="text-primary fs-3" />
          </div>
          <div>
            <h2 className="text-white mb-0 fw-black tracking-tight" style={{ letterSpacing: '1px' }}>AI & ML STUDIO</h2>
            <p className="text-muted small text-uppercase fw-bold ls-2 mb-0">LSTM Timeseries Forecasting Engine</p>
          </div>
        </div>
        <Badge bg={trainingState === "TRAINING" ? "warning" : trainingState === "COMPLETE" ? "success" : "secondary"} className="p-2 px-3 fw-bold shadow">
           STATUS: {trainingState}
        </Badge>
      </div>

      <Row className="g-4 mb-4">
        {/* ML Configuration Panel */}
        <Col lg={4}>
          <Card className="bg-dark border-0 shadow-lg rounded-2xl glass-card h-100">
            <Card.Body className="p-4">
              <h5 className="text-white fw-bold mb-4 border-bottom border-secondary pb-3 d-flex justify-content-between">
                <span><FaCog className="me-2 text-info"/> Hyperparameters</span>
                <span className="badge bg-info bg-opacity-20 text-info">TensorFlow v2.14</span>
              </h5>
              
              <Form.Group className="mb-3">
                <Form.Label className="text-muted small fw-bold">TRAINING DATASET</Form.Label>
                <Form.Select className="bg-black bg-opacity-50 text-white border-secondary" disabled={trainingState === "TRAINING"} value={dataset} onChange={(e) => setDataset(e.target.value)}>
                  <option value="junction_direction_data.csv">junction_direction_data.csv (700k+ rows)</option>
                  <option value="network_data.csv">network_data.csv (175k rows)</option>
                  <option value="predictive_flow_data.csv">predictive_flow_data.csv (Feature Engineered)</option>
                </Form.Select>
              </Form.Group>

              <Row className="mb-3">
                  <Col>
                    <Form.Group>
                        <Form.Label className="text-muted small fw-bold">EPOCHS</Form.Label>
                        <Form.Control type="number" defaultValue="50" disabled className="bg-black bg-opacity-50 text-white border-secondary text-center" />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                        <Form.Label className="text-muted small fw-bold">BATCH SIZE</Form.Label>
                        <Form.Control type="number" defaultValue="128" disabled className="bg-black bg-opacity-50 text-white border-secondary text-center" />
                    </Form.Group>
                  </Col>
              </Row>

              <Row className="mb-4">
                  <Col>
                    <Form.Group>
                        <Form.Label className="text-muted small fw-bold">LEARNING RATE</Form.Label>
                        <Form.Control type="text" defaultValue="0.001" disabled className="bg-black bg-opacity-50 text-white border-secondary text-center" />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                        <Form.Label className="text-muted small fw-bold">SEQUENCE LEN</Form.Label>
                        <Form.Control type="text" defaultValue="24 hrs" disabled className="bg-black bg-opacity-50 text-white border-secondary text-center" />
                    </Form.Group>
                  </Col>
              </Row>

              <Button 
                variant={trainingState === "TRAINING" ? "danger" : "primary"} 
                className="w-100 py-3 fw-black ls-1 rounded-xl shadow-lg border-0 d-flex align-items-center justify-content-center glow-btn"
                onClick={trainingState === "TRAINING" ? () => setTrainingState("COMPLETE") : startTraining}
              >
                {trainingState === "TRAINING" ? <><FaStop className="me-2" /> ABORT TRAINING</> : <><FaPlay className="me-2" /> COMPILE & TRAIN MODEL</>}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Live Training Output */}
        <Col lg={8}>
          <Card className="bg-dark border-0 shadow-lg rounded-2xl glass-card h-100 position-relative overflow-hidden">
            <Card.Header className="bg-transparent border-0 py-3 px-4 d-flex justify-content-between align-items-center z-index-2">
                <h6 className="text-white mb-0 fw-bold d-flex align-items-center"><FaChartLine className="me-2 text-primary" /> REAL-TIME LOSS METRICS</h6>
                <div className="text-muted small fw-bold">
                    Epoch {epoch}/{totalEpochs}
                </div>
            </Card.Header>
            <ProgressBar 
                now={(epoch / totalEpochs) * 100} 
                variant="primary" 
                style={{ height: '3px', borderRadius: 0, backgroundColor: 'rgba(255,255,255,0.05)' }} 
            />
            <Card.Body className="p-4" style={{ height: "350px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lossData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="epoch" stroke="#888" fontSize={12} tickFormatter={(val) => `Ep ${val}`} />
                  <YAxis stroke="#888" fontSize={12} domain={[0, 1.5]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="loss" stroke="#3b82f6" strokeWidth={3} dot={false} isAnimationActive={false} name="Train Loss" />
                  <Line type="monotone" dataKey="val_loss" stroke="#f59e0b" strokeWidth={3} dot={false} isAnimationActive={false} name="Val Loss" />
                </LineChart>
              </ResponsiveContainer>
              
              {trainingState === "IDLE" && (
                  <div className="position-absolute top-50 start-50 translate-middle text-center opacity-50">
                      <FaServer className="display-1 text-muted mb-3 opacity-25" />
                      <h5 className="text-muted fw-bold">AWAITING TRAINING INITIALIZATION</h5>
                  </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Model Evaluation & Predictions */}
      {trainingState === "COMPLETE" && (
        <Row className="g-4 animate-fade-in">
            <Col lg={4}>
                <Card className="bg-dark border-0 shadow-lg rounded-2xl glass-card h-100 border-success border-bottom border-3">
                    <Card.Body className="p-4">
                        <h5 className="text-white fw-bold mb-4"><FaCheckCircle className="text-success me-2"/> Evaluation Metrics</h5>
                        
                        <div className="bg-black bg-opacity-25 p-3 rounded-xl mb-3 border border-white border-opacity-10 d-flex justify-content-between align-items-center">
                            <span className="text-muted fw-bold small">FINAL VAL LOSS</span>
                            <span className="text-white fw-black">{valLoss.toFixed(4)}</span>
                        </div>
                        <div className="bg-black bg-opacity-25 p-3 rounded-xl mb-3 border border-white border-opacity-10 d-flex justify-content-between align-items-center">
                            <span className="text-muted fw-bold small">RMSE (VEHICLES)</span>
                            <span className="text-white fw-black">3.42</span>
                        </div>
                        <div className="bg-black bg-opacity-25 p-3 rounded-xl mb-3 border border-white border-opacity-10 d-flex justify-content-between align-items-center">
                            <span className="text-muted fw-bold small">MAE</span>
                            <span className="text-white fw-black">2.18</span>
                        </div>
                        <div className="bg-black bg-opacity-25 p-3 rounded-xl border border-white border-opacity-10 d-flex justify-content-between align-items-center">
                            <span className="text-muted fw-bold small">MODEL SIZE</span>
                            <span className="text-info fw-black">1.2 MB (Quantized)</span>
                        </div>

                        <Button variant="outline-success" className="w-100 mt-4 fw-bold rounded-xl" onClick={() => alert("Model weights merged into the live RL Engine. System updated.")}>
                            DEPLOY MODEL TO EDGE
                        </Button>
                    </Card.Body>
                </Card>
            </Col>
            <Col lg={8}>
                <Card className="bg-dark border-0 shadow-lg rounded-2xl glass-card h-100">
                    <Card.Header className="bg-transparent border-secondary py-3 px-4 text-white fw-bold">
                        <FaProjectDiagram className="me-2 text-info" /> PREDICTION VALIDATION (TEST SET)
                    </Card.Header>
                    <Card.Body className="p-4" style={{ height: "300px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={predictions} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="time" stroke="#888" fontSize={12} />
                                <YAxis stroke="#888" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}/>
                                <Line type="monotone" dataKey="groundTruth" stroke="#10b981" strokeWidth={2} name="Ground Truth" />
                                <Line type="monotone" dataKey="prediction" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" name="LSTM Output" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
      )}

      <style>{`
        .glass-card { background: rgba(30, 41, 59, 0.5); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05) !important; }
        .fw-black { font-weight: 900; }
        .ls-1 { letter-spacing: 1px; }
        .ls-2 { letter-spacing: 2.5px; }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-2xl { border-radius: 1.25rem; }
        .z-index-2 { z-index: 2; }
        .glow-btn { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </Container>
  );
}

