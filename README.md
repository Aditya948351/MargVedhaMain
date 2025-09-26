# MargVedha - Smart Traffic Management System

![MargVedha Logo](assets/logo.png)

> Efficient and Intelligent Traffic Control to Prioritize Emergency Vehicles and Reduce Congestion.

## 📋 Overview

MargVedha is an intelligent traffic management system designed to optimize traffic flow at intersections while prioritizing emergency vehicles. Using real-time data analysis, the system dynamically adjusts traffic light timings to reduce congestion and ensure emergency vehicles can navigate through intersections without delay.

## 🚑 Problem Statement

In urban areas, traffic congestion significantly delays emergency response times, potentially costing lives. MargVedha addresses this critical issue by automatically detecting emergency vehicles and adjusting traffic signals to provide them with priority passage, while still maintaining efficient overall traffic flow.

## ✨ Key Features

- **Real-Time Traffic Control** - Dynamically adjusts traffic light timings based on vehicle density at intersections
- **Emergency Vehicle Prioritization** - Automatically detects emergency vehicles and grants immediate green signal access
- **Adaptive Timing Mechanism** - Calculates optimal green-light durations based on vehicle count and congestion rates
- **Data Persistence** - Uses SQLite to store and analyze traffic patterns for continuous improvement
- **Computer Vision Integration** - Leverages YOLO-based detection for accurate vehicle identification

## 🛠️ Tech Stack

- **Programming Language**: Python
- **Database**: SQLite
- **Key Libraries**:
  - ultralytics (YOLO) - Computer vision for vehicle detection
  - sqlite3 - Database operations
  - numpy - Statistical analysis of traffic patterns
  - Additional utilities for timing and processing

## 🔄 How It Works

### Database Schema

The system maintains a database with tables for each road, tracking:
- `green_time` - Duration of green light in seconds
- `vehicle_count` - Current number of vehicles in the monitored area
- `capacity` - Maximum vehicle capacity for the road segment

### Road Management Logic

1. **Road Class** - Each road is modeled as an object that tracks traffic data and manages state
2. **Process Loop** - Continuous monitoring of vehicle counts to calculate optimal green times
3. **State Management** - Intelligent switching between roads to ensure optimal traffic flow

### Emergency Vehicle Detection

The system uses YOLO-based computer vision to identify emergency vehicles in real-time. When detected, the traffic management algorithm immediately prioritizes that road for a green signal, allowing the emergency vehicle to pass through without delay.

## 🧠 Intelligent Algorithms

MargVedha employs sophisticated algorithms that:
- Calculate optimal green light durations based on current traffic density
- Predict traffic buildup patterns to proactively manage congestion
- Balance emergency vehicle priority with overall traffic efficiency

## 🔮 Future Roadmap

- **Machine Learning Integration** - Implement predictive models for traffic forecasting
- **Multi-Intersection Management** - Scale to network-level traffic optimization
- **Real-Time Camera Integration** - Direct processing of camera feeds for enhanced accuracy
- **Mobile App Integration** - Provide drivers with real-time traffic information
