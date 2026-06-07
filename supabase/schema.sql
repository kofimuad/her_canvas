-- ════════════════════════════════════════════════════════════════════
--  Her Canvas — Supabase schema
--  Run this in Supabase → SQL Editor. Covers all 5 epics / 33 stories.
--  Auth (US-030) is handled by Supabase Auth (email + Google) — no table
--  needed for that; we just extend it with a `profiles` row.
-- ════════════════════════════════════════════════════════════════════

-- ── EP-05: Profile & style profile (US-031..033) ──────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  aesthetics   text[] default '{}',          -- 3-5 style tags
  body_type    text,                          -- e.g. 'Slim & tall'
  dress_size   text,
  theme        text default 'blush',
  created_at   timestamptz default now()
);

-- ── EP-01: Mood boards (US-001..008) ──────────────────────────────────
create table if not exists mood_boards (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  vibe        text,
  category    text,
  description text,
  palette     jsonb,                          -- [{name,hex}]
  keywords    text[] default '{}',
  images      jsonb default '[]'::jsonb,       -- [{url,thumb,link,source,alt}]
  created_at  timestamptz default now()
);

-- ── EP-03: My Fits / lookbook (US-016..024) ───────────────────────────
create table if not exists fits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  image_url  text not null,
  storage_path text,                          -- path in the 'lookbook' bucket
  media_type text default 'image',            -- 'image' | 'video'
  title      text,
  occasion   text,                            -- shoot/date/casual/event/everyday
  aesthetic  text,                            -- mood/vibe label
  note       text,                            -- style-journal entry
  is_favourite boolean default false,
  board_id   uuid references mood_boards(id) on delete set null,  -- US-023 link
  created_at timestamptz default now()
);

-- ── EP-04: Shoot & event planning (US-025..029) ───────────────────────
create table if not exists shoot_plans (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  shoot_date date,
  location   text,
  notes      text,
  board_id   uuid references mood_boards(id) on delete set null,
  fit_id     uuid references fits(id) on delete set null,
  checklist  jsonb default '[]'::jsonb,        -- [{id,label,done}]
  is_complete boolean default false,          -- US-028
  created_at timestamptz default now()
);

-- ── Row Level Security: everyone only sees their own data ─────────────
alter table profiles            enable row level security;
alter table mood_boards         enable row level security;
alter table fits                enable row level security;
alter table shoot_plans         enable row level security;

create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own boards" on mood_boards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own fits" on fits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own shoots" on shoot_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Storage buckets for her uploads (run once) ────────────────────────
insert into storage.buckets (id, name, public)
values ('lookbook', 'lookbook', true), ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- ── Storage access policies ───────────────────────────────────────────
-- Anyone can VIEW (buckets are public); a signed-in user can upload/update/
-- delete only files inside their own folder (we save to "<user_id>/<file>").
drop policy if exists "media read" on storage.objects;
create policy "media read" on storage.objects
  for select using (bucket_id in ('lookbook', 'uploads'));

drop policy if exists "media insert" on storage.objects;
create policy "media insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('lookbook', 'uploads')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "media update" on storage.objects;
create policy "media update" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('lookbook', 'uploads')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "media delete" on storage.objects;
create policy "media delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('lookbook', 'uploads')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
