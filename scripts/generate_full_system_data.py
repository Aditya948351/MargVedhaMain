import os
import random
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Configuration
OUTPUT_DIR = "e:/MargVedhaMain/public/full_system_data"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Model 1 Year of Hourly Data
HOURS_IN_YEAR = 365 * 24
# For performance testing and quick generation without killing memory during dev, we'll do the math:
# 8760 hours * 20 instances * 4 directions = ~700k records for the biggest files. This is easily handled in memory.

print(f"Initializing data generation for {HOURS_IN_YEAR} hours (~1 Year)...")
START_TIME = datetime.now() - timedelta(days=365)
TIMESTAMPS = pd.date_range(start=START_TIME, periods=HOURS_IN_YEAR, freq='h')

JUNCTIONS = [f"J{i}" for i in range(1, 21)]
DIRECTIONS = ['N', 'S', 'E', 'W']
ROUTES = [f"Route-{i}" for i in range(1, 6)]
ZONES = ["NorthHub", "SouthHub", "CoreCity"]
COMPONENTS = ["CameraAPI", "TrafficEngine", "Database", "AuthService", "AnalyticsNode"]

# Precompute time factors to avoid looping over 700k rows
# Seasonality Multipliers
t_hour = TIMESTAMPS.hour.values
t_day = TIMESTAMPS.dayofweek.values
t_month = TIMESTAMPS.month.values

base_time_mult_1d = np.ones(HOURS_IN_YEAR)
peak_mask = ((t_hour >= 8) & (t_hour <= 11)) | ((t_hour >= 17) & (t_hour <= 20))
night_mask = ((t_hour >= 0) & (t_hour <= 5))
weekend_mask = (t_day >= 5)
fest_mask = (t_month == 10) | (t_month == 11)

base_time_mult_1d[peak_mask] *= 1.8
base_time_mult_1d[night_mask] *= 0.15
base_time_mult_1d[weekend_mask] *= 0.65
base_time_mult_1d[fest_mask] *= 1.25

school_peak_1d = ((t_hour == 7) | (t_hour == 14)) & (~weekend_mask)
festival_flag_1d = fest_mask

# 1. INCIDENTS & ENVIRONMENT (Global scope largely)
print("Generating ENVIRONMENT & INCIDENTS datasets...")
env_df = pd.DataFrame({
    'timestamp': TIMESTAMPS,
    'weather': np.random.choice(['Clear', 'Cloudy', 'Rain', 'Heavy Rain'], p=[0.6, 0.25, 0.1, 0.05], size=HOURS_IN_YEAR),
    'rain_intensity': 0.0,
    'visibility_level': np.random.randint(40, 100, size=HOURS_IN_YEAR),
    'fog_flag': 0,
    'festival_flag': festival_flag_1d.astype(int),
    'school_peak_flag': school_peak_1d.astype(int),
    'event_flag': np.random.choice([0, 1], p=[0.98, 0.02], size=HOURS_IN_YEAR),
    'temperature': np.random.normal(28, 5, size=HOURS_IN_YEAR).astype(int)
})
env_df.loc[env_df['weather'] == 'Rain', 'rain_intensity'] = np.random.uniform(2, 10, size=(env_df['weather'] == 'Rain').sum())
env_df.loc[env_df['weather'] == 'Heavy Rain', 'rain_intensity'] = np.random.uniform(10, 50, size=(env_df['weather'] == 'Heavy Rain').sum())
env_df.loc[env_df['weather'] == 'Heavy Rain', 'visibility_level'] -= 30
env_df.loc[np.isin(t_month, [12, 1]), 'fog_flag'] = np.random.choice([0, 1], p=[0.8, 0.2], size=(np.isin(t_month, [12, 1])).sum())
env_df.to_csv(os.path.join(OUTPUT_DIR, "environment_data.csv"), index=False)

