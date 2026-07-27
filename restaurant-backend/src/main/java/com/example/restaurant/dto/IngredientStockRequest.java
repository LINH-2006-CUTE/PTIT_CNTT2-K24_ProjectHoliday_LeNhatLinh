package com.example.restaurant.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IngredientStockRequest {

    private String ticketCode;

    @NotNull(message = "Số lượng thay đổi kho là bắt buộc")
    private Double quantity;

    private BigDecimal unitPrice;

    private String supplierName;

    private String performedBy;

    private LocalDate expiryDate;

    private String note;
}
