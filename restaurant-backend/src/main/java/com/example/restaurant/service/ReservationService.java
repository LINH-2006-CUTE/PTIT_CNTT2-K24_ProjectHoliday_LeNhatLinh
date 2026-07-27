package com.example.restaurant.service;

import com.example.restaurant.dto.ReservationRequest;
import com.example.restaurant.dto.ReservationResponse;

import java.util.List;

public interface ReservationService {
    List<ReservationResponse> searchReservations(String search, String status, String startStr, String endStr);
    ReservationResponse getReservationById(Long id);
    ReservationResponse createReservation(ReservationRequest request);
    ReservationResponse updateReservation(Long id, ReservationRequest request);
    void deleteReservation(Long id);
    ReservationResponse approveReservation(Long id);
    ReservationResponse rejectReservation(Long id);
    ReservationResponse cancelReservation(Long id);
    ReservationResponse checkInReservation(Long id, Long tableId);
    ReservationResponse checkOutReservation(Long id);
}
