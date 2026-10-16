---
name: zio-pg-jdbc-wrappers
description: Use when writing PostgreSQL adapter methods in a ZIO application, when raw JDBC needs to be wrapped in ZIO effects with proper resource management, or when choosing between plain and effectful result mappers
metadata:
  tags: [zio, scala, postgresql, jdbc, database]
---

# ZIO PostgreSQL JDBC Wrappers

**Scope:** ZIO 2.x + PostgreSQL JDBC specific

## Overview

A small set of top-level functions (`pgSelectOne`, `pgSelectMany`, `pgUpdate`, `pgInsertWithId`, ...) wraps raw JDBC in `ZIO.scoped` + `ZIO.fromAutoCloseable`. Each function takes `using ctx: TransactionContextPg` so callers inside a `tm.transaction { ... }` block get the connection implicitly.

## Function Family

```scala
// Select exactly one optional row — pure result mapper
def pgSelectOne[A](
    sql: String,
    setParams: PreparedStatement => Unit,
    mapResult: ResultSet => A
)(using ctx: TransactionContextPg): ZIO[Any, InfraFailure, Option[A]]

// Select multiple rows — pure result mapper
def pgSelectMany[A](
    sql: String,
    setParams: PreparedStatement => Unit,
    mapResult: ResultSet => A
)(using ctx: TransactionContextPg): ZIO[Any, InfraFailure, Chunk[A]]

// Select multiple rows — effectful result mapper (e.g. ZIO JSON decode)
def pgSelectManyE[E, A](
    sql: String,
    setParams: PreparedStatement => Unit,
    mapResult: ResultSet => IO[E, A]
)(using ctx: TransactionContextPg): ZIO[Any, InfraFailure | E, Chunk[A]]

// Insert / Update / Delete without returning rows
def pgUpdate(sql: String, setParams: PreparedStatement => Unit)
            (using ctx: TransactionContextPg): ZIO[Any, InfraFailure, Int]

// Insert returning generated ID
def pgInsertWithId[Id](sql: String, setParams: PreparedStatement => Unit,
                       readId: ResultSet => Id)
                      (using ctx: TransactionContextPg): ZIO[Any, InfraFailure, Id]
```

## `mapThrowable` Helper

`mapThrowable` is a project extension method (not standard ZIO) that wraps a `Throwable` into `InfraFailure`:

```scala
extension [R, A](zio: ZIO[R, Throwable, A])
  def mapThrowable(context: String): ZIO[R, InfraFailure, A] =
    zio.mapError(t => InfraFailure(context, t))
```

Defined once in `core/infra` and imported by all JDBC wrappers. All raw `ZIO.attempt` calls must be followed by `.mapThrowable(...)` — never leave `Throwable` in the error channel past the JDBC boundary.

## Resource Management

```scala
// Inside every wrapper:
ZIO.scoped {
  ZIO.fromAutoCloseable(
    ZIO.attempt(ctx.connection.prepareStatement(sql))
      .mapThrowable(s"""Failed to prepare "$sql"""")
  ).flatMap { st =>
    ZIO.attempt {
      setParams(st)
      Using.resource(st.executeQuery()) { rs =>
        // collect results
      }
    }.mapThrowable(s"""Failed to execute "$sql"""")
  }
}
```

`ZIO.fromAutoCloseable` guarantees `PreparedStatement` is closed on scope exit.

## Plain vs E Variant

| Use | When |
|-----|------|
| `pgSelectMany(..., rs => A)` | Mapping is pure/synchronous |
| `pgSelectManyE(..., rs => IO[E, A])` | Mapping is effectful (JSON decode, schema validation) |

Use the plain variant by default. The `E` variant merges error channels: `InfraFailure | E`.

## Adapter Usage

```scala
class UsersRepositoryPg extends UsersRepository[TransactionContextPg]:
  def findById(id: UserId)(using ctx: TransactionContextPg) =
    pgSelectOne(
      "SELECT id, name FROM users WHERE id = ?",
      st => st.setObject(1, id.value),
      rs => User(UserId(rs.getObject("id", classOf[UUID])), rs.getString("name"))
    )
```

## Common Mistakes

**Opening connection inside the wrapper** — the connection comes from `ctx`; the wrapper never creates its own.

**Using `ZIO.attempt` without `mapThrowable`** — leaves `Throwable` in the error channel; always convert to `InfraFailure` at the JDBC boundary.

**`pgSelectMany` without `ZIO.scoped`** — `PreparedStatement` leaks; resources must be released in `ZIO.scoped`.

**`mapResult` doing I/O** — if the mapper fetches additional data (N+1), use a JOIN in SQL instead.

