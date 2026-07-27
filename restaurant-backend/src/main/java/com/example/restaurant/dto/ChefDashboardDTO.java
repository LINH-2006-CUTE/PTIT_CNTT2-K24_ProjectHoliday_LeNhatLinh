package com.example.restaurant.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChefDashboardDTO {

    private long pendingOrdersCount;
    private long cookingOrdersCount;
    private long completedOrdersCount;
    private double avgCookingTimeMinutes;
    private List<TopQueueDishDTO> topQueueDishes;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopQueueDishDTO {
        private Long dishId;
        private String dishName;
        private String image;
        private long pendingQuantity;
    }
}
