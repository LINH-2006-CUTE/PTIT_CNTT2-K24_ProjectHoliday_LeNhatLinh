package com.example.restaurant.service;

import com.example.restaurant.dto.*;
import com.example.restaurant.entity.Customer;
import com.example.restaurant.entity.Order;
import com.example.restaurant.entity.User;
import com.example.restaurant.exception.ApiException;
import org.springframework.http.HttpStatus;
import com.example.restaurant.repository.CustomerRepository;
import com.example.restaurant.repository.OrderRepository;
import com.example.restaurant.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CustomerProfileServiceImpl implements CustomerProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public CustomerProfileDTO getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("Không tìm thấy tài khoản dùng email: " + email, HttpStatus.NOT_FOUND));

        Optional<Customer> customerOpt = customerRepository.findByEmail(email);

        return CustomerProfileDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatar(customerOpt.map(Customer::getAvatar).orElse(null))
                .membership(customerOpt.map(Customer::getMembership).orElse(true))
                .points(customerOpt.map(Customer::getPoints).orElse(0))
                .rank(customerOpt.map(Customer::getRank).orElse("MEMBER"))
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Override
    public CustomerProfileDTO updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("Không tìm thấy tài khoản: " + email, HttpStatus.NOT_FOUND));

        // Check Email Update restriction for Admin-created Staff/Chef/Waiter accounts
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty() && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            boolean isStaffOrAdminCreated = user.getRoles().stream()
                    .anyMatch(r -> r.getName().equals("ROLE_CHEF") || r.getName().equals("ROLE_WAITER") || r.getName().equals("ROLE_STAFF") || r.getName().equals("ROLE_ADMIN") || r.getName().equals("ROLE_MANAGER"));
            
            if (isStaffOrAdminCreated) {
                throw new ApiException("Tài khoản nhân viên do Quản trị viên (Admin) khởi tạo. Vui lòng liên hệ Admin để thay đổi Email.", HttpStatus.FORBIDDEN);
            }

            if (userRepository.existsByEmail(request.getEmail().trim())) {
                throw new ApiException("Email này đã được sử dụng bởi một tài khoản khác.", HttpStatus.BAD_REQUEST);
            }
            user.setEmail(request.getEmail().trim());
        }

        user.setFullName(request.getFullName().trim());
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getAvatar() != null && !request.getAvatar().trim().isEmpty()) {
            user.setAvatarUrl(request.getAvatar().trim());
        } else if (request.getAvatarUrl() != null && !request.getAvatarUrl().trim().isEmpty()) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }
        userRepository.save(user);

        // Update corresponding customer card if exists
        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            customer.setFullName(request.getFullName().trim());
            if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
                customer.setPhone(request.getPhone().trim());
            }
            if (request.getAvatar() != null) {
                customer.setAvatar(request.getAvatar().trim());
            }
            customerRepository.save(customer);
        } else {
            // Create customer card for user if missing
            Customer newCust = Customer.builder()
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .phone(user.getPhone() != null ? user.getPhone() : "0900000000")
                    .avatar(request.getAvatar())
                    .membership(true)
                    .points(0)
                    .rank("MEMBER")
                    .build();
            customerRepository.save(newCust);
        }

        return getProfile(email);
    }

    @Override
    public void changePassword(String email, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới và mật khẩu xác nhận không trùng khớp");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("Không tìm thấy tài khoản: " + email, HttpStatus.NOT_FOUND));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không chính xác");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerActivityDTO> getActivities(String email) {
        List<Order> orders = orderRepository.findByCustomerEmailOrderByOrderDateDesc(email);

        return orders.stream().map(o -> CustomerActivityDTO.builder()
                .orderId(o.getId())
                .orderDate(o.getOrderDate())
                .totalAmount(o.getTotalAmount())
                .status(o.getStatus())
                .itemCount(2) // Aggregated items count
                .diningTableName(o.getDiningTable() != null ? "Bàn " + o.getDiningTable().getTableNumber() : "Bàn điện tử")
                .build()
        ).collect(Collectors.toList());
    }
}
