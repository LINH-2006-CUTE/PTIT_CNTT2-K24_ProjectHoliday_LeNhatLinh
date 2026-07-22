package com.example.restaurant.service;

import com.example.restaurant.entity.Dish;
import com.example.restaurant.entity.Favorite;
import com.example.restaurant.exception.ApiException;
import com.example.restaurant.repository.DishRepository;
import com.example.restaurant.repository.FavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class FavoriteServiceImpl implements FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private DishRepository dishRepository;

    @Override
    public boolean toggleFavorite(String customerEmail, Long dishId) {
        String email = customerEmail.trim().toLowerCase();
        Optional<Favorite> favOpt = favoriteRepository.findByCustomerEmailAndDishId(email, dishId);
        if (favOpt.isPresent()) {
            favoriteRepository.delete(favOpt.get());
            return false; // Removed from favorites
        } else {
            Dish dish = dishRepository.findById(dishId)
                    .orElseThrow(() -> new ApiException("Không tìm thấy món ăn #" + dishId, HttpStatus.NOT_FOUND));

            Favorite fav = Favorite.builder()
                    .customerEmail(email)
                    .dish(dish)
                    .build();
            favoriteRepository.save(fav);
            return true; // Added to favorites
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Dish> getFavoriteDishes(String customerEmail, String search) {
        String email = customerEmail.trim().toLowerCase();
        List<Favorite> favorites = favoriteRepository.findByCustomerEmailOrderByCreatedAtDesc(email);

        return favorites.stream()
                .map(Favorite::getDish)
                .filter(d -> search == null || search.trim().isEmpty() ||
                             d.getName().toLowerCase().contains(search.trim().toLowerCase()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getFavoriteDishIds(String customerEmail) {
        String email = customerEmail.trim().toLowerCase();
        List<Favorite> favorites = favoriteRepository.findByCustomerEmailOrderByCreatedAtDesc(email);
        return favorites.stream().map(f -> f.getDish().getId()).collect(Collectors.toList());
    }
}
