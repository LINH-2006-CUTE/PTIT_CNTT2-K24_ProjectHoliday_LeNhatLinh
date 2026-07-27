package com.example.restaurant.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRecipeCheckDTO {
    private Long ingredientId;
    private String ingredientName;
    private String ingredientCode;
    private Double quantityRequired;
    private Double currentStockQuantity;
    private String unit;
    private Boolean isSufficient;
    private String storageLocation;
}
