package com.loahub.common.dao;

import com.loahub.common.dto.Requests.CharacterSaveRequest;
import com.loahub.common.dto.Requests.MessageRequest;
import com.loahub.common.dto.Requests.NotificationRequest;
import com.loahub.common.dto.Requests.PostRequest;
import com.loahub.common.dto.Requests.RegisterRequest;
import com.loahub.common.dto.Requests.UpdateProfileRequest;
import com.loahub.common.mapper.CommonMapper;
import com.loahub.common.model.DomainModels.Board;
import com.loahub.common.model.DomainModels.CalendarContent;
import com.loahub.common.model.DomainModels.CalendarNotification;
import com.loahub.common.model.DomainModels.Character;
import com.loahub.common.model.DomainModels.Comment;
import com.loahub.common.model.DomainModels.Message;
import com.loahub.common.model.DomainModels.Post;
import com.loahub.common.model.DomainModels.User;
import com.loahub.common.model.DomainModels.UserProfile;
import com.loahub.common.model.DomainModels.WanderingMerchant;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class CommonDao {
    private final CommonMapper mapper;

    public CommonDao(CommonMapper mapper) {
        this.mapper = mapper;
    }

    public Optional<User> findUserByEmail(String email) {
        return mapper.findUserByEmail(email);
    }

    public Optional<User> findUserById(long id) {
        return mapper.findUserById(id);
    }

    public User createUser(RegisterRequest request) {
        return mapper.createUser(request);
    }

    public UserProfile findProfileByUserId(long userId) {
        return mapper.findProfileByUserId(userId);
    }

    public UserProfile updateProfile(long userId, UpdateProfileRequest request) {
        return mapper.updateProfile(userId, request);
    }

    public UserProfile updateMainCharacter(long userId, com.loahub.common.dto.Requests.MainCharacterRequest request) {
        return mapper.updateMainCharacter(userId, request);
    }

    public List<Character> searchCharacters(String name) {
        return mapper.searchCharacters(name);
    }

    public List<Character> findCharactersByUserId(long userId) {
        return mapper.findCharactersByUserId(userId);
    }

    public Character createCharacter(long userId, CharacterSaveRequest request) {
        return mapper.createCharacter(userId, request);
    }

    public boolean deleteCharacter(long id) {
        return mapper.deleteCharacter(id);
    }

    public List<Board> findBoards() {
        return mapper.findBoards();
    }

    public List<Post> findPosts() {
        return mapper.findPosts();
    }

    public Optional<Post> findPostById(long id) {
        return mapper.findPostById(id);
    }

    public Optional<Comment> findCommentById(long id) {
        return mapper.findCommentById(id);
    }

    public Optional<Character> findCharacterById(long id) {
        return mapper.findCharacterById(id);
    }

    public Optional<Message> findMessageById(long id) {
        return mapper.findMessageById(id);
    }

    public Post createPost(long userId, String author, PostRequest request) {
        return mapper.createPost(userId, author, request);
    }

    public Post updatePost(long id, PostRequest request) {
        return mapper.updatePost(id, request);
    }

    public boolean deletePost(long id) {
        return mapper.deletePost(id);
    }

    public Post increaseViewCount(long id) {
        return mapper.increaseViewCount(id);
    }

    public Post likePost(long id, boolean like) {
        return mapper.likePost(id, like);
    }

    public List<Comment> findCommentsByPostId(long postId) {
        return mapper.findCommentsByPostId(postId);
    }

    public Comment createComment(long postId, long userId, String author, String content) {
        return mapper.createComment(postId, userId, author, content);
    }

    public boolean deleteComment(long id) {
        return mapper.deleteComment(id);
    }

    public List<CalendarContent> findCalendarContents() {
        return mapper.findCalendarContents();
    }

    public List<CalendarNotification> findNotificationsByUserId(long userId) {
        return mapper.findNotificationsByUserId(userId);
    }

    public CalendarNotification upsertNotification(long userId, NotificationRequest request) {
        return mapper.upsertNotification(userId, request);
    }

    public List<WanderingMerchant> findMerchants() {
        return mapper.findMerchants();
    }

    public List<Message> findInbox(long userId) {
        return mapper.findInbox(userId);
    }

    public List<Message> findSent(long userId) {
        return mapper.findSent(userId);
    }

    public Message sendMessage(long senderId, MessageRequest request) {
        return mapper.sendMessage(senderId, request);
    }

    public boolean deleteMessage(long messageId, long userId) {
        return mapper.deleteMessage(messageId, userId);
    }

    public Message markMessageRead(long messageId, long userId) {
        return mapper.markMessageRead(messageId, userId);
    }

    public void updateUserNickname(long userId, UpdateProfileRequest request) {
        mapper.updateUserNickname(userId, request);
    }
}
