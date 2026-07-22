package com.example.restaurant.service;

import com.example.restaurant.dto.ReservationRequest;
import com.example.restaurant.dto.ReservationResponse;
import com.example.restaurant.entity.DiningTable;
import com.example.restaurant.entity.Reservation;
import com.example.restaurant.exception.ApiException;
import com.example.restaurant.repository.DiningTableRepository;
import com.example.restaurant.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservationServiceImpl implements ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private DiningTableRepository diningTableRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> searchReservations(String search, String status, String startStr, String endStr) {
        String searchParam = (search == null || search.trim().isEmpty()) ? null : search.trim();
        String statusParam = (status == null || status.trim().isEmpty() || status.equalsIgnoreCase("All")) ? null : status.trim();

        LocalDateTime start = null;
        LocalDateTime end = null;
        if (startStr != null && !startStr.trim().isEmpty()) {
            start = LocalDateTime.parse(startStr.trim(), DateTimeFormatter.ISO_DATE_TIME);
        }
        if (endStr != null && !endStr.trim().isEmpty()) {
            end = LocalDateTime.parse(endStr.trim(), DateTimeFormatter.ISO_DATE_TIME);
        }

        List<Reservation> list = reservationRepository.searchReservations(searchParam, statusParam, start, end);
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponse getReservationById(Long id) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new ApiException("Reservation not found", HttpStatus.NOT_FOUND));
        return mapToResponse(res);
    }

    @Override
    @Transactional
    public ReservationResponse createReservation(ReservationRequest request) {
        DiningTable table = null;
        if (request.getDiningTableId() != null) {
            table = diningTableRepository.findById(request.getDiningTableId())
                    .orElseThrow(() -> new ApiException("Selected table not found", HttpStatus.BAD_REQUEST));
            if (!table.getStatus().equals("AVAILABLE")) {
                throw new ApiException("Selected table is not available (Status: " + table.getStatus() + ")", HttpStatus.BAD_REQUEST);
            }
        }

        Reservation res = Reservation.builder()
                .customerName(request.getCustomerName().trim())
                .customerPhone(request.getCustomerPhone().trim())
                .customerEmail(request.getCustomerEmail() != null ? request.getCustomerEmail().trim() : null)
                .numberOfPeople(request.getNumberOfPeople())
                .reservationTime(request.getReservationTime())
                .diningTable(table)
                .status("PENDING")
                .notes(request.getNotes())
                .build();

        Reservation saved = reservationRepository.save(res);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ReservationResponse updateReservation(Long id, ReservationRequest request) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new ApiException("Reservation not found", HttpStatus.NOT_FOUND));

        DiningTable table = null;
        if (request.getDiningTableId() != null) {
            table = diningTableRepository.findById(request.getDiningTableId())
                    .orElseThrow(() -> new ApiException("Selected table not found", HttpStatus.BAD_REQUEST));
            if (res.getDiningTable() == null || !res.getDiningTable().getId().equals(table.getId())) {
                if (!table.getStatus().equals("AVAILABLE")) {
                    throw new ApiException("Selected table is not available", HttpStatus.BAD_REQUEST);
                }
            }
        }

        // Revert old table status if changing table
        if (res.getDiningTable() != null && (table == null || !res.getDiningTable().getId().equals(table.getId()))) {
            DiningTable oldTable = res.getDiningTable();
            if (oldTable.getStatus().equals("RESERVED")) {
                oldTable.setStatus("AVAILABLE");
                diningTableRepository.save(oldTable);
            }
        }

        res.setCustomerName(request.getCustomerName().trim());
        res.setCustomerPhone(request.getCustomerPhone().trim());
        res.setCustomerEmail(request.getCustomerEmail() != null ? request.getCustomerEmail().trim() : null);
        res.setNumberOfPeople(request.getNumberOfPeople());
        res.setReservationTime(request.getReservationTime());
        res.setDiningTable(table);
        res.setNotes(request.getNotes());

        // Update new table status to RESERVED if already approved
        if (table != null && res.getStatus().equals("APPROVED")) {
            table.setStatus("RESERVED");
            diningTableRepository.save(table);
        }

        Reservation saved = reservationRepository.save(res);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteReservation(Long id) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new ApiException("Reservation not found", HttpStatus.NOT_FOUND));

        // Revert table status if deleting active reservation
        if (res.getDiningTable() != null && (res.getStatus().equals("APPROVED") || res.getStatus().equals("CHECKED_IN"))) {
            DiningTable table = res.getDiningTable();
            table.setStatus("AVAILABLE");
            diningTableRepository.save(table);
        }

        reservationRepository.delete(res);
    }

    @Override
    @Transactional
    public ReservationResponse approveReservation(Long id) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new ApiException("Reservation not found", HttpStatus.NOT_FOUND));

        if (!res.getStatus().equals("PENDING")) {
            throw new ApiException("Only PENDING reservations can be approved.", HttpStatus.BAD_REQUEST);
        }

        res.setStatus("APPROVED");
        if (res.getDiningTable() != null) {
            DiningTable table = res.getDiningTable();
            table.setStatus("RESERVED");
            diningTableRepository.save(table);
        }

        Reservation saved = reservationRepository.save(res);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ReservationResponse rejectReservation(Long id) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new ApiException("Reservation not found", HttpStatus.NOT_FOUND));

        if (!res.getStatus().equals("PENDING")) {
            throw new ApiException("Only PENDING reservations can be rejected.", HttpStatus.BAD_REQUEST);
        }

        res.setStatus("REJECTED");
        Reservation saved = reservationRepository.save(res);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ReservationResponse cancelReservation(Long id) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new ApiException("Reservation not found", HttpStatus.NOT_FOUND));

        if (res.getStatus().equals("CHECKED_IN") || res.getStatus().equals("CHECKED_OUT")) {
            throw new ApiException("Cannot cancel checked in or checked out reservations.", HttpStatus.BAD_REQUEST);
        }

        res.setStatus("CANCELLED");
        if (res.getDiningTable() != null) {
            DiningTable table = res.getDiningTable();
            if (table.getStatus().equals("RESERVED")) {
                table.setStatus("AVAILABLE");
                diningTableRepository.save(table);
            }
        }

        Reservation saved = reservationRepository.save(res);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ReservationResponse checkInReservation(Long id, Long tableId) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new ApiException("Reservation not found", HttpStatus.NOT_FOUND));

        if (res.getStatus().equals("CHECKED_IN") || res.getStatus().equals("CHECKED_OUT")) {
            throw new ApiException("Reservation is already checked in or checked out.", HttpStatus.BAD_REQUEST);
        }

        DiningTable table = diningTableRepository.findById(tableId)
                .orElseThrow(() -> new ApiException("Dining table not found", HttpStatus.NOT_FOUND));

        if (!table.getStatus().equals("AVAILABLE") && !table.getStatus().equals("RESERVED")) {
            throw new ApiException("Table is not available for check-in (Status: " + table.getStatus() + ")", HttpStatus.BAD_REQUEST);
        }

        // Revert old table status if changing table during check-in
        if (res.getDiningTable() != null && !res.getDiningTable().getId().equals(tableId)) {
            DiningTable oldTable = res.getDiningTable();
            oldTable.setStatus("AVAILABLE");
            diningTableRepository.save(oldTable);
        }

        table.setStatus("OCCUPIED");
        diningTableRepository.save(table);

        res.setDiningTable(table);
        res.setStatus("CHECKED_IN");
        Reservation saved = reservationRepository.save(res);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ReservationResponse checkOutReservation(Long id) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new ApiException("Reservation not found", HttpStatus.NOT_FOUND));

        if (!res.getStatus().equals("CHECKED_IN")) {
            throw new ApiException("Only CHECKED_IN reservations can be checked out.", HttpStatus.BAD_REQUEST);
        }

        res.setStatus("CHECKED_OUT");
        if (res.getDiningTable() != null) {
            DiningTable table = res.getDiningTable();
            table.setStatus("AVAILABLE");
            diningTableRepository.save(table);
        }

        Reservation saved = reservationRepository.save(res);
        return mapToResponse(saved);
    }

    private ReservationResponse mapToResponse(Reservation res) {
        return ReservationResponse.builder()
                .id(res.getId())
                .customerName(res.getCustomerName())
                .customerPhone(res.getCustomerPhone())
                .customerEmail(res.getCustomerEmail())
                .numberOfPeople(res.getNumberOfPeople())
                .reservationTime(res.getReservationTime())
                .diningTableId(res.getDiningTable() != null ? res.getDiningTable().getId() : null)
                .diningTableNumber(res.getDiningTable() != null ? res.getDiningTable().getTableNumber() : null)
                .status(res.getStatus())
                .notes(res.getNotes())
                .build();
    }
}
