package com.example.restaurant.controller;

import com.example.restaurant.entity.Supplier;
import com.example.restaurant.entity.PurchaseOrder;
import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.SupplierRequest;
import com.example.restaurant.dto.PurchaseOrderRequest;
import com.example.restaurant.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/suppliers")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Supplier>>> getSuppliers(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sort", defaultValue = "id,desc") String sort) {
        
        String[] sortParams = sort.split(",");
        Sort sortObj = Sort.by(sortParams[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortParams[0]);
        Pageable pageable = PageRequest.of(page, size, sortObj);

        Page<Supplier> list = supplierService.getSuppliers(search, pageable);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách nhà cung cấp thành công"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Supplier>> getSupplierById(@PathVariable("id") Long id) {
        Supplier s = supplierService.getSupplierById(id);
        return ResponseEntity.ok(ApiResponse.success(s, "Lấy thông tin nhà cung cấp thành công"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Supplier>> createSupplier(@Valid @RequestBody SupplierRequest request) {
        Supplier created = supplierService.createSupplier(request);
        return ResponseEntity.ok(ApiResponse.success(created, "Thêm nhà cung cấp thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Supplier>> updateSupplier(@PathVariable("id") Long id, @Valid @RequestBody SupplierRequest request) {
        Supplier updated = supplierService.updateSupplier(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật nhà cung cấp thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(@PathVariable("id") Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa nhà cung cấp thành công"));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<PurchaseOrder>>> getPurchaseOrders(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sort", defaultValue = "id,desc") String sort) {

        String[] sortParams = sort.split(",");
        Sort sortObj = Sort.by(sortParams[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortParams[0]);
        Pageable pageable = PageRequest.of(page, size, sortObj);

        Page<PurchaseOrder> list = supplierService.getPurchaseOrders(search, pageable);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách đơn mua hàng thành công"));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<PurchaseOrder>> getPurchaseOrderById(@PathVariable("id") Long id) {
        PurchaseOrder po = supplierService.getPurchaseOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(po, "Lấy thông tin đơn mua hàng thành công"));
    }

    @PostMapping("/orders")
    public ResponseEntity<ApiResponse<PurchaseOrder>> createPurchaseOrder(@Valid @RequestBody PurchaseOrderRequest request) {
        PurchaseOrder po = supplierService.createPurchaseOrder(request);
        return ResponseEntity.ok(ApiResponse.success(po, "Tạo đơn mua hàng thành công"));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<PurchaseOrder>> updatePurchaseOrderStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") String status) {
        PurchaseOrder po = supplierService.updatePurchaseOrderStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(po, "Cập nhật trạng thái đơn mua hàng thành công"));
    }
}
