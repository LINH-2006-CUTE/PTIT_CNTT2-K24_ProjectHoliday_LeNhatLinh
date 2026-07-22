package com.example.restaurant.controller;

import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.InvoiceDTO;
import com.example.restaurant.dto.PaymentRequest;
import com.example.restaurant.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/payments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/process")
    public ResponseEntity<ApiResponse<InvoiceDTO>> processPayment(@Valid @RequestBody PaymentRequest request) {
        InvoiceDTO invoice = paymentService.processPayment(request);
        return ResponseEntity.ok(ApiResponse.success(invoice, "Thanh toán thành công! Hóa đơn Invoice đã được khởi tạo."));
    }

    @GetMapping("/invoice/{orderId}")
    public ResponseEntity<ApiResponse<InvoiceDTO>> getInvoiceByOrderId(@PathVariable("orderId") Long orderId) {
        InvoiceDTO invoice = paymentService.getInvoiceByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success(invoice, "Lấy thông tin hóa đơn Invoice thành công"));
    }
}
