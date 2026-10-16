---
name: zio-layer-composition
description: Use when wiring ZIO ZLayer graphs, when a layer fails to compile due to missing dependencies, when deciding between ZLayer.fromFunction and ZLayer.fromZIO, or when a layer is being assembled in the wrong module
metadata:
  tags: [zio, scala, dependency-injection]
---

# ZIO Layer Composition

**Scope:** ZIO 2.x specific

## Overview

`ZLayer` is ZIO's dependency injection mechanism. Layers are assembled bottom-up at the composition root using `>>>` (sequential) and `++` (parallel/additive). Construction logic goes in the layer; business logic goes in the service.

## Core Grammar

```scala
// Sequential: A provides B's dependency
val bLayer: ZLayer[Any, E, B] = aLayer >>> ZLayer { ... }

// Additive: A and B have no dependency on each other
val abLayer: ZLayer[Any, E, A & B] = aLayer ++ bLayer

// Feeding: aLayer + bLayer together provide C's dependencies
val cLayer: ZLayer[Any, E, C] =
  (aLayer ++ bLayer) >>> ZLayer.fromZIO { ... }
```

## `fromFunction` vs `fromZIO`

| Use | When |
|-----|------|
| `ZLayer.fromFunction(MyService(_))` | Constructor takes only services from env — pure, no effects |
| `ZLayer.fromZIO { ZIO.serviceWith[...] { ... } }` | Construction requires an effectful step (e.g., reading config, opening a pool) |

Prefer `fromFunction` — it signals pure construction and is more readable. Use `fromZIO` only when the constructor itself has effects.

## Layer Graph at Composition Root

```scala
// infra layers (bottom)
val pgDataSourceLayer: Layer[InfraFailure, DataSource] = ...
val txManagerLayer: Layer[InfraFailure, TransactionManager[TXDB]] =
  pgDataSourceLayer >>> TransactionManagerPg.layer

// repo (infra) + use case (app) layers (middle)
val usersRepoLayer: ULayer[UsersRepository[TXDB]] = UsersRepositoryPg.layer
val registerUserLayer: Layer[InfraFailure, UseCase[RegisterCommand]] =
  (txManagerLayer ++ usersRepoLayer) >>> RegisterUserUseCase.makeLayer[TXDB]

// presentation layers (top)
val httpLayer: Layer[InfraFailure, MyZioHttp] =
  registerUserLayer >>> MyZioHttp.layer
```

## `makeLayer` Companion Convention

Each service exposes its layer in the companion object. **The name encodes whether the layer is a stable value or built per call:**

| Name | Form | Meaning |
|------|------|---------|
| `val layer` | value | one fixed layer — every reference is the same instance |
| `def makeLayer[...](...)` | function | each call builds a **new** layer (takes type or term params, e.g. `[TX]`, an infra layer) |

A layer parameterised by anything (a `TX` type, a passed-in dependency layer) cannot be a `val` — it is a function of its parameters, so it is `def makeLayer`. A layer with no parameters is a `val layer`. Reading the name alone tells you whether the result is shared or freshly constructed.

The layer's input type documents the service's dependencies:

```scala
object RegisterUserUseCase:
  def makeLayer[TX <: TransactionContext: zio.Tag]
      : URLayer[TransactionManager[TX] & UsersRepository[TX],
                UseCase[RegisterCommand]] =
    ZLayer.fromFunction(new RegisterUserUseCase[TX](_, _))
```

## Memoization

ZIO memoizes layers by default — if two downstream layers depend on the same layer, it is built once and shared. This is almost always correct.

Use `.fresh` to opt out:

```scala
myApp.provideLayer(sharedLayer.fresh ++ otherLayer)  // sharedLayer built fresh for each consumer
```

Common trap: two connection pools collapsing to one because the pool layer is shared. If you need distinct instances, `.fresh`.

## `ZLayer.derive`

For simple constructors (case class or trait with constructor params), `ZLayer.derive` replaces hand-written `fromFunction`:

```scala
case class MyService(repo: UsersRepository[TXDB], tm: TransactionManager[TXDB])

object MyService:
  val layer: URLayer[UsersRepository[TXDB] & TransactionManager[TXDB], MyService] =
    ZLayer.derive[MyService]
```

Use when the constructor is a straightforward field injection. Use `fromFunction` / `fromZIO` when there's custom construction logic.

## Rules

**Never use `provide` for layer wiring.** `provide` auto-resolves the dependency graph by type — if two layers satisfy the same type, the selection is implicit and the error appears far from the source. Always wire explicitly with `>>>` (sequential) and `++` (additive); the graph is then visible in code and any missing dependency is a compile error at the exact wiring site.