# Sparse events
events = pd.DataFrame({
    'timestamp': pd.Series(np.random.choice(TIMESTAMPS, 100)),
    'event_id': [f"EVT-{i}" for i in range(100)],
    'location_junction': np.random.choice(JUNCTIONS, 100),
    'event_type': np.random.choice(['Concert', 'Political Rally', 'Sports', 'Protest'], 100),
    'expected_crowd': np.random.randint(500, 10000, 100),
    'impact_radius': np.random.choice([1, 2, 3], 100)
})
events['start_time'] = events['timestamp'] - pd.to_timedelta(np.random.randint(0, 2), unit='h')
events['end_time'] = events['start_time'] + pd.to_timedelta(np.random.randint(2, 6), unit='h')
events.to_csv(os.path.join(OUTPUT_DIR, "event_data.csv"), index=False)


# 2. CORE JUNCTION & DIRECTION DATA (8760 * 20 * 4 = 700,800 rows)
print("Generating CORE JUNCTION DIRECTION & ML / RL HISTORY datasets (700k+ rows)...")
N_HOURS = HOURS_IN_YEAR
N_JUNCTIONS = len(JUNCTIONS)
N_DIRECTIONS = len(DIRECTIONS)
TOTAL_JD_ROWS = N_HOURS * N_JUNCTIONS * N_DIRECTIONS

jd_timestamps = np.repeat(TIMESTAMPS.values, N_JUNCTIONS * N_DIRECTIONS)
jd_juncs = np.tile(np.repeat(JUNCTIONS, N_DIRECTIONS), N_HOURS)
jd_dirs = np.tile(DIRECTIONS, N_HOURS * N_JUNCTIONS)

# Base volumes modulated by global time multipliers
jd_base_mult = np.repeat(base_time_mult_1d, N_JUNCTIONS * N_DIRECTIONS)
jd_noise = np.random.normal(1.0, 0.2, TOTAL_JD_ROWS)

vehicle_count = np.clip((np.random.choice([15, 30, 45, 60], size=TOTAL_JD_ROWS) * jd_base_mult * jd_noise), 0, 300).astype(int)
vehicle_density = np.clip((vehicle_count / 300.0) * 100, 0, 100).astype(int)

# Distribute vehicle types
cars = (vehicle_count * np.random.uniform(0.3, 0.5, TOTAL_JD_ROWS)).astype(int)
bikes = (vehicle_count * np.random.uniform(0.3, 0.6, TOTAL_JD_ROWS)).astype(int)
buses = (vehicle_count * np.random.uniform(0.01, 0.05, TOTAL_JD_ROWS)).astype(int)
trucks = (vehicle_count * np.random.uniform(0.01, 0.1, TOTAL_JD_ROWS)).astype(int)
autos = vehicle_count - (cars + bikes + buses + trucks)
autos = np.clip(autos, 0, None) # Ensure no negatives

avg_waiting_time = np.clip(vehicle_count * np.random.uniform(0.5, 1.5, TOTAL_JD_ROWS), 0, 180).astype(int)

jd_df = pd.DataFrame({
    'timestamp': jd_timestamps,
    'junction_id': jd_juncs,
    'direction': jd_dirs,
    'vehicle_count': vehicle_count,
    'vehicle_density': vehicle_density,
    'queue_length': np.clip(vehicle_count * np.random.uniform(0.1, 0.4, TOTAL_JD_ROWS), 0, 50).astype(int),
    'avg_waiting_time': avg_waiting_time,
    'max_waiting_time': avg_waiting_time + np.random.randint(10, 60, TOTAL_JD_ROWS),
    'delay_per_vehicle': avg_waiting_time // 2,
    'throughput': vehicle_count - np.random.randint(0, 5, TOTAL_JD_ROWS),
    'signal_state': np.random.choice(['Green', 'Red', 'Yellow'], p=[0.4, 0.5, 0.1], size=TOTAL_JD_ROWS),
    'signal_duration': np.random.randint(30, 120, TOTAL_JD_ROWS),
    'time_since_last_green': np.random.randint(0, 180, TOTAL_JD_ROWS),
    'congestion_index': vehicle_density // 10,
    
    'cars_count': cars,
    'bikes_count': bikes,
    'buses_count': buses,
    'trucks_count': trucks,
    'autos_count': autos,
    
    'helmet_violation_count': (bikes * np.random.uniform(0.05, 0.15, TOTAL_JD_ROWS)).astype(int),
    'signal_jump_count': (vehicle_count * np.random.uniform(0.01, 0.05, TOTAL_JD_ROWS)).astype(int),
    'wrong_way_count': (vehicle_count * np.random.uniform(0.0, 0.02, TOTAL_JD_ROWS)).astype(int),
    'overspeed_count': (vehicle_count * np.random.uniform(0.02, 0.08, TOTAL_JD_ROWS)).astype(int),
    'triple_riding_count': (bikes * np.random.uniform(0.01, 0.03, TOTAL_JD_ROWS)).astype(int),
    'lane_discipline_score': np.random.randint(40, 100, TOTAL_JD_ROWS),
    'gap_acceptance_rate': np.round(np.random.uniform(0.3, 0.9, TOTAL_JD_ROWS), 2)
})
jd_df.to_csv(os.path.join(OUTPUT_DIR, "junction_direction_data.csv"), index=False)

