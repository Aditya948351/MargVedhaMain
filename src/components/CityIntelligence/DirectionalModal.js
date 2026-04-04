import React from "react";
import { Modal, Row, Col, Badge } from "react-bootstrap";
import { FaArrowUp, FaArrowDown, FaArrowRight, FaArrowLeft, FaCar, FaClock, FaExclamationTriangle } from "react-icons/fa";

const getIcon = (dir) => {
    if(dir === 'N') return <FaArrowUp />;
    if(dir === 'S') return <FaArrowDown />;
    if(dir === 'E') return <FaArrowRight />;
    if(dir === 'W') return <FaArrowLeft />;
    return null;
};

const DirCard = ({ dir, data }) => (
    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 text-slate-200 dark:text-slate-700 text-7xl opacity-50 font-black rotate-12">
            {dir}
        </div>
        <h4 className="flex items-center gap-2 font-black text-slate-700 dark:text-slate-200 mb-2 relative z-10">
            {getIcon(dir)} {dir === 'N' ? 'North' : dir === 'S' ? 'South' : dir === 'E' ? 'East' : 'West'} Bound
        </h4>
        <div className="mb-3 relative z-10">
            <Badge bg={data.status === 'High' ? 'danger' : (data.status === 'Moderate' ? 'warning' : 'success')} 
                   className="text-uppercase border border-white border-opacity-10" 
                   style={{ fontSize: '0.65rem', padding: '0.4em 0.8em' }}>
                {data.status} Congestion
            </Badge>
        </div>
        <div className="space-y-3 relative z-10">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-3 py-2 rounded-xl shadow-sm">
                <span className="text-slate-500 text-sm font-semibold flex items-center gap-2"><FaCar/> Volume</span>
                <span className="font-bold text-slate-800 dark:text-white">{data.vehicle_count}</span>
            </div>
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-3 py-2 rounded-xl shadow-sm">
                <span className="text-slate-500 text-sm font-semibold flex items-center gap-2"><FaClock/> Wait Time</span>
                <span className="font-bold text-orange-500">{data.wait_time}s</span>
            </div>
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 px-3 py-2 rounded-xl shadow-sm">
                <span className="text-slate-500 text-sm font-semibold flex items-center gap-2"><FaExclamationTriangle/> Violations</span>
                <span className="font-bold text-red-500">{data.violations}</span>
            </div>
        </div>
    </div>
);

const DirectionalModal = ({ show, onHide, junction }) => {
    if(!junction) return null;

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="city-modal">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="font-black text-2xl flex items-center gap-3">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-lg">{junction.id}</span> 
                    Directional Telemetry
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-2">
                <div className="mb-4 flex gap-3">
                   <Badge bg={junction.congestion === 'red' ? 'danger' : (junction.congestion === 'yellow' ? 'warning' : 'success')} className="px-3 py-2 text-sm rounded-full">
                       {junction.congestion === 'red' ? 'CRITICAL CONGESTION' : (junction.congestion === 'yellow' ? 'MODERATE' : 'SMOOTH')}
                   </Badge>
                   <Badge bg="dark" className="px-3 py-2 text-sm rounded-full">Total: {junction.total_vehicles} Vehicles</Badge>
                </div>
                
                <Row className="g-3">
                    <Col md={6}><DirCard dir="N" data={junction.directions.N} /></Col>
                    <Col md={6}><DirCard dir="S" data={junction.directions.S} /></Col>
                    <Col md={6}><DirCard dir="E" data={junction.directions.E} /></Col>
                    <Col md={6}><DirCard dir="W" data={junction.directions.W} /></Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
};

export default DirectionalModal;
