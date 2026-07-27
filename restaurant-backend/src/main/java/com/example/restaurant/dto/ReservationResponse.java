package com.example.restaurant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationResponse {
    private Long id;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private Integer numberOfPeople;
    private LocalDateTime reservationTime;
    private Long diningTableId;
    private String diningTableNumber;
    private String status;
    private String notes;
}
