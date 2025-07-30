import React, 'react';

// This is the Traffic Simulation component.
// All the logic from the original HTML file is encapsulated here.
const TrafficSimulation = () => {
    // useRef is used to get a direct reference to the canvas DOM element.
    const canvasRef = React.useRef(null);

    // useEffect runs after the component mounts, similar to window.onload.
    // The empty dependency array [] ensures it only runs once.
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return; // Exit if canvas is not yet available

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // --- Simulation Logic ---
        // The following code is adapted from the original HTML canvas script.

        // Make the canvas responsive
        const resizeCanvas = () => {
            const container = canvas.parentElement;
            const size = Math.min(container.clientWidth, window.innerHeight * 0.7) * 0.9;
            canvas.width = size;
            canvas.height = size;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas(); // Initial size

        const roadWidth = canvas.width * 0.1;
        const intersectionSize = roadWidth * 1.5;

        let vehicles = [];
        let trafficLights = {};
        let lightCycle = { phase: 0, time: 0 }; // 0: N/S green, 1: E/W green

        const VEHICLE_TYPES = {
            CAR: { color: '#95a5a6', width: roadWidth * 0.2, height: roadWidth * 0.4 },
            BUS: { color: '#e67e22', width: roadWidth * 0.25, height: roadWidth * 0.8 },
        };

        // Sets up the initial state of the simulation
        function setup() {
            const lightPositions = {
                S: { x: canvas.width / 2 + intersectionSize / 2, y: canvas.height / 2 - intersectionSize / 2 },
                N: { x: canvas.width / 2 - intersectionSize / 2, y: canvas.height / 2 + intersectionSize / 2 },
                E: { x: canvas.width / 2 - intersectionSize / 2, y: canvas.height / 2 - intersectionSize / 2 },
                W: { x: canvas.width / 2 + intersectionSize / 2, y: canvas.height / 2 + intersectionSize / 2 }
            };
            for (const dir in lightPositions) {
                trafficLights[dir] = {
                    x: lightPositions[dir].x,
                    y: lightPositions[dir].y,
                    state: 'RED'
                };
            }
            setLightState('N', 'GREEN');
            setLightState('S', 'GREEN');
        }

        // Creates a new vehicle with a given type and origin direction
        function createVehicle(type, origin) {
            const vehicleData = VEHICLE_TYPES[type];
            const laneOffset = roadWidth / 4;
            let x, y, vx, vy, width, height;

            switch (origin) {
                case 'N':
                    x = canvas.width / 2 + laneOffset; y = -vehicleData.height;
                    vx = 0; vy = 1;
                    width = vehicleData.width; height = vehicleData.height;
                    break;
                case 'S':
                    x = canvas.width / 2 - laneOffset; y = canvas.height + vehicleData.height;
                    vx = 0; vy = -1;
                    width = vehicleData.width; height = vehicleData.height;
                    break;
                case 'E':
                    x = canvas.width + vehicleData.height; y = canvas.height / 2 + laneOffset;
                    vx = -1; vy = 0;
                    width = vehicleData.height; height = vehicleData.width;
                    break;
                case 'W':
                    x = -vehicleData.height; y = canvas.height / 2 - laneOffset;
                    vx = 1; vy = 0;
                    width = vehicleData.height; height = vehicleData.width;
                    break;
            }

            vehicles.push({
                x, y, vx, vy, width, height,
                color: vehicleData.color,
                origin: origin,
                speed: (Math.random() * 0.5 + 1) * (canvas.width / 500)
            });
        }

        // Manages the traffic light state changes over time
        function handleTrafficLights(deltaTime) {
            lightCycle.time += deltaTime;
            const greenDuration = 12;

            if (lightCycle.phase === 0) { // N/S Green
                if (lightCycle.time > greenDuration) {
                    setLightState('N', 'RED'); setLightState('S', 'RED');
                    setLightState('E', 'GREEN'); setLightState('W', 'GREEN');
                    lightCycle.phase = 1;
                    lightCycle.time = 0;
                }
            } else { // E/W Green
                if (lightCycle.time > greenDuration) {
                    setLightState('E', 'RED'); setLightState('W', 'RED');
                    setLightState('N', 'GREEN'); setLightState('S', 'GREEN');
                    lightCycle.phase = 0;
                    lightCycle.time = 0;
                }
            }
        }

        function setLightState(dir, state) {
            if (trafficLights[dir]) {
                trafficLights[dir].state = state;
            }
        }

        // Updates the position and state of all vehicles
        function updateVehicles() {
            if (Math.random() < 0.05 && vehicles.length < 50) {
                const origins = ['N', 'S', 'E', 'W'];
                const types = ['CAR', 'CAR', 'CAR', 'BUS'];
                createVehicle(
                    types[Math.floor(Math.random() * types.length)],
                    origins[Math.floor(Math.random() * origins.length)]
                );
            }

            vehicles.forEach((v, i) => {
                let canProceed = true;
                const stopDist = intersectionSize * 0.7;

                // Check traffic light
                if (v.origin === 'N' && v.y > canvas.height / 2 - stopDist - v.height && v.y < canvas.height / 2) {
                    if (trafficLights.N.state !== 'GREEN') canProceed = false;
                } else if (v.origin === 'S' && v.y < canvas.height / 2 + stopDist + v.height && v.y > canvas.height / 2) {
                    if (trafficLights.S.state !== 'GREEN') canProceed = false;
                } else if (v.origin === 'E' && v.x < canvas.width / 2 + stopDist + v.width && v.x > canvas.width / 2) {
                    if (trafficLights.E.state !== 'GREEN') canProceed = false;
                } else if (v.origin === 'W' && v.x > canvas.width / 2 - stopDist - v.width && v.x < canvas.width / 2) {
                    if (trafficLights.W.state !== 'GREEN') canProceed = false;
                }

                // Collision Avoidance
                for (let other of vehicles) {
                    if (v === other) continue;
                    const dist = Math.hypot(v.x - other.x, v.y - other.y);
                    const safetyBuffer = ((v.vy !== 0) ? v.height : v.width) * 2.5;

                    if (dist < safetyBuffer) {
                        let isAhead = false;
                        if (v.origin === other.origin) {
                            if (v.vy > 0 && other.y > v.y) isAhead = true;
                            if (v.vy < 0 && other.y < v.y) isAhead = true;
                            if (v.vx > 0 && other.x > v.x) isAhead = true;
                            if (v.vx < 0 && other.x < v.x) isAhead = true;
                        }
                        if (isAhead) {
                            canProceed = false;
                            break;
                        }
                    }
                }

                if (canProceed) {
                    v.x += v.vx * v.speed;
                    v.y += v.vy * v.speed;
                }

                if (v.x < -v.width*2 || v.x > canvas.width + v.width*2 || v.y < -v.height*2 || v.y > canvas.height + v.height*2) {
                    vehicles.splice(i, 1);
                }
            });
        }

        // Draws everything on the canvas
        function draw() {
            // Clear canvas
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw roads
            ctx.fillStyle = '#34495e';
            ctx.fillRect(canvas.width / 2 - roadWidth / 2, 0, roadWidth, canvas.height);
            ctx.fillRect(0, canvas.height / 2 - roadWidth / 2, canvas.width, roadWidth);

            // Draw road markings
            ctx.strokeStyle = 'rgba(236, 240, 241, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 15]);
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw vehicles
            vehicles.forEach(v => {
                ctx.fillStyle = v.color;
                ctx.fillRect(v.x - v.width / 2, v.y - v.height / 2, v.width, v.height);
            });

            // Draw traffic lights
            for (const dir in trafficLights) {
                const light = trafficLights[dir];
                ctx.fillStyle = light.state === 'GREEN' ? '#2ecc71' : '#e74c3c';
                ctx.beginPath();
                ctx.arc(light.x, light.y, roadWidth * 0.1, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // The main animation loop
        let lastTime = 0;
        function animate(timestamp) {
            const deltaTime = (timestamp - (lastTime || timestamp)) / 1000;
            lastTime = timestamp;

            handleTrafficLights(deltaTime);
            updateVehicles();
            draw();

            animationFrameId = requestAnimationFrame(animate);
        }

        // --- Initialization ---
        setup();
        animate(0);

        // Cleanup function to be run when the component unmounts
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []); // Empty array means this effect runs only once on mount

    return (
        <div className="flex justify-center mt-4">
            <canvas 
                ref={canvasRef} 
                className="shadow-lg border-2 border-gray-300 rounded-lg bg-gray-800"
                // Initial size, will be overwritten by JS
                style={{ maxWidth: "800px", width: "100%" }}
            />
        </div>
    );
};


// This is your main page component, now using the TrafficSimulation
const LiveFeed = () => {
  return (
    <div className="bg-gray-700 text-white min-h-screen">
        <div className="container mx-auto text-center p-4">
            <h1 className="text-4xl font-bold mb-2">🚦 Live Traffic Simulation</h1>
            <p className="text-lg text-gray-300">A 2D environment simulating vehicle flow and traffic light systems.</p>

            {/* The canvas simulation is rendered here */}
            <TrafficSimulation />
            
        </div>
    </div>
  );
};

// To make this a runnable app, we export a default App component
export default function App() {
    return <LiveFeed />;
}
