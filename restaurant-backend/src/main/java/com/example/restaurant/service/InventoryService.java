package com.example.restaurant.service;

import com.example.restaurant.entity.Ingredient;
import com.example.restaurant.entity.InventoryTransaction;
import com.example.restaurant.entity.Dish;
import com.example.restaurant.dto.IngredientStockRequest;
import java.util.List;

public interface InventoryService {

    List<Ingredient> getAllIngredients(String search);

    Ingredient getIngredientById(Long id);

    Ingredient createIngredient(Ingredient ingredient);

    Ingredient updateIngredient(Long id, Ingredient ingredient);

    void deleteIngredient(Long id);

    Ingredient stockIn(Long id, IngredientStockRequest request);

    Ingredient stockOut(Long id, IngredientStockRequest request);

    Ingredient stockAdjustment(Long id, IngredientStockRequest request);

    List<InventoryTransaction> getTransactionHistory();

    List<InventoryTransaction> getTransactionHistoryByIngredient(Long ingredientId);

    List<Dish> getDishesUsingIngredient(Long ingredientId);
}
