package com.example.restaurant.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerReservationRescheduleRequest {

    @NotNull(message = "Thời gian mới không được để trống")
    @Future(message = "Thời gian mới phải ở thời điểm tương lai")
    private LocalDateTime newReservationTime;

    @Min(value = 1, message = "Số lượng khách tối thiểu là 1 người")
    private Integer newNumberOfPeople;
}
