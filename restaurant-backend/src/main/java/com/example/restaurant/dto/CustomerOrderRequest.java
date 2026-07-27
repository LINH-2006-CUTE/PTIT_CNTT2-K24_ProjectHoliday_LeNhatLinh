package com.example.restaurant.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerOrderRequest {

    @NotEmpty(message = "Danh sách món ăn không được để trống")
    private List<OrderItemRequest> items;

    private String voucherCode;

    private Long diningTableId;

    private String customerName;

    private String customerPhone;

    private String customerEmail;

    private String branch;

    private String notes;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemRequest {
        private Long dishId;
        private Integer quantity;
        private String note;
    }
}
