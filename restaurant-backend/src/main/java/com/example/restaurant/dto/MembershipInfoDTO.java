package com.example.restaurant.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipInfoDTO {

    private String customerEmail;
    private String fullName;
    private String avatar;
    private Integer points;
    private String rank; // BRONZE, SILVER, GOLD, PLATINUM, DIAMOND
    private String nextRank;
    private Integer pointsToNextRank;
    private List<PointTransactionDTO> earnedHistory;
    private List<PointTransactionDTO> redeemedHistory;
}
