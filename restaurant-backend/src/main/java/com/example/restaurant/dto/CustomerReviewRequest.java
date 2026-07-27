package com.example.restaurant.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerReviewRequest {

    @NotBlank(message = "Tên khách hàng không được để trống")
    private String customerName;

    private String avatar;

    @NotNull(message = "Số sao đánh giá không được để trống")
    @Min(value = 1, message = "Đánh giá tối thiểu là 1 sao")
    @Max(value = 5, message = "Đánh giá tối đa là 5 sao")
    private Integer rating;

    private String customerEmail;

    private String imageUrl;

    @NotBlank(message = "Nội dung nhận xét không được để trống")
    private String comment;
}
