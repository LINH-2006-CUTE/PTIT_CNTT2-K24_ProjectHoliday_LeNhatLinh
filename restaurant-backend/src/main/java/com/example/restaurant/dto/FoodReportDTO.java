package com.example.restaurant.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodReportDTO {
    private List<TopFoodItem> topSellingDishes;
    private List<CategorySalesItem> categoryBreakdown;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopFoodItem {
        private String name;
        private String category;
        private Integer quantitySold;
        private BigDecimal totalRevenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategorySalesItem {
        private String categoryName;
        private BigDecimal revenue;
        private Double percentage;
    }
}
