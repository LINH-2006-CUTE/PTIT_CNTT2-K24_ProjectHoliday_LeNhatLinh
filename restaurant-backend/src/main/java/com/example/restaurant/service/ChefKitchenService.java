package com.example.restaurant.service;

import com.example.restaurant.dto.ChefDashboardDTO;
import com.example.restaurant.dto.OrderHistoryDTO;
import com.example.restaurant.dto.OrderRecipeCheckDTO;

import java.util.List;

public interface ChefKitchenService {
    ChefDashboardDTO getChefDashboardStats();
    List<OrderHistoryDTO> getKitchenOrders(String cookingStatus, Long categoryId, String search);
    List<OrderHistoryDTO> getCompletedOrders();
    OrderHistoryDTO updateItemCookingStatus(Long orderItemId, String cookingStatus);
    OrderHistoryDTO notifyWaiter(Long orderId);
    
    List<OrderRecipeCheckDTO> checkOrderRecipes(Long orderId);
    OrderHistoryDTO deductIngredientsAndStartCooking(Long orderId);
    OrderHistoryDTO updateOrderStatus(Long orderId, String status);
}
