package com.margvedha.citizen.ui.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Report
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.margvedha.citizen.navigation.Screen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Marg Vedha",
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp
                        )
                        Text(
                            text = "Welcome, Citizen 👋",
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { navController.navigate(Screen.Alerts.route) }) {
                        Icon(Icons.Default.Notifications, contentDescription = "Alerts")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            item { TrafficStatusCard() }
            item { SectionTitle("Quick Actions") }
            item { QuickActionsRow(navController) }
            item { SectionTitle("Nearby Incidents") }
            item { IncidentCard("Accident", "CBS Road, Nashik", "High", Color(0xFFEF4444)) }
            item { IncidentCard("Road Closure", "Dwarka Circle", "Medium", Color(0xFFF59E0B)) }
            item { IncidentCard("Signal Down", "Panchavati Corner", "Low", Color(0xFF10B981)) }
            item { Spacer(modifier = Modifier.height(80.dp)) }
        }
    }
}

@Composable
fun TrafficStatusCard() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(
                Brush.linearGradient(
                    listOf(Color(0xFF1E3A5F), Color(0xFF2563EB))
                )
            )
            .padding(20.dp)
    ) {
        Column {
            Text("City Traffic Status", color = Color.White.copy(alpha = 0.7f), fontSize = 13.sp)
            Spacer(modifier = Modifier.height(4.dp))
            Text("Moderate Congestion", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 24.sp)
            Spacer(modifier = Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatPill("42 Signals Active", Color(0xFF10B981))
                StatPill("8 Incidents", Color(0xFFF59E0B))
                StatPill("Avg 28 km/h", Color(0xFF3B82F6))
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                "💡 Tip: Avoid CBS Road for the next 30 minutes. Use College Road as alternate.",
                color = Color.White.copy(alpha = 0.85f),
                fontSize = 12.sp
            )
        }
    }
}

@Composable
fun StatPill(label: String, color: Color) {
    Surface(
        color = color.copy(alpha = 0.3f),
        shape = RoundedCornerShape(50)
    ) {
        Text(
            text = label,
            color = Color.White,
            fontSize = 11.sp,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
        )
    }
}

@Composable
fun SectionTitle(title: String) {
    Text(title, fontWeight = FontWeight.Bold, fontSize = 17.sp)
}

@Composable
fun QuickActionsRow(navController: NavController) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        QuickActionCard("Navigate", Icons.Default.LocationOn, Color(0xFF2563EB), Modifier.weight(1f)) {
            navController.navigate(Screen.LiveMap.route)
        }
        QuickActionCard("Report", Icons.Default.Report, Color(0xFFEF4444), Modifier.weight(1f)) {
            navController.navigate(Screen.Report.route)
        }
        QuickActionCard("Bus ETA", Icons.Default.DirectionsBus, Color(0xFF10B981), Modifier.weight(1f)) {
            navController.navigate(Screen.PublicTransport.route)
        }
    }
}

@Composable
fun QuickActionCard(label: String, icon: ImageVector, color: Color, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Card(
        modifier = modifier,
        onClick = onClick,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.1f)),
        elevation = CardDefaults.cardElevation(0.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(icon, contentDescription = label, tint = color, modifier = Modifier.size(28.dp))
            Spacer(modifier = Modifier.height(8.dp))
            Text(label, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = color)
        }
    }
}

@Composable
fun IncidentCard(type: String, location: String, severity: String, color: Color) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        elevation = CardDefaults.cardElevation(0.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(color.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.Notifications, contentDescription = type, tint = color)
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(type, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                Text(location, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
            }
            Surface(
                color = color.copy(alpha = 0.15f),
                shape = RoundedCornerShape(50)
            ) {
                Text(severity, color = color, fontSize = 11.sp, fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp))
            }
        }
    }
}
