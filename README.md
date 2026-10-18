# Taiwo's Portfolio

A Next.js App Router portfolio whose content, page structure and supported styling are stored in Neon PostgreSQL and rendered dynamically. The single administrator manages everything through an admin area, with no redeploy needed for content changes.

See the project specification for the full scope. This README covers setup, the current state of the build, and what remains.

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript (strict) · Tailwind CSS 4 · Drizzle ORM · Neon (`@neondatabase/serverless`) · Better Auth · Yup (validation) · React Hook Form · TanStack Query · Zustand · dnd-kit · Vitest · Playwright · Vercel

## Getting started

```bash
npm install
cp .env.example .env.local      # then fill in the values
npm run db:migrate              # apply migrations to DATABASE_URL
npm run admin:create            # provision the single administrator (reads ADMIN_* vars)
npm run dev
```

### Environment variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | server | Neon connection string. Use a separate database or branch for dev, preview and production. |
| `BETTER_AUTH_SECRET` | server | 32+ character secret for sessions and signing. |
| `BETTER_AUTH_URL` | server | Base URL of the running app (Better Auth callbacks and cookies). |
| `NEXT_PUBLIC_SITE_URL` | public | Canonical URL for metadata. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | script only | Used by `npm run admin:create`. Not read at runtime. |

Environment values are validated at startup by `lib/env.ts`. A missing or malformed value fails fast.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Development server, production build, production server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run db:generate` | Generate a migration from `db/schema.ts` |
| `npm run db:migrate` | Apply migrations (run as a controlled deploy step, not on each request) |
| `npm run admin:create` | Create or update the administrator account |
| `npm run db:seed` | Seed the brand colour, the four featured projects with cover images, and the published `home` page. Safe to re-run. |

## Architecture

```
app/                      Routes: public pages, login, admin shell, REST route handlers
proxy.ts                  Optimistic redirect for /admin (cookie presence only)
lib/
  env.ts                  Validated environment (@t3-oss/env-nextjs)
  auth.ts                 Better Auth server configuration (sign-up disabled)
  admin-session.ts        Server-side role checks for pages and API routes
  route.ts                publicRoute / adminRoute wrappers (origin check + auth)
  api.ts                  Response envelope, error mapping, JSON body limits, UUID checks
db/
  schema.ts               Drizzle schema (Better Auth + application tables)
  migrations/             Generated SQL
features/
  page-builder/blocks/    Typed block models, Yup schemas, defaults, registry
  page-builder/render/    Trusted block renderers and the block list renderer
  pages/                  Slug rules, request schemas, publishing service, public data loaders
  auth/                   Login form
