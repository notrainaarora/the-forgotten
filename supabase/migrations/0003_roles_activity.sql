-- Roles and an activity log for the owner's dashboard.
--
--   owner     sees and manages everything: all stories, contributor contact lists,
--             sign-ups, exports, and the review team.
--   reviewer  reviews stories (approve / edit / take down) and handles withdrawal
--             requests, but can't see sign-up lists, exports, or manage the team.

alter table public.admins
  add column role text not null default 'reviewer' check (role in ('owner', 'reviewer')),
  add column display_name text;

create or replace function public.is_owner()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid() and role = 'owner');
$$;

-- Sign-ups are contact lists, so only owners can read them directly.
drop policy if exists signups_admin on public.contributor_signups;
create policy signups_owner on public.contributor_signups
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- Owners can see the whole team.
create policy admins_owner_read on public.admins for select to authenticated using (public.is_owner());

-- ---------- Activity log ----------
create table public.activity_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid references auth.users (id) on delete set null,
  actor_email text,
  action      text not null,          -- e.g. story.submitted, story.approved, signup.created
  target_type text,                   -- story | signup | withdrawal | admin
  target_id   text,
  summary     text,                   -- short human-readable line
  created_at  timestamptz not null default now()
);
create index activity_log_created_idx on public.activity_log (created_at desc);

alter table public.activity_log enable row level security;
create policy activity_admin_read on public.activity_log for select to authenticated using (public.is_admin());
revoke all on public.activity_log from anon;
