---
name: layers-to-modules
description: Use when deciding how many build modules a hexagonal layer maps to, when creating or naming a domain sub-module (domain.operations, domain.workflows), or when a domain module pulls in ZIO and you want to know if that is correct
metadata:
  tags: [architecture, language-agnostic, build-system-agnostic]
---

# Mapping Hexagonal Layers to Build Modules

**Scope:** language-agnostic, build-system-agnostic

## Overview

The hexagonal layer map (`hexagonal-feature-layout`) is a *logical* structure.
Build modules are a *physical* enforcement mechanism (`module-separation`).
They do not have to be 1-to-1. A layer can be one module, or split into
several — the right choice depends on whether sub-parts of that layer have
genuinely different dependency surfaces. This skill gives the decision rules.

For the dependency rules (which module may import which) see `module-separation`.
For the wiring rule (concrete types named only at the composition root) see `composition-root`.

## The Core Principle

**Split a layer into multiple modules only when the parts have different
dependency surfaces that matter.** "Different" means: one part pulls in a
library or another module that the other part must not see, and that
restriction has a concrete benefit (cross-platform compatibility, smaller
classpaths, enforced purity, faster incremental compilation).

Splitting for organizational reasons alone (files feel cleaner in separate
directories) is not sufficient — use packages/directories within one module
instead.

## Layer-by-Layer Analysis

### `domain` layer

Default is **two modules**, split by ZIO-or-not:

| Concern | Module | Deps |
|---------|--------|------|
| VOs, domain errors, operations | `feature.domain` | plain Scala, zio-prelude; **no ZIO effect runtime** |
| Port interfaces (repositories, gateways), domain workflows | `feature.domain.workflows` | ZIO + `feature.domain` |

**This split is the default, not a special case.**

`feature.domain` must never acquire the ZIO effect runtime — the compiler enforces this at the module level. Port interfaces return `ZIO[...]`, so they cannot live in `feature.domain`. They belong in `feature.domain.workflows`, alongside the domain workflows that call them.

```
feature.domain           ← VOs, errors, operations; zio-prelude only
feature.domain.workflows ← port interfaces, domain workflows; ZIO + depends on domain
```

`feature.domain.workflows` depends on `feature.domain` (for VOs and error types used
in port signatures). Every other layer that needs port interfaces depends on
`feature.domain.workflows`, not on `feature.domain` alone.

**Three modules when a Scala.js frontend needs the domain VOs.** Cross-platform
sharing is a *third* axis beyond "does this pull ZIO" — VOs need to compile to
JS (see [[client-gateway-port]]), but domain operations and workflows do not,
and dragging them along would pull JVM-only or effect-runtime dependencies
into the browser bundle for no reason. Split `feature.domain` itself in two:

```
feature.domain.vo         ← VOs, domain errors only; cross-compiled (base + voJs)
                            deps: zio-prelude only — no ZIO, no JVM-only libs
feature.domain.operations ← pure domain operations; JVM-only
                            deps: feature.domain.vo (+ any JVM-only helper, e.g. i18n)
feature.domain.workflows  ← port interfaces, domain workflows; ZIO; JVM-only
                            deps: feature.domain.vo, feature.domain.operations
```

The dependency-surface test that drives this: `vo` must never depend on
anything that can't cross-compile (no `core.i18n.jvm`, no ZIO effect runtime);
`operations` can depend on JVM-only libraries (it's still pure — no ZIO — but
JVM-only, e.g. an i18n resource-loading helper) precisely *because* it's never
cross-compiled; `workflows` sits on top of both, ZIO-only, still JVM-only. A
frontend module depends on `domain.vo` (its cross-compiled `voJs` variant)
and never touches `domain.operations`/`domain.workflows` at all.

Don't make this split by default — only when a real frontend module actually
needs to import the VOs. A backend-only feature stays on the two-module
default; the three-way split is what "operations/workflows aren't
cross-compiled, VOs are" looks like once cross-compilation is real, not a
speculative "might need this later" restructuring.

### `app` layer

Typically one module: `feature.app`. It depends on `feature.domain.workflows`
(for port interfaces to call) and `core.app`. Must not depend on any infra or
presentation module.

Split `app` into multiple modules only if different use-case groups need
genuinely different external libraries (rare). In practice, `feature.app`
stays as one module.

### `infra` layer

Always split by *technology*, not by feature concern:

