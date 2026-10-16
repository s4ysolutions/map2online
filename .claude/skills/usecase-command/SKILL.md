---
name: usecase-command
description: Use when designing the boundary between presentation and application layers, when a route or controller is growing business logic, or when a use case is tightly coupled to a specific transport or persistence technology
metadata:
  tags: [architecture, language-agnostic, framework-agnostic]
---

# Use Case / Command Pattern

**Scope:** language-agnostic pattern; ZIO-specific signatures shown below. **Backend only** — frontend (Scala.js) use cases are a different concept (class owning UI state, bridging ZIO into Airstream, no Command/UseCase[C], no TX); see `frontend-usecase-airstream-bridge`.

## Overview

A **command** is a plain data object describing intent. A **use case** is an abstract handler that accepts a command and returns a typed response. Presentation depends only on the `UseCase[C]` abstraction — never on the concrete implementation or on infrastructure types.

## Structure

```scala
// core/app — framework-agnostic base (no ZIO dep)
trait UseCaseCommand:
  type Response

trait UseCase[T <: UseCaseCommand]:
  def apply(command: T): command.Response   // path-dependent return type

// core/app/zio — ZIO-specific sub-layer; pins Response to IO[E, A]
trait UseCaseCommand extends s4y.app.UseCaseCommand:
  type E                          // domain error type
  type A                          // result type
  type Response = IO[E, A]

object UseCase:
  // ZIO helper: call a use case from a ZIO route without holding a direct reference
  def useCase[T <: s4y.app.zio.UseCaseCommand](command: T)(using zio.Tag[UseCase[T]])
      : ZIO[UseCase[T], command.E, command.A] =
    ZIO.serviceWithZIO[UseCase[T]](_(command))
```

Both packages name their type `UseCaseCommand` — controversial but intentional: a
feature command imports `s4y.app.zio.UseCaseCommand` and extends it; the concrete
use case implements `s4y.app.UseCase[T]` (the trait is in the base package).
Scala resolves these by import — there is no ambiguity at use sites because only
one package is imported per file.

The concrete use case **always** implements `s4y.app.UseCase[T]` — the base trait,
not a ZIO-specific one. The return type of `apply` is `command.Response`, which
resolves to `IO[E, A]` via the path-dependent type when the command extends the ZIO
variant. The ZIO variant contributes the type binding only; the trait being
implemented is always the base `UseCase[T]`.

**Which variant to use:**
- `s4y.app.zio.UseCaseCommand` — when `apply` touches a port (DB, gateway, cache); `Response = IO[E, A]`
- `s4y.app.UseCaseCommand` — when `apply` is pure: returning a constant, reading from a command field, or calling a domain Operation with no I/O

**Wiring pure use cases — `given` vs class + ZLayer:**

| Shape | When | Benefit | Cost |
|-------|------|---------|------|
| `given UseCase[C]` in companion | No external runtime deps | Free with import — no ZLayer registration needed | Inconsistent with effectful use cases wired via ZLayer |
| class + `ZLayer.fromFunction` | External runtime dep (e.g. `TranslationGateways`) | Explicit, uniform with effectful wiring | Boilerplate; must register in composition root |

```scala
// Constant result, no deps — given in companion
final class GetModesCommand extends UseCaseCommand:
  override type Response = NonEmptySet[TranslationMode]
object GetModesCommand:
  given UseCase[GetModesCommand] with
    def apply(cmd: GetModesCommand): NonEmptySet[TranslationMode] =
      TranslatorOperations.modesSupported

// Result varies by command field — still no external dep, given still works
final class GetQualitiesCommand(val provider: TranslationProvider) extends UseCaseCommand:
  override type Response = NonEmptySet[TranslationQuality]
object GetQualitiesCommand:
  given UseCase[GetQualitiesCommand] with
    def apply(cmd: GetQualitiesCommand): NonEmptySet[TranslationQuality] =
      cmd.provider.qualities   // derived from command field, not an injected dep

// External runtime dep — class + ZLayer
final class GetProvidersCommand extends UseCaseCommand:
  override type Response = NonEmptySet[TranslationProvider]
object GetProvidersCommand:
  final class GetProvidersUseCase(gateways: TranslationGateways) extends UseCase[GetProvidersCommand]:
    def apply(cmd: GetProvidersCommand): NonEmptySet[TranslationProvider] = gateways.configured
  val layer: ZLayer[TranslationGateways, Nothing, UseCase[GetProvidersCommand]] =
    ZLayer.fromFunction(GetProvidersUseCase(_))
```

