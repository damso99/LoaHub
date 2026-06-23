# LoaHub 로스트아크 캘린더 Supabase 작업 가이드

이 문서는 로스트아크 캘린더 주간 캐시를 Supabase 기준으로 갱신하고 조회하는 절차를 정리한 것이다.

## 1. SQL 실행 순서

1. Supabase SQL Editor를 연다.
2. [`supabase/sql/lostark_calendar_tables.sql`](./sql/lostark_calendar_tables.sql)을 먼저 실행한다.
3. 테이블 생성이 끝나면 Edge Function을 배포한다.
4. 배포 후 [`supabase/sql/lostark_calendar_cron.sql`](./sql/lostark_calendar_cron.sql)을 실행해서 크론을 등록한다.

## 2. Secrets 등록

Edge Function이 사용할 값은 Supabase secrets로 넣는다.

```bash
supabase secrets set APP_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
supabase secrets set APP_SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
supabase secrets set LOSTARK_API_KEY=YOUR_LOSTARK_API_KEY
```

`LOSTARK_API_KEY` 실제 값은 절대 코드에 넣지 않는다.

## 3. Edge Function 배포

```bash
supabase functions deploy sync-lostark-calendar --no-verify-jwt
```

로컬에서 먼저 확인하려면:

```bash
supabase functions serve sync-lostark-calendar --env-file .env.local
```

## 4. Cron 등록

크론은 UTC 기준 화요일 21:00, 즉 KST 수요일 06:00에 실행한다.

- cron expression: `0 21 * * 2`
- 실행 대상: `sync-lostark-calendar`

[`supabase/sql/lostark_calendar_cron.sql`](./sql/lostark_calendar_cron.sql)을 SQL Editor에서 실행하면 된다.

## 5. 수동 테스트

Edge Function을 직접 호출한다.

```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/sync-lostark-calendar" \
  -H "Authorization: Bearer YOUR_EDGE_FUNCTION_SECRET" \
  -H "Content-Type: application/json" \
  -d "{}"
```

## 6. 로그 확인 SQL

```sql
select *
from public.lostark_calendar_sync_logs
order by started_at desc
limit 20;
```

활성 데이터만 확인하려면:

```sql
select *
from public.lostark_calendar_schedules
where is_active = true
order by start_date, slot_hhmm, category_name, start_time_kst;
```

## 7. 문제가 생겼을 때 확인할 항목

1. `LOSTARK_API_KEY`가 Supabase secrets에 등록되어 있는지 확인한다.
2. `APP_SUPABASE_SERVICE_ROLE_KEY`가 올바른지 확인한다.
3. Edge Function 로그에서 Lost Ark API 401/403/429/504 상태를 확인한다.
4. SQL Editor에서 `lostark_calendar_schedules`의 `is_active` 값이 실제로 바뀌었는지 확인한다.
5. `lostark_calendar_sync_logs`의 `status`, `message`, `error_message`를 확인한다.
6. 프론트 환경변수 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`가 배포 환경에 들어갔는지 확인한다.

## 8. 프론트 조회 원칙

- 프론트는 Lost Ark Open API를 직접 호출하지 않는다.
- 프론트는 Supabase의 `lostark_calendar_schedules`에서 `is_active = true` 데이터만 읽는다.
- 오늘 일정은 `start_date = 오늘(KST)`로 조회한다.
- 주간 일정은 `is_active = true` 전체를 조회한다.
