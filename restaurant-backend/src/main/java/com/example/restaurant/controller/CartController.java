package com.example.restaurant.controller;

import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.CartCalculationRequest;
import com.example.restaurant.dto.CartCalculationResponse;
import com.example.restaurant.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/cart")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CartController {

    @Autowired
    private CartService cartService;

    @PostMapping("/calculate")
    public ResponseEntity<ApiResponse<CartCalculationResponse>> calculateCart(@Valid @RequestBody CartCalculationRequest request) {
        CartCalculationResponse response = cartService.calculateCart(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Tính toán hóa đơn giỏ hàng thành công"));
    }
}
