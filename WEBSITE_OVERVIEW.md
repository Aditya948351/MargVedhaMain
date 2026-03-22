# 🚦 Marg Vedha – Traffic Optimization Platform
## Website Overview & Feature Documentation

> **Live URL:** https://traffic-optimization-1e1bd.web.app  
> **Repository:** https://github.com/Aditya948351/MargVedhaMain  
> **Stack:** React.js · React-Bootstrap · Recharts · Leaflet · Firebase Hosting

---

## 📐 Architecture Overview

```
YOLO Cameras → Flask Backend → Firebase/APIs
                                     ↓
                          React.js Officer Dashboard
                                     ↓
                     Reports · Map · Alerts · USP Panels
```

---

## 🗂️ Navigation Structure

The app uses **React Router** with a persistent sidebar layout. All routes are protected under an authenticated shell.

| Route | Page | Description |
|---|---|---|
| `/` or `/dashboard` | Dashboard | Main KPI command center |
| `/google-map` | Map Location | Interactive Leaflet traffic map |
| `/reports` | Reports | Analytics & historical charting |
| `/traffic-alerts` | Traffic Alerts | Live incident feed & reporting |
| `/settings` | Settings | Profile, notifications, appearance |
| `/profile` | Profile | Officer profile & metrics |
| `/camera-feeds` | Camera Feeds | Live CCTV/YOLO camera integration |
| `/admin-dashboard` | Admin Dashboard | Super-admin management panel |
| `/BusRouteOptimization` | Bus Route Priority | Officer USP panel |
| `/BlockChainTicketing` | Blockchain Audit | Officer USP panel |
| `/EmergencyAlerts` | Emergency Corridors | Officer USP panel |
| `/AutoFareAdjustments` | Dynamic Fares | Officer USP panel |

---

## 📱 Pages – Detailed Breakdown

### 1. 🏠 Dashboard (`/`)
The primary command center for traffic officers.

**Features:**
- Real-time **KPI cards** – active signals, congestion index, incidents, average speed
- **Traffic Flow Chart** – hourly vehicle density using `recharts` AreaChart
- **Signal Status Distribution** – Pie chart showing Green/Yellow/Red signal ratios
- **AI Recommendations Panel** – ML suggestions for route preemption
- **Quick nav cards** linking to all 4 USP screens
- **3D Simulation modal** – Blender-powered city simulation preview

---

### 2. 🗺️ Map Location (`/google-map`)
Interactive real-time signal map built with **react-leaflet**.

**Features:**
- Custom map markers per signal location with live status badges
- Sidebar panel to filter by signal status (Active / Warning / Down)
- Auto-centering on current city grid
- Popup detail card per marker (ID, location, wait time, status)

---

### 3. 📊 Reports (`/reports`)
Analytics hub for traffic data visualization.

**Features:**
- Tab navigation: **Overview · Peak Hours · Incidents · Signal Performance**
- Charts: Bar, Line, Area, Pie (all via `recharts`)
- Date-range filter for historical data
- Exportable summary cards with trend indicators
- Embedded mini-map using Leaflet

---

### 4. 🚨 Traffic Alerts (`/traffic-alerts`)
Live incident management and citizen report viewer.

**Features:**
- Two-column layout: Leaflet map (left) + incident list (right)
- Incident type badges: Accident · Roadblock · Signal Fault · Weather
- Severity filter (Critical / High / Medium / Low)
- **Report New Incident** modal with form validation
- Incident counter KPI cards by category
- Real-time alert feed with timestamps

---

### 5. ⚙️ Settings (`/settings`)
Multi-section settings panel styled as a vertical sidebar navigator.

**Sections:**
| Tab | Contents |
|---|---|
| Account | Profile info, email, password change |
| Notifications | Push alert toggles by category |
| Appearance | Light/dark theme toggle, font size |
| Language | Regional language selection |
| Help & Support | FAQs, contact, version info |

---

### 6. 👤 Profile (`/profile`)
Traffic officer personal dashboard with performance metrics.

**Features:**
- Officer card with photo, badge ID, assigned junction
- Live traffic count at assigned post
- Current duty status (On Duty / Off Duty)
- Reward points system
- Stats: Buses prioritized, shift hours logged, incidents cleared

---

## 🌟 USP Feature Screens (Officer-Only Control Panels)

These 4 screens are the **Unique Selling Propositions** of the platform — designed exclusively for traffic authority command centers.

---

### 🚌 Bus Route Prioritization (`/BusRouteOptimization`)

