package com.margvedha.citizen.ui.screens.map

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.navigation.NavController
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import org.osmdroid.views.overlay.Polyline
import com.margvedha.citizen.data.FirebaseRepository
import androidx.compose.runtime.collectAsState

// ─────────────────────────────────────────────────────────────────────────────
// Junction Data Model
// ─────────────────────────────────────────────────────────────────────────────
private data class Junction(
    val id: String,
    val name: String,
    val lat: Double,
    val lng: Double,
    val neighbours: List<String>  // road-connected junction IDs
)

private val JUNCTIONS = listOf(
    Junction("cbs_circle",          "CBS Circle",          19.9975, 73.7898, listOf("bytco_point","ashok_stambh","lekha_nagar","upnagar","college_road")),
    Junction("nashik_road",         "Nashik Road",         20.0060, 73.7720, listOf("makhmalabad_naka","dwarka_circle","shalimar")),
    Junction("gangapur_road",       "Gangapur Road",       19.9850, 73.7900, listOf("trimbak_naka","indiranagar","untwadi","cbs_circle")),
    Junction("dwarka_circle",       "Dwarka Circle",       20.0010, 73.7770, listOf("nashik_road","rajiv_gandhi_bhavan","shalimar")),
    Junction("rajiv_gandhi_bhavan", "Rajiv Gandhi Bhavan", 19.9910, 73.7840, listOf("dwarka_circle","college_road","ashok_stambh")),
    Junction("college_road",        "College Road",        19.9990, 73.7860, listOf("rajiv_gandhi_bhavan","upnagar","cbs_circle")),
    Junction("mumbai_naka",         "Mumbai Naka",         19.9930, 73.8020, listOf("lekha_nagar","pathardi_phata","bytco_point")),
    Junction("ashok_stambh",        "Ashok Stambh",        19.9960, 73.7840, listOf("cbs_circle","rajiv_gandhi_bhavan","bytco_point")),
    Junction("shalimar",            "Shalimar",            20.0040, 73.7810, listOf("nashik_road","dwarka_circle","upnagar")),
    Junction("bytco_point",         "Bytco Point",         19.9950, 73.7870, listOf("cbs_circle","ashok_stambh","mumbai_naka")),
    Junction("pathardi_phata",      "Pathardi Phata",      20.0120, 73.7980, listOf("mumbai_naka","ambad_link_road","satpur_midc")),
    Junction("ambad_link_road",     "Ambad Link Road",     20.0090, 73.7940, listOf("pathardi_phata","satpur_midc")),
    Junction("satpur_midc",         "Satpur MIDC",         20.0000, 73.7650, listOf("ambad_link_road","makhmalabad_naka","nashik_road")),
    Junction("trimbak_naka",        "Trimbak Naka",        19.9820, 73.7780, listOf("gangapur_road","panchavati","indiranagar")),
    Junction("lekha_nagar",         "Lekha Nagar",         19.9970, 73.7950, listOf("cbs_circle","mumbai_naka")),
    Junction("upnagar",             "Upnagar",             20.0030, 73.7880, listOf("cbs_circle","college_road","shalimar")),
    Junction("indiranagar",         "Indiranagar",         19.9900, 73.7810, listOf("gangapur_road","trimbak_naka","untwadi")),
    Junction("untwadi",             "Untwadi",             19.9940, 73.7760, listOf("gangapur_road","indiranagar","cbs_circle")),
    Junction("makhmalabad_naka",    "Makhmalabad Naka",    20.0080, 73.7700, listOf("nashik_road","satpur_midc","shalimar")),
    Junction("panchavati",          "Panchavati",          20.0020, 73.7920, listOf("trimbak_naka","cbs_circle","upnagar")),
)

private val junctionById = JUNCTIONS.associateBy { it.id }

// ─────────────────────────────────────────────────────────────────────────────
// Dijkstra – find road-following path using live traffic as edge weight
// ─────────────────────────────────────────────────────────────────────────────
private fun findRoute(fromId: String, toId: String, traffic: Map<String, Int>): List<Junction> {
    data class State(val cost: Float, val id: String, val path: List<String>)
    val visited = mutableSetOf<String>()
    val pq = java.util.PriorityQueue<State>(compareBy { it.cost })
    pq.add(State(0f, fromId, listOf(fromId)))
    while (pq.isNotEmpty()) {
        val (cost, id, path) = pq.poll()!!
        if (id == toId) return path.mapNotNull { junctionById[it] }
        if (id in visited) continue
        visited.add(id)
        val junc = junctionById[id] ?: continue
        for (nbId in junc.neighbours) {
            if (nbId in visited) continue
            val trafficPenalty = (traffic[nbId] ?: 0) / 10f
            pq.add(State(cost + 1f + trafficPenalty, nbId, path + nbId))
        }
    }
    // Fallback: direct connection
    return listOfNotNull(junctionById[fromId], junctionById[toId])
}

