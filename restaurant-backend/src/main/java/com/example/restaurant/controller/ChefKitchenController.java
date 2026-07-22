package com.example.restaurant.controller;

import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.OrderHistoryDTO;
import com.example.restaurant.service.ChefKitchenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chef")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('CHEF', 'STAFF', 'ADMIN', 'MANAGER')")
public class ChefKitchenController {

    @Autowired
    private ChefKitchenService chefKitchenService;

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderHistoryDTO>>> getKitchenOrders(
            @RequestParam(required = false) String cookingStatus) {
        List<OrderHistoryDTO> orders = chefKitchenService.getKitchenOrders(cookingStatus);
        return ResponseEntity.ok(ApiResponse.success(orders, "Lấy danh sách phiếu chế biến Bếp thành công"));
    }

    @PutMapping("/items/{itemId}/status")
    public ResponseEntity<ApiResponse<OrderHistoryDTO>> updateItemCookingStatus(
            @PathVariable Long itemId,
            @RequestBody Map<String, String> body) {
        String status = body.get("cookingStatus");
        OrderHistoryDTO order = chefKitchenService.updateItemCookingStatus(itemId, status);
        return ResponseEntity.ok(ApiResponse.success(order, "Cập nhật trạng thái chế biến món ăn thành công"));
    }

    @PostMapping("/orders/{orderId}/notify-waiter")
    public ResponseEntity<ApiResponse<OrderHistoryDTO>> notifyWaiter(@PathVariable Long orderId) {
        OrderHistoryDTO order = chefKitchenService.notifyWaiter(orderId);
        return ResponseEntity.ok(ApiResponse.success(order, "Đã phát thông báo hoàn thành món xuống Nhân viên Phục vụ"));
    }
}
