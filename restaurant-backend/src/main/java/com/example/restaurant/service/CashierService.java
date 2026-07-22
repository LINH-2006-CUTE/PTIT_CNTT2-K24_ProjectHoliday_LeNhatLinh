package com.example.restaurant.service;

import com.example.restaurant.dto.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface CashierService {
    List<OrderHistoryDTO> getPendingOrders();
    InvoiceDTO processCheckout(CashierCheckoutRequest request);
    Map<String, Object> applyVoucher(String voucherCode, BigDecimal orderAmount);
    Map<String, Object> processCustomerPoints(String customerEmail, Integer points, String action);
    CashierShiftReportDTO getShiftReport(String cashierEmail);
}
