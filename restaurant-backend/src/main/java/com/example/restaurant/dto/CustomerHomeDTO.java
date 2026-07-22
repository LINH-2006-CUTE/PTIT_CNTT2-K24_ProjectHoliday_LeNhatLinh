package com.example.restaurant.dto;

import com.example.restaurant.entity.Category;
import com.example.restaurant.entity.Dish;
import com.example.restaurant.entity.Promotion;
import com.example.restaurant.entity.CustomerReview;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerHomeDTO {

    private List<BannerSlide> banners;
    private List<Category> categories;
    private List<Dish> featuredDishes;
    private List<Dish> bestSellingDishes;
    private List<Promotion> activePromotions;
    private List<CustomerReview> reviews;
    private RestaurantMeta restaurantInfo;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BannerSlide {
        private Long id;
        private String title;
        private String subtitle;
        private String imageUrl;
        private String buttonText;
        private String buttonLink;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RestaurantMeta {
        private String name;
        private String tagline;
        private String address;
        private String phone;
        private String email;
        private String openingHours;
        private String story;
    }
}