# AI / ML - traffic history overlaps but represents raw historical aggregations
jd_df[['timestamp', 'junction_id', 'direction', 'vehicle_count', 'avg_waiting_time', 'congestion_index', 'throughput']].to_csv(os.path.join(OUTPUT_DIR, "traffic_history.csv"), index=False)

# AI / ML - predictions (slightly offset from reality)
ml_pred = jd_df[['timestamp', 'junction_id', 'direction']].copy()
ml_pred['predicted_vehicle_count'] = np.clip(jd_df['vehicle_count'] * np.random.normal(1.0, 0.1, TOTAL_JD_ROWS), 0, None).astype(int)
ml_pred['predicted_congestion'] = np.clip(jd_df['congestion_index'] + np.random.randint(-1, 2, TOTAL_JD_ROWS), 0, 10)
ml_pred['predicted_waiting_time'] = np.clip(jd_df['avg_waiting_time'] * np.random.normal(1.0, 0.1, TOTAL_JD_ROWS), 0, None).astype(int)
ml_pred['predicted_queue_length'] = np.clip(jd_df['queue_length'] * np.random.normal(1.0, 0.15, TOTAL_JD_ROWS), 0, None).astype(int)
ml_pred.to_csv(os.path.join(OUTPUT_DIR, "ml_predictions.csv"), index=False)


# 3. OVERVIEW & NETWORK DATA (Aggregated from core jd_df -> size 8760 * 20 = 175,200 rows)
print("Aggregating OVERVIEW & NETWORK DATA...")
jo_df = jd_df.groupby(['timestamp', 'junction_id']).agg({
    'vehicle_count': 'sum',
    'avg_waiting_time': 'mean',
    'congestion_index': 'mean',
    'throughput': 'sum'
}).reset_index()

jo_df.rename(columns={'vehicle_count': 'total_vehicle_count', 'throughput': 'vehicles_passed', 'congestion_index': 'avg_congestion'}, inplace=True)
jo_df['avg_waiting_time'] = jo_df['avg_waiting_time'].astype(int)
jo_df['avg_congestion'] = np.round(jo_df['avg_congestion'], 1)

# Sort by congestion to get rank
jo_df = jo_df.sort_values(by=['timestamp', 'avg_congestion'], ascending=[True, False])
jo_df['network_rank_congestion'] = jo_df.groupby('timestamp').cumcount() + 1
jo_df['highest_wait_flag'] = (jo_df.groupby('timestamp')['avg_waiting_time'].transform('max') == jo_df['avg_waiting_time']).astype(int)
jo_df['lowest_efficiency_flag'] = (jo_df.groupby('timestamp')['vehicles_passed'].transform('min') == jo_df['vehicles_passed']).astype(int)
jo_df.to_csv(os.path.join(OUTPUT_DIR, "junction_overview.csv"), index=False)


