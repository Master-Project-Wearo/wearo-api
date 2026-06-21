# Wearo API

NestJS API backed by the Wearo Supabase PostgreSQL database and Prisma.

## Requirements

- Node.js 20.19 or newer
- A Supabase project using asymmetric ES256 signing keys
- PostgreSQL connection strings for the Supabase pooler and direct database

## Environment

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL`: pooled server-side Supabase connection used at runtime
- `DIRECT_URL`: direct connection used only by Prisma CLI and introspection
- `SUPABASE_URL`: project URL used to validate JWTs against Supabase JWKS
- `CORS_ORIGINS`: comma-separated frontend origins
- `PORT`: HTTP port
- `NODE_ENV`: `development`, `test`, or `production`

Database credentials and `.env` must never be exposed to a frontend.

## Authentication

All routes are protected by the global JWT guard except `GET /` and
`GET /auth/health`. Production tokens are validated with the project's ES256
JWKS, including expiration, audience `authenticated`, issuer, and role.

- `GET /auth/me` returns the identity carried by the validated token.
- `GET /users/me` returns the matching application profile from
  `public.users`.
- `PATCH /users/me` updates only editable profile fields.

This API exposes no administrator route. Administration is performed directly
in Supabase.

## Data Isolation

The JWT `sub` claim is the only user identifier trusted by the API. Client
payloads cannot set `user_id`, timestamps, or AI message roles.

Every owned Prisma query filters by the current user:

- `items`, `outfits`, `schedules`, and `ai-conversations` by `user_id`
- `ai-messages` through the owned conversation
- `outfit-items` through both the owned outfit and item

The runtime connection currently uses Supabase's server PostgreSQL role, which
has `BYPASSRLS`. Supabase RLS continues to protect direct Data API access, but
NestJS authorization is enforced by the service filters above and by
multi-user e2e tests. Making Prisma participate in RLS would require propagating
the JWT claims and role inside a transaction for every request; changing only
`DATABASE_URL` is not sufficient.

## AI Messages

Public clients create user messages without a `role` field. The API always
stores those messages with role `user`. A future server-side AI integration
must persist generated output through
`AiMessagesService.createAssistantResponse()`, which assigns `assistant`
internally and is not exposed as a CRUD parameter.

## Database Schema

`prisma/schema.prisma` intentionally models only application tables in
`public`. The database foreign key from `public.users` to `auth.users`
remains in Supabase.

To inspect drift without overwriting the application schema:

```bash
npx prisma db pull --print --schemas public,auth
```

Review the output and copy only relevant `public` changes. Database migrations,
RLS policies, triggers, and administrator data changes remain managed in
Supabase.

## Development

```bash
npm ci
npx prisma generate
npm run start:dev
```

Swagger is available at `/api-docs`.

## Verification

```bash
npm run lint
npx tsc --noEmit --incremental false
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
npm audit --omit=dev
```

## Test organization

Unit tests are colocated with each business service as `*.service.spec.ts`.
Shared Prisma mocks and e2e lifecycle helpers live in `test/support`.

The e2e suites are split by responsibility:

- `app.e2e-spec.ts`: public routes, health, JWT protection, and session identity
- `users-types.e2e-spec.ts`: current profile and read-only type catalogue
- `wardrobe.e2e-spec.ts`: items, outfits, schedules, links, and cross-user denial
- `ai.e2e-spec.ts`: conversations, message roles, and cross-user denial

`npm run test:cov` measures business services and shared query utilities. Jest
enforces minimum global thresholds of 95% statements, 70% branches, 95%
functions, and 95% lines.

The e2e suites connect to Supabase, create isolated temporary records, verify
cross-user access denial, and remove their records afterward.

## Production

Recommended Render configuration:

- Build command: `npm ci && npm run build`
- Start command: `npm run start:prod`
- Health check path: `/auth/health`

The API enables Helmet, global request throttling, strict DTO whitelisting,
graceful shutdown hooks, and a database-backed health check.
