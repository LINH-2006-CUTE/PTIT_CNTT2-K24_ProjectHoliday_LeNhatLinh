package com.example.restaurant.controller;

import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.CustomerReservationRequest;
import com.example.restaurant.dto.CustomerReservationRescheduleRequest;
import com.example.restaurant.entity.Reservation;
import com.example.restaurant.service.CustomerReservationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/reservations")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CustomerReservationController {

    @Autowired
    private CustomerReservationService reservationService;

    @PostMapping
    public ResponseEntity<ApiResponse<Reservation>> createReservation(@Valid @RequestBody CustomerReservationRequest request) {
        Reservation created = reservationService.createReservation(request);
        return ResponseEntity.ok(ApiResponse.success(created, "Đặt bàn thành công! Nhân viên nhà hàng sẽ liên hệ xác nhận trong thời gian sớm nhất."));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<Reservation>>> getHistory(@RequestParam("search") String search) {
        List<Reservation> list = reservationService.getHistory(search);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy lịch sử đặt bàn thành công"));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Reservation>> cancelReservation(@PathVariable("id") Long id) {
        Reservation cancelled = reservationService.cancelReservation(id);
        return ResponseEntity.ok(ApiResponse.success(cancelled, "Đã hủy đơn đặt bàn thành công"));
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<ApiResponse<Reservation>> rescheduleReservation(
            @PathVariable("id") Long id,
            @Valid @RequestBody CustomerReservationRescheduleRequest request) {
        Reservation rescheduled = reservationService.rescheduleReservation(id, request);
        return ResponseEntity.ok(ApiResponse.success(rescheduled, "Đổi lịch đặt bàn thành công"));
    }
}
