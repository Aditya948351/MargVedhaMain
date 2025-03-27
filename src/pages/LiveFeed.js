import React from "react";

const LiveFeed = () => {
  return (
    <div className="container text-center p-4">
      <h1>🚦 Live Traffic in 3D Environment</h1>
      <p>Real-time traffic monitoring using AI-powered YOLOv8 or 3D environment.</p>

      {/* Live Feed Image */}
      <div className="d-flex justify-content-center mt-4">
        <img 
          src="./live_feed.jpeg" 
          alt="Live Feed" 
          className="img-fluid shadow-lg border rounded" 
          style={{ maxWidth: "800px", width: "100%" }} 
        />
      </div>
    </div>
  );
};

export default LiveFeed;
