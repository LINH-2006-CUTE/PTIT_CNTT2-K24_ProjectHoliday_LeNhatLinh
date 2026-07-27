package com.example.restaurant.controller;

import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.DishCreateRequest;
import com.example.restaurant.dto.DishResponse;
import com.example.restaurant.dto.DishUpdateRequest;
import com.example.restaurant.service.DishManagementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/dishes")
@PreAuthorize("hasRole('ADMIN')")
public class DishManagementController {

    @Autowired
    private DishManagementService dishManagementService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<DishResponse>>> searchDishes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean available,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {

        String[] sortParams = sort.split(",");
        String sortBy = sortParams[0];
        Sort.Direction direction = Sort.Direction.ASC;
        if (sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")) {
            direction = Sort.Direction.DESC;
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<DishResponse> dishes = dishManagementService.searchDishes(search, categoryId, status, available, pageable);
        return ResponseEntity.ok(ApiResponse.success(dishes, "Menu dishes fetched successfully."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DishResponse>> getDishById(@PathVariable Long id) {
        DishResponse dish = dishManagementService.getDishById(id);
        return ResponseEntity.ok(ApiResponse.success(dish, "Dish details fetched."));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DishResponse>> createDish(@Valid @RequestBody DishCreateRequest request) {
        DishResponse dish = dishManagementService.createDish(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(dish, "Menu dish created successfully."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DishResponse>> updateDish(
            @PathVariable Long id,
            @Valid @RequestBody DishUpdateRequest request) {
        DishResponse dish = dishManagementService.updateDish(id, request);
        return ResponseEntity.ok(ApiResponse.success(dish, "Menu dish updated successfully."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDish(@PathVariable Long id) {
        dishManagementService.deleteDish(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Menu dish deleted successfully."));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<ApiResponse<String>> uploadDishImage(@RequestParam("file") MultipartFile file) {
        String imageUrl = dishManagementService.uploadDishImage(file);
        return ResponseEntity.ok(ApiResponse.success(imageUrl, "Dish image uploaded successfully."));
    }
}
