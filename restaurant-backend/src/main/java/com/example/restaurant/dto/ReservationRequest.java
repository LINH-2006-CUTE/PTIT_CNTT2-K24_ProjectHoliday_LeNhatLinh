package com.example.restaurant.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReservationRequest {

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Customer phone is required")
    private String customerPhone;

    private String customerEmail;

    @NotNull(message = "Number of people is required")
    @Min(value = 1, message = "Must be for at least 1 person")
    private Integer numberOfPeople;

    @NotNull(message = "Reservation time is required")
    private LocalDateTime reservationTime;

    private Long diningTableId;

    private String notes;
}