**Purpose:** Monitor AI-driven bus signal preemption and manually override corridors.

| Component | Detail |
|---|---|
| KPI Cards | Active Prioritized Buses, Delay Saved (hours), ML Confidence Score |
| Tactical Map | Live Leaflet map of prioritized transit corridors |
| Override Panel | Dropdown to select corridor + "Engage Forced Priority" toggle |
| Critical Node Tracker | Per-junction wait time with status badges (Nominal / High Priority / Critical) |
| Analytics Chart | AreaChart – Wait Time vs Traffic Density (last 3 hours) |

---

### 🔗 Transit Ticketing Audit (`/BlockChainTicketing`)

**Purpose:** Fraud prevention and decentralized ledger-based ticket audit for officers.

| Component | Detail |
|---|---|
| KPI Cards | Daily Validations, Network Node Status (12/12), Smart Contract Gas Fees |
| Live Ledger | Auto-refreshing table of blockchain transactions with hashed IDs |
| Transaction Status | Color-coded badges: Verified ✅ / Pending ⏳ / Rejected ❌ |
| Fraud Analytics Chart | BarChart – Validated Scans vs Fraudulent Attempts (weekly) |
| Network | Polygon PoS chain reference |

---

### 🚑 Emergency Corridors (`/EmergencyAlerts`)

**Purpose:** Highest-priority panel for clearing real-time emergency vehicle routes.

| Component | Detail |
|---|---|
| Master Override | Red "Freeze All Signals" button (Crisis Mode) with pulse animation |
| KPI Cards | AI ETA (6.2 mins avg, ↓42%), Active Preemption Count, Override Status |
| Dispatch Feed | Live alert cards per vehicle (Ambulance/Fire/Police) with route clear action |
| Tactical Map | Leaflet map showing active green corridors |
| Analytics Chart | AreaChart – Baseline ETA vs AI Preempted ETA compariso |

---

### 💰 Dynamic Congestion Fares (`/AutoFareAdjustments`)

**Purpose:** Allow authorities to monitor and freeze AI surge pricing during crises or events.

| Component | Detail |
|---|---|
| Global Freeze Toggle | "Freeze All Surge Pricing" yellow button → activates Crisis Mode |
| KPI Cards | City-wide Avg Multiplier, Congestion Reduction Estimate, System State |
| Zonal Control Table | Per-zone freeze/unfreeze toggles with current multiplier badges |
| Analytics Chart | LineChart – Traffic Density vs Fare Multiplier trend curves |
| Zone Colors | Red (>1.5x) / Yellow (1.0–1.5x) / Green (base fare) |

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React.js 18 |
| UI Library | React-Bootstrap 5 |
| Routing | React Router DOM v6 |
| Charts | Recharts |
| Maps | React-Leaflet + Leaflet.js |
| Icons | React-Icons (FontAwesome) |
| Auth & DB | Firebase Firestore |
| Hosting | Firebase Hosting |
| YOLO Backend | Flask + YOLOv11 (Python) |
| Simulation | Blender (3D city model) |

---

## 🔐 Auth Flow

- Firebase Authentication (Email/Password)
- Protected route wrapping via `PrivateRoute` in `App.js`
- Role-based access: Officer vs Admin (Admin Dashboard access gated)

---

## 📁 Source File Structure

```
src/
├── App.js                   # Root router + layout shell
├── index.css                # Global design tokens
├── components/
│   └── Sidebar.js           # Persistent nav sidebar
└── pages/
    ├── Dashboard.js
    ├── MapLocation.js
    ├── Reports.js
    ├── Alerts.js
    ├── Settings.js
    ├── Profile.js
    ├── CameraFeeds.js
    ├── AdminDashboard.js
    ├── BusRouteOptimization.js   ← USP
    ├── BlockChainTicketing.js    ← USP
    ├── EmergencyAlerts.js        ← USP
    └── AutoFareAdjustments.js    ← USP
```

---

## 📊 Firestore Collections (Seeded)

| Collection | Purpose |
|---|---|
| `signals` | Traffic signal metadata + live status |
| `incidents` | Reported incidents (type, location, severity) |
| `users` | Officer accounts |
| `analytics` | Aggregated traffic flow records |

---

## 🚀 Deployment

```bash
# Build
npm run build

# Deploy to Firebase
npx firebase-tools deploy --only hosting --project traffic-optimization-1e1bd
```

---

*Last updated: March 2026 | Version 0.2.0*
