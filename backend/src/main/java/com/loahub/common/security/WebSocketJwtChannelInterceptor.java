package com.loahub.common.security;

import com.loahub.common.util.JwtTokenUtil;
import com.loahub.user.User;
import com.loahub.user.UserMapper;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
public class WebSocketJwtChannelInterceptor implements ChannelInterceptor {
    private static final Logger log = LoggerFactory.getLogger(WebSocketJwtChannelInterceptor.class);

    private final JwtTokenUtil jwtTokenUtil;
    private final UserMapper userMapper;

    public WebSocketJwtChannelInterceptor(JwtTokenUtil jwtTokenUtil, UserMapper userMapper) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.userMapper = userMapper;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = resolveToken(accessor);
            if (token == null || token.isBlank() || !jwtTokenUtil.isValid(token)) {
                throw new IllegalArgumentException("유효하지 않은 WebSocket 토큰입니다.");
            }

            String subject = jwtTokenUtil.extractSubject(token);
            Optional<User> user = parseUser(subject);
            if (user.isEmpty()) {
                throw new IllegalArgumentException("WebSocket 인증 정보를 확인할 수 없습니다.");
            }

            accessor.setUser(new UsernamePasswordAuthenticationToken(String.valueOf(user.get().getUserId()), null, List.of()));
            log.info("WebSocket CONNECT authenticated. userId={}", user.get().getUserId());
        }

        return message;
    }

    private String resolveToken(StompHeaderAccessor accessor) {
        String authorization = accessor.getFirstNativeHeader("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")) {
            return authorization.substring(7).trim();
        }

        String token = accessor.getFirstNativeHeader("accessToken");
        if (token != null && !token.isBlank()) {
            return token.trim();
        }

        token = accessor.getFirstNativeHeader("token");
        return token == null ? "" : token.trim();
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
