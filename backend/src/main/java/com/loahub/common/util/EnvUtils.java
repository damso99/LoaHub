package com.loahub.common.util;

public final class EnvUtils {
    private EnvUtils() {
    }

    public static String get(String key, String defaultValue) {
        String value = System.getProperty(key);
        if (value != null && !value.isBlank()) {
            return value;
        }

        value = System.getenv(key);
        if (value != null && !value.isBlank()) {
            return value;
        }

        return defaultValue;
    }
}
