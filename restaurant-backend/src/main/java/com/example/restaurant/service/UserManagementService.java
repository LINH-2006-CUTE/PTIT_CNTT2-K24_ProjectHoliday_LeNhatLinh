package com.example.restaurant.service;

import com.example.restaurant.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface UserManagementService {
    Page<UserResponse> getUsers(String search, String roleName, Boolean enabled, Pageable pageable);
    UserResponse createUser(UserCreateRequest request);
    UserResponse updateUser(Long id, UserUpdateRequest request);
    void deleteUser(Long id, String currentAdminEmail);
    void toggleUserStatus(Long id, boolean enabled, String currentAdminEmail);
    void resetPassword(Long id, UserResetPasswordRequest request);
    List<RoleResponse> getAllRoles();
}
