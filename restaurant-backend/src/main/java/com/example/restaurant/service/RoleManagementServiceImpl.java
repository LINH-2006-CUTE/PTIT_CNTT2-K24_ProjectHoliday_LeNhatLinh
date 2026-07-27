package com.example.restaurant.service;

import com.example.restaurant.dto.PermissionResponse;
import com.example.restaurant.dto.RoleRequest;
import com.example.restaurant.dto.RoleResponse;
import com.example.restaurant.entity.Permission;
import com.example.restaurant.entity.Role;
import com.example.restaurant.exception.ApiException;
import com.example.restaurant.repository.PermissionRepository;
import com.example.restaurant.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RoleManagementServiceImpl implements RoleManagementService {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ApiException("Role not found", HttpStatus.NOT_FOUND));
        return mapToResponse(role);
    }

    @Override
    @Transactional
    public RoleResponse createRole(RoleRequest request) {
        // Enforce ROLE_ prefix if not present
        String roleName = request.getName().trim().toUpperCase();
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }

        if (roleRepository.findByName(roleName).isPresent()) {
            throw new ApiException("Role name already exists", HttpStatus.BAD_REQUEST);
        }

        Set<Permission> permissions = new HashSet<>();
        if (request.getPermissionNames() != null) {
            for (String permName : request.getPermissionNames()) {
                Permission permission = permissionRepository.findByName(permName)
                        .orElseThrow(() -> new ApiException("Permission not found: " + permName, HttpStatus.BAD_REQUEST));
                permissions.add(permission);
            }
        }

        Role role = Role.builder()
                .name(roleName)
                .permissions(permissions)
                .build();

        Role savedRole = roleRepository.save(role);
        return mapToResponse(savedRole);
    }

    @Override
    @Transactional
    public RoleResponse updateRole(Long id, RoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ApiException("Role not found", HttpStatus.NOT_FOUND));

        // System role check
        String currentName = role.getName();
        if (isSystemRole(currentName)) {
            // Cannot rename system roles, but can update permissions
            if (!request.getName().trim().equalsIgnoreCase(currentName)) {
                throw new ApiException("Cannot rename a system-protected role", HttpStatus.BAD_REQUEST);
            }
        } else {
            String newName = request.getName().trim().toUpperCase();
            if (!newName.startsWith("ROLE_")) {
                newName = "ROLE_" + newName;
            }
            if (!newName.equals(currentName) && roleRepository.findByName(newName).isPresent()) {
                throw new ApiException("Role name already exists", HttpStatus.BAD_REQUEST);
            }
            role.setName(newName);
        }

        Set<Permission> permissions = new HashSet<>();
        if (request.getPermissionNames() != null) {
            for (String permName : request.getPermissionNames()) {
                Permission permission = permissionRepository.findByName(permName)
                        .orElseThrow(() -> new ApiException("Permission not found: " + permName, HttpStatus.BAD_REQUEST));
                permissions.add(permission);
            }
        }
        role.setPermissions(permissions);

        Role updatedRole = roleRepository.save(role);
        return mapToResponse(updatedRole);
    }

    @Override
    @Transactional
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ApiException("Role not found", HttpStatus.NOT_FOUND));

        if (isSystemRole(role.getName())) {
            throw new ApiException("System role '" + role.getName() + "' is protected and cannot be deleted", HttpStatus.BAD_REQUEST);
        }

        roleRepository.delete(role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermissionResponse> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(p -> PermissionResponse.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .description(p.getDescription())
                        .build()
                )
                .collect(Collectors.toList());
    }

    private boolean isSystemRole(String name) {
        return name.equals("ROLE_ADMIN") || name.equals("ROLE_MANAGER") || name.equals("ROLE_STAFF") || name.equals("ROLE_CUSTOMER");
    }

    private RoleResponse mapToResponse(Role role) {
        Set<PermissionResponse> permissions = role.getPermissions().stream()
                .map(p -> PermissionResponse.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .description(p.getDescription())
                        .build()
                )
                .collect(Collectors.toSet());

        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .permissions(permissions)
                .build();
    }
}
