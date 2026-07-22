package com.example.restaurant.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class UserProfileResponse {
    Long id;
    String email;
    String fullName;
    String phone;
    String gender;
    String avatarUrl;
    List<String> roles;
}
