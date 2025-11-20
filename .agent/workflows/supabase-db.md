---
description: How to manage database migrations with Supabase
---

# Supabase Database Management Workflow

This workflow explains how to manage database schema changes using Supabase CLI.

## Prerequisites

1. Install Supabase CLI (already installed):
```bash
brew install supabase/tap/supabase
```

2. Make sure you're in the project directory:
```bash
cd /Users/kittikornkeeratikriengkrai/Desktop/badminton
```

## Initial Setup (One-time)

### 1. Link to Remote Supabase Project

// turbo
```bash
supabase link --project-ref <your-project-ref>
```

You'll need:
- Your project reference ID (from Supabase dashboard URL: `https://app.supabase.com/project/<PROJECT-REF>`)
- Your database password

### 2. Verify Connection

// turbo
```bash
supabase db remote commit
```

This will check if you can connect to your remote database.

## Managing Migrations

### Push Migrations to Remote Database

To apply all pending migrations to your remote Supabase database:

// turbo
```bash
supabase db push
```

This command will:
- Compare your local migration files with the remote database
- Apply any new migrations that haven't been run yet
- Update the schema_migrations table

### Create New Migrations

When you need to make schema changes:

1. Create a new migration file:
```bash
supabase migration new <migration_name>
```

Example:
```bash
supabase migration new add_player_statistics
```

2. Edit the generated file in `supabase/migrations/`

3. Test locally (optional):
```bash
supabase db reset
```

4. Push to remote:
// turbo
```bash
supabase db push
```

### Generate Migration from Remote Changes

If you made changes directly in Supabase Studio or SQL Editor:

```bash
supabase db pull
```

This will create a new migration file with the differences.

### View Migration Status

To see which migrations have been applied:

// turbo
```bash
supabase migration list
```

## Local Development

### Start Local Supabase

To run a local Supabase instance for testing:

```bash
supabase start
```

This will:
- Start a local PostgreSQL database
- Start Supabase Studio at http://localhost:54323
- Apply all migrations automatically

### Stop Local Supabase

```bash
supabase stop
```

### Reset Local Database

To reset and re-apply all migrations:

```bash
supabase db reset
```

## Common Tasks

### View Current Schema

```bash
supabase db dump --schema public -f schema_backup.sql
```

### Rollback (Not Recommended)

Supabase doesn't support automatic rollback. To undo changes:
1. Create a new migration that reverses the changes
2. Push the new migration

### Inspect Remote Database

```bash
supabase db remote ls
```

## Important Notes

- **Never edit migration files after they've been applied** - Always create a new migration
- **Migrations are applied in alphabetical/chronological order** - The filename timestamp matters
- **Test migrations locally first** with `supabase start` and `supabase db reset`
- **Backup before major changes** using `supabase db dump`

## Quick Reference

| Command | Description |
|---------|-------------|
| `supabase link` | Connect to remote project |
| `supabase db push` | Push migrations to remote |
| `supabase db pull` | Pull remote changes as migration |
| `supabase migration new <name>` | Create new migration file |
| `supabase migration list` | List all migrations |
| `supabase start` | Start local dev environment |
| `supabase stop` | Stop local dev environment |
| `supabase db reset` | Reset local database |
| `supabase db dump` | Export database schema |

## Current Migration Status

Your project currently has:
- ✅ Initial schema migration: `20250120_initial_schema.sql`
  - Contains: profiles, sessions, session_players, matches, match_players, players tables
  - Includes: RLS policies, triggers, and functions
