package com.example.restaurant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {
    private BigDecimal totalRevenue;
    private BigDecimal todayRevenue;
    private BigDecimal monthRevenue;
    private Long totalOrders;
    private Long activeOrders;
    private Long completedOrders;
    private Long totalCustomers;
    private Long totalEmployees;
    private List<TopDishDto> topSellingDishes;
    private List<TopCustomerDto> topCustomers;
    private List<IngredientDto> lowStockIngredients;
    private List<MonthlyRevenueDto> monthlyRevenueData;
    private List<MonthlyRevenueDto> weeklyRevenueData;
}
