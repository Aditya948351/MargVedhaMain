import React from "react";

const getStatusColor = (level) => {
    switch(level) {
        case 'red': return 'bg-red-500 border-red-400 shadow-red-500/50';
        case 'yellow': return 'bg-yellow-500 border-yellow-400 shadow-yellow-500/50';
        case 'green': return 'bg-emerald-500 border-emerald-400 shadow-emerald-500/50';
        default: return 'bg-gray-500 border-gray-400';
    }
};

const JunctionGrid = ({ junctions, onJunctionClick }) => {
    const jList = Object.values(junctions).sort((a,b) => parseInt(a.id.slice(1)) - parseInt(b.id.slice(1)));
    
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {jList.map(j => (
                <div 
                   key={j.id} 
                   onClick={() => onJunctionClick(j.id)}
                   className={`cursor-pointer rounded-xl p-3 border-2 transition-all hover:scale-105 shadow-md ${getStatusColor(j.congestion)} text-white relative overflow-hidden`}
                >
                    <div className="absolute -right-2 -top-2 opacity-20 text-5xl font-black">{j.id}</div>
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <span className="font-black text-lg">{j.id}</span>
                        <div className={`text-[10px] font-bold px-2 py-1 rounded bg-white/20 backdrop-blur-sm shadow`}>
                            {j.signal_status}
                        </div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-xs opacity-90 uppercase font-semibold tracking-wider">Vehicles</div>
                        <div className="text-2xl font-black">{j.total_vehicles}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default JunctionGrid;
