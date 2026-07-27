package com.example.restaurant.controller;

import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.ChefDashboardDTO;
import com.example.restaurant.dto.OrderHistoryDTO;
import com.example.restaurant.dto.OrderRecipeCheckDTO;
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
public class ChefKitchenController {

    @Autowired
    private ChefKitchenService chefKitchenService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<ChefDashboardDTO>> getChefDashboardStats() {
        ChefDashboardDTO stats = chefKitchenService.getChefDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats, "Lấy chỉ số thống kê Bếp thành công"));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderHistoryDTO>>> getKitchenOrders(
            @RequestParam(required = false) String cookingStatus,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search) {
        List<OrderHistoryDTO> orders = chefKitchenService.getKitchenOrders(cookingStatus, categoryId, search);
        return ResponseEntity.ok(ApiResponse.success(orders, "Lấy danh sách phiếu chế biến Bếp thành công"));
    }

    @GetMapping("/completed")
    public ResponseEntity<ApiResponse<List<OrderHistoryDTO>>> getCompletedOrders() {
        List<OrderHistoryDTO> orders = chefKitchenService.getCompletedOrders();
        return ResponseEntity.ok(ApiResponse.success(orders, "Lấy danh sách phiếu chế biến hoàn thành thành công"));
    }

    @PutMapping("/items/{itemId}/status")
    public ResponseEntity<ApiResponse<OrderHistoryDTO>> updateItemCookingStatus(
            @PathVariable Long itemId,
            @RequestBody Map<String, String> body) {
        String status = body.get("cookingStatus");
        OrderHistoryDTO order = chefKitchenService.updateItemCookingStatus(itemId, status);
        return ResponseEntity.ok(ApiResponse.success(order, "Cập nhật trạng thái chế biến món ăn thành công"));
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderHistoryDTO>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        OrderHistoryDTO order = chefKitchenService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(ApiResponse.success(order, "Cập nhật trạng thái đơn hàng thành công"));
    }

    @GetMapping("/orders/{orderId}/recipe-check")
    public ResponseEntity<ApiResponse<List<OrderRecipeCheckDTO>>> checkOrderRecipes(@PathVariable Long orderId) {
        List<OrderRecipeCheckDTO> recipes = chefKitchenService.checkOrderRecipes(orderId);
        return ResponseEntity.ok(ApiResponse.success(recipes, "Lấy thông tin định lượng công thức nguyên liệu thành công"));
    }

    @PostMapping("/orders/{orderId}/deduct-ingredients")
    public ResponseEntity<ApiResponse<OrderHistoryDTO>> deductIngredientsAndStartCooking(@PathVariable Long orderId) {
        OrderHistoryDTO order = chefKitchenService.deductIngredientsAndStartCooking(orderId);
        return ResponseEntity.ok(ApiResponse.success(order, "Xác nhận lấy nguyên liệu từ kho & chuyển sang Đang Nấu thành công"));
    }

    @PostMapping("/orders/{orderId}/notify-waiter")
    public ResponseEntity<ApiResponse<OrderHistoryDTO>> notifyWaiter(@PathVariable Long orderId) {
        OrderHistoryDTO order = chefKitchenService.notifyWaiter(orderId);
        return ResponseEntity.ok(ApiResponse.success(order, "Đã phát thông báo hoàn thành món xuống Quầy/Phục vụ"));
    }
}
