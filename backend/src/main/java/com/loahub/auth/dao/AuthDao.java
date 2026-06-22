package com.loahub.auth.dao;

import com.loahub.auth.dto.RegisterRequest;
import com.loahub.user.User;
import com.loahub.user.UserMapper;
import com.loahub.user.UserProfile;
import com.loahub.user.UserProfileMapper;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class AuthDao {
    private final UserMapper userMapper;
    private final UserProfileMapper userProfileMapper;

    public AuthDao(UserMapper userMapper, UserProfileMapper userProfileMapper) {
        this.userMapper = userMapper;
        this.userProfileMapper = userProfileMapper;
    }

    public int countByEmail(String email) {
        return userMapper.countByEmail(email);
    }

    public int countByNickname(String nickname) {
        return userMapper.countByNickname(nickname);
    }

    public User insertUser(String email, String nickname, String encodedPassword) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(encodedPassword);
        user.setNickname(nickname);
        user.setProvider("LOCAL");
        user.setRole("USER");
        user.setMainCharacterName(null);
        userMapper.insertUser(user);
        return user;
    }

    public User insertUser(RegisterRequest request, String encodedPassword) {
        User user = new User();
        user.setEmail(request.email());
        user.setPassword(encodedPassword);
        user.setNickname(request.nickname());
        user.setProvider("LOCAL");
        user.setMainCharacterName(request.mainCharacterName());
        user.setRole("USER");
        userMapper.insertUser(user);
        return user;
    }

    public UserProfile insertUserProfile(Long userId, RegisterRequest request) {
        UserProfile profile = new UserProfile();
        profile.setUserId(userId);
        profile.setMainCharacterName(request.mainCharacterName());
        userProfileMapper.insertUserProfile(profile);
        return profile;
    }

    public Optional<User> findUserById(Long id) {
        return userMapper.findById(id);
    }

    public Optional<User> findUserByEmail(String email) {
        return userMapper.findByEmail(email);
    }

    public Optional<UserProfile> findProfileByUserId(Long userId) {
        return userProfileMapper.findByUserId(userId);
    }
}
