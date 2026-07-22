package com.example.restaurant.repository;

import com.example.restaurant.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT oi.dish.name, oi.dish.category.name, SUM(oi.quantity), SUM(oi.quantity * oi.price) " +
           "FROM OrderItem oi " +
           "WHERE oi.order.status = 'COMPLETED' " +
           "GROUP BY oi.dish.name, oi.dish.category.name " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingDishesRaw();

    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT oi FROM OrderItem oi " +
           "WHERE (:status IS NULL OR oi.cookingStatus = :status) " +
           "ORDER BY oi.order.orderDate ASC")
    List<OrderItem> findByCookingStatusRaw(@Param("status") String status);
}
