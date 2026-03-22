package com.margvedha.citizen.ui.screens.parking

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.LocalParking
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController

data class ParkingSpot(val name: String, val distance: String, val available: Int, val total: Int)

val sampleParking = listOf(
    ParkingSpot("CBS Parking Zone A", "0.3 km", 12, 50),
    ParkingSpot("Mahamarg Bus Stand", "0.8 km", 0, 30),
    ParkingSpot("Panchavati Parking", "1.2 km", 8, 20),
    ParkingSpot("Old Nashik Market", "1.5 km", 25, 40),
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ParkingScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Smart Parking", fontWeight = FontWeight.Bold) },
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
            item { Text("Nearby Parking Spots", fontWeight = FontWeight.Bold, fontSize = 16.sp) }
            items(sampleParking) { spot ->
                ParkingCard(spot)
            }
        }
    }
}

@Composable
fun ParkingCard(spot: ParkingSpot) {
    val available = spot.available > 0
    val color = if (available) Color(0xFF10B981) else Color(0xFFEF4444)
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Surface(color = color.copy(0.15f), shape = RoundedCornerShape(12.dp), modifier = Modifier.size(48.dp)) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.LocalParking, contentDescription = null, tint = color)
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(spot.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text("${spot.distance} away", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                LinearProgressIndicator(
                    progress = { spot.available.toFloat() / spot.total },
                    modifier = Modifier.fillMaxWidth().padding(top = 6.dp),
                    color = color,
                    trackColor = MaterialTheme.colorScheme.surfaceVariant
                )
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("${spot.available}", fontWeight = FontWeight.ExtraBold, fontSize = 22.sp, color = color)
                Text("free", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
            }
        }
    }
}
