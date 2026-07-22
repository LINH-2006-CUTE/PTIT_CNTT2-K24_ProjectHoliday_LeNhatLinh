package com.example.restaurant.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "customer_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @Column(name = "customer_email", length = 100)
    private String customerEmail;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "order_id")
    private Long orderId;

    @Column(length = 255)
    private String avatar;

    @Column(nullable = false)
    private Integer rating; // 1 to 5

    @Column(nullable = false, length = 500)
    private String comment;

    @Column(nullable = false)
    @Builder.Default
    private Boolean featured = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.featured == null) {
            this.featured = true;
        }
        if (this.rating == null) {
            this.rating = 5;
        }
    }
}
