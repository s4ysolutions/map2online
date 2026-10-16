---
name: domain-identity-types
description: Use when introducing a surrogate/repository ID into the domain, when an entity field is named Id/Code/Number and it's unclear whether it's a repository surrogate or a business-assigned identifier, when deciding between a per-entity ID newtype and a generic Identifier[A], when the same entity has several projections that must share one ID, when deciding whether the ID lives inside the entity or in an Identified wrapper, or when an entity field is Option[Id] to model "not saved yet"
metadata:
  tags: [scala, scala3, architecture, domain-modeling]
---

# Domain Identity Types

**Scope:** Scala 3 / ZIO. Two independent decisions: what shape the ID type has,
and where the ID lives relative to the entity.

## Overview

A surrogate ID is assigned by a repository, but it is not an infrastructure type
— it is an opaque pointer. The domain may hold one. It may not build one or
follow one.

See `zio-prelude-domain-patterns` for `Newtype` mechanics and the
`given Schema[X.Type]` rule, `domain-operations-and-workflows` for which side of
the Operation/Workflow line sees IDs, `scala3-tx-parameterized-repository` for
port signatures, `module-separation` for where `core.identity` sits.

## Rule 0 — Not everything called "Id" is a surrogate

The question isn't whether an entity has an identifier — most do. It's **who
assigns it, and when**:

- **Repository-assigned, exists only after insert** (DB sequence, UUID from
  `INSERT RETURNING`) — this is the surrogate this skill covers. `Identifier[A]`,
  `Identified[Id, E]`, the carry/resolve/construct discipline (Rule 4) all apply.
- **Business-assigned, known at construction time** (an ISBN, a catalog code, an
  invoice number from a domain sequence rule) — this is an ordinary value object.
  It is validated on construction like any other field and governed entirely by
  `domain-value-objects`; nothing in this skill applies to it.

```scala
// business-assigned — plain VO, not this skill
final case class Catalog(code: CatalogCode, name: CatalogName)
object CatalogCode:
  def from(raw: String): Either[InvalidCatalogCode, CatalogCode] = ...
```

Name the business-assigned one `Code`/`Number`/`Key`, not `Id` — the shared
suffix is what makes the two look like the same decision. Reserve `Id` for the
`Identifier[A]`-shaped repository pointer.

The two aren't mutually exclusive on one entity: a rename-safe join target
(surrogate) and a rename-able display identifier (business code) answer
different needs. `Identified[CatalogId, Catalog]` where `Catalog.code` is the
business field is normal, not redundant — collapsing to one loses whichever
property the other provided.

## Rule 1 — Never parameterize an ID on a projection type

```scala
// WRONG
final case class FullTag(id: Identifier[FullTag], name: TagName, color: Color)
final case class ShortTag(id: Identifier[ShortTag], name: TagName)
```

Same row, same ID, two incompatible ID types. The type parameter now means
"which record layout", not "which thing in the world". Implicit conversions
between the two are not the fix — they need both directions, after which the
parameter checks nothing while still costing maintenance.

Parameterize on the **concept**, never on a shape of it. If a generic
`Identifier` is warranted (Rule 2), make the concept a real sealed trait and let
projections extend it:

```scala
sealed trait Tag:
  def id: Identifier[Tag]

final case class FullTag(id: Identifier[Tag], name: TagName, color: Color) extends Tag
final case class ShortTag(id: Identifier[Tag], name: TagName) extends Tag
```

Not a phantom marker invented to satisfy the type parameter — the trait is the
domain concept, and the shared ID falls out of it.

**First, challenge the projections.** Two domain types "because one query needs
fewer columns" is a read model, not a domain distinction — put the trimmed shape
in the repository's return type or the DTO. Keep both domain types only when
their invariants genuinely differ.

## Rule 2 — `Identifier[A]` is the standing convention

`A` is the concept the ID points at (Rule 1). The **wrapped value type is
whatever the storage layer actually assigns** — `UUID`, `Long`/bigint,
whatever a DB sequence or `INSERT RETURNING` produces in this project. Do not
default to `UUID`; check the PK column type first. Parameterize on it too, or
fix it per-project if the whole schema shares one PK type:

```scala
// core/identity — the only place that names Identifier
// V = the raw value type this project's repositories assign (UUID, Long, ...)
final class Identifier[A, V] private (val value: V):
  override def equals(that: Any): Boolean = that match
    case other: Identifier[?, ?] => value == other.value
    case _                       => false
  override def hashCode: Int = value.hashCode

private[identity] object Identifier:
  def unsafe[A, V](value: V): Identifier[A, V] = new Identifier(value)

given [A]: Schema[Identifier[A, Long]] = Schema[Long].transform(...)   // this project: bigint PKs
```