private fun routeColor(totalTraffic: Int): Int = when {
    totalTraffic > 80 -> Color.Red.toArgb()
    totalTraffic > 30 -> Color(0xFFFF8800).toArgb()
    else              -> Color(0xFF22C55E).toArgb()
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LiveMapScreen(navController: NavController) {
    val context = LocalContext.current
    val junctionStatus by FirebaseRepository.getJunctionStatus().collectAsState(initial = emptyMap())
    val busRoutes      by FirebaseRepository.getBusRoutes().collectAsState(initial = emptyList())

    Configuration.getInstance().userAgentValue = context.packageName
    val nashikCenter = GeoPoint(19.9975, 73.7898)

    var fromJunction by remember { mutableStateOf(JUNCTIONS[0]) }
    var toJunction   by remember { mutableStateOf(JUNCTIONS[9]) }
    var fromExpanded by remember { mutableStateOf(false) }
    var toExpanded   by remember { mutableStateOf(false) }
    var showBusPanel by remember { mutableStateOf(false) }

    // Compute road-following route
    val routePath = remember(fromJunction, toJunction, junctionStatus) {
        findRoute(fromJunction.id, toJunction.id, junctionStatus.mapKeys { entry ->
            JUNCTIONS.find { it.name == entry.key }?.id ?: entry.key
        })
    }
    val totalTraffic = routePath.sumOf { junctionStatus[it.name] ?: 0 }

    val aiSuggestion = when {
        fromJunction.id == toJunction.id -> "⚠️ Select different stops."
        totalTraffic > 80 -> "🔴 Heavy congestion ($totalTraffic vehicles) via ${routePath.size} junctions. AI rerouted. ETA: ~${30 + totalTraffic / 5}m."
        totalTraffic > 30 -> "🟡 Moderate ($totalTraffic vehicles) — ${routePath.joinToString(" → ") { it.name.split(" ").first() }}. ETA: ~${15 + totalTraffic / 8}m."
        else              -> "🟢 Clear road via ${routePath.joinToString(" → ") { it.name.split(" ").first() }}. ETA: ~12m."
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Live Traffic Map", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { showBusPanel = !showBusPanel }) {
                        Icon(Icons.Default.List, "Bus Routes")
                    }
                }
            )
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {

            // ── OSMdroid Map ───────────────────────────────────────────────
            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { ctx ->
                    MapView(ctx).apply {
                        setTileSource(TileSourceFactory.MAPNIK)
                        setMultiTouchControls(true)
                        controller.setZoom(13.5)
                        controller.setCenter(nashikCenter)
                    }
                },
                update = { mapView ->
                    mapView.overlays.clear()

                    // Draw all 20 junction markers with live congestion status
                    JUNCTIONS.forEach { junc ->
                        val count = junctionStatus[junc.name] ?: 0
                        val marker = Marker(mapView).apply {
                            position = GeoPoint(junc.lat, junc.lng)
                            title = junc.name
                            snippet = when {
                                count > 50 -> "🔴 High – $count vehicles"
                                count > 20 -> "🟡 Moderate – $count vehicles"
                                else       -> "🟢 Clear – $count vehicles"
                            }
                            setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                            setOnMarkerClickListener { m, _ -> m.showInfoWindow(); true }
                        }
                        mapView.overlays.add(marker)
                    }

                    // Draw road-following route polyline (multi-waypoint)
                    if (routePath.size >= 2) {
                        val routeLine = Polyline().apply {
                            setPoints(routePath.map { GeoPoint(it.lat, it.lng) })
                            outlinePaint.color = routeColor(totalTraffic)
                            outlinePaint.strokeWidth = 14f
                            outlinePaint.strokeCap = android.graphics.Paint.Cap.ROUND
                            outlinePaint.strokeJoin = android.graphics.Paint.Join.ROUND
                        }
                        mapView.overlays.add(routeLine)

                        // Add small dot markers on each waypoint
                        routePath.drop(1).dropLast(1).forEach { wp ->
                            val dot = Marker(mapView).apply {
                                position = GeoPoint(wp.lat, wp.lng)
                                title = wp.name
                                snippet = "Waypoint – ${junctionStatus[wp.name] ?: 0} vehicles"
                                setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_CENTER)
                            }
                            mapView.overlays.add(dot)
                        }
                    }

                    mapView.invalidate()
                }
            )

            // ── AI Badge (top) ─────────────────────────────────────────────
            Surface(
                modifier = Modifier.align(Alignment.TopCenter).padding(top = 16.dp).clip(RoundedCornerShape(50)),
                color = MaterialTheme.colorScheme.primary.copy(0.15f)
            ) {
                Row(Modifier.padding(horizontal = 14.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Star, null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(14.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("AI Route Advisor LIVE", color = MaterialTheme.colorScheme.primary, fontSize = 11.sp, fontWeight = FontWeight.ExtraBold)
                }
            }

            // ── Bus Routes Panel (if visible) ──────────────────────────────
            if (showBusPanel && busRoutes.isNotEmpty()) {
                Card(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(top = 56.dp, end = 12.dp)
                        .width(220.dp),
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(8.dp)
                ) {
                    Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text("🚌 Bus ETAs", fontWeight = FontWeight.ExtraBold, fontSize = 14.sp)
                        busRoutes.forEach { route ->
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(route.routeId, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                Text("${route.etaMinutes}m", fontSize = 12.sp)
                            }
                            Text(route.congestion, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(0.5f))
                        }
                    }
                }
            }

            // ── Route Selector Card (bottom) ───────────────────────────────
            Card(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .padding(start = 12.dp, end = 12.dp, bottom = 100.dp),
                shape = RoundedCornerShape(24.dp),
                elevation = CardDefaults.cardElevation(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(Modifier.padding(horizontal = 20.dp, vertical = 16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("📍 Plan Your Route", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, modifier = Modifier.weight(1f))
                        Text("${routePath.size} stops", fontSize = 11.sp, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                    }
                    Spacer(Modifier.height(12.dp))

                    // FROM
                    Box {
                        OutlinedTextField(
                            value = fromJunction.name, onValueChange = {}, readOnly = true,
                            label = { Text("From (Bus Stop)") },
                            modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(14.dp), singleLine = true,
                            leadingIcon = { Icon(Icons.Default.LocationOn, null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp)) },
                            trailingIcon = { IconButton(onClick = { fromExpanded = true }) { Icon(Icons.Default.List, null) } }
                        )
                        Box(Modifier.matchParentSize().clickable { fromExpanded = true })
                        DropdownMenu(expanded = fromExpanded, onDismissRequest = { fromExpanded = false }) {
                            JUNCTIONS.forEach { j -> DropdownMenuItem(text = { Text(j.name) }, onClick = { fromJunction = j; fromExpanded = false }) }
                        }
                    }
                    Spacer(Modifier.height(8.dp))

                    // TO
                    Box {
                        OutlinedTextField(
                            value = toJunction.name, onValueChange = {}, readOnly = true,
                            label = { Text("To (Bus Stop)") },
                            modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(14.dp), singleLine = true,
                            leadingIcon = { Icon(Icons.Default.LocationOn, null, tint = Color.Red, modifier = Modifier.size(18.dp)) },
                            trailingIcon = { IconButton(onClick = { toExpanded = true }) { Icon(Icons.Default.List, null) } }
                        )
                        Box(Modifier.matchParentSize().clickable { toExpanded = true })
                        DropdownMenu(expanded = toExpanded, onDismissRequest = { toExpanded = false }) {
                            JUNCTIONS.forEach { j -> DropdownMenuItem(text = { Text(j.name) }, onClick = { toJunction = j; toExpanded = false }) }
                        }
                    }
                    Spacer(Modifier.height(12.dp))

                    // AI suggestion with color background
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = when {
                            totalTraffic > 80 -> Color(0xFFFFE0E0)
                            totalTraffic > 30 -> Color(0xFFFFF3E0)
                            else              -> Color(0xFFE8F5E9)
                        }
                    ) {
                        Text(
                            aiSuggestion,
                            modifier = Modifier.fillMaxWidth().padding(12.dp),
                            fontSize = 13.sp, fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }
    }
}
