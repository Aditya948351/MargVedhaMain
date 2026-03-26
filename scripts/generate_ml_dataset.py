import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# Configuration
JUNCTIONS = [
    "CBS Circle", "Mumbai Naka", "Nashik Road", "Gangapur Road", "Dwarka Circle",
    "Trimbak Naka", "Panchavati", "Satpur MIDC", "Bytco Point", "College Road",
    "Ashok Stambh", "Rane Nagar", "Indira Nagar", "Govind Nagar", "Patherdi Phata",
    "Adgaon Naka", "Mhasrul", "Makhmalabad", "Sinnar Phata", "Deolali Camp"
]

SIDES = ["North", "South", "East", "West"]
WEATHER = ["Clear", "Rainy", "Foggy", "Overcast"]
SENTIMENTS = ["Frustrated", "Neutral", "Satisfied", "Impatient", "Anxious"]

def generate_data(num_rows=5000):
    data = []
    start_date = datetime(2026, 3, 1)
    
    for i in range(num_rows):
        timestamp = start_date + timedelta(minutes=random.randint(0, 43200)) # Over 30 days
        junction = random.choice(JUNCTIONS)
        
        # Traffic Data for 4 Sides
        incoming = {side: random.randint(10, 150) for side in SIDES}
        outgoing = {side: random.randint(10, 150) for side in SIDES}
        
        total_vehicles = sum(incoming.values())
        avg_speed = random.uniform(15, 60) - (total_vehicles / 100) # Speed drops as traffic increases
        avg_speed = max(5, avg_speed)
        
        waiting_time = (total_vehicles / 5) * random.uniform(0.8, 1.2) # Proxy for congestion
        
        # Environmental Data
        pm2_5 = 50 + (total_vehicles / 2) + random.uniform(-10, 10)
        
        # Psychological Data (Calculated based on waiting time and weather)
        if waiting_time > 60:
            sentiment = random.choice(["Frustrated", "Impatient", "Anxious"])
            frustration_index = random.uniform(7.0, 10.0)
        elif waiting_time > 30:
            sentiment = random.choice(["Neutral", "Impatient"])
            frustration_index = random.uniform(4.0, 7.0)
        else:
            sentiment = random.choice(["Satisfied", "Neutral"])
            frustration_index = random.uniform(1.0, 4.0)
            
        weather = random.choice(WEATHER)
        if weather == "Rainy":
            frustration_index += 1.5
            
        row = {
            "Timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "Junction_Name": junction,
            "Incoming_North": incoming["North"],
            "Outgoing_North": outgoing["North"],
            "Incoming_South": incoming["South"],
            "Outgoing_South": outgoing["South"],
            "Incoming_East": incoming["East"],
            "Outgoing_East": outgoing["East"],
            "Incoming_West": incoming["West"],
            "Outgoing_West": outgoing["West"],
            "Total_Vehicles": total_vehicles,
            "Avg_Speed_kmh": round(avg_speed, 2),
            "PM2_5_Level": round(pm2_5, 2),
            "Waiting_Time_Sec": round(waiting_time, 2),
            "Weather": weather,
            "Citizen_Sentiment": sentiment,
            "Frustration_Index": round(min(10, frustration_index), 2),
            "Sarvam_AI_Priority": "High" if frustration_index > 7 else "Normal"
        }
        data.append(row)
        
    return pd.DataFrame(data)

if __name__ == "__main__":
    print("Generating 5000 rows of Psychological Traffic Data...")
    df = generate_data(5000)
    
    # Save to public directory for Web Dashboard access
    output_path = "e:/MargVedhaMain/public/nashik_traffic_psych_data.csv"
    df.to_csv(output_path, index=False)
    print(f"Dataset successfully saved to: {output_path}")
    
    # Also save a secondary summary for quick graphs
    summary = df.groupby("Junction_Name")[["Total_Vehicles", "PM2_5_Level", "Frustration_Index"]].mean().reset_index()
    summary.to_csv("e:/MargVedhaMain/public/junction_psych_summary.csv", index=False)
    print("Summary dataset saved for Real-time Dashboard graphs.")
