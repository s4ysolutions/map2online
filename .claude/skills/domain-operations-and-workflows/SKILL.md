---
name: domain-operations-and-workflows
description: Use when deciding whether domain logic is pure (Operation) or effectful (Workflow), when it needs a mock or stub to test, when a workflow's R leaks an infra type instead of a domain port, or when choosing a static function object vs a ZIO service class for a workflow
metadata:
  tags: [architecture, domain-modeling, language-agnostic]
---

# Domain Operations and Workflows

**Scope:** language-agnostic in principle; R/E discipline below is ZIO-concrete.

## Overview

"Domain service" is retired — it covered both pure rules and I/O-touching logic,
which makes domain layers either fake purity (effects smuggled in as hidden
dependencies) or collapse into the application layer. Split it in two:

- **Operation** — pure. No effect type in the signature, not even `UIO`. Value
  objects/entities in, a value object/entity or domain error out.
- **Workflow** — effectful. `ZIO[R, E, A]`. Composes Operations with ports. This
  is what an "effectful domain service" (e.g. a deposit rule that must read a rate
  before applying it) actually is.

See `domain-value-objects` for VO construction, `hexagonal-feature-layout` for
where each lives on disk, `zio-prelude-domain-patterns` for Operation-layer
helpers (`Validation`, `Newtype`/`Subtype`, `Equal`/`Ord`), and
`domain-identity-types` for which side may hold a repository ID.

## Naming

Suffix `Operations` for pure logic, `Workflows` for effectful:

| Object | Bucket | Signal |
|--------|--------|--------|
| `AuthorizationOperations` | Operation | pure, no effect type |
| `AuthorizeWorkflows` | Workflow | returns `ZIO[...]` |

The suffix makes the bucket visible from the name — `grep *Workflows` finds all
effectful domain logic, `grep *Operations` all pure logic.

## Core Rules

**Operation holds no mutable or effectful state — dependencies are pure values.**
It may be a top-level function, a module-object method, or a method on a class
whose constructor holds only pure values (sealed enums, config constants, pure
function types). Never mutable state or anything requiring I/O to produce. When it
needs a policy or lookup table, pass it as an explicit parameter and apply
partially at the composition root:

```scala
def applyDiscount(policy: DiscountPolicy)(price: Money, code: DiscountCode): Either[PricingError, Money] = ...

// composition root
val applyCompanyDiscount: (Money, DiscountCode) => Either[PricingError, Money] =
  applyDiscount(CompanyDiscountPolicy)
```

`R` on a `ZIO` is functional-DI for the effectful case; explicit parameters +
partial application is functional-DI for the pure case.

**Operation has zero effect-type imports** — no `zio.ZIO`/`Task`/`UIO`, no
`cats.effect.IO`. `zio.prelude.*` is allowed: algebra and data structures, not an
effect system.

**Workflow's `R` is `Any` or a domain port** — never an infra type
(`DataSource`, `SttpBackend`, a JDBC type). The port trait is declared in the
domain; `R` names that trait, never the infra type that implements it later.
Composing two workflows unions their `R` automatically. Concrete implementations
are provided only at the composition root (see `composition-root`).

**Workflow's `E` is the sealed domain error hierarchy plus `InfraFailure`.** Raw
`Throwable` is banned. `InfraFailure` (in `core.domain.errors`) is expected —
adapters convert raw exceptions into it before crossing the port boundary. `E` may
be a union (`InfraFailure | DomainError`). This binds the **port trait** too: a
port method typed `Task[A]` already violates the rule before any workflow touches
it, regardless of transport (HTTP, JDBC, gRPC).

**Testing litmus test** — if testing domain logic needs a mock, stub, or
`ZLayer.succeed(...)`, it is a Workflow, not an Operation. An Operation is tested
by calling it with literal inputs. Reaching for a double on a supposed "domain
service" is the signal an effect was smuggled in — re-type it as a Workflow with
the port in `R`.

The litmus also picks the test runtime: an Operation needs no effect runtime →
plain/munit module; a Workflow drives `ZIO[R, E, A]` → effect-runtime (zio-test)
module. See `mill-module-layout`'s test sub-module table. A domain suite pulling in
the effect-test framework to test something with no effect type is the same
smuggled-effect smell — move the suite, don't add the runtime dependency.

## Choosing the Workflow Shape

Pick one of two shapes before writing a workflow. TX-parameterized deps
(`UsageRepository[TX]`, `TransactionManager[TX]`) always stay explicit — the TX
type is chosen at the use-case level, not the workflow level.

