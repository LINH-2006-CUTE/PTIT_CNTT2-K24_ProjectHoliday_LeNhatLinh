package com.example.restaurant.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ingredients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ingredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", length = 50, unique = true)
    private String code;

    @Column(nullable = false, unique = true, length = 150)
    private String name;

    @Column(length = 100)
    private String category;

    @Column(name = "stock_quantity", nullable = false)
    private Double stockQuantity;

    @Column(name = "min_stock_threshold", nullable = false)
    private Double minStockThreshold;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(name = "import_price", precision = 15, scale = 2)
    private BigDecimal importPrice;

    @Column(name = "supplier_name", length = 150)
    private String supplierName;

    @Column(name = "storage_location", length = 150)
    private String storageLocation;

    @Column(name = "expiry_date")
    private java.time.LocalDate expiryDate;

    @Column(length = 500)
    private String notes;
}
