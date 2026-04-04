#!/usr/bin/env python3
"""
MargVedha Traffic Simulation API v2.0
=====================================
Full Smart City simulation engine. Dynamically updates:
  - 20 junction traffic counts
  - 5 bus route ETAs
  - AI route suggestions (Dijkstra)
  - Live incidents (accidents, construction, VIP)
  - Enforcement violations (helmet, signal jump, wrong way)
  - Signal override reading (admin writes from website)
  - Green corridor support (ambulance detection)

Flask endpoints:
  GET  /           → status page
  POST /start      → start the simulation loop (called by website button)
  GET  /api/status → current simulation state

Usage:
  pip install firebase-admin flask flask-cors
  python traffic_simulation_api.py
"""

import firebase_admin
from firebase_admin import credentials, firestore
import random
import time
import math
import datetime
import threading
import uuid
from flask import Flask, jsonify, request
from flask_cors import CORS

# ── Flask App ─────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# ── Firebase init ─────────────────────────────────────────────────────────────
cred = credentials.Certificate("firebase-adminsdk.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# ── Simulation state ──────────────────────────────────────────────────────────
sim_running = False
sim_cycle = 0

# ── 20 Nashik Junctions ──────────────────────────────────────────────────────
JUNCTIONS = [
    {"id": "cbs_circle",         "name": "CBS Circle",         "lat": 19.9975, "lng": 73.7898, "neighbours": ["bytco_point","ashok_stambh","lekha_nagar","upnagar"],       "base": 35},
    {"id": "nashik_road",        "name": "Nashik Road",        "lat": 20.0060, "lng": 73.7720, "neighbours": ["makhmalabad_naka","dwarka_circle","shalimar"],              "base": 28},
    {"id": "gangapur_road",      "name": "Gangapur Road",      "lat": 19.9850, "lng": 73.7900, "neighbours": ["trimbak_naka","indiranagar","untwadi"],                     "base": 22},
    {"id": "dwarka_circle",      "name": "Dwarka Circle",      "lat": 20.0010, "lng": 73.7770, "neighbours": ["nashik_road","rajiv_gandhi_bhavan","shalimar"],             "base": 30},
    {"id": "rajiv_gandhi_bhavan","name": "Rajiv Gandhi Bhavan","lat": 19.9910, "lng": 73.7840, "neighbours": ["dwarka_circle","college_road","ashok_stambh"],              "base": 25},
    {"id": "college_road",       "name": "College Road",       "lat": 19.9990, "lng": 73.7860, "neighbours": ["rajiv_gandhi_bhavan","upnagar","cbs_circle"],               "base": 20},
    {"id": "mumbai_naka",        "name": "Mumbai Naka",        "lat": 19.9930, "lng": 73.8020, "neighbours": ["lekha_nagar","pathardi_phata","bytco_point"],               "base": 45},
    {"id": "ashok_stambh",       "name": "Ashok Stambh",       "lat": 19.9960, "lng": 73.7840, "neighbours": ["cbs_circle","rajiv_gandhi_bhavan","bytco_point"],           "base": 32},
    {"id": "shalimar",           "name": "Shalimar",           "lat": 20.0040, "lng": 73.7810, "neighbours": ["nashik_road","dwarka_circle","upnagar"],                    "base": 18},
    {"id": "bytco_point",        "name": "Bytco Point",        "lat": 19.9950, "lng": 73.7870, "neighbours": ["cbs_circle","ashok_stambh","mumbai_naka"],                  "base": 27},
    {"id": "pathardi_phata",     "name": "Pathardi Phata",     "lat": 20.0120, "lng": 73.7980, "neighbours": ["mumbai_naka","ambad_link_road","satpur_midc"],              "base": 40},
    {"id": "ambad_link_road",    "name": "Ambad Link Road",    "lat": 20.0090, "lng": 73.7940, "neighbours": ["pathardi_phata","satpur_midc"],                             "base": 22},
    {"id": "satpur_midc",        "name": "Satpur MIDC",        "lat": 20.0000, "lng": 73.7650, "neighbours": ["ambad_link_road","makhmalabad_naka","nashik_road"],         "base": 15},
    {"id": "trimbak_naka",       "name": "Trimbak Naka",       "lat": 19.9820, "lng": 73.7780, "neighbours": ["gangapur_road","panchavati","indiranagar"],                 "base": 19},
    {"id": "lekha_nagar",        "name": "Lekha Nagar",        "lat": 19.9970, "lng": 73.7950, "neighbours": ["cbs_circle","mumbai_naka"],                                 "base": 24},
    {"id": "upnagar",            "name": "Upnagar",            "lat": 20.0030, "lng": 73.7880, "neighbours": ["cbs_circle","college_road","shalimar"],                     "base": 21},
    {"id": "indiranagar",        "name": "Indiranagar",        "lat": 19.9900, "lng": 73.7810, "neighbours": ["gangapur_road","trimbak_naka","untwadi"],                   "base": 16},
    {"id": "untwadi",            "name": "Untwadi",            "lat": 19.9940, "lng": 73.7760, "neighbours": ["gangapur_road","indiranagar","cbs_circle"],                 "base": 14},
    {"id": "makhmalabad_naka",   "name": "Makhmalabad Naka",   "lat": 20.0080, "lng": 73.7700, "neighbours": ["nashik_road","satpur_midc","shalimar"],                     "base": 12},
    {"id": "panchavati",         "name": "Panchavati",         "lat": 20.0020, "lng": 73.7920, "neighbours": ["trimbak_naka","cbs_circle","upnagar"],                      "base": 29},
]

BUS_ROUTES = [
    {"route_id": "N-1",  "name": "CBS ↔ Nashik Road",         "stops": ["cbs_circle","ashok_stambh","shalimar","nashik_road"],           "base_eta_min": 22},
    {"route_id": "N-4",  "name": "Panchavati ↔ Mumbai Naka",  "stops": ["panchavati","cbs_circle","lekha_nagar","mumbai_naka"],          "base_eta_min": 35},
    {"route_id": "N-7",  "name": "Gangapur ↔ Bytco",          "stops": ["gangapur_road","untwadi","cbs_circle","bytco_point"],           "base_eta_min": 28},
    {"route_id": "N-12", "name": "Satpur MIDC ↔ Dwarka",      "stops": ["satpur_midc","ambad_link_road","pathardi_phata","dwarka_circle"],"base_eta_min": 40},
    {"route_id": "N-17", "name": "Trimbak ↔ College Road",    "stops": ["trimbak_naka","indiranagar","gangapur_road","college_road"],    "base_eta_min": 30},
]

INCIDENT_TYPES = [
    {"type": "accident", "severity": "High", "desc": "Vehicle collision reported"},
    {"type": "construction", "severity": "Medium", "desc": "Road construction underway"},
    {"type": "vip_movement", "severity": "Low", "desc": "VIP convoy movement"},
    {"type": "waterlogging", "severity": "Medium", "desc": "Waterlogging due to heavy rain"},
    {"type": "road_block", "severity": "High", "desc": "Road blocked by fallen tree"},
]

VIOLATION_TYPES = ["Helmet Missing", "Signal Jump", "Wrong Way Driving", "Overspeeding", "Triple Riding"]


def simulate_traffic(base, hour):
    if 8 <= hour < 10:
        multiplier = random.uniform(1.6, 2.2)
    elif 17 <= hour < 20:
        multiplier = random.uniform(1.8, 2.5)
    elif 13 <= hour < 14:
        multiplier = random.uniform(1.2, 1.5)
    elif 0 <= hour < 5:
        multiplier = random.uniform(0.05, 0.15)
    else:
        multiplier = random.uniform(0.6, 1.0)
    noise = random.gauss(0, 3)
    return max(0, round(base * multiplier + noise))


def find_route(from_id, to_id, traffic_map):
    import heapq
    adj = {j["id"]: j["neighbours"] for j in JUNCTIONS}
    dist = {j["id"]: float("inf") for j in JUNCTIONS}
    prev = {}
    dist[from_id] = 0
    pq = [(0, from_id)]
    while pq:
        d, node = heapq.heappop(pq)
        if d > dist[node]:
            continue
        for nb in adj.get(node, []):
            w = 1 + (traffic_map.get(nb, 0) / 10.0)
            nd = d + w
            if nd < dist[nb]:
                dist[nb] = nd
                prev[nb] = node
                heapq.heappush(pq, (nd, nb))
    path = []
    cur = to_id
    while cur in prev:
        path.append(cur)
        cur = prev[cur]
    path.append(from_id)
    return list(reversed(path))


def compute_bus_eta(route, traffic_map):
    total_traffic = sum(traffic_map.get(s, 0) for s in route["stops"])
    delay_min = (total_traffic / 10.0) * 0.5
    eta = round(route["base_eta_min"] + delay_min)
    congestion_level = "Heavy" if total_traffic > 100 else "Moderate" if total_traffic > 40 else "Clear"
    return {
        "route_id": route["route_id"],
        "route_name": route["name"],
        "stops": route["stops"],
        "eta_minutes": eta,
        "congestion": congestion_level,
        "total_vehicle_load": total_traffic,
        "updated_at": datetime.datetime.utcnow().isoformat()
    }


def get_traffic_status(count):
    if count > 25: return "High"
    if count > 12: return "Moderate"
    return "Low"


def push_update(traffic_map, hour):
    global sim_cycle
    batch = db.batch()
    now_iso = datetime.datetime.utcnow().isoformat()

    # ── 1. Fetch Global Green Corridor ────────────────────────────────────────
    corridor_active = False
    active_path = []
    try:
        corr_doc = db.collection("settings").document("green_corridor").get()
        if corr_doc.exists:
            corr_data = corr_doc.to_dict()
            if corr_data.get("active"):
                corridor_active = True
                active_path = find_route(corr_data["start_id"], corr_data["end_id"], traffic_map)
    except: pass

    # ── 2. Junction traffic ───────────────────────────────────────────────────
    for junc in JUNCTIONS:
        count = traffic_map[junc["id"]]

        # Check if individual admin has overridden the signal (fallback)
        try:
            doc = db.collection("junctions").document(junc["id"]).get()
            if doc.exists:
                existing = doc.to_dict()
                signal_override = existing.get("signal_override", "AUTO")
            else:
                signal_override = "AUTO"
        except:
            signal_override = "AUTO"

        # Determine signal phase
        if corridor_active and junc["id"] in active_path:
            # Smart clearing: decide side based on next junction in path
            idx = active_path.index(junc["id"])
            if idx < len(active_path) - 1:
                # Simple logic for now: all-green if part of corridor
                signal_phase = "GREEN_ALL" 
            else:
                signal_phase = "GREEN_ALL"  # Goal reached
        elif signal_override != "AUTO":
            signal_phase = signal_override  # Admin manual override
        else:
            signal_phase = random.choice(["GREEN_NS", "GREEN_EW"])

        n_count = round(count * random.uniform(0.20, 0.30))
        s_count = round(count * random.uniform(0.20, 0.30))
        e_count = round(count * random.uniform(0.20, 0.30))
        w_count = round(count * random.uniform(0.15, 0.25))

        ref = db.collection("junctions").document(junc["id"])
        batch.set(ref, {
            "location": junc["name"],
            "junction_id": junc["id"],
            "lat": junc["lat"],
            "lng": junc["lng"],
            "total_vehicles": count,
            "north": n_count,
            "south": s_count,
            "east":  e_count,
            "west":  w_count,
            "n_status": get_traffic_status(n_count),
            "s_status": get_traffic_status(s_count),
            "e_status": get_traffic_status(e_count),
            "w_status": get_traffic_status(w_count),
            "congestion_level": get_traffic_status(count),
            "signal_phase": signal_phase,
            "signal_override": signal_override,
            "green_corridor_active": corridor_active and junc["id"] in active_path,
            "updated_at": now_iso,
            "hour": hour,
        }, merge=True)

    # ── 2. Bus route ETAs ─────────────────────────────────────────────────────
    for route in BUS_ROUTES:
        eta_data = compute_bus_eta(route, traffic_map)
        ref = db.collection("bus_routes").document(route["route_id"])
        batch.set(ref, eta_data, merge=True)

    # ── 3. AI route suggestion ────────────────────────────────────────────────
    route_path = find_route("cbs_circle", "mumbai_naka", traffic_map)
    path_names = [next(j["name"] for j in JUNCTIONS if j["id"] == r) for r in route_path]
    total_on_path = sum(traffic_map.get(r, 0) for r in route_path)
    suggestion_ref = db.collection("route_suggestions").document("ai_suggested")
    batch.set(suggestion_ref, {
        "from": "CBS Circle", "to": "Mumbai Naka",
        "path": path_names, "path_ids": route_path,
        "total_vehicles": total_on_path,
        "recommendation": (
            f"⚠️ Heavy traffic ({total_on_path} vehicles). Take alternate via {path_names[1] if len(path_names)>1 else 'bypass'}. ETA: ~{30 + total_on_path // 5}m."
            if total_on_path > 80 else
            f"🟡 Moderate ({total_on_path} vehicles). Via {' → '.join(path_names)}. ETA: ~{15 + total_on_path // 8}m."
            if total_on_path > 30 else
            f"🟢 Clear route. Via {' → '.join(path_names)}. ETA: ~12m."
        ),
        "updated_at": now_iso
    }, merge=True)

    batch.commit()

    # ── 4. Incidents (separate batch — randomly create/clear) ─────────────────
    if sim_cycle % 3 == 0:  # Every 3rd cycle (~90 seconds)
        inc_batch = db.batch()
        # Clear old incidents
        for junc in random.sample(JUNCTIONS, min(3, len(JUNCTIONS))):
            ref = db.collection("incidents").document(f"inc_{junc['id']}")
            inc_batch.set(ref, {"active": False, "updated_at": now_iso}, merge=True)

        # Create new random incidents (2-4 active at a time)
        for junc in random.sample(JUNCTIONS, random.randint(2, 4)):
            inc_type = random.choice(INCIDENT_TYPES)
            ref = db.collection("incidents").document(f"inc_{junc['id']}")
            inc_batch.set(ref, {
                "junction_id": junc["id"],
                "junction_name": junc["name"],
                "type": inc_type["type"],
                "severity": inc_type["severity"],
                "description": inc_type["desc"],
                "clearance_eta_min": random.randint(15, 90),
                "active": True,
                "updated_at": now_iso,
            })
        inc_batch.commit()

    # ── 5. Violations (every cycle — ~2 new violations) ───────────────────────
    for _ in range(random.randint(1, 3)):
        junc = random.choice(JUNCTIONS)
        viol_type = random.choice(VIOLATION_TYPES)
        db.collection("violations").add({
            "junction_id": junc["id"],
            "junction_name": junc["name"],
            "type": viol_type,
            "timestamp": now_iso,
            "status": "Challan Issued",
            "fine_amount": random.choice([500, 1000, 2000, 5000]),
        })

    sim_cycle += 1
    print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] Cycle #{sim_cycle}: Updated {len(JUNCTIONS)} junctions + incidents + violations")


