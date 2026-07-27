package com.example.restaurant.service;

import com.example.restaurant.entity.Category;
import com.example.restaurant.entity.Dish;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface CustomerMenuService {

    Page<Dish> searchMenu(String search, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice,
                          Boolean isNew, Boolean isBestSeller, Boolean hasDiscount, Pageable pageable);

    Dish getDishById(Long id);

    List<Category> getAllCategories();
}
