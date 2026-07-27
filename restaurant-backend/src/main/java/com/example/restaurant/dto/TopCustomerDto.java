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
public class TopCustomerDto {
    private String email;
    private String fullName;
    private Long ordersCount;
    private BigDecimal totalSpent;
}
