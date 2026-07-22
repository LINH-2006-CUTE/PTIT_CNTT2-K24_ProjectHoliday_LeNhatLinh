package com.example.restaurant.service;

import com.example.restaurant.dto.OrderHistoryDTO;

import java.util.List;

public interface ChefKitchenService {
    List<OrderHistoryDTO> getKitchenOrders(String cookingStatus);
    OrderHistoryDTO updateItemCookingStatus(Long orderItemId, String cookingStatus);
    OrderHistoryDTO notifyWaiter(Long orderId);
}
