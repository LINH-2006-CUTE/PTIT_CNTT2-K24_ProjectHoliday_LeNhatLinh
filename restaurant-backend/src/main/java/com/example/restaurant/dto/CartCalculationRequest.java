package com.example.restaurant.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartCalculationRequest {

    @NotEmpty(message = "Giỏ hàng không được để trống")
    private List<CartItemDTO> items;

    private String voucherCode;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItemDTO {
        private Long dishId;
        private Integer quantity;
        private String note;
    }
}
