package com.example.restaurant.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TableRequest {

    private String tableCode;

    @NotBlank(message = "Table number is required")
    private String tableNumber;

    @NotBlank(message = "Area is required")
    private String area;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private String tableType;
    private String notes;
    private String assignedStaff;
    private String currentCustomer;
    private String reservationTime;
    private String specialRequests;
    private String status;
}
