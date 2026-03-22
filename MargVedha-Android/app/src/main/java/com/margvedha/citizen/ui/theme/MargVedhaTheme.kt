package com.margvedha.citizen.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val Primary = Color(0xFF1D4ED8)   // Deep blue
private val PrimaryContainer = Color(0xFFDBEAFE)
private val Secondary = Color(0xFF0EA5E9)
private val Background = Color(0xFFF8FAFC)
private val Surface = Color(0xFFFFFFFF)
private val SurfaceVariant = Color(0xFFF1F5F9)
private val Error = Color(0xFFEF4444)

private val LightColors = lightColorScheme(
    primary = Primary,
    primaryContainer = PrimaryContainer,
    secondary = Secondary,
    background = Background,
    surface = Surface,
    surfaceVariant = SurfaceVariant,
    error = Error,
    onPrimary = Color.White,
    onBackground = Color(0xFF0F172A),
    onSurface = Color(0xFF1E293B),
)

@Composable
fun MargVedhaTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColors,
        content = content
    )
}
