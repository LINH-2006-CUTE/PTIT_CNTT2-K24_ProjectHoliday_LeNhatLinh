package com.example.restaurant.service;

import com.example.restaurant.dto.CartCalculationRequest;
import com.example.restaurant.dto.CartCalculationResponse;

public interface CartService {

    CartCalculationResponse calculateCart(CartCalculationRequest request);
}
