package com.example.restaurant.controller;

import com.example.restaurant.dto.*;
import com.example.restaurant.service.UserManagementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class UserManagementController {

    @Autowired
    private UserManagementService userManagementService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        String[] sortParams = sort.split(",");
        String sortBy = sortParams[0];
        Sort.Direction direction = Sort.Direction.DESC;
        if (sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc")) {
            direction = Sort.Direction.ASC;
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<UserResponse> users = userManagementService.getUsers(search, role, enabled, pageable);
        return ResponseEntity.ok(ApiResponse.success(users, "Users list fetched successfully."));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserCreateRequest request) {
        UserResponse user = userManagementService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(user, "User created successfully."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {
        UserResponse user = userManagementService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success(user, "User updated successfully."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id, Principal principal) {
        userManagementService.deleteUser(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully."));
    }

    @PostMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled,
            Principal principal) {
        userManagementService.toggleUserStatus(id, enabled, principal.getName());
        String status = enabled ? "unlocked" : "locked";
        return ResponseEntity.ok(ApiResponse.success(null, "User " + status + " successfully."));
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody UserResetPasswordRequest request) {
        userManagementService.resetPassword(id, request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successfully."));
    }

    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllRoles() {
        List<RoleResponse> roles = userManagementService.getAllRoles();
        return ResponseEntity.ok(ApiResponse.success(roles, "Roles fetched successfully."));
    }
}
