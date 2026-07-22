package com.example.restaurant.service;

import com.example.restaurant.config.KitchenWebSocketHandler;
import com.example.restaurant.dto.KitchenQueueResponse;
import com.example.restaurant.entity.OrderItem;
import com.example.restaurant.exception.ApiException;
import com.example.restaurant.repository.OrderItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class KitchenServiceImpl implements KitchenService {

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private KitchenWebSocketHandler kitchenWebSocketHandler;

    @Override
    @Transactional(readOnly = true)
    public List<KitchenQueueResponse> getKitchenQueue(String statusFilter) {
        String status = (statusFilter == null || statusFilter.trim().isEmpty() || statusFilter.equalsIgnoreCase("All")) 
                ? null : statusFilter.toUpperCase().trim();
        
        List<OrderItem> items = orderItemRepository.findByCookingStatusRaw(status);
        return items.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public KitchenQueueResponse updateItemCookingStatus(Long orderItemId, String status) {
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new ApiException("Order item not found", HttpStatus.NOT_FOUND));

        String newStatus = status.toUpperCase().trim();
        item.setCookingStatus(newStatus);
        OrderItem saved = orderItemRepository.save(item);

        // Notify all clients connected to the websocket
        kitchenWebSocketHandler.broadcast("REFRESH_KITCHEN_QUEUE");

        return mapToResponse(saved);
    }

    private KitchenQueueResponse mapToResponse(OrderItem item) {
        String tableNum = "Takeout";
        if (item.getOrder().getDiningTable() != null) {
            tableNum = item.getOrder().getDiningTable().getTableNumber();
        }

        return KitchenQueueResponse.builder()
                .orderItemId(item.getId())
                .orderId(item.getOrder().getId())
                .tableNumber(tableNum)
                .dishName(item.getDish().getName())
                .dishImage(item.getDish().getImage())
                .quantity(item.getQuantity())
                .cookingStatus(item.getCookingStatus())
                .orderTime(item.getOrder().getOrderDate())
                .build();
    }
}