If every entity in the project shares one PK type (the common case), drop the
second parameter and fix `V` directly — don't carry unused generality:

```scala
final class Identifier[A] private (val value: Long):   // this project: all PKs are bigint
  ...
given [A]: Schema[Identifier[A]] = Schema[Long].transform(...)
```

Not a `case class`: `apply`, `copy` and `unapply` would all be public mints,
and Rule 4 could not be enforced. The private constructor is what makes
"only a repository or a parser produces an ID" a compiler fact.

This codebase parameterizes every surrogate ID this way rather than a plain
`Newtype` per entity — one `Schema` and one `Equal` cover all IDs, and the generic shape composes directly with
`ZEnvironment` keys (`Identifier[AuthenticatedUser]`) and generic port/repo
signatures.

A wire format that already fixes the value type (an existing auth token
carrying a `Long` user id, a legacy API returning string IDs) wins over this
rule — don't migrate a working wire format to fit the skill. Match `V` to
what's already on the wire, not the other way around.

**Never write `Identifier[X]` at a use site — always the alias:**

```scala
type TagId = Identifier[Tag]
```

The alias is what makes the underlying shape an implementation detail. Callers
write `TagId` everywhere; only the identity module names `Identifier`.

## Rule 3 — `Identified[Id, E]` for the saved/unsaved distinction

```scala
// core/identity
final case class Identified[Id, E](id: Id, value: E)
```

Its payload is making "persisted" a type distinction:

```scala
def create(tag: Tag)(using TX): ZIO[Any, InfraFailure, Identified[TagId, Tag]]
def update(t: Identified[TagId, Tag])(using TX): ZIO[Any, InfraFailure, Unit]
def byId(id: TagId)(using TX): ZIO[Any, InfraFailure, Option[Identified[TagId, Tag]]]
```

`TX` is threaded by `using`, never placed in `R` — see
`scala3-tx-parameterized-repository`.

Both alternatives are worse: `Option[TagId]` inside the entity forces every read
path to handle a `None` that cannot occur; separate `NewTag`/`Tag` classes
duplicate every field.

Second benefit: two equality laws stay separate — `Tag` compares structurally,
`Identified` by ID. No arguing whether entity equality includes fields.

Because `Id` is independent of `E`, projections share one ID for free:
`Identified[TagId, FullTag]` and `Identified[TagId, ShortTag]`. The Rule 1
failure cannot be expressed in this shape.

| Does identity participate in domain logic? | Where the ID lives |
|---|---|
| No — matters only to storage and the API boundary | `Identified[Id, E]` |
| Yes — invariants say "which one", entity referenced across aggregates | field inside the entity |

Practical split that holds: `Identified` for aggregate roots crossing the
persistence boundary; ID inside for entities that other entities point at.

Keep two type parameters — don't collapse to `Identified[E]` plus an
`IdOf[E] { type Id }` typeclass. That adds a typeclass and re-fuses the two axes
Rule 1 just separated. Reduce the noise with an alias and combinators instead:

```scala
type IdentifiedTag = Identified[TagId, Tag]

extension [Id, E](i: Identified[Id, E])
  def as[B](b: B): Identified[Id, B]        = Identified(i.id, b)
  def map[B](f: E => B): Identified[Id, B]  = Identified(i.id, f(i.value))
```

`Identified` never reaches the wire — presentation maps it to a DTO carrying the
raw primitive, as `endpoint-contract-separation` requires.

## Rule 4 — Domain may carry an ID. Never resolve one, never construct one

Three verbs, and they land on the Operation/Workflow boundary already in
`domain-operations-and-workflows`:

- **carry** — field, `Map` key, pass-through, `Equal` compare. Fine anywhere,
  including a pure entity holding `Set[TagId]`.
- **resolve** — dereferencing an ID is a port call, so it is a Workflow by
  construction. An Operation taking an ID to look something up is mistyped.
- **construct** — the leak to guard. Repositories mint IDs on insert;
  presentation parses them from a request. If `TagId.apply` is reachable from
  the domain, someone fabricates one and "this ID came from a repository" stops
  holding.

