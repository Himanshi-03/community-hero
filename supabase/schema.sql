-- ============================================
-- COMMUNITY HERO - DATABASE SCHEMA
-- Run this in Supabase: Project > SQL Editor > New Query > paste all > Run
-- ============================================

-- 1. PROFILES TABLE
-- Stores extra info about each user (Supabase Auth already stores email/password)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  created_at timestamp with time zone default now()
);

-- Automatically create a profile row whenever someone signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. REPORTS TABLE
-- This is the core table - one row per reported issue
create table reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,

  -- What the user submitted
  image_url text not null,
  note text,
  latitude double precision not null,
  longitude double precision not null,

  -- What the AI fills in
  category text not null default 'uncategorized', -- pothole | streetlight | garbage | water_leak | other
  severity text not null default 'medium',          -- low | medium | high
  ai_description text,

  -- Status pipeline
  status text not null default 'reported',          -- reported | verified | in_progress | resolved
  confirmation_count integer not null default 0,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Index to make map queries (and "recent reports") fast
create index reports_created_at_idx on reports (created_at desc);
create index reports_status_idx on reports (status);


-- 3. CONFIRMATIONS TABLE
-- One row per (user, report) - prevents the same user confirming twice
create table confirmations (
  id uuid default gen_random_uuid() primary key,
  report_id uuid references reports on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique (report_id, user_id) -- this line is what blocks duplicate confirmations
);

-- When a confirmation is added, bump the counter on the report
-- and auto-flip status from "reported" to "verified" after 3 confirmations
create function public.handle_new_confirmation()
returns trigger as $$
begin
  update reports
  set confirmation_count = confirmation_count + 1,
      status = case
        when status = 'reported' and confirmation_count + 1 >= 3 then 'verified'
        else status
      end,
      updated_at = now()
  where id = new.report_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_confirmation_created
  after insert on confirmations
  for each row execute procedure public.handle_new_confirmation();


-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- This controls who can read/write what. Without this, anyone could
-- edit anyone else's data directly through the API.
-- ============================================

alter table profiles enable row level security;
alter table reports enable row level security;
alter table confirmations enable row level security;

-- Profiles: anyone can view, only the owner can edit their own
create policy "Profiles are viewable by everyone"
  on profiles for select using (true);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Reports: anyone can view (it's a public civic platform), only logged-in users can create,
-- only the original reporter can update their own report's basic fields
create policy "Reports are viewable by everyone"
  on reports for select using (true);
create policy "Authenticated users can create reports"
  on reports for insert with check (auth.uid() = user_id);
create policy "Owners can update own reports"
  on reports for update using (auth.uid() = user_id);

-- Confirmations: anyone can view counts, only logged-in users can confirm,
-- and only as themselves (can't confirm pretending to be someone else)
create policy "Confirmations are viewable by everyone"
  on confirmations for select using (true);
create policy "Authenticated users can confirm"
  on confirmations for insert with check (auth.uid() = user_id);
