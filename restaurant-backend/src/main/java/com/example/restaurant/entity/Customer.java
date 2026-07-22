package com.example.restaurant.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 255)
    private String avatar;

    @Column(length = 255)
    private String address;

    @Column(nullable = false)
    @Builder.Default
    private Boolean membership = false;

    @Column(nullable = false)
    @Builder.Default
    private Integer points = 0;

    @Column(name = "member_rank", nullable = false, length = 20)
    @Builder.Default
    private String rank = "BRONZE"; // BRONZE, SILVER, GOLD, PLATINUM, DIAMOND

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (points == null) points = 0;
        if (rank == null) rank = "BRONZE";
        if (membership == null) membership = false;
    }
}
