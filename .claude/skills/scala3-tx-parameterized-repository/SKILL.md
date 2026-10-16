---
name: scala3-tx-parameterized-repository
description: Use when designing repository ports in Scala 3 that must remain testable with in-memory or real-DB implementations, or when a repository is leaking a concrete connection type into the domain or application layer
metadata:
  tags: [scala, scala3, architecture, database]
---

# TX-Parameterized Repository (Scala 3)

**Scope:** Scala 3 specific — uses context parameters (`using`) and type bounds

## Overview

Repository ports carry the transaction context as a **type parameter** and a **context parameter**. The concrete TX type is never mentioned in domain or application code — it is chosen once at the composition root via a type alias.

## Core Pattern

```scala
// core/tx — shared kernel, not infra
trait TransactionContext
trait TransactionManager[TX <: TransactionContext: zio.Tag]:
  def transaction[R, E, A](log: String)(
      effect: TX ?=> ZIO[R, InfraFailure | E, A]
  ): ZIO[R, InfraFailure | E, A]
// zio.Tag is required because TransactionManager[TX] is provided via the ZIO layer graph.
// TX is NOT a type in R on workflows — it is threaded via context parameters (`using`).
// TransactionManager[TX] itself lives in R as a service; TX is the phantom type that
// parameterises it so different TX implementations can coexist in the graph.

// domain port
trait UsersRepository[TX <: TransactionContext]:
  def findById(id: UserId)(using ctx: TX): ZIO[Any, InfraFailure, Option[User]]

// infra adapter
class UsersRepositoryPg extends UsersRepository[TransactionContextPg]:
  def findById(id: UserId)(using ctx: TransactionContextPg): ZIO[...] =
    pgSelectOne(sql, ...)   // uses ctx.connection

// composition root
type TXDB = TransactionContextPg
val repo: UsersRepository[TXDB] = UsersRepositoryPg()
```

## TX Context Flow

```
TransactionManager[TX].transaction { ctx ?=>
  repo.findById(id)   // ctx threaded implicitly via context function
}
```

Application code calls `tm.transaction { repo.findById(...) }` — it never constructs or manages a connection.

## Rules

- `TX` type parameter appears only in domain ports and their infra implementations
- ID parameters are typed (`UserId`, not `UUID`), and results that carry a
  surrogate ID use `Identified[Id, E]` — see `domain-identity-types`
- Application use cases receive `TransactionManager[TX]` and `Repository[TX]` — both abstract
- `TransactionContextPg` / concrete TX types are named **only** in:
  - Infra adapter implementations
  - Composition root (`type TXDB = TransactionContextPg`)
- Use `?=>` (context function) for the `using ctx: TX` so ZIO can thread it implicitly

## Two TX Flavors in the Same App

When some data is DB-backed and some is in-memory:

```scala
// composition root
type TXDB = TransactionContextPg    // for persistent repos
type TXM = TransactionContextMemory // for static repos

// each use case receives the right TX via its layer
val dbLayer: TransactionManager[TXDB] = TransactionManagerPg.layer
val memLayer: TransactionManager[TXM] = TransactionManagerMemory.layer
```

## Common Mistakes

**`TransactionContextPg` in a use case** — the use case becomes untestable without a real DB. Use `TransactionManager[TX]` with a generic `TX`.

**Mixing TX types in one use case** — a use case requiring both `TXDB` and `TXM` has too many responsibilities; split or extract a domain workflow.

**`using ctx: TX` forgotten on repo method** — the method compiles but silently ignores the transaction context; the connection is fetched from a different source.

**`zipPar` (or any parallel combinator) on repository calls inside one `TX`**
— a single `TransactionContext` typically wraps a single connection (one
JDBC `Connection`, one prepared statement pipeline); calls inside the same
transaction body are expected to run sequentially. `zipPar`-ing multiple
`repo.someCall(...)` invocations inside `transactionManager.transaction { ... }`
compiles and passes against a memory adapter (no real connection to
contend over) but is a latent bug against any real single-connection TX
implementation — concurrent statements racing on one connection.

```scala
// WRONG — three repo calls in parallel inside one TX; fine on
// TransactionContextMemory, broken the moment TX = TransactionContextPg
transactionManager.transaction("get languages") {
  (repo.getLangs zipPar (repo.getLang("en") zipPar repo.getLang("unk")))
    .map { case (langs, (default, unknown)) => ... }
}

// CORRECT — one repo call, rest is pure computation over the result
transactionManager.transaction("get languages") {
  repo.getLangs.map { langs =>
    LanguagesDescriptor(pickDefault(langs), pickUnknown(langs), langs)
  }
}
```

Often the actual fix isn't "make it sequential" but "don't re-fetch via the
port at all" — if the data needed by the second/third call is already
present in the first call's result, compute it with a pure Domain Operation
instead (see `domain-operations-and-workflows`'s "Workflow re-fetches via a
port" mistake). The memory adapter masking this is itself worth
flagging — see `static-data-memory-adapter`.

