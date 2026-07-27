package com.example.restaurant.controller;

import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.MergeTablesRequest;
import com.example.restaurant.dto.TableRequest;
import com.example.restaurant.dto.TableResponse;
import com.example.restaurant.service.DiningTableService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tables")
@PreAuthorize("hasRole('ADMIN')")
public class DiningTableController {

    @Autowired
    private DiningTableService diningTableService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TableResponse>>> searchTables(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String status) {
        List<TableResponse> list = diningTableService.searchTables(search, area, status);
        return ResponseEntity.ok(ApiResponse.success(list, "Dining tables fetched successfully."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TableResponse>> getTableById(@PathVariable Long id) {
        TableResponse res = diningTableService.getTableById(id);
        return ResponseEntity.ok(ApiResponse.success(res, "Dining table details fetched."));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TableResponse>> createTable(@Valid @RequestBody TableRequest request) {
        TableResponse res = diningTableService.createTable(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(res, "Dining table created successfully."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TableResponse>> updateTable(
            @PathVariable Long id,
            @Valid @RequestBody TableRequest request) {
        TableResponse res = diningTableService.updateTable(id, request);
        return ResponseEntity.ok(ApiResponse.success(res, "Dining table updated successfully."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTable(@PathVariable Long id) {
        diningTableService.deleteTable(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Dining table deleted successfully."));
    }

    @PostMapping("/merge")
    public ResponseEntity<ApiResponse<TableResponse>> mergeTables(@Valid @RequestBody MergeTablesRequest request) {
        TableResponse res = diningTableService.mergeTables(request);
        return ResponseEntity.ok(ApiResponse.success(res, "Dining tables merged successfully."));
    }

    @PostMapping("/split/{id}")
    public ResponseEntity<ApiResponse<TableResponse>> splitTable(@PathVariable Long id) {
        TableResponse res = diningTableService.splitTable(id);
        return ResponseEntity.ok(ApiResponse.success(res, "Dining tables split successfully."));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TableResponse>> changeStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        TableResponse res = diningTableService.changeTableStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(res, "Table status updated successfully."));
    }
}
