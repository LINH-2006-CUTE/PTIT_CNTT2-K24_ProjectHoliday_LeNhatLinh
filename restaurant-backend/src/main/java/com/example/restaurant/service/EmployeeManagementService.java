package com.example.restaurant.service;

import com.example.restaurant.dto.EmployeeCreateRequest;
import com.example.restaurant.dto.EmployeeResponse;
import com.example.restaurant.dto.EmployeeUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;

public interface EmployeeManagementService {
    Page<EmployeeResponse> searchEmployees(String search, String roleName, String status, Pageable pageable);
    EmployeeResponse getEmployeeById(Long id);
    EmployeeResponse createEmployee(EmployeeCreateRequest request);
    EmployeeResponse updateEmployee(Long id, EmployeeUpdateRequest request);
    void deleteEmployee(Long id, String currentAdminEmail);
    String uploadAvatar(MultipartFile file);
    ByteArrayInputStream exportExcel();
    ByteArrayInputStream exportPdf();
}
