package com.example.restaurant.service;

import com.example.restaurant.dto.PermissionResponse;
import com.example.restaurant.dto.RoleRequest;
import com.example.restaurant.dto.RoleResponse;
import java.util.List;

public interface RoleManagementService {
    List<RoleResponse> getAllRoles();
    RoleResponse getRoleById(Long id);
    RoleResponse createRole(RoleRequest request);
    RoleResponse updateRole(Long id, RoleRequest request);
    void deleteRole(Long id);
    List<PermissionResponse> getAllPermissions();
}
