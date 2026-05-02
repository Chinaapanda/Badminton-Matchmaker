# Agents

## Cursor Cloud specific instructions

### Project overview

Badminton Matchmaker — a Next.js 14 (App Router) + Supabase web app for generating fair badminton doubles matchups with ELO-based ranking.

### Running services

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Next.js dev server | `pnpm dev` | 3000 | Main app (frontend + API routes) |
| Local Supabase | `supabase start` | 54321 (API), 54322 (DB), 54323 (Studio) | Requires Docker running first |

### Key startup notes

1. **Docker must be running before Supabase**: Start dockerd first, then `supabase start`. In this VM, Docker requires fuse-overlayfs and iptables-legacy (already configured).
2. **`.env.local`** must exist at the project root with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key from supabase status>
   ```
   The publishable key is shown by `supabase status` after starting local Supabase.
3. **Supabase CLI version**: Use v2.76.17 — newer versions (e.g. v2.95.4) have broken Docker image references. The binary is installed at `/usr/local/bin/supabase`.
4. **Node.js version**: 20.x via nvm at `/home/ubuntu/.nvm`. Source nvm with:
   ```bash
   export NVM_DIR="/home/ubuntu/.nvm" && . "$NVM_DIR/nvm.sh"
   ```

### Common commands

- **Install deps**: `pnpm install`
- **Dev server**: `pnpm dev`
- **Lint**: `pnpm lint` (pre-existing warnings/errors in codebase; the tool works)
- **Type check**: `pnpm type-check`
- **Build**: `pnpm build`
- **Start Supabase**: `supabase start` (from project root; applies migrations automatically)
- **Stop Supabase**: `supabase stop`
- **Reset DB**: `supabase db reset`

### Gotchas

- The ESLint config file (`.eslintrc.json`) must exist for `pnpm lint` to run non-interactively; it extends `next/core-web-vitals`.
- Supabase config uses PostgreSQL major_version 17, which requires CLI >= v2.22 but has issues with v2.95.x.
- `supabase start` pulls many Docker images (~1GB+) on first run; subsequent starts are fast.
- The app uses `console.warn` for missing Supabase env vars rather than crashing — the dev server will start even without them, but auth/data features won't work.
