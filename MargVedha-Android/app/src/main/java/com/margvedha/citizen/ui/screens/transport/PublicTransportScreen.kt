package com.margvedha.citizen.ui.screens.transport

import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.margvedha.citizen.data.dummy.DummyRepository
import com.margvedha.citizen.data.model.BusRouteResponse
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PublicTransportScreen(navController: NavController) {
    val scope = rememberCoroutineScope()
    var routes by remember { mutableStateOf<List<BusRouteResponse>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        scope.launch {
            routes = DummyRepository.getBusRoutes()
            loading = false
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Public Transport", fontWeight = FontWeight.Bold) },
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
                // Hero banner
                item {
                    Box(
                        Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(18.dp))
                            .background(Brush.linearGradient(listOf(Color(0xFF0C4A6E), Color(0xFF0EA5E9))))
                            .padding(18.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.DirectionsBus, contentDescription = null,
                                tint = Color.White, modifier = Modifier.size(36.dp))
                            Spacer(Modifier.width(14.dp))
                            Column {
                                Text("AI-Powered Bus ETA", color = Color.White,
                                    fontWeight = FontWeight.ExtraBold, fontSize = 16.sp)
                                Text("Live position tracking • Crowding alerts",
                                    color = Color.White.copy(0.7f), fontSize = 12.sp)
                            }
                        }
                    }
                    Spacer(Modifier.height(8.dp))
                    Text("${routes.size} Routes Nearby", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }

                items(routes) { route ->
                    BusRouteCard(route)
                }
                item { Spacer(Modifier.height(80.dp)) }
            }
        }
    }
}

@Composable
fun BusRouteCard(route: BusRouteResponse) {
    val crowdColor = when (route.crowdingLevel) {
        "High" -> Color(0xFFEF4444)
        "Medium" -> Color(0xFFF59E0B)
        else -> Color(0xFF10B981)
    }
    val etaColor = when {
        route.etaMinutes <= 5 -> Color(0xFF10B981)
        route.etaMinutes <= 15 -> Color(0xFFF59E0B)
        else -> Color(0xFFEF4444)
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column {
            // Header strip
            Row(
                Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF1D4ED8).copy(0.07f))
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(color = Color(0xFF1D4ED8).copy(0.12f), shape = RoundedCornerShape(8.dp)) {
                    Text("Route ${route.routeNumber}", color = Color(0xFF1D4ED8),
                        fontWeight = FontWeight.ExtraBold, fontSize = 13.sp,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp))
                }
                Spacer(Modifier.width(10.dp))
                Icon(Icons.Default.ArrowForward, contentDescription = null,
                    modifier = Modifier.size(14.dp), tint = MaterialTheme.colorScheme.onSurface.copy(0.4f))
                Spacer(Modifier.width(6.dp))
                Text("${route.fromStop} → ${route.toStop}", fontWeight = FontWeight.SemiBold, fontSize = 13.sp,
                    modifier = Modifier.weight(1f))
                Surface(color = crowdColor.copy(0.12f), shape = RoundedCornerShape(50)) {
                    Text(route.crowdingLevel, color = crowdColor, fontSize = 10.sp, fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp))
                }
            }

            // Body
            Row(
                Modifier.fillMaxWidth().padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.DirectionsBus, contentDescription = null,
                    tint = Color(0xFF0EA5E9), modifier = Modifier.size(24.dp))
                Spacer(Modifier.width(10.dp))
                Column(Modifier.weight(1f)) {
                    Text("Next bus arriving", fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(0.55f))
                    LinearProgressIndicator(
                        progress = { 1f - (route.etaMinutes / 30f).coerceIn(0f, 1f) },
                        modifier = Modifier.fillMaxWidth().padding(top = 6.dp).height(4.dp),
                        color = etaColor,
                        trackColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                }
                Spacer(Modifier.width(16.dp))
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("${route.etaMinutes}", fontWeight = FontWeight.ExtraBold,
                        fontSize = 30.sp, color = etaColor)
                    Text("min", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(0.5f))
                }
            }
        }
    }
}
