package com.example.restaurant.service;

import com.example.restaurant.dto.*;
import java.time.LocalDate;

public interface ReportService {

    RevenueReportDTO getRevenueReport(LocalDate startDate, LocalDate endDate);

    InventoryReportDTO getInventoryReport();

    FoodReportDTO getFoodReport(LocalDate startDate, LocalDate endDate);

    EmployeeReportDTO getEmployeeReport();

    CustomerReportDTO getCustomerReport();

    ProfitReportDTO getProfitReport(LocalDate startDate, LocalDate endDate);

    byte[] generateExcelReport(String reportType, LocalDate startDate, LocalDate endDate);
}
