package com.example.restaurant.service;

import com.example.restaurant.entity.Promotion;
import com.example.restaurant.dto.PromotionRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface PromotionService {

    Page<Promotion> getPromotions(String search, Pageable pageable);

    Promotion getPromotionById(Long id);

    Promotion getPromotionByCode(String code);

    Promotion createPromotion(PromotionRequest request);

    Promotion updatePromotion(Long id, PromotionRequest request);

    Promotion updateStatus(Long id, String status);

    void deletePromotion(Long id);

    BigDecimal calculateDiscount(String code, BigDecimal orderAmount);
}
