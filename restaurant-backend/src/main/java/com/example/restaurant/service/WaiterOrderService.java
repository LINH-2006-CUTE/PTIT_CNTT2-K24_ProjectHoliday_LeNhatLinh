package com.example.restaurant.service;

import com.example.restaurant.dto.CustomerOrderRequest;
import com.example.restaurant.dto.OrderHistoryDTO;

import java.util.List;

public interface WaiterOrderService {
    List<OrderHistoryDTO> getActiveOrders();
    OrderHistoryDTO createWaiterOrder(CustomerOrderRequest request);
    OrderHistoryDTO addItemToOrder(Long orderId, CustomerOrderRequest.OrderItemRequest itemReq);
    OrderHistoryDTO removeItemFromOrder(Long orderId, Long dishId);
    OrderHistoryDTO updateItemQuantity(Long orderId, Long dishId, Integer quantity, String note);
    OrderHistoryDTO sendToKitchen(Long orderId);
}
