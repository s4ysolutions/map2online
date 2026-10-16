---
name: hexagonal-feature-layout
description: Use when structuring a bounded context with multiple adapters, when deciding where a class or function belongs, or when reviewing for layer violations such as framework imports in domain code or infrastructure types in application services
metadata:
  tags: [architecture, language-agnostic, framework-agnostic]
---

# Hexagonal Feature Layout

**Scope:** language-agnostic, framework-agnostic

## Overview

Each bounded context has four layers. Dependencies point inward only: presentation → app → domain ← infra. The domain never knows about any adapter.

## Layer Map

The domain is split into two build modules with different dependency surfaces
(see `module-separation` for build enforcement, `mill-module-layout` for Mill syntax):

```
domain/                  ← module: feature.domain (pure — zio-prelude only, NO ZIO)
  vo/                    Rich value objects with internal validation, domain errors
  operations/            Pure domain logic — no I/O, no effect type, no framework types
domain/workflows/        ← module: feature.domain.workflows (effectful — ZIO)
  ports/                 Outbound port interfaces + parameter objects grouping them
  workflows/             Effectful domain logic — ZIO[R, E, A], R = domain ports only
app/
  usecases/              Orchestration: builds params, calls the workflow; does
                         not open transactions itself (see `domain-operations-and-workflows`
                         § "Transactions")
infra/
  db/                    Driven adapter: persistent storage
  gateway/               Driven adapter: external APIs, third-party services
  memory/                Driven adapter: in-memory (static data or test doubles)
presentation/
  http/                  Driving adapter: REST routes, middleware
  cli/                   Driving adapter: command-line entry point
```

See `domain-operations-and-workflows` for the operations/workflows split and the
`R`/`E` discipline; `zio-prelude-domain-patterns` for what's allowed inside
`operations/` beyond plain Scala.

## Dependency Rules

Logical view only — the authoritative module-by-module dependency lists (incl. `core.*` deps and test sub-modules) are owned by `module-separation`; the domain/domain.workflows split decision is owned by `layers-to-modules`.

| Layer (module) | May import | Must NOT import |
|-------|-----------|----------------|
| `domain` (VOs, operations) | other domain types, zio-prelude | app, infra, presentation, **any effect type** (`zio.ZIO`, `cats.effect.IO`) |
| `domain.workflows` (ports, workflows) | `domain`, domain ports, ZIO effect type | app, infra, presentation, concrete infra types in `R` |
| `app` | `domain.workflows` (for port interfaces), `domain` | infra, presentation, framework DI |
| `infra` | `domain.workflows` (implements ports), matching core.infra | app, other feature infra |
| `presentation` | `app`, `domain` (pure module only — not `domain.workflows`) | infra directly |
| composition root | everything | — (it exists to wire, not to contain logic) |

Concrete infra types are named **only** at the composition root (see `composition-root` for the full rule). A workflow's `R` names a domain port, never the infra type that implements it — wiring the concrete implementation into that port happens via `ZLayer` at the composition root, not inside the workflow.

## What Goes Where

| Thing | Layer | Reason |
|-------|-------|--------|
| Field validation | domain/vo | VO knows its own invariants |
| Transaction boundary | domain.workflows | the workflow knows how many atomic units its own logic needs — zero, one, or several; app cannot know this and must not open one itself (exception: a use case with no workflow at all, see `domain-operations-and-workflows`) |
| Connection pooling | infra | implementation detail |
| HTTP status codes | presentation | wire protocol |
| JSON/schema annotations | presentation | serialization concern |
| Error mapping (infra → domain) | infra | adapter's responsibility |
| Retry / backoff logic | app | orchestration concern |
| Quota / rate-limit policy | domain workflow | needs a port to check current usage, even if the decision rule itself is pure |
| Parameter object grouping driven ports | domain.workflows | references port interfaces; cannot live in pure domain |

## Parameter Objects for Driven Ports

When a workflow needs several related driven ports (e.g. four gateway alternatives),
pass them as a single **parameter object** rather than four separate params.
"Parameter object" is a standard refactoring (Fowler, *Refactoring*) — group parameters
that naturally travel together into a named value.

```scala
// domain.workflows — lives here because TranslationGateway is a port interface
final case class TranslationGateways(
    openAi: Option[TranslationGateway],
    gemini: Option[TranslationGateway],
    qwen: Option[TranslationGateway],
    deepseek: Option[TranslationGateway]
):
  def select(provider: TranslationProvider): Option[TranslationGateway] = ...
  def configured: NonEmptySet[TranslationProvider] = ...
```

This is **not** a VO — it holds port references, not domain data. It belongs in
`domain.workflows` (not `domain`) for that reason: `domain` has no dependency
on `domain.workflows.repositories`, so any type referencing a port interface
must live in `domain.workflows` or deeper.

## Common Mistakes

**Transport errors in domain** — `RateLimitExceeded`, `DecodingFailed`, `NetworkError` are infra details. Domain errors express semantic intent: `QuotaExceeded`, `ServiceUnavailable`, `InvalidInput`. Infra adapters wrap raw errors into `InfraFailure` (from `core.domain.errors`) before returning — `InfraFailure` is the one typed wrapper that IS allowed in domain workflow `E`; specific library error types are not.

The same test run in reverse also matters: a bespoke error enum whose every case gets collapsed into `InfraFailure` at every call site anyway (`EncryptFailed(msg)` / `DecryptFailed(msg)`, both just `.mapError(e => InfraFailure(e.getMessage))`) isn't a domain error either — it's ceremony with a domain-shaped name. If nothing branches on the cases, delete the enum and return `InfraFailure` directly; keep a distinct enum only when a caller genuinely reacts differently per case (e.g. a social-login `InvalidToken` vs `UnknownProvider` mapping to different HTTP statuses).

**Port result/error type as a standalone file in `ports/`** — a type describing what one port's method returns or fails with (`ResolvedKey`, `SocialSubject`, `Throttled`) belongs nested in that port's own companion object (`AuthRepository.ResolvedKey`), not as a sibling file referenced by bare name. `ports/` holds one trait per file plus that trait's own nested result/error types — not free-floating data types with no home of their own.

**Framework DI in a domain operation** — `ZLayer`, `@Bean`, `@Injectable` wiring belongs in app or composition root. A domain workflow may *declare* a port requirement in `R`; it never *constructs* the `ZLayer` that satisfies it.

**Serialization type in domain VO** — a `Schema`, `Codec`, `@JsonProperty`, or any framework annotation on a domain type leaks the presentation framework inward.

**Service object inside a `vo/` package** — VOs, operations, and workflows are distinct concepts; give each its own directory.

**Calling anything a "domain service"** — the term hides whether it's pure or effectful. Classify it as an operation or a workflow; see `domain-operations-and-workflows`.

**App service controlling concrete TX type** — which transaction implementation is used is a composition-root decision, not an app decision.

**Use case opens `tm.transaction(...)` and inlines the repo call** — no Workflow object at all, the repo call and any derived-value logic sit directly in the use case's `apply`. This both violates the transaction-ownership rule above and skips the Operation/Workflow split from `domain-operations-and-workflows` in one move — the tell is a use case body that's more than "build params, call one workflow/port, map the result."

