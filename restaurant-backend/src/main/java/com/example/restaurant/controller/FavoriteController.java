package com.example.restaurant.controller;

import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.entity.Dish;
import com.example.restaurant.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/favorites")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @PostMapping("/toggle/{dishId}")
    public ResponseEntity<ApiResponse<Boolean>> toggleFavorite(
            @PathVariable("dishId") Long dishId,
            @RequestParam("email") String email) {
        boolean favorited = favoriteService.toggleFavorite(email, dishId);
        String msg = favorited ? "Đã thêm món ăn vào danh sách yêu thích ❤️" : "Đã xóa món ăn khỏi danh sách yêu thích";
        return ResponseEntity.ok(ApiResponse.success(favorited, msg));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Dish>>> getFavoriteDishes(
            @RequestParam("email") String email,
            @RequestParam(value = "search", required = false) String search) {
        List<Dish> list = favoriteService.getFavoriteDishes(email, search);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách món yêu thích thành công"));
    }

    @GetMapping("/ids")
    public ResponseEntity<ApiResponse<List<Long>>> getFavoriteDishIds(@RequestParam("email") String email) {
        List<Long> ids = favoriteService.getFavoriteDishIds(email);
        return ResponseEntity.ok(ApiResponse.success(ids, "Lấy danh sách ID yêu thích thành công"));
    }
}
