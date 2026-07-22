package com.example.restaurant.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerReservationRequest {

    @NotBlank(message = "Tên khách hàng không được để trống")
    private String customerName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$", message = "Số điện thoại Việt Nam không hợp lệ")
    private String customerPhone;

    private String customerEmail;

    @NotNull(message = "Số lượng người không được để trống")
    @Min(value = 1, message = "Số khách tối thiểu là 1 người")
    @Max(value = 30, message = "Số khách tối đa là 30 người")
    private Integer numberOfPeople;

    @NotNull(message = "Thời gian đặt bàn không được để trống")
    @Future(message = "Thời gian đặt bàn phải ở thời điểm tương lai")
    private LocalDateTime reservationTime;

    @NotBlank(message = "Chi nhánh không được để trống")
    private String branch;

    private String notes;
}
