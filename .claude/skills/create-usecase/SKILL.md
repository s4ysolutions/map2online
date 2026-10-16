---
name: create-usecase
description: Use when asked to create, scaffold, or add a new use case, feature endpoint, or application service.
metadata:
  tags: [architecture, scala, zio, scaffold]
---

# Create a Use Case — Full Vertical Slice

**Scope:** ZIO 2.x / Scala 3 / hexagonal architecture

## Overview

A use case is one vertical slice through all layers. Top-to-bottom order when building:

```
1. Command              (feature.app.usecases)
2. Domain port(s)       (feature.domain.workflows.ports/ — if new I/O needed)
3. Domain workflow      (feature.domain.workflows — if business logic touches a port)
4. Use case class       (feature.app.usecases)
5. Infra adapter(s)     (feature.infra.db / .gateway / .memory — if new port added)
6. Layer declaration    (companion makeLayer / bundledLayer)
7. Composition root     (wire into the app layer graph)
8. Presentation         (feature.presentation.http — route calls UseCase[C])
```

Cross-references: `usecase-command` for Command/UseCase[C] structure and base vs ZIO variant decision, `hexagonal-feature-layout` for file placement, `zio-layer-composition` for wiring shapes, `scala3-tx-parameterized-repository` for DB use cases, `domain-operations-and-workflows` for operation vs workflow decision.

---

## Worked Example — "Get list of providers"

### 1. Command

File: `feature/app/usecases/GetProvidersCommand.scala`

```scala
package myapp.providers.app.usecases

import myapp.providers.domain.vo.Provider
import myapp.core.domain.errors.InfraFailure
import myapp.core.app.zio.UseCaseCommand  // ZIO variant: pins Response = IO[E, A]

final case class GetProvidersCommand(activeOnly: Boolean)
    extends UseCaseCommand:
  override type E = InfraFailure
  override type A = List[Provider]
```

No I/O, transport, or DB types here. Fields = what the caller supplies; `E`/`A` = domain error + result.
`UseCaseCommand` from `core.app.zio` — use this in all ZIO features; see `usecase-command` for the base vs ZIO variant decision.

### 2. Domain port (if new I/O needed)

File: `feature/domain/workflows/ports/ProviderRepository.scala`

```scala
package myapp.providers.domain.workflows.ports

import myapp.providers.domain.vo.Provider
import myapp.core.domain.errors.InfraFailure
import myapp.core.infra.TransactionContext
import zio.ZIO

trait ProviderRepository[TX <: TransactionContext]:
  def listAll(activeOnly: Boolean)(using TX): ZIO[Any, InfraFailure, List[Provider]]
```

`TX` in signature, never named as `TransactionContextPg` here.
`InfraFailure` imported from `core.domain.errors` — its own module so pure `feature.domain` can depend on it without pulling in ZIO.

### 3. Domain workflow (if business logic + port call)

> ⚠️ **Stop and choose Shape A or B before writing code.** This decision is hard to reverse. See `domain-operations-and-workflows` § "Choosing the Workflow Shape" for the full trade-off. Short version:
> - **Shape A (static function)** — one caller today, stable deps → deps explicit in signature
> - **Shape B (ZIO service class)** — multiple callers OR deps likely to grow → non-TX deps hidden in constructor + ZLayer

File: `feature/domain/workflows/ProviderWorkflows.scala`
— object suffix `Workflows` signals effectful; pure-only logic would go in `ProviderOperations` instead.

**Shape A — static function (one caller, stable deps):**

```scala
package myapp.providers.domain.workflows

import myapp.providers.domain.workflows.ports.ProviderRepository
import myapp.providers.domain.vo.Provider
import myapp.core.domain.errors.InfraFailure
import myapp.core.infra.{TransactionContext, TransactionManager}
import zio.Tag

object ProviderWorkflows:
  def listProviders[TX <: TransactionContext: Tag](
      activeOnly: Boolean,
      repo: ProviderRepository[TX],
      tm: TransactionManager[TX]
  ): ZIO[Any, InfraFailure, List[Provider]] =
    tm.transaction("list-providers") { repo.listAll(activeOnly) }
```

**Shape B** — same method body, but non-TX deps move into the class constructor and a companion `layer` (`ZLayer.fromFunction`); see `domain-operations-and-workflows` § "Choosing the Workflow Shape" for the full code.

`R` = domain ports only. No infra type in `R`.
TX-parameterized deps (`ProviderRepository[TX]`, `TransactionManager[TX]`) stay explicit in both shapes — they cannot be hidden because TX is fixed at the use-case level.

Skip this step if the use case is pure (no I/O) — put logic directly in the use case class using domain Operations.

### 4. Use case class

File: `feature/app/usecases/GetProvidersUseCase.scala`

```scala
package myapp.providers.app.usecases

import myapp.providers.domain.workflows.ProviderWorkflows
import myapp.providers.domain.workflows.ports.ProviderRepository
import myapp.providers.domain.vo.Provider
import myapp.core.domain.errors.InfraFailure
import myapp.core.app.zio.UseCase
import myapp.core.infra.{TransactionContext, TransactionManager}
import zio.{ZIO, Tag, URLayer, ZLayer}

class GetProvidersUseCase[TX <: TransactionContext: Tag](
    tm: TransactionManager[TX],
    repo: ProviderRepository[TX]
) extends UseCase[GetProvidersCommand]:
  def apply(command: GetProvidersCommand): IO[InfraFailure, List[Provider]] =
    ProviderWorkflows.listProviders[TX](command.activeOnly)
      .provide(ZLayer.succeed(tm), ZLayer.succeed(repo))
      // ↑ the one allowed .provide: wrapping already-constructed constructor
      //   fields — see zio-layer-composition's "one allowed exception"
```

