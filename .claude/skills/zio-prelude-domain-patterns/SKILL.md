---
name: zio-prelude-domain-patterns
description: Use when constructing a domain value object or command from multiple fields, when deciding between Either and accumulating validation, when wrapping a constrained primitive type, or when default case-class equality is wrong for a domain type
metadata:
  tags: [zio, domain-modeling, scala]
---

# ZIO Prelude for Domain Operations

**Scope:** Scala / ZIO ecosystem

## Overview

`zio-prelude` is algebra and data structures — `Validation`, `Newtype`,
`Subtype`, `Equal`, `Ord`, `Hash`, `Associative` — not an effect system. It
carries no runtime and no `ZIO[R, E, A]` fiber semantics, so it is allowed
inside the Domain Operation boundary defined in
`domain-operations-and-workflows`, which otherwise bans effect-type imports.
Treat it as the toolbox for the *pure* side of the domain, never the
Workflow side.

## Core Rules

**`Either` for single-invariant VOs, `Validation` for multi-field construction**
— `domain-value-objects` is correct that a single VO either constructs or
fails with one domain error; `Either` fits that and should stay. But the
moment construction combines several VOs into a Command or aggregate,
`Either` fails fast on the first bad field, and the caller fixes one thing,
resubmits, and hits the next. `Validation` is applicative: every field is
checked independently and every failure is reported together.

```scala
import zio.prelude.Validation

final case class RegisterCommand(email: Email, name: PersonName, age: Age)

object RegisterCommand:
  def from(email: String, name: String, age: Int): Validation[RegisterError, RegisterCommand] =
    Validation.validateWith(
      Email.from(email).toValidation,
      PersonName.from(name).toValidation,
      Age.from(age).toValidation
    )(RegisterCommand.apply)
```

Rule of thumb: one VO, one invariant → `Either`. Several VOs combined into
one constructor → `Validation`.

**`Subtype` + `Assertion` for refining, not for parsing** — when a VO is "this
primitive, but never an invalid one" with no shape change between input and
output (a positive `Int`, a non-empty `String`), `Subtype` with an
`Assertion` predicate gives the construction-validates invariant with far
less boilerplate than a hand-rolled case class + companion.

```scala
import zio.prelude.{Assertion, Subtype}

object Quantity extends Subtype[Int]:
  override inline def assertion = Assertion.greaterThan(0)
type Quantity = Quantity.Type
```

Keep hand-rolled smart constructors (the `PublicKeyHash.from(spki: String)`
style in `domain-value-objects`) when the input type differs from the output
representation — that's parsing/transforming, not refining, and `Subtype`
doesn't model it.

**Plain `Newtype` for identity, not refinement** — when a VO is "this
primitive, but a *different type* than the primitive" with **no invariant at
all** (a language code, an order ID, anything that's a `String`/`Int` with
every value legal but must not be interchangeable with a bare `String`/`Int`
at the type level), use `Newtype` with no `Assertion`. This is a distinct
case from `Subtype`: `Subtype` refines a value space, `Newtype` only renames
it.

```scala
import zio.prelude.Newtype

object Code extends Newtype[String]
type Code = Code.Type

// construct / deconstruct — no implicit widening either direction
val c: Code = Code("en")
val s: String = Code.unwrap(c)
```

For surrogate/repository IDs specifically — whether to use this form or a
generic `Identifier[A]`, and where the ID lives — see `domain-identity-types`.

The entire point is that there is **no** `Conversion[String, Code]` and no
`CanEqual[Code, String]` — the compiler must refuse `code == "en"` and force
an explicit `Code("en")` or `Code.unwrap(code)`. This is a compile-time check
working as intended, not friction to route around.

**zio-schema interop for `Newtype`/`Subtype`-wrapped fields** — a case class
with a `Newtype` field fails `Schema.derived`/`DeriveSchema.gen` with
`Deriving schema for ... is not supported` unless a `Schema` instance for the
wrapped `Type` is in scope. Declare it once, inside the `Newtype` object so
implicit search finds it via the type's own companion:

```scala
import zio.schema.Schema

object Code extends Newtype[String]:
  given Schema[Code.Type] = Schema[String].transform(wrap, unwrap)
type Code = Code.Type
```

Keep the wire DTO on the raw primitive (`code: String`, not `code: Code`) —
`wrap`/`unwrap` belong in the contract's `fromDomain`/`toDomain`, not on the
DTO field itself. See `endpoint-contract-separation` for where that mapping
lives.

**`Equal`/`Ord`/`Hash` when default case-class equality is wrong** — e.g. an
Entity that should compare by identity (its ID) while its VOs compare by
value, or a VO wrapping a `Double` where IEEE-754 equality isn't the equality
you want. Reach for these explicitly rather than relying on case-class
`equals`/`hashCode` once equality semantics matter to the domain, not just to
testing convenience.

## Checklist

- [ ] Single-VO construction uses `Either`; multi-field construction uses `Validation`
- [ ] `Subtype`/`Newtype` used only where input shape == output shape (refining, not parsing)
- [ ] Hand-rolled smart constructor kept wherever construction transforms the input type
- [ ] Custom `Equal`/`Ord` declared wherever default case-class equality doesn't match domain equality
- [ ] A field with no invariant but a distinct identity uses plain `Newtype`, not `type X = String` + `Conversion`
- [ ] Every `Newtype`/`Subtype` field embedded in a `Schema`-derived case class has a `given Schema[X.Type]` declared inside the wrapper object

## Common Mistakes

**Reaching for `Validation` on a single-field VO** — adds applicative
ceremony where a plain `Either` already says everything needed. Save
`Validation` for combining multiple already-validated pieces.

**Using `Subtype` to "validate" a parsed value** — `Subtype`'s assertion runs
on the *already-constructed* value of the same type; it can't turn a `String`
into a `PublicKeyHash`. If parsing is involved, hand-roll the smart
constructor.

**Treating `Newtype`/`Subtype` as exempt from the Operation/Workflow
boundary** — they're pure, so they belong with Operations, but that's exactly
why they must never wrap a value that requires an effectful lookup to
validate (e.g. "this `Email` must not already be registered" is a Workflow
concern — it needs a repository — not something `Assertion` can express).

**Fake VO via transparent type alias + `Conversion`** — this looks like a
distinct type but provides zero enforcement:

```scala
// WRONG — Code is structurally identical to String; the Conversion is a
// no-op layered on a no-op. Any bare string type-checks as a Code, and a
// Code type-checks anywhere a String is expected. Nothing is caught.
type Code = String
object Code:
  def apply(code: String): Code = code
given Conversion[String, Code] with
  def apply(code: String): Code = code
```

```scala
// CORRECT — plain Newtype, no Conversion. Passing a bare String where Code
// is expected is now a compile error; comparing Code == String is a
// compile error too (no CanEqual). This is the point, not a bug.
object Code extends Newtype[String]
type Code = Code.Type
```

If a codebase ships the first form, it has a type that reads as a VO in
every signature but validates nothing — indistinguishable from `String` at
every call site, including places that should never accept a raw string.
Grep for `given Conversion[` on anything wrapping a domain primitive; that's
the smell.

