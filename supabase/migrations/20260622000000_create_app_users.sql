-- Supabase SQL Editor 적용 방법
-- 1. Supabase 프로젝트에 접속
-- 2. SQL Editor를 열고 이 파일의 내용을 그대로 실행
-- 3. 또는 Supabase CLI를 사용하는 경우 migrations 폴더에 둔 뒤 `supabase db push`로 반영
--
-- 참고:
-- - `password`는 Spring Boot에서 BCrypt로 암호화한 값만 저장
-- - 백엔드 API 응답에는 `password`를 절대 포함하지 않도록 처리
-- - `email` / `nickname`은 UNIQUE 제약으로 검색용 인덱스를 이미 포함하므로 별도 인덱스 생성 불필요

create table if not exists public.app_users (
    user_id bigserial primary key,
    email varchar(100) not null unique,
    password varchar(255) not null,
    nickname varchar(50) not null unique,
    role varchar(20) not null default 'USER',
    provider varchar(20) not null default 'LOCAL',
    main_character_name varchar(50),
    created_at timestamptz not null default now(),
    updated_at timestamptz
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_app_users_set_updated_at on public.app_users;

create trigger trg_app_users_set_updated_at
before update on public.app_users
for each row
execute function public.set_updated_at();