def seed_citizen_reports():
    """Seeds some dummy citizen reports with images for demonstration."""
    print("[Simulation] Seeding example citizen reports...")
    reports = [
        {
            "type": "Pothole",
            "description": "Severe pothole at CBS Circle. Dangerous for night commuters.",
            "location_name": "CBS Circle crossing",
            "lat": 19.9975, "lng": 73.7898,
            "image_url": "https://images.unsplash.com/photo-1544980766-72b58ad9ca11?auto=format&fit=crop&q=80&w=1000",
            "timestamp": datetime.datetime.now(datetime.UTC).isoformat()
        },
        {
            "type": "Roadworks",
            "description": "Unplanned roadworks on Gangapur Road. Lane 1 closed.",
            "location_name": "Gangapur Lane 1",
            "lat": 19.9850, "lng": 73.7900,
            "image_url": "https://images.unsplash.com/photo-1531266752426-aad472b7bdf4?auto=format&fit=crop&q=80&w=1000",
            "timestamp": datetime.datetime.now(datetime.UTC).isoformat()
        },
        {
            "type": "Accident",
            "description": "Minor collision causing build-up. Traffic police informed.",
            "location_name": "Nashik Road near Station",
            "lat": 20.0060, "lng": 73.7720,
            "image_url": "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&q=80&w=1000",
            "timestamp": datetime.datetime.now(datetime.UTC).isoformat()
        }
    ]
    for r in reports:
        # Check if reports already exist? No, just add them.
        db.collection("citizen_reports").add(r)
    print(f"[Simulation] Created {len(reports)} live citizen reports.")


