# LoaHub Frontend

`React + Vite` 기반 LoaHub 프론트엔드입니다.

## 실행

```bash
pnpm install
pnpm dev
```

## 빌드

```bash
pnpm build
```

## 환경 변수

`.env.example`을 참고해 로컬 환경 변수를 설정합니다.

### 로스트아크 캘린더 API

로컬 `.env`

```bash
VITE_LOSTARK_API_KEY=로스트아크_API_키
```

Vercel

- Project Settings -> Environment Variables
- Name: `VITE_LOSTARK_API_KEY`
- Value: 로스트아크 OpenAPI 키

주의: `VITE_` 접두사가 붙은 환경변수는 브라우저 번들에 노출될 수 있습니다. 운영 환경에서는 백엔드 프록시 방식이 더 안전합니다.
