---
name: per-feature-sql-migrations
description: Use when setting up database migrations for a project with multiple bounded contexts, when deciding how to version schema changes, or when setting up pgTAP contract tests for stored procedures
metadata:
  tags: [database, sqitch, postgresql, language-agnostic]
---

# Per-Feature SQL Migrations (Sqitch)

**Scope:** language-agnostic, tool-specific (Sqitch + PostgreSQL)

## Overview

Each bounded context owns its own Sqitch project under `pgsql/<feature>/`. Migration files are numbered sequentially. Each migration has a matching revert and verify script. Schema-level pgTAP tests serve as a contract for stored procedures.

## Directory Layout

```
pgsql/
  auth/
    sqitch.conf
    deploy/
      00010_init.sql
      00015_add_schema_and_extensions.sql
      00020_users.sql
    revert/
      00010_init.sql
      ...
    verify/
      00010_init.sql
      ...
    test/
      00010_auth_schema.sql       ← pgTAP tests
  payments/
    sqitch.conf
    deploy/ revert/ verify/ test/
```

## Naming Convention

- Files are numbered: `00010_`, `00020_`, ... (gap of 10 allows inserts)
- Name describes the intent, not the mechanism: `00020_users.sql` not `00020_create_table.sql`
- First three migrations are conventionally: `init` → `schema_and_extensions` → first domain table

## Migration Principles

**Each migration is independently revertable** — `revert/00020_users.sql` exactly undoes `deploy/00020_users.sql`. Never make a deploy depend on future deploys.

**Verify is a read-only sanity check** — verify scripts confirm the object exists and has expected shape; they do not insert data.

**Separate schemas per feature** — `CREATE SCHEMA IF NOT EXISTS auth;` in the feature's init; cross-feature joins through views or explicit schema-qualified names.

**No cross-schema foreign keys** — a FK from `payments.orders` → `auth.users` creates a hard deploy-ordering dependency between two independent Sqitch projects. Reference foreign keys by value (e.g. store the user ID as a plain UUID column) and enforce the relationship at the application layer. If a DB-level constraint is truly required, both schemas must deploy together and lose independent cadence.

**`sqitch.plan` is the source of ordering** — Sqitch deploys changes in the order they appear in `sqitch.plan`, not by filename sort order. The numeric prefixes (`00010_`, `00020_`) are a naming convention for human readability; Sqitch's plan file is authoritative. Always run `sqitch add` to append to the plan rather than editing filenames manually.

**Stored procedures as contracts** — logic in stored procedures (auth, permission checks) is tested with pgTAP before the Scala layer is written; the Scala adapter calls the procedure, not raw SQL.

## Common Commands

```bash
# deploy all changes
sqitch deploy --chdir pgsql/auth db:pg://localhost/myapp_dev

# revert one step
sqitch revert --to @HEAD^ --chdir pgsql/auth db:pg://...

# verify current state
sqitch verify --chdir pgsql/auth db:pg://...

# run pgTAP tests (requires pg_prove)
pg_prove pgsql/auth/test/*.sql
```

## Common Mistakes

**One Sqitch project for all features** — features become coupled through migration ordering; separate projects allow independent deploy cadences.

**No revert script** — a migration without revert is a one-way door; always write revert first (it clarifies the intent of the deploy).

**Business logic in migration** — data transformations are fine; application-level decisions (which records to migrate) belong in a one-off script, not a schema migration.

**Numbers without gaps** — use gaps (10, 20, ...) to allow insertions between existing migrations.

