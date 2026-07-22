package com.example.restaurant.service;

import com.example.restaurant.entity.Dish;

import java.util.List;

public interface FavoriteService {

    boolean toggleFavorite(String customerEmail, Long dishId);

    List<Dish> getFavoriteDishes(String customerEmail, String search);

    List<Long> getFavoriteDishIds(String customerEmail);
}
