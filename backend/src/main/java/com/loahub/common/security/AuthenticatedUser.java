package com.loahub.common.security;

import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public record AuthenticatedUser(long userId, String email, String nickname, String role) {
    public List<GrantedAuthority> authorities() {
        return List.of(new SimpleGrantedAuthority(normalizedRole()));
    }

    public boolean isAdmin() {
        return "ROLE_ADMIN".equals(normalizedRole());
    }

    public String normalizedRole() {
        if (role == null || role.isBlank()) {
            return "ROLE_USER";
        }
        return role.startsWith("ROLE_") ? role : "ROLE_" + role;
    }
}
