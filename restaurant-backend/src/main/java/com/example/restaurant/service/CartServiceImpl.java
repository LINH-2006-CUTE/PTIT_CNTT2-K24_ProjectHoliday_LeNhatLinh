package com.example.restaurant.service;

import com.example.restaurant.dto.CartCalculationRequest;
import com.example.restaurant.dto.CartCalculationResponse;
import com.example.restaurant.entity.Dish;
import com.example.restaurant.entity.Promotion;
import com.example.restaurant.repository.DishRepository;
import com.example.restaurant.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class CartServiceImpl implements CartService {

    @Autowired
    private DishRepository dishRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private PromotionService promotionService;

    @Override
    public CartCalculationResponse calculateCart(CartCalculationRequest request) {
        BigDecimal subtotal = BigDecimal.ZERO;
        List<CartCalculationResponse.CartItemDetail> details = new ArrayList<>();

        if (request.getItems() != null) {
            for (CartCalculationRequest.CartItemDTO item : request.getItems()) {
                Optional<Dish> dishOpt = dishRepository.findById(item.getDishId());
                if (dishOpt.isPresent()) {
                    Dish d = dishOpt.get();
                    int qty = item.getQuantity() != null && item.getQuantity() > 0 ? item.getQuantity() : 1;
                    BigDecimal lineTotal = d.getPrice().multiply(BigDecimal.valueOf(qty));
                    subtotal = subtotal.add(lineTotal);

                    details.add(CartCalculationResponse.CartItemDetail.builder()
                            .dishId(d.getId())
                            .dishName(d.getName())
                            .image(d.getImage())
                            .unitPrice(d.getPrice())
                            .quantity(qty)
                            .note(item.getNote())
                            .lineTotal(lineTotal)
                            .build());
                }
            }
        }

        // Voucher Calculation
        BigDecimal discountAmount = BigDecimal.ZERO;
        String voucherCode = null;
        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            voucherCode = request.getVoucherCode().trim().toUpperCase();
            try {
                discountAmount = promotionService.calculateDiscount(voucherCode, subtotal);
            } catch (Exception e) {
                discountAmount = BigDecimal.ZERO;
            }
        }

        BigDecimal taxableAmount = subtotal.subtract(discountAmount);
        if (taxableAmount.compareTo(BigDecimal.ZERO) < 0) {
            taxableAmount = BigDecimal.ZERO;
        }

        // Service fee = 5%
        BigDecimal serviceFeeRate = new BigDecimal("0.05");
        BigDecimal serviceFeeAmount = taxableAmount.multiply(serviceFeeRate).setScale(2, RoundingMode.HALF_UP);

        // VAT = 8%
        BigDecimal vatRate = new BigDecimal("0.08");
        BigDecimal vatAmount = taxableAmount.multiply(vatRate).setScale(2, RoundingMode.HALF_UP);

        BigDecimal grandTotal = taxableAmount.add(serviceFeeAmount).add(vatAmount);

        return CartCalculationResponse.builder()
                .subtotal(subtotal)
                .voucherCode(voucherCode)
                .discountAmount(discountAmount)
                .taxableAmount(taxableAmount)
                .serviceFeeRate(serviceFeeRate)
                .serviceFeeAmount(serviceFeeAmount)
                .vatRate(vatRate)
                .vatAmount(vatAmount)
                .grandTotal(grandTotal)
                .itemDetails(details)
                .build();
    }
}
