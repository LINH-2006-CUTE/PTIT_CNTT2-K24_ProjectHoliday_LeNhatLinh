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
public class KitchenQueueResponse {
    private Long orderItemId;
    private Long orderId;
    private String tableNumber;
    private String dishName;
    private String dishImage;
    private Integer quantity;
    private String cookingStatus;
    private LocalDateTime orderTime;
}
