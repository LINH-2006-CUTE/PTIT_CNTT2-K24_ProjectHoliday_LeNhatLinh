package com.example.restaurant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableActionRequest {
    private Long fromTableId;
    private Long toTableId;
    private String action; // MOVE, MERGE, SPLIT, CHANGE_STATUS
    private String newStatus; // AVAILABLE, OCCUPIED, RESERVED, CLEANING
}