```
feature.infra.pg       ← PostgreSQL adapter; deps: feature.domain.workflows, core.infra.pg
feature.infra.memory   ← in-memory adapter; deps: feature.domain.workflows, core.infra.memory
feature.infra.llm      ← LLM gateway; deps: feature.domain.workflows, HTTP client libs
feature.infra.s3       ← file storage adapter; deps: feature.domain.workflows, S3 client
```

Each infra sub-module depends on `feature.domain.workflows` (not `feature.domain` alone)
because it must see the port interfaces it implements. Infra sub-modules must **not**
depend on each other.

### `presentation` layer

Split by *framework*, not by route group:

```
feature.presentation.zioHttp   ← all HTTP routes for this feature
feature.presentation.cli       ← CLI entry point (if it exists)
```

Do not split `presentation.zioHttp` further into per-route sub-modules — that
produces fine-grained modules with almost no dependency-surface difference.
Keep routes as packages/directories within `feature.presentation.zioHttp`.

## Summary Decision Table

| Layer | Default | Split when |
|-------|---------|-----------|
| `domain` | `feature.domain` + `feature.domain.workflows` | always — different dep surfaces (ZIO vs no-ZIO); split the pure side further into `domain.vo` + `domain.operations` once a frontend needs to cross-compile the VOs |
| `app` | one module | genuinely different external lib requirements per use-case group (rare) |
| `infra` | one sub-module per technology | always split by technology; never merge two technologies |
| `presentation` | one sub-module per framework | always split by framework; never split by route group |

## Naming Conventions

| What | Convention | Rationale |
|------|-----------|-----------|
| Domain pure module (two-way split) | `feature.domain` | pure root — VOs, errors, operations |
| Domain effectful sub-module | `feature.domain.workflows` | ports + workflows that use ZIO |
| Domain VO sub-module (three-way split) | `feature.domain.vo` | cross-compiled leaf; the only part a frontend imports |
| Domain pure-but-JVM-only sub-module (three-way split) | `feature.domain.operations` | pure (no ZIO) but not cross-compiled — may depend on JVM-only helper libs `vo` cannot |
| Infra sub-modules | `feature.infra.<technology>` (`pg`, `memory`, `llm`, `s3`) | technology, not concern |
| Presentation sub-modules | `feature.presentation.<framework>` (`zioHttp`, `cli`) | framework, not route |

Avoid:
- `feature.domain.core` or `feature.domain.pure` — "domain" is already the pure module; adding "core/pure" implies the parent is impure
- `feature.domain.operations` as a module name **when there is no cross-compilation need** — with only the two-way split, operations live inside `feature.domain`, not a sub-module. Once `domain.vo` exists because a frontend cross-compiles it, `domain.operations` as a sibling sub-module is correct, not a mistake — see the three-way split above.
- `feature.infra.db` — too generic; name the technology (`pg`, `mysql`, `mongo`)
- `feature.presentation.rest` — too generic; name the framework (`zioHttp`, `http4s`, `akkaHttp`)

## Common Mistakes

**`feature.domain` depending on ZIO** — port interfaces return `ZIO[...]` and must live in
`feature.domain.workflows`. Any ZIO import in `feature.domain` violates the purity boundary;
the compiler catches this as a missing module dep if the split is in place.

**Infra or app depending on `feature.domain` instead of `feature.domain.workflows`** — port
interfaces are in `feature.domain.workflows`; a module that implements or calls ports must
declare `feature.domain.workflows` in its `moduleDeps`, not just `feature.domain`.

**One `feature.infra` module containing both PG and memory adapters** — they
have different external dependencies; keeping them together forces every
consumer (including tests) to pull in both.

**Splitting `presentation.zioHttp` by route group** — routes share the same
framework dep and are rarely compiled in isolation; the split produces noise
without benefit. Use packages.

**Naming the effectful sub-module `feature.domain.core`** — "core" implies a more
fundamental module, but it would be the effectful one (ZIO). Use `feature.domain.workflows`.

**Cross-compiling all of `feature.domain` because one VO needs the frontend** —
bundling operations (and their JVM-only deps, e.g. an i18n loader) into the `*Js`
variant either fails on Scala.js or forces a JS substitute for a dep that never
needed one. Split `vo` out first; only `vo` gets the `*Js` variant. The three-way
split (per "Three modules…" above) isn't optional once real cross-compilation
exists.

