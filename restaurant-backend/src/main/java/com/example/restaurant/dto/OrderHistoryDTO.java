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
    private String status; // PENDING, CONFIRMED, PAID, PREPARING, COOKING, READY, SERVED, COMPLETED, CANCELLED
    private BigDecimal totalAmount;
    private String customerName;
    private String customerPhone;
    private String tableName;
    private String orderType; // DINE_IN, TAKEAWAY, ONLINE
    private String priority; // NORMAL, HIGH, URGENT
    private Boolean isNew; // NEW badge flag
    private String note;
    private List<OrderItemDetail> items;
    private InvoiceDTO invoice;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemDetail {
        private Long itemId;
        private Long dishId;
        private String dishName;
        private String categoryName;
        private String image;
        private Integer quantity;
        private BigDecimal price;
        private String note;
        private String cookingStatus; // PENDING, PREPARING, COOKING, READY, COMPLETED
        private Integer prepTime;
        private String description;
        private String ingredients;
        private String spiciness;
        private Integer calories;
        private BigDecimal lineTotal;
        private List<OrderRecipeCheckDTO> recipes;
    }
}
