package com.example.restaurant.controller;

import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.EmployeeCreateRequest;
import com.example.restaurant.dto.EmployeeResponse;
import com.example.restaurant.dto.EmployeeUpdateRequest;
import com.example.restaurant.service.EmployeeManagementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.security.Principal;

@RestController
@RequestMapping("/api/admin/employees")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class EmployeeManagementController {

    @Autowired
    private EmployeeManagementService employeeManagementService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<EmployeeResponse>>> searchEmployees(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "employeeCode,asc") String sort) {

        String[] sortParams = sort.split(",");
        String sortBy = sortParams[0];
        Sort.Direction direction = Sort.Direction.ASC;
        if (sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")) {
            direction = Sort.Direction.DESC;
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<EmployeeResponse> employees = employeeManagementService.searchEmployees(search, role, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(employees, "Employees fetched successfully."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeById(@PathVariable Long id) {
        EmployeeResponse employee = employeeManagementService.getEmployeeById(id);
        return ResponseEntity.ok(ApiResponse.success(employee, "Employee details fetched successfully."));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(@Valid @RequestBody EmployeeCreateRequest request) {
        EmployeeResponse employee = employeeManagementService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(employee, "Employee profile created successfully."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeUpdateRequest request) {
        EmployeeResponse employee = employeeManagementService.updateEmployee(id, request);
        return ResponseEntity.ok(ApiResponse.success(employee, "Employee profile updated successfully."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable Long id, Principal principal) {
        employeeManagementService.deleteEmployee(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(null, "Employee profile deleted successfully."));
    }

    @PostMapping("/upload-avatar")
    public ResponseEntity<ApiResponse<String>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        String avatarUrl = employeeManagementService.uploadAvatar(file);
        return ResponseEntity.ok(ApiResponse.success(avatarUrl, "Avatar image uploaded successfully."));
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel() {
        ByteArrayInputStream in = employeeManagementService.exportExcel();
        byte[] data;
        try {
            data = in.readAllBytes();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=employees.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf() {
        ByteArrayInputStream in = employeeManagementService.exportPdf();
        byte[] data;
        try {
            data = in.readAllBytes();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=employees.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }
}
