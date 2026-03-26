package com.margvedha.citizen.ui.screens.alerts

import androidx.compose.animation.*
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.margvedha.citizen.data.FirebaseRepository
import com.margvedha.citizen.data.model.Alert
import kotlinx.coroutines.flow.collect

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AlertsScreen(navController: NavController) {
    val alerts by FirebaseRepository.getFines("MH 15 LB 7524").collectAsState(initial = emptyList())
    var loading by remember { mutableStateOf(false) } // Set to false manually as flow handles empty init
    var selectedFilter by remember { mutableStateOf("All") }
    val filters = listOf("All", "High", "Info")

    val filtered = if (selectedFilter == "All") alerts else alerts.filter { it.severity == selectedFilter }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Traffic Alerts", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            // Filter chips
            Row(
                Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                filters.forEach { f ->
                    FilterChip(
                        selected = selectedFilter == f,
                        onClick = { selectedFilter = f },
                        label = { Text(f, fontSize = 12.sp) },
                        shape = RoundedCornerShape(50)
                    )
                }
            }
            Divider()

            if (loading) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    item {
                        AIForecastCard()
                    }
                    item {
                        Text("${filtered.size} Incidents", fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                            fontWeight = FontWeight.Medium)
                    }
                    items(filtered) { alert ->
                        AlertDetailCard(alert)
                    }
                    item { Spacer(Modifier.height(80.dp)) }
                }
            }
        }
    }
}

@Composable
fun AlertDetailCard(alert: Alert) {
    val (color, icon) = alertStyle(alert)

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column {
            // Top colored strip
            Divider(color = color, thickness = 3.dp)
            Row(Modifier.padding(14.dp)) {
                Surface(
                    color = color.copy(0.12f),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.size(48.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(24.dp))
                    }
                }
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(alert.title, fontWeight = FontWeight.Bold, fontSize = 15.sp, modifier = Modifier.weight(1f))
                        Spacer(Modifier.width(8.dp))
                        SeverityBadge(alert.severity, color)
                    }
                    Spacer(Modifier.height(4.dp))
                    Text(alert.description, fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.65f),
                        maxLines = 2, overflow = TextOverflow.Ellipsis)
                    Spacer(Modifier.height(8.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.AccessTime, contentDescription = null,
                            modifier = Modifier.size(12.dp),
                            tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f))
                        Spacer(Modifier.width(4.dp))
                        Text(alert.timestamp, fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f))
                        Spacer(Modifier.width(12.dp))
                        Icon(Icons.Default.LocationOn, contentDescription = null,
                            modifier = Modifier.size(12.dp),
                            tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f))
                        Spacer(Modifier.width(2.dp))
                        Text("${String.format("%.4f", alert.lat)}, ${String.format("%.4f", alert.lng)}",
                            fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f))
                    }
                }
            }
        }
    }
}

@Composable
fun SeverityBadge(severity: String, color: Color) {
    Surface(color = color.copy(0.12f), shape = RoundedCornerShape(50)) {
        Text(severity, color = color, fontSize = 10.sp, fontWeight = FontWeight.ExtraBold,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp))
    }
}

fun alertStyle(alert: Alert): Pair<Color, ImageVector> {
    val color = when (alert.severity) {
        "Critical" -> Color(0xFFEF4444)
        "High" -> Color(0xFFF97316)
        "Medium" -> Color(0xFFF59E0B)
        "Info" -> Color(0xFF3B82F6)
        else -> Color(0xFF10B981)
    }
    val icon = when (alert.type) {
        "accident" -> Icons.Default.Warning
        "signal" -> Icons.Default.Place
        "closure" -> Icons.Default.Clear
        "weather" -> Icons.Default.Info
        "vip" -> Icons.Default.Star
        else -> Icons.Default.Notifications
    }
    return Pair(color, icon)
}

@Composable
fun AIForecastCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.7f)
        ),
        elevation = CardDefaults.cardElevation(0.dp)
    ) {
        Column(Modifier.padding(20.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Star, contentDescription = null, 
                     tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                Spacer(Modifier.width(8.dp))
                Text("Smart AI Forecast", fontWeight = FontWeight.ExtraBold, 
                     color = MaterialTheme.colorScheme.onPrimaryContainer)
            }
            Spacer(Modifier.height(12.dp))
            Text(
                "Based on current YOLOv11 telemetry, CBS Circle congestion is expected to decrease by 15% in the next 10 minutes.",
                fontSize = 14.sp,
                lineHeight = 20.sp,
                color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
            )
            Spacer(Modifier.height(16.dp))
            LinearProgressIndicator(
                progress = 0.65f,
                modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(50)),
                color = MaterialTheme.colorScheme.primary,
                trackColor = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.1f)
            )
            Spacer(Modifier.height(8.dp))
            Text("Reliability: 94%", fontSize = 11.sp, fontWeight = FontWeight.Bold,
                 color = MaterialTheme.colorScheme.primary)
        }
    }
}
