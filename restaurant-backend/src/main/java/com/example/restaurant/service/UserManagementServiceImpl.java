package com.example.restaurant.service;

import com.example.restaurant.dto.*;
import com.example.restaurant.entity.Employee;
import com.example.restaurant.entity.Role;
import com.example.restaurant.entity.User;
import com.example.restaurant.exception.ApiException;
import com.example.restaurant.repository.EmployeeRepository;
import com.example.restaurant.repository.RefreshTokenRepository;
import com.example.restaurant.repository.RoleRepository;
import com.example.restaurant.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserManagementServiceImpl implements UserManagementService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(String search, String roleName, Boolean enabled, Pageable pageable) {
        // Normalize empty parameters
        String searchParam = (search == null || search.trim().isEmpty()) ? null : search.trim();
        String roleParam = (roleName == null || roleName.trim().isEmpty() || roleName.equalsIgnoreCase("All")) ? null : roleName.trim();

        Page<User> userPage = userRepository.searchUsers(searchParam, roleParam, enabled, pageable);
        return userPage.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email is already in use", HttpStatus.BAD_REQUEST);
        }

        Set<Role> roles = new HashSet<>();
        for (String roleName : request.getRoles()) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new ApiException("Role not found: " + roleName, HttpStatus.BAD_REQUEST));
            roles.add(role);
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .enabled(true)
                .roles(roles)
                .build();

        User savedUser = userRepository.save(user);
        syncEmployeeProfileForUser(savedUser);
        return mapToResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        Set<Role> roles = new HashSet<>();
        for (String roleName : request.getRoles()) {
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new ApiException("Role not found: " + roleName, HttpStatus.BAD_REQUEST));
            roles.add(role);
        }

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setRoles(roles);

        User updatedUser = userRepository.save(user);
        syncEmployeeProfileForUser(updatedUser);
        return mapToResponse(updatedUser);
    }

    @Autowired
    private EmployeeRepository employeeRepository;

    private void syncEmployeeProfileForUser(User user) {
        boolean isStaff = user.getRoles().stream()
                .anyMatch(r -> !r.getName().equals("ROLE_CUSTOMER"));
        if (isStaff) {
            String targetStatus = user.isEnabled() ? "ACTIVE" : "INACTIVE";
            employeeRepository.findByUserId(user.getId()).ifPresentOrElse(emp -> {
                emp.setStatus(targetStatus);
                employeeRepository.save(emp);
            }, () -> {
                String empCode = "EMP-" + String.format("%04d", user.getId());
                Employee employee = Employee.builder()
                        .employeeCode(empCode)
                        .user(user)
                        .status(targetStatus)
                        .salary(new java.math.BigDecimal("1500.00"))
                        .hireDate(java.time.LocalDate.now())
                        .build();
                employeeRepository.save(employee);
            });
        }
    }

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Override
    @Transactional
    public void deleteUser(Long id, String currentAdminEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException("Không tìm thấy người dùng.", HttpStatus.NOT_FOUND));

        if (user.getEmail().equalsIgnoreCase(currentAdminEmail)) {
            throw new ApiException("Bạn không thể tự xóa tài khoản của chính mình.", HttpStatus.BAD_REQUEST);
        }

        // Protect core system accounts
        String emailLower = user.getEmail().toLowerCase();
        if (emailLower.equals("admin@restaurant.com") ||
            emailLower.equals("manager@restaurant.com") ||
            emailLower.equals("waiter@restaurant.com") ||
            emailLower.equals("chef@restaurant.com") ||
            emailLower.equals("cashier@restaurant.com")) {
            throw new ApiException("Tài khoản hệ thống mặc định (" + user.getEmail() + ") không thể xóa vĩnh viễn. Vui lòng sử dụng tính năng Khóa Tài Khoản!", HttpStatus.BAD_REQUEST);
        }

        try {
            // Delete associated refresh tokens first
            refreshTokenRepository.deleteByUser(user);
            userRepository.delete(user);
            userRepository.flush();
        } catch (Exception e) {
            throw new ApiException("Không thể xóa vĩnh viễn tài khoản " + user.getFullName() + " do đã phát sinh lịch sử đơn hàng/nhân sự trên hệ thống. Vui lòng chuyển trạng thái sang Khóa Tài Khoản!", HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    @Transactional
    public void toggleUserStatus(Long id, boolean enabled, String currentAdminEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        if (user.getEmail().equalsIgnoreCase(currentAdminEmail)) {
            throw new ApiException("You cannot modify your own status", HttpStatus.BAD_REQUEST);
        }

        user.setEnabled(enabled);
        userRepository.save(user);

        // Synchronize linked Employee profile status
        employeeRepository.findByUserId(user.getId()).ifPresent(emp -> {
            emp.setStatus(enabled ? "ACTIVE" : "INACTIVE");
            employeeRepository.save(emp);
        });
    }

    @Override
    @Transactional
    public void resetPassword(Long id, UserResetPasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(r -> RoleResponse.builder()
                        .id(r.getId())
                        .name(r.getName())
                        .build()
                )
                .collect(Collectors.toList());
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .enabled(user.isEnabled())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
