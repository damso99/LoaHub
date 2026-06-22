package com.loahub.common.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenUtil {
    private final String secret = EnvUtils.get("JWT_SECRET", "");

    public String createToken(String subject) {
        long exp = Instant.now().plusSeconds(60L * 60L * 24L).getEpochSecond();
        String header = base64Url("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        String payload = base64Url("{\"sub\":\"" + escape(subject) + "\",\"exp\":" + exp + "}");
        String signature = sign(header + "." + payload);
        return header + "." + payload + "." + signature;
    }

    public boolean isValid(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return false;
        }

        String expected = sign(parts[0] + "." + parts[1]);
        return MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), parts[2].getBytes(StandardCharsets.UTF_8));
    }

    public String extractSubject(String token) {
        if (!isValid(token)) {
            return "";
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return "";
        }

        try {
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            int start = payload.indexOf("\"sub\":\"");
            if (start < 0) {
                return "";
            }
            start += 7;
            int end = payload.indexOf('"', start);
            if (end < 0) {
                return "";
            }
            return payload.substring(start, end);
        } catch (Exception exception) {
            return "";
        }
    }

    private String sign(String input) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return base64Url(mac.doFinal(input.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("JWT 서명 생성에 실패했습니다.", exception);
        }
    }

    private static String base64Url(String value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private static String base64Url(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    private static String escape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
