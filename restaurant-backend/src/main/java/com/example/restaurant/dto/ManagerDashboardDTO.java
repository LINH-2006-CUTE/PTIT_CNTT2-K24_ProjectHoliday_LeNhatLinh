package com.example.restaurant.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Value
@Builder
public class ManagerDashboardDTO {
    BigDecimal revenueToday;
    BigDecimal revenueMonth;
    BigDecimal profitToday;
    Integer totalOrdersToday;
    Integer totalReservationsToday;
    Integer lowStockItemsCount;
    Integer activeEmployeesCount;
    List<TopSellingDishDTO> topSellingDishes;
    List<DailyRevenueStat> revenueChartData;

    @Value
    @Builder
    public static class TopSellingDishDTO {
        String dishName;
        Integer quantitySold;
        BigDecimal revenue;
    }

    @Value
    @Builder
    public static class DailyRevenueStat {
        String day;
        BigDecimal revenue;
        BigDecimal profit;
    }
}
