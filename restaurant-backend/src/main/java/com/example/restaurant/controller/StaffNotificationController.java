package com.example.restaurant.controller;

import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.entity.StaffNotification;
import com.example.restaurant.repository.StaffNotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

import com.example.restaurant.entity.Order;
import com.example.restaurant.repository.OrderRepository;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

@RestController
@RequestMapping("/api/staff-notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class StaffNotificationController {

    @Autowired
    private StaffNotificationRepository staffNotificationRepository;

    @Autowired
    private OrderRepository orderRepository;

    // 1. Send Notification (Manager / Admin)
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<StaffNotification>> sendNotification(@RequestBody Map<String, String> body) {
        String title = body.get("title");
        String message = body.get("message");
        String targetRole = body.getOrDefault("targetRole", "ALL");
        String senderName = body.getOrDefault("senderName", "Trần Hoàng Nam (Quản Lý)");
        String senderRole = body.getOrDefault("senderRole", "ROLE_MANAGER");
        String itemsDetails = body.get("itemsDetails");

        StaffNotification notification = StaffNotification.builder()
                .title(title)
                .message(message)
                .targetRole(targetRole)
                .senderName(senderName)
                .senderRole(senderRole)
                .itemsDetails(itemsDetails)
                .urgent("ALL".equalsIgnoreCase(targetRole) || title.toLowerCase().contains("khẩn") || title.toLowerCase().contains("gấp"))
                .isRead(false)
                .isConfirmed(false)
                .createdAt(LocalDateTime.now())
                .build();

        StaffNotification saved = staffNotificationRepository.save(notification);
        return ResponseEntity.ok(ApiResponse.success(saved, "Gửi thông báo chỉ đạo/yêu cầu thành công"));
    }

    // 2. Get Notifications for employee based on role
    @GetMapping
    public ResponseEntity<ApiResponse<List<StaffNotification>>> getNotificationsForRole(@RequestParam(value = "role", defaultValue = "ALL") String role) {
        List<String> validRoles = Arrays.asList("ALL", role);
        List<StaffNotification> list = staffNotificationRepository.findByTargetRoleInOrderByCreatedAtDesc(validRoles);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách thông báo thành công"));
    }

    // 3. Get Unread Count for Navbar Bell Badge
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(@RequestParam(value = "role", defaultValue = "ALL") String role) {
        List<String> validRoles = Arrays.asList("ALL", role);
        long count = staffNotificationRepository.countByTargetRoleInAndIsReadFalse(validRoles);
        Map<String, Long> res = new HashMap<>();
        res.put("count", count);
        return ResponseEntity.ok(ApiResponse.success(res, "Lấy số lượng thông báo chưa đọc thành công"));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<StaffNotification>> markAsRead(@PathVariable("id") Long id) {
        Optional<StaffNotification> notifOpt = staffNotificationRepository.findById(id);
        if (notifOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Không tìm thấy thông báo"));
        }
        StaffNotification notif = notifOpt.get();
        notif.setIsRead(true);
        StaffNotification saved = staffNotificationRepository.save(notif);
        return ResponseEntity.ok(ApiResponse.success(saved, "Đã đánh dấu thông báo là đã đọc"));
    }

    // 4. Confirm / Approve Notification
    @PutMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<StaffNotification>> confirmNotification(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> body) {

        String confirmedByEmail = body.getOrDefault("email", "staff@restaurant.com");
        String confirmedByName = body.getOrDefault("fullName", "Nhân Viên Thực Hiện");
        String adminResponse = body.get("adminResponse");

        Optional<StaffNotification> notifOpt = staffNotificationRepository.findById(id);
        if (notifOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Không tìm thấy thông báo"));
        }

        StaffNotification notif = notifOpt.get();
        notif.setIsRead(true);
        notif.setIsConfirmed(true);
        notif.setConfirmedByEmail(confirmedByEmail);
        notif.setConfirmedByName(confirmedByName);
        notif.setConfirmedAt(LocalDateTime.now());
        if (adminResponse != null && !adminResponse.trim().isEmpty()) {
            notif.setAdminResponse(adminResponse.trim());

            // Send feedback response back to Manager and Chef
            StaffNotification responseNotif = StaffNotification.builder()
                    .title("✅ ADMIN ĐÃ TIẾP NHẬN YÊU CẦU NHẬP KHO")
                    .message("Admin (" + confirmedByName + ") đã duyệt và xác nhận yêu cầu nhập hàng từ Bếp/Quản lý: " + (adminResponse != null ? adminResponse.trim() : "Đã tạo đơn mua hàng từ nhà cung cấp."))
                    .targetRole("ROLE_CHEF")
                    .senderName(confirmedByName)
                    .senderRole("ROLE_ADMIN")
                    .urgent(false)
                    .isRead(false)
                    .isConfirmed(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            staffNotificationRepository.save(responseNotif);

            StaffNotification responseManager = StaffNotification.builder()
                    .title("Phản Hồi Admin: Đã Phê Duyệt Đề Xuất Nhập Kho")
                    .message("Admin (" + confirmedByName + ") đã phê duyệt yêu cầu nhập hàng: " + (adminResponse != null ? adminResponse.trim() : "Đã tiếp nhận."))
                    .targetRole("ROLE_MANAGER")
                    .senderName(confirmedByName)
                    .senderRole("ROLE_ADMIN")
                    .urgent(false)
                    .isRead(false)
                    .isConfirmed(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            staffNotificationRepository.save(responseManager);
        }

        StaffNotification updated = staffNotificationRepository.save(notif);

        // Phương án B: Khi Thu ngân xác nhận thông báo, cập nhật đơn hàng sang trạng thái phù hợp
        // (Bếp đã nhận đơn tự động - chỉ cần ghi nhận Thu ngân đã biết)
        try {
            String titleAndMsg = (notif.getTitle() != null ? notif.getTitle() : "") + " " + (notif.getMessage() != null ? notif.getMessage() : "");
            Pattern pattern = Pattern.compile("#ORD-(\\d+)");
            Matcher matcher = pattern.matcher(titleAndMsg);
            if (matcher.find()) {
                Long orderId = Long.parseLong(matcher.group(1));
                Optional<Order> orderOpt = orderRepository.findById(orderId);
                if (orderOpt.isPresent()) {
                    Order order = orderOpt.get();
                    // Phương án B: Không cần đổi trạng thái hay gửi bếp - đơn đã đến bếp tự động
                    // Thu ngân chỉ cần biết để chuẩn bị hóa đơn, thu tiền sau khi khách ăn xong
                }
            }
        } catch (Exception e) {
            // log silently
        }

        return ResponseEntity.ok(ApiResponse.success(updated, "Xác nhận / Phê duyệt thông báo thành công"));
    }

    // 5. Get History for Manager & Admin (Track who confirmed)
    @GetMapping("/manager/history")
    public ResponseEntity<ApiResponse<List<StaffNotification>>> getManagerNotificationHistory() {
        List<StaffNotification> list = staffNotificationRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy lịch sử thông báo và danh sách đã tiếp nhận thành công"));
    }
}
