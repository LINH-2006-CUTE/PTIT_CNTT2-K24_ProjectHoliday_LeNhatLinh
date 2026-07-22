package com.example.restaurant.repository;

import com.example.restaurant.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'COMPLETED'")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'COMPLETED' AND o.orderDate >= :start")
    BigDecimal calculateRevenueSince(@Param("start") LocalDateTime start);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'COMPLETED' AND o.orderDate >= :start AND o.orderDate <= :end")
    BigDecimal calculateRevenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    long countByStatus(String status);

    List<Order> findByStatusAndOrderDateAfter(String status, LocalDateTime date);

    @Query("SELECT o.customer.email, o.customer.fullName, COUNT(o), SUM(o.totalAmount) " +
           "FROM Order o " +
           "WHERE o.status = 'COMPLETED' AND o.customer IS NOT NULL " +
           "GROUP BY o.customer.email, o.customer.fullName " +
           "ORDER BY SUM(o.totalAmount) DESC")
    List<Object[]> findTopCustomersRaw();
    List<Order> findByCustomerEmailOrderByOrderDateDesc(String email);
    List<Order> findByDiningTableId(Long diningTableId);
}
