package com.loahub.user;

import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    int countByEmail(@Param("email") String email);

    int countByNickname(@Param("nickname") String nickname);

    void insertUser(User user);

    Optional<User> findById(@Param("id") Long id);

    Optional<User> findByEmail(@Param("email") String email);
}
