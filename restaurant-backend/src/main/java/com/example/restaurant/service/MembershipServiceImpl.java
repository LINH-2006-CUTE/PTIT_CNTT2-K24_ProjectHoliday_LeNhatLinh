package com.example.restaurant.service;

import com.example.restaurant.dto.MembershipInfoDTO;
import com.example.restaurant.dto.PointTransactionDTO;
import com.example.restaurant.entity.Customer;
import com.example.restaurant.entity.PointTransaction;
import com.example.restaurant.entity.User;
import com.example.restaurant.exception.ApiException;
import com.example.restaurant.repository.CustomerRepository;
import com.example.restaurant.repository.PointTransactionRepository;
import com.example.restaurant.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class MembershipServiceImpl implements MembershipService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PointTransactionRepository pointTransactionRepository;

    @Override
    @Transactional(readOnly = true)
    public MembershipInfoDTO getMembershipInfo(String email) {
        String key = email.trim().toLowerCase();
        Optional<Customer> custOpt = customerRepository.findByEmail(key);

        int pts = 0;
        String name = "Thực khách L'Étoile";
        String avatar = null;

        if (custOpt.isPresent()) {
            Customer c = custOpt.get();
            pts = c.getPoints() != null ? c.getPoints() : 0;
            name = c.getFullName();
            avatar = c.getAvatar();
        } else {
            Optional<User> uOpt = userRepository.findByEmail(key);
            if (uOpt.isPresent()) {
                name = uOpt.get().getFullName();
            }
        }

        String currentRank = calculateRank(pts);
        String nextRank = getNextRank(currentRank);
        int pointsToNext = getPointsToNextRank(pts, currentRank);

        List<PointTransaction> allTxns = pointTransactionRepository.findByCustomerEmailOrderByCreatedAtDesc(key);

        List<PointTransactionDTO> earned = allTxns.stream()
                .filter(t -> "EARNED".equalsIgnoreCase(t.getType()))
                .map(t -> PointTransactionDTO.builder()
                        .id(t.getId())
                        .type(t.getType())
                        .pointsAmount(t.getPointsAmount())
                        .description(t.getDescription())
                        .createdAt(t.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        List<PointTransactionDTO> redeemed = allTxns.stream()
                .filter(t -> "REDEEMED".equalsIgnoreCase(t.getType()))
                .map(t -> PointTransactionDTO.builder()
                        .id(t.getId())
                        .type(t.getType())
                        .pointsAmount(t.getPointsAmount())
                        .description(t.getDescription())
                        .createdAt(t.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return MembershipInfoDTO.builder()
                .customerEmail(key)
                .fullName(name)
                .avatar(avatar)
                .points(pts)
                .rank(currentRank)
                .nextRank(nextRank)
                .pointsToNextRank(pointsToNext)
                .earnedHistory(earned)
                .redeemedHistory(redeemed)
                .build();
    }

    @Override
    public void addPoints(String email, int points, String description) {
        String key = email.trim().toLowerCase();
        Optional<Customer> custOpt = customerRepository.findByEmail(key);
        Customer c;
        if (custOpt.isPresent()) {
            c = custOpt.get();
            c.setPoints((c.getPoints() != null ? c.getPoints() : 0) + points);
            c.setRank(calculateRank(c.getPoints()));
            customerRepository.save(c);
        }

        PointTransaction txn = PointTransaction.builder()
                .customerEmail(key)
                .type("EARNED")
                .pointsAmount(points)
                .description(description)
                .build();
        pointTransactionRepository.save(txn);
    }

    @Override
    public boolean redeemPoints(String email, int points, String description) {
        String key = email.trim().toLowerCase();
        Optional<Customer> custOpt = customerRepository.findByEmail(key);
        if (custOpt.isPresent()) {
            Customer c = custOpt.get();
            int currentPts = c.getPoints() != null ? c.getPoints() : 0;
            if (currentPts < points) {
                throw new ApiException("Số điểm tích lũy không đủ để đổi thưởng", HttpStatus.BAD_REQUEST);
            }
            c.setPoints(currentPts - points);
            c.setRank(calculateRank(c.getPoints()));
            customerRepository.save(c);

            PointTransaction txn = PointTransaction.builder()
                    .customerEmail(key)
                    .type("REDEEMED")
                    .pointsAmount(points)
                    .description(description)
                    .build();
            pointTransactionRepository.save(txn);
            return true;
        }
        return false;
    }

    private String calculateRank(int points) {
        if (points >= 2500) return "DIAMOND";
        if (points >= 1000) return "PLATINUM";
        if (points >= 500) return "GOLD";
        if (points >= 100) return "SILVER";
        return "BRONZE";
    }

    private String getNextRank(String rank) {
        switch (rank) {
            case "BRONZE": return "SILVER";
            case "SILVER": return "GOLD";
            case "GOLD": return "PLATINUM";
            case "PLATINUM": return "DIAMOND";
            default: return "MAX_RANK";
        }
    }

    private int getPointsToNextRank(int points, String rank) {
        switch (rank) {
            case "BRONZE": return Math.max(0, 100 - points);
            case "SILVER": return Math.max(0, 500 - points);
            case "GOLD": return Math.max(0, 1000 - points);
            case "PLATINUM": return Math.max(0, 2500 - points);
            default: return 0;
        }
    }
}
