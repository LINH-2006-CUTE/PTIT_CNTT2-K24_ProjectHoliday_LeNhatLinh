package com.example.restaurant.controller;

import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.ReservationRequest;
import com.example.restaurant.dto.ReservationResponse;
import com.example.restaurant.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reservations")
@PreAuthorize("hasRole('ADMIN')")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> searchReservations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime) {
        List<ReservationResponse> list = reservationService.searchReservations(search, status, startTime, endTime);
        return ResponseEntity.ok(ApiResponse.success(list, "Reservations fetched successfully."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReservationResponse>> getReservationById(@PathVariable Long id) {
        ReservationResponse res = reservationService.getReservationById(id);
        return ResponseEntity.ok(ApiResponse.success(res, "Reservation details fetched."));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReservationResponse>> createReservation(@Valid @RequestBody ReservationRequest request) {
        ReservationResponse res = reservationService.createReservation(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(res, "Reservation created successfully."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReservationResponse>> updateReservation(
            @PathVariable Long id,
            @Valid @RequestBody ReservationRequest request) {
        ReservationResponse res = reservationService.updateReservation(id, request);
        return ResponseEntity.ok(ApiResponse.success(res, "Reservation updated successfully."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReservation(@PathVariable Long id) {
        reservationService.deleteReservation(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Reservation deleted successfully."));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<ReservationResponse>> approveReservation(@PathVariable Long id) {
        ReservationResponse res = reservationService.approveReservation(id);
        return ResponseEntity.ok(ApiResponse.success(res, "Reservation approved successfully."));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<ReservationResponse>> rejectReservation(@PathVariable Long id) {
        ReservationResponse res = reservationService.rejectReservation(id);
        return ResponseEntity.ok(ApiResponse.success(res, "Reservation rejected successfully."));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<ReservationResponse>> cancelReservation(@PathVariable Long id) {
        ReservationResponse res = reservationService.cancelReservation(id);
        return ResponseEntity.ok(ApiResponse.success(res, "Reservation cancelled successfully."));
    }

    @PutMapping("/{id}/check-in")
    public ResponseEntity<ApiResponse<ReservationResponse>> checkInReservation(
            @PathVariable Long id,
            @RequestParam Long tableId) {
        ReservationResponse res = reservationService.checkInReservation(id, tableId);
        return ResponseEntity.ok(ApiResponse.success(res, "Reservation checked in successfully."));
    }

    @PutMapping("/{id}/check-out")
    public ResponseEntity<ApiResponse<ReservationResponse>> checkOutReservation(@PathVariable Long id) {
        ReservationResponse res = reservationService.checkOutReservation(id);
        return ResponseEntity.ok(ApiResponse.success(res, "Reservation checked out successfully."));
    }
}
