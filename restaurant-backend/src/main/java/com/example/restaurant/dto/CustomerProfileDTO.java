package com.example.restaurant.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerProfileDTO {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String avatar;
    private Boolean membership;
    private Integer points;
    private String rank;
    private LocalDateTime createdAt;
}
