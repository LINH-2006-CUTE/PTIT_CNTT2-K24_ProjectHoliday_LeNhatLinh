package com.example.restaurant.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class DishCreateRequest {

    @NotBlank(message = "Dish name is required")
    @Size(max = 100, message = "Dish name must not exceed 100 characters")
    private String name;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private String code;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", message = "Price must be non-negative")
    private BigDecimal price;

    private BigDecimal costPrice;

    @DecimalMin(value = "0.0", message = "Discount percentage must be non-negative")
    @DecimalMax(value = "100.0", message = "Discount percentage must not exceed 100.00%")
    private BigDecimal discount;

    private String description;

    private String image;

    private String ingredients;

    private Integer prepTime;

    private Integer calories;

    private String spiciness;

    private String dishSize;

    private String notes;

    @NotBlank(message = "Status is required")
    private String status;

    private boolean available;
}
