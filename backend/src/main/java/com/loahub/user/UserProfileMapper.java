package com.loahub.user;

import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserProfileMapper {
    void insertUserProfile(UserProfile userProfile);

    Optional<UserProfile> findByUserId(@Param("userId") Long userId);
}
