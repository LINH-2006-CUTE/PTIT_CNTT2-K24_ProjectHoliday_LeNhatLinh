package com.example.restaurant.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmployeeCreateRequest {

    @NotBlank(message = "Employee code is required")
    @Size(max = 30, message = "Employee code must not exceed 30 characters")
    private String employeeCode;

    @NotBlank(message = "Email is required")
    @Email(message = "Email is invalid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,72}$", 
             message = "Password must include uppercase, lowercase, number and special character")
    private String password;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @Size(max = 30, message = "Phone number must not exceed 30 characters")
    private String phone;

    private LocalDate birthday;

    @Size(max = 20, message = "Gender must not exceed 20 characters")
    private String gender;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    @DecimalMin(value = "0.0", message = "Salary must be non-negative")
    private BigDecimal salary;

    private LocalDate hireDate;

    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "Role is required")
    private String role;

    private String avatar;
}
