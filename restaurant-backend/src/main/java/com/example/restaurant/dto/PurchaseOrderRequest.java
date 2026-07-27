package com.example.restaurant.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderRequest {

    @NotNull(message = "ID nhà cung cấp là bắt buộc")
    private Long supplierId;

    @NotEmpty(message = "Danh sách nguyên liệu đặt hàng không được trống")
    private List<PurchaseOrderItemRequest> items;
}
