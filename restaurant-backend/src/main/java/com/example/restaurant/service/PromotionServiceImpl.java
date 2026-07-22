package com.example.restaurant.service;

import com.example.restaurant.entity.Promotion;
import com.example.restaurant.dto.PromotionRequest;
import com.example.restaurant.repository.PromotionRepository;
import com.example.restaurant.exception.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@Transactional
public class PromotionServiceImpl implements PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<Promotion> getPromotions(String search, Pageable pageable) {
        Page<Promotion> page;
        if (search != null && !search.trim().isEmpty()) {
            page = promotionRepository.searchPromotions(search.trim(), pageable);
        } else {
            page = promotionRepository.findAll(pageable);
        }

        // Auto update status if expired
        LocalDateTime now = LocalDateTime.now();
        page.getContent().forEach(p -> {
            if ("ACTIVE".equalsIgnoreCase(p.getStatus()) && p.getEndDate().isBefore(now)) {
                p.setStatus("EXPIRED");
                promotionRepository.save(p);
            }
        });

        return page;
    }

    @Override
    @Transactional(readOnly = true)
    public Promotion getPromotionById(Long id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new ApiException("Voucher không tồn tại với ID: " + id, HttpStatus.NOT_FOUND));
    }

    @Override
    @Transactional(readOnly = true)
    public Promotion getPromotionByCode(String code) {
        return promotionRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new ApiException("Mã voucher không hợp lệ hoặc không tồn tại: " + code, HttpStatus.NOT_FOUND));
    }

    @Override
    public Promotion createPromotion(PromotionRequest request) {
        String cleanCode = request.getCode().trim().toUpperCase();
        if (promotionRepository.findByCode(cleanCode).isPresent()) {
            throw new ApiException("Mã khuyến mãi này đã tồn tại: " + cleanCode, HttpStatus.BAD_REQUEST);
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new ApiException("Ngày kết thúc phải sau ngày bắt đầu.", HttpStatus.BAD_REQUEST);
        }

        Promotion promotion = Promotion.builder()
                .code(cleanCode)
                .description(request.getDescription())
                .discountType(request.getDiscountType().trim().toUpperCase())
                .discountValue(request.getDiscountValue())
                .minOrderValue(request.getMinOrderValue())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .usageLimit(request.getUsageLimit())
                .usedCount(0)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus() != null ? request.getStatus().toUpperCase() : "ACTIVE")
                .build();

        return promotionRepository.save(promotion);
    }

    @Override
    public Promotion updatePromotion(Long id, PromotionRequest request) {
        Promotion promotion = getPromotionById(id);
        String cleanCode = request.getCode().trim().toUpperCase();

        promotionRepository.findByCode(cleanCode).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ApiException("Mã khuyến mãi này đã trùng lặp với voucher khác.", HttpStatus.BAD_REQUEST);
            }
        });

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new ApiException("Ngày kết thúc phải sau ngày bắt đầu.", HttpStatus.BAD_REQUEST);
        }

        promotion.setCode(cleanCode);
        promotion.setDescription(request.getDescription());
        promotion.setDiscountType(request.getDiscountType().trim().toUpperCase());
        promotion.setDiscountValue(request.getDiscountValue());
        promotion.setMinOrderValue(request.getMinOrderValue());
        promotion.setMaxDiscountAmount(request.getMaxDiscountAmount());
        promotion.setUsageLimit(request.getUsageLimit());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        if (request.getStatus() != null) {
            promotion.setStatus(request.getStatus().toUpperCase());
        }

        return promotionRepository.save(promotion);
    }

    @Override
    public Promotion updateStatus(Long id, String status) {
        Promotion p = getPromotionById(id);
        p.setStatus(status.toUpperCase());
        return promotionRepository.save(p);
    }

    @Override
    public void deletePromotion(Long id) {
        Promotion p = getPromotionById(id);
        promotionRepository.delete(p);
    }

    @Override
    public BigDecimal calculateDiscount(String code, BigDecimal orderAmount) {
        Promotion promotion = getPromotionByCode(code);
        LocalDateTime now = LocalDateTime.now();

        if (!"ACTIVE".equalsIgnoreCase(promotion.getStatus()) || promotion.getEndDate().isBefore(now)) {
            throw new ApiException("Voucher này đã hết hạn hoặc không còn hoạt động.", HttpStatus.BAD_REQUEST);
        }

        if (promotion.getStartDate().isAfter(now)) {
            throw new ApiException("Voucher này chưa đến thời gian áp dụng.", HttpStatus.BAD_REQUEST);
        }

        if (promotion.getMinOrderValue() != null && orderAmount.compareTo(promotion.getMinOrderValue()) < 0) {
            throw new ApiException("Đơn hàng chưa đạt giá trị tối thiểu " + promotion.getMinOrderValue() + "đ để áp dụng mã.", HttpStatus.BAD_REQUEST);
        }

        if (promotion.getUsageLimit() != null && promotion.getUsedCount() >= promotion.getUsageLimit()) {
            throw new ApiException("Voucher đã hết số lượt sử dụng.", HttpStatus.BAD_REQUEST);
        }

        BigDecimal discount = BigDecimal.ZERO;
        if ("PERCENTAGE".equalsIgnoreCase(promotion.getDiscountType())) {
            discount = orderAmount.multiply(promotion.getDiscountValue()).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            if (promotion.getMaxDiscountAmount() != null && discount.compareTo(promotion.getMaxDiscountAmount()) > 0) {
                discount = promotion.getMaxDiscountAmount();
            }
        } else {
            discount = promotion.getDiscountValue();
        }

        return discount.min(orderAmount); // Discount cannot exceed order total
    }
}
