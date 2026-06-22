package com.loahub.common.config;

import com.loahub.common.util.EnvUtils;
import java.util.Arrays;
import java.util.List;
import java.net.URI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
    private static final String DEFAULT_ALLOWED_ORIGINS = "http://localhost:5173,http://localhost:5174";

    @Bean
    public WebMvcConfigurer webMvcConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                List<String> allowedOrigins = resolveAllowedOrigins();
                registry.addMapping("/**")
                    .allowedOrigins(allowedOrigins.toArray(String[]::new))
                    .allowedMethods("*")
                    .allowedHeaders("*")
                    .allowCredentials(false);
            }
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> allowedOrigins = resolveAllowedOrigins();
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(java.util.List.of("*"));
        configuration.setAllowedHeaders(java.util.List.of("*"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private List<String> resolveAllowedOrigins() {
        String rawOrigins = EnvUtils.get("CORS_ALLOWED_ORIGINS", DEFAULT_ALLOWED_ORIGINS);
        if (rawOrigins == null || rawOrigins.isBlank()) {
            return List.of("http://localhost:5173", "http://localhost:5174");
        }

        String normalized = rawOrigins.trim();
        if (normalized.startsWith("[") && normalized.endsWith("]")) {
            normalized = normalized.substring(1, normalized.length() - 1);
        }
        if (normalized.startsWith("(") && normalized.endsWith(")")) {
            normalized = normalized.substring(1, normalized.length() - 1);
        }

        return Arrays.stream(normalized.split(","))
            .map(String::trim)
            .filter(value -> !value.isBlank())
            .map(this::normalizeOrigin)
            .filter(value -> !value.isBlank())
            .toList();
    }

    private String normalizeOrigin(String origin) {
        try {
            URI uri = URI.create(origin);
            if (uri.getScheme() == null || uri.getHost() == null) {
                return "";
            }

            String normalized = uri.getScheme() + "://" + uri.getHost();
            if (uri.getPort() != -1) {
                normalized += ":" + uri.getPort();
            }
            return normalized;
        } catch (IllegalArgumentException exception) {
            return "";
        }
    }
}
