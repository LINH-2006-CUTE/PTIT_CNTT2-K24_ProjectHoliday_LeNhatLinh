package com.example.restaurant.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class MergeTablesRequest {

    @NotNull(message = "Primary table ID is required")
    private Long primaryTableId;

    @NotEmpty(message = "List of table IDs to merge must not be empty")
    private List<Long> tableIdsToMerge;
}
