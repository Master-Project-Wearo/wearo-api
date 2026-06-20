# Wearo API

NestJS API backed by the Wearo Supabase PostgreSQL database and Prisma.

## Requirements

- Node.js 20.19 or newer
- A Supabase project using HS256 access tokens
- PostgreSQL connection strings for the Supabase pooler and direct database

## Environment

Create `.env` from `.env.example` and set:

- `DATABASE_URL`: pooled Supabase connection used by the API
- `DIRECT_URL`: direct Supabase connection used by Prisma CLI and introspection
- `SUPABASE_JWT_SECRET`: Supabase legacy JWT secret
- `CORS_ORIGINS`: comma-separated allowed frontend origins
- `PORT`: HTTP port; Render supplies this automatically

Never commit `.env` or expose `SUPABASE_JWT_SECRET` to the frontend.

## Access Model

Every business route requires a Supabase bearer token. Public routes are `GET /`
and `GET /auth/health`.

The JWT `sub` claim is the only user identifier trusted by the API. Client
payloads cannot set `user_id`, `created_at`, or `added_at`. Owned resources are
filtered by that identifier:

- `items`
- `outfits`
- `schedules`
- `ai-conversations`
- `ai-messages`, through their conversation
- `outfit-items`, through both linked resources

Profile access is limited to `GET /users/me` and `PATCH /users/me`.

`types` is read-only in the API: `GET /types` and `GET /types/:typeId`. Create,
update, and delete operations are performed by an administrator in Supabase.

## Database Schema

`prisma/schema.prisma` represents the application tables in the `public`
schema. The database foreign key from `public.users` to `auth.users` is kept in
Supabase but intentionally omitted from Prisma Client so the API does not model
or expose Supabase-owned authentication tables.

To inspect drift without overwriting the application schema:

```bash
npx prisma db pull --print --schemas public,auth
```

Review the output and copy only relevant `public` changes. Database migrations,
RLS policies, triggers, and admin data changes remain managed in Supabase.

## Development

```bash
npm ci
npx prisma generate
npm run start:dev
```

Swagger is available at `/api-docs`.

## Verification

```bash
npm run lint -- --no-fix
npx tsc --noEmit
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
```

The e2e suite connects to Supabase and creates temporary records that it removes
after the run. Do not run it against a database where test writes are forbidden.

## Render

Create a Render Web Service with:

- Build command: `npm ci && npx prisma generate && npm run build`
- Start command: `npm run start:prod`
- Health check path: `/auth/health`

Set `DATABASE_URL`, `SUPABASE_JWT_SECRET`, `CORS_ORIGINS`, and
`NODE_ENV=production` in Render. `DIRECT_URL` is only necessary there if Prisma
CLI operations are intentionally run during deployment; schema changes should
normally be applied from Supabase instead.
