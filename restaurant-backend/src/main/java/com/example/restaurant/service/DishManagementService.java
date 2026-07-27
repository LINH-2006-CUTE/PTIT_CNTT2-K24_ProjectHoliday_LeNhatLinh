package com.example.restaurant.service;

import com.example.restaurant.dto.DishCreateRequest;
import com.example.restaurant.dto.DishResponse;
import com.example.restaurant.dto.DishUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface DishManagementService {
    Page<DishResponse> searchDishes(String search, Long categoryId, String status, Boolean available, Pageable pageable);
    DishResponse getDishById(Long id);
    DishResponse createDish(DishCreateRequest request);
    DishResponse updateDish(Long id, DishUpdateRequest request);
    void deleteDish(Long id);
    String uploadDishImage(MultipartFile file);
}
