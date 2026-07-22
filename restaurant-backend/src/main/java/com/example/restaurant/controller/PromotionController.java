package com.example.restaurant.controller;

import com.example.restaurant.entity.Promotion;
import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.PromotionRequest;
import com.example.restaurant.service.PromotionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/admin/promotions")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Promotion>>> getPromotions(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sort", defaultValue = "id,desc") String sort) {

        String[] sortParams = sort.split(",");
        Sort sortObj = Sort.by(sortParams[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortParams[0]);
        Pageable pageable = PageRequest.of(page, size, sortObj);

        Page<Promotion> list = promotionService.getPromotions(search, pageable);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách khuyến mãi thành công"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Promotion>> getPromotionById(@PathVariable("id") Long id) {
        Promotion p = promotionService.getPromotionById(id);
        return ResponseEntity.ok(ApiResponse.success(p, "Lấy thông tin voucher thành công"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Promotion>> createPromotion(@Valid @RequestBody PromotionRequest request) {
        Promotion created = promotionService.createPromotion(request);
        return ResponseEntity.ok(ApiResponse.success(created, "Thêm voucher mới thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Promotion>> updatePromotion(@PathVariable("id") Long id, @Valid @RequestBody PromotionRequest request) {
        Promotion updated = promotionService.updatePromotion(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật voucher thành công"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Promotion>> updateStatus(@PathVariable("id") Long id, @RequestParam("status") String status) {
        Promotion updated = promotionService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật trạng thái voucher thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePromotion(@PathVariable("id") Long id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa voucher thành công"));
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<BigDecimal>> calculateDiscount(
            @RequestParam("code") String code,
            @RequestParam("orderAmount") BigDecimal orderAmount) {
        BigDecimal discount = promotionService.calculateDiscount(code, orderAmount);
        return ResponseEntity.ok(ApiResponse.success(discount, "Mã voucher hợp lệ. Đã tính toán mức giảm giá."));
    }
}
