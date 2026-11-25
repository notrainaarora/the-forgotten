# The Forgotten — website & story database

**theforgotten.site** · A youth-led storytelling, advocacy & philanthropic initiative.
*Listen. Document. Share.*

The site is built with Next.js, uses Supabase for the database, photo storage and admin login, and is hosted on Vercel. All three have free tiers that cover a project this size.

## What's included

| Page | What it does |
|---|---|
| `/` | Home: mission, the three phases, featured stories, principles, vision |
| `/stories` | The archive, with search and filters by subject (veteran/senior/other), theme, and region |
| `/stories/[slug]` | A single story: narrative, pull quote, photos, and links to resources |
| `/share` | Submission form: contributor info, guardian approval for under-18s, the person's details, consent upload, the story itself, photos |
| `/get-involved` | Contributor sign-up, the interview & safety guide, and nonprofit resources |
| `/consent-form` | Printable consent form |
| `/withdraw` | Lets the person in a story, their family, or the contributor ask for a change or removal |
| `/about`, `/privacy` | About the project; privacy notice |
| `/admin` | **Owner dashboard** (team only): overview, charts, activity |
| `/admin/review` | Review queue: open, edit, approve, feature, take down |
| `/admin/inbox` | Withdrawal requests |
| `/admin/contributors` | Every contributor and sign-up, with contact info *(owner only)* |
| `/admin/team` | Invite reviewers, change roles *(owner only)* |
| `/admin/activity`, `/admin/exports` | Full activity log and spreadsheet downloads *(owner only)* |

### Roles
- **Owner** sees and does everything: all stories, contributor contact lists, sign-ups, downloads, permanent deletion, and the team.
- **Reviewer** (e.g. Raina, or a teacher helping) can review, edit, approve, feature and take down stories, and handle withdrawal requests. They can't see the sign-up list, download data, delete stories, or manage the team.

### How a story moves through the site
1. A teen submits it at `/share`. Files go straight into **private** storage.
2. It's saved as **pending**. Nothing is public yet.
3. A reviewer signs in at `/admin`, opens the signed consent form, edits if needed, and clicks **Approve & publish**.
4. The story appears in the archive. Photos are shown only if the person agreed to photos.
5. If anyone asks for removal, it shows up in the Inbox, and **Take story down** removes it from the site right away.

### Privacy & safety built in
- The public can only read approved stories, through database views that leave out every private field (emails, guardian info, consent forms, notes). This is enforced in the database itself, not just in the website code.
- Photos and consent forms sit in private storage buckets. Photos are served through short-lived links; consent forms are visible only to admins.
- Contributors must be 13+. Under-18s must give a parent/guardian's name and email and confirm the guardian approved (the database rejects a minor's submission without it).
- Only general locations (city/state) are collected.
- Admin login uses one-time email links, and only people you've invited can sign in.

## Running it on your computer

```bash
npm install
npm run dev     # open http://localhost:3000
```

With no `.env.local` file, the site runs in **preview mode**: invented sample stories, forms that check your input but don't save, and a read-only demo admin dashboard.

## Going live (one-time setup, about 30 minutes)

### 1. Supabase (database)
1. Create a free account at supabase.com and a **New project** (name: `the-forgotten`, region: West US). Save the database password somewhere safe.
2. Open **SQL Editor** and run, in order: `supabase/migrations/0001_schema.sql`, `0002_storage.sql`, `0003_roles_activity.sql`.
3. **Authentication → URL Configuration**: set Site URL to `https://theforgotten.site`, and add `https://theforgotten.site/auth/callback` and `https://theforgotten.site/auth/confirm` to Redirect URLs.
4. **Authentication → Email Templates → Invite user**: change the link to
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite`
5. **Authentication → Users → Invite user**: invite yourself. Then in the SQL Editor make yourself the owner:
   ```sql
   insert into public.admins (user_id, email, role, display_name)
   select id, email, 'owner', 'Ro' from auth.users where email = 'YOUR@EMAIL';
   ```
   After that, add everyone else (e.g. Raina as a reviewer) from **Dashboard → Review team**. No more SQL needed.
6. **Project Settings → API**: copy the Project URL, the `anon` public key, and the `service_role` key.
7. Recommended before launch: **Authentication → Emails → SMTP Settings**, and plug in Resend's SMTP details. Supabase's built-in email is rate-limited (a few per hour), which is fine for testing but too slow once a team is signing in.

### 2. Vercel (hosting)
1. Put this folder in a GitHub repository.
2. At vercel.com, **Add New → Project**, import the repo (framework: Next.js; defaults are fine).
3. Under **Environment Variables**, add the four values from `.env.example`. The `SUPABASE_SERVICE_ROLE_KEY` is a secret: never share it or put it in the browser.
4. Deploy.

### 3. Domain
1. In Vercel: **Project → Settings → Domains**, add `theforgotten.site` and `www.theforgotten.site`.
2. At your domain registrar, add the DNS records Vercel shows you (usually an `A` record for `@` and a `CNAME` for `www`). HTTPS is set up automatically.

## Editing common things
- **Contact email, founder name, motto**: `lib/constants.ts` (`SITE`)
- **Nonprofit resources list**: `lib/constants.ts` (`RESOURCES`)
- **Themes**: the `themes` table in Supabase (Table Editor), plus `DEFAULT_THEMES` in `lib/constants.ts` for preview mode
- **Colors & fonts**: the top of `app/globals.css`
- **Home page text and the "Already in motion" numbers**: `app/page.tsx`

### 4. Email alerts (recommended)
1. Create a free account at resend.com, add the domain `theforgotten.site`, and add the DNS records it shows you at your registrar.
2. Create an API key and set `RESEND_API_KEY` (and optionally `EMAIL_FROM`, `NOTIFY_EMAIL`) in Vercel.

What gets sent: owners get an email for each new submission and withdrawal request. Contributors (with their parent/guardian copied if under 18) get a "we received it" email, a "your story is live" email, and a welcome email when they sign up.

### 5. Spam protection (recommended)
In the Cloudflare dashboard → Turnstile, add a widget for `theforgotten.site`, then set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` in Vercel. The forms then show a quick, privacy-friendly "are you human" check.

## Launch checklist
- [ ] Database set up (steps above) and you can sign in at `/admin`
- [ ] Submit a test story with a test consent form, approve it, see it in the archive, then delete it
- [ ] Email alerts arrive (submission, confirmation, published)
- [ ] Turnstile check appears on the forms
- [ ] `theforgotten.site` loads over https
- [ ] An adult with legal experience has read the consent form and privacy page
- [ ] Raina added as a reviewer and has signed in once
- [ ] Share the link and check the preview card looks right in a text message

## Good next steps
- Instagram/social posting kit for approved stories (Phase 2)
- A printable "book draft" layout of book-ready stories (Phase 3); the Downloads page already exports their text
- Translations (e.g. Spanish) of the consent form and submission form
