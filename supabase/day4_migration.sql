-- ============================================
-- DAY 4 FEATURES MIGRATION
-- Run this in Supabase: SQL Editor > New Query > paste > Run
-- ============================================

-- 1. Add new columns to reports
alter table reports
  add column if not exists is_emergency boolean not null default false,
  add column if not exists rating integer,
  add column if not exists feedback_text text;

-- Add a check constraint so rating can only be 1-5 (or null if not yet rated)
alter table reports
  add constraint rating_range check (rating is null or (rating >= 1 and rating <= 5));

-- 2. Update the status check - we're expanding from 4 stages to 6
-- (submitted, under_review, assigned, in_progress, resolved, closed)
-- Since status was just a free text column with a default, no migration
-- needed for existing rows - "reported" stays valid, we just start using
-- the new values for new status transitions going forward.

-- 3. Add is_admin flag to profiles, so we can build a simple admin dashboard
alter table profiles
  add column if not exists is_admin boolean not null default false;

-- 4. Index for the emergency flag, since the admin dashboard will sort by it
create index if not exists reports_is_emergency_idx on reports (is_emergency);

-- 6. Allow users to delete their own reports (needed for the "edit/delete
-- before review" feature). We restrict this in the app's UI to only show
-- the option while status is "submitted", but the DB-level policy itself
-- just checks ownership - the app enforces the status restriction.
create policy "Owners can delete own reports"
  on reports for delete
  using (auth.uid() = user_id);

-- 7. Allow admins to update ANY report (needed so the admin dashboard can
-- change status on reports they didn't submit themselves)
create policy "Admins can update any report"
  on reports for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

-- 8. Track exactly when a report was resolved, for accurate "average
-- resolution time" analytics (more precise than reusing updated_at, which
-- changes on every edit, not just resolution).
alter table reports
  add column if not exists resolved_at timestamp with time zone;

-- Automatically stamp resolved_at the moment status flips to "resolved"
create function public.handle_report_resolved()
returns trigger as $$
begin
  if new.status = 'resolved' and old.status != 'resolved' then
    new.resolved_at = now();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_report_resolved
  before update on reports
  for each row execute procedure public.handle_report_resolved();



