package com.example.restaurant.repository;

import com.example.restaurant.entity.Dish;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DishRepository extends JpaRepository<Dish, Long> {
    Optional<Dish> findByName(String name);
    boolean existsByName(String name);
    boolean existsByCategoryId(Long categoryId);

    @Query("SELECT d FROM Dish d LEFT JOIN d.category c " +
           "WHERE (:search IS NULL OR LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(d.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:categoryId IS NULL OR c.id = :categoryId) " +
           "AND (:status IS NULL OR d.status = :status OR d.status IS NULL) " +
           "AND (:available IS NULL OR d.available = :available OR d.available IS NULL)")
    Page<Dish> searchDishes(@Param("search") String search,
                            @Param("categoryId") Long categoryId,
                            @Param("status") String status,
                            @Param("available") Boolean available,
                            Pageable pageable);
}
