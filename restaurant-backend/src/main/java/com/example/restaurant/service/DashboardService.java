package com.example.restaurant.service;

import com.example.restaurant.dto.DashboardStatsResponse;
import com.example.restaurant.dto.DashboardQuery;

public interface DashboardService {
    DashboardStatsResponse getDashboardStats(DashboardQuery query);
}
