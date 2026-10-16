---
name: client-gateway-port
description: Use when a Scala.js frontend needs to call a backend HTTP endpoint and turn the response into domain objects, when designing the frontend half of a hexagon, or when deciding whether a client-side data-fetch abstraction needs a transaction parameter
metadata:
  tags: [scala, scalajs, architecture, http, frontend]
---

# Client Gateway Port (Frontend Hexagon)

**Scope:** Scala 3 + Scala.js frontend consuming a ZIO-HTTP backend via a shared contract module

## Overview

The frontend is a hexagon too. It has driven ports (fetch data from the backend) and driven adapters (implement the fetch over HTTP). The shape mirrors a server-side repository port, with one structural difference: **no transaction context**. The client never manages a DB transaction, so the TX type parameter from [[scala3-tx-parameterized-repository]] is absent — the port is a plain effectful interface.

## When to Use

- Frontend (`*Js` module) needs data currently only reachable via a backend REST endpoint
- An existing shared contract module (see [[endpoint-contract-separation]]) already defines the DTOs both sides use
- Deciding where frontend fetch/decode code belongs relative to domain and contract modules

Do NOT use for server-to-server calls (that's a regular repository/gateway port, TX-parameterized if it touches persistence) or for UI state management (Laminar signals, component wiring — that's [[frontend-usecase-airstream-bridge]]).

## The Frontend `core` Folder Mirrors the Backend Hexagon — Loosely

A frontend build typically groups everything on this side of the ZIO/Airstream
boundary under one `core` package, structured like the backend's layers, with
names that drift slightly because "port" and "gateway" read more naturally
than "repository" and "infra" for an outbound HTTP call:

```
core.ports       — driven port interfaces (this skill's "port")
core.gateways    — adapters implementing a port (this skill's "adapter";
                   "infra" would be the backend word for the same role)
core.usecases    — s4y.app.UseCaseCommand + s4y.app.UseCase[C], the exact
                   same trait as the backend ([[usecase-command]]) — not a
                   frontend-specific reinvention, imported and used as-is
```

Don't be picky about the port/repository or gateway/adapter/infra naming
divergence — it's the same role playing under a locally-preferred name, same
way `Operations`/`Workflows` names a role rather than mandating a literal
class name. What must **not** diverge is the `UseCaseCommand`/`UseCase[C]`
shape itself in `core.usecases` — that one is worth keeping byte-for-byte
identical to the backend so the frontend never invents a second application
pattern.

## Module Layout

```
features.X.client                    — shared sources, no platform mvnDeps of its own
features.X.client.clientJvm          — port, JVM: depends on domain.domainJvm (+ core.domain.errors)
features.X.client.clientJs           — port, JS:  depends on domain.domainJs (+ core.domain.errors.errorsJs)
features.X.client.http               — shared sources
features.X.client.http.httpJvm       — HTTP adapter, JVM: depends on clientJvm + contracts.http.httpJvm + core.http.gateway
features.X.client.http.httpJs        — HTTP adapter, JS:  depends on clientJs + contracts.http.httpJs + core.http.gateway.gatewayJs
```

Cross-compile both to JVM+JS even though the port only ever *runs* on JS in
production — a JVM build lets a JVM test spin up a real server and a real
sttp JVM backend and exercise the exact same gateway code the browser will
use, without a browser (see `client-gateway-jvm-contract-test`). The
port module stays adapter-agnostic — swapping HTTP for a mock or a different
transport means adding a new adapter module, not touching `client`.

## Core Pattern

```scala
// features.X.client — the port. Returns the shared domain VO, not a
// port-local case class — the same LanguagesDescriptor the backend's use
// case returns, so there is exactly one shape for this data across the
// whole app, not a third one invented at the client boundary.
package s4y.vocabla.client

import s4y.repositories.errors.InfraFailure
import s4y.vocabla.domain.vo.LanguagesDescriptor
import zio.IO

trait LanguagesGateway:
  def getLanguages: IO[InfraFailure, LanguagesDescriptor]
```

