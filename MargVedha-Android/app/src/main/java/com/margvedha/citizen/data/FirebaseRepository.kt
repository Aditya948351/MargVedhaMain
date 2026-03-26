package com.margvedha.citizen.data

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import com.margvedha.citizen.data.model.Alert
import com.margvedha.citizen.data.model.BusRoute
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow

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
}
