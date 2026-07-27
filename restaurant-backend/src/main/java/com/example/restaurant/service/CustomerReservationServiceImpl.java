package com.example.restaurant.service;

import com.example.restaurant.dto.CustomerReservationRequest;
import com.example.restaurant.dto.CustomerReservationRescheduleRequest;
import com.example.restaurant.entity.Reservation;
import com.example.restaurant.exception.ApiException;
import com.example.restaurant.entity.DiningTable;
import com.example.restaurant.repository.DiningTableRepository;
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

    @Autowired
    private DiningTableRepository diningTableRepository;

    @Override
    public Reservation createReservation(CustomerReservationRequest request) {
        // Validation: Past dates forbidden
        if (request.getReservationTime().isBefore(LocalDateTime.now())) {
            throw new ApiException("Thời gian đặt bàn không được ở trong quá khứ", HttpStatus.BAD_REQUEST);
        }

        DiningTable table = null;
        if (request.getTableId() != null) {
            table = diningTableRepository.findById(request.getTableId()).orElse(null);
        }

        Reservation reservation = Reservation.builder()
                .customerName(request.getCustomerName().trim())
                .customerPhone(request.getCustomerPhone().trim())
                .customerEmail(request.getCustomerEmail() != null ? request.getCustomerEmail().trim() : null)
                .numberOfPeople(request.getNumberOfPeople())
                .reservationTime(request.getReservationTime())
                .branch(request.getBranch() != null ? request.getBranch().trim() : "L'ÉCLAT Tràng Tiền - Hà Nội")
                .notes(request.getNotes() != null ? request.getNotes().trim() : null)
                .diningTable(table)
                .status("PENDING")
                .build();

        Reservation saved = reservationRepository.save(reservation);

        if (table != null) {
            table.setStatus("RESERVED");
            table.setCurrentCustomer(saved.getCustomerName() + " (" + saved.getCustomerPhone() + ")");
            table.setReservationTime(saved.getReservationTime().toString());
            diningTableRepository.save(table);
        }

        return saved;
    }

    @Override
    public Reservation cancelReservation(Long id) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new ApiException("Không tìm thấy đơn đặt bàn #" + id, HttpStatus.NOT_FOUND));

        res.setStatus("CANCELLED");
        if (res.getDiningTable() != null) {
            DiningTable table = res.getDiningTable();
            table.setStatus("AVAILABLE");
            table.setCurrentCustomer(null);
            table.setReservationTime(null);
            diningTableRepository.save(table);
        }
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
        String key = (phoneOrEmail != null && !phoneOrEmail.trim().isEmpty()) ? phoneOrEmail.trim() : null;
        
        if (key == null) {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
                key = auth.getName();
            }
        }

        if (key == null || key.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        return reservationRepository.findByCustomerEmailOrCustomerPhoneOrderByReservationTimeDesc(key, key);
    }
}
