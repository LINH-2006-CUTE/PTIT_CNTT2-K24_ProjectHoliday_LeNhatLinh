package com.example.restaurant.controller;

import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.CustomerOrderRequest;
import com.example.restaurant.dto.OrderHistoryDTO;
import com.example.restaurant.service.WaiterOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/waiter/orders")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('WAITER', 'ADMIN', 'MANAGER', 'STAFF')")
public class WaiterOrderController {

    @Autowired
    private WaiterOrderService waiterOrderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderHistoryDTO>>> getActiveOrders() {
        List<OrderHistoryDTO> orders = waiterOrderService.getActiveOrders();
        return ResponseEntity.ok(ApiResponse.success(orders, "Lấy danh sách đơn hàng đang phục vụ thành công"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderHistoryDTO>> createOrder(@RequestBody CustomerOrderRequest request) {
        OrderHistoryDTO order = waiterOrderService.createWaiterOrder(request);
        return ResponseEntity.ok(ApiResponse.success(order, "Tạo đơn hàng tại bàn thành công"));
    }

    @PostMapping("/{orderId}/items")
    public ResponseEntity<ApiResponse<OrderHistoryDTO>> addItem(
            @PathVariable Long orderId,
            @RequestBody CustomerOrderRequest.OrderItemRequest itemReq) {
        OrderHistoryDTO order = waiterOrderService.addItemToOrder(orderId, itemReq);
        return ResponseEntity.ok(ApiResponse.success(order, "Thêm món vào đơn hàng thành công"));
    }

    @DeleteMapping("/{orderId}/items/{dishId}")
    public ResponseEntity<ApiResponse<OrderHistoryDTO>> removeItem(
            @PathVariable Long orderId,
            @PathVariable Long dishId) {
        OrderHistoryDTO order = waiterOrderService.removeItemFromOrder(orderId, dishId);
        return ResponseEntity.ok(ApiResponse.success(order, "Đã xóa món khỏi đơn hàng"));
    }

    @PutMapping("/{orderId}/items/{dishId}")
    public ResponseEntity<ApiResponse<OrderHistoryDTO>> updateItemQuantity(
            @PathVariable Long orderId,
            @PathVariable Long dishId,
            @RequestBody Map<String, Object> body) {
        Integer quantity = body.get("quantity") != null ? Integer.parseInt(body.get("quantity").toString()) : null;
        String note = body.get("note") != null ? body.get("note").toString() : null;
        OrderHistoryDTO order = waiterOrderService.updateItemQuantity(orderId, dishId, quantity, note);
        return ResponseEntity.ok(ApiResponse.success(order, "Cập nhật món thành công"));
    }

    @PostMapping("/{orderId}/send-kitchen")
    public ResponseEntity<ApiResponse<OrderHistoryDTO>> sendToKitchen(@PathVariable Long orderId) {
        OrderHistoryDTO order = waiterOrderService.sendToKitchen(orderId);
        return ResponseEntity.ok(ApiResponse.success(order, "Đã gửi thông báo chế biến xuống Bếp"));
    }
}
