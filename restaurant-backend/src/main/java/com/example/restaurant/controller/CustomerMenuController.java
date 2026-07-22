package com.example.restaurant.controller;

import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.TableResponse;
import com.example.restaurant.entity.Category;
import com.example.restaurant.entity.Dish;
import com.example.restaurant.service.CustomerMenuService;
import com.example.restaurant.service.DiningTableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/public/menu")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CustomerMenuController {

    @Autowired
    private CustomerMenuService customerMenuService;

    @Autowired
    private DiningTableService diningTableService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Dish>>> searchMenu(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(value = "isNew", required = false) Boolean isNew,
            @RequestParam(value = "isBestSeller", required = false) Boolean isBestSeller,
            @RequestParam(value = "hasDiscount", required = false) Boolean hasDiscount,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "12") int size,
            @RequestParam(value = "sort", defaultValue = "id,desc") String sort) {

        String[] sortParams = sort.split(",");
        Sort sortObj = Sort.by(sortParams[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortParams[0]);
        Pageable pageable = PageRequest.of(page, size, sortObj);

        Page<Dish> list = customerMenuService.searchMenu(search, categoryId, minPrice, maxPrice, isNew, isBestSeller, hasDiscount, pageable);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách thực đơn thành công"));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<Category>>> getCategories() {
        List<Category> list = customerMenuService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh mục thực đơn thành công"));
    }

    @GetMapping("/tables")
    public ResponseEntity<ApiResponse<List<TableResponse>>> getPublicTables() {
        List<TableResponse> list = diningTableService.searchTables(null, null, null);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách bàn ăn thành công"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Dish>> getDishById(@PathVariable("id") Long id) {
        Dish dish = customerMenuService.getDishById(id);
        return ResponseEntity.ok(ApiResponse.success(dish, "Lấy thông tin món ăn thành công"));
    }
}
