# Spotify Clone — GraphQL API

Production‑ready GraphQL API that fronts Spotify’s REST API with a strict, typed schema, deterministic pagination, and auth propagation. Pairs with the React client and a shared schema package.

---

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Modules](#modules)
- [Data Flow](#data-flow)
- [Mapping Layer](#mapping-layer)
- [Pagination](#pagination)
- [Errors & Resilience](#errors--resilience)
- [Auth](#auth)
- [Validation & Nullability](#validation--nullability)
- [Testing](#testing)
- [Local Development](#local-development)
- [Environment](#environment)
- [Build & Run](#build--run)
- [Quality & CI](#quality--ci)
- [Operational Notes](#operational-notes)

---

## Overview

- **Role:** Acts as a stable GraphQL façade over the Spotify Web API.
- **Why:** Normalize shapes, enforce nullability, and hide REST details (query params, URLs, retries) from the UI.
- **Shape:** Query + Mutation resolvers, strict mappers, and thin Spotify service clients with typed responses.
- **Contracts:** Uses the shared package `@dcoutinho96/spotify-clone-luizalabs-coding-challenge-graphql-schema` to keep server & client schema consistent.

---

## Architecture

Layered, dependency‑inverted design:

```text
GraphQL Server (Apollo)
   └─ Resolvers (feature-oriented)
      └─ Mappers (normalize external -> internal schema)
         └─ Services/Spotify (axios HTTP, auth headers, endpoints)
            └─ Utils (fetchSafeResource, pagination helpers, error typing)
```

**Key choices**

- **Schema first**: Schema published in shared package; codegen produces type‑safe resolver signatures.
- **Mapper boundary**: All external JSON is converted once. Nullability is enforced here, not in the UI.
- **Connection pagination**: Stable `edges/cursor + pageInfo` based on Spotify `limit/offset` translated by helpers.
- **Explicit errors**: Only whitelisted, user‑meaningful errors surface; raw axios exceptions are normalized.
- **Stateless**: No persistence. Auth is propagated from the client (Bearer token) per request.

---

## Modules

- `src/graphql/server.ts` — Apollo Server setup (schema wiring, context factory).
- `src/graphql/resolvers/*` — Query/Mutation and field resolvers per feature (artist, playlist, user).
- `src/services/spotify/*` — HTTP clients per resource: albums, artists, playlists, user; no UI concern here.
- `src/mappers/*` — Convert Spotify shapes to GraphQL types; set sane fallbacks, arrays, and nulls.
- `src/utils/*` — Error normalization, pagination math, safe fetch wrapper.
- `src/context.ts` — Request‑scoped auth & axios client injection.
- `src/types/spotify.ts` — Minimal external types used by services & mappers.

---

## Data Flow

1. **HTTP request** with `Authorization: Bearer <spotify-token>` hits Apollo.
2. **Context** builds a pre‑configured axios instance bound to that token.
3. **Resolver** calls a **service** (e.g., `getMyPlaylists`).
4. Service performs HTTP call via **fetchSafeResource** with guarded error handling.
5. Raw Spotify payload is passed through a **mapper** to conform to GraphQL schema & nullability.
6. **Resolver** returns mapped value to the client.

---

## Mapping Layer

- One‑way translation from Spotify to GraphQL types.
- Enforces **non‑null** invariants and **fallbacks** to avoid runtime null errors:
  - Example (user): `displayName = user.display_name ?? user.id ?? "Unknown User"`
  - Arrays always default to `[]`.
- Centralizes field renames (e.g., `duration_ms` → `durationMs`).

---

## Pagination

- Spotify uses `limit/offset`; GraphQL exposes **Relay‑style connections**.
- `createConnection` adapts `{ items, total }` to `{ edges, pageInfo, totalCount }`.
- `getNextPageParam` on the client relies on `pageInfo.hasNextPage`; API ensures correctness from Spotify totals.

---

## Errors & Resilience

- **Typed errors**: `UNAUTHORIZED_SPOTIFY`, `NOT_FOUND_SPOTIFY`, `SPOTIFY_API_ERROR` via `GraphQLError`.
- **Safe fetch**: `fetchSafeResource` converts axios/network exceptions into stable app errors.
- **No leakage**: Internal stack traces and axios details are not exposed to clients.
- **Backoff**: Keep retries off by default; callers can retry idempotent queries at the edge (React Query).

---

## Auth

- Client obtains a Spotify OAuth token and includes it in requests to this API.
- API **does not mint** tokens; it only validates presence and forwards as Bearer to Spotify.
- When the token is missing/expired → `UNAUTHORIZED_SPOTIFY` (HTTP 401).

---

## Validation & Nullability

- GraphQL schema uses non‑null where the UI depends on a value.
- Mappers **must** ensure non‑null contract or supply a fallback literal (e.g., `"Unknown User"`).
- Any upstream `null` that violates schema results in a mapper fallback to avoid `Cannot return null for non-nullable field` runtime crashes.

---

## Testing

- **Unit tests** for:
  - Mappers (shape conversions & fallbacks).
  - Services (successful fetch + error paths via mocked axios).
  - Resolvers (integration over context + mappers).
  - Utils (fetch & pagination).
- **Coverage** available under `coverage/lcov-report`.
- Run:
  ```bash
  npm run test:unit
  ```

---

## Local Development

```bash
# Install
npm ci

# Create env
cp .env.example .env
# Fill SPOTIFY_CLIENT_ID/SECRET if you proxy auth elsewhere; token must come from client for protected routes.

# Dev server (TS + auto-reload)
npm run dev
# GraphQL on http://localhost:4000
```

---

## Environment

`.env.example` (see repo) contains the following keys:

```bash
NODE_ENV=development
ENV=LOCAL
PORT=4000
SONAR_TOKEN=
```

- For hosted environments, set `NODE_ENV=production` and a proper `PORT` binding.
- No DB credentials are needed; this service is stateless.

---

## Build & Run

```bash
# Type-check & build to /dist (ESM + d.ts)
npm run build

# Start from dist
npm start
```

---

## Quality & CI

- Linting: `npm run lint`
- Type check: part of build
- Unit coverage: `npm run test:unit`
- Sonar: `npm run sonar` (or `npm run sonar:local` with .env)

---

## Operational Notes

- **Timeouts**: Set axios timeouts at the client level if required by infra.
- **Rate limits**: Spotify applies rate limits; prefer client‑side caching and pagination.
- **Security**: Reject requests without Bearer tokens on protected fields. Never log tokens.
- **Observability**: Wrap axios with minimal request/response logging at WARN on failures only.
