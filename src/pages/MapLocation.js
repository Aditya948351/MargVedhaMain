import React from "react";
import MapComponent from "../components/MapComponent";

const MapLocation = () => {
  return (
    <div className="min-h-screen bg-white p-6 lg:p-10 ml-[100px] font-sans">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
          <span className="p-2 bg-blue-50 rounded-xl shadow-sm border border-blue-100">🗺️</span>
          Real-time Signal Locations
        </h1>
        <p className="text-lg text-slate-500 font-medium mt-2">
          Monitor live traffic density and 3D simulation feeds across Nashik City.
        </p>
      </header>

      <div className="bg-white rounded-[2.5rem] p-4 shadow-2xl border border-slate-100">
        <MapComponent height="700px" showUserLocation={true} />
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 italic text-blue-700 text-sm font-medium">
            "Click on any marker to view the 3D Blender-simulated traffic flow for that junction."
         </div>
         <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 italic text-emerald-700 text-sm font-medium">
            "Markers are color-coded: Green (Clear), Amber (Moderate), Red (Congested)."
         </div>
         <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic text-slate-700 text-sm font-medium">
            "Active monitoring of 20 high-priority sensors in the metropolitan area."
         </div>
      </div>
    </div>
  );
};

export default MapLocation;
