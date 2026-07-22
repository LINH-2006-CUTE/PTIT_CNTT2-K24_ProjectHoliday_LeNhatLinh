package com.example.restaurant.controller;

import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.CustomerOrderRequest;
import com.example.restaurant.dto.OrderHistoryDTO;
import com.example.restaurant.service.CustomerOrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/orders")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CustomerOrderController {

    @Autowired
    private CustomerOrderService customerOrderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderHistoryDTO>> createOrder(@Valid @RequestBody CustomerOrderRequest request) {
        OrderHistoryDTO created = customerOrderService.createOrder(request);
        return ResponseEntity.ok(ApiResponse.success(created, "Đặt món thành công! Đơn hàng của bạn đang chờ xác nhận."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderHistoryDTO>> getOrderById(@PathVariable("id") Long id) {
        OrderHistoryDTO dto = customerOrderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(dto, "Lấy thông tin đơn hàng thành công"));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<OrderHistoryDTO>>> getCustomerOrders(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) String status) {
        List<OrderHistoryDTO> list = customerOrderService.getCustomerOrders(search, status, search);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách đơn hàng thành công"));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderHistoryDTO>> cancelOrder(@PathVariable("id") Long id) {
        OrderHistoryDTO cancelled = customerOrderService.cancelOrder(id);
        return ResponseEntity.ok(ApiResponse.success(cancelled, "Đã hủy đơn hàng thành công"));
    }
}
