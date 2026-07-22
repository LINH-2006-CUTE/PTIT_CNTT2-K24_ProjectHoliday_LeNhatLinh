package com.example.restaurant.service;

import com.example.restaurant.dto.CustomerHomeDTO;
import com.example.restaurant.dto.CustomerReviewRequest;
import com.example.restaurant.entity.Category;
import com.example.restaurant.entity.CustomerReview;
import com.example.restaurant.entity.Dish;
import com.example.restaurant.entity.Promotion;
import com.example.restaurant.repository.CategoryRepository;
import com.example.restaurant.repository.CustomerReviewRepository;
import com.example.restaurant.repository.DishRepository;
import com.example.restaurant.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CustomerHomeServiceImpl implements CustomerHomeService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private DishRepository dishRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private CustomerReviewRepository reviewRepository;

    @Override
    @Transactional(readOnly = true)
    public CustomerHomeDTO getHomePageData() {
        // 1. Hero Banners
        List<CustomerHomeDTO.BannerSlide> banners = new ArrayList<>();
        banners.add(CustomerHomeDTO.BannerSlide.builder()
                .id(1L)
                .title("Trải Nghiệm Ẩm Thực Pháp Thượng Hạng")
                .subtitle("Hương vị tinh tế từ nguồn nguyên liệu tuyển chọn bởi Bếp trưởng 5 sao L'ÉCLAT")
                .imageUrl("https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1920&q=80")
                .buttonText("Khám Phá Thực Đơn")
                .buttonLink("/menu")
                .build());

        banners.add(CustomerHomeDTO.BannerSlide.builder()
                .id(2L)
                .title("Không Gian Sang Trọng & Lãng Mạn")
                .subtitle("Điểm hẹn lý tưởng cho những bữa tiệc kỷ niệm, gặp gỡ đối tác và gia đình")
                .imageUrl("https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1920&q=80")
                .buttonText("Đặt Bàn Ngay")
                .buttonLink("/reservation")
                .build());

        banners.add(CustomerHomeDTO.BannerSlide.builder()
                .id(3L)
                .title("Nghệ Thuật Phục Vụ Đỉnh Cao 5 Sao")
                .subtitle("Mỗi món ăn là một tác phẩm nghệ thuật đem tới trải nghiệm thấu hiểu vị giác")
                .imageUrl("https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1920&q=80")
                .buttonText("Khám Phá Ngay")
                .buttonLink("/menu")
                .build());

        // 2. Categories
        List<Category> categories = categoryRepository.findAll();

        // 3. Featured & Best Seller Dishes
        List<Dish> allDishes = dishRepository.findAll();
        List<Dish> activeDishes = allDishes.stream()
                .filter(d -> d.isAvailable() && "ACTIVE".equalsIgnoreCase(d.getStatus()))
                .collect(Collectors.toList());

        List<Dish> featuredDishes = activeDishes.stream().limit(6).collect(Collectors.toList());
        List<Dish> bestSellingDishes = activeDishes.stream().skip(Math.max(0, activeDishes.size() - 6)).collect(Collectors.toList());

        // 4. Active Promotions
        List<Promotion> activePromotions = promotionRepository.findAll().stream()
                .filter(p -> "ACTIVE".equalsIgnoreCase(p.getStatus()))
                .limit(4)
                .collect(Collectors.toList());

        // 5. Customer Reviews
        List<CustomerReview> reviews = reviewRepository.findByFeaturedTrueOrderByCreatedAtDesc();

        // 6. Restaurant Meta
        CustomerHomeDTO.RestaurantMeta meta = CustomerHomeDTO.RestaurantMeta.builder()
                .name("L'Étoile Fine Dining Restaurant")
                .tagline("Nơi Lưu Giữ Tinh Hoa Ẩm Thực Cao Cấp")
                .address("123 Phố Tràng Tiền, Quận Hoàn Kiếm, Hà Nội")
                .phone("1900 8888 / 0909 123 456")
                .email("reservation@letoile-restaurant.vn")
                .openingHours("10:00 - 23:00 (Hàng ngày)")
                .story("L'Étoile được thành lập với sứ mệnh mang đến trải nghiệm thưởng thức ẩm thực đỉnh cao. Mỗi món ăn là một tác phẩm nghệ thuật hòa quyện giữa hương vị truyền thống và phong cách hiện đại.")
                .build();

        return CustomerHomeDTO.builder()
                .banners(banners)
                .categories(categories)
                .featuredDishes(featuredDishes)
                .bestSellingDishes(bestSellingDishes)
                .activePromotions(activePromotions)
                .reviews(reviews)
                .restaurantInfo(meta)
                .build();
    }

    @Override
    public CustomerReview submitReview(CustomerReviewRequest request) {
        CustomerReview review = CustomerReview.builder()
                .customerName(request.getCustomerName().trim())
                .avatar(request.getAvatar() != null ? request.getAvatar().trim() : null)
                .rating(request.getRating())
                .comment(request.getComment().trim())
                .featured(true)
                .build();

        return reviewRepository.save(review);
    }
}
