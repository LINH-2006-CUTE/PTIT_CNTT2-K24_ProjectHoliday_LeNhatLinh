package com.example.restaurant.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartCalculationResponse {

    private BigDecimal subtotal;
    private String voucherCode;
    private BigDecimal discountAmount;
    private BigDecimal taxableAmount;
    private BigDecimal serviceFeeRate; // 0.05
    private BigDecimal serviceFeeAmount;
    private BigDecimal vatRate; // 0.08
    private BigDecimal vatAmount;
    private BigDecimal grandTotal;
    private List<CartItemDetail> itemDetails;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItemDetail {
        private Long dishId;
        private String dishName;
        private String image;
        private BigDecimal unitPrice;
        private Integer quantity;
        private String note;
        private BigDecimal lineTotal;
    }
}