def simulation_loop():
    global sim_running
    sim_running = True
    print("[Simulation] MargVedha Traffic Engine STARTED")
    while sim_running:
        hour = datetime.datetime.now().hour
        traffic_map = {j["id"]: simulate_traffic(j["base"], hour) for j in JUNCTIONS}
        push_update(traffic_map, hour)
        time.sleep(30)


# ── Flask Endpoints ───────────────────────────────────────────────────────────

@app.route("/")
def index():
    return jsonify({
        "service": "MargVedha Traffic Simulation Engine v2.0",
        "status": "running" if sim_running else "stopped",
        "cycle": sim_cycle,
        "junctions": len(JUNCTIONS),
    })

@app.route("/start", methods=["POST"])
def start_simulation():
    global sim_running
    if sim_running:
        return jsonify({"status": "already_running", "cycle": sim_cycle})
    t = threading.Thread(target=simulation_loop, daemon=True)
    t.start()
    return jsonify({"status": "started"})

@app.route("/stop", methods=["POST"])
def stop_simulation():
    global sim_running
    sim_running = False
    return jsonify({"status": "stopped", "final_cycle": sim_cycle})

@app.route("/api/status")
def api_status():
    return jsonify({
        "running": sim_running,
        "cycle": sim_cycle,
        "junctions_count": len(JUNCTIONS),
        "bus_routes_count": len(BUS_ROUTES),
    })


if __name__ == "__main__":
    seed_citizen_reports()
    # Auto-start simulation when run directly
    t = threading.Thread(target=simulation_loop, daemon=True)
    t.start()
    print("[*] Flask API at http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, threaded=True)
