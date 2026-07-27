package com.example.restaurant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeResponse {
    private Long id;
    private String employeeCode;
    private String email;
    private String fullName;
    private String phone;
    private LocalDate birthday;
    private String gender;
    private String address;
    private BigDecimal salary;
    private LocalDate hireDate;
    private String status;
    private String role;
    private String avatar;
}
