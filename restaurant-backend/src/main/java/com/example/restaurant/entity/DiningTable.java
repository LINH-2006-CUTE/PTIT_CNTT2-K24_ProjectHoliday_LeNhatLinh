package com.example.restaurant.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dining_tables")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiningTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_code", length = 50)
    private String tableCode;

    @Column(name = "table_number", nullable = false, unique = true, length = 50)
    private String tableNumber;

    @Column(nullable = false, length = 50)
    private String area; // e.g. Tầng 1 (Main Hall), Tầng 2, Ban công, Phòng VIP 1

    @Column(nullable = false)
    private Integer capacity;

    @Column(name = "table_type", length = 50)
    @Builder.Default
    private String tableType = "Thường"; // Thường, VIP, Phòng riêng, Ngoài trời

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "assigned_staff", length = 100)
    private String assignedStaff;

    @Column(name = "current_customer", length = 150)
    private String currentCustomer;

    @Column(name = "reservation_time", length = 100)
    private String reservationTime;

    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "AVAILABLE"; // AVAILABLE, RESERVED, OCCUPIED, DIRTY, CLEANING, MAINTENANCE, OUT_OF_SERVICE

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_table_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    private DiningTable parentTable;

    @OneToMany(mappedBy = "parentTable", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    private List<DiningTable> mergedTables = new ArrayList<>();
}
