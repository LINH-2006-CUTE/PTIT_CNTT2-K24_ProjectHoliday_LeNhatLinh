package com.example.restaurant.service;

import com.example.restaurant.dto.*;

import java.util.List;

public interface CustomerProfileService {

    CustomerProfileDTO getProfile(String email);

    CustomerProfileDTO updateProfile(String email, UpdateProfileRequest request);

    void changePassword(String email, ChangePasswordRequest request);

    List<CustomerActivityDTO> getActivities(String email);
}
