package com.example.restaurant.service;

import com.example.restaurant.dto.MembershipInfoDTO;

public interface MembershipService {

    MembershipInfoDTO getMembershipInfo(String email);

    void addPoints(String email, int points, String description);

    boolean redeemPoints(String email, int points, String description);
}
