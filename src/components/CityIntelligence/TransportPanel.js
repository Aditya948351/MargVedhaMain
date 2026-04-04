import React from "react";
import { Badge } from "react-bootstrap";
import { FaBus, FaTaxi } from "react-icons/fa";

const TransportPanel = ({ data }) => {
    return (
        <div className="space-y-3">
            {data.map((item, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg text-white ${item.type === 'Bus' ? 'bg-blue-500' : 'bg-yellow-500'}`}>
                            {item.type === 'Bus' ? <FaBus /> : <FaTaxi />}
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">{item.route || "Auto Rickshaw Network"}</div>
                            <div className="text-xs text-slate-500 font-semibold">
                                {item.type === 'Bus' ? `Avg Speed: ${item.speed_kmh} km/h` : `Demand Level: ${item.demand}`}
                            </div>
                        </div>
                    </div>
                    <div>
                        {item.type === 'Bus' ? (
                            <Badge bg={item.delay_mins > 5 ? 'danger' : 'success'} className="px-2 py-1 rounded-full text-xs">
                                {item.delay_mins > 0 ? `${item.delay_mins}m Delay` : 'On Time'}
                            </Badge>
                        ) : (
                            <Badge bg="warning" className="px-2 py-1 text-black font-bold rounded-full text-xs box-shadow">
                                {item.dynamic_fare_multiplier}x Surge
                            </Badge>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TransportPanel;
