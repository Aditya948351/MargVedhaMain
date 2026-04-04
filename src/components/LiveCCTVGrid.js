import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { Card, Row, Col, Badge } from "react-bootstrap";
import { FaVideo, FaTrafficLight, FaCar, FaTruck, FaMotorcycle, FaBus } from "react-icons/fa";

const CCTVGridItem = ({ camId, title, sourceVideo, data }) => {
  return (
    <Card className="bg-dark border-0 shadow-lg mb-4 overflow-hidden rounded-3xl group relative">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Badge bg={data?.status === 'Congested' ? 'danger' : (data?.status === 'High' ? 'warning' : 'success')} className="px-3 py-2 text-xs font-bold rounded-full">
          {data?.status || 'Active'}
        </Badge>
        <Badge bg="dark" className="px-3 py-2 text-xs font-bold rounded-full border border-gray-600 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> LIVE
        </Badge>
      </div>

      <div className="relative aspect-video bg-black">
        <video 
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          src={sourceVideo} 
          autoPlay 
          loop 
          muted 
          playsInline
        />
        
        {/* Overlay Data on Video */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <h5 className="text-white font-black mb-2 flex items-center gap-2 drop-shadow-md">
            <FaVideo className="text-blue-400" /> {title}
          </h5>
          
          <div className="flex flex-wrap gap-3">
             <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                 <FaTrafficLight className="text-gray-300" />
                 <span className="text-white font-bold">{data?.total_vehicles || 0}</span>
                 <span className="text-gray-400 text-[10px] uppercase font-black tracking-widest">Total</span>
             </div>
             <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                 <FaCar className="text-gray-300" />
                 <span className="text-white font-bold">{data?.car_count || 0}</span>
             </div>
             <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                 <FaBus className="text-gray-300" />
                 <span className="text-white font-bold">{data?.bus_count || 0}</span>
             </div>
             <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                 <FaTruck className="text-gray-300" />
                 <span className="text-white font-bold">{data?.truck_count || 0}</span>
             </div>
             <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                 <FaMotorcycle className="text-gray-300" />
                 <span className="text-white font-bold">{data?.motorcycle_count || 0}</span>
             </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const LiveCCTVGrid = () => {
  const [liveData, setLiveData] = useState({});

  useEffect(() => {
    // We listen to the traffic_police collection where our modified python script writes
    const q = query(collection(db, "traffic_police"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let dataMap = {};
      snapshot.forEach(doc => {
        dataMap[doc.id] = doc.data();
      });
      setLiveData(dataMap);
    }, (error) => {
      console.error("LiveCCTVGrid FB Error:", error);
    });
    return () => unsubscribe();
  }, []);

  const cameras = [
    { id: "cam1_north", title: "North Direction", src: "/data/cam1.mp4" },
    { id: "cam2_south", title: "South Direction", src: "/data/cam2.mp4" },
    { id: "cam3_east", title: "East Direction", src: "/data/cam3.mp4" },
    { id: "cam4_west", title: "West Direction", src: "/data/cam4.mp4" }
  ];

  return (
    <div className="mb-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
            <span className="p-2bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">📹</span>
            Central Junction Live Feeds
          </h2>
          <p className="text-slate-500 font-medium">Real-time YOLOv11 + BoTSORT analysis overlay</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-blue-500 p-2 uppercase tracking-widest text-[10px] font-black">All Directions Active</Badge>
        </div>
      </div>
      <Row className="g-4">
        {cameras.map(cam => (
          <Col md={6} key={cam.id}>
            <CCTVGridItem 
               camId={cam.id} 
               title={cam.title} 
               sourceVideo={cam.src} 
               data={liveData[cam.id]} 
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default LiveCCTVGrid;