The `GetQualitiesCommand` case is important: even when the result varies by input, `given` works as long as everything needed is in the command itself. The dividing line is **external runtime values** (configuration, port outputs, injected dependencies), not result variability.

If a ZIO route needs the `given` instance in the layer graph: `ZLayer.succeed(summon[UseCase[GetModesCommand]])` — no implementation duplication.

```scala
// command definition (feature layer) — uses ZIO variant
final case class RegisterPublicKeyCommand(spki: PublicKeySPKI, credentials: Credentials)
    extends s4y.app.zio.UseCaseCommand:
  override type E = RegisterError
  override type A = Unit

// concrete use case (feature.app) — implements base trait
class RegisterUserUseCase[TX <: TransactionContext](
    tm: TransactionManager[TX],
    repo: AuthRepository[TX]
) extends s4y.app.UseCase[RegisterPublicKeyCommand]:
  def apply(command: RegisterPublicKeyCommand): IO[RegisterError, Unit] = ...
```

## Key Properties

**Command carries its response type as a type member** — `type Response = IO[E, A]` on the command means callers are statically typed to the command's own error and result without knowing the concrete use case.

**Presentation depends only on `UseCase[C]`** — the route receives `UseCase[RegisterPublicKeyCommand]`, never `RegisterUserUseCase[TransactionContextPg]`. TX type and repo are invisible.

**The Workflow owns the transaction boundary, not the use case** — the workflow takes `TransactionManager[TX]` and calls `TransactionManager.transaction { ... }` itself, once per atomic unit it needs; the use case's `apply` is a pass-through that builds params and calls the workflow. Only a use case with no workflow at all (a single repo call, nothing to derive) may open the transaction directly. Rule and rationale owned by `domain-operations-and-workflows` § "Transactions".

## Wiring

```
ConcreteUseCase[TX]          ← constructed with repos, tx manager
  ↑ injected as
UseCase[ConcreteCommand]     ← what presentation receives
```

The concrete TX type disappears at the injection boundary; the presentation layer is TX-agnostic.

## What Belongs in the Command

- Input fields (validated at construction or at use-case entry)
- Associated response type

**Not** in the command: transaction context, repository, locale, auth token (pass those via context/environment, not command fields).

## Common Mistakes

**`type E = Nothing` with `ZIO.succeed(pureValue)`** — signal that the wrong variant is in use. A use case whose body is `ZIO.succeed(...)` with no port calls should extend `s4y.app.UseCaseCommand` and return the value directly. `E = Nothing` in the ZIO variant is the smell; pure `Response` is the fix.

```scala
// WRONG — ZIO wrapping with no I/O
final class GetModesCommand extends s4y.app.zio.UseCaseCommand:
  override type E = Nothing
  override type A = NonEmptySet[TranslationMode]
object GetModesCommand:
  object UseCase extends s4y.app.UseCase[GetModesCommand]:
    def apply(cmd: GetModesCommand) = ZIO.succeed(TranslatorOperations.modesSupported)

// CORRECT — base variant, given in companion (free with import)
final class GetModesCommand extends s4y.app.UseCaseCommand:
  override type Response = NonEmptySet[TranslationMode]
object GetModesCommand:
  given UseCase[GetModesCommand] with
    def apply(cmd: GetModesCommand): NonEmptySet[TranslationMode] =
      TranslatorOperations.modesSupported
```

If a ZIO route needs this in the layer graph: `ZLayer.succeed(summon[UseCase[GetModesCommand]])`.

**Route calls repository directly** — business orchestration is in the use case; routes are thin translators between HTTP and commands.

**Use case imports HTTP types** — `Response`, `StatusCode`, `Request` are presentation types; a use case returning them is inverted.

**One giant use case class** — each command/intent gets its own use case; a class handling 10 commands is a service with hidden coupling.

**Command carries auth token for the use case to verify** — auth is a cross-cutting aspect applied by middleware, not a use-case parameter.

