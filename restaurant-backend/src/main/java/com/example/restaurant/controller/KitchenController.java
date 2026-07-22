package com.example.restaurant.controller;

import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.KitchenQueueResponse;
import com.example.restaurant.service.KitchenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/kitchen")
@PreAuthorize("hasRole('ADMIN')")
public class KitchenController {

    @Autowired
    private KitchenService kitchenService;

    @GetMapping("/queue")
    public ResponseEntity<ApiResponse<List<KitchenQueueResponse>>> getKitchenQueue(
            @RequestParam(required = false) String status) {
        List<KitchenQueueResponse> queue = kitchenService.getKitchenQueue(status);
        return ResponseEntity.ok(ApiResponse.success(queue, "Kitchen order queue fetched."));
    }

    @PutMapping("/items/{orderItemId}/status")
    public ResponseEntity<ApiResponse<KitchenQueueResponse>> updateItemStatus(
            @PathVariable Long orderItemId,
            @RequestParam String status) {
        KitchenQueueResponse res = kitchenService.updateItemCookingStatus(orderItemId, status);
        return ResponseEntity.ok(ApiResponse.success(res, "Order item cooking status updated."));
    }
}
