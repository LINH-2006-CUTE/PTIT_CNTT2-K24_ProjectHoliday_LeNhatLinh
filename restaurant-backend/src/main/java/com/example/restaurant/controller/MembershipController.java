package com.example.restaurant.controller;

import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.MembershipInfoDTO;
import com.example.restaurant.service.MembershipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/membership")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MembershipController {

    @Autowired
    private MembershipService membershipService;

    @GetMapping
    public ResponseEntity<ApiResponse<MembershipInfoDTO>> getMembershipInfo(@RequestParam("email") String email) {
        MembershipInfoDTO info = membershipService.getMembershipInfo(email);
        return ResponseEntity.ok(ApiResponse.success(info, "Lấy thông tin thẻ thành viên và điểm thưởng thành công"));
    }

    @PostMapping("/redeem")
    public ResponseEntity<ApiResponse<Boolean>> redeemPoints(
            @RequestParam("email") String email,
            @RequestParam("points") int points,
            @RequestParam("description") String description) {
        boolean success = membershipService.redeemPoints(email, points, description);
        return ResponseEntity.ok(ApiResponse.success(success, "Đổi điểm thành công!"));
    }
}