**Alternative — no workflow, inline orchestration (simple cases):**

```scala
class GetProvidersUseCase[TX <: TransactionContext: Tag](
    tm: TransactionManager[TX],
    repo: ProviderRepository[TX]
) extends UseCase[GetProvidersCommand]:
  def apply(command: GetProvidersCommand): IO[InfraFailure, List[Provider]] =
    tm.transaction("list-providers") { repo.listAll(command.activeOnly) }
```

### 5. Infra adapter (if new port)

File: `feature/infra/db/ProviderRepositoryPg.scala`

```scala
package myapp.providers.infra.db

import myapp.providers.domain.workflows.ports.ProviderRepository
import myapp.providers.domain.vo.Provider
import myapp.core.domain.errors.InfraFailure
import myapp.core.infra.pg.TransactionContextPg
import zio.{ZIO, ZLayer}

class ProviderRepositoryPg extends ProviderRepository[TransactionContextPg]:
  def listAll(activeOnly: Boolean)(using ctx: TransactionContextPg)
      : ZIO[Any, InfraFailure, List[Provider]] =
    pgQuery(ctx.connection, sql"SELECT ... WHERE active = $activeOnly", ...)

object ProviderRepositoryPg:
  val layer: ULayer[ProviderRepository[TransactionContextPg]] =
    ZLayer.succeed(new ProviderRepositoryPg)
```

### 6. Layer declaration in use case companion

```scala
object GetProvidersUseCase:
  // Shape 1 — thin companion, full wiring at composition root (default)
  def makeLayer[TX <: TransactionContext: Tag]
      : URLayer[TransactionManager[TX] & ProviderRepository[TX], UseCase[GetProvidersCommand]] =
    ZLayer.fromFunction(new GetProvidersUseCase[TX](_, _))
```

Shape 2 (`bundledLayer` — companion bundles the wiring structure, infra passed as param) exists for use cases shared across multiple products; full code in `zio-layer-composition` § "Wiring Shapes".

### 7. Composition root

```scala
val getProvidersLayer: Layer[InfraFailure, UseCase[GetProvidersCommand]] =
  (txManagerLayer ++ ProviderRepositoryPg.layer) >>> GetProvidersUseCase.makeLayer[TXDB]
```

### 8. Presentation (route)

See `zio-http-endpoint` for the full pattern. Minimal shape:

```scala
// feature/presentation/http/ProvidersRoutes.scala
object ProvidersRoutes:
  // no Dto suffix — class name becomes the OpenAPI component name
  // (rule owned by endpoint-contract-separation)
  case class ProvidersResponse(...)
  object ProvidersResponse:
    given Schema[ProvidersResponse] = DeriveSchema.gen

  def endpoint(prefix: PathCodec[Unit]) =
    Endpoint(Method.GET / prefix / "providers")
      .tag("Providers")
      .out[ProvidersResponse]

  def route(endpoint: ..., useCase: UseCase[GetProvidersCommand]): Route[Any, Response] =
    endpoint.implement(_ =>
      useCase(GetProvidersCommand(activeOnly = true))
        .map(ProvidersResponse.fromDomain)
        .mapError { case InfraFailure(_, _) => InternalServerError500("Internal error") }
    )
```

- Route receives `UseCase[GetProvidersCommand]` — never `GetProvidersUseCase[TransactionContextPg]`
- DTOs and `Schema` derivation live in the route object, not in domain
- Domain error → `HttpError` mapping via `.mapError { ... }` inside `implement`
- Middleware (`BrowserLocale`, auth) applied at the composition root, not here

---

## Decision Rules

**Need a domain workflow?**
- Pure filtering/transformation only → no workflow; logic in use case class directly
- Calls a port (DB, external API, cache) → workflow in `domain.workflows`
- Multiple use cases share the same port-calling logic → definitely a workflow

**Workflow Shape A or B?**
- One caller today, stable deps → Shape A (static function, explicit deps)
- Multiple callers OR non-TX deps likely to grow → Shape B (ZIO service class, deps in constructor)
- TX-parameterized deps stay explicit in both shapes

**Shape 1 vs Shape 2?**
- Single product → Shape 1
- Multiple products with different infra → Shape 2

**New port or reuse existing?**
- New I/O capability → new port interface in `domain.workflows.ports`
- Same I/O, different use case → reuse existing port, add method if needed

---

## Checklist

- [ ] Command has `E` and `A` type members; `E` is a domain error or `InfraFailure` — never raw `Throwable`; no infra/transport types as fields
- [ ] Port interface carries `TX` type param; `using ctx: TX` on every method
- [ ] Workflow `R` = domain ports only; no infra type in `R`
- [ ] Use case class holds `TransactionManager[TX]` + `Repository[TX]` — both abstract
- [ ] `TransactionContextPg` / concrete TX named only in infra adapter and composition root
- [ ] `TransactionManager.transaction` typed `[R, E, A]` with `ZIO[R, InfraFailure | E, A]` in both positions — domain errors from inside the tx propagate out
- [ ] No long-running I/O (network, gateway calls) inside a transaction — only fast local port calls
- [ ] Layer wired with `>>>` / `++`; no `provide` / `provideSomeLayer` at composition root
- [ ] Presentation injects `UseCase[C]`, never the concrete class

