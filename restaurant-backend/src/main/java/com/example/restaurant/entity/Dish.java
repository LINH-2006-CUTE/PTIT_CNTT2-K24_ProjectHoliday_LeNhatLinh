package com.example.restaurant.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "dishes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Dish {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 255)
    private String image;

    @Column(length = 50)
    private String code;

    @Column(name = "cost_price", precision = 10, scale = 2)
    private BigDecimal costPrice;

    @Column(columnDefinition = "TEXT")
    private String ingredients;

    @Column(name = "prep_time")
    private Integer prepTime; // Preparation time in minutes

    private Integer calories; // Optional calories

    @Column(length = 30)
    private String spiciness; // Không cay, Cay nhẹ, Cay vừa, Cay nồng

    @Column(name = "dish_size", length = 50)
    private String dishSize; // Nhỏ (S), Vừa (M), Lớn (L), Combo

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(length = 30, nullable = false)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @Column(nullable = false)
    @Builder.Default
    private boolean available = true; // true = ready to serve, false = sold out
}
