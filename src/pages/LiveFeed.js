import React from "react";

const LiveFeed = () => {
  return (
    <div className="container text-center p-4">
      <h1>🚦 Live Traffic in 3D Environment</h1>
      <p>Real-time traffic monitoring using AI-powered YOLOv8 or 3D env.</p>
      {/* Add your live feed component or iframe here */}
      <div className="mt-4">
        <img
          src="https://github.com/Aditya948351/Hosting/blob/main/trafficrulesviolation.jpg?raw=true"
          width="100%"
          height="500px"
          style={{ border: "none" }}
          alt="Live Traffic Feed"
        ></img>
      </div>
    </div>
  );
};

export default LiveFeed;
