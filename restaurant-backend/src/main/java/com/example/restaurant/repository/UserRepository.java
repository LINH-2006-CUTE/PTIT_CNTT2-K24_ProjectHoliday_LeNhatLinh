package com.example.restaurant.repository;

import com.example.restaurant.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    Optional<User> findByEmailAndOtpCode(String email, String otpCode);

    @Query("SELECT DISTINCT u FROM User u LEFT JOIN u.roles r " +
           "WHERE (:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:roleName IS NULL OR r.name = :roleName) " +
           "AND (:enabled IS NULL OR u.enabled = :enabled)")
    Page<User> searchUsers(@Param("search") String search,
                           @Param("roleName") String roleName,
                           @Param("enabled") Boolean enabled,
                           Pageable pageable);
}
