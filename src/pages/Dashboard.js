import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import {
  FaTrafficLight,
  FaBus,
  FaLock,
  FaExclamationTriangle,
  FaMoneyBill,
  FaCar,
  FaChartLine,
  FaUsers,
  FaAmbulance,
  FaUpload,
  FaMapMarkerAlt,
  FaRobot,
  FaExternalLinkAlt,
  FaExpandAlt,
} from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import MapComponent from "../components/MapComponent";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { junctionCoords } from "../utils/junctionCoords";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import LiveCCTVGrid from "../components/LiveCCTVGrid";


/**
 * Unified Dashboard.jsx
 * - Inline <style> block embedded (no external CSS file needed)
 * - margin-left: 100px (space for persistent sidebar)
 * - Exactly 2 cards per row (Col md={6})
 * - Added Intersection selector (4 intersections)
 * - "Get AI Decisions" panel with signal statuses (Red/Green)
 * - Preserves: 3D Simulation modal + override, 1-hour prediction, uploads, legacy cards
 *
 * Usage:
 * <Dashboard onLogout={handleLogout} />
 */

/* --- Sample / demo data --- */
const sampleTrafficData = [
  { time: "09:00", vehicles: 120, predicted: 125 },
  { time: "09:10", vehicles: 140, predicted: 138 },
  { time: "09:20", vehicles: 190, predicted: 185 },
  { time: "09:30", vehicles: 220, predicted: 210 },
  { time: "09:40", vehicles: 260, predicted: 255 },
  { time: "09:50", vehicles: 230, predicted: 240 },
  { time: "10:00", vehicles: 210, predicted: 215 },
];

const intersectionsList = Object.entries(junctionCoords).map(([id, data]) => ({
  id: id,
  label: data.name,
  cams: [{ id: `CAM${100 + parseInt(id)}`, vehicles: 0, congestion: "Low" }],
}));

const initialSignalState = Object.entries(junctionCoords).reduce((acc, [id, data]) => {
  acc[`${data.name} - North`] = "green";
  return acc;
}, {});

