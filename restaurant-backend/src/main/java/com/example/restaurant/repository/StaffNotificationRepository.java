package com.example.restaurant.repository;

import com.example.restaurant.entity.StaffNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffNotificationRepository extends JpaRepository<StaffNotification, Long> {

    List<StaffNotification> findByTargetRoleInOrderByCreatedAtDesc(List<String> targetRoles);

    long countByTargetRoleInAndIsConfirmedFalse(List<String> targetRoles);

    List<StaffNotification> findAllByOrderByCreatedAtDesc();
}
