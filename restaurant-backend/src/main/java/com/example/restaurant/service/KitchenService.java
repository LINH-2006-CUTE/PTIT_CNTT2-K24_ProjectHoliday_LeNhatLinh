package com.example.restaurant.service;

import com.example.restaurant.dto.KitchenQueueResponse;
import java.util.List;

public interface KitchenService {
    List<KitchenQueueResponse> getKitchenQueue(String statusFilter);
    KitchenQueueResponse updateItemCookingStatus(Long orderItemId, String status);
}
