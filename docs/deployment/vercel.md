# AuraFin on Vercel

The repository is configured as a static Vite SPA. Vercel builds with Node.js 22, runs the full TypeScript and environment gate, emits `dist/`, preserves deep links through the SPA rewrite, and applies the security headers declared in `vercel.json`.

No Vercel deployment is performed by the GitHub workflows in this repository. The `cd-*` workflows are database release gates. Connect the repository through the Vercel Git integration (recommended) or run an intentional CLI deployment after completing this checklist.

## Required project settings

The repository pins these values in `vercel.json`; dashboard overrides should remain disabled:

- Framework: Vite
- Install command: `npm ci --include=dev`
- Build command: `npm run build`
- Output directory: `dist`
- Node.js: `22.x`
- Root directory: repository root

## Environment isolation

Configure every variable in Vercel Project Settings → Environment Variables. A build fails before bundling if required values are missing, unsafe, or inconsistent with the Vercel environment.

| Variable | Production | Preview / staging | Notes |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | Production project URL | Separate staging/preview project URL | HTTPS `*.supabase.co`; never localhost |
| `VITE_SUPABASE_ANON_KEY` | Production publishable or legacy anon key | Matching staging/preview public key | Never use a secret/service-role key |
| `VITE_APP_ENV` | `production` | `staging` | The build rejects a production label in Preview |
| `VITE_RELEASE_SHA` | Optional release identifier | Optional release identifier | Used only for log correlation |
| `VITE_ERROR_TRACKING_ENABLED` | `false` until a tracker is wired | `false` | Optional |
| `VITE_ERROR_TRACKING_DSN` | Empty unless configured | Empty unless configured | Optional |

Keep `VITE_ENABLE_DEMO_MODE` and `VITE_ENABLE_LEGACY_IMPORT` unset or `false`. The Vercel build gate rejects either flag when enabled.

Do not point generic pull-request previews at the production Supabase project. Use a branch-scoped Preview environment or disable previews that cannot have isolated data and schema.

## Supabase Auth URL configuration

Before the first Preview or Production smoke test, update Authentication → URL Configuration in each hosted Supabase project:

- Site URL: the exact production application origin, for example `https://aurafin.app`.
- Additional redirect URL: the exact staging origin, when one exists.
- Preview redirects: `https://*-<vercel-team-or-account-slug>.vercel.app/**` only when preview auth is required.
- Local development: `http://localhost:3000/**`.

Use exact production URLs; reserve wildcard patterns for preview deployments. Confirmation and recovery emails use `window.location.origin`, so the destination must be allow-listed. If custom email templates build their own links, use Supabase's `RedirectTo` value.

## Preflight

Run from a clean dependency install with the target public environment values available:

```powershell
npm ci
npm run test:deployment
npm run build
npm audit --audit-level=high
```

The build must print a `[build-env] PASS` line without printing the key. Verify the resulting `dist/` contains `index.html` and content-hashed assets, with no `.env`, source map, service-role key, or local Supabase URL.

## First Preview and production promotion

1. Import the Git repository into Vercel and leave the repository-defined build settings active.
2. Configure isolated Preview variables and create a Preview deployment.
3. Apply all pending Supabase migrations to the matching non-production project before functional testing.
4. Validate `/`, a direct/deep URL, refresh, login, signup confirmation, password recovery, restored session, PF access, PJ organization switching, RLS, and cross-tenant denial.
5. Inspect response headers for CSP, HSTS, frame denial, MIME sniffing denial, referrer policy, permissions policy, COOP, and CORP.
6. Configure the Production variables and Supabase Auth production URLs.
7. Apply the approved production migrations, promote the already-tested deployment, and repeat the smoke checks.

For rollback, promote the preceding immutable Vercel deployment. Database rollback requires a separate forward-compatible migration; never reset or destructively roll back the production database.

References: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [Vercel project configuration](https://vercel.com/docs/project-configuration/vercel-json), [Supabase Auth redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).
