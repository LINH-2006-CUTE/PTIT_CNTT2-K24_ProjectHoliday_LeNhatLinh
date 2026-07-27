package com.example.restaurant.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueReportDTO {
    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private BigDecimal monthRevenue;
    private Long totalOrders;
    private Long completedOrders;
    private List<DailyRevenuePoint> dailyPoints;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyRevenuePoint {
        private String date;
        private BigDecimal revenue;
        private Long orderCount;
    }
}
