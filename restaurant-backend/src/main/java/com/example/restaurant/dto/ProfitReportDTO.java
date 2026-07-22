package com.example.restaurant.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfitReportDTO {
    private BigDecimal grossRevenue;
    private BigDecimal procurementCost;
    private BigDecimal netProfit;
    private Double profitMarginPercentage;
    private List<GrossRevenueItem> grossRevenueOrders;
    private List<ProcurementCostItem> procurementTransactions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GrossRevenueItem {
        private Long orderId;
        private String tableNumber;
        private String orderDate;
        private BigDecimal totalAmount;
        private String paymentMethod;
        private String status;
        private String staffName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProcurementCostItem {
        private String ticketCode;
        private String ingredientName;
        private String supplierName;
        private Double quantity;
        private String unit;
        private BigDecimal unitPrice;
        private BigDecimal totalCost;
        private String transactionDate;
        private String performedBy;
    }
}
