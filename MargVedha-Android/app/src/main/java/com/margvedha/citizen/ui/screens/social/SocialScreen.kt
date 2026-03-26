package com.margvedha.citizen.ui.screens.social

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController

data class SocialPost(
    val id: String,
    val author: String,
    val content: String,
    val location: String,
    val timestamp: String,
    val likes: Int,
    val comments: Int
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SocialScreen(navController: NavController) {
    val posts = listOf(
        SocialPost("1", "Rahul S.", "Finally some relief at Dwarka Circle! AI signal timing is working much better today.", "Dwarka Circle", "15m ago", 24, 5),
        SocialPost("2", "Priya M.", "Avoid Trimbak Road, heavy waterlogging near the underpass. Travel safe everyone!", "Trimbak Road", "1h ago", 42, 12),
        SocialPost("3", "Amit K.", "Found a great parking spot at CBS Zone A. Plenty of slots available right now.", "CBS Nashik", "2h ago", 18, 3),
        SocialPost("4", "Suresh V.", "The new e-bus on Route N-17 is very comfortable and on time.", "Panchavati", "4h ago", 56, 8)
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Community Hub", fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = { }) {
                        Icon(Icons.Default.Search, contentDescription = "Search")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { },
                containerColor = MaterialTheme.colorScheme.primary,
                shape = CircleShape
            ) {
                Icon(Icons.Default.Add, contentDescription = "Create Post")
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding).background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Text("What's happening in Nashik?", fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface.copy(0.6f), fontSize = 14.sp)
            }
            items(posts) { post ->
                PostCard(post)
            }
            item { Spacer(Modifier.height(80.dp)) }
        }
    }
}

@Composable
fun PostCard(post: SocialPost) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    modifier = Modifier.size(40.dp),
                    shape = CircleShape,
                    color = MaterialTheme.colorScheme.primaryContainer
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(post.author.take(1), fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    }
                }
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(post.author, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.LocationOn, contentDescription = null, modifier = Modifier.size(12.dp), tint = MaterialTheme.colorScheme.primary)
                        Text("  ${post.location} • ${post.timestamp}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(0.5f))
                    }
                }
            }
            Spacer(Modifier.height(12.dp))
            Text(post.content, fontSize = 14.sp, lineHeight = 20.sp)
            Spacer(Modifier.height(16.dp))
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
            Row(
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = { }) { Icon(Icons.Outlined.FavoriteBorder, null, modifier = Modifier.size(20.dp), tint = MaterialTheme.colorScheme.onSurface.copy(0.6f)) }
                    Text("${post.likes}", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface.copy(0.6f))
                    Spacer(Modifier.width(16.dp))
                    IconButton(onClick = { }) { Icon(Icons.Outlined.ChatBubbleOutline, null, modifier = Modifier.size(20.dp), tint = MaterialTheme.colorScheme.onSurface.copy(0.6f)) }
                    Text("${post.comments}", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface.copy(0.6f))
                }
                IconButton(onClick = { }) { Icon(Icons.Outlined.Share, null, modifier = Modifier.size(20.dp), tint = MaterialTheme.colorScheme.onSurface.copy(0.6f)) }
            }
        }
    }
}
