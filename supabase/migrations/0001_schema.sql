-- The Forgotten — core schema
-- Run in the Supabase SQL editor (or `supabase db push`). Safe to read top to bottom.
--
-- Security model
--   * The public (anon) can only READ approved stories, through the
--     published_stories / published_photos views, which expose no private
--     fields (contributor email, guardian info, consent files, notes).
--   * Nobody writes from the browser. Submissions go through the site's
--     server, which validates them and inserts with the service-role key.
--   * Signed-in admins (listed in public.admins) can read and edit everything.

create extension if not exists pgcrypto;

-- ---------- Types ----------
create type story_status as enum ('pending', 'approved', 'rejected', 'withdrawn');
create type subject_type as enum ('veteran', 'senior', 'other');
create type story_format as enum ('written', 'interview', 'photo_essay');
create type age_group as enum ('13-17', '18+');

-- ---------- Admins ----------
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- Themes (used by the archive filters) ----------
create table public.themes (
  slug text primary key,
  label text not null,
  sort_order int not null default 0
);

insert into public.themes (slug, label, sort_order) values
  ('service',        'Service & sacrifice', 1),
  ('homelessness',   'Homelessness',        2),
  ('isolation',      'Isolation & aging',   3),
  ('family',         'Family',              4),
  ('resilience',     'Resilience',          5),
  ('work',           'Work & craft',        6),
  ('community',      'Community',           7),
  ('faith',          'Faith & meaning',     8),
  ('memory',         'Memory & history',    9),
  ('health',         'Health & recovery',  10);

-- ---------- Stories ----------
create table public.stories (
  id                     uuid primary key default gen_random_uuid(),
  slug                   text unique,                       -- set on approval
  status                 story_status not null default 'pending',
  featured               boolean not null default false,

  -- The story
  title                  text not null check (char_length(title) between 3 and 140),
  summary                text not null check (char_length(summary) between 20 and 400),
  body                   text not null check (char_length(body) between 200 and 20000),
  pull_quote             text check (char_length(pull_quote) <= 280),
  format                 story_format not null default 'written',
  themes                 text[] not null default '{}',

  -- The person whose story it is
  subject_display_name   text not null check (char_length(subject_display_name) between 1 and 80),
  subject_type           subject_type not null,
  subject_type_other     text,
  service_branch         text,
  service_era            text,

  -- Where (general area only, never an exact location)
  city                   text,
  region                 text not null,                      -- state / province
  country                text not null default 'United States',

  -- How the interview happened (safety)
  interview_setting      text not null check (interview_setting in ('public_place', 'supervised', 'partner_org', 'family_member', 'other')),
  partner_org            text,

  -- The teen contributor (private)
  contributor_name       text not null,
  contributor_credit     text not null,                      -- how they're credited publicly, e.g. "Maya R."
  contributor_email      text not null,
  contributor_school     text,
  contributor_age_group  age_group not null,
  guardian_name          text,
  guardian_email         text,
  guardian_approved      boolean not null default false,

  -- Consent from the person interviewed (private)
  consent_signed_by      text not null,
  consent_signed_on      date not null,
  consent_file_path      text not null,                      -- in the private consent-forms bucket
  consent_real_name      boolean not null default false,     -- may we use their real first name?
  consent_photos         boolean not null default false,
  consent_book           boolean not null default false,     -- may it appear in the coffee table book?

  -- Review
  reviewer_notes         text,
  reviewed_by            uuid references auth.users (id),
  reviewed_at            timestamptz,
  published_at           timestamptz,
  withdrawn_at           timestamptz,

  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  constraint minors_need_guardian check (
    contributor_age_group = '18+'
    or (guardian_name is not null and guardian_email is not null and guardian_approved)
  ),
  constraint approved_has_slug check (status <> 'approved' or slug is not null)
);

create index stories_status_idx on public.stories (status, published_at desc);
create index stories_themes_idx on public.stories using gin (themes);
create index stories_region_idx on public.stories (country, region);

-- ---------- Photos ----------
create table public.story_photos (
  id            uuid primary key default gen_random_uuid(),
  story_id      uuid not null references public.stories (id) on delete cascade,
  storage_path  text not null,                                -- in the private story-photos bucket
  caption       text check (char_length(caption) <= 300),
  alt_text      text check (char_length(alt_text) <= 300),
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);
create index story_photos_story_idx on public.story_photos (story_id, sort_order);

-- ---------- Contributor sign-ups (Get Involved) ----------
create table public.contributor_signups (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  email          text not null,
  age_group      age_group not null,
  school         text,
  city           text,
  region         text,
  country        text default 'United States',
  guardian_email text,
  interests      text[] not null default '{}',
  message        text check (char_length(message) <= 2000),
  handled        boolean not null default false,
  created_at     timestamptz not null default now(),
  constraint minors_need_guardian_email check (age_group = '18+' or guardian_email is not null)
);

-- ---------- Withdrawal requests ----------
create table public.withdrawal_requests (
  id               uuid primary key default gen_random_uuid(),
  story_id         uuid references public.stories (id) on delete set null,
  story_reference  text not null,                    -- title or link as typed by the requester
  requester_name   text not null,
  requester_email  text not null,
  relationship     text not null check (relationship in ('subject', 'family', 'contributor', 'other')),
  reason           text check (char_length(reason) <= 2000),
  status           text not null default 'open' check (status in ('open', 'done', 'declined')),
  created_at       timestamptz not null default now(),
  resolved_at      timestamptz
);

-- ---------- updated_at ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger stories_touch before update on public.stories
  for each row execute function public.touch_updated_at();

-- ---------- Public views (only safe columns, only approved stories) ----------
create view public.published_stories as
  select id, slug, featured, title, summary, body, pull_quote, format, themes,
         subject_display_name, subject_type, subject_type_other, service_branch, service_era,
         city, region, country, contributor_credit, contributor_school,
         consent_photos, published_at
  from public.stories
  where status = 'approved';

create view public.published_photos as
  select p.id, p.story_id, p.storage_path, p.caption, p.alt_text, p.sort_order
  from public.story_photos p
  join public.stories s on s.id = p.story_id
  where s.status = 'approved' and s.consent_photos;

-- ---------- Row level security ----------
alter table public.admins               enable row level security;
alter table public.themes               enable row level security;
alter table public.stories              enable row level security;
alter table public.story_photos         enable row level security;
alter table public.contributor_signups  enable row level security;
alter table public.withdrawal_requests  enable row level security;

-- Themes: everyone can read.
create policy themes_read on public.themes for select using (true);

-- Admin-only access to everything private.
create policy admins_self on public.admins for select to authenticated using (user_id = auth.uid());
create policy stories_admin on public.stories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy photos_admin on public.story_photos for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy signups_admin on public.contributor_signups for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy withdrawals_admin on public.withdrawal_requests for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Grants: anon/authenticated get the views + themes; base tables only via RLS above.
revoke all on public.stories, public.story_photos, public.contributor_signups,
              public.withdrawal_requests, public.admins from anon;
grant select on public.published_stories, public.published_photos, public.themes to anon, authenticated;