**The one allowed exception:** a local `.provide(ZLayer.succeed(x), ...)` where `x` is an already-constructed value held in hand (e.g. a constructor field being passed into a workflow's `R`). No graph is being auto-resolved — the value exists; `ZLayer.succeed` just adapts it. The ban targets building a dependency graph from abstract types, not wrapping concrete values.

```scala
// WRONG — auto-wiring, silent ambiguity risk
myApp.provide(useCaseLayer, repoLayer, txManagerLayer, dataSourceLayer)

// CORRECT — explicit graph
// `++` binds tighter than `>>>` in Scala — parenthesize each side explicitly
val appLayer =
  ((dataSourceLayer >>> txManagerLayer) ++ repoLayer) >>> useCaseLayer
myApp.provideLayer(appLayer)
```

## Wiring Shapes

Two valid shapes. Choose by how many products share the same use case.

**Shape 1 — thin use case, wiring at composition root.**
Use case `makeLayer` (shown above in "makeLayer Companion Convention") declares its deps; product wires the full graph.

```scala
// product (composition root) — wires the full graph
val appLayer: Layer[InfraFailure, UseCase[RegisterCommand]] =
  (txManagerLayer ++ UsersRepositoryPg.layer) >>> RegisterUserUseCase.makeLayer[TXDB]
```

Default choice. Simple, all wiring visible in one place.

**Shape 2 — use case companion owns the wiring structure.**
Companion bundles the internal graph pattern; infra layers are still passed from outside.
Reduces duplication when multiple products share the same use case.

```scala
// use case companion — owns wiring structure, infra layers are params
object RegisterUserUseCase:
  // makeLayer as in Shape 1, plus:
  def bundledLayer[TX: zio.Tag](
      repoLayer: URLayer[Any, UsersRepository[TX]]   // caller supplies concrete infra
  ): URLayer[TransactionManager[TX], UseCase[RegisterCommand]] =
    (ZLayer.service[TransactionManager[TX]] ++ repoLayer) >>> makeLayer[TX]

// product A — concrete infra named here only
val appLayerA: Layer[InfraFailure, UseCase[RegisterCommand]] =
  txManagerLayer >>> RegisterUserUseCase.bundledLayer(UsersRepositoryPg.layer)

// product B (e.g. test harness) — different infra, same structure
val appLayerB =
  memTxManagerLayer >>> RegisterUserUseCase.bundledLayer(UsersRepositoryMemory.layer)
```

Invariant preserved: concrete infra classes (`UsersRepositoryPg`, `UsersRepositoryMemory`) named only at the product call site, not inside the companion.

**Shared config: take it as input, don't embed it per branch.** If several parallel (`++`) branches each
embed the same config layer via `>>>`, a config failure surfaces once per branch (N identical logs, not
a double-init — memoization still builds `authConfigLayer` once). Fix by making each branch take the
config as *input* and threading it once, sequentially, ahead of the `++`:

```scala
// BAD — every branch embeds the config layer; N failure logs for one root cause
val kmsLayer: ZLayer[Any, E, KmsGateway]         = authConfigLayer >>> ZLayer.service[AuthConfig].flatMap { ... }
val passwordLayer: ZLayer[Any, E, PasswordPolicy] = authConfigLayer >>> ZLayer.service[AuthConfig].flatMap { ... }
val useCasesLayer = kmsLayer ++ passwordLayer ++ ...

// GOOD — config threaded once; branches take it as input, become independently testable with a stub
val kmsLayer: ZLayer[AuthConfig, E, KmsGateway]         = ZLayer.service[AuthConfig].flatMap { env => ... }
val passwordLayer: ZLayer[AuthConfig, E, PasswordPolicy] = ZLayer.service[AuthConfig].flatMap { env => ... }
val useCasesLayer: ZLayer[AuthConfig, E, ...] = kmsLayer ++ passwordLayer ++ ...
val layer: ZLayer[Any, E, App] = authConfigLayer >>> useCasesLayer >>> App.layer  // fail-fast, one log line
```

## Common Mistakes

**Layer contains business logic** — `ZLayer.fromZIO { ... businessDecision ... }` — extraction belongs in a service method, not a layer factory.

**Services constructed with `new` outside any layer factory** — bypasses the DI graph; a dependency is now invisible to the compiler. Using `new` *inside* `ZLayer.fromFunction(new MyService(_))` is correct and expected.

**`>>>` with incompatible types** — compiler error means the right-hand layer has a requirement the left-hand layer does not provide; check the `R` type of the downstream layer.

**Parallel branches each embedding the same config layer** — N identical failure logs for one root cause; make each branch take the config as input instead (see above).

**`provide` / `provideSomeLayer` for graph wiring** — banned (the sole exception is the local `.provide(ZLayer.succeed(x))` over an already-constructed value, per "The one allowed exception" above). `provideSomeLayer` inside a use case is doubly wrong: use cases must not self-wire, and auto-resolution hides dependency bugs. Wire the graph with explicit `>>>` / `++` at the composition root only.

