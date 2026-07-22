package com.example.restaurant.controller;

import com.example.restaurant.entity.Ingredient;
import com.example.restaurant.entity.InventoryTransaction;
import com.example.restaurant.entity.Dish;
import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.IngredientStockRequest;
import com.example.restaurant.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inventory")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping("/ingredients")
    public ResponseEntity<ApiResponse<List<Ingredient>>> getAllIngredients(@RequestParam(value = "search", required = false) String search) {
        List<Ingredient> list = inventoryService.getAllIngredients(search);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách nguyên liệu thành công"));
    }

    @GetMapping("/ingredients/{id}")
    public ResponseEntity<ApiResponse<Ingredient>> getIngredientById(@PathVariable("id") Long id) {
        Ingredient ing = inventoryService.getIngredientById(id);
        return ResponseEntity.ok(ApiResponse.success(ing, "Lấy thông tin nguyên liệu thành công"));
    }

    @PostMapping("/ingredients")
    public ResponseEntity<ApiResponse<Ingredient>> createIngredient(@RequestBody Ingredient ingredient) {
        Ingredient created = inventoryService.createIngredient(ingredient);
        return ResponseEntity.ok(ApiResponse.success(created, "Thêm mới nguyên liệu thành công"));
    }

    @PutMapping("/ingredients/{id}")
    public ResponseEntity<ApiResponse<Ingredient>> updateIngredient(@PathVariable("id") Long id, @RequestBody Ingredient ingredient) {
        Ingredient updated = inventoryService.updateIngredient(id, ingredient);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật nguyên liệu thành công"));
    }

    @DeleteMapping("/ingredients/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteIngredient(@PathVariable("id") Long id) {
        inventoryService.deleteIngredient(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa nguyên liệu thành công"));
    }

    @PostMapping("/ingredients/{id}/stock-in")
    public ResponseEntity<ApiResponse<Ingredient>> stockIn(@PathVariable("id") Long id, @RequestBody IngredientStockRequest request) {
        Ingredient updated = inventoryService.stockIn(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Nhập kho thành công"));
    }

    @PostMapping("/ingredients/{id}/stock-out")
    public ResponseEntity<ApiResponse<Ingredient>> stockOut(@PathVariable("id") Long id, @RequestBody IngredientStockRequest request) {
        Ingredient updated = inventoryService.stockOut(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Xuất kho thành công"));
    }

    @PostMapping("/ingredients/{id}/stock-adjustment")
    public ResponseEntity<ApiResponse<Ingredient>> stockAdjustment(@PathVariable("id") Long id, @RequestBody IngredientStockRequest request) {
        Ingredient updated = inventoryService.stockAdjustment(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Điều chỉnh tồn kho thành công"));
    }

    @GetMapping("/ingredients/{id}/dishes")
    public ResponseEntity<ApiResponse<List<Dish>>> getDishesUsingIngredient(@PathVariable("id") Long id) {
        List<Dish> dishes = inventoryService.getDishesUsingIngredient(id);
        return ResponseEntity.ok(ApiResponse.success(dishes, "Lấy danh sách món ăn sử dụng nguyên liệu thành công"));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<InventoryTransaction>>> getTransactionHistory() {
        List<InventoryTransaction> list = inventoryService.getTransactionHistory();
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy lịch sử giao dịch kho thành công"));
    }

    @GetMapping("/history/{ingredientId}")
    public ResponseEntity<ApiResponse<List<InventoryTransaction>>> getTransactionHistoryByIngredient(@PathVariable("ingredientId") Long ingredientId) {
        List<InventoryTransaction> list = inventoryService.getTransactionHistoryByIngredient(ingredientId);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy lịch sử giao dịch nguyên liệu thành công"));
    }
}
