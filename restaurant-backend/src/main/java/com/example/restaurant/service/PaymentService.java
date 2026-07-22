package com.example.restaurant.service;

import com.example.restaurant.dto.InvoiceDTO;
import com.example.restaurant.dto.PaymentRequest;
import com.example.restaurant.entity.Payment;

public interface PaymentService {

    InvoiceDTO processPayment(PaymentRequest request);

    InvoiceDTO getInvoiceByOrderId(Long orderId);
}
