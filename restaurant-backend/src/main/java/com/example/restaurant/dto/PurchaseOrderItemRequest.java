package com.example.restaurant.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderItemRequest {

    @NotNull(message = "ID nguyên liệu là bắt buộc")
    private Long ingredientId;

    @NotNull(message = "Số lượng mua là bắt buộc")
    @Positive(message = "Số lượng mua phải lớn hơn 0")
    private Double quantity;

    @NotNull(message = "Đơn giá mua là bắt buộc")
    @Positive(message = "Đơn giá mua phải lớn hơn 0")
    private BigDecimal price;
}
