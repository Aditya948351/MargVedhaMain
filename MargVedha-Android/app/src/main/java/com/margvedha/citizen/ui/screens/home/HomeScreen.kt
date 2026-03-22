package com.margvedha.citizen.ui.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.margvedha.citizen.data.dummy.DummyRepository
import com.margvedha.citizen.data.model.Alert
import com.margvedha.citizen.data.model.TrafficStatus
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(navController: NavController) {
    val scope = rememberCoroutineScope()
    var trafficStatus by remember { mutableStateOf<TrafficStatus?>(null) }
    var alerts by remember { mutableStateOf<List<Alert>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        scope.launch {
            trafficStatus = DummyRepository.getTrafficStatus()
            alerts = DummyRepository.getAlerts().take(3)
            loading = false
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Marg Vedha", fontWeight = FontWeight.ExtraBold, fontSize = 20.sp)
                        Text("Nashik, Maharashtra", fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.55f))
                    }
                },
                actions = {
                    IconButton(onClick = { navController.navigate("alerts") }) {
                        BadgedBox(badge = { Badge { Text("${alerts.size}") } }) {
                            Icon(Icons.Default.Notifications, contentDescription = "Alerts")
                        }
                    }
                    IconButton(onClick = { navController.navigate("profile") }) {
                        Icon(Icons.Default.AccountCircle, contentDescription = "Profile")
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
            return@Scaffold
        }
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(bottom = 16.dp),
            verticalArrangement = Arrangement.spacedBy(0.dp)
        ) {
            // ── Hero Status Card ──────────────────────────────────────────────
            item {
                trafficStatus?.let { status ->
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Brush.linearGradient(listOf(Color(0xFF1E3A5F), Color(0xFF2563EB))))
                            .padding(20.dp)
                    ) {
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Traffic, contentDescription = null,
                                    tint = Color.White.copy(alpha = 0.7f), modifier = Modifier.size(18.dp))
                                Spacer(Modifier.width(6.dp))
                                Text("CITY TRAFFIC STATUS", color = Color.White.copy(alpha = 0.7f),
                                    fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                            }
                            Spacer(Modifier.height(6.dp))
                            Text(status.cityStatus, color = Color.White,
                                fontWeight = FontWeight.ExtraBold, fontSize = 26.sp)
                            Spacer(Modifier.height(14.dp))
                            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                item { StatPill("${status.activeSignals} Signals", Color(0xFF10B981)) }
                                item { StatPill("${status.activeIncidents} Incidents", Color(0xFFF97316)) }
                                item { StatPill("Avg ${status.averageSpeedKmh} km/h", Color(0xFF60A5FA)) }
                                if (status.peakHourWarning)
                                    item { StatPill("⚠ Peak Hour", Color(0xFFF59E0B)) }
                            }
                            if (status.aiTip.isNotEmpty()) {
                                Spacer(Modifier.height(14.dp))
                                Surface(
                                    color = Color.White.copy(alpha = 0.12f),
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Row(Modifier.padding(10.dp), verticalAlignment = Alignment.Top) {
                                        Text("💡 ", fontSize = 14.sp)
                                        Text(status.aiTip, color = Color.White.copy(alpha = 0.9f), fontSize = 13.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // ── Quick Actions ────────────────────────────────────────────────
            item {
                Column(Modifier.padding(16.dp)) {
                    Text("Quick Actions", fontWeight = FontWeight.Bold, fontSize = 17.sp)
                    Spacer(Modifier.height(12.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        QuickAction("Navigate", Icons.Default.Directions, Color(0xFF2563EB), Modifier.weight(1f)) {
                            navController.navigate("live_map")
                        }
                        QuickAction("Report", Icons.Default.ReportProblem, Color(0xFFEF4444), Modifier.weight(1f)) {
                            navController.navigate("report")
                        }
                        QuickAction("Bus ETA", Icons.Default.DirectionsBus, Color(0xFF10B981), Modifier.weight(1f)) {
                            navController.navigate("public_transport")
                        }
                        QuickAction("Parking", Icons.Default.LocalParking, Color(0xFF7C3AED), Modifier.weight(1f)) {
                            navController.navigate("parking")
                        }
                    }
                }
            }

            // ── Stats Row ────────────────────────────────────────────────────
            item {
                Divider(modifier = Modifier.padding(horizontal = 16.dp))
                Row(
                    Modifier.fillMaxWidth().padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    MiniStat("42", "Active\nSignals", Color(0xFF2563EB))
                    VertDivider()
                    MiniStat("8", "Open\nIncidents", Color(0xFFEF4444))
                    VertDivider()
                    MiniStat("28.4", "Avg Speed\n(km/h)", Color(0xFF10B981))
                    VertDivider()
                    MiniStat("94%", "AI\nAccuracy", Color(0xFF7C3AED))
                }
                Divider(modifier = Modifier.padding(horizontal = 16.dp))
            }

            // ── Nearby Incidents ─────────────────────────────────────────────
            item {
                Column(Modifier.padding(start = 16.dp, end = 16.dp, top = 16.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically) {
                        Text("Nearby Incidents", fontWeight = FontWeight.Bold, fontSize = 17.sp)
                        TextButton(onClick = { navController.navigate("alerts") }) {
                            Text("See all →", fontSize = 13.sp)
                        }
                    }
                }
            }
            items(alerts) { alert ->
                HomeAlertRow(alert, navController)
            }

            item { Spacer(Modifier.height(8.dp)) }
        }
    }
}

@Composable
fun StatPill(label: String, color: Color) {
    Surface(color = color.copy(alpha = 0.25f), shape = RoundedCornerShape(50)) {
        Text(label, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp))
    }
}

@Composable
fun QuickAction(label: String, icon: ImageVector, color: Color, modifier: Modifier, onClick: () -> Unit) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(color.copy(alpha = 0.1f))
            .clickable(onClick = onClick)
            .padding(vertical = 14.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(icon, contentDescription = label, tint = color, modifier = Modifier.size(26.dp))
        Spacer(Modifier.height(6.dp))
        Text(label, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = color)
    }
}

