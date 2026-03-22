package com.margvedha.citizen.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.margvedha.citizen.ui.screens.alerts.AlertsScreen
import com.margvedha.citizen.ui.screens.home.HomeScreen
import com.margvedha.citizen.ui.screens.map.LiveMapScreen
import com.margvedha.citizen.ui.screens.parking.ParkingScreen
import com.margvedha.citizen.ui.screens.profile.ProfileScreen
import com.margvedha.citizen.ui.screens.report.ReportScreen
import com.margvedha.citizen.ui.screens.transport.PublicTransportScreen

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object LiveMap : Screen("live_map")
    object Report : Screen("report")
    object Alerts : Screen("alerts")
    object Profile : Screen("profile")
    object Parking : Screen("parking")
    object PublicTransport : Screen("public_transport")
}

@Composable
fun MargVedhaNavGraph(
    navController: NavHostController = rememberNavController()
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Home.route
    ) {
        composable(Screen.Home.route)             { HomeScreen(navController) }
        composable(Screen.LiveMap.route)          { LiveMapScreen(navController) }
        composable(Screen.Report.route)           { ReportScreen(navController) }
        composable(Screen.Alerts.route)           { AlertsScreen(navController) }
        composable(Screen.Profile.route)          { ProfileScreen(navController) }
        composable(Screen.Parking.route)          { ParkingScreen(navController) }
        composable(Screen.PublicTransport.route)  { PublicTransportScreen(navController) }
    }
}
