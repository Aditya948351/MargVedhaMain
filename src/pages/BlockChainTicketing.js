import React, { useState } from "react";

const BlockChainTicketing = () => {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [distance, setDistance] = useState(null);
  const [fare, setFare] = useState(null);

  const farePerKm = 50;

  const locations = {
    "Vidya Vikas Circle": { lat: 20.010221, lon: 73.76414 },
    "Spectrum": { lat: 20.00724, lon: 73.77148 },
    "Bus Stop": { lat: 20.00387, lon: 73.77042 },
    "Theater": { lat: 20.00587, lon: 73.76331 },
  };

  const calculateDistance = () => {
    if (!start || !end) return;

    if (!(start in locations) || !(end in locations)) {
      alert("Invalid locations. Use predefined points.");
      return;
    }

    if (start === end) {
      alert("Start and End destinations cannot be the same.");
      return;
    }

    const { lat: lat1, lon: lon1 } = locations[start];
    const { lat: lat2, lon: lon2 } = locations[end];

    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;

    setDistance(dist.toFixed(2));
    setFare((dist * farePerKm).toFixed(2));
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-6">Blockchain Ticketing</h2>
      <br></br>
      
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center flex flex-col items-center space-y-6">
        <br></br>
        <div className="w-full">
          <label className="block text-left font-medium">Start Destination:</label>
          <select
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="p-2 border w-full rounded"
          >
            <option value="">Select Start Destination</option>
            {Object.keys(locations).map((place) => (
              <option key={place} value={place}>{place}</option>
            ))}
          </select>
        </div>
       <br></br>
        <div className="w-full">
          <label className="block text-left font-medium">End Destination:</label>
          <select
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="p-2 border w-full rounded"
          >
            <option value="">Select End Destination</option>
            {Object.keys(locations).map((place) => (
              <option key={place} value={place}>{place}</option>
            ))}
          </select>
        </div>
        <br></br>
        <button onClick={calculateDistance} style={{backgroundColor:"blue",color:"white"}}>
          Calculate Distance and Fare
        </button>

        {distance && (
          <div className="mt-4 text-lg font-semibold">
            <p>Distance: {distance} km</p>
            <p>Estimated Fare: ₹{fare}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockChainTicketing;