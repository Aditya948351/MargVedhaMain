import React from "react";
import { Badge } from "react-bootstrap";
import { FaExclamationCircle, FaHardHat } from "react-icons/fa";

const IncidentPanel = ({ incidents }) => {
    if (!incidents || incidents.length === 0) {
        return <div className="text-slate-500 font-semibold p-4 text-center">No active incidents detected.</div>;
    }

    return (
        <div className="space-y-3">
            {incidents.map((incident) => (
                <div key={incident.id} className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded-r-xl shadow-sm flex items-start gap-3">
                    <div className="mt-1 text-red-500 text-lg">
                        {incident.type === 'Accident' ? <FaExclamationCircle /> : <FaHardHat />}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{incident.type} Detected</span>
                            <Badge bg={incident.severity === 'High' ? 'danger' : 'warning'}>{incident.severity}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-0 font-medium">
                            Location: Affected junction <span className="font-bold text-red-500 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded">{incident.junction}</span>
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default IncidentPanel;