scripts/create-admin.ts   Administrator provisioning
tests/                    Unit tests (slugs, block validation, registry)
```

### Content model

- A **page** has a draft pointer and a published pointer into **page_versions**.
- Every save inserts a new immutable version row; `content_json` is never edited after insert.
- **Publishing** runs in one transaction: lock the page row, check the expected draft revision, validate the full definition, set the published pointer. Cache tags are expired only after the commit. A failed publish leaves the previous version live.
- **Restore** copies an old version into a new draft. It goes live only on an explicit publish.
- Block configuration is JSON validated against Yup schemas. The database can only select a block type from the registry. It cannot supply components, import paths or CSS. Style settings are tokens that map to fixed classes.

### REST API (`/api/v1`)

Errors use one shape: `{ "error": { "code", "message", "details"? } }`. Successes use `{ "data": ... }`.

| Method | Path | Access |
| --- | --- | --- |
| GET | `/pages/[slug]` | Public. Published version only. |
| GET, POST | `/admin/pages` | Admin. List is paginated (`page`, `pageSize`). |
| GET, PATCH, DELETE | `/admin/pages/[id]` | Admin |
| GET | `/admin/pages/[id]/draft` | Admin |
| PUT | `/admin/pages/[id]/draft` | Admin. Body includes `expectedDraftVersionId`; a stale value returns 409. |
| POST | `/admin/pages/[id]/publish` | Admin. Body includes `expectedDraftVersionId`. |
| GET | `/admin/pages/[id]/versions` | Admin |
| POST | `/admin/pages/[id]/restore` | Admin. Creates a new draft. |
| `/api/auth/*` | Better Auth | Sign-in and session handling |

Every admin route checks the session and role on its own, and rejects cross-origin mutations and non-JSON bodies. Request bodies are capped at 256 KB.

### Brand colour

The primary colour lives in `site_settings.theme_configuration` as `{ primary, primaryDeep }`. The public layout reads it through `getSiteTheme()` (cached, tagged `site-settings`) and sets the `--color-brand` and `--color-brand-deep` custom properties. If the row is missing or invalid, the default `#97683F` is used. Run `npm run db:seed` once per database to write it.

## Security notes

- Public sign-up is disabled in Better Auth. The administrator is created only through `npm run admin:create`, which hashes the password with Better Auth's own function and never logs it.
- `proxy.ts` only checks that a session cookie exists, to redirect early. Real authorization happens in each page and route.
- Security headers (CSP, `X-Frame-Options: DENY`, `nosniff`, referrer and permissions policies, HSTS in production) are set in `next.config.ts`.
- Link fields accept only same-site paths, `http(s)` and `mailto:`. `javascript:` and protocol-relative links are rejected.

## Current status

**Built and verified in this repository**

- Foundation: dependencies, strict TypeScript, ESLint, Prettier, Vitest, env validation.
- Database schema for auth and application tables, plus generated migration `db/migrations/0000_*.sql`.
- Better Auth with sign-up disabled, admin role, login page, and admin route protection.
- Block system: 14 block types with typed configs, Yup validation, defaults, registry and renderers.
- Page service with versioning, optimistic revision checks, transactional publish and restore, and tag-based cache expiry.
- Page REST endpoints above, plus public published-page rendering at `/` and `/[slug]`.
- 53 unit tests passing. Production build passing. Lint and typecheck clean.
- Smoke-tested without a database: admin API returns 401 without a session, cross-origin mutations return 403, non-JSON bodies return 401/415 before parsing, `/admin` redirects to `/login` with 307, and security headers are present.

**Not yet verified**

- Nothing has been run against a live Neon database. The migration has been generated but not applied, and publish, restore and draft conflict behavior are untested end to end.
- The admin provisioning script has been checked for validation errors only, not for a successful write.
- Better Auth's generated schema has not been compared with the CLI output.

**Not yet built (from the spec)**

- Visual builder UI: three-panel editor, drag-and-drop, inspector, responsive preview, autosave, undo/redo (Phase 5).
- Admin pages for pages, projects, experience, skills, settings and media.
- CRUD endpoints for projects, skills, experience, site settings and media metadata.
- Public `/projects`, `/projects/[slug]`, `/about`, `/contact`, plus `POST /api/v1/contact` with rate limiting.
- Draft preview route, sitemap and robots.
- Media storage (Cloudflare R2 or Vercel Blob), signed uploads and file validation.
- Upstash rate limiting. Only Better Auth's built-in limiter is configured, and its in-memory store does not work across serverless instances.
- Playwright end-to-end tests and API tests against a database.

**Known limitations**

- Unknown but valid slugs on `/[slug]` return HTTP 200 with a not-found page, not 404. Next.js 16 with Cache Components commits the status before the not-found decision in this route. Reserved slugs and invalid formats also currently return 200. A fix is to answer those in `proxy.ts` with a plain 404 for paths that fail `checkSlug`. Real published/unpublished checks need the database, so that part will still depend on the page.

## Deviations from the spec

- **Zod is used for environment validation.** `@t3-oss/env-nextjs` accepts Standard Schema libraries (Zod, Valibot, ArkType) and not Yup. All request and block validation uses Yup.
- **`tsx` is a dev dependency** to run `scripts/create-admin.ts`.
- **`proxy.ts`** (Next 16's name for middleware) performs the optimistic admin redirect.
- **`sanitize-html` was removed.** Rich text is stored as plain paragraphs, not HTML, so nothing needs sanitizing.
