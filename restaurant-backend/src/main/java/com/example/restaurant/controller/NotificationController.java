package com.example.restaurant.controller;

import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.entity.Notification;
import com.example.restaurant.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(@RequestParam("email") String email) {
        List<Notification> list = notificationService.getNotifications(email);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách thông báo thành công"));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(@PathVariable("id") Long id) {
        Notification notif = notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success(notif, "Đã đánh dấu đọc thông báo"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@RequestParam("email") String email) {
        notificationService.markAllAsRead(email);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã đánh dấu đọc toàn bộ thông báo"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable("id") Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã xóa thông báo"));
    }
}
