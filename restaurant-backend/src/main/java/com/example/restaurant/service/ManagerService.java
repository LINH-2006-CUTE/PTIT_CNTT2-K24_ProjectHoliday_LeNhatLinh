package com.example.restaurant.service;

import com.example.restaurant.dto.*;

import java.util.List;
import java.util.Map;

public interface ManagerService {
    ManagerDashboardDTO getDashboardStats();
    List<Map<String, Object>> getStaffList();
    List<Map<String, Object>> getInventoryList();
    List<Map<String, Object>> getSuppliersList();
    Map<String, Object> sendStaffNotification(String title, String message, String targetRole);
    Map<String, Object> getAnalytics();
}
