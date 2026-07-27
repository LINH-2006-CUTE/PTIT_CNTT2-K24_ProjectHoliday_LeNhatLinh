package com.example.restaurant.security;

import com.example.restaurant.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public class CustomUserDetails implements UserDetails {

    private Long id;
    private String email;
    @JsonIgnore
    private String password;
    private String fullName;
    private String phone;
    private boolean enabled;
    private Collection<? extends GrantedAuthority> authorities;

    public static CustomUserDetails build(User user) {
        java.util.List<GrantedAuthority> authorities = new java.util.ArrayList<>();
        if (user.getRoles() != null) {
            for (com.example.restaurant.entity.Role role : user.getRoles()) {
                authorities.add(new SimpleGrantedAuthority(role.getName()));
                if (role.getPermissions() != null) {
                    for (com.example.restaurant.entity.Permission permission : role.getPermissions()) {
                        authorities.add(new SimpleGrantedAuthority(permission.getName()));
                    }
                }
            }
        }

        return new CustomUserDetails(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                user.getFullName(),
                user.getPhone(),
                user.isEnabled(),
                authorities
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
