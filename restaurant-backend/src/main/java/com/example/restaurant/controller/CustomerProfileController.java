package com.example.restaurant.controller;

import com.example.restaurant.dto.*;
import com.example.restaurant.service.CustomerProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/profile")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CustomerProfileController {

    @Autowired
    private CustomerProfileService profileService;

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CustomerProfileDTO>> getProfile() {
        String email = getCurrentUserEmail();
        CustomerProfileDTO profile = profileService.getProfile(email);
        return ResponseEntity.ok(ApiResponse.success(profile, "Lấy thông tin hồ sơ thành công"));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<CustomerProfileDTO>> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        String email = getCurrentUserEmail();
        CustomerProfileDTO updated = profileService.updateProfile(email, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cập nhật hồ sơ cá nhân thành công"));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        String email = getCurrentUserEmail();
        profileService.changePassword(email, request);
        return ResponseEntity.ok(ApiResponse.success(null, "Đổi mật khẩu thành công. Vui lòng đăng nhập lại với mật khẩu mới."));
    }

    @GetMapping("/activities")
    public ResponseEntity<ApiResponse<List<CustomerActivityDTO>>> getActivities() {
        String email = getCurrentUserEmail();
        List<CustomerActivityDTO> list = profileService.getActivities(email);
        return ResponseEntity.ok(ApiResponse.success(list, "Lấy lịch sử hoạt động đơn hàng thành công"));
    }
}
