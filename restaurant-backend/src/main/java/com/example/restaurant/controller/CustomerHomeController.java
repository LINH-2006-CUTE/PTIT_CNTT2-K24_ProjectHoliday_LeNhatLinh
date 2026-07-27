package com.example.restaurant.controller;

import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.CustomerHomeDTO;
import com.example.restaurant.dto.CustomerReviewRequest;
import com.example.restaurant.entity.CustomerReview;
import com.example.restaurant.service.CustomerHomeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CustomerHomeController {

    @Autowired
    private CustomerHomeService customerHomeService;

    @GetMapping("/home")
    public ResponseEntity<ApiResponse<CustomerHomeDTO>> getHomePageData() {
        CustomerHomeDTO data = customerHomeService.getHomePageData();
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy dữ liệu trang chủ khách hàng thành công"));
    }

    @PostMapping("/reviews")
    public ResponseEntity<ApiResponse<CustomerReview>> submitReview(@Valid @RequestBody CustomerReviewRequest request) {
        CustomerReview created = customerHomeService.submitReview(request);
        return ResponseEntity.ok(ApiResponse.success(created, "Gửi nhận xét đánh giá thành công. Cảm ơn bạn!"));
    }
}
