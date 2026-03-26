package com.margvedha.citizen.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.margvedha.citizen.ui.screens.auth.LoginScreen
import com.margvedha.citizen.ui.screens.splash.SplashScreen
import com.margvedha.citizen.ui.screens.alerts.AlertsScreen
import com.margvedha.citizen.ui.screens.home.HomeScreen
import com.margvedha.citizen.ui.screens.map.LiveMapScreen
import com.margvedha.citizen.ui.screens.parking.ParkingScreen
import com.margvedha.citizen.ui.screens.profile.ProfileScreen
import com.margvedha.citizen.ui.screens.report.ReportScreen
import com.margvedha.citizen.ui.screens.social.SocialScreen
import com.margvedha.citizen.ui.screens.transport.PublicTransportScreen

@Composable
fun MargVedhaNavGraph(
    navController: NavHostController = rememberNavController(),
    modifier: Modifier = Modifier
) {
    NavHost(
        navController = navController,
        startDestination = "splash",
        modifier = modifier
    ) {
        composable("splash")           { SplashScreen(navController) }
        composable("login")            { LoginScreen(navController) }
        composable("home")             { HomeScreen(navController) }
        composable("live_map")         { LiveMapScreen(navController) }
        composable("report")           { ReportScreen(navController) }
        composable("alerts")           { AlertsScreen(navController) }
        composable("social")           { SocialScreen(navController) }
        composable("profile")          { ProfileScreen(navController) }
        composable("parking")          { ParkingScreen(navController) }
        composable("public_transport") { PublicTransportScreen(navController) }
    }
}
