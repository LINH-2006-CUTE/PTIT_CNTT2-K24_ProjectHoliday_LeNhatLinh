package com.example.restaurant.repository;

import com.example.restaurant.entity.DiningTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiningTableRepository extends JpaRepository<DiningTable, Long> {
    Optional<DiningTable> findByTableNumber(String tableNumber);
    boolean existsByTableNumber(String tableNumber);

    List<DiningTable> findByParentTableIsNull();

    @Query("SELECT t FROM DiningTable t " +
           "WHERE t.parentTable IS NULL " +
           "AND (:search IS NULL OR LOWER(t.tableNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.area) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:area IS NULL OR t.area = :area) " +
           "AND (:status IS NULL OR t.status = :status)")
    List<DiningTable> searchTables(@Param("search") String search,
                                   @Param("area") String area,
                                   @Param("status") String status);
}
