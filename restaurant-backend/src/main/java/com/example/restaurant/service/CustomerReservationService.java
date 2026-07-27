package com.example.restaurant.service;

import com.example.restaurant.dto.CustomerReservationRequest;
import com.example.restaurant.dto.CustomerReservationRescheduleRequest;
import com.example.restaurant.entity.Reservation;

import java.util.List;

public interface CustomerReservationService {

    Reservation createReservation(CustomerReservationRequest request);

    Reservation cancelReservation(Long id);

    Reservation rescheduleReservation(Long id, CustomerReservationRescheduleRequest request);

    List<Reservation> getHistory(String phoneOrEmail);
}
