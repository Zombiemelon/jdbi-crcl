# Authentication & Role Handling

This document outlines the fixes applied to the Supabase auth setup and explains how authentication, profile provisioning, and role-based access control currently work in the project.

## Recent Fixes

1. **Email confirmation alignment** – `app/api/auth/signup/route.ts` now calls `supabase.auth.admin.createUser` with `email_confirm: true`. This matches the Supabase project's `mailer_autoconfirm: true` setting so new accounts are usable immediately.
2. **Schema migration** – Added `supabase/migrations/20251122120000_init_schema.sql`, which creates the `profiles`, `circles`, `circle_members`, and `friends` tables plus all required row-level security (RLS) policies, indexes, and extensions (`uuid-ossp`, `pgcrypto`). Pushed to the hosted project via `supabase db push`.
3. **Existing user backfill** – Using the Supabase CLI + service-role key, inserted missing rows into the new tables for the already-created users and seeded their default inner/outer circles so logins no longer fail with “Could not load profile.”

## Authentication Flow

### Signup (`POST /api/auth/signup`)
- Server action uses `getServiceRoleSupabase()` (`lib/supabase/server.ts`) which instantiates a Supabase client with the `SUPABASE_SERVICE_ROLE_KEY`. This bypasses RLS to perform admin operations.
- After validating input with Zod (`signupSchema`), `createUser` is called with `email_confirm: true`.
- On success the handler inserts into `profiles` and creates two circle rows (`inner`, `outer`) tied to the new `auth.users.id`.
- Response payload: `{ userId }`.

### Login (`POST /api/auth/login`)
- Uses the route-handler client (`getRouteHandlerSupabase`) which relies on the user's cookies/session.
- Calls `supabase.auth.signInWithPassword`. On success it fetches the matching `profiles` row (protected by RLS, but readable because the session belongs to that user).
- Returns the combined auth + profile payload (`AuthUserResponse`) consumed by the app.

### Session hydration (`GET /api/auth/me`)
- Uses `supabase.auth.getUser()` to read the session from cookies.
- Queries the same `profiles` view as login and returns the normalized payload so the frontend can hydrate state on refresh.

## Roles & Row-Level Security

- **Supabase roles in play**
  - `service_role`: used server-side for privileged mutations (signup provisioning, administrative inserts) via the service client. Must never be exposed to the browser.
  - `anon` / `authenticated`: used by the Next.js route-handler client for user-initiated requests. Sessions are persisted via cookies handled by `@supabase/auth-helpers-nextjs`.
- **RLS policies** reside in the migration file:
  - `profiles_*` policies allow each user to read/insert/update only their own row (`auth.uid() = id`).
  - `circles` policies ensure owners manage their own circles.
  - `circle_members` and `friends` policies restrict owners and members appropriately.
- Because signup writes run with the service role, they are not blocked by these policies, but any client-side access must pass the checks.

## Environment Requirements

Add the following env vars locally or in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Never expose the service role key to the browser—only import it in server files (as is done in `lib/supabase/server.ts`).

## Operational Tips

- **Verify auth settings**
  ```bash
  supabase projects api-keys --project-ref <ref> -o json
  SERVICE_KEY=...
  curl -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
    https://<ref>.supabase.co/auth/v1/settings
  ```
- **Run migrations**
  ```bash
  supabase link --project-ref <ref>   # once per environment
  supabase db push
  ```
- **Seed defaults for existing users** – use the service-role key with the REST API (or SQL editor) to insert rows into `profiles` and `circles` when migrating legacy accounts.

With these pieces in place, new signups are immediately confirmed, receive default circles, and can authenticate/end up with a complete profile record that satisfies all downstream API calls.

