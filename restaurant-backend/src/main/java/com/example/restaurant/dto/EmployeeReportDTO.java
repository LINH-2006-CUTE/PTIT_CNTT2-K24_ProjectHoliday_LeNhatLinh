package com.example.restaurant.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeReportDTO {
    private Long totalEmployees;
    private List<EmployeePerformanceItem> employeePerformanceList;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EmployeePerformanceItem {
        private String employeeCode;
        private String fullName;
        private String role;
        private Long ordersServed;
        private BigDecimal totalSales;
        private String status;
    }
}
