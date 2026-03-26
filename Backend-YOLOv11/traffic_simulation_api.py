#!/usr/bin/env python3
"""
MargVedha Traffic Simulation API
================================
Dynamically updates all 20 Nashik junction traffic counts in Firestore
every ~30 seconds. The Android app reads these in real-time, updating
route suggestions and Bus ETA automatically.

Usage:
  pip install firebase-admin
  python traffic_simulation_api.py

Requires: nsdk.json (Firebase Admin SDK key) in the same folder.
"""

import firebase_admin
from firebase_admin import credentials, firestore
import random
import time
import math
import datetime

# ── Firebase init ──────────────────────────────────────────────────────────────
cred = credentials.Certificate("nsdk.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# ── 20 Nashik Junctions with road-level connectivity ─────────────────────────
# Each junction has: name, geographic neighbours (for routing), base_traffic
JUNCTIONS = [
    {"id": "cbs_circle",         "name": "CBS Circle",         "neighbours": ["bytco_point","ashok_stambh","lekha_nagar","upnagar"],       "base": 35},
    {"id": "nashik_road",        "name": "Nashik Road",         "neighbours": ["makhmalabad_naka","dwarka_circle","shalimar"],              "base": 28},
    {"id": "gangapur_road",      "name": "Gangapur Road",       "neighbours": ["trimbak_naka","indiranagar","untwadi"],                     "base": 22},
    {"id": "dwarka_circle",      "name": "Dwarka Circle",       "neighbours": ["nashik_road","rajiv_gandhi_bhavan","shalimar"],             "base": 30},
    {"id": "rajiv_gandhi_bhavan","name": "Rajiv Gandhi Bhavan", "neighbours": ["dwarka_circle","college_road","ashok_stambh"],              "base": 25},
    {"id": "college_road",       "name": "College Road",        "neighbours": ["rajiv_gandhi_bhavan","upnagar","cbs_circle"],               "base": 20},
    {"id": "mumbai_naka",        "name": "Mumbai Naka",         "neighbours": ["lekha_nagar","pathardi_phata","bytco_point"],               "base": 45},
    {"id": "ashok_stambh",       "name": "Ashok Stambh",        "neighbours": ["cbs_circle","rajiv_gandhi_bhavan","bytco_point"],           "base": 32},
    {"id": "shalimar",           "name": "Shalimar",            "neighbours": ["nashik_road","dwarka_circle","upnagar"],                    "base": 18},
    {"id": "bytco_point",        "name": "Bytco Point",         "neighbours": ["cbs_circle","ashok_stambh","mumbai_naka"],                  "base": 27},
    {"id": "pathardi_phata",     "name": "Pathardi Phata",      "neighbours": ["mumbai_naka","ambad_link_road","satpur_midc"],              "base": 40},
    {"id": "ambad_link_road",    "name": "Ambad Link Road",     "neighbours": ["pathardi_phata","satpur_midc"],                             "base": 22},
    {"id": "satpur_midc",        "name": "Satpur MIDC",         "neighbours": ["ambad_link_road","makhmalabad_naka","nashik_road"],         "base": 15},
    {"id": "trimbak_naka",       "name": "Trimbak Naka",        "neighbours": ["gangapur_road","panchavati","indiranagar"],                 "base": 19},
    {"id": "lekha_nagar",        "name": "Lekha Nagar",         "neighbours": ["cbs_circle","mumbai_naka"],                                 "base": 24},
    {"id": "upnagar",            "name": "Upnagar",             "neighbours": ["cbs_circle","college_road","shalimar"],                     "base": 21},
    {"id": "indiranagar",        "name": "Indiranagar",         "neighbours": ["gangapur_road","trimbak_naka","untwadi"],                   "base": 16},
    {"id": "untwadi",            "name": "Untwadi",             "neighbours": ["gangapur_road","indiranagar","cbs_circle"],                 "base": 14},
    {"id": "makhmalabad_naka",   "name": "Makhmalabad Naka",    "neighbours": ["nashik_road","satpur_midc","shalimar"],                     "base": 12},
    {"id": "panchavati",         "name": "Panchavati",          "neighbours": ["trimbak_naka","cbs_circle","upnagar"],                      "base": 29},
]

# ── Bus Routes connecting stops ───────────────────────────────────────────────
BUS_ROUTES = [
    {"route_id": "N-1",  "name": "CBS ↔ Nashik Road",         "stops": ["cbs_circle","ashok_stambh","shalimar","nashik_road"],           "base_eta_min": 22},
    {"route_id": "N-4",  "name": "Panchavati ↔ Mumbai Naka",  "stops": ["panchavati","cbs_circle","lekha_nagar","mumbai_naka"],          "base_eta_min": 35},
    {"route_id": "N-7",  "name": "Gangapur ↔ Bytco",          "stops": ["gangapur_road","untwadi","cbs_circle","bytco_point"],           "base_eta_min": 28},
    {"route_id": "N-12", "name": "Satpur MIDC ↔ Dwarka",      "stops": ["satpur_midc","ambad_link_road","pathardi_phata","dwarka_circle"],"base_eta_min": 40},
    {"route_id": "N-17", "name": "Trimbak ↔ College Road",    "stops": ["trimbak_naka","indiranagar","gangapur_road","college_road"],    "base_eta_min": 30},
]

def simulate_traffic(base: int, hour: int) -> int:
    """Realistic time-of-day + random noise traffic simulation."""
    # Morning peak 8-10, Evening peak 17-19
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

def find_route(from_id: str, to_id: str, traffic_map: dict) -> list:
    """Dijkstra-based shortest path using traffic as edge weight."""
    adj = {j["id"]: j["neighbours"] for j in JUNCTIONS}
    import heapq
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
    # Reconstruct path
    path = []
    cur = to_id
    while cur in prev:
        path.append(cur)
        cur = prev[cur]
    path.append(from_id)
    return list(reversed(path))

def compute_bus_eta(route: dict, traffic_map: dict) -> dict:
    """Compute dynamic ETA for each bus route based on stop traffic."""
    total_traffic = sum(traffic_map.get(s, 0) for s in route["stops"])
    # ETA increases by 30s for every extra vehicle at stops
    delay_min = (total_traffic / 10.0) * 0.5
    eta = round(route["base_eta_min"] + delay_min)
    congestion_level = (
        "Heavy" if total_traffic > 100 else
        "Moderate" if total_traffic > 40 else
        "Clear"
    )
    return {
        "route_id": route["route_id"],
        "route_name": route["name"],
        "stops": route["stops"],
        "eta_minutes": eta,
        "congestion": congestion_level,
        "total_vehicle_load": total_traffic,
        "updated_at": datetime.datetime.utcnow().isoformat()
    }

def push_update(traffic_map: dict, hour: int):
    """Push one cycle of junction + bus updates to Firestore."""
    batch = db.batch()

    # ── Junction traffic
    for junc in JUNCTIONS:
        count = traffic_map[junc["id"]]
        ref = db.collection("junctions").document(junc["id"])
        batch.set(ref, {
            "location": junc["name"],
            "junction_id": junc["id"],
            "total_vehicles": count,
            "north": round(count * random.uniform(0.20, 0.30)),
            "south": round(count * random.uniform(0.20, 0.30)),
            "east":  round(count * random.uniform(0.20, 0.30)),
            "west":  round(count * random.uniform(0.15, 0.25)),
            "congestion_level": (
                "High" if count > 50 else
                "Moderate" if count > 20 else
                "Low"
            ),
            "signal_phase": random.choice(["GREEN_NS", "GREEN_EW", "YELLOW", "RED"]),
            "updated_at": datetime.datetime.utcnow().isoformat(),
            "hour": hour,
        }, merge=True)

    # ── Bus route ETAs
    for route in BUS_ROUTES:
        eta_data = compute_bus_eta(route, traffic_map)
        ref = db.collection("bus_routes").document(route["route_id"])
        batch.set(ref, eta_data, merge=True)

    # ── Best AI route suggestion (CBS → Mumbai Naka as demo)
    route_path = find_route("cbs_circle", "mumbai_naka", traffic_map)
    path_names = [next(j["name"] for j in JUNCTIONS if j["id"] == r) for r in route_path]
    total_on_path = sum(traffic_map.get(r, 0) for r in route_path)
    suggestion_ref = db.collection("route_suggestions").document("ai_suggested")
    batch.set(suggestion_ref, {
        "from": "CBS Circle",
        "to": "Mumbai Naka",
        "path": path_names,
        "path_ids": route_path,
        "total_vehicles": total_on_path,
        "recommendation": (
            f"⚠️ Heavy traffic ({total_on_path} vehicles). Take alternate via {path_names[1] if len(path_names)>1 else 'bypass'}. ETA: ~{30 + total_on_path // 5}m."
            if total_on_path > 80 else
            f"🟡 Moderate ({total_on_path} vehicles). Via {' → '.join(path_names)}. ETA: ~{15 + total_on_path // 8}m."
            if total_on_path > 30 else
            f"🟢 Clear route. Via {' → '.join(path_names)}. ETA: ~12m."
        ),
        "updated_at": datetime.datetime.utcnow().isoformat()
    }, merge=True)

    batch.commit()
    print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] ✅ Updated {len(JUNCTIONS)} junctions + {len(BUS_ROUTES)} bus routes")

def main():
    print("🚦 MargVedha Traffic Simulation API Started")
    print("   Updating Firestore every 30 seconds...")
    print("   Press Ctrl+C to stop.\n")
    cycle = 0
    while True:
        hour = datetime.datetime.now().hour
        # Compute traffic snapshot for this cycle
        traffic_map = {j["id"]: simulate_traffic(j["base"], hour) for j in JUNCTIONS}

        push_update(traffic_map, hour)

        # Print summary table
        cycle += 1
        print(f"\n  Cycle #{cycle} | {datetime.datetime.now().strftime('%d-%b %H:%M:%S')}")
        print(f"  {'Junction':<25} {'Vehicles':>8}  Congestion")
        print(f"  {'─'*45}")
        for junc in JUNCTIONS:
            cnt = traffic_map[junc["id"]]
            level = "🔴 High" if cnt > 50 else "🟡 Mod" if cnt > 20 else "🟢 Low"
            print(f"  {junc['name']:<25} {cnt:>8}  {level}")
        print()

        time.sleep(30)

if __name__ == "__main__":
    main()
