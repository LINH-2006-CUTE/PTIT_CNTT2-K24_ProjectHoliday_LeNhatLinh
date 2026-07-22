package com.example.restaurant.repository;

import com.example.restaurant.entity.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

    Optional<Ingredient> findByName(String name);

    @Query("SELECT i FROM Ingredient i WHERE i.stockQuantity <= i.minStockThreshold")
    List<Ingredient> findLowStockIngredients();

    @Query("SELECT i FROM Ingredient i WHERE LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Ingredient> searchIngredients(@Param("search") String search);
}
