package com.example.restaurant.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderHistoryDTO {

    private Long id;
    private LocalDateTime orderDate;
    private String status; // PENDING, CONFIRMED, COOKING, READY, SERVING, COMPLETED, PAID, CANCELLED
    private BigDecimal totalAmount;
    private String customerName;
    private String customerPhone;
    private String tableName;
    private List<OrderItemDetail> items;
    private InvoiceDTO invoice;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemDetail {
        private Long dishId;
        private String dishName;
        private String image;
        private Integer quantity;
        private BigDecimal price;
        private String note;
        private BigDecimal lineTotal;
    }
}
