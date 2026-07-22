package com.example.restaurant.controller;

import com.example.restaurant.dto.*;
import com.example.restaurant.service.ManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
public class ManagerController {

    @Autowired
    private ManagerService managerService;

    @GetMapping("/dashboard-stats")
    public ResponseEntity<ApiResponse<ManagerDashboardDTO>> getDashboardStats() {
        ManagerDashboardDTO stats = managerService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats, "Lấy dữ liệu Dashboard Quản Lý thành công"));
    }

    @GetMapping("/employees")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStaffList() {
        List<Map<String, Object>> staff = managerService.getStaffList();
        return ResponseEntity.ok(ApiResponse.success(staff, "Lấy danh sách nhân viên thành công"));
    }

    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getInventoryList() {
        List<Map<String, Object>> inventory = managerService.getInventoryList();
        return ResponseEntity.ok(ApiResponse.success(inventory, "Lấy dữ liệu tồn kho thành công"));
    }

    @GetMapping("/suppliers")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSuppliersList() {
        List<Map<String, Object>> suppliers = managerService.getSuppliersList();
        return ResponseEntity.ok(ApiResponse.success(suppliers, "Lấy danh mục Nhà cung cấp thành công"));
    }

    @PostMapping("/notifications/send")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendStaffNotification(@RequestBody Map<String, String> body) {
        String title = body.get("title");
        String message = body.get("message");
        String targetRole = body.getOrDefault("targetRole", "ALL");
        Map<String, Object> result = managerService.sendStaffNotification(title, message, targetRole);
        return ResponseEntity.ok(ApiResponse.success(result, "Phát thông báo cho nhân viên thành công"));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {
        Map<String, Object> analytics = managerService.getAnalytics();
        return ResponseEntity.ok(ApiResponse.success(analytics, "Lấy số liệu phân tích Analytics thành công"));
    }
}
