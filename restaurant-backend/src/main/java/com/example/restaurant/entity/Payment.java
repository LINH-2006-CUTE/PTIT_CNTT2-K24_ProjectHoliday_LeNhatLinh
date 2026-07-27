package com.example.restaurant.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "payment_method", nullable = false, length = 30)
    private String paymentMethod; // CASH, QR_BANKING, VNPAY, MOMO

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(name = "payment_status", nullable = false, length = 30)
    @Builder.Default
    private String paymentStatus = "SUCCESS"; // PENDING, SUCCESS, FAILED

    @Column(name = "payment_time", nullable = false)
    @Builder.Default
    private LocalDateTime paymentTime = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String notes;
}
