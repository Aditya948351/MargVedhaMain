package com.margvedha.citizen.ui.screens.transport

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController

data class BusRoute(
    val routeNumber: String,
    val from: String,
    val to: String,
    val etaMinutes: Int,
    val crowding: String,
    val crowdColor: Color
)

val sampleRoutes = listOf(
    BusRoute("N-17", "CBS Stand", "Panchavati", 5, "Low", Color(0xFF10B981)),
    BusRoute("N-22", "Gangapur Road", "Nashik Road", 12, "High", Color(0xFFEF4444)),
    BusRoute("N-8", "MIDC Satpur", "Old Nashik", 18, "Medium", Color(0xFFF59E0B)),
    BusRoute("N-31", "Dwarka Circle", "Mahamarg Stand", 3, "Low", Color(0xFF10B981)),
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PublicTransportScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Public Transport", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding).padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            item {
                Text("Live Bus Tracking", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Spacer(modifier = Modifier.height(4.dp))
                Text("Real-time ETA powered by AI traffic data", fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
            }
            items(sampleRoutes) { route ->
                BusRouteCard(route)
            }
            item { Spacer(modifier = Modifier.height(80.dp)) }
        }
    }
}

@Composable
fun BusRouteCard(route: BusRoute) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Surface(
                color = Color(0xFF2563EB).copy(alpha = 0.15f),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.size(48.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.DirectionsBus, contentDescription = null, tint = Color(0xFF2563EB))
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("Route ${route.routeNumber}", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Surface(color = route.crowdColor.copy(0.15f), shape = RoundedCornerShape(50)) {
                        Text(route.crowding, color = route.crowdColor, fontSize = 10.sp, fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp))
                    }
                }
                Text("${route.from} → ${route.to}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("${route.etaMinutes}", fontWeight = FontWeight.ExtraBold, fontSize = 24.sp, color = Color(0xFF2563EB))
                Text("mins", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
            }
        }
    }
}