Enforce *construct* by placement: keep the raw constructor package-private in
the identity module (Rule 2's `Identifier.unsafe`) and expose parsing from a
separate object that only presentation and infra import:

```scala
// infra/identity or presentation/identity — NOT importable from domain
// (UUID here for illustration only — parse whatever V actually is, e.g. raw.toLongOption)
object TagIdParser:
  def parse(raw: String): Either[InvalidTagId, TagId] =
    Try(UUID.fromString(raw)).toOption
      .map(Identifier.unsafe[Tag])
      .toRight(InvalidTagId(raw))

// infra adapter, on INSERT RETURNING
val newId: TagId = Identifier.unsafe[Tag](generatedId)
```

Both call sites live outside `core.identity`'s domain-visible package, so a
domain-layer import of `TagIdParser` (or of `Identifier.unsafe` directly) is a
module-boundary violation — see `module-separation`.

Unwrapping therefore happens at the Workflow → Operation call, not in
presentation:

```scala
def rename[TX <: TransactionContext](id: TagId, newName: TagName)(using TX)
    : ZIO[TagRepository[TX], TagError | InfraFailure, IdentifiedTag] =
  for
    repo    <- ZIO.service[TagRepository[TX]]
    found   <- repo.byId(id).someOrFail(TagError.NotFound(id))
    renamed <- ZIO.fromEither(TagOperations.rename(found.value, newName).toEither)  // no ID here
    _       <- repo.update(found.as(renamed))
  yield found.as(renamed)
```

## Rule 5 — No `Ord` on a surrogate ID

Ordering by a repository-assigned ID is sorting by insert order — storage
semantics driving domain logic, and it silently changes when the ID scheme does.
Sort by a domain field. Add `Ord` only for a stated domain reason.

`Equal` is expected; it is what makes an ID usable as a pointer.

## Rule 6 — IDs in error payloads, never in translated text

`TagError.NotFound(id)` is a correct domain error: presentation needs the ID to
choose a status and to log. A raw ID value (UUID, bigint, whatever the wire
format is) must never reach a `Translatable` interpolation — users cannot act
on it. See `module-i18n`.

## Erasure

Scala erases `Identifier[Tag]` on the JVM exactly as Java does. Two things buy
back what erasure takes, and both must be true for a generic `Identifier` to be
safe:

- Ser/de is resolved by `given` at compile time, so the erased runtime type is
  never consulted — unlike reflective serializers, which need an explicit type
  token per site.
- `zio.Tag` (izumi-reflect `LightTypeTag`) keeps type arguments, so
  `Identifier[AuthenticatedUser]` works as a distinct `ZEnvironment` key.

Still erased where the compiler must agree with the JVM: two overloads
differing only in the ID's type parameter (`f(x: TagId)` / `f(x: WordId)`) fail
with `double definition: ... have same type after erasure`, and matching on
`Identifier[Tag]` is unchecked and useless — don't write either. Aliasing to
`TagId` doesn't remove this; it only keeps the parameter out of call sites.

`Tag` derivation over `Newtype.Type` and opaque types is a sharp area that has
shifted across Scala 3 / izumi-reflect versions. Any ID type used as an
environment key gets a test asserting two distinct ID types do not collide as
keys. Don't take it on faith.

## Checklist

- [ ] No ID type parameterized on a projection/record shape
- [ ] Use sites name the alias (`TagId`), never `Identifier[X]` directly
- [ ] No overload differing only in the ID's type parameter
- [ ] No `Option[Id]` field modelling "not saved yet"
- [ ] No Operation signature takes an ID in order to look something up
- [ ] ID constructor unreachable from domain code; parsing lives on the presentation/infra side
- [ ] No `Ord` on a surrogate ID without a stated domain reason
- [ ] No ID interpolated into a translatable message
- [ ] Env-key collision test exists for every ID type placed in `ZEnvironment`

## Common Mistakes

**Implicit conversions between two projections' ID types** — needs both
directions, after which the type parameter guarantees nothing. Fix the parameter
(Rule 1) instead.

**Phantom marker invented for one entity's projections** — `sealed trait
TagIdentity` plus `type TagId = Identifier[TagIdentity]` adds a trait that
carries no meaning beyond "the id side of Tag". Prefer a real concept trait
(Rule 1's `Tag` extended by `FullTag`/`ShortTag`) — the marker is only a
fallback when no such trait exists yet.

**`Identified` unwrapped on the first line of every workflow** — if `.value` is
the first thing every caller does, identity is participating in the logic; put
the ID in the entity (Rule 3) and delete the wrapper.

**Raw `UUID`/`Long` in a port signature** — `findById(id: UUID)` lets any ID
flow into any repository. The compiler cannot catch a `WordId` passed as a
`TagId` once both are `UUID`.

**Splitting an entity's associations out to keep it "ID-free"** — holding
`Set[TagId]` inside a pure entity is legal under *carry*; moving the association
to a side structure fragments the aggregate for no gain.
