# LoaHub

LoaHub는 로스트아크 유저를 위한 커뮤니티 웹서비스입니다.  
신입 개발자 포트폴리오 제출을 목표로, 캐릭터 검색과 커뮤니티, 캘린더, 떠돌이상인, 쪽지 기능을 카드형 다크 UI로 구성했습니다.

## 프로젝트 소개

- 로스트아크 캐릭터 검색
- 대표 캐릭터 기반 회원 프로필
- 자유게시판 / 직업별 게시판
- 캘린더 콘텐츠 알림 UI
- 떠돌이상인 정보
- 쪽지 기능
- 디스코드 로그인 구조
- 반응형 커뮤니티 UI

프론트엔드는 Vite + React 기반이며, 백엔드는 Spring Boot + MyBatis + PostgreSQL 구조로 설계했습니다.  
현재 구현은 프론트 mock 데이터와 백엔드 mock 저장소를 함께 제공해, 환경변수가 없어도 화면과 API 흐름을 확인할 수 있게 구성했습니다.

## 주요 기능

### 회원 기능

- 기본 회원가입
- 기본 로그인
- 로그아웃
- JWT 기반 인증 구조
- 디스코드 OAuth 로그인 구조
- 대표 캐릭터 설정
- 내 프로필 조회 및 수정

### 캐릭터 검색

- Lost Ark API 프록시 구조
- 캐릭터명 검색
- 서버 / 직업 / 아이템 레벨 조회
- 대표 캐릭터 등록

### 게시판

- 자유게시판
- 직업별 게시판
- 게시글 목록 / 상세 / 작성 / 수정 / 삭제
- 좋아요 / 댓글

### 캘린더

- 오늘 콘텐츠
- 이번 주 콘텐츠
- 알림 설정 UI

### 떠돌이상인

- 지역별 정보
- 등장 시간
- 판매 아이템
- 즐겨찾기

### 쪽지

- 받은 쪽지함
- 보낸 쪽지함
- 상세 보기
- 읽음 처리

## 기술 스택

### Frontend

- React
- HTML
- CSS
- JavaScript
- Vite
- React Router
- Axios

### Backend

- Java 17
- Spring Boot
- REST API
- MyBatis
- PostgreSQL

### Database

- Supabase PostgreSQL

## 화면 구성

- `/` 홈
- `/login` 로그인
- `/register` 회원가입
- `/character-search` 캐릭터 검색
- `/boards/free` 자유게시판
- `/boards/class` 직업별 게시판
- `/boards/class/:className` 직업별 게시판 상세
- `/posts/:postId` 게시글 상세
- `/write` 글쓰기
- `/calendar` 캘린더
- `/merchant` 떠돌이상인
- `/messages` 쪽지함
- `/messages/:messageId` 쪽지 상세
- `/profile` 내 프로필

## ERD 요약

필수 테이블을 PostgreSQL 기준으로 구성했습니다.

- `users`
- `user_profiles`
- `characters`
- `boards`
- `posts`
- `comments`
- `post_likes`
- `calendar_contents`
- `calendar_notifications`
- `wandering_merchants`
- `merchant_favorites`
- `messages`

자세한 SQL은 [backend/src/main/resources/schema.sql](backend/src/main/resources/schema.sql)에서 확인할 수 있습니다.

## API 명세 요약

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/auth/discord`
- `GET /api/auth/discord/callback`

### User

- `GET /api/users/me`
- `PUT /api/users/me`
- `POST /api/users/me/main-character`

### Character

- `GET /api/characters/search?name=`
- `GET /api/characters/me`
- `POST /api/characters`
- `DELETE /api/characters/{id}`

### Board / Post

- `GET /api/boards`
- `GET /api/posts`
- `GET /api/posts/{id}`
- `POST /api/posts`
- `PUT /api/posts/{id}`
- `DELETE /api/posts/{id}`
- `POST /api/posts/{id}/like`
- `DELETE /api/posts/{id}/like`

### Comment

- `GET /api/posts/{postId}/comments`
- `POST /api/posts/{postId}/comments`
- `DELETE /api/comments/{commentId}`

### Calendar

- `GET /api/calendar/today`
- `GET /api/calendar/week`
- `GET /api/calendar/notifications`
- `POST /api/calendar/notifications`
- `PUT /api/calendar/notifications/{id}`

### Merchant

- `GET /api/merchants`
- `GET /api/merchants/favorites`
- `POST /api/merchants/{id}/favorite`
- `DELETE /api/merchants/{id}/favorite`

### Message

- `GET /api/messages/inbox`
- `GET /api/messages/sent`
- `GET /api/messages/{id}`
- `POST /api/messages`
- `DELETE /api/messages/{id}`

## 실행 방법

### Frontend

```bash
cd frontend
npm install
npm run dev
```

빌드:

```bash
cd frontend
npm run build
```

### Backend

Maven이 설치되어 있다면:

```bash
cd backend
mvn spring-boot:run
```

패키징:

```bash
cd backend
mvn clean package
```

## 환경변수 설정 방법

### Frontend

`frontend/.env.example`

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK_API=true
```

### Backend

`backend/src/main/resources/application.yml.example`

```yml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USER}
    password: ${DB_PASSWORD}
```

필요한 값:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `LOSTARK_API_KEY`
- `LOSTARK_API_BASE_URL`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI`

## 배포 구조

- 프론트엔드: Vercel 기준 배포
- 백엔드: Render 또는 별도 Java 서버 배포
- DB: Supabase PostgreSQL
- 환경변수는 코드에 직접 넣지 않고 배포 환경에서 주입

## 포트폴리오 어필 포인트

- 게임 Open API를 활용한 캐릭터 검색 기능
- 대표 캐릭터 기반 커뮤니티 프로필
- 게시판 / 댓글 / 좋아요 CRUD
- 캘린더 콘텐츠 알림 구조
- 떠돌이상인 정보 제공
- 쪽지 기능
- React + Spring Boot + MyBatis + PostgreSQL 연동
- Vercel 배포 대응
- 환경변수 기반 보안 설정

## 비고

- 프론트엔드는 mock 데이터와 함께 동작합니다.
- 백엔드는 PostgreSQL 스키마와 API 구조를 제공하며, 실제 DB 연결은 환경변수 설정 후 사용합니다.
