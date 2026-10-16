---
name: domain-value-objects
description: Use when modelling domain concepts, when deciding where validation logic lives, when a domain type carries framework annotations, or when raw exceptions bubble up from infrastructure code
metadata:
  tags: [architecture, domain-modeling, language-agnostic]
---

# Domain Value Objects

**Scope:** language-agnostic, framework-agnostic

## Overview

Value objects (VOs) are immutable domain types that own their own invariants. Infrastructure errors are wrapped in typed containers. Serialization and framework concerns never enter the domain.

This skill covers the VO itself. For where VOs are used — pure business rules vs. effectful orchestration — see `domain-operations-and-workflows`. For `Validation`-based multi-field construction and `Subtype`/`Newtype` refinement, see `zio-prelude-domain-patterns`.

## Core Rules

**Validation inside the VO** — construction either succeeds with a valid object or fails with a domain error. A service that validates after construction is too late; validation scattered across callers is fragile.

```scala
// domain owns its invariants
final case class PublicKeyHash private (bytes: Array[Byte])
object PublicKeyHash:
  def from(spki: String): Either[InvalidKeyError, PublicKeyHash] = ...
```

This is correct for a single VO with a single invariant. When a constructor combines several already-validated VOs into a Command or aggregate, prefer accumulating validation over `Either`'s fail-fast — see `zio-prelude-domain-patterns` for the `Validation` pattern. Don't reach for it on a single-field VO; that's ceremony `Either` already covers.

**Typed error boundary** — never let raw `Throwable`/`Exception` from infra reach domain or application code. Wrap at the adapter boundary:

```scala
// infra adapter wraps before returning
case class InfraFailure(message: String, cause: Throwable)
```

**Layer-pure types** — a domain VO must import nothing from:
- Serialization frameworks (`zio-schema`, `Jackson`, `kotlinx.serialization`)
- ORM annotations (`@Entity`, `@Column`)
- HTTP types (`Response`, `StatusCode`)
- DI containers (`@Inject`, `ZLayer`)

Put those in the presentation or infra layer, with a mapping function.

**Domain errors are sealed hierarchies** — not strings, not generic exceptions:

```scala
enum RegisterError:
  case KeyAlreadyExists
  case InvalidKeyFormat(detail: String)
  case StorageUnavailable
```

## VO Checklist

- [ ] Immutable (no setters, copy-on-write)
- [ ] Validates on construction
- [ ] Imports only other domain types
- [ ] Has a typed companion error, not `Exception`
- [ ] No serialization annotations / schemas

## Common Mistakes

**`Schema[MyVO]` inside the VO class** — move to a `Codecs` or `Schemas` object in the presentation layer with an explicit `fromDomain` / `toDomain` conversion.

**Wrapping raw Throwable in domain error** — `case Failure(cause: Throwable)` in a domain enum leaks infrastructure details; use infra-specific error types in the adapter, map to semantic domain errors before crossing the boundary.

**Anemic VO + fat service** — a VO with only getters and a service doing all the work is procedural style; push logic that naturally lives on the value into the VO itself.

**Mutable VO for performance** — use immutable types by default; optimize only when measured.

