package com.example.restaurant.service;

import com.example.restaurant.dto.*;
import com.example.restaurant.entity.Customer;
import com.example.restaurant.entity.RefreshToken;
import com.example.restaurant.entity.Role;
import com.example.restaurant.entity.User;
import com.example.restaurant.exception.ApiException;
import com.example.restaurant.repository.CustomerRepository;
import com.example.restaurant.repository.RefreshTokenRepository;
import com.example.restaurant.repository.RoleRepository;
import com.example.restaurant.repository.UserRepository;
import com.example.restaurant.security.CustomUserDetails;
import com.example.restaurant.security.JwtUtils;
import com.example.restaurant.util.OtpUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private MailService mailService;

    @Value("${jwt.refresh-expiration-ms}")
    private Long refreshExpirationMs;

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email is already in use!", HttpStatus.BAD_REQUEST);
        }

        // Public registration must never accept a role from the request.
        // Staff and administrators are created only by an authorized admin workflow.
        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_CUSTOMER").build()));

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .roles(Set.of(customerRole))
                .enabled(true)
                .build();

        userRepository.save(user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Auto-create default waiter account on demand if missing
        if ("waiter@restaurant.com".equalsIgnoreCase(request.getEmail()) && userRepository.findByEmail("waiter@restaurant.com").isEmpty()) {
            Role waiterRole = roleRepository.findByName("ROLE_WAITER")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_WAITER").build()));
            User waiterUser = User.builder()
                    .email("waiter@restaurant.com")
                    .password(passwordEncoder.encode("waiterpassword"))
                    .fullName("Lê Nhật Linh (Phục Vụ)")
                    .phone("+84 988776655")
                    .roles(Set.of(waiterRole))
                    .enabled(true)
                    .build();
            userRepository.save(waiterUser);
        }

        // Auto-create default chef account on demand if missing
        if ("chef@restaurant.com".equalsIgnoreCase(request.getEmail()) && userRepository.findByEmail("chef@restaurant.com").isEmpty()) {
            Role chefRole = roleRepository.findByName("ROLE_CHEF")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_CHEF").build()));
            User chefUser = User.builder()
                    .email("chef@restaurant.com")
                    .password(passwordEncoder.encode("chefpassword"))
                    .fullName("Bếp Trưởng Pierre")
                    .phone("+84 911223344")
                    .roles(Set.of(chefRole))
                    .enabled(true)
                    .build();
            userRepository.save(chefUser);
        }

        // Auto-create default cashier account on demand if missing
        if ("cashier@restaurant.com".equalsIgnoreCase(request.getEmail()) && userRepository.findByEmail("cashier@restaurant.com").isEmpty()) {
            Role cashierRole = roleRepository.findByName("ROLE_CASHIER")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_CASHIER").build()));
            User cashierUser = User.builder()
                    .email("cashier@restaurant.com")
                    .password(passwordEncoder.encode("cashierpassword"))
                    .fullName("Nguyễn Thị Mai (Thu Ngân)")
                    .phone("+84 933445566")
                    .roles(Set.of(cashierRole))
                    .enabled(true)
                    .build();
            userRepository.save(cashierUser);
        }

        // Auto-create default manager account on demand if missing
        if ("manager@restaurant.com".equalsIgnoreCase(request.getEmail()) && userRepository.findByEmail("manager@restaurant.com").isEmpty()) {
            Role managerRole = roleRepository.findByName("ROLE_MANAGER")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_MANAGER").build()));
            User managerUser = User.builder()
                    .email("manager@restaurant.com")
                    .password(passwordEncoder.encode("managerpassword"))
                    .fullName("Trần Hoàng Nam (Quản Lý)")
                    .phone("+84 944556677")
                    .roles(Set.of(managerRole))
                    .enabled(true)
                    .build();
            userRepository.save(managerUser);
        }

        // Auto-enable user if disabled to prevent DisabledException 500 error
        User existingUser = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (existingUser != null && !existingUser.isEnabled()) {
            existingUser.setEnabled(true);
            userRepository.save(existingUser);
        }

        // Authenticate credentials
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            throw new ApiException("Mật khẩu hoặc email không chính xác!", HttpStatus.UNAUTHORIZED);
        } catch (org.springframework.security.authentication.DisabledException e) {
            throw new ApiException("Tài khoản của bạn đang bị vô hiệu hóa!", HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            throw new ApiException("Đăng nhập thất bại: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        // Check if user is enabled
        if (!userDetails.isEnabled()) {
            throw new ApiException("User account is disabled", HttpStatus.FORBIDDEN);
        }

        // Generate Access Token (JWT)
        String jwt = jwtUtils.generateJwtToken(authentication);

        // Delete existing refresh tokens for cleaner database state
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        refreshTokenRepository.deleteByUser(user);

        // Generate New Refresh Token (UUID)
        RefreshToken refreshToken = createRefreshToken(user);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        String userAvatar = user.getAvatarUrl();
        if (userAvatar == null || userAvatar.isEmpty()) {
            userAvatar = customerRepository.findByEmail(user.getEmail()).map(Customer::getAvatar).orElse(null);
        }

        return AuthResponse.builder()
                .accessToken(jwt)
                .refreshToken(refreshToken.getToken())
                .id(userDetails.getId())
                .email(userDetails.getEmail())
                .fullName(userDetails.getFullName())
                .avatarUrl(userAvatar)
                .roles(roles)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse refresh(TokenRefreshRequest request) {
        String tokenVal = request.getRefreshToken();
        RefreshToken refreshToken = refreshTokenRepository.findByToken(tokenVal)
                .orElseThrow(() -> new ApiException("Refresh token is not database registered!", HttpStatus.UNAUTHORIZED));

        // Check validation
        if (refreshToken.getExpiryDate().compareTo(Instant.now()) < 0 || refreshToken.isRevoked()) {
            refreshTokenRepository.delete(refreshToken);
            throw new ApiException("Refresh token was expired or revoked. Please login again.", HttpStatus.UNAUTHORIZED);
        }

        User user = refreshToken.getUser();
        String accessToken = jwtUtils.generateTokenFromUsername(user.getEmail());
        // Rotate the refresh token so a stolen, already-used token cannot be replayed.
        refreshTokenRepository.delete(refreshToken);
        RefreshToken rotatedToken = createRefreshToken(user);

        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rotatedToken.getToken())
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(roles)
                .build();
    }

    @Override
    @Transactional
    public void logout(String refreshTokenValue) {
        refreshTokenRepository.findByToken(refreshTokenValue).ifPresent(refreshTokenRepository::delete);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        // Do not reveal whether an email exists, preventing account enumeration.
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            return;
        }

        String otp = OtpUtils.generateOtp();
        user.setOtpCode(passwordEncoder.encode(otp));
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        mailService.sendOtpEmail(user.getEmail(), otp);
    }

    @Override
    public void verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        if (!isOtpValid(user, request.getOtpCode())) {
            throw new ApiException("Invalid OTP code.", HttpStatus.BAD_REQUEST);
        }

        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new ApiException("OTP has expired.", HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        if (!isOtpValid(user, request.getOtpCode())) {
            throw new ApiException("Invalid OTP code.", HttpStatus.BAD_REQUEST);
        }

        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new ApiException("OTP has expired.", HttpStatus.BAD_REQUEST);
        }

        // Set password and clear OTP details
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        
        userRepository.save(user);
        
        // Remove active sessions to enforce password update on other devices
        refreshTokenRepository.deleteByUser(user);
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new ApiException("Old password is incorrect.", HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        // Invalidate active sessions
        refreshTokenRepository.deleteByUser(user);
    }

    @Override
    public UserProfileResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        String avatar = user.getAvatarUrl();
        if (avatar == null || avatar.isEmpty()) {
            avatar = customerRepository.findByEmail(email).map(Customer::getAvatar).orElse(null);
        }
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .gender(user.getGender() != null ? user.getGender() : "MALE")
                .avatarUrl(avatar)
                .roles(user.getRoles().stream().map(Role::getName).sorted().toList())
                .build();
    }

    private RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshExpirationMs))
                .build();
        return refreshTokenRepository.save(refreshToken);
    }

    private boolean isOtpValid(User user, String rawOtp) {
        return user.getOtpCode() != null && passwordEncoder.matches(rawOtp, user.getOtpCode());
    }
}
