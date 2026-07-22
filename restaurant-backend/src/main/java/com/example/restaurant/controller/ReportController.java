package com.example.restaurant.controller;

import com.example.restaurant.dto.*;
import com.example.restaurant.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/reports")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'CASHIER')")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<RevenueReportDTO>> getRevenueReport(
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        RevenueReportDTO dto = reportService.getRevenueReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(dto, "Lấy báo cáo doanh thu thành công"));
    }

    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<InventoryReportDTO>> getInventoryReport() {
        InventoryReportDTO dto = reportService.getInventoryReport();
        return ResponseEntity.ok(ApiResponse.success(dto, "Lấy báo cáo kho thành công"));
    }

    @GetMapping("/food")
    public ResponseEntity<ApiResponse<FoodReportDTO>> getFoodReport(
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        FoodReportDTO dto = reportService.getFoodReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(dto, "Lấy báo cáo món ăn thành công"));
    }

    @GetMapping("/employee")
    public ResponseEntity<ApiResponse<EmployeeReportDTO>> getEmployeeReport() {
        EmployeeReportDTO dto = reportService.getEmployeeReport();
        return ResponseEntity.ok(ApiResponse.success(dto, "Lấy báo cáo nhân viên thành công"));
    }

    @GetMapping("/customer")
    public ResponseEntity<ApiResponse<CustomerReportDTO>> getCustomerReport() {
        CustomerReportDTO dto = reportService.getCustomerReport();
        return ResponseEntity.ok(ApiResponse.success(dto, "Lấy báo cáo khách hàng thành công"));
    }

    @GetMapping("/profit")
    public ResponseEntity<ApiResponse<ProfitReportDTO>> getProfitReport(
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        ProfitReportDTO dto = reportService.getProfitReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(dto, "Lấy báo cáo lợi nhuận thành công"));
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam(value = "type", defaultValue = "revenue") String type,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        byte[] csvData = reportService.generateExcelReport(type, startDate, endDate);
        String filename = "BaoCao_" + type + "_" + LocalDate.now() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvData);
    }
}
