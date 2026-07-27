package com.example.restaurant.repository;

import com.example.restaurant.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("SELECT r FROM Reservation r LEFT JOIN r.diningTable t " +
           "WHERE (:search IS NULL OR LOWER(r.customerName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.customerPhone) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.customerEmail) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR r.status = :status) " +
           "AND (:startTime IS NULL OR r.reservationTime >= :startTime) " +
           "AND (:endTime IS NULL OR r.reservationTime <= :endTime)")
    List<Reservation> searchReservations(@Param("search") String search,
                                         @Param("status") String status,
                                         @Param("startTime") LocalDateTime startTime,
                                         @Param("endTime") LocalDateTime endTime);
    List<Reservation> findByCustomerEmailOrCustomerPhoneOrderByReservationTimeDesc(String email, String phone);
}
