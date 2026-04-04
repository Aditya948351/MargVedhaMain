package com.margvedha.citizen.data

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.margvedha.citizen.data.model.Alert
import com.margvedha.citizen.data.model.BusRoute
import com.margvedha.citizen.data.model.TrafficStatus
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

object FirebaseRepository {
    private val db = FirebaseFirestore.getInstance()

    fun getFines(plateNumber: String): Flow<List<Alert>> = callbackFlow {
        val subscription = db.collection("fines")
            .whereEqualTo("plateNumber", plateNumber)
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) { close(error); return@addSnapshotListener }
                val fines = snapshot?.documents?.mapNotNull { doc ->
                    val type = doc.getString("violationType") ?: "Traffic Violation"
                    Alert(
                        id = doc.id, title = type,
                        description = "Violation at ${doc.getString("junction") ?: "Unknown"}. ₹${doc.getLong("amount") ?: 0}",
                        type = if (type.contains("Wrong Side", true)) "signal" else "warning",
                        severity = if (doc.getString("status") == "Pending") "High" else "Info",
                        lat = 19.9975, lng = 73.7898,
                        timestamp = doc.getString("timestamp_local") ?: "Just now"
                    )
                } ?: emptyList()
                trySend(fines)
            }
        awaitClose { subscription.remove() }
    }

    fun getRewardPoints(plateNumber: String): Flow<Int> = callbackFlow {
        val subscription = db.collection("users").document("mock_citizen")
            .addSnapshotListener { snapshot, error ->
                trySend(snapshot?.getLong("rewardPoints")?.toInt() ?: 450)
            }
        awaitClose { subscription.remove() }
    }

    fun getJunctionStatus(): Flow<Map<String, Int>> = callbackFlow {
        val subscription = db.collection("junctions")
            .addSnapshotListener { snapshot, error ->
                if (error != null) return@addSnapshotListener
                val map = snapshot?.documents?.associate { doc ->
                    (doc.getString("location") ?: "Unknown") to (doc.getLong("total_vehicles")?.toInt() ?: 0)
                } ?: emptyMap()
                trySend(map)
            }
        awaitClose { subscription.remove() }
    }

    fun getBusRoutes(): Flow<List<BusRoute>> = callbackFlow {
        val subscription = db.collection("bus_routes")
            .addSnapshotListener { snapshot, error ->
                if (error != null) return@addSnapshotListener
                val routes = snapshot?.documents?.mapNotNull { doc ->
                    BusRoute(
                        routeId    = doc.getString("route_id") ?: doc.id,
                        routeName  = doc.getString("route_name") ?: "",
                        stops      = (doc.get("stops") as? List<*>)?.filterIsInstance<String>() ?: emptyList(),
                        etaMinutes = doc.getLong("eta_minutes")?.toInt() ?: 0,
                        congestion = doc.getString("congestion") ?: "Unknown"
                    )
                } ?: emptyList()
                trySend(routes)
            }
        awaitClose { subscription.remove() }
    }

    // ── NEW: Live traffic status computed from Firestore junctions ────────────
    fun getLiveTrafficStatus(): Flow<TrafficStatus> = callbackFlow {
        val subscription = db.collection("junctions")
            .addSnapshotListener { snapshot, error ->
                if (error != null) return@addSnapshotListener
                val docs = snapshot?.documents ?: return@addSnapshotListener

                val totalVehicles = docs.sumOf { it.getLong("total_vehicles")?.toInt() ?: 0 }
                val activeSignals = docs.size
                val highCount = docs.count { (it.getString("congestion_level") ?: "") == "High" }
                val avgSpeed = when {
                    highCount > 10 -> 12.5
                    highCount > 5  -> 22.0
                    highCount > 2  -> 32.0
                    else           -> 42.5
                }

                // Find the most congested junction for the AI tip
                val maxJunc = docs.maxByOrNull { it.getLong("total_vehicles")?.toInt() ?: 0 }
                val maxName = maxJunc?.getString("location") ?: "Unknown"
                val maxCount = maxJunc?.getLong("total_vehicles")?.toInt() ?: 0

                val cityStatus = when {
                    highCount > 8  -> "Heavy Congestion"
                    highCount > 4  -> "Moderate Congestion"
                    highCount > 1  -> "Light Traffic"
                    else           -> "Roads Clear"
                }

                val aiTip = when {
                    maxCount > 60 -> "Avoid $maxName ($maxCount vehicles). AI suggests alternate routes via lower-traffic junctions."
                    maxCount > 30 -> "$maxName is moderately busy. Consider leaving 10 mins early."
                    else          -> "All routes are flowing smoothly. Safe travels!"
                }

                trySend(
                    TrafficStatus(
                        cityStatus = cityStatus,
                        activeSignals = activeSignals,
                        activeIncidents = highCount,
                        averageSpeedKmh = avgSpeed,
                        peakHourWarning = highCount > 5,
                        aiTip = aiTip
                    )
                )
            }
        awaitClose { subscription.remove() }
    }

    // ── NEW: Get live incidents from Firestore ───────────────────────────────
    fun getLiveIncidents(): Flow<List<Alert>> = callbackFlow {
        val subscription = db.collection("incidents")
            .whereEqualTo("active", true)
            .addSnapshotListener { snapshot, error ->
                if (error != null) return@addSnapshotListener
                val incidents = snapshot?.documents?.mapNotNull { doc ->
                    Alert(
                        id = doc.id,
                        title = (doc.getString("type") ?: "Incident").replaceFirstChar { it.uppercase() }.replace("_", " "),
                        description = "${doc.getString("description") ?: "Incident reported"} at ${doc.getString("junction_name") ?: "Unknown"}",
                        type = doc.getString("type") ?: "warning",
                        severity = doc.getString("severity") ?: "Medium",
                        lat = 19.9975, lng = 73.7898,
                        timestamp = "ETA: ${doc.getLong("clearance_eta_min") ?: 30}m"
                    )
                } ?: emptyList()
                trySend(incidents)
            }
        awaitClose { subscription.remove() }
    }

    // ── NEW: Submit citizen report to Firestore ──────────────────────────────
    suspend fun submitCitizenReport(
        type: String,
        description: String,
        lat: Double,
        lng: Double,
        userId: String = "citizen_app_user"
    ): Boolean {
        return try {
            db.collection("citizen_reports").add(
                hashMapOf(
                    "type" to type,
                    "description" to description,
                    "lat" to lat,
                    "lng" to lng,
                    "userId" to userId,
                    "status" to "Pending",
                    "submitted_at" to java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.getDefault()).format(java.util.Date()),
                    "timestamp" to com.google.firebase.firestore.FieldValue.serverTimestamp()
                )
            ).await()
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}
