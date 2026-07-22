package com.example.restaurant.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Value
@Builder
public class CashierShiftReportDTO {
    String cashierName;
    BigDecimal totalRevenue;
    Integer totalInvoices;
    BigDecimal cashTotal;
    BigDecimal qrTotal;
    BigDecimal vnpayTotal;
    BigDecimal momoTotal;
    BigDecimal cardTotal;
    LocalDateTime shiftStartTime;
}
