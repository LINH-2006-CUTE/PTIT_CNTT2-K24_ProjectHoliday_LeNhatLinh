package com.example.restaurant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IngredientDto {
    private String name;
    private Double stockQuantity;
    private Double minStockThreshold;
    private String unit;
    private boolean isLowStock;
}
