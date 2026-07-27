package com.example.restaurant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerRequest {

    @NotBlank(message = "Tên khách hàng là bắt buộc")
    @Size(max = 100, message = "Tên khách hàng không được quá 100 ký tự")
    private String fullName;

    @NotBlank(message = "Số điện thoại là bắt buộc")
    @Size(max = 20, message = "Số điện thoại không được quá 20 ký tự")
    @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$", message = "Số điện thoại không đúng định dạng")
    private String phone;

    @Size(max = 100, message = "Email không được quá 100 ký tự")
    @Pattern(regexp = "^[A-Za-z0-9+_.-]+@(.+)$|^$", message = "Email không đúng định dạng")
    private String email;

    private Boolean membership;

    private Integer points;
}