@Composable
fun MiniStat(value: String, label: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, fontWeight = FontWeight.ExtraBold, fontSize = 22.sp, color = color)
        Text(label, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
            textAlign = androidx.compose.ui.text.style.TextAlign.Center)
    }
}

@Composable
fun VertDivider() {
    Divider(modifier = Modifier.height(40.dp).width(1.dp),
        color = MaterialTheme.colorScheme.outlineVariant)
}

@Composable
fun HomeAlertRow(alert: Alert, navController: NavController) {
    val color = when (alert.severity) {
        "Critical" -> Color(0xFFEF4444)
        "High" -> Color(0xFFF97316)
        "Medium" -> Color(0xFFF59E0B)
        else -> Color(0xFF10B981)
    }
    val icon = when (alert.type) {
        "accident" -> Icons.Default.CarCrash
        "signal" -> Icons.Default.TrafficOutlined
        "closure" -> Icons.Default.Block
        "weather" -> Icons.Default.Thunderstorm
        "vip" -> Icons.Default.Shield
        else -> Icons.Default.Warning
    }
    Surface(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 6.dp),
        shape = RoundedCornerShape(14.dp),
        color = MaterialTheme.colorScheme.surfaceVariant,
        onClick = { navController.navigate("alerts") }
    ) {
        Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier.size(44.dp).clip(RoundedCornerShape(12.dp)).background(color.copy(0.15f)),
                contentAlignment = Alignment.Center
            ) { Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(22.dp)) }
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(alert.title, fontWeight = FontWeight.SemiBold, fontSize = 14.sp,
                    maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(alert.description, fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                    maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            Spacer(Modifier.width(8.dp))
            Column(horizontalAlignment = Alignment.End) {
                Surface(color = color.copy(0.15f), shape = RoundedCornerShape(50)) {
                    Text(alert.severity, color = color, fontSize = 10.sp, fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp))
                }
                Spacer(Modifier.height(4.dp))
                Text(alert.timestamp, fontSize = 10.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f))
            }
        }
    }
}
