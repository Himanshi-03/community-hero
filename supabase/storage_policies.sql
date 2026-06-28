-- ============================================
-- STORAGE POLICIES for the "report-images" bucket
-- Run this in Supabase: SQL Editor > New Query > paste > Run
-- ============================================

-- Allow any logged-in user to upload (INSERT) files into report-images
create policy "Authenticated users can upload report images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'report-images');

-- Allow anyone (even logged-out visitors) to view/download images
-- This is needed because we display images publicly on report cards and the map
create policy "Report images are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'report-images');
