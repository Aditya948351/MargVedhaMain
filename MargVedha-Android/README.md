# 📱 Marg Vedha – Citizen Mobility App (Android)

### Jetpack Compose · Kotlin · Google Maps · Firebase · Retrofit

> Real-time AI-powered urban mobility assistant for citizens.

---

## 🗂️ Project Structure

```
MargVedha-Android/
└── app/
    └── src/main/java/com/margvedha/citizen/
        ├── MainActivity.kt                  ← Entry Point
        ├── navigation/
        │   └── MargVedhaNavGraph.kt         ← All Routes
        ├── ui/screens/
        │   ├── home/HomeScreen.kt           ← Dashboard + Alerts
        │   ├── map/LiveMapScreen.kt         ← Google Maps + Route Planner
        │   ├── report/ReportScreen.kt       ← Citizen Issue Reporting
        │   ├── alerts/AlertsScreen.kt       ← Notification History
        │   ├── profile/ProfileScreen.kt     ← User Profile
        │   ├── parking/ParkingScreen.kt     ← Smart Parking Finder
        │   └── transport/PublicTransportScreen.kt ← Bus ETA & Tracking
        └── data/
            ├── api/
            │   ├── MargVedhaApiService.kt   ← Retrofit Interface
            │   └── RetrofitClient.kt        ← Singleton HTTP Client
            └── model/
                └── Models.kt               ← Data Classes
```

---

## 🚀 Features

| Screen | Feature |
|---|---|
| 🏠 Home | City traffic status card, quick actions, nearby incidents |
| 🗺️ Live Map | Real-time congestion overlay, route planner, layer toggle |
| ➕ Report | Issue type chips, description, auto-location, photo upload |
| 🔔 Alerts | Severity-tagged incident feed with timestamps |
| 👤 Profile | Citizen stats, saved locations, settings, sign out |
| 🅿️ Parking | Nearby spots with slot availability progress bars |
| 🚍 Transit | Bus route ETA with AI traffic-adjusted predictions |

---

## 🛠️ Setup Instructions

### 1. Clone the Repo
```bash
git clone https://github.com/Aditya948351/MargVedhaMain.git
cd MargVedhaMain/MargVedha-Android
```

### 2. Open in Android Studio
- Open **Android Studio Hedgehog** or later
- Select `MargVedha-Android/` as the project root

### 3. Configure API URL
In `RetrofitClient.kt`:
```kotlin
private const val BASE_URL = "http://YOUR_FLASK_BACKEND_URL/api/"
```

### 4. Add Google Maps API Key
In `AndroidManifest.xml`:
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY" />
```

### 5. Add Firebase Config
- Download `google-services.json` from Firebase Console
- Place it in `app/` directory

### 6. Build & Run
```
Sync Project → Build → Run on Emulator/Device
```

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | Jetpack Compose (Material 3) |
| Language | Kotlin |
| Navigation | Navigation Compose |
| Maps | Google Maps Compose SDK |
| Networking | Retrofit 2 + OkHttp |
| Authentication | Firebase Auth |
| Database | Firebase Firestore |
| Push Notifications | Firebase Cloud Messaging |
| Image Loading | Coil Compose |
| Architecture | MVVM + Repository Pattern |

---

## 🔗 Backend API Endpoints (Flask)

```
GET  /api/traffic/live           → City-wide traffic status
GET  /api/route?src=A&dest=B    → AI-optimized route options
GET  /api/alerts                 → Live incident list
GET  /api/parking?lat=&lng=     → Nearby parking availability
POST /api/report                 → Submit citizen report
GET  /api/public-transport       → Bus ETA and routes
```

---

## 🤝 Related Projects

- **Web Dashboard (Officer Panel):** [MargVedha Web App](https://traffic-optimization-1e1bd.web.app)
- **Backend (YOLO + Flask):** `Backend-YOLOv11/` folder in this repo

---

*Developed for Smart India Hackathon 2025 • Version 1.0.0*