const nashikJunctions = [
  { id: 1, name: "CBS Circle", top: "45%", left: "50%" },
  { id: 2, name: "Ashok Stambh", top: "35%", left: "48%" },
  { id: 3, name: "Raviwar Karanja", top: "30%", left: "55%" },
  { id: 4, name: "Panchavati Karanja", top: "25%", left: "60%" },
  { id: 5, name: "Dwarka Circle", top: "60%", left: "65%" },
  { id: 6, name: "Mumbai Naka", top: "55%", left: "40%" },
  { id: 7, name: "City Centre Mall Signal", top: "48%", left: "30%" },
  { id: 8, name: "Trimbak Naka", top: "40%", left: "38%" },
  { id: 9, name: "Bapu Pool", top: "65%", left: "75%" },
  { id: 10, name: "Upnagar Naka", top: "75%", left: "70%" },
  { id: 11, name: "Bytco Point", top: "85%", left: "68%" },
  { id: 12, name: "Satpur Garware Point", top: "35%", left: "20%" },
  { id: 13, name: "ITI Signal", top: "45%", left: "22%" },
  { id: 14, name: "Pappu Samosa Signal", top: "50%", left: "52%" },
  { id: 15, name: "Govind Nagar Square", top: "60%", left: "45%" },
  { id: 16, name: "Indira Nagar Jogging Track", top: "65%", left: "50%" },
  { id: 17, name: "Pathardi Phata", top: "75%", left: "45%" },
  { id: 18, name: "Makhmalabad Naka", top: "15%", left: "50%" },
  { id: 19, name: "Mhasrul Naka", top: "10%", left: "60%" },
  { id: 20, name: "Adgaon Naka", top: "15%", left: "80%" }
];

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [trafficData, setTrafficData] = useState([]);
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [simOverride, setSimOverride] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedIntersection, setSelectedIntersection] = useState(intersectionsList[0].id);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiDecisions, setAiDecisions] = useState(null);
  const [signalState, setSignalState] = useState(initialSignalState);
  const [latestStats, setLatestStats] = useState({
      car_count: 0,
      motorcycle_count: 0,
      bus_count: 0,
      truck_count: 0,
      total_vehicles: 0,
  });

  const simulationUrl = "https://traffic-optimization-system.vercel.app/";

  const [liveKpi, setLiveKpi] = useState({ vehicles: 0, inflow: 0, outflow: 0, density: 0 });

  /* Real-time traffic data subscription */
  useEffect(() => {
    const activeJunctionName = junctionCoords[selectedIntersection]?.name || "CBS Circle";
    const trafficRef = collection(db, "traffic_data");
    const q = query(
      trafficRef, 
      where("location", "==", activeJunctionName),
      orderBy("timestamp", "desc"), 
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(doc => doc.data()).reverse();
        const latest = docs[docs.length - 1];
        
        // Update Chart Data
        const formattedData = docs.map(d => ({
          time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          vehicles: d.total_vehicles || (d.car_count + d.motorcycle_count + d.bus_count + d.truck_count),
          predicted: (d.total_vehicles || 0) + Math.round(Math.random() * 20)
        }));
        setTrafficData(formattedData);

        // Update KPIs
        setLatestStats(latest);
        setLiveKpi({
          vehicles: latest.total_vehicles || (latest.car_count + latest.motorcycle_count + latest.bus_count + latest.truck_count),
          inflow: latest.car_count + latest.bus_count,
          outflow: latest.motorcycle_count + latest.truck_count,
          density: Math.min(100, Math.round(((latest.total_vehicles || 0) / 200) * 100))
        });
      } else {
        // Fallback or clear if no data found
        console.warn(`No data found for junction: ${activeJunctionName}`);
        setTrafficData([]);
        setLatestStats({
          car_count: 0,
          motorcycle_count: 0,
          bus_count: 0,
          truck_count: 0,
          total_vehicles: 0,
        });
        setLiveKpi({ vehicles: 0, inflow: 0, outflow: 0, density: 0 });
      }
    }, (error) => {
      console.error("Firestore error:", error);
    });

    return () => unsubscribe();
  }, [selectedIntersection]);

  const [cityWideStats, setCityWideStats] = useState([]);

  /* City-wide traffic summary for bottom table */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "traffic_police"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCityWideStats(data.slice(0, 5)); // Show top 5 or some subset
    });
    return () => unsub();
  }, []);

  /* Mock AI decisions (replace with real API call) */
  const fetchAiDecisions = () => {
    // Simulate network call latency
    setAiModalOpen(true);
    setAiDecisions(null);
    setTimeout(() => {
      const decisions = {
        summary: "Optimize signals on Tarwala / MERI Signal & ITI Signal Post Office corridor; Create green corridor for upcoming ambulance route.",
        actions: [
          { id: 1, action: "Increase green on Tarwala / MERI Signal by 20s", impact: "Reduce queue by ~30%" },
          { id: 2, action: "Prioritize Bus Route on CBS SIGNAL (demand-based)", impact: "Reduce bus delays" },
          { id: 3, action: "Activate emergency green corridor (estimated time saved: 5 min)", impact: "Life-saving" },
        ],
        suggestedSignalStates: {
          "Tarwala / MERI Signal - North": "green",
          "Tarwala / MERI Signal - South": "green",
          "CBS SIGNAL - East": "green",
          "CBS SIGNAL - West": "red",
          "ABB Circle - East": "red",
          "ITI Signal Post Office - North": "green",
        },
      };
      setAiDecisions(decisions);
      setSignalState(decisions.suggestedSignalStates);
    }, 1200);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((file) => {
      return { file, url: URL.createObjectURL(file), name: file.name };
    });
    setUploadedImages((s) => [...mapped, ...s].slice(0, 8));
  };

  const removeImage = (idx) => setUploadedImages((s) => s.filter((_, i) => i !== idx));

  const openSim = (feature) => {
    setSimModalOpen(true);
    setSimOverride(false);
  };

  const overrideSim = () => setSimOverride(true);

  const activeIntersection = 
    intersectionsList.find((it) => it.id === selectedIntersection) || intersectionsList[0];

  const kpi = {
    liveDensity: `${liveKpi.density}%`,
    totalVehicles: liveKpi.vehicles,
    congestion: liveKpi.density > 70 ? "Very High" : (liveKpi.density > 40 ? "High" : "Moderate"),
    distribution: { veryHigh: 1, high: 2, medium: 1, low: 1 }, // This could be calculated from city-wide data
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6 lg:p-10 ml-[100px] font-sans text-[var(--text-primary)] transition-colors duration-300">
      {/* Hero Section */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] flex items-center gap-3">
            <span className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-sm border border-blue-100 dark:border-blue-800">🚦</span>
            Authority Dashboard 
            <span className="text-blue-500 animate-pulse">📶</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] font-medium ml-1">
            Real-time monitoring • 1-hour prediction • 3D simulation preview
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-sm border border-emerald-300"></span>
            </div>
            <span className="text-sm font-semibold text-emerald-700 tracking-wide uppercase">System Hub Live</span>
          </div>
        </div>
      </header>

      <div className="px-4">
        <LiveCCTVGrid />
      </div>

      {/* Priority Section: Top-Level Metrics */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10 px-4">
        {/* Card 1: Live Traffic Overview */}
        <div className="group relative bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden ring-1 ring-slate-900/5">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 -mr-24 -mt-24 rounded-full blur-3xl transition-opacity group-hover:opacity-60" />
          
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500 text-white rounded-2xl shadow-lg ring-4 ring-blue-500/10">
                    <FaChartLine size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">Live Traffic Overview</h2>
                </div>
                <p className="text-[var(--text-secondary)] font-medium ml-1">Aggregate metrics from all sensors</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="bg-[var(--bg-primary)] p-6 rounded-3xl border border-[var(--border-color)] transition-colors hover:bg-[var(--card-bg)] hover:shadow-md">
                <span className="text-4xl font-black text-blue-600 tabular-nums leading-none tracking-tight">{kpi.liveDensity}</span>
                <p className="mt-2 text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Live Density</p>
              </div>
              
              <div className="bg-[var(--bg-primary)] p-6 rounded-3xl border border-[var(--border-color)] transition-colors hover:bg-[var(--card-bg)] hover:shadow-md">
                <span className="text-4xl font-black text-[var(--text-primary)] tabular-nums leading-none tracking-tight">{kpi.totalVehicles}</span>
                <p className="mt-2 text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Total Active</p>
              </div>

              <div className="bg-[var(--bg-primary)] p-6 rounded-3xl border border-[var(--border-color)] transition-colors hover:bg-[var(--card-bg)] hover:shadow-md flex flex-col justify-between">
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold leading-4 tracking-wide uppercase ${kpi.congestion === 'Very High' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                    {kpi.congestion}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 text-[10px] font-bold border border-rose-500/20">VH: {kpi.distribution.veryHigh}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 text-[10px] font-bold border border-amber-500/20">H: {kpi.distribution.high}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 text-[10px] font-bold border border-blue-500/20">M: {kpi.distribution.medium}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 text-[10px] font-bold border border-emerald-500/20">L: {kpi.distribution.low}</span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 italic">Visualizing Nashik's pulse in real-time</span>
              <div className="flex gap-4">
                <button 
                  onClick={() => openSim("MapPreview")}
                  className="px-5 py-2.5 text-blue-600 font-bold text-sm bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors border border-blue-200/50"
                >
                  3D Preview
                </button>
                <button 
                  onClick={() => navigate("/map")}
                  className="px-6 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-2xl hover:bg-black transition-all shadow-lg hover:shadow-blue-500/20 flex items-center gap-2"
                >
                  Live Map <FaExternalLinkAlt size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Per-Intersection Snapshot */}
        <div className="group relative bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden ring-1 ring-slate-900/5">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 -mr-24 -mt-24 rounded-full blur-3xl transition-opacity group-hover:opacity-60" />
          
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-500 text-white rounded-2xl shadow-lg ring-4 ring-orange-500/10">
                    <FaTrafficLight size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">Intersection Snapshot</h2>
                </div>
                <p className="text-[var(--text-secondary)] font-medium ml-1">Contextual monitoring per junction</p>
              </div>
              <div className="relative">
                <select 
                  value={selectedIntersection} 
                  onChange={(e) => setSelectedIntersection(e.target.value)}
                  className="pl-4 pr-10 py-3 bg-[var(--bg-primary)] border-none rounded-2xl text-sm font-bold text-[var(--text-primary)] shadow-inner focus:ring-4 focus:ring-orange-500/5 transition-all outline-none appearance-none cursor-pointer min-w-[220px]"
                >
                  {intersectionsList.map((it) => (
                    <option key={it.id} value={it.id}>{it.label}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div className="flex-grow">
              <div className="overflow-hidden rounded-3xl border border-[var(--border-color)] mb-8 shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">vehicle type</th>
                      <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest text-center">count</th>
                      <th className="px-6 py-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest text-right">status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {[
                      { type: "Car", count: latestStats.car_count, icon: "🚗" },
                      { type: "Motorcycle", count: latestStats.motorcycle_count, icon: "🏍️" },
                      { type: "Bus", count: latestStats.bus_count, icon: "🚌" },
                      { type: "Truck", count: latestStats.truck_count, icon: "🚛" },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[var(--bg-primary)] transition-colors group/row">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{row.icon}</span>
                            <span className="text-sm font-bold text-[var(--text-primary)]">{row.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-black text-[var(--text-primary)] text-md text-center tabular-nums">{row.count}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm border ${row.count > 20 ? 'bg-rose-500 text-white border-rose-400' : 'bg-emerald-500 text-white border-emerald-400'}`}>
                            {row.count > 20 ? "High" : "Normal"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-3 gap-6 bg-[var(--bg-primary)] p-4 rounded-3xl border border-[var(--border-color)]">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Avg Density</p>
                  <p className="text-xl font-black text-[var(--text-primary)] leading-none tracking-tight">{liveKpi.density}%</p>
                </div>
                <div className="space-y-1 border-x border-[var(--border-color)] px-4">
                  <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Active Cams</p>
                  <p className="text-xl font-black text-[var(--text-primary)] leading-none tracking-tight">1</p>
                </div>
                <div className="space-y-1 px-4">
                  <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Signal Status</p>
                  <p className="text-xl font-black text-[var(--text-primary)] leading-none tracking-tight">Active</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => navigate("/intersection-details")}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-800 font-bold text-sm rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center gap-2"
              >
                In-depth Details <FaExpandAlt size={12} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics & Control Section */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10 px-4">
        {/* Card 3: Analytics / Prediction Chart */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300 ring-1 ring-slate-900/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500 text-white rounded-2xl shadow-lg ring-4 ring-indigo-500/10">
                  <FaChartLine size={20} />
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Traffic Prediction</h2>
              </div>
              <p className="text-[var(--text-secondary)] font-medium ml-1">Volume vs Predicted (60 min window)</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/TrafficCounting")} className="px-5 py-2.5 text-slate-600 font-bold text-sm bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors">Monitor</button>
              <button onClick={() => navigate("/export-traffic-csv")} className="px-5 py-2.5 text-white font-bold text-sm bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all shadow-md">Export Data</button>
            </div>
          </div>

          <div className="h-[320px] w-full bg-[var(--bg-primary)] rounded-3xl p-4 border border-[var(--border-color)]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 700 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ fontWeight: 800, fontSize: '12px', color: 'var(--text-primary)' }}
                />
                <Line type="monotone" dataKey="vehicles" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: 'var(--card-bg)' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="predicted" stroke="var(--text-secondary)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Network Health: Optimal</span>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-600 rounded-sm"></div>
                <span className="text-xs font-semibold text-[var(--text-secondary)]">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-300 rounded-sm"></div>
                <span className="text-xs font-semibold text-slate-600">Predicted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Signal Control & AI Insights */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300 ring-1 ring-slate-900/5 flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500 text-white rounded-2xl shadow-lg ring-4 ring-emerald-500/10">
                  <FaRobot size={20} />
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">AI Signal Intelligence</h2>
              </div>
              <p className="text-[var(--text-secondary)] font-medium ml-1">RL-driven intersection optimization</p>
            </div>
            <button 
              onClick={() => fetchAiDecisions()}
              className="px-6 py-3 bg-emerald-600 text-white font-bold text-sm rounded-2xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <FaRobot /> Generate AI Insights
            </button>
          </div>

          <div className="space-y-6 flex-grow">
            <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <FaTrafficLight size={80} className="text-slate-400" />
              </div>
              <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Live Signal Matrix</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
                {Object.keys(signalState).map((k) => (
                  <div key={k} className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 flex flex-col gap-2 transition-transform hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 truncate mr-2">{k}</span>
                      <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.5)] ${signalState[k] === 'green' ? 'bg-emerald-400 shadow-emerald-400/50' : 'bg-rose-500 shadow-rose-500/50'}`}></div>
                    </div>
                    <span className={`text-xs font-black uppercase tracking-wider ${signalState[k] === 'green' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {signalState[k]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 bg-amber-500 text-white rounded-lg">
                    <FaExclamationTriangle size={12} />
                  </div>
                  <span className="text-xs font-black text-amber-800 uppercase tracking-widest">Active Suggestion</span>
                </div>
                <p className="text-sm font-bold text-amber-900 leading-snug mb-4">Central Ave showing unusual queue buildup. Adjust Green phase?</p>
                <div className="flex gap-2">
                  <button onClick={() => navigate("/signal-adjust")} className="flex-1 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-sm">Apply RL Fix</button>
                  <button onClick={() => navigate("/kpi-dashboard")} className="px-4 py-2 bg-white text-amber-700 text-xs font-bold rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors">Details</button>
                </div>
              </div>
              
              <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex flex-col justify-center items-center text-center">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-indigo-100 flex items-center justify-center mb-3">
                  <FaChartLine className="text-indigo-600" />
                </div>
                <p className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-1">Health index</p>
                <p className="text-2xl font-black text-indigo-600 tracking-tight">94.8%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid: Specialized Services */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 px-4">
        {[
          { color: "emerald", icon: <FaBus size={24} />, title: <>Bus Route<br/>Optimization</>, desc: "Dynamic planning based on passenger demand & traffic patterns.", btn: "🗺️ View Routes", path: "/BusRouteOptimization" },
          { color: "sky", icon: <FaLock size={24} />, title: <>Secure Ticketing<br/>(Blockchain)</>, desc: "Secure & transparent ticketing for seamless public transport.", btn: "💳 Transactions", path: "/BlockChainTicketing" },
          { color: "rose", icon: <FaExclamationTriangle size={24} />, title: <>Emergency<br/>Response</>, desc: "Incident tracking & rapid deployment for emergency services.", btn: "🚑 Alert Center", path: "/EmergencyAlerts" },
          { color: "amber", icon: <FaMoneyBill size={24} />, title: <>Fare<br/>Adjustments</>, desc: "Real-time demand-based pricing for city transit services.", btn: "💵 Fare Updates", path: "/AutoFareAdjustments" },
        ].map((item, idx) => (
          <div key={idx} className={`bg-${item.color}-50 dark:bg-${item.color}-950/20 border border-${item.color}-100 dark:border-${item.color}-900/50 rounded-3xl p-6 hover:shadow-lg transition-all border-b-4 border-b-${item.color}-500/30 group`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 bg-white dark:bg-${item.color}-900 rounded-2xl shadow-sm text-${item.color}-600 dark:text-${item.color}-400 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <h3 className="font-bold text-[var(--text-primary)] leading-tight">{item.title}</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">{item.desc}</p>
            <button onClick={() => navigate(item.path)} className={`w-full py-3 bg-${item.color}-600 text-white font-bold text-sm rounded-2xl hover:bg-${item.color}-700 transition-all shadow-md`}>{item.btn}</button>
          </div>
        ))}
      </section>

      {/* Uploads & Logs Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 px-4">
        {/* Card: Uploads */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] p-8 shadow-sm lg:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-[var(--bg-primary)] text-[var(--text-secondary)] rounded-2xl">
              <FaUpload size={20} />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Evidence Upload</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] font-medium mb-6">Attach incident snapshots or camera footage (Max 8 thumbnails)</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[var(--border-color)] border-dashed rounded-3xl cursor-pointer bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FaUpload className="w-8 h-8 mb-3 text-[var(--text-secondary)] group-hover:text-blue-500 transition-colors" />
                  <p className="mb-2 text-sm text-[var(--text-secondary)] font-bold tracking-tight">Click to upload</p>
                </div>
                <input type="file" multiple className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {uploadedImages.map((img, idx) => (
                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden shadow-sm border border-slate-200">
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <button 
                    onClick={() => removeImage(idx)} 
                    className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              {uploadedImages.length === 0 && (
                <div className="col-span-4 py-8 text-center bg-slate-50/50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No images attached</p>
                </div>
              )}
            </div>
            <button onClick={() => setUploadedImages([])} className="w-full py-2.5 text-xs font-black text-slate-500 uppercase tracking-[0.2em] hover:text-rose-500 transition-colors">Clear all files</button>
          </div>
        </div>

        {/* Card: Historical & Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500 text-white rounded-2xl shadow-lg">
                    <FaChartLine size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Active Traffic Monitor</h2>
                </div>
                <p className="text-[var(--text-secondary)] font-medium ml-1">Live camera sensors across Nashik</p>
              </div>
              <button onClick={() => navigate("/analytics")} className="px-5 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-black uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all shadow-lg">Advanced Analytics</button>
            </div>

            <div className="overflow-hidden rounded-3xl border border-[var(--border-color)] shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
                    <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Sensor ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Location</th>
                    <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Live Volume</th>
                    <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Intensity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {cityWideStats.length > 0 ? cityWideStats.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-8 py-5 font-bold text-[var(--text-primary)] text-sm">{row.junctionId || 'SYS'+row.id.slice(-3)}</td>
                      <td className="px-8 py-5 text-[var(--text-secondary)] font-medium text-sm">{row.junctionName}</td>
                      <td className="px-8 py-5 tabular-nums font-black text-[var(--text-primary)]">{row.liveVehicleCount}</td>
                      <td className="px-8 py-5 text-right">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                          row.liveVehicleCount > 100 ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          row.liveVehicleCount > 50 ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {row.status || (row.liveVehicleCount > 100 ? 'Very High' : row.liveVehicleCount > 50 ? 'High' : 'Low')}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-8 py-5 text-center text-slate-400 italic font-medium">Connecting to city-wide sensors...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <button onClick={() => navigate("/CitizenReports")} className="p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <FaUsers size={20} />
              </div>
              <h4 className="font-bold text-[var(--text-primary)] mb-1">Citizen Reports</h4>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Review community alerts</p>
            </button>
            <button onClick={() => navigate("/EmergencyCorridors")} className="p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl hover:border-rose-300 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                <FaExclamationTriangle size={20} />
              </div>
              <h4 className="font-bold text-[var(--text-primary)] mb-1">Emergency Corridor</h4>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Activate priority pathing</p>
            </button>
            <button onClick={() => navigate("/analytics")} className="hidden lg:block p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 transition-all group col-span-1">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                <FaChartLine size={20} />
              </div>
              <h4 className="font-bold text-[var(--text-primary)] mb-1">System Health</h4>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Global network stats</p>
            </button>
          </div>
        </div>
      </section>

      {/* 3D Simulation map preview */}
      <Modal show={simModalOpen} onHide={() => setSimModalOpen(false)} size="xl" centered className="premium-modal">
        <Modal.Header closeButton className="border-b-0 pt-8 px-8 bg-[var(--card-bg)]">
          <Modal.Title className="text-2xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
             <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl shadow-sm border border-blue-100 dark:border-blue-800">
               <FaMapMarkerAlt size={20} />
             </div>
             Live 3D Simulation Map
             <span className="text-xs font-black text-blue-500 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/40 rounded-lg border border-blue-100 dark:border-blue-800 uppercase tracking-widest ml-2">Nashik City</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ minHeight: 600, padding: 0, position: "relative", background: "#111827" }}>
          <MapComponent height="600px" />
        </Modal.Body>
        <Modal.Footer className="bg-[var(--bg-primary)] border-t border-[var(--border-color)] p-6 rounded-b-3xl">
          <div className="w-full flex justify-between items-center text-[var(--text-secondary)]">
            <small className="font-medium">Traffic overlay actively tracking 20 main junctions in Nashik.</small>
            <Button 
              className="px-6 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] border-none rounded-xl font-bold text-sm tracking-wide transition-all hover:opacity-90" 
              onClick={() => setSimModalOpen(false)}
            >
              Close Map
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* AI Decisions modal */}
      <Modal show={aiModalOpen} onHide={() => setAiModalOpen(false)} centered size="lg" className="premium-modal">
        <Modal.Header closeButton className="border-b-0 pt-8 px-8 bg-[var(--card-bg)] text-[var(--text-primary)]">
          <Modal.Title className="text-2xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
            <span className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">🤖</span>
            AI Intelligence Decisions
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-8 pb-8 bg-[var(--card-bg)]">
          {!aiDecisions ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="relative flex h-12 w-12">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-12 w-12 bg-emerald-500 shadow-lg flex items-center justify-center text-white">
                  <FaRobot size={24} />
                </span>
              </div>
              <div className="text-sm font-bold text-slate-500 tracking-widest uppercase animate-pulse">Computing Traffic RL...</div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-[var(--bg-primary)] rounded-2xl p-6 border border-[var(--border-color)]">
                <h6 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">Strategy Summary</h6>
                <p className="text-[var(--text-primary)] font-bold leading-relaxed">{aiDecisions.summary}</p>
              </div>

              <div>
                <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Recommended Actions</h6>
                <div className="space-y-3">
                  {aiDecisions.actions.map((a) => (
                    <div key={a.id} className="flex items-start gap-4 p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-sm hover:border-emerald-200 transition-colors">
                      <div className="mt-1 p-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">{a.action}</p>
                        <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">{a.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Signal State Matrix</h6>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(aiDecisions.suggestedSignalStates).map((k) => (
                    <div key={k} className="px-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl flex items-center justify-between shadow-sm">
                      <span className="text-xs font-bold text-[var(--text-secondary)]">{k}</span>
                      <div className="flex items-center gap-2">
                         <span className={`w-2 h-2 rounded-full ${aiDecisions.suggestedSignalStates[k] === "green" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"}`} />
                         <span className={`text-[10px] font-black uppercase tracking-wider ${aiDecisions.suggestedSignalStates[k] === "green" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                           {aiDecisions.suggestedSignalStates[k]}
                         </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-t border-[var(--border-color)] p-6 bg-[var(--card-bg)]">
          <Button 
            className="w-full py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] border-none rounded-2xl font-bold text-sm tracking-wide transition-all hover:opacity-90 shadow-lg" 
            onClick={() => setAiModalOpen(false)}
          >
            Acknowledge & Sync System
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;
