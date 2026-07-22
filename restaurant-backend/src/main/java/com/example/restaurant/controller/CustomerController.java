package com.example.restaurant.controller;

import com.example.restaurant.entity.Customer;
import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.CustomerRequest;
import com.example.restaurant.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/customers")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Customer>>> getCustomers(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sort", defaultValue = "id,desc") String sort) {

        String[] sortParams = sort.split(",");
        Sort sortObj = Sort.by(sortParams[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortParams[0]);
        Pageable pageable = PageRequest.of(page, size, sortObj);

        Page<Customer> list = customerService.getCustomers(search, pageable);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy danh sách khách hàng thành công"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Customer>> getCustomerById(@PathVariable("id") Long id) {
        Customer c = customerService.getCustomerById(id);
        return ResponseEntity.ok(ApiResponse.success(c, "Lấy thông tin khách hàng thành công"));
    }

    @GetMapping("/phone/{phone}")
    public ResponseEntity<ApiResponse<Customer>> getCustomerByPhone(@PathVariable("phone") String phone) {
        Customer c = customerService.getCustomerByPhone(phone);
        return ResponseEntity.ok(ApiResponse.success(c, "Lấy thông tin khách hàng thành công"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Customer>> createCustomer(@Valid @RequestBody CustomerRequest request) {
        Customer created = customerService.createCustomer(request);
        return ResponseEntity.ok(ApiResponse.success(created, "Thêm khách hàng thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Customer>> updateCustomer(@PathVariable("id") Long id, @Valid @RequestBody CustomerRequest request) {
        Customer updated = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật khách hàng thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable("id") Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa khách hàng thành công"));
    }

    @PostMapping("/{id}/points")
    public ResponseEntity<ApiResponse<Customer>> addPoints(
            @PathVariable("id") Long id,
            @RequestParam("points") Integer points) {
        Customer updated = customerService.addPoints(id, points);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật tích lũy điểm khách hàng thành công"));
    }
}
