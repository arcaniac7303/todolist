-- Supabase SQL Editor에서 실행하세요.
-- 카카오 로그인 연동 후, 로그인한 사용자만 자신의 메모에 접근합니다.

-- 기존 공개 정책/테이블이 있다면 제거 (최초 1회)
drop policy if exists "todos_select_anon" on public.todos;
drop policy if exists "todos_insert_anon" on public.todos;
drop policy if exists "todos_update_anon" on public.todos;
drop policy if exists "todos_delete_anon" on public.todos;
drop policy if exists "todos_select_own" on public.todos;
drop policy if exists "todos_insert_own" on public.todos;
drop policy if exists "todos_update_own" on public.todos;
drop policy if exists "todos_delete_own" on public.todos;

drop table if exists public.todos;

create table public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  text text not null check (char_length(text) <= 60),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index todos_user_id_created_at_idx
  on public.todos (user_id, created_at desc);

alter table public.todos enable row level security;

-- 본인 메모만 조회
create policy "todos_select_own"
  on public.todos
  for select
  to authenticated
  using (auth.uid() = user_id);

-- 본인 메모만 추가 (user_id는 반드시 로그인 사용자와 일치)
create policy "todos_insert_own"
  on public.todos
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 본인 메모만 수정
create policy "todos_update_own"
  on public.todos
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 본인 메모만 삭제
create policy "todos_delete_own"
  on public.todos
  for delete
  to authenticated
  using (auth.uid() = user_id);
