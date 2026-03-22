package com.margvedha.citizen.ui.screens.parking

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.margvedha.citizen.data.dummy.DummyRepository
import com.margvedha.citizen.data.model.ParkingSpotResponse
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ParkingScreen(navController: NavController) {
    val scope = rememberCoroutineScope()
    var spots by remember { mutableStateOf<List<ParkingSpotResponse>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        scope.launch {
            spots = DummyRepository.getNearbyParking()
            loading = false
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Smart Parking", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { padding ->
        if (loading) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Summary bar
                item {
                    val totalFree = spots.sumOf { it.availableSlots }
                    val totalSlots = spots.sumOf { it.totalSlots }
                    Row(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        SummaryChip("$totalFree Available", Color(0xFF10B981), Icons.Default.CheckCircle)
                        SummaryChip("${totalSlots - totalFree} Occupied", Color(0xFFEF4444), Icons.Default.Cancel)
                        SummaryChip("${spots.size} Zones", Color(0xFF2563EB), Icons.Default.LocalParking)
                    }
                    Spacer(Modifier.height(8.dp))
                    Text("Nearby Parking Zones", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }
                items(spots) { spot ->
                    ParkingCard(spot)
                }
                item { Spacer(Modifier.height(80.dp)) }
            }
        }
    }
}

@Composable
fun SummaryChip(label: String, color: Color, icon: androidx.compose.ui.graphics.vector.ImageVector) {
    Surface(
        color = color.copy(0.1f),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(14.dp))
            Text(label, color = color, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun ParkingCard(spot: ParkingSpotResponse) {
    val pct = spot.availableSlots.toFloat() / spot.totalSlots.coerceAtLeast(1)
    val color = when {
        pct == 0f -> Color(0xFFEF4444)
        pct < 0.3f -> Color(0xFFF97316)
        pct < 0.7f -> Color(0xFFF59E0B)
        else -> Color(0xFF10B981)
    }
    val statusLabel = when {
        pct == 0f -> "Full"
        pct < 0.3f -> "Almost Full"
        pct < 0.7f -> "Available"
        else -> "Plenty"
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        elevation = CardDefaults.cardElevation(1.dp)
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(color = color.copy(0.15f), shape = RoundedCornerShape(12.dp), modifier = Modifier.size(44.dp)) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.LocalParking, contentDescription = null, tint = color)
                    }
                }
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(spot.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text("${spot.distanceKm} km away", fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(0.55f))
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text("${spot.availableSlots}", fontWeight = FontWeight.ExtraBold, fontSize = 24.sp, color = color)
                    Text("/ ${spot.totalSlots} free", fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(0.5f))
                }
            }
            Spacer(Modifier.height(10.dp))
            LinearProgressIndicator(
                progress = { pct },
                modifier = Modifier.fillMaxWidth().height(6.dp),
                color = color,
                trackColor = MaterialTheme.colorScheme.outline.copy(0.15f)
            )
            Spacer(Modifier.height(8.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Surface(color = color.copy(0.1f), shape = RoundedCornerShape(50)) {
                    Text(statusLabel, color = color, fontSize = 11.sp, fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp))
                }
                TextButton(onClick = {}) {
                    Text("Navigate →", fontSize = 12.sp)
                }
            }
        }
    }
}
