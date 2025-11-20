# Supabase Directory Structure

This directory contains all Supabase-related configuration and migrations.

## Directory Contents

```
supabase/
├── config.toml           # Supabase project configuration
├── migrations/           # Database migration files
│   └── 20250120_initial_schema.sql
├── seed.sql             # Optional seed data for development
└── .env.example         # Environment variables template
```

## Important Files

### config.toml
Project configuration for local Supabase development. Contains settings for:
- API ports and schemas
- Database version and connection settings
- Authentication configuration
- Storage and realtime settings

### migrations/
Contains SQL migration files that define your database schema. Migrations are applied in chronological order based on the timestamp in the filename.

Current migrations:
- `20250120_initial_schema.sql` - Initial database setup with all tables, RLS policies, and triggers

### seed.sql
Optional file for development seed data. Add test data here to populate your local database during development.

## Usage

See the workflow documentation:
```bash
cat .agent/workflows/supabase-db.md
```

Or run workflow commands for common tasks like:
- Pushing migrations: `supabase db push`
- Creating new migrations: `supabase migration new <name>`
- Starting local development: `supabase start`

## Getting Started

1. Link to your remote Supabase project:
   ```bash
   supabase link --project-ref <your-project-ref>
   ```

2. Push the initial schema:
   ```bash
   supabase db push
   ```

3. Start local development (optional):
   ```bash
   supabase start
   ```

For more details, see `.agent/workflows/supabase-db.md`
