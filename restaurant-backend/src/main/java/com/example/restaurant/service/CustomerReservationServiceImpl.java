package com.example.restaurant.service;

import com.example.restaurant.dto.CustomerReservationRequest;
import com.example.restaurant.dto.CustomerReservationRescheduleRequest;
import com.example.restaurant.entity.Reservation;
import com.example.restaurant.exception.ApiException;
import com.example.restaurant.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class CustomerReservationServiceImpl implements CustomerReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Override
    public Reservation createReservation(CustomerReservationRequest request) {
        // Validation: Past dates forbidden
        if (request.getReservationTime().isBefore(LocalDateTime.now())) {
            throw new ApiException("Thời gian đặt bàn không được ở trong quá khứ", HttpStatus.BAD_REQUEST);
        }

        Reservation reservation = Reservation.builder()
                .customerName(request.getCustomerName().trim())
                .customerPhone(request.getCustomerPhone().trim())
                .customerEmail(request.getCustomerEmail() != null ? request.getCustomerEmail().trim() : null)
                .numberOfPeople(request.getNumberOfPeople())
                .reservationTime(request.getReservationTime())
                .branch(request.getBranch() != null ? request.getBranch().trim() : "L'Étoile Tràng Tiền - Hà Nội")
                .notes(request.getNotes() != null ? request.getNotes().trim() : null)
                .status("PENDING")
                .build();

        return reservationRepository.save(reservation);
    }

    @Override
    public Reservation cancelReservation(Long id) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new ApiException("Không tìm thấy đơn đặt bàn #" + id, HttpStatus.NOT_FOUND));

        res.setStatus("CANCELLED");
        return reservationRepository.save(res);
    }

    @Override
    public Reservation rescheduleReservation(Long id, CustomerReservationRescheduleRequest request) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new ApiException("Không tìm thấy đơn đặt bàn #" + id, HttpStatus.NOT_FOUND));

        if (request.getNewReservationTime().isBefore(LocalDateTime.now())) {
            throw new ApiException("Thời gian đặt bàn mới không được ở trong quá khứ", HttpStatus.BAD_REQUEST);
        }

        res.setReservationTime(request.getNewReservationTime());
        if (request.getNewNumberOfPeople() != null && request.getNewNumberOfPeople() > 0) {
            res.setNumberOfPeople(request.getNewNumberOfPeople());
        }
        res.setStatus("PENDING"); // Reset to PENDING for re-approval
        return reservationRepository.save(res);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Reservation> getHistory(String phoneOrEmail) {
        String key = phoneOrEmail != null ? phoneOrEmail.trim() : "";
        return reservationRepository.findByCustomerEmailOrCustomerPhoneOrderByReservationTimeDesc(key, key);
    }
}
