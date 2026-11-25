-- Private storage buckets. Nothing here is publicly readable:
-- the site's server hands out short-lived signed links for photos of
-- approved stories, and consent forms are only ever opened by admins.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('story-photos',  'story-photos',  false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic']),
  ('consent-forms', 'consent-forms', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png', 'image/heic'])
on conflict (id) do nothing;

-- Admins can read files in both buckets from the dashboard.
create policy "admins read story photos" on storage.objects
  for select to authenticated using (bucket_id = 'story-photos' and public.is_admin());

create policy "admins read consent forms" on storage.objects
  for select to authenticated using (bucket_id = 'consent-forms' and public.is_admin());

-- Uploads from the submission form use one-time signed upload URLs
-- created by the server, so no insert policy for anon is needed.