network_df = jo_df[['timestamp', 'junction_id', 'avg_congestion', 'total_vehicle_count', 'network_rank_congestion']].copy()
# Faking neighbor congestion
network_df['neighbor_ids'] = network_df['junction_id'].apply(lambda x: "J" + str(random.randint(1, 20)) + "|J" + str(random.randint(1, 20)))
network_df['neighbor_congestion_avg'] = np.round(np.clip(network_df['avg_congestion'] * np.random.normal(1.0, 0.3, len(network_df)), 0, 10), 1)
network_df['incoming_flow'] = network_df['total_vehicle_count']
network_df['outgoing_flow'] = np.clip(network_df['total_vehicle_count'] * np.random.normal(0.95, 0.1), 0, None).astype(int)
network_df['network_congestion_index'] = np.round((network_df['avg_congestion'] + network_df['neighbor_congestion_avg']) / 2, 1)
network_df['global_traffic_load'] = np.random.randint(10000, 50000, len(network_df)) # Global metric essentially static per hour
network_df.rename(columns={'network_rank_congestion': 'rank_in_city'}, inplace=True)
network_df.drop(columns=['avg_congestion', 'total_vehicle_count'], inplace=True)
network_df.to_csv(os.path.join(OUTPUT_DIR, "network_data.csv"), index=False)


# 4. ENFORCEMENT DATA (Sparse/Filtered directly from JD stats)
print("Extracting ENFORCEMENT & PEDESTRIAN DATA...")
vl_df = jd_df.melt(id_vars=['timestamp', 'junction_id', 'direction'], 
                   value_vars=['helmet_violation_count', 'signal_jump_count', 'wrong_way_count', 'overspeed_count', 'triple_riding_count'],
                   var_name='violation_type', value_name='violation_count')
vl_df = vl_df[vl_df['violation_count'] > 0] # Keep only actual violations
vl_df['violation_type'] = vl_df['violation_type'].str.replace('_count', '')
vl_df['detected_by'] = np.random.choice(['Camera-AI', 'Manual-Log', 'Radar'], p=[0.8, 0.1, 0.1], size=len(vl_df))
vl_df['camera_id'] = "CAM-" + vl_df['junction_id'] + "-" + vl_df['direction']
vl_df.to_csv(os.path.join(OUTPUT_DIR, "violation_log.csv"), index=False)

ped_df = pd.DataFrame({
    'timestamp': jd_timestamps,
    'junction_id': jd_juncs,
    'direction': jd_dirs,
    'pedestrian_count': np.clip(jd_base_mult * np.random.randint(0, 100, TOTAL_JD_ROWS), 0, 500).astype(int),
    'crossing_frequency': np.random.randint(0, 30, TOTAL_JD_ROWS),
    'avg_waiting_time': np.random.randint(10, 120, TOTAL_JD_ROWS)
})
ped_df.to_csv(os.path.join(OUTPUT_DIR, "pedestrian_data.csv"), index=False)

park_df = pd.DataFrame({
    'timestamp': jd_timestamps,
    'junction_id': jd_juncs,
    'direction': jd_dirs,
    'illegal_parking_count': np.random.randint(0, 15, TOTAL_JD_ROWS),
    'parking_occupancy_rate': np.round(np.random.uniform(0.1, 1.0, TOTAL_JD_ROWS), 2),
    'road_blockage_level': np.random.choice(['Low', 'Medium', 'High'], p=[0.7, 0.2, 0.1], size=TOTAL_JD_ROWS)
})
park_df.to_csv(os.path.join(OUTPUT_DIR, "parking_data.csv"), index=False)


# 5. RL DECISIONS (8760 * 20 rows)
print("Generating RL DECISIONS...")
TOTAL_J_ROWS = N_HOURS * N_JUNCTIONS
rl_timestamps = np.repeat(TIMESTAMPS.values, N_JUNCTIONS)
rl_juncs = np.tile(JUNCTIONS, N_HOURS)

rl_df = pd.DataFrame({
    'timestamp': rl_timestamps,
    'junction_id': rl_juncs,
    'state': np.random.choice(['Congested', 'Smooth', 'Clearing'], size=TOTAL_J_ROWS),
    'action_taken': np.random.choice(['Extend_Green_N', 'Extend_Green_S', 'Shorten_Red_E', 'Activate_Sync'], size=TOTAL_J_ROWS),
    'reward': np.round(np.random.uniform(-5.0, 15.0, TOTAL_J_ROWS), 2),
    'q_value': np.round(np.random.uniform(0.01, 0.99, TOTAL_J_ROWS), 3),
    'green_time_N': np.random.randint(20, 90, TOTAL_J_ROWS),
    'green_time_S': np.random.randint(20, 90, TOTAL_J_ROWS),
    'green_time_E': np.random.randint(20, 90, TOTAL_J_ROWS),
    'green_time_W': np.random.randint(20, 90, TOTAL_J_ROWS),
    'policy_version': "v4.2.1-stable"
})
rl_df.to_csv(os.path.join(OUTPUT_DIR, "rl_decisions.csv"), index=False)


