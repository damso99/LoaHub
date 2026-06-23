package com.loahub.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.loahub.common.dto.ApiResponse;
import com.loahub.common.util.JwtTokenUtil;
import com.loahub.user.UserMapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtTokenUtil jwtTokenUtil, UserMapper userMapper) {
        return new JwtAuthenticationFilter(jwtTokenUtil, userMapper);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> writeJson(response, 401, "로그인이 필요한 기능입니다."))
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    String message = accessDeniedException.getMessage();
                    if (message == null || message.isBlank()) {
                        message = "권한이 없습니다.";
                    }
                    writeJson(response, 403, message);
                }))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/signup", "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth/check-email", "/api/auth/check-nickname", "/api/auth/discord", "/api/auth/discord/callback").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/boards/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/posts").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/posts/*").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/posts/*/comments").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/lostark/characters/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/lostark/markets/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/lostark/calendar/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/characters/search").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/calendar/today", "/api/calendar/week").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/merchants", "/api/merchants/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/admin/lostark/calendar/sync").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/comments/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private void writeJson(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setCharacterEncoding("UTF-8");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.writeValue(response.getWriter(), new ApiResponse<>(false, message, Map.of()));
    }
}
