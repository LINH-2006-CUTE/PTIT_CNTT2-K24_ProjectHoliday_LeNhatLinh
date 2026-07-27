package com.example.restaurant.controller;

import com.example.restaurant.dto.ApiResponse;
import com.example.restaurant.dto.PermissionResponse;
import com.example.restaurant.dto.RoleRequest;
import com.example.restaurant.dto.RoleResponse;
import com.example.restaurant.service.RoleManagementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/roles")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class RoleManagementController {

    @Autowired
    private RoleManagementService roleManagementService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllRoles() {
        List<RoleResponse> roles = roleManagementService.getAllRoles();
        return ResponseEntity.ok(ApiResponse.success(roles, "Roles fetched successfully."));
    }

    @GetMapping("/permissions")
    public ResponseEntity<ApiResponse<List<PermissionResponse>>> getAllPermissions() {
        List<PermissionResponse> permissions = roleManagementService.getAllPermissions();
        return ResponseEntity.ok(ApiResponse.success(permissions, "Permissions fetched successfully."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoleResponse>> getRoleById(@PathVariable Long id) {
        RoleResponse role = roleManagementService.getRoleById(id);
        return ResponseEntity.ok(ApiResponse.success(role, "Role details fetched successfully."));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoleResponse>> createRole(@Valid @RequestBody RoleRequest request) {
        RoleResponse role = roleManagementService.createRole(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(role, "Role created successfully."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoleResponse>> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleRequest request) {
        RoleResponse role = roleManagementService.updateRole(id, request);
        return ResponseEntity.ok(ApiResponse.success(role, "Role updated successfully."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable Long id) {
        roleManagementService.deleteRole(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Role deleted successfully."));
    }
}