# 6. INCIDENTS (Sparse - approx 2 incidents per junction per month?)
print("Generating INCIDENTS...")
INCIDENTS_ROWS = 20 * 12 * 2  # Approx 480 incidents a year
inc_df = pd.DataFrame({
    'timestamp': pd.Series(np.random.choice(TIMESTAMPS, INCIDENTS_ROWS)),
    'junction_id': np.random.choice(JUNCTIONS, INCIDENTS_ROWS),
    'direction': np.random.choice(DIRECTIONS, INCIDENTS_ROWS),
    'accident_flag': np.random.choice([0, 1], p=[0.7, 0.3], size=INCIDENTS_ROWS),
    'accident_severity': np.random.choice(['Minor', 'Major', 'Fatal', 'None'], p=[0.4, 0.1, 0.05, 0.45], size=INCIDENTS_ROWS),
    'lanes_blocked': np.random.randint(0, 3, INCIDENTS_ROWS),
    'clearance_time': np.random.randint(15, 120, INCIDENTS_ROWS),
    'road_block_flag': np.random.choice([0, 1], p=[0.8, 0.2], size=INCIDENTS_ROWS),
    'construction_flag': np.random.choice([0, 1], p=[0.9, 0.1], size=INCIDENTS_ROWS),
    'emergency_vehicle_present': np.random.choice([0, 1], p=[0.8, 0.2], size=INCIDENTS_ROWS)
})
# Cleanup impossibility
inc_df.loc[inc_df['accident_flag'] == 0, 'accident_severity'] = 'None'
inc_df.to_csv(os.path.join(OUTPUT_DIR, "incident_data.csv"), index=False)


# 7. TRANSPORT LAYER
print("Generating TRANSPORT LAYER...")
N_ROUTES = len(ROUTES)
trans_timestamps = np.repeat(TIMESTAMPS.values, N_ROUTES)
trans_routes = np.tile(ROUTES, N_HOURS)

trans_df = pd.DataFrame({
    'timestamp': trans_timestamps,
    'route_id': trans_routes,
    'bus_count': np.random.randint(0, 15, N_HOURS * N_ROUTES),
    'bus_delay': np.random.randint(0, 45, N_HOURS * N_ROUTES), # minutes
    'bus_avg_speed': np.random.randint(10, 40, N_HOURS * N_ROUTES), # kmh
    'bus_stop_density': np.random.uniform(1.2, 3.5, N_HOURS * N_ROUTES),
    'bus_priority_flag': np.random.choice([0, 1], p=[0.9, 0.1], size=N_HOURS * N_ROUTES),
    'auto_density': np.random.randint(10, 100, N_HOURS * N_ROUTES),
    'auto_avg_wait': np.random.randint(2, 20, N_HOURS * N_ROUTES),
    'auto_demand_supply_ratio': np.round(np.random.uniform(0.5, 2.5, N_HOURS * N_ROUTES), 2),
    'auto_fare_dynamic': np.random.randint(50, 250, N_HOURS * N_ROUTES)
})
trans_df.to_csv(os.path.join(OUTPUT_DIR, "transport_data.csv"), index=False)

route_map_df = pd.DataFrame({
    'route_id': ROUTES,
    'from_junction': np.random.choice(JUNCTIONS, N_ROUTES),
    'to_junction': np.random.choice(JUNCTIONS, N_ROUTES),
    'distance': np.round(np.random.uniform(2.0, 15.0, N_ROUTES), 2),
    'avg_travel_time': np.random.randint(15, 60, N_ROUTES),
    'road_type': ['Highway', 'Arterial', 'Arterial', 'Local', 'Highway'],
    'speed_limit': [80, 60, 60, 40, 80]
})
route_map_df.to_csv(os.path.join(OUTPUT_DIR, "route_mapping.csv"), index=False)

