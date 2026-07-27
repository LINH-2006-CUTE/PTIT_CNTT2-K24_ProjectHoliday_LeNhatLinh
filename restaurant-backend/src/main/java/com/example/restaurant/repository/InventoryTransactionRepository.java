package com.example.restaurant.repository;

import com.example.restaurant.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {

    @Query("SELECT t FROM InventoryTransaction t WHERE t.ingredient.id = :ingredientId ORDER BY t.transactionDate DESC")
    List<InventoryTransaction> findByIngredientId(@Param("ingredientId") Long ingredientId);

    @Query("SELECT t FROM InventoryTransaction t ORDER BY t.transactionDate DESC")
    List<InventoryTransaction> findAllOrderByDateDesc();
}
