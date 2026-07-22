package com.example.restaurant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TableResponse {
    private Long id;
    private String tableCode;
    private String tableNumber;
    private String area;
    private Integer capacity;
    private String tableType;
    private String notes;
    private String assignedStaff;
    private String currentCustomer;
    private String reservationTime;
    private String specialRequests;
    private String status;
    private Long parentTableId;
    private String parentTableNumber;
    private List<Long> mergedTableIds;
    private List<String> mergedTableNumbers;
}
