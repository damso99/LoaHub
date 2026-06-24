package com.loahub.common.config;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {
    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String explicitJdbcUrl = firstNonBlank(
            environment.getProperty("SPRING_DATASOURCE_URL"),
            environment.getProperty("JDBC_DATABASE_URL")
        );
        if (isNotBlank(explicitJdbcUrl)) {
            return;
        }

        String databaseUrl = firstNonBlank(
            environment.getProperty("DATABASE_URL"),
            System.getenv("DATABASE_URL")
        );
        if (!isNotBlank(databaseUrl)) {
            return;
        }

        Map<String, Object> properties = convertDatabaseUrl(databaseUrl);
        if (!properties.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource("databaseUrlOverrides", properties));
        }
    }

    private Map<String, Object> convertDatabaseUrl(String databaseUrl) {
        Map<String, Object> properties = new LinkedHashMap<>();
        try {
            URI uri = URI.create(databaseUrl.trim());
            String scheme = uri.getScheme();
            if (scheme == null) {
                return properties;
            }

            if (scheme.startsWith("jdbc:")) {
                properties.put("spring.datasource.url", databaseUrl.trim());
                return properties;
            }

            if (!scheme.equalsIgnoreCase("postgres") && !scheme.equalsIgnoreCase("postgresql")) {
                return properties;
            }

            String host = uri.getHost();
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String path = uri.getPath() == null ? "" : uri.getPath();
            String databaseName = path.startsWith("/") ? path.substring(1) : path;

            if (host == null || host.isBlank() || databaseName.isBlank()) {
                return properties;
            }

            properties.put("spring.datasource.url", "jdbc:postgresql://" + host + ":" + port + "/" + databaseName + "?sslmode=require");

            String userInfo = uri.getUserInfo();
            if (isNotBlank(userInfo)) {
                String[] parts = userInfo.split(":", 2);
                if (parts.length > 0 && isNotBlank(parts[0])) {
                    properties.put("spring.datasource.username", parts[0]);
                }
                if (parts.length > 1 && isNotBlank(parts[1])) {
                    properties.put("spring.datasource.password", parts[1]);
                }
            }
        } catch (IllegalArgumentException exception) {
            // ignore invalid DATABASE_URL values and fall back to normal binding
        }

        return properties;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (isNotBlank(value)) {
                return value.trim();
            }
        }
        return null;
    }

    private boolean isNotBlank(String value) {
        return value != null && !value.isBlank();
    }
}
