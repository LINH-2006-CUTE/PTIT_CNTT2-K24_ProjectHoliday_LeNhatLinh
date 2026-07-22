package com.example.restaurant.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryReportDTO {
    private Long totalIngredients;
    private Long lowStockCount;
    private Long expiredCount;
    private BigDecimal estimatedStockValue;
    private List<StockMovementItem> recentMovements;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StockMovementItem {
        private String ingredientName;
        private String type;
        private Double quantity;
        private String unit;
        private String date;
    }
}
