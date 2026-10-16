---
name: module-separation
description: Use when splitting a hexagonal project into build modules, when a layer violation is caught at runtime instead of compile time, when one feature's domain is accidentally importable by another feature's infra, or when setting up a new bounded context
metadata:
  tags: [architecture, language-agnostic, build-system-agnostic]
---

# Module Separation for Hexagonal Architecture

**Scope:** language-agnostic, build-system-agnostic

## Overview

Physical build modules are the only reliable enforcement mechanism for
hexagonal layer rules. Import rules documented in READMEs or linting configs
can be bypassed or forgotten; a missing module dependency makes the violation
a build error. The goal is: **if it compiles, the architecture is correct.**

See `hexagonal-feature-layout` for what belongs in each layer. This skill
covers how to carve those layers into modules so the compiler enforces them.

## Top-Level Grouping

```
core/          ← shared kernel: abstractions used by every feature
features/      ← one sub-group per bounded context
products/      ← one deployable artifact per runnable process
```

`core` and `features` contain no `main` entry point. `products` is the only
place that produces a runnable artifact and acts as the composition root.

## Core Modules

Core holds abstractions that are feature-agnostic. Each concern gets its own
module so features can depend on exactly what they need:

```
core/
  i18n/                  ← translation resolver, interpolator, Translatable
  identity/              ← Identified[Id, E] wrapper + shared ID base (see domain-identity-types)
  tx/                    ← TransactionContext + TransactionManager traits (depends on ZIO)
  domain/
    errors/              ← InfraFailure (typed error wrapper; no ZIO dep — pure domain can import)
  app/                   ← UseCase + UseCaseCommand abstractions
  infra/
    pg/                  ← DB wrappers, TX context/manager for PG
    memory/              ← in-memory TX context/manager
  presentation/
    <framework>/         ← shared HTTP utilities (error types, middleware base, root handler)
  loggers/               ← logging wiring
  tests/                 ← shared test helpers, test aspects
```

**Rules for core modules:**
- A core module may depend on other core modules but never on any feature module.
- `core/infra/*` modules hold concrete implementations; they are the only core
  modules that name external libraries (JDBC driver, connection pool).
- `core/app` holds only the abstract `UseCase[C]` shape — no feature-specific
  commands or handlers.

## Feature Modules

Each bounded context is a directory under `features/` with the same internal
sub-module shape:

```
features/<name>/
  domain/          ← VOs, errors, operations (no ZIO)
  domain/workflows/ ← port interfaces (in ports/ subpackage), domain workflows (ZIO)
  app/             ← use-case implementations, transaction boundaries
  infra/
    pg/            ← DB adapter implementing domain ports
    memory/        ← in-memory adapter for static/read-only data
    <other>/       ← external API gateway, file adapter, …
  presentation/
    <framework>/   ← driving adapter: routes, endpoints, DTOs
```

**Allowed dependencies (enforced via module deps):**

| Module | May depend on |
|--------|--------------|
| `feature.domain` | `core.i18n`, `core.identity`, `core.domain.errors`, other feature **pure** domains; **no ZIO** |
| `feature.domain.workflows` | `feature.domain`, `core.tx`, `core.domain.errors`, ZIO |
| `feature.app` | `core.app`, `core.i18n`, `feature.domain`, `feature.domain.workflows` (for port interfaces) |
| `feature.infra.*` | `feature.domain.workflows` (ports to implement), `core.infra.<matching>` |
| `feature.presentation.<fw>` | `feature.domain`, `feature.app`, `core.presentation.<fw>` |

`feature.app` must **not** depend on any `feature.infra.*` or
`feature.presentation.*` module. Concrete infra types are provided at the
composition root only.

**Cross-feature dependencies** — a feature's pure domain (`feature.domain`) may depend on
another feature's pure domain (e.g. reuse a VO). A feature must never depend on another
feature's `domain.workflows`, `app`, `infra`, or `presentation` modules.

## Test Sub-Modules

Each source module that has tests owns its test sub-module(s) as a child:

```
feature.domain/
  munits/              ← fast pure tests (MUnit, JUnit) — no effect runtime, no ZIO
feature.domain.workflows/
  tests/               ← effect-runtime tests (ZIO Test) for workflows and port contracts
feature.infra.pg/
  tests/               ← integration tests; may depend on core.infra.pg.tests
                          and core.loggers for live DB wiring
```

Test modules may add test-only dependencies (test framework, dotenv, fixtures)
without polluting the production module's dependency surface.

`core/tests/` provides shared test helpers (aspects, env loaders) that
integration test modules depend on — never the reverse.

## Products (Composition Root)

Each deployable process is a module under `products/`. It:

- Depends on **every** concrete infra and presentation module it needs.
- Declares TX type aliases (`type TXDB = ConcreteTransactionContext`).
- Assembles the full DI / layer graph.
- Contains no business logic.

This module is the composition root — see `composition-root` for the full set of wiring rules (one concrete adapter per port, no business logic, all middleware wired here).

```
products/
  myService/   ← main entry point, composition root, config
```

## What the Compiler Enforces

| Violation | How it's caught |
|-----------|----------------|
| ZIO imported in pure domain | `feature.domain` has no dep on ZIO → compile error |
| Domain imports infra type | `feature.domain` / `feature.domain.workflows` have no dep on `feature.infra.*` → compile error |
| App imports presentation | `feature.app` has no dep on `feature.presentation.*` → compile error |
| Feature A infra imports Feature B infra | no cross-feature infra dep → compile error |
| Concrete TX type in app | app depends only on abstract transactions module → compile error |
| Composition root bypassed | only `products.*` depends on all concrete modules → any other importer fails |

## Incremental Refactoring Across PRs

When a domain type changes, only modules higher in the dependency graph break.
Modules lower in the graph compile immediately and can be merged independently.

```
verba/domain          ✓ compiles — refactor lands here first
verba/domain/workflows ✓ compiles
verba/app             ✓ compiles (stub / TODO if needed)
verba/presentation    ✗ broken — fix in follow-up PR
products/myService    ✗ broken — fix in follow-up PR
```

Pattern:
1. Refactor the domain layer — all downstream modules break at compile time, not runtime.
2. Merge the domain PR. Lower modules are correct and shippable.
3. Fix presentation/product in a follow-up PR targeting only the affected callers.

Better than one PR spanning all layers: review scope is bounded, the domain change
is visible alone, and follow-up breakage is localized to wiring. The compiler
enforces that breakage stops at the module boundary — a broken presentation module
cannot poison the domain it depends on.

## Common Mistakes

**One module per feature** — a single `auth` module containing domain, app,
and infra compiles fine but enforces nothing; any file can import any other
and the architecture rules become documentation-only.

**`core/app` growing feature-specific use cases** — the core app module holds
only the abstract `UseCase[C]` shape; feature use-case implementations belong
in `features/<name>/app`.

**Feature infra depending on sibling feature infra** — cross-feature sharing
goes through domain ports, not infra implementations.

**`products` module containing business logic** — if orchestration decisions
appear in the composition root, extract them to the appropriate feature layer.

**Test helpers in production modules** — shared fixtures and test aspects belong
in `core/tests`, not in any production module, so they don't pollute the
production dependency graph.