**Shape A — static function object (explicit deps).** Every caller supplies all
deps. New dep = edit every caller.

```scala
object TranslatorWorkflows:
  def translate[TX <: TransactionContext](
      userId: ..., request: ...,
      gateways: TranslationGateways,
      usageRepository: UsageRepository[TX],
      transactionManager: TransactionManager[TX]
  ): IO[TranslationError | InfraFailure | AuthorizeResult.Denied, TranslationResponse]
```

**Shape B — ZIO service class (hidden non-TX deps).** New non-TX dep = change
layer only, zero callers touched.

```scala
class TranslatorWorkflows(gateways: TranslationGateways):
  def translate[TX <: TransactionContext](...): IO[..., TranslationResponse]

object TranslatorWorkflows:
  val layer: ZLayer[TranslationGateways, Nothing, TranslatorWorkflows] =
    ZLayer.fromFunction(new TranslatorWorkflows(_))
```

| Situation | Shape |
|-----------|-------|
| One caller today, stable deps | A — indirection buys nothing |
| Multiple callers OR deps likely to grow | B — one layer change protects all callers |
| Wrapper around a single port the caller already holds | A — B adds no value |

> ⚠️ **Stop and decide.** Changing shape later touches every caller (A→B) or
> unwraps a ZLayer (B→A). Pick on caller count and dep volatility, not habit.

## Transactions

`TransactionManager.transaction` is an **atomicity boundary**. Domain logic that
must be consistent with a following write belongs inside the same transaction —
moving the read/decision outside opens a TOCTOU gap.

```scala
// CORRECT — read + conditional update atomic
transactionManager.transaction("authorize and record") {
  repo.used(...).flatMap { n =>
    if enoughQuota(n) then repo.add(...).as(Authorized)
    else ZIO.fail(Denied(...))  // domain error, rolls back
  }
}
```

Because the body can fail with domain errors, `transaction` is generic over `E`:

```scala
def transaction[R, E, A](log: String)(
    effect: TX ?=> ZIO[R, InfraFailure | E, A]
): ZIO[R, InfraFailure | E, A]
```

`InfraFailure` from begin/commit, `E` from the workflow inside. **Never inside a
transaction:** long-running I/O (network, LLM, external gateways) — it holds a DB
connection and lock for the full duration. Keep transactions to fast local port
calls.

**Ownership lives in the Workflow, not the Use Case.** The workflow takes
`TransactionManager[TX]` as an explicit dep and calls `tm.transaction(...)` itself,
once per atomic unit it needs. A use case that opens the transaction and passes the
effect down gets the boundary wrong for any workflow needing more than one
transaction, or none — only the workflow knows that shape. The use case's `apply`
becomes a pass-through (see the "Workflow re-fetches" mistake for the full
example).

**Exception:** a use case with genuinely no business logic — one repo call, nothing
to derive, no workflow warranted (see create-usecase's inline-orchestration
alternative) — may call `tm.transaction(...)` directly. The moment there's a second
repo call, an Operation over the result, or a domain error to raise, extract a
workflow and move the transaction into it.

## Checklist

- [ ] Operation constructor (if any) holds only pure values — no ports, no effectful deps
- [ ] Operation deps (policies, lookup tables, config) are explicit parameters via partial application
- [ ] No effect-type import in anything called an Operation
- [ ] Every Workflow's `R` is `Any` or a domain port — never an infra type
- [ ] Every Workflow's `E` is a sealed domain error or `InfraFailure` — never raw `Throwable`
- [ ] Nothing named "domain service" remains
- [ ] No mock/stub needed to test anything classified as an Operation

## Common Mistakes

**Calling a Workflow a "domain service"** — the term hides the bucket. Name it
Operation or Workflow.

**`R` widened to an infra type "just for now"** — `ZIO[DataSource, ...]` is the
port-placement invariant broken in the type. Declare the port trait in the domain
even with one implementation.

**Reaching for `F[_]: MonadError[F, DomainError]` to "stay framework-agnostic"** —
if the codebase is already ZIO-committed everywhere else, this buys portability you
never use at the cost of tagless-final ceremony and worse error ergonomics than
native `mapError`/`catchAll`. Stay concrete unless multiple runtimes are a
near-term requirement.

