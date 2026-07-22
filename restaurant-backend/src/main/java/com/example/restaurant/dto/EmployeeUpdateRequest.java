package com.example.restaurant.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmployeeUpdateRequest {

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
