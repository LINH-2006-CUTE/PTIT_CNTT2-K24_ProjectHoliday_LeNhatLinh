package com.example.restaurant.controller;

import com.example.restaurant.dto.*;
import com.example.restaurant.service.CashierService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cashier")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('CASHIER', 'ADMIN', 'MANAGER')")
public class CashierController {

    @Autowired
    private CashierService cashierService;

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderHistoryDTO>>> getPendingOrders() {
        List<OrderHistoryDTO> orders = cashierService.getPendingOrders();
        return ResponseEntity.ok(ApiResponse.success(orders, "Lấy danh sách đơn hàng chờ thanh toán thành công"));
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<InvoiceDTO>> processCheckout(@Valid @RequestBody CashierCheckoutRequest request) {
        InvoiceDTO invoice = cashierService.processCheckout(request);
        return ResponseEntity.ok(ApiResponse.success(invoice, "Thanh toán và phát hành hóa đơn thành công"));
    }

    @PostMapping("/promotions/apply")
    public ResponseEntity<ApiResponse<Map<String, Object>>> applyVoucher(@RequestBody Map<String, Object> body) {
        String code = (String) body.get("voucherCode");
        BigDecimal amount = new BigDecimal(body.getOrDefault("orderAmount", "0").toString());
        Map<String, Object> result = cashierService.applyVoucher(code, amount);
        return ResponseEntity.ok(ApiResponse.success(result, "Kiểm tra mã Voucher thành công"));
    }

    @PostMapping("/customers/points")
    public ResponseEntity<ApiResponse<Map<String, Object>>> processCustomerPoints(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("customerEmail");
        Integer points = Integer.parseInt(body.getOrDefault("points", "0").toString());
        String action = (String) body.getOrDefault("action", "ADD");
        Map<String, Object> result = cashierService.processCustomerPoints(email, points, action);
        return ResponseEntity.ok(ApiResponse.success(result, "Xử lý điểm thành viên thành công"));
    }

    @GetMapping("/reports/shift")
    public ResponseEntity<ApiResponse<CashierShiftReportDTO>> getShiftReport(Principal principal) {
        String email = principal != null ? principal.getName() : "cashier@restaurant.com";
        CashierShiftReportDTO report = cashierService.getShiftReport(email);
        return ResponseEntity.ok(ApiResponse.success(report, "Lấy báo cáo tổng kết ca thu ngân thành công"));
    }
}