**Operation class holding a mutable/effectful dependency** —
`class PricingService(repo: PricingRepository)` smuggles a port into an Operation.
Fix: make it a Workflow with `repo` in `R`. A class holding a *pure value* (a
`DiscountPolicy` enum, a `Map[Code, Rate]` loaded once) is fine. Test: can the
constructor parameter be built without any `ZIO`/`Future`/I/O?

**Wrapping a CPU-bound library call in a ZIO port reflexively** — calling a library
is not itself a reason for an effectful port. Test: is this a stand-in for a future
*networked* adapter, or the permanent always-local computation? A
`KmsGateway`/`EmailGateway` earns `IO[...]` (today's fake → tomorrow's network
call); a password hasher never becomes a network call — the hashing library *is*
the permanent implementation. Model it as a pure Operation over a plain value
(`PasswordHashingPolicy(hashFn, verifyFn)` built by an infra factory). If it's slow
enough to starve the fiber runtime (Argon2 is memory-hard), that's the *calling
Workflow's* job via `ZIO.attemptBlocking(...)` — not a reason to put ZIO in the
Operation's signature.

**Stateful port with the decision logic buried in the adapter** — a rate
limiter/guard stays on the Workflow/Port side (an Operation may never hold mutable
state, and cross-call state needs a shared mutable cell = infrastructure). But the
*decision* — given current state and now, decide allow/throttle — is pure. Extract
it:

```scala
// CORRECT — rule is a plain function, testable with literal lists; adapter is a thin shim
object FailedLoginGuardOperations:
  enum Result:
    case Allowed(newHistory: List[Instant])
    case Throttled
  def checkAndRecord(history: List[Instant], now: Instant, limit: Int, window: Duration): Result =
    val recent = history.filter(t => Duration.between(t, now).abs().compareTo(window) <= 0)
    if recent.length >= limit then Result.Throttled else Result.Allowed(now :: recent)

final class InMemoryFailedLoginGuard(state: Ref[Map[String, List[Instant]]], limit: Int, window: Duration):
  def checkAndRecord(key: String): IO[Throttled, Unit] =
    ZIO.succeed(Instant.now()).flatMap { now =>
      state.modify { m =>
        FailedLoginGuardOperations.checkAndRecord(m.getOrElse(key, Nil), now, limit, window) match
          case FailedLoginGuardOperations.Result.Allowed(h) => (true, m.updated(key, h))
          case FailedLoginGuardOperations.Result.Throttled  => (false, m)
      }.flatMap(allowed => ZIO.fail(Throttled).unless(allowed).unit)
    }
```

Pull everything that can be pure out of the effectful shell; leave the shell
holding only what genuinely can't be — here, the mutable cell.

**Workflow re-fetches via a port what the caller already has** — a Workflow that
holds a repo only to derive a value from data another call already fetched is doing
I/O for no reason (and often gets `zipPar`'d against a sibling on one TX — the trap
`scala3-tx-parameterized-repository` warns about). Collapse the derivation to an
Operation over the already-fetched value; this deletes a whole `*Workflows` object
and its test double.

```scala
// CORRECT — one repo call; picking default/unknown from the result is pure
object LanguagesOperations:
  def defaultLang(langs: Chunk[Lang]): Lang = langs.find(_.code == defaultCode).getOrElse(defaultFallback)
  def unknownLang(langs: Chunk[Lang]): Lang = langs.find(_.code == unknownCode).getOrElse(unknownFallback)

object LanguagesWorkflows:
  def getLanguages[TX <: TransactionContext](
      repo: LanguagesRepository[TX], tm: TransactionManager[TX]
  ): IO[InfraFailure, LanguagesDescriptor] =
    tm.transaction("get languages") {              // workflow owns the transaction
      repo.getLangs.map(langs =>
        LanguagesDescriptor(LanguagesOperations.defaultLang(langs), LanguagesOperations.unknownLang(langs), langs)
      )
    }

// use case is a pass-through — no transaction here
class GetLanguagesUseCase[TX <: TransactionContext](tm: TransactionManager[TX], repo: LanguagesRepository[TX]):
  def apply(command: GetLanguagesCommand) = LanguagesWorkflows.getLanguages(repo, tm)
```

**Extracting a workflow into a trait to enable stubbing** — if a function calling a
driven port is wrapped in a trait so callers can inject a stub, the stub sits at the
wrong level. The driven port (`UsageRepository`, `TranslationGateway`) is already
the test seam — stub that. A trait with one impl and no infra variation is
indirection with no payoff; collapse it to a static function. Fail with the domain
error (e.g. `Denied`) rather than returning it, so presentation maps each error type
to its own HTTP status independently.
