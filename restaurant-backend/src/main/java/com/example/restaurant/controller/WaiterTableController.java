package com.example.restaurant.controller;

import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.TableActionRequest;
import com.example.restaurant.entity.DiningTable;
import com.example.restaurant.service.WaiterTableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/waiter/tables")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('WAITER', 'ADMIN', 'MANAGER', 'STAFF')")
public class WaiterTableController {

    @Autowired
    private WaiterTableService waiterTableService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DiningTable>>> getAllTables() {
        List<DiningTable> tables = waiterTableService.getAllTables();
        return ResponseEntity.ok(ApiResponse.success(tables, "Lấy sơ đồ bàn thành công"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<DiningTable>> updateTableStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        DiningTable table = waiterTableService.updateTableStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(table, "Cập nhật trạng thái bàn thành công"));
    }

    @PostMapping("/action")
    public ResponseEntity<ApiResponse<DiningTable>> handleTableAction(@RequestBody TableActionRequest request) {
        DiningTable table = waiterTableService.handleTableAction(request);
        return ResponseEntity.ok(ApiResponse.success(table, "Thực hiện thao tác bàn thành công"));
    }
}
