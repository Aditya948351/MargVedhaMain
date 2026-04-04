import React from "react";
import { Badge } from "react-bootstrap";
import { FaBrain, FaChartLine, FaCheckCircle } from "react-icons/fa";

const AIInsightsPanel = ({ data }) => {
    return (
        <div className="space-y-4">
            
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-lg">
                <h6 className="text-indigo-200 font-bold mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                   <FaChartLine /> Predictive Forecasting (Next 5m)
                </h6>
                <p className="text-white font-medium mb-0">{data.next5Mins}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-20 text-4xl"><FaBrain /></div>
                <h6 className="text-indigo-200 font-bold mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                   <FaBrain /> Reinforcement Learning Engine
                </h6>
                <div className="flex items-start gap-2">
                    <Badge bg="primary" className="mt-1">ACTION TAKEN</Badge>
                    <p className="text-white font-medium mb-0 leading-tight">{data.rlDecision}</p>
                </div>
            </div>

            {data.greenAllocations && (
                <div className="pt-2">
                    <h6 className="text-indigo-300 font-bold text-xs uppercase tracking-wide mb-2 flex gap-2 items-center">
                        <FaCheckCircle/> Top Green Allocations
                    </h6>
                    <div className="flex gap-2 flex-wrap">
                        {Object.entries(data.greenAllocations).map(([j, dir]) => (
                            <Badge key={j} bg="success" className="px-2 py-1 flex items-center gap-1 shadow-sm">
                                {j} <FaArrowRight className="text-[10px] opacity-70"/> {dir}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Simple arrow component needed just here
const FaArrowRight = ({className}) => <svg className={className} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"></path></svg>;

export default AIInsightsPanel;
