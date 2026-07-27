package com.example.restaurant.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class DashboardQuery {

    @Min(value = 3, message = "months must be at least 3")
    @Max(value = 12, message = "months must not exceed 12")
    private int months = 6;

    @Min(value = 5, message = "topLimit must be at least 5")
    @Max(value = 50, message = "topLimit must not exceed 50")
    private int topLimit = 20;
}
