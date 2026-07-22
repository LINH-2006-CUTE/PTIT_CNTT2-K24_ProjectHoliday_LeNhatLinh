package com.example.restaurant.service;

import com.example.restaurant.dto.CategoryRequest;
import com.example.restaurant.dto.CategoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CategoryService {
    Page<CategoryResponse> searchCategories(String search, Pageable pageable);
    List<CategoryResponse> getAllCategoriesList();
    CategoryResponse getCategoryById(Long id);
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
    String uploadCategoryImage(MultipartFile file);
}
