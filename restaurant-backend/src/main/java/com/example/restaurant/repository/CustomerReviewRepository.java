package com.example.restaurant.repository;

import com.example.restaurant.entity.CustomerReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerReviewRepository extends JpaRepository<CustomerReview, Long> {

    List<CustomerReview> findByFeaturedTrueOrderByCreatedAtDesc();
    List<CustomerReview> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);
}
