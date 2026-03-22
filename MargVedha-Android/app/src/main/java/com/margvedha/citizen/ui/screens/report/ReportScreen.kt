package com.margvedha.citizen.ui.screens.report

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportScreen(navController: NavController) {
    val scope = rememberCoroutineScope()
    var selectedType by remember { mutableStateOf("Pothole") }
    var description by remember { mutableStateOf("") }
    var locationLocked by remember { mutableStateOf(false) }
    var submitted by remember { mutableStateOf(false) }
    var submitting by remember { mutableStateOf(false) }

    val issueTypes = listOf(
        Triple("Pothole", Icons.Default.Construction, Color(0xFFF59E0B)),
        Triple("Traffic Jam", Icons.Default.Traffic, Color(0xFFEF4444)),
        Triple("Signal Issue", Icons.Default.TrafficOutlined, Color(0xFFF97316)),
        Triple("Accident", Icons.Default.CarCrash, Color(0xFFDC2626)),
        Triple("Road Block", Icons.Default.Block, Color(0xFF7C3AED)),
        Triple("Flooding", Icons.Default.Water, Color(0xFF0EA5E9)),
    )

    if (submitted) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(16.dp)) {
                Surface(
                    color = Color(0xFF10B981).copy(alpha = 0.15f),
                    shape = RoundedCornerShape(50),
                    modifier = Modifier.size(80.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null,
                            tint = Color(0xFF10B981), modifier = Modifier.size(44.dp))
                    }
                }
                Text("Report Submitted!", fontWeight = FontWeight.ExtraBold, fontSize = 22.sp)
                Text("Authorities have been notified.\nThank you for keeping Nashik safe.",
                    fontSize = 14.sp, textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                Button(
                    onClick = {
                        submitted = false
                        description = ""
                        selectedType = "Pothole"
                        locationLocked = false
                    },
                    shape = RoundedCornerShape(12.dp),
                    contentPadding = PaddingValues(horizontal = 32.dp, vertical = 12.dp)
                ) { Text("Report Another Issue") }
            }
        }
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Report Traffic Issue", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Issue Type Section
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                elevation = CardDefaults.cardElevation(0.dp)
            ) {
                Column(Modifier.padding(16.dp)) {
                    Text("Issue Type", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Spacer(Modifier.height(12.dp))
                    issueTypes.chunked(3).forEach { row ->
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth()) {
                            row.forEach { (type, icon, color) ->
                                val selected = selectedType == type
                                Surface(
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(12.dp),
                                    color = if (selected) color.copy(0.15f) else Color.Transparent,
                                    border = if (selected) ButtonDefaults.outlinedButtonBorder else null,
                                    onClick = { selectedType = type }
                                ) {
                                    Column(
                                        Modifier.padding(vertical = 12.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Icon(icon, contentDescription = type,
                                            tint = if (selected) color else MaterialTheme.colorScheme.onSurface.copy(0.5f),
                                            modifier = Modifier.size(24.dp))
                                        Spacer(Modifier.height(4.dp))
                                        Text(type, fontSize = 10.sp, fontWeight = FontWeight.SemiBold,
                                            color = if (selected) color else MaterialTheme.colorScheme.onSurface.copy(0.5f),
                                            textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                                    }
                                }
                            }
                        }
                        Spacer(Modifier.height(8.dp))
                    }
                }
            }

            // Description
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                elevation = CardDefaults.cardElevation(0.dp)
            ) {
                Column(Modifier.padding(16.dp)) {
                    Text("Description", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Spacer(Modifier.height(8.dp))
                    OutlinedTextField(
                        value = description,
                        onValueChange = { description = it },
                        placeholder = { Text("Describe the issue clearly...", fontSize = 13.sp) },
                        modifier = Modifier.fillMaxWidth().height(110.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = MaterialTheme.colorScheme.surface,
                            unfocusedContainerColor = MaterialTheme.colorScheme.surface
                        )
                    )
                }
            }

            // Location
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                elevation = CardDefaults.cardElevation(0.dp)
            ) {
                Column(Modifier.padding(16.dp)) {
                    Text("Location", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Spacer(Modifier.height(10.dp))
                    if (locationLocked) {
                        Row(verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null,
                                tint = Color(0xFF10B981), modifier = Modifier.size(20.dp))
                            Column {
                                Text("Location Detected", fontWeight = FontWeight.SemiBold, fontSize = 13.sp,
                                    color = Color(0xFF10B981))
                                Text("19.9975° N, 73.7898° E  •  CBS Area, Nashik", fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurface.copy(0.5f))
                            }
                        }
                    } else {
                        OutlinedButton(
                            onClick = {
                                scope.launch {
                                    delay(600)
                                    locationLocked = true
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(Icons.Default.MyLocation, contentDescription = null)
                            Spacer(Modifier.width(8.dp))
                            Text("Detect Current Location")
                        }
                    }
                }
            }

            // Photo
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                elevation = CardDefaults.cardElevation(0.dp)
            ) {
                Column(Modifier.padding(16.dp)) {
                    Text("Photo / Evidence", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Spacer(Modifier.height(10.dp))
                    OutlinedButton(onClick = {}, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)) {
                        Icon(Icons.Default.CameraAlt, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Take Photo or Upload")
                    }
                }
            }

            // Submit
            Button(
                onClick = {
                    scope.launch {
                        submitting = true
                        delay(1200) // simulate API call
                        submitting = false
                        submitted = true
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                contentPadding = PaddingValues(vertical = 16.dp),
                enabled = !submitting && description.isNotBlank() && locationLocked
            ) {
                if (submitting) {
                    CircularProgressIndicator(modifier = Modifier.size(18.dp), color = Color.White, strokeWidth = 2.dp)
                    Spacer(Modifier.width(8.dp))
                }
                Text("Submit Report", fontWeight = FontWeight.Bold)
            }
            Spacer(Modifier.height(16.dp))
        }
    }
}
