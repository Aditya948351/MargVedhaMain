import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

const NetworkView = ({ data }) => {
    // Sort data for better visualization
    const sortedData = [...data].sort((a,b) => b.congestionScore - a.congestionScore);
    const topCongested = sortedData[0];
    const leastCongested = sortedData[sortedData.length - 1];

    const avg = data.reduce((acc, curr) => acc + curr.congestionScore, 0) / (data.length || 1);

    return (
        <div className="w-full">
            <div className="flex gap-4 mb-4 mt-2">
                <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-200 shadow-sm flex-1">
                    <div className="text-xs font-bold uppercase tracking-widest opacity-80">Highest Congestion</div>
                    <div className="font-black text-xl flex justify-between">
                        {topCongested?.name} <span>{topCongested?.congestionScore} Veh/hr</span>
                    </div>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200 shadow-sm flex-1">
                    <div className="text-xs font-bold uppercase tracking-widest opacity-80">Lowest Congestion</div>
                    <div className="font-black text-xl flex justify-between">
                        {leastCongested?.name} <span>{leastCongested?.congestionScore} Veh/hr</span>
                    </div>
                </div>
            </div>

            <div style={{ height: "300px", width: "100%" }}>
                <ResponsiveContainer>
                    <BarChart data={sortedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        />
                        <ReferenceLine y={avg} stroke="#cbd5e1" strokeDasharray="3 3" />
                        <Bar dataKey="congestionScore" radius={[4, 4, 0, 0]}>
                            {sortedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.congestionScore > avg * 1.2 ? '#ef4444' : (entry.congestionScore > avg ? '#f59e0b' : '#10b981')} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="text-center text-xs text-slate-400 mt-2 font-semibold">
                Dashed line indicates network average ({Math.round(avg)}). Colors represent congestion severity.
            </div>
        </div>
    );
};

export default NetworkView;
