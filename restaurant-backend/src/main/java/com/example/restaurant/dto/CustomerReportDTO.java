package com.example.restaurant.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerReportDTO {
    private Long totalCustomers;
    private Long membershipCount;
    private Long totalLoyaltyPoints;
    private List<RankDistributionItem> rankDistribution;
    private List<CustomerDetailItem> customerList;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RankDistributionItem {
        private String rank;
        private Long count;
        private Double percentage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomerDetailItem {
        private Long id;
        private String fullName;
        private String phone;
        private String email;
        private String membershipCardNumber;
        private String rank;
        private Integer loyaltyPoints;
        private BigDecimal totalSpent;
        private Boolean isMembershipActive;
        private String createdDate;
    }
}
