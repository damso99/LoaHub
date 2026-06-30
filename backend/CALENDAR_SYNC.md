# 캘린더 동기화

내부 스케줄러 또는 GitHub Actions에서 아래 엔드포인트를 호출한다.

```bash
curl -X POST "https://loahub-backend.onrender.com/api/internal/calendar/sync" \
  -H "X-SCHEDULER-KEY: 실제키값"
```

- 성공: `200 OK`
- 실패: 키가 없거나 다르면 `401 Unauthorized`
- 응답: `baseDate`, `weekStartDate`, `weekEndDate`, `syncedAt` 포함
