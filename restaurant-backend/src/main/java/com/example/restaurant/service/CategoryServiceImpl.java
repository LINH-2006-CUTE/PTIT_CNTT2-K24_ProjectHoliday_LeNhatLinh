package com.example.restaurant.service;

import com.example.restaurant.dto.CategoryRequest;
import com.example.restaurant.dto.CategoryResponse;
import com.example.restaurant.entity.Category;
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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private DishRepository dishRepository;

    private static final String UPLOAD_DIR = "uploads";

    @Override
    @Transactional(readOnly = true)
    public Page<CategoryResponse> searchCategories(String search, Pageable pageable) {
        String searchParam = (search == null || search.trim().isEmpty()) ? null : search.trim();
        Page<Category> catPage = categoryRepository.searchCategories(searchParam, pageable);
        return catPage.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategoriesList() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ApiException("Category not found", HttpStatus.NOT_FOUND));
        return mapToResponse(cat);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName().trim())) {
            throw new ApiException("Category name already exists", HttpStatus.BAD_REQUEST);
        }

        Category cat = Category.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .image(request.getImage())
                .build();

        Category saved = categoryRepository.save(cat);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ApiException("Category not found", HttpStatus.NOT_FOUND));

        String newName = request.getName().trim();
        if (!newName.equalsIgnoreCase(cat.getName()) && categoryRepository.existsByName(newName)) {
            throw new ApiException("Category name already exists", HttpStatus.BAD_REQUEST);
        }

        cat.setName(newName);
        cat.setDescription(request.getDescription());
        cat.setImage(request.getImage());

        Category updated = categoryRepository.save(cat);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ApiException("Category not found", HttpStatus.NOT_FOUND));

        // Check if there are dishes associated with this category
        // We will declare existsByCategoryId in DishRepository
        if (dishRepository.existsByCategoryId(id)) {
            throw new ApiException("Cannot delete category containing active menu items", HttpStatus.BAD_REQUEST);
        }

        categoryRepository.delete(cat);
    }

    @Override
    public String uploadCategoryImage(MultipartFile file) {
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
            throw new ApiException("Failed to save category image: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private CategoryResponse mapToResponse(Category cat) {
        return CategoryResponse.builder()
                .id(cat.getId())
                .name(cat.getName())
                .description(cat.getDescription())
                .image(cat.getImage())
                .build();
    }
}
