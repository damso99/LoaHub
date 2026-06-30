package com.loahub.common.repository;

import com.loahub.common.dto.Requests.CharacterSaveRequest;
import com.loahub.common.dto.Requests.LoginRequest;
import com.loahub.common.dto.Requests.MainCharacterRequest;
import com.loahub.common.dto.Requests.MessageRequest;
import com.loahub.common.dto.Requests.NotificationRequest;
import com.loahub.common.dto.Requests.PostRequest;
import com.loahub.common.dto.Requests.RegisterRequest;
import com.loahub.common.dto.Requests.UpdateProfileRequest;
import com.loahub.common.model.DomainModels.Board;
import com.loahub.common.model.DomainModels.CalendarContent;
import com.loahub.common.model.DomainModels.CalendarNotification;
import com.loahub.common.model.DomainModels.Character;
import com.loahub.common.model.DomainModels.Comment;
import com.loahub.common.model.DomainModels.Message;
import com.loahub.common.model.DomainModels.Post;
import com.loahub.common.model.DomainModels.User;
import com.loahub.common.model.DomainModels.UserProfile;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import java.util.Locale;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class MockDatabase {
    private final AtomicLong userSeq = new AtomicLong(2);
    private final AtomicLong profileSeq = new AtomicLong(2);
    private final AtomicLong characterSeq = new AtomicLong(5);
    private final AtomicLong postSeq = new AtomicLong(5);
    private final AtomicLong commentSeq = new AtomicLong(5);
    private final AtomicLong notificationSeq = new AtomicLong(3);
    private final AtomicLong messageSeq = new AtomicLong(3);

    private final List<User> users = new CopyOnWriteArrayList<>(List.of(
        new User(1, "guardian@loahub.dev", "{noop}password", "가디언 슬레이어", "local", null, "ROLE_USER", now(), now())
    ));

    private final List<UserProfile> profiles = new CopyOnWriteArrayList<>(List.of(
        new UserProfile(1, 1, "가디언 슬레이어", "아제나", "슬레이어", 1620, "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=240&q=80", "레이드와 게시판을 한 번에 관리하는 LoaHub 포트폴리오 데모 계정입니다.", now(), now())
    ));

    private final List<Character> characters = new CopyOnWriteArrayList<>(List.of(
        new Character(1, 1, "가디언 슬레이어", "아제나", "슬레이어", 1620, "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=240&q=80", true, now()),
        new Character(2, 1, "실드 메이트", "아제나", "워로드", 1580.5, "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=240&q=80", false, now()),
        new Character(3, 1, "매직 미사일", "마리", "소서리스", 1600, "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=240&q=80", false, now()),
        new Character(4, 1, "힐포골드", "카단", "바드", 1610.83, "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=240&q=80", false, now())
    ));

    private final List<Board> boards = new CopyOnWriteArrayList<>(List.of(
        new Board(1, "FREE", "자유게시판", null, 1, now()),
        new Board(2, "CLASS", "직업별 게시판", "슬레이어", 2, now()),
        new Board(3, "CLASS", "직업별 게시판", "소서리스", 3, now()),
        new Board(4, "CLASS", "직업별 게시판", "바드", 4, now())
    ));

    private final List<Post> posts = new CopyOnWriteArrayList<>(List.of(
        new Post(1, 1, 1, "카멘 3관문 공략 파티 모집합니다", "아제나 서버 기준으로 금요일 20시부터 출발 예정입니다. 숙련자 우대하며 디스코드 필수입니다.", 12500, 42, 8, "Zoro", "슬레이어", false, true, List.of("가이드", "파티모집"), now(), now()),
        new Post(2, 1, 1, "오늘 밤 8시 에키드나 하드 트라이 서포터 모십니다", "서포터 1명 구합니다. 공팟보다는 커뮤니티 기반으로 진행하고 싶습니다.", 842, 16, 3, "GigaChad", "홀리나이트", false, false, List.of("파티모집"), now(), now()),
        new Post(3, 2, 1, "배럭 무기 25강 찍어줄 만한가요?", "소울이터 배럭 키우는 중인데 25강 투자 효율이 궁금합니다. 경험담 부탁드립니다.", 5200, 33, 16, "MokoMoko", "소울이터", false, false, List.of("직업질문"), now(), now()),
        new Post(4, 1, 1, "이번 주 일정 요약 공유합니다", "베른 남부, 엘가시아, 쿠르잔 쪽 일정 정리했습니다. 업데이트 완료.", 2940, 18, 4, "PatchNote", "기상술사", false, false, List.of("정보공유"), now(), now())
    ));

    private final List<Comment> comments = new CopyOnWriteArrayList<>(List.of(
        new Comment(1, 1, 1, "시간대가 맞아서 관심 있습니다. 디코 아이디 남겨주세요.", "Rainfall", false, now(), now()),
        new Comment(2, 1, 1, "직업은 뭐 받으시나요?", "BlueShield", false, now(), now()),
        new Comment(3, 2, 1, "서포터 가능합니다. 주말 일정 맞으면 참여하고 싶습니다.", "HolySong", false, now(), now())
    ));

    private final List<CalendarContent> calendarContents = new CopyOnWriteArrayList<>(List.of(
        new CalendarContent(1, "카오스게이트", "TODAY", "2026-06-17 18:00", "유성룬, 각인서, 재련 재료 수급 콘텐츠", now()),
        new CalendarContent(2, "필드보스", "TODAY", "2026-06-17 19:30", "서버별 등장 시간 확인 후 참여", now()),
        new CalendarContent(3, "모험섬", "WEEK", "2026-06-19 12:00", "주간 보상 수급용 콘텐츠", now()),
        new CalendarContent(4, "주간 초기화", "WEEK", "2026-06-18 06:00", "레이드 및 숙제 초기화", now())
    ));

    private final List<CalendarNotification> notifications = new CopyOnWriteArrayList<>(List.of(
        new CalendarNotification(1, 1, 1, true, 30, now(), now()),
        new CalendarNotification(2, 1, 2, false, 15, now(), now())
    ));

    private final List<Message> messages = new CopyOnWriteArrayList<>(List.of(
        new Message(1, 2, 1, "파티 모집 관련 문의", "카멘 3관문 모집 관련해서 일정 다시 확인 부탁드립니다.", false, false, false, now()),
        new Message(2, 1, 3, "정보 공유 감사합니다", "베른 남부 내용 잘 확인했습니다. 참고하겠습니다.", true, false, false, now())
    ));

    public Optional<User> findUserByEmail(String email) {
        return users.stream().filter(user -> user.email().equalsIgnoreCase(email)).findFirst();
    }

    public Optional<User> findUserById(long id) {
        return users.stream().filter(user -> user.id() == id).findFirst();
    }

    public User createUser(RegisterRequest request) {
        long id = userSeq.getAndIncrement();
        User user = new User(id, request.email(), request.password(), request.nickname(), "local", null, "ROLE_USER", now(), now());
        users.add(user);
        profiles.add(new UserProfile(profileSeq.getAndIncrement(), id, request.mainCharacterName(), "아제나", "슬레이어", 0, "", "", now(), now()));
        return user;
    }

    public UserProfile findProfileByUserId(long userId) {
        return profiles.stream().filter(profile -> profile.userId() == userId).findFirst().orElse(null);
    }

    public UserProfile updateProfile(long userId, UpdateProfileRequest request) {
        UserProfile current = findProfileByUserId(userId);
        if (current == null) {
            current = new UserProfile(profileSeq.getAndIncrement(), userId, "LoaHub", "아제나", "슬레이어", 0, "", "", now(), now());
            profiles.add(current);
        }

        UserProfile currentProfile = current;
        UserProfile updated = new UserProfile(
            currentProfile.id(),
            currentProfile.userId(),
            currentProfile.mainCharacterName(),
            currentProfile.serverName(),
            currentProfile.characterClass(),
            currentProfile.itemLevel(),
            currentProfile.characterImage(),
            request.bio() == null || request.bio().isBlank() ? currentProfile.bio() : request.bio(),
            currentProfile.createdAt(),
            now()
        );
        profiles.replaceAll(profile -> profile.id() == currentProfile.id() ? updated : profile);
        return updated;
    }

    public UserProfile updateMainCharacter(long userId, MainCharacterRequest request) {
        Character selected = characters.stream()
            .filter(character -> character.userId() == userId && character.characterName().equalsIgnoreCase(request.characterName()))
            .findFirst()
            .orElse(null);

        if (selected == null) {
            return findProfileByUserId(userId);
        }

        characters.replaceAll(character -> character.userId() == userId
            ? new Character(
                character.id(),
                character.userId(),
                character.characterName(),
                character.serverName(),
                character.characterClass(),
                character.itemLevel(),
                character.characterImage(),
                character.id() == selected.id(),
                character.createdAt()
            )
            : character);

        UserProfile current = findProfileByUserId(userId);
        UserProfile updated = new UserProfile(
            current.id(),
            current.userId(),
            selected.characterName(),
            selected.serverName(),
            selected.characterClass(),
            selected.itemLevel(),
            selected.characterImage(),
            current.bio(),
            current.createdAt(),
            now()
        );
        profiles.replaceAll(profile -> profile.id() == current.id() ? updated : profile);
        return updated;
    }

    public List<Character> searchCharacters(String name) {
        String keyword = name == null ? "" : name.trim().toLowerCase();
        if (keyword.isBlank()) {
            return List.copyOf(characters);
        }
        return characters.stream()
            .filter(character -> character.characterName().toLowerCase().contains(keyword)
                || character.serverName().toLowerCase().contains(keyword)
                || character.characterClass().toLowerCase().contains(keyword))
            .collect(Collectors.toList());
    }

    public List<Character> findCharactersByUserId(long userId) {
        return characters.stream().filter(character -> character.userId() == userId).collect(Collectors.toList());
    }

    public Character createCharacter(long userId, CharacterSaveRequest request) {
        Character character = new Character(
            characterSeq.getAndIncrement(),
            userId,
            request.characterName(),
            request.serverName(),
            request.characterClass(),
            request.itemLevel(),
            request.characterImage() == null ? "" : request.characterImage(),
            request.main(),
            now()
        );
        if (request.main()) {
            characters.replaceAll(item -> item.userId() == userId
                ? new Character(item.id(), item.userId(), item.characterName(), item.serverName(), item.characterClass(), item.itemLevel(), item.characterImage(), false, item.createdAt())
                : item);
        }
        characters.add(character);
        return character;
    }

    public boolean deleteCharacter(long id) {
        return characters.removeIf(character -> character.id() == id);
    }

    public List<Board> findBoards() {
        return List.copyOf(boards);
    }

    public List<Post> findPosts() {
        return List.copyOf(posts);
    }

    public Optional<Post> findPostById(long id) {
        return posts.stream().filter(post -> post.id() == id).findFirst();
    }

    public Optional<Character> findCharacterById(long id) {
        return characters.stream().filter(character -> character.id() == id).findFirst();
    }

    public Post createPost(long userId, String author, PostRequest request) {
        Post post = new Post(
            postSeq.getAndIncrement(),
            request.boardId() == 0 ? 1 : request.boardId(),
            userId,
            request.title(),
            request.content(),
            0,
            0,
            0,
            author,
            request.className() == null || request.className().isBlank() ? "자유" : request.className(),
            false,
            false,
            List.of("신규"),
            now(),
            now()
        );
        posts.add(post);
        return post;
    }

    public Post updatePost(long id, PostRequest request) {
        Post current = findPostById(id).orElseThrow();
        Post updated = new Post(
            current.id(),
            request.boardId() == 0 ? current.boardId() : request.boardId(),
            current.userId(),
            request.title() == null || request.title().isBlank() ? current.title() : request.title(),
            request.content() == null || request.content().isBlank() ? current.content() : request.content(),
            current.viewCount(),
            current.likeCount(),
            current.commentCount(),
            current.author(),
            request.className() == null || request.className().isBlank() ? current.className() : request.className(),
            current.deletedYn(),
            current.pinned(),
            current.tags(),
            current.createdAt(),
            now()
        );
        posts.replaceAll(post -> post.id() == id ? updated : post);
        return updated;
    }

    public boolean deletePost(long id) {
        return posts.removeIf(post -> post.id() == id);
    }

    public Post increaseViewCount(long id) {
        Post current = findPostById(id).orElseThrow();
        Post updated = new Post(
            current.id(),
            current.boardId(),
            current.userId(),
            current.title(),
            current.content(),
            current.viewCount() + 1,
            current.likeCount(),
            current.commentCount(),
            current.author(),
            current.className(),
            current.deletedYn(),
            current.pinned(),
            current.tags(),
            current.createdAt(),
            now()
        );
        posts.replaceAll(post -> post.id() == id ? updated : post);
        return updated;
    }

    public Post likePost(long id, boolean like) {
        Post current = findPostById(id).orElseThrow();
        long nextLike = like ? current.likeCount() + 1 : Math.max(0, current.likeCount() - 1);
        Post updated = new Post(
            current.id(),
            current.boardId(),
            current.userId(),
            current.title(),
            current.content(),
            current.viewCount(),
            nextLike,
            current.commentCount(),
            current.author(),
            current.className(),
            current.deletedYn(),
            current.pinned(),
            current.tags(),
            current.createdAt(),
            now()
        );
        posts.replaceAll(post -> post.id() == id ? updated : post);
        return updated;
    }

    public List<Comment> findCommentsByPostId(long postId) {
        return comments.stream().filter(comment -> comment.postId() == postId && !comment.deletedYn()).collect(Collectors.toList());
    }

    public Comment createComment(long postId, long userId, String author, String content) {
        Comment comment = new Comment(commentSeq.getAndIncrement(), postId, userId, content, author, false, now(), now());
        comments.add(comment);
        increaseCommentCount(postId, 1);
        return comment;
    }

    public boolean deleteComment(long id) {
        Optional<Comment> current = comments.stream().filter(comment -> comment.id() == id).findFirst();
        current.ifPresent(comment -> increaseCommentCount(comment.postId(), -1));
        return comments.removeIf(comment -> comment.id() == id);
    }

    public Optional<Comment> findCommentById(long id) {
        return comments.stream().filter(comment -> comment.id() == id).findFirst();
    }

    private void increaseCommentCount(long postId, int delta) {
        posts.replaceAll(post -> post.id() == postId
            ? new Post(post.id(), post.boardId(), post.userId(), post.title(), post.content(), post.viewCount(), post.likeCount(), Math.max(0, post.commentCount() + delta), post.author(), post.className(), post.deletedYn(), post.pinned(), post.tags(), post.createdAt(), now())
            : post);
    }

    public List<CalendarContent> findCalendarContents() {
        return List.copyOf(calendarContents);
    }

    public List<CalendarNotification> findNotificationsByUserId(long userId) {
        return notifications.stream().filter(notification -> notification.userId() == userId).collect(Collectors.toList());
    }

    public CalendarNotification upsertNotification(long userId, NotificationRequest request) {
        CalendarNotification current = notifications.stream()
            .filter(notification -> notification.userId() == userId && notification.contentId() == request.contentId())
            .findFirst()
            .orElse(null);

        CalendarNotification updated = new CalendarNotification(
            current == null ? notificationSeq.getAndIncrement() : current.id(),
            userId,
            request.contentId(),
            request.enabled(),
            request.notifyBeforeMinutes(),
            current == null ? now() : current.createdAt(),
            now()
        );

        if (current == null) {
            notifications.add(updated);
        } else {
            notifications.replaceAll(notification -> notification.id() == current.id() ? updated : notification);
        }
        return updated;
    }

    public List<Message> findInbox(long userId) {
        return messages.stream()
            .filter(message -> message.receiverId() == userId && !message.deletedByReceiver())
            .collect(Collectors.toList());
    }

    public List<Message> findSent(long userId) {
        return messages.stream()
            .filter(message -> message.senderId() == userId && !message.deletedBySender())
            .collect(Collectors.toList());
    }

    public Optional<Message> findMessageById(long id) {
        return messages.stream().filter(message -> message.id() == id).findFirst();
    }

    public Message sendMessage(long senderId, MessageRequest request) {
        Message message = new Message(messageSeq.getAndIncrement(), senderId, request.receiverId(), request.title(), request.content(), false, false, false, now());
        messages.add(message);
        return message;
    }

    public boolean deleteMessage(long messageId, long userId) {
        Message current = findMessageById(messageId).orElse(null);
        if (current == null) {
            return false;
        }
        Message updated = new Message(
            current.id(),
            current.senderId(),
            current.receiverId(),
            current.title(),
            current.content(),
            current.isRead(),
            current.deletedBySender() || current.senderId() == userId,
            current.deletedByReceiver() || current.receiverId() == userId,
            current.createdAt()
        );
        messages.replaceAll(message -> message.id() == messageId ? updated : message);
        return true;
    }

    public Message markMessageRead(long messageId, long userId) {
        Message current = findMessageById(messageId).orElseThrow();
        if (current.senderId() != userId && current.receiverId() != userId) {
            throw new IllegalStateException("본인 쪽지만 확인할 수 있습니다.");
        }
        Message updated = new Message(current.id(), current.senderId(), current.receiverId(), current.title(), current.content(), true, current.deletedBySender(), current.deletedByReceiver(), current.createdAt());
        messages.replaceAll(message -> message.id() == messageId ? updated : message);
        return updated;
    }

    public List<User> findUsers() {
        return List.copyOf(users);
    }

    public void updateUserNickname(long userId, UpdateProfileRequest request) {
        users.replaceAll(user -> user.id() == userId
            ? new User(user.id(), user.email(), user.password(), request.nickname() == null || request.nickname().isBlank() ? user.nickname() : request.nickname(), user.provider(), user.providerId(), user.role(), user.createdAt(), now())
            : user);
    }

    private static OffsetDateTime now() {
        return OffsetDateTime.now();
    }

    public List<Board> findBoardsByType(String boardType) {
        return boards.stream().filter(board -> board.boardType().equalsIgnoreCase(boardType)).collect(Collectors.toList());
    }

    public List<Post> findPostsByBoardId(long boardId) {
        return posts.stream().filter(post -> post.boardId() == boardId && !post.deletedYn()).collect(Collectors.toList());
    }

    private boolean isCurrentMerchant(String spawnTime, LocalTime currentTime) {
        if (spawnTime == null || spawnTime.isBlank()) {
            return false;
        }

        String[] parts = spawnTime.split("~");
        if (parts.length != 2) {
            return false;
        }

        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("H:mm");
            LocalTime start = LocalTime.parse(parts[0].trim(), formatter);
            LocalTime end = LocalTime.parse(parts[1].trim(), formatter);

            if (start.equals(end)) {
                return true;
            }

            if (start.isBefore(end)) {
                return !currentTime.isBefore(start) && !currentTime.isAfter(end);
            }

            return !currentTime.isBefore(start) || !currentTime.isAfter(end);
        } catch (Exception exception) {
            return false;
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.KOREA);
    }
}
