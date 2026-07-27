package com.example.restaurant.service;

import com.example.restaurant.dto.DishCreateRequest;
import com.example.restaurant.dto.DishResponse;
import com.example.restaurant.dto.DishUpdateRequest;
import com.example.restaurant.entity.Category;
import com.example.restaurant.entity.Dish;
import com.example.restaurant.exception.ApiException;
import com.example.restaurant.repository.CategoryRepository;
import com.example.restaurant.repository.DishRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class DishManagementServiceImpl implements DishManagementService {

    @Autowired
    private DishRepository dishRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private static final String UPLOAD_DIR = "uploads";

    @Override
    @Transactional(readOnly = true)
    public Page<DishResponse> searchDishes(String search, Long categoryId, String status, Boolean available, Pageable pageable) {
        String searchParam = (search == null || search.trim().isEmpty()) ? null : search.trim();
        String statusParam = (status == null || status.trim().isEmpty() || status.equalsIgnoreCase("All")) ? null : status.trim();

        Page<Dish> dishPage = dishRepository.searchDishes(searchParam, categoryId, statusParam, available, pageable);
        return dishPage.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public DishResponse getDishById(Long id) {
        Dish dish = dishRepository.findById(id)
                .orElseThrow(() -> new ApiException("Dish not found", HttpStatus.NOT_FOUND));
        return mapToResponse(dish);
    }

    @Override
    @Transactional
    public DishResponse createDish(DishCreateRequest request) {
        if (dishRepository.existsByName(request.getName().trim())) {
            throw new ApiException("Dish name already exists", HttpStatus.BAD_REQUEST);
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ApiException("Category not found: " + request.getCategoryId(), HttpStatus.BAD_REQUEST));

        String dishCode = (request.getCode() != null && !request.getCode().trim().isEmpty())
                ? request.getCode().trim().toUpperCase()
                : "DISH-" + (System.currentTimeMillis() % 10000);

        Dish dish = Dish.builder()
                .name(request.getName().trim())
                .category(category)
                .code(dishCode)
                .price(request.getPrice())
                .costPrice(request.getCostPrice())
                .discount(request.getDiscount() != null ? request.getDiscount() : java.math.BigDecimal.ZERO)
                .description(request.getDescription())
                .image(request.getImage())
                .ingredients(request.getIngredients())
                .prepTime(request.getPrepTime() != null ? request.getPrepTime() : 15)
                .calories(request.getCalories())
                .spiciness(request.getSpiciness() != null ? request.getSpiciness() : "Không cay")
                .dishSize(request.getDishSize() != null ? request.getDishSize() : "Vừa (M)")
                .notes(request.getNotes())
                .status(request.getStatus())
                .available(request.isAvailable())
                .build();

        Dish saved = dishRepository.save(dish);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public DishResponse updateDish(Long id, DishUpdateRequest request) {
        Dish dish = dishRepository.findById(id)
                .orElseThrow(() -> new ApiException("Dish not found", HttpStatus.NOT_FOUND));

        String newName = request.getName().trim();
        if (!newName.equalsIgnoreCase(dish.getName()) && dishRepository.existsByName(newName)) {
            throw new ApiException("Dish name already exists", HttpStatus.BAD_REQUEST);
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ApiException("Category not found: " + request.getCategoryId(), HttpStatus.BAD_REQUEST));

        String dishCode = (request.getCode() != null && !request.getCode().trim().isEmpty())
                ? request.getCode().trim().toUpperCase()
                : (dish.getCode() != null ? dish.getCode() : "DISH-" + dish.getId());

        dish.setName(newName);
        dish.setCategory(category);
        dish.setCode(dishCode);
        dish.setPrice(request.getPrice());
        dish.setCostPrice(request.getCostPrice());
        dish.setDiscount(request.getDiscount() != null ? request.getDiscount() : java.math.BigDecimal.ZERO);
        dish.setDescription(request.getDescription());
        dish.setImage(request.getImage());
        dish.setIngredients(request.getIngredients());
        dish.setPrepTime(request.getPrepTime());
        dish.setCalories(request.getCalories());
        dish.setSpiciness(request.getSpiciness());
        dish.setDishSize(request.getDishSize());
        dish.setNotes(request.getNotes());
        dish.setStatus(request.getStatus());
        dish.setAvailable(request.isAvailable());

        Dish updated = dishRepository.save(dish);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteDish(Long id) {
        Dish dish = dishRepository.findById(id)
                .orElseThrow(() -> new ApiException("Dish not found", HttpStatus.NOT_FOUND));

        dishRepository.delete(dish);
    }

    @Override
    public String uploadDishImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ApiException("File is empty", HttpStatus.BAD_REQUEST);
        }

        try {
            File uploadFolder = new File(UPLOAD_DIR);
            if (!uploadFolder.exists()) {
                uploadFolder.mkdirs();
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String uniqueFilename = System.currentTimeMillis() + "_" + UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(UPLOAD_DIR, uniqueFilename);
            Files.write(filePath, file.getBytes());

            return "http://localhost:8080/uploads/" + uniqueFilename;
        } catch (IOException e) {
            throw new ApiException("Failed to save dish image: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private DishResponse mapToResponse(Dish dish) {
        return DishResponse.builder()
                .id(dish.getId())
                .name(dish.getName())
                .categoryId(dish.getCategory().getId())
                .categoryName(dish.getCategory().getName())
                .code(dish.getCode() != null ? dish.getCode() : "DISH-" + String.format("%03d", dish.getId()))
                .price(dish.getPrice())
                .costPrice(dish.getCostPrice())
                .discount(dish.getDiscount())
                .description(dish.getDescription())
                .image(dish.getImage())
                .ingredients(dish.getIngredients())
                .prepTime(dish.getPrepTime() != null ? dish.getPrepTime() : 15)
                .calories(dish.getCalories())
                .spiciness(dish.getSpiciness() != null ? dish.getSpiciness() : "Không cay")
                .dishSize(dish.getDishSize() != null ? dish.getDishSize() : "Vừa (M)")
                .notes(dish.getNotes())
                .status(dish.getStatus())
                .available(dish.isAvailable())
                .build();
    }
}
