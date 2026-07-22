package com.example.restaurant.repository;

import com.example.restaurant.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);

    long countByCustomerEmailAndIsReadFalse(String customerEmail);
}
