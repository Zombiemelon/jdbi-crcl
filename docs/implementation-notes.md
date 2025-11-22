# Implementation Overview (crcl.)

## Environment
- `.env.local` required:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Restart `npm run dev` after changes.

## Supabase connectivity & auth
- Browser client lives in `lib/supabase/client.ts` (`createClient` with the anon key). It is only used inside client components/hooks for read-only calls scoped to the logged-in session.
- Route handlers use `getRouteHandlerSupabase()` from `lib/supabase/server.ts`, which wraps `createRouteHandlerClient` from `@supabase/auth-helpers-nextjs` to pull the session token out of `cookies()`. This enforces RLS automatically (`auth.uid()` resolves to the cookie’s user).
- Server-only mutations (signup provisioning, admin inserts/seeding) call `getServiceRoleSupabase()`, which instantiates a Supabase JS client with the `SUPABASE_SERVICE_ROLE_KEY` and disabled session persistence. This bypasses RLS, so it must stay server-side only.
- Authentication state flows through Supabase Auth: `POST /api/auth/login` sets the session cookie via helpers, `GET /api/auth/me` hydrates the profile, and middleware relies on `supabase.auth.getUser()` to gate routes.
- When debugging auth, use the Supabase CLI (`supabase projects api-keys ...`) to fetch the anon/service keys and `curl <project>.supabase.co/auth/v1/settings` to verify the current email-confirm/autoconfirm toggles.

## Supabase schema
- Core tables: `profiles`, `circles` (inner/outer), `circle_members`, `friends`.
- Added `questions` (author_id, text, visibility, created_at) with indexes on author and (visibility, created_at).
- RLS: users manage their own profiles/friends/circles; authors manage their own questions.
- Default circles seeded at signup.
- Schema file: `supabase/schema.sql`. Apply via `npx supabase db push --file supabase/schema.sql` (or psql).

## Auth + session handling
- API routes:
  - `POST /api/auth/signup` – service-role create user, seed profile + inner/outer circles.
  - `POST /api/auth/login` – email/password login, returns profile.
  - `GET /api/auth/me` – current user profile.
- Middleware `middleware.ts`: if session exists, redirect `/login`, `/signup`, `/auth/*` to `/profile`.
- Clients in `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (server/service role).

## Profile setup
- UI at `app/(onboarding)/profile-setup/page.tsx`: gradient layout, name input, interest chips, loads current profile, saves via `POST /api/profile`, then advances to `/circle-setup`. Skip button jumps to circle setup.
- API `POST /api/profile` updates name + interests for the signed-in user.

## Login & signup UI
- `/login`: form with zod validation, submits to `/api/auth/login`, redirects to `/feed`; link to `/signup`.
- `/signup`: form for name/email/password/interests, submits to `/api/auth/signup`, then `/profile-setup`.
- Uses lightweight UI components `components/ui/button.tsx` and `components/ui/input.tsx`.

## Ask Question
- UI at `app/(app)/ask/page.tsx`: choose inner/outer circle, enter question, submit via CTA (`RainbowButton` from `registry/magicui/rainbow-button`), shows errors/success. Auth-guarded (uses `/api/auth/me`; middleware already protects auth pages).
- API `POST /api/questions` creates question for the signed-in user.

## User Profile
- UI at `app/(app)/profile/page.tsx`: shows name, credibility score/label, interests, and sample recommendation cards with metrics. Redirects to `/login` if unauthenticated (via `/api/auth/me` check).

## Routing
- `/` redirects to `/login`.
- Auth flow: `/signup` → `/profile-setup` → `/circle-setup`; `/login` → `/feed` on success.
- Callback page at `/auth/callback` shows “Completing sign-in…” then redirects to `/feed`.

## Dependencies added
- Runtime: `react-hook-form`, `@hookform/resolvers`, `zod`.
- Dev: `supabase` CLI; ESLint pinned to 8.57.0 for Next peer compatibility.

## How to run
1. Set `.env.local` with Supabase URL/keys.
2. Apply schema: `npx supabase db push --file supabase/schema.sql` (or equivalent).
3. Install deps: `npm install`.
4. Start dev server: `npm run dev`.
5. Sign up via `/signup` or `POST /api/auth/signup`, then walk through `/profile-setup`, `/ask`, `/profile`.

## Notes
- Question list/feed is still sample-only; wiring to real data can be added next.
- Credibility metrics on profile use placeholder values until recommendation/credibility services are implemented.
