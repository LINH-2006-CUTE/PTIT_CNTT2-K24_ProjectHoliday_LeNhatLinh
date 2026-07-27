package com.example.restaurant.service;

import com.example.restaurant.entity.Category;
import com.example.restaurant.entity.Dish;
import com.example.restaurant.exception.ApiException;
import org.springframework.http.HttpStatus;
import com.example.restaurant.repository.CategoryRepository;
import com.example.restaurant.repository.DishRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CustomerMenuServiceImpl implements CustomerMenuService {

    @Autowired
    private DishRepository dishRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public Page<Dish> searchMenu(String search, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice,
                                 Boolean isNew, Boolean isBestSeller, Boolean hasDiscount, Pageable pageable) {

        Page<Dish> pageResult = dishRepository.searchDishes(search, categoryId, null, null, pageable);

        List<Dish> filtered = pageResult.getContent().stream().filter(dish -> {
            if (minPrice != null && dish.getPrice().compareTo(minPrice) < 0) return false;
            if (maxPrice != null && dish.getPrice().compareTo(maxPrice) > 0) return false;
            if (Boolean.TRUE.equals(hasDiscount) && (dish.getDiscount() == null || dish.getDiscount().compareTo(BigDecimal.ZERO) <= 0)) return false;
            return true;
        }).collect(Collectors.toList());

        return new PageImpl<>(filtered, pageable, pageResult.getTotalElements());
    }

    @Override
    public Dish getDishById(Long id) {
        return dishRepository.findById(id)
                .orElseThrow(() -> new ApiException("Không tìm thấy món ăn có mã: " + id, HttpStatus.NOT_FOUND));
    }

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
}