```scala
// features.X.client.http — the adapter
package s4y.vocabla.client.http

import s4y.http.gateway.HttpGateway
import s4y.vocabla.contracts.http.LanguagesContract
import s4y.vocabla.contracts.http.LanguagesContract.LanguagesDescriptor as LanguagesDescriptorDto
import s4y.vocabla.domain.vo.LanguagesDescriptor
import zio.schema.codec.JsonCodec
import zio.{IO, ZIO}

final class LanguagesGatewayHttp(gateway: HttpGateway) extends LanguagesGateway:
  private val path = "/" + LanguagesContract.pathSegments.mkString("/")

  def getLanguages: IO[InfraFailure, LanguagesDescriptor] =
    gateway.getJson(path)                 // IO[InfraFailure | HttpError, String]
      .mapError(toInfraFailure)           // collapse union -> single client-facing error
      .flatMap(decode)                    // JSON -> DTO via shared Schema
      .map(toModel)                       // DTO -> domain, via contract's fromDomain/toDomain
```

## Rules

- **No TX parameter.** The client never threads a transaction; if a "port" ends up needing one, it has drifted into being a repository, not a client gateway.
- **Path segments live on the contract, not the adapter.** `LanguagesContract.pathSegments` is the single source of truth for the route; server (`Endpoint`) and client (`LanguagesGatewayHttp`) both derive from it so they cannot drift independently.
- **Error collapse happens at the adapter boundary.** `HttpGateway.getJson` returns a union (`InfraFailure | HttpError`); the port's return type is the single domain-facing `InfraFailure`. Map the union down inside the adapter — don't leak transport error types past `client.http`.
- **Decode via the contract's `Schema`, not a hand-rolled parser.** `JsonCodec.jsonCodec(schema).decodeJson(body)` using the `given Schema[Dto]` already derived on the contract DTO (see [[endpoint-contract-separation]]).
- **Map DTO to domain at the edge.** `Contract.Lang.toDomain(dto)` — the client module never returns raw DTOs to callers, same rule as the server route never leaking raw domain types outward.

## Common Mistakes

**TX parameter added "for consistency" with server repositories** — client has no transaction to parameterize over; adding one just adds unused generic noise. Leave it off.

**Adapter returns the transport union error directly** — callers (UI code) end up pattern-matching on `HttpError` cases that only make sense at the HTTP layer. Collapse to `InfraFailure` inside the adapter.

**Port module depends on `contracts.http` directly** — the port should only know about domain types (`Lang`, `LanguagesDescriptor`); only the adapter module should depend on the wire contract. Keeps the port swappable to a non-HTTP adapter later.

**Decoding without the shared `Schema`** — writing manual JSON decoding in the adapter duplicates what the contract module already derives, and silently drifts from the server's encoding when the DTO changes.

**Fabricating a sentinel value for a field the DTO dropped** — if the domain VO carries a field the contract DTO doesn't (because it was forgotten, not because it's genuinely server-only), `toDomain` ends up inventing a placeholder:

```scala
// WRONG — DTO has no weight fields; toDomain fabricates -1 for both,
// silently lying to every caller that reads lang.weightIso1
def toDomain(dto: Lang): DomainLang =
  DomainLang(..., weightIso1 = -1, weightIso2 = -1)
```

The fix is almost always to add the field to the DTO (static reference data
like this costs nothing to serialize) rather than inventing a sentinel. If a
field is genuinely server-only, model it as `Option` on the domain VO, not
a magic number the caller has to know means "absent."

**Port-local response type duplicating the shared domain VO** — defining a
`case class GetLanguages(...)` inside the client port module when the domain
module already has `LanguagesDescriptor` creates a third representation of
the same data (domain VO, contract DTO, client-port type) where two should
exist. Return the domain VO directly from the port.
