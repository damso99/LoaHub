# 캘린더 동기화

내부 스케줄러 또는 GitHub Actions에서 아래 엔드포인트를 호출한다.

```bash
curl -X POST "https://loahub-backend.onrender.com/api/internal/calendar/sync" \
  -H "X-SCHEDULER-KEY: 실제키값"

GitHub Actions 자동 실행:
- `.github/workflows/calendar-sync.yml`
- 매일 06:00 KST 기준으로 실행되도록 UTC `0 21 * * *` 크론을 사용
- 실행 시 `secrets.SCHEDULER_KEY`를 `X-SCHEDULER-KEY` 헤더로 전달
- 성공 응답 본문을 그대로 로그에 남겨 `baseDate`, `weekStartDate`, `weekEndDate`를 확인할 수 있음
```

- 성공: `200 OK`
- 실패: 키가 없거나 다르면 `401 Unauthorized`
- 응답: `baseDate`, `weekStartDate`, `weekEndDate`, `syncedAt` 포함
