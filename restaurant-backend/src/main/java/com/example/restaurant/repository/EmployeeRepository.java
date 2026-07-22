package com.example.restaurant.repository;

import com.example.restaurant.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmployeeCode(String employeeCode);
    Boolean existsByEmployeeCode(String employeeCode);
    Optional<Employee> findByUserId(Long userId);
    Boolean existsByUserId(Long userId);

    @Query("SELECT DISTINCT e FROM Employee e JOIN e.user u LEFT JOIN u.roles r " +
           "WHERE (:search IS NULL OR LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:roleName IS NULL OR r.name = :roleName) " +
           "AND (:status IS NULL OR e.status = :status)")
    Page<Employee> searchEmployees(@Param("search") String search,
                                   @Param("roleName") String roleName,
                                   @Param("status") String status,
                                   Pageable pageable);
}
