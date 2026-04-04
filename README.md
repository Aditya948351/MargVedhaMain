# 🚦 Marg Vedha 3.0 – Smart City Traffic Intelligence & Ecosystem Operations

> **Official Technical Specification & System Architecture Document**  
> *Prepared for Copyright, Documentation, and Scaling Reference.*

---

## 📌 1. Problem Statement
Urban metropolises in India—specifically emerging smart cities like Nashik—face cascading traffic congestion resulting in exponential fuel wastage, skyrocketing CO₂ emissions, critically delayed emergency services, and unpredictable public transit schedules. 

Traditional signal timing is rigid and incapable of handling anomalous flow (festivals, accidents, parking bottlenecks). A hyper-dynamic, **Agentic AI-driven traffic intelligence system** is required to fuse micro-level computer vision data with macro-level urban economic policies.

---

## 💡 2. The Marg Vedha Solution
Marg Vedha is not just a traffic counter; it is a **complete Unified Urban Operations Platform**. By integrating computer vision (YOLOv11), Reinforcement Learning (Q-Learning), predictive machine learning, and citizen feedback loops, we dynamically operate and optimize the entirety of a city's intersection grid in real time.

### 🔑 Core Innovations
- **Vision-Based Intelligence:** Lane-wise multi-class vehicle profiling, helmet violation detection, wrong-way detection, and signal jump analysis using **YOLOv11 + BoT-SORT**.
- **Agentic AI Signal Control:** Adaptive RL algorithms (Q-Learning) continuously calculating the optimal Reward vs. Queue Delay to distribute green lights proactively across networks.
- **Economic & Transit Integration:** Dynamic calculation of auto-rickshaw fare surges (Demand/Supply ratios) and real-time Bus Route tracking algorithms to prioritize public transit over private congestion.
- **Environmental & Pedestrian Fairness:** Active tracking of CO₂ footprint reductions and pedestrian crossing delays to ensure equitable urban flow.
- **Central Authority Command:** A localized Web Dashboard enabling City Police and Administrators to visualize the entire grid simultaneously.

---

## 🏗️ 3. Software Architecture & Tech Stack

### AI & Machine Learning Pipeline
- **Object Detection & Tracking:** YOLOv11, BoT-SORT
- **Predictive Analytics & RL:** PyTorch, Q-Learning Decision Nodes, Random Forest for Traffic Patterns

### Backend & Infrastructure
- **Core Engine:** Python (Multi-threaded Data Simulation & Ingestion pipeline)
- **Database / Sync:** Google Cloud Firebase (Firestore Realtime listeners)
- **Geospatial Processing:** ISRO Bhuvan APIs

### Frontend & Application Layer
- **Control Dashboard:** React.js, TailwindCSS, Bootstrap, Recharts (for fluid real-time telemetry rendering without page-loads, parsing JSON streams directly).
- **Visualization:** Three.js for 3D junction previews.
- **Citizen Interface:** Kotlin-based Android applications capturing crowdsourced anomaly reports.

---

## 📊 4. The 20-Node Data Schema (The "Nashik Grid" Model)
To support infinite scalability, Marg Vedha normalizes urban data into **20 discrete, interconnected database models/CSVs**, constantly bound by `timestamp`, `junction_id`, and `direction`. The model was built and simulated upon 20 major Nashik intersections (e.g., CBS, Dwarka, ITI, Meher, Mumbai Naka, Ashok Stambh).

### A. Core Telemetry & Geography
1. `road_infrastructure.csv` (Physical Reality): Lanes, width, bus-lane availability, pedestrian bounds.
2. `route_mapping.csv` (Network Graph): Distance, travel time, road conditions.
3. `junction_direction_data.csv` (Live Traffic): High-granularity state of Q-Length, count, max wait, and violations (Signal Jump, Helmet, Wrong Way).
4. `junction_overview.csv` (Junction Totals): Aggregate intersection health.
5. `network_data.csv` (Macro Flow): Congestion index comparing neighboring junctions.

### B. Urban Dynamics & Transport
6. `transport_data.csv` (Bus/Auto System): Tracking bus delays, priority flags, and auto-rickshaw density loops.
7. `fare_policy.csv` (Economics): Adjusting dynamic fares based on geographic congestion multipliers.
8. `incident_data.csv` (Anomalies): Accidents, clearance times, lane blocks.
9. `event_data.csv` (Real-World Chaos): Festivals, rallies, matches dynamically throwing variables into the traffic net.
10. `parking_data.csv`: Quantifying illegal unorganized parking and its direct chokehold on transit lanes. 
11. `pedestrian_data.csv`: Volumes and wait-time limits to force signal fairness.

### C. Artificial Intelligence & Algorithms
12. `ml_predictions.csv` (Forecasting): Predicted queueing over the next 5-, 10-, and 30-minute intervals.
13. `rl_decisions.csv` (Agent Actions): State, Action, Q-Value, and exact Green Time split distribution across N/S/E/W.
14. `traffic_history.csv` (Training Ground): Historical time-series mapping for offline model tuning.

### D. Governance & System Health
15. `violation_log.csv` (Enforcement): Real-time e-Challan logging mechanisms.
16. `environment_data.csv` (Visibility): Rain, fog, or school zone speed limits altering ML logic.
17. `fuel_emission_data.csv` (Sustainability tracking): Idle-time reduction converting directly to CO₂ saved.
18. `user_feedback.csv`: Real-world input routed from the Kotlin Citizen App.
19. `system_logs.csv`: Component latency, crash rates.
20. `simulation_config.csv`: Base settings for demonstration controllers and sandbox variables.

---

## 💻 5. User Roles & Interfaces
The platform segregates data presentation intuitively based on the targeted stakeholder:

1. **City Administrators / Mayors:** Access to the macro **Network View**, observing cross-junction comparisons (`NetworkView`), Environmental impact, and Economic policies (`FarePolicy`).
2. **Traffic Police HQ:** Access to the **Live CCTV Grid**, receiving active overlays, instant `incident_data` alerts, and exact violation logs.
3. **Local Junction Officers:** Access to the **Directional Modal View**, pinpointing exactly which bounded direction (North, South, East, West) is generating a gridlock.
4. **Citizens (App):** Push notifications for Green Corridors, live Public Transport tracking, and localized issue ticketing.

---

## 📈 6. Target Impact & ROI
- **74% Improvement in Operational Flow:** Backed by simulated agentic optimizations smoothing stop-and-go waves.
- **Carbon Offsetting:** Decreasing intersection idle time drastically lowers urban CO₂ emissions.
- **Smart Policing:** AI-based tracking replaces manual violation spotting, increasing e-Challan efficiency and public compliance.
- **Scalability:** The 20-Schema setup utilizes generic IDs (`J1`, `J2`), meaning MargVedha can map 50 or 5,000 intersections flawlessly without architectural alterations.

---

## 🌐 7. Quick Links
- **Website/Portal:** [Marg Vedha Live](https://nocopymarg-vedha.vercel.app/)  
- **Documentation/Repos:** 
  - [3D Traffic Simulation](https://github.com/Aditya948351/3D-Traffic-Simulation)
  - [Main Hub](https://github.com/Aditya948351/MargVedhaMain)
- **Interactive ML Previews:** [Marg Vedha AI HuggingFace](https://huggingface.co/spaces/starkbyte45896/Marg-Vedha)

---

## 👨‍💻 Team – Marg Vedha 3.0
Built for scale, speed, and safety.
- **Aditya** – Lead ML Architecture & Android Engineering
- *Supported by a cross-functional team across Full-Stack Web, CV Modeling, and Urban Systems Planning.*
