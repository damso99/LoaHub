-- Supabase Cron 설정
-- 1. pg_cron / pg_net extension 활성화
-- 2. Edge Function 배포 후 이 SQL 실행
-- 3. cron.schedule 등록

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'sync-lostark-calendar-weekly',
  '0 21 * * 2',
  $$
    select
      net.http_post(
        url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/sync-lostark-calendar',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer YOUR_EDGE_FUNCTION_SECRET'
        ),
        body := '{}'::jsonb
      );
  $$
);
