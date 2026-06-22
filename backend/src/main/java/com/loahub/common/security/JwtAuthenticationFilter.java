package com.loahub.common.security;

import com.loahub.common.util.JwtTokenUtil;
import com.loahub.user.User;
import com.loahub.user.UserMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenUtil jwtTokenUtil;
    private final UserMapper userMapper;

    public JwtAuthenticationFilter(JwtTokenUtil jwtTokenUtil, UserMapper userMapper) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.userMapper = userMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7).trim();
            if (jwtTokenUtil.isValid(token)) {
                String subject = jwtTokenUtil.extractSubject(token);
                Optional<User> user = parseUser(subject);
                if (user.isPresent() && SecurityContextHolder.getContext().getAuthentication() == null) {
                    AuthenticatedUser principal = new AuthenticatedUser(
                        user.get().getUserId(),
                        user.get().getEmail(),
                        user.get().getNickname(),
                        user.get().getRole()
                    );
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        principal.authorities()
                    );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private Optional<User> parseUser(String subject) {
        try {
            long userId = Long.parseLong(subject);
            return userMapper.findById(userId);
        } catch (Exception exception) {
            return Optional.empty();
        }
    }
}
