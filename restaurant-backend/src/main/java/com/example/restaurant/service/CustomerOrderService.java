package com.example.restaurant.service;

import com.example.restaurant.dto.CustomerOrderRequest;
import com.example.restaurant.dto.OrderHistoryDTO;

import java.util.List;

public interface CustomerOrderService {

    OrderHistoryDTO createOrder(CustomerOrderRequest request);

    OrderHistoryDTO getOrderById(Long id);

    List<OrderHistoryDTO> getCustomerOrders(String phoneOrEmail, String status, String search);

    OrderHistoryDTO cancelOrder(Long id);
}
