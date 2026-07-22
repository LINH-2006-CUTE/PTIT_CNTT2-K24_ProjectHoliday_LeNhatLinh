package com.example.restaurant.repository;

import com.example.restaurant.entity.PurchaseOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    @Query("SELECT p FROM PurchaseOrder p WHERE LOWER(p.supplier.company) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.status) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<PurchaseOrder> searchPurchaseOrders(@Param("search") String search, Pageable pageable);
}
