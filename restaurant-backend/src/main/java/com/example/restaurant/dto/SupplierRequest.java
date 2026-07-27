package com.example.restaurant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierRequest {

    @NotBlank(message = "Tên công ty/Nhà cung cấp là bắt buộc")
    @Size(max = 150, message = "Tên công ty không được vượt quá 150 ký tự")
    private String company;

    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
    @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$|^$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
    @Pattern(regexp = "^[A-Za-z0-9+_.-]+@(.+)$|^$", message = "Email không đúng định dạng")
    private String email;

    @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
    private String address;
}
