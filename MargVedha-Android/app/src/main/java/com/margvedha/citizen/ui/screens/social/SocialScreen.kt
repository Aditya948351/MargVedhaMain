package com.margvedha.citizen.ui.screens.social

import android.util.Log
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query

// ── Data model for a community post ──────────────────────────────────────────
data class CommunityPost(
    val id: String = "",
    val author: String = "",
    val title: String = "",
    val content: String = "",
    val location: String = "",
    val category: String = "General",
    val lang: String = "EN",
    val likes: Int = 0,
    val comments: Int = 0,
    val imageUrl: String? = null,
    val timestamp: Timestamp? = null
)

// Colour coding per category
private fun categoryColor(cat: String): Color = when (cat) {
    "Congestion"  -> Color(0xFFEF4444)
    "Bus/ETA"     -> Color(0xFF22C55E)
    "Safety"      -> Color(0xFF3B82F6)
    "Infrastructure" -> Color(0xFF8B5CF6)
    "AI Routing"  -> Color(0xFF0EA5E9)
    "Enforcement" -> Color(0xFFF59E0B)
    else          -> Color(0xFF64748B)
}

private val CATEGORIES = listOf("General","Congestion","Bus/ETA","Safety","Infrastructure","AI Routing","Enforcement")
private val LANGS       = listOf("EN","HI","MR")

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SocialScreen(navController: NavController) {
    val db = remember { FirebaseFirestore.getInstance() }

    var livePosts  by remember { mutableStateOf<List<CommunityPost>>(emptyList()) }
    var isLoading  by remember { mutableStateOf(true) }
    var showDialog by remember { mutableStateOf(false) }
    var selectedLang by remember { mutableStateOf<String?>(null) }

    // ── Real-time Firestore listener ───────────────────────────────────────
    DisposableEffect(Unit) {
        val reg = db.collection("community_posts")
            .orderBy("timestamp", Query.Direction.DESCENDING)
            .limit(50)
            .addSnapshotListener { snap, err ->
                if (err != null) { Log.e("Social", err.message ?: "error"); return@addSnapshotListener }
                livePosts = snap?.documents?.mapNotNull { doc ->
                    CommunityPost(
                        id       = doc.id,
                        author   = doc.getString("author") ?: "Citizen",
                        title    = doc.getString("title") ?: "",
                        content  = doc.getString("content") ?: "",
                        location = doc.getString("location") ?: "",
                        category = doc.getString("category") ?: "General",
                        lang     = doc.getString("lang") ?: "EN",
                        likes    = doc.getLong("likes")?.toInt() ?: 0,
                        comments = doc.getLong("comments")?.toInt() ?: 0,
                        imageUrl = doc.getString("imageUrl"),
                        timestamp = doc.getTimestamp("timestamp")
                    )
                } ?: emptyList()
                isLoading = false
            }
        onDispose { reg.remove() }
    }

    val displayPosts = if (selectedLang == null) livePosts
                       else livePosts.filter { it.lang == selectedLang }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Community Hub", fontWeight = FontWeight.Bold) },
                actions = { IconButton(onClick = {}) { Icon(Icons.Default.Search, "Search") } },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showDialog = true },
                containerColor = MaterialTheme.colorScheme.primary,
                shape = CircleShape
            ) { Icon(Icons.Default.Add, "New Post") }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.surfaceVariant.copy(0.3f)),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // ── Header + filter chips
            item {
                Column {
                    Text("नाशिक / Nashik / नासिक", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = MaterialTheme.colorScheme.primary)
                    Text("Live urban traffic reports from citizens", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface.copy(0.55f))
                    Spacer(Modifier.height(12.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf(null to "All", "MR" to "मराठी", "HI" to "हिंदी", "EN" to "English").forEach { (lang, label) ->
                            FilterChip(
                                selected = selectedLang == lang,
                                onClick  = { selectedLang = lang },
                                label    = { Text(label, fontSize = 12.sp) },
                                shape    = RoundedCornerShape(50),
                                colors   = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = MaterialTheme.colorScheme.primary,
                                    selectedLabelColor = Color.White
                                )
                            )
                        }
                    }
                }
            }

            // ── Loading or empty
            if (isLoading) {
                item {
                    Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                }
            } else if (displayPosts.isEmpty()) {
                item {
                    Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(Icons.Default.List, null, modifier = Modifier.size(48.dp), tint = MaterialTheme.colorScheme.onSurface.copy(0.3f))
                            Spacer(Modifier.height(8.dp))
                            Text("No posts yet. Tap + to share!", color = MaterialTheme.colorScheme.onSurface.copy(0.5f))
                        }
                    }
                }
            } else {
                items(displayPosts, key = { it.id }) { post -> PostCard(post, db) }
            }

            item { Spacer(Modifier.height(100.dp)) }
        }
    }

    // ── New Post Dialog
    if (showDialog) {
        NewPostDialog(
            onDismiss = { showDialog = false },
            onSubmit   = { author, title, content, location, category, lang ->
                db.collection("community_posts").add(
                    hashMapOf(
                        "author"    to author,
                        "title"     to title,
                        "content"   to content,
                        "location"  to location,
                        "category"  to category,
                        "lang"      to lang,
                        "likes"     to 0,
                        "comments"  to 0,
                        "timestamp" to Timestamp.now()
                    )
                )
                showDialog = false
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NewPostDialog(onDismiss: () -> Unit, onSubmit: (String, String, String, String, String, String) -> Unit) {
    var author   by remember { mutableStateOf("") }
    var title    by remember { mutableStateOf("") }
    var content  by remember { mutableStateOf("") }
    var location by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("General") }
    var lang     by remember { mutableStateOf("EN") }
    var catExpanded  by remember { mutableStateOf(false) }
    var langExpanded by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        shape = RoundedCornerShape(20.dp),
        title = { Text("📣 Share a Traffic Report", fontWeight = FontWeight.ExtraBold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(value = author, onValueChange = { author = it },
                    label = { Text("Your Name") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                OutlinedTextField(value = title, onValueChange = { title = it },
                    label = { Text("Title / Headline") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                OutlinedTextField(value = content, onValueChange = { content = it },
                    label = { Text("Description (EN / HI / MR)") },
                    modifier = Modifier.fillMaxWidth(), minLines = 3, maxLines = 5)
                OutlinedTextField(value = location, onValueChange = { location = it },
                    label = { Text("Junction / Location") }, modifier = Modifier.fillMaxWidth(), singleLine = true)

                // Category dropdown
                Box {
                    OutlinedTextField(value = category, onValueChange = {}, readOnly = true,
                        label = { Text("Category") }, modifier = Modifier.fillMaxWidth(), singleLine = true,
                        trailingIcon = { IconButton(onClick = { catExpanded = true }) { Icon(Icons.Default.List, null) } })
                    Box(Modifier.matchParentSize().background(Color.Transparent))
                    DropdownMenu(expanded = catExpanded, onDismissRequest = { catExpanded = false }) {
                        CATEGORIES.forEach { c -> DropdownMenuItem(text = { Text(c) }, onClick = { category = c; catExpanded = false }) }
                    }
                }

                // Language dropdown
                Box {
                    OutlinedTextField(value = lang, onValueChange = {}, readOnly = true,
                        label = { Text("Language") }, modifier = Modifier.fillMaxWidth(), singleLine = true,
                        trailingIcon = { IconButton(onClick = { langExpanded = true }) { Icon(Icons.Default.List, null) } })
                    Box(Modifier.matchParentSize().background(Color.Transparent))
                    DropdownMenu(expanded = langExpanded, onDismissRequest = { langExpanded = false }) {
                        LANGS.forEach { l -> DropdownMenuItem(text = { Text(l) }, onClick = { lang = l; langExpanded = false }) }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (author.isNotBlank() && content.isNotBlank())
                        onSubmit(author, title, content, location, category, lang)
                },
                enabled = author.isNotBlank() && content.isNotBlank()
            ) { Text("Post 🚀") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}

// ── PostCard ──────────────────────────────────────────────────────────────────
@Composable
fun PostCard(post: CommunityPost, db: FirebaseFirestore) {
    var likes by remember { mutableStateOf(post.likes) }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(3.dp)
    ) {
        Column(Modifier.padding(16.dp)) {
            // Author row
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(Modifier.size(44.dp), shape = CircleShape,
                    color = categoryColor(post.category).copy(0.15f)) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(post.author.take(1), fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = categoryColor(post.category))
                    }
                }
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(post.author, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.LocationOn, null, Modifier.size(12.dp), tint = MaterialTheme.colorScheme.primary)
                        Text("  ${post.location.ifBlank { "Nashik" }}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(0.5f))
                    }
                }
                // Category + lang badges
                Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Surface(shape = RoundedCornerShape(50), color = categoryColor(post.category).copy(0.12f)) {
                        Text(post.category, Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                            fontSize = 10.sp, fontWeight = FontWeight.Bold, color = categoryColor(post.category))
                    }
                    Surface(shape = RoundedCornerShape(6.dp), color = when (post.lang) {
                        "MR" -> Color(0xFF6D28D9).copy(0.12f)
                        "HI" -> Color(0xFF047857).copy(0.12f)
                        else -> Color(0xFF1D4ED8).copy(0.12f)
                    }) {
                        Text(post.lang, Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                            fontSize = 10.sp, fontWeight = FontWeight.Bold,
                            color = when (post.lang) { "MR" -> Color(0xFF6D28D9); "HI" -> Color(0xFF047857); else -> Color(0xFF1D4ED8) })
                    }
                }
            }

            Spacer(Modifier.height(10.dp))
            if (post.title.isNotBlank())
                Text(post.title, fontWeight = FontWeight.ExtraBold, fontSize = 15.sp)
            Spacer(Modifier.height(4.dp))
            Text(post.content, fontSize = 13.sp, lineHeight = 20.sp, color = MaterialTheme.colorScheme.onSurface.copy(0.8f))
            
            // Image support
            if (!post.imageUrl.isNullOrBlank()) {
                Spacer(Modifier.height(12.dp))
                AsyncImage(
                    model = post.imageUrl,
                    contentDescription = "Post Image",
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp)
                        .clip(RoundedCornerShape(12.dp)),
                    contentScale = ContentScale.Crop
                )
            }

            Spacer(Modifier.height(12.dp))
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(0.4f))

            Row(Modifier.fillMaxWidth().padding(top = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = {
                        likes++
                        db.collection("community_posts").document(post.id).update("likes", likes)
                    }) { Icon(Icons.Outlined.FavoriteBorder, null, Modifier.size(20.dp), tint = Color(0xFFEF4444)) }
                    Text("$likes", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface.copy(0.6f))
                    Spacer(Modifier.width(12.dp))
                    IconButton(onClick = {}) { Icon(Icons.Outlined.ChatBubbleOutline, null, Modifier.size(20.dp), tint = MaterialTheme.colorScheme.onSurface.copy(0.6f)) }
                    Text("${post.comments}", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface.copy(0.6f))
                }
                IconButton(onClick = {}) { Icon(Icons.Outlined.Share, null, Modifier.size(20.dp), tint = MaterialTheme.colorScheme.onSurface.copy(0.6f)) }
            }
        }
    }
}
