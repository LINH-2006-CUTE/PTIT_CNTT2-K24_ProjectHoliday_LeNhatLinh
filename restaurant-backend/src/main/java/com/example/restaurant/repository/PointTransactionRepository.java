package com.example.restaurant.repository;

import com.example.restaurant.entity.PointTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {

    List<PointTransaction> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);

    List<PointTransaction> findByCustomerEmailAndTypeOrderByCreatedAtDesc(String customerEmail, String type);
}
