package com.example.restaurant.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceDTO {

    private Long id;
    private String invoiceNumber;
    private Long orderId;
    private String customerName;
    private String customerPhone;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal serviceFee;
    private BigDecimal vatAmount;
    private BigDecimal grandTotal;
    private String paymentMethod;
    private LocalDateTime issuedAt;
    private List<InvoiceItemDTO> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InvoiceItemDTO {
        private String dishName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal lineTotal;
        private String note;
    }
}
