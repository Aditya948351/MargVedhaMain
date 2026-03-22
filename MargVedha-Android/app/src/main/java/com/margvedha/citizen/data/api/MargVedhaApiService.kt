package com.margvedha.citizen.data.api

import com.margvedha.citizen.data.model.Alert
import com.margvedha.citizen.data.model.ParkingSpotResponse
import com.margvedha.citizen.data.model.RouteResponse
import com.margvedha.citizen.data.model.TrafficStatus
import retrofit2.Response
import retrofit2.http.*

interface MargVedhaApiService {

    @GET("traffic/live")
    suspend fun getLiveTrafficStatus(): Response<TrafficStatus>

    @GET("route")
    suspend fun getOptimalRoute(
        @Query("src") source: String,
        @Query("dest") destination: String
    ): Response<RouteResponse>

    @GET("alerts")
    suspend fun getAlerts(): Response<List<Alert>>

    @GET("parking")
    suspend fun getNearbyParking(
        @Query("lat") lat: Double,
        @Query("lng") lng: Double
    ): Response<List<ParkingSpotResponse>>

    @POST("report")
    @FormUrlEncoded
    suspend fun submitReport(
        @Field("type") type: String,
        @Field("description") description: String,
        @Field("lat") lat: Double,
        @Field("lng") lng: Double,
        @Field("userId") userId: String
    ): Response<Unit>

    @GET("public-transport")
    suspend fun getBusRoutes(
        @Query("nearby_lat") lat: Double,
        @Query("nearby_lng") lng: Double
    ): Response<List<com.margvedha.citizen.data.model.BusRouteResponse>>
}
