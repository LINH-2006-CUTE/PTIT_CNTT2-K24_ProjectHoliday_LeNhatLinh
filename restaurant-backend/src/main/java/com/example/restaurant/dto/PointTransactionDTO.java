package com.example.restaurant.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointTransactionDTO {

    private Long id;
    private String type; // EARNED, REDEEMED
    private Integer pointsAmount;
    private String description;
    private LocalDateTime createdAt;
}
