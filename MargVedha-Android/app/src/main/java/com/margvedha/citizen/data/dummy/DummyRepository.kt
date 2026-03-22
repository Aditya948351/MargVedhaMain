package com.margvedha.citizen.data.dummy

import com.margvedha.citizen.data.model.*
import kotlinx.coroutines.delay

/**
 * Dummy data repository — replace with RetrofitClient calls once Flask backend is deployed.
 */
object DummyRepository {

    // ─── Traffic Status ───────────────────────────────────────────────────────

    suspend fun getTrafficStatus(): TrafficStatus {
        delay(500) // simulate network
        return TrafficStatus(
            cityStatus = "Moderate Congestion",
            activeSignals = 42,
            activeIncidents = 8,
            averageSpeedKmh = 28.4,
            peakHourWarning = true,
            aiTip = "Avoid CBS Road for 30 mins. Use College Road via Gangapur as alternate to save ~12 mins."
        )
    }

    // ─── Alerts ───────────────────────────────────────────────────────────────

    suspend fun getAlerts(): List<Alert> {
        delay(400)
        return listOf(
            Alert("1", "Accident Reported", "Heavy collision near CBS Stand. 2 lanes blocked.", "accident", "Critical", 19.9975, 73.7898, "2 mins ago"),
            Alert("2", "Heavy Traffic", "Nashik–Pune Highway slow-moving for 3 km.", "traffic", "High", 20.0060, 73.7720, "8 mins ago"),
            Alert("3", "Signal Down", "Traffic light non-functional at Panchavati Y-junction.", "signal", "Medium", 20.0110, 73.7760, "15 mins ago"),
            Alert("4", "Road Closed", "Trimbak Road blocked for pipeline work till 6PM.", "closure", "High", 19.9420, 73.6900, "1 hr ago"),
            Alert("5", "VIP Movement", "CM convoy from Airport to Circuit House — expect delays.", "vip", "Info", 20.0200, 73.7600, "2 hrs ago"),
            Alert("6", "Waterlogging", "Gangapur Naka underpass flooded due to rain.", "weather", "Medium", 19.9950, 73.7400, "3 hrs ago"),
        )
    }

    // ─── Parking ──────────────────────────────────────────────────────────────

    suspend fun getNearbyParking(): List<ParkingSpotResponse> {
        delay(300)
        return listOf(
            ParkingSpotResponse("P1", "CBS Zone A – Municipal", 0.3, 50, 12, 19.9975, 73.7898),
            ParkingSpotResponse("P2", "Mahamarg Bus Stand", 0.8, 30, 0, 20.0060, 73.7720),
            ParkingSpotResponse("P3", "Panchavati Market Pvt", 1.2, 20, 8, 20.0110, 73.7760),
            ParkingSpotResponse("P4", "Old Nashik City Hall", 1.5, 40, 25, 19.9950, 73.7500),
            ParkingSpotResponse("P5", "Dwarka Circle Mall", 2.1, 80, 33, 19.9700, 73.7600),
        )
    }

    // ─── Public Transport ─────────────────────────────────────────────────────

    suspend fun getBusRoutes(): List<BusRouteResponse> {
        delay(400)
        return listOf(
            BusRouteResponse("N-17", "CBS Stand", "Panchavati", 5, "Low", 19.9985, 73.7900),
            BusRouteResponse("N-22", "Gangapur Road", "Nashik Road", 12, "High", 20.0050, 73.7700),
            BusRouteResponse("N-08", "MIDC Satpur", "Old Nashik", 18, "Medium", 20.0200, 73.7550),
            BusRouteResponse("N-31", "Dwarka Circle", "Mahamarg", 3, "Low", 19.9700, 73.7620),
            BusRouteResponse("N-44", "Trimbak Road", "CBS Stand", 24, "High", 19.9420, 73.6900),
        )
    }

    // ─── Route ────────────────────────────────────────────────────────────────

    suspend fun getRoute(from: String, to: String): RouteResponse {
        delay(700)
        return RouteResponse(
            fastest = Route(
                polyline = listOf(LatLngPoint(19.9975, 73.7898), LatLngPoint(20.0060, 73.7720)),
                distanceKm = 4.2,
                estimatedMinutes = 12,
                trafficLevel = "Moderate"
            ),
            leastTraffic = Route(
                polyline = listOf(LatLngPoint(19.9975, 73.7898), LatLngPoint(19.9850, 73.7760)),
                distanceKm = 5.8,
                estimatedMinutes = 14,
                trafficLevel = "Clear"
            ),
            shortest = Route(
                polyline = listOf(LatLngPoint(19.9975, 73.7898), LatLngPoint(20.0030, 73.7820)),
                distanceKm = 3.1,
                estimatedMinutes = 18,
                trafficLevel = "Heavy"
            )
        )
    }
}
