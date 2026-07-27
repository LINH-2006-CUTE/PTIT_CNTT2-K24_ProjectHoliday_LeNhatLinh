package com.example.restaurant.controller;

import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.CustomerReviewRequest;
import com.example.restaurant.entity.CustomerReview;
import com.example.restaurant.exception.ApiException;
import com.example.restaurant.repository.CustomerReviewRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/reviews")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CustomerReviewController {

    @Autowired
    private CustomerReviewRepository reviewRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerReview>> createReview(@Valid @RequestBody CustomerReviewRequest request) {
        CustomerReview review = CustomerReview.builder()
                .customerName(request.getCustomerName().trim())
                .customerEmail(request.getCustomerEmail() != null ? request.getCustomerEmail().trim().toLowerCase() : null)
                .imageUrl(request.getImageUrl() != null ? request.getImageUrl().trim() : null)
                .avatar(request.getAvatar() != null ? request.getAvatar().trim() : null)
                .rating(request.getRating())
                .comment(request.getComment().trim())
                .featured(true)
                .build();

        review = reviewRepository.save(review);
        return ResponseEntity.ok(ApiResponse.success(review, "Cảm ơn bạn đã gửi đánh giá cho L'Étoile!"));
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<ApiResponse<List<CustomerReview>>> getMyReviews(@RequestParam("email") String email) {
        List<CustomerReview> reviews = reviewRepository.findByCustomerEmailOrderByCreatedAtDesc(email.trim().toLowerCase());
        return ResponseEntity.ok(ApiResponse.success(reviews, "Lấy danh sách đánh giá cá nhân thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerReview>> updateReview(
            @PathVariable("id") Long id,
            @Valid @RequestBody CustomerReviewRequest request) {
        CustomerReview review = reviewRepository.findById(id)
                .orElseThrow(() -> new ApiException("Không tìm thấy đánh giá #" + id, HttpStatus.NOT_FOUND));

        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());
        if (request.getImageUrl() != null) review.setImageUrl(request.getImageUrl().trim());

        review = reviewRepository.save(review);
        return ResponseEntity.ok(ApiResponse.success(review, "Cập nhật đánh giá thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable("id") Long id) {
        reviewRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã xóa đánh giá thành công"));
    }
}
