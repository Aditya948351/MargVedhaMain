package com.margvedha.citizen.data.model

data class TrafficStatus(
    val cityStatus: String,
    val activeSignals: Int,
    val activeIncidents: Int,
    val averageSpeedKmh: Double,
    val peakHourWarning: Boolean,
    val aiTip: String
)

data class RouteResponse(
    val fastest: Route,
    val leastTraffic: Route,
    val shortest: Route
)

data class Route(
    val polyline: List<LatLngPoint>,
    val distanceKm: Double,
    val estimatedMinutes: Int,
    val trafficLevel: String
)

data class LatLngPoint(val lat: Double, val lng: Double)

data class Alert(
    val id: String,
    val title: String,
    val description: String,
    val type: String,
    val severity: String,
    val lat: Double,
    val lng: Double,
    val timestamp: String
)

data class ParkingSpotResponse(
    val id: String,
    val name: String,
    val distanceKm: Double,
    val totalSlots: Int,
    val availableSlots: Int,
    val lat: Double,
    val lng: Double
)

data class BusRouteResponse(
    val routeNumber: String,
    val fromStop: String,
    val toStop: String,
    val etaMinutes: Int,
    val crowdingLevel: String,
    val currentLat: Double,
    val currentLng: Double
)

data class ReportRequest(
    val type: String,
    val description: String,
    val lat: Double,
    val lng: Double,
    val userId: String,
    val imageUrl: String? = null
)

data class BusRoute(
    val routeId: String,
    val routeName: String,
    val stops: List<String>,
    val etaMinutes: Int,
    val congestion: String
)