N_ZONES = len(ZONES)
fare_timestamps = np.repeat(TIMESTAMPS.values, N_ZONES)
fare_zones = np.tile(ZONES, N_HOURS)
base_mult_fare = np.repeat(base_time_mult_1d, N_ZONES)

fare_df = pd.DataFrame({
    'timestamp': fare_timestamps,
    'zone_id': fare_zones,
    'base_fare': 50,
    'congestion_multiplier': np.round(1.0 + (base_mult_fare * 0.2), 2),
    'dynamic_fare': np.round(50 * (1.0 + (base_mult_fare * 0.2)), 2),
    'peak_hour_flag': (base_mult_fare > 1.2).astype(int)
})
fare_df.to_csv(os.path.join(OUTPUT_DIR, "fare_policy.csv"), index=False)


# 8. SYSTEM LAYER
print("Generating SYSTEM LAYER...")
road_inf = pd.DataFrame({
    'junction_id': np.repeat(JUNCTIONS, 4),
    'direction': np.tile(DIRECTIONS, 20),
    'road_width': np.random.choice([7.5, 10.5, 14.0], 80),
    'lane_count': np.random.choice([2, 3, 4], 80),
    'road_capacity': np.random.choice([1500, 2000, 3000], 80),
    'road_type': np.random.choice(['Arterial', 'Link', 'Highway'], 80),
    'speed_limit': np.random.choice([40, 60, 80], 80),
    'has_bus_lane': np.random.choice([0, 1], p=[0.7, 0.3], size=80),
    'has_pedestrian_crossing': np.random.choice([0, 1], p=[0.2, 0.8], size=80)
})
road_inf.to_csv(os.path.join(OUTPUT_DIR, "road_infrastructure.csv"), index=False)

N_COMPS = len(COMPONENTS)
log_df = pd.DataFrame({
    'timestamp': np.repeat(TIMESTAMPS.values, N_COMPS),
    'component': np.tile(COMPONENTS, N_HOURS),
    'status': np.random.choice(['OK', 'WARNING', 'ERROR'], p=[0.95, 0.04, 0.01], size=N_HOURS * N_COMPS),
    'response_time': np.random.randint(10, 500, N_HOURS * N_COMPS),
    'error_flag': 0,
    'error_message': 'None'
})
log_df.loc[log_df['status'] != 'OK', 'error_flag'] = 1
log_df.loc[log_df['status'] == 'WARNING', 'error_message'] = 'High Latency / Sync Issue'
log_df.loc[log_df['status'] == 'ERROR', 'error_message'] = 'Connection Timeout'
log_df.to_csv(os.path.join(OUTPUT_DIR, "system_logs.csv"), index=False)

sim_config = pd.DataFrame({
    'simulation_id': ['SIM-MARGVEDHA-2026'],
    'junction_count': [20],
    'traffic_pattern': ['Stochastic Seasonal Context Aware'],
    'incident_frequency': ['0.05 per hour per junction'],
    'weather_mode': ['Dynamic'],
    'start_time': [TIMESTAMPS.min()],
    'end_time': [TIMESTAMPS.max()]
})
sim_config.to_csv(os.path.join(OUTPUT_DIR, "simulation_config.csv"), index=False)

fb_df = pd.DataFrame({
    'timestamp': pd.Series(np.random.choice(TIMESTAMPS, 500)),
    'user_id': [f"USR-{np.random.randint(1000,9999)}" for _ in range(500)],
    'junction_id': np.random.choice(JUNCTIONS, 500),
    'issue_type': np.random.choice(['Pothole', 'Signal Outage', 'Heavy Congestion', 'Accident'], 500),
    'description': "Automated citizen feedback report.",
    'priority_level': np.random.choice(['Low', 'Medium', 'High', 'Critical'], 500),
    'status': np.random.choice(['Open', 'In Progress', 'Resolved'], p=[0.2, 0.3, 0.5], size=500)
})
fb_df.to_csv(os.path.join(OUTPUT_DIR, "user_feedback.csv"), index=False)

print("\n✅ SUCCESS: 19 Large Scale ML Optimization Datasets created securely over 1 Year spanning 8,760 hours.")
print(f"Data directory: {OUTPUT_DIR}")
