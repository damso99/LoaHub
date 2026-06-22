package com.loahub.common.security;

import java.util.Optional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {
    private SecurityUtils() {
    }

    public static Optional<AuthenticatedUser> currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof AuthenticatedUser user) {
            return Optional.of(user);
        }

        return Optional.empty();
    }

    public static AuthenticatedUser requireCurrentUser() {
        return currentUser().orElseThrow(() -> new AccessDeniedException("로그인이 필요한 기능입니다."));
    }

    public static long requireCurrentUserId() {
        return requireCurrentUser().userId();
    }

    public static boolean isAdmin() {
        return currentUser().map(AuthenticatedUser::isAdmin).orElse(false);
    }

    public static void requireOwnerOrAdmin(long ownerId) {
        AuthenticatedUser user = requireCurrentUser();
        if (!user.isAdmin() && user.userId() != ownerId) {
            throw new AccessDeniedException("본인만 수정할 수 있습니다.");
        }
    }
}
