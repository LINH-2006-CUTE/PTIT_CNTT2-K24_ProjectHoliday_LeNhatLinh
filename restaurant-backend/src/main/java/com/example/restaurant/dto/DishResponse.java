package com.example.restaurant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DishResponse {
    private Long id;
    private String name;
    private Long categoryId;
    private String categoryName;
    private String code;
    private BigDecimal price;
    private BigDecimal costPrice;
    private BigDecimal discount;
    private String description;
    private String image;
    private String ingredients;
    private Integer prepTime;
    private Integer calories;
    private String spiciness;
    private String dishSize;
    private String notes;
    private String status;
    private boolean available;
}
