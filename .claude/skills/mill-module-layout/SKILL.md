---
name: mill-module-layout
description: Use when setting up, extending, or scaffolding a Mill build for a hexagonal Scala project — new modules, declaring moduleDeps, adding a test sub-module, wiring a bounded context, or cross-compiling a module to Scala.js via a nested "twin" module
metadata:
  tags: [mill, scala, build-tool, architecture]
---

# Mill Module Layout for Hexagonal Architecture

**Scope:** Mill build tool (tested with Mill 1.x), Scala 3

## Overview

Mill's nested `object` model maps directly onto the `core / features / products`
module grouping from `module-separation`. Each Mill object is one build module;
`moduleDeps` is the only place where inter-module dependencies are declared,
making it the compile-time enforcer of layer rules.

See `module-separation` for the build-system-agnostic layout and dependency
rules. This skill covers the Mill-specific idioms for expressing them.

## Base Traits

Define shared settings once; every module mixes in the right trait:

```scala
trait BaseModule extends ScalaModule {
  def scalaVersion = "3.x.y"
  // shared compiler flags, common dep helpers
  override def scalacOptions = super.scalacOptions() ++ Seq(
    "-unchecked", "-deprecation", "-Xsemanticdb"
  )
}

trait BaseJvmModule extends BaseModule {
  // JVM-only deps (JDBC driver, HikariCP, …) declared here
}

trait BaseJsModule extends BaseModule with ScalaJSModule {
  // Scala.js settings
}
```

All production modules extend `BaseJvmModule` (or `BaseModule` for
cross-platform). Test sub-modules extend the appropriate `TestModule.*` mixin
instead — they do not extend the base traits directly.

## Top-Level Structure in `build.mill`

```scala
package build

object core    extends Module { ... }
object features extends Module { ... }
object products extends Module { ... }
```

`Module` (not `ScalaModule`) is used for grouping objects that are not
themselves compilable — only their children are. This prevents accidentally
running `mill core.compile` when you mean `mill core.app.compile`.

## Core Module Declaration

```scala
object core extends Module {

  object i18n extends BaseJvmModule { ... }

  object identity extends BaseModule {        // cross-platform: no JVM-only deps
    override def mvnDeps = Seq(zioDep, preludeDep)
  }

  object app extends BaseJvmModule {
    override def moduleDeps = Seq(core.i18n)
    override def mvnDeps = Seq(zioDep)
  }

  object tx extends BaseJvmModule {
    override def moduleDeps = Seq(core.identity)
    override def mvnDeps = Seq(zioDep)         // ZIO needed: TransactionManager is a ZIO service
  }

  object domain extends Module {
    object errors extends BaseModule { ... }   // InfraFailure; NO zioDep — pure domain imports this
  }

  object infra extends Module {
    object pg extends BaseJvmModule {
      override def moduleDeps = Seq(
        core.identity,
        core.tx,
        core.domain.errors
      )
      // test sub-module nested inside infra.pg
      object tests extends ScalaTests with TestModule.ZioTest {
        override def moduleDeps =
          Seq(core.infra.pg, core.loggers, core.tests)
        override def mvnDeps = Seq(zioTestDep, zioTestSbtDep)
      }
    }
    object memory extends BaseJvmModule {
      override def moduleDeps = Seq(
        core.identity,
        core.tx,
        core.domain.errors
      )
    }
  }

  object presentation extends Module {
    object zioHttp extends BaseJvmModule {
      override def moduleDeps = Seq(core.app)
      override def mvnDeps = Seq(zioDep, zioHttpDep)
    }
  }

  object loggers extends BaseJvmModule { ... }

  object tests extends BaseModule {           // shared test helpers only
    override def moduleDeps = Seq(core.tx)
    override def mvnDeps = Seq(zioTestDep, zioTestSbtDep, dotenvDep)
  }
}
```

## Scala.js Twin Modules (Cross-Compilation)

When a module needs to compile to both JVM and Scala.js (e.g. `domain.vo` in
`layers-to-modules`' three-way split), do not duplicate its source files.
Instead nest a **twin module** that has no source files of its own — it pulls
in the JVM sibling's sources via `Task` and recompiles them under
`ScalaJSModule`:

```scala
object errors extends BaseModule {
  override def mvnDeps: T[Seq[Dep]] = Seq(zioDep)

  object errorsJs extends BaseJsModule {
    override def sources = Task { errors.sources() ++ super.sources() }
    override def mvnDeps: T[Seq[Dep]] = Seq(zioJsDep)  // JS-cross-built artifact, not zioDep
  }
}
```

Rules for this pattern:

- The twin is always nested inside the JVM/cross-platform module it mirrors
  (`errors.errorsJs`, `identity.identityJs`, `domain.vo.voJs`), never a sibling
  at the same nesting level — this is what makes `sources = Task { errors.sources() ++ super.sources() }` resolvable.
- `sources` is overridden to reuse the parent's files, not to declare a second
  copy. There is no `.js`-suffixed source directory to maintain — one set of
  `.scala` files, two compile targets.
- `mvnDeps` on the twin swaps every JVM dependency for its Scala.js-published
  counterpart (`preludeDep` → `preludeJsDep`, `zioDep` → `zioJsDep`,
  `zioSchemaDerivationDep` → `zioSchemaDerivationJsDep`). These are different
  artifacts on Maven, not the same jar — get this wrong and the twin fails to
  resolve or link.
- `moduleDeps` on the twin points at the **other twins**, not the JVM
  originals: `vo.voJs` depends on `core.identity.identityJs` and
  `features.auth.domain.domainJs`, never on `core.identity` or
  `features.auth.domain` directly. A JVM-only dep here breaks the JS link step
  even though `mill compile` may look fine in isolation.
- Name the twin `<parent><Js>` (`errorsJs`, `identityJs`, `voJs`, `httpJs`,
  `domainJs`, `appJs`, `gatewayJs`) — consistent enough to grep for every
  cross-compiled module in the build.

This is orthogonal to the `BaseJvmModule` vs `BaseModule` split: a module that
needs a JS twin extends plain `BaseModule` (no JVM-only deps of its own) and
gets the JS artifact as a nested `BaseJsModule`, not a replacement.

## Feature Module Declaration

Each bounded context follows the same pattern. The names `domain`, `app`,
`infra`, `presentation` are fixed; sub-names under `infra` and `presentation`
reflect the technology (`pg`, `memory`, `zioHttp`, `llm`, …).

The `domain` object is a ScalaModule (has its own sources) AND a parent for
the `workflows` sub-module. Both can coexist in Mill: the parent compiles its
own sources; the nested object compiles its own separately.

```scala
object features extends Module {
  object myFeature extends Module {

    // feature.domain — pure: VOs, errors, operations; zio-prelude only, NO ZIO
    object domain extends BaseModule {
      override def moduleDeps = Seq(
        core.i18n,
        core.identity,
        core.domain.errors
        // + other feature pure domains if needed, e.g. features.auth.domain
      )
      override def mvnDeps = Seq(preludeDep)  // NO zioDep here

      object munits extends ScalaTests with TestModule.Munit {
        override def moduleDeps = Seq(domain)
        override def mvnDeps = Seq(munitDep)
      }

      // feature.domain.workflows — effectful: port interfaces, domain workflows; ZIO
      object workflows extends BaseJvmModule {
        override def moduleDeps = Seq(
          domain,                              // VOs and errors used in port signatures
          core.domain.errors,
          core.tx
        )
        override def mvnDeps = Seq(zioDep)

        object tests extends ScalaTests with TestModule.ZioTest {
          override def moduleDeps = Seq(workflows)
          override def mvnDeps = Seq(zioTestDep, zioTestSbtDep)
        }
      }
    }

    object app extends BaseJvmModule {
      override def moduleDeps = Seq(
        core.i18n,
        core.app,
        myFeature.domain,           // for VOs, errors
        myFeature.domain.workflows  // for port interfaces to call
      )
      override def mvnDeps = Seq(zioDep)
      // No dep on myFeature.infra.* or myFeature.presentation.*
    }

    object infra extends Module {
      object pg extends BaseJvmModule {
        override def moduleDeps = Seq(
          myFeature.domain.workflows,  // port interfaces to implement
          core.infra.pg
        )
        override def mvnDeps = Seq(zioDep)

        object tests extends ScalaTests with TestModule.ZioTest {
          override def moduleDeps =
            Seq(pg, core.infra.pg.tests, core.loggers)
          override def mvnDeps = Seq(zioTestDep, zioTestSbtDep, dotenvDep)
        }
      }
      object memory extends BaseJvmModule {
        override def moduleDeps = Seq(
          myFeature.domain.workflows,  // port interfaces to implement
          core.infra.memory
        )
        override def mvnDeps = Seq(zioDep)
      }
    }

    object presentation extends Module {
      object zioHttp extends BaseJvmModule {
        override def moduleDeps = Seq(
          myFeature.domain,           // for VOs, DTO mapping
          myFeature.app,
          core.presentation.zioHttp
        )
        override def mvnDeps = Seq(zioDep, zioHttpDep)

        object munits extends ScalaTests with TestModule.Munit {
          override def moduleDeps = Seq(zioHttp)
          override def mvnDeps = Seq(munitDep)
        }
        object tests extends ScalaTests with TestModule.ZioTest {
          override def moduleDeps = Seq(zioHttp)
          override def mvnDeps = Seq(zioTestDep, zioTestSbtDep)
        }
      }
    }
  }
}
```

## Product (Composition Root) Module

```scala
object products extends Module {
  object myService extends BaseJvmModule {
    override def mainClass = Some("com.example.myservice.cli.Main")

    override def moduleDeps = Seq(
      core.app,
      core.loggers,
      core.i18n,
      core.infra.memory,
      core.infra.pg,
      core.presentation.zioHttp,
      features.myFeature.infra.pg,
      features.myFeature.infra.memory,
      features.myFeature.app,
      features.myFeature.presentation.zioHttp,
      // ... all other features
    )

    override def mvnDeps = Seq(zioDep, zioConfigDep, zioHttpDep)
  }
}
```

This is the **only** module that references every concrete infra and
presentation module. Its source code is the composition root (TX type aliases,
ZLayer assembly, `main` entry point).

## Test Sub-Module Conventions

| Test type | Mill mixin | When to use |
|-----------|-----------|-------------|
| Pure / fast | `ScalaTests with TestModule.Munit` | Domain VOs, pure functions, endpoint contract shape |
| Effect-runtime | `ScalaTests with TestModule.ZioTest` | Workflows, use cases, integration |
| Integration (DB) | `ScalaTests with TestModule.ZioTest` + `dotenvDep` | Infra adapters needing a live DB |

Test modules are always **nested inside** their parent production module object,
not placed alongside it. This keeps `mill myFeature.domain.tests.test` scoped
to that module's own tests.

## Running Tests

```bash
# all tests in a module
mill features.myFeature.domain.tests.test
mill features.myFeature.infra.pg.tests.test

# all tests in a feature
mill __.test                    # every test sub-module in the project
mill features.myFeature.__.test # every test sub-module under myFeature

# compile-check without running
mill features.myFeature.domain.compile
```

## Common Mistakes

**Extending `ScalaModule` instead of `Module` for grouping objects** — a
grouping object (one that contains sub-modules but has no source files of its
own) should extend `Module`, not `ScalaModule`; extending `ScalaModule` adds
a spurious compile target with an empty source set.

**Declaring `mvnDeps` on a grouping `Module`** — dependencies belong on the
leaf `ScalaModule`, not on the parent `Module` wrapper.

**Test module depending on production modules of sibling features** — a
feature's test module may depend on `core.tests` and `core.loggers` but not
on another feature's production modules; share fixtures via `core.tests`.

**Putting the test sub-module alongside rather than inside the production
module** — Mill resolves `moduleDeps` references by the Scala object path;
nesting test inside production (`object tests extends ScalaTests` inside
`object domain`) keeps paths like `domain.tests` instead of a flat
`domainTests`.

**Duplicating dep lists instead of using `private val`** — when a module and
its test sub-module share the same `mvnDeps`, extract to a `private val` in
the parent `extends Module` block and reference it in both.

**Adding `zioDep` to `feature.domain`** — `feature.domain` must be ZIO-free; port
interfaces (which return `ZIO[...]`) belong in `feature.domain.workflows`. If ZIO
appears in `feature.domain.mvnDeps`, move the offending file to the `workflows` sub-module.

**Infra or app depending on `myFeature.domain` only** — if a module implements or calls
port interfaces, it must declare `myFeature.domain.workflows` in `moduleDeps`. A dep on
`myFeature.domain` alone is missing the port interface definitions.

**JS twin's `moduleDeps` pointing at the JVM module instead of the sibling twin** —
`vo.voJs` must depend on `identity.identityJs`, not `identity`. Pointing at the
JVM original compiles fine under plain `mill compile` (Mill doesn't cross-check
platform) but fails at the Scala.js link step, or silently pulls a JVM-only
transitive dependency into the browser bundle.

**Giving the JS twin its own source directory instead of reusing `sources`** —
duplicating files invites drift between JVM and JS versions of the same type.
The twin should have zero files of its own; `override def sources = Task { parent.sources() ++ super.sources() }` is what keeps one source of truth.

**Using the JVM dep instead of the `*Js`-suffixed one in the twin's `mvnDeps`** —
`preludeDep` and `preludeJsDep` are different published artifacts. Copy-pasting
the parent's `mvnDeps` into the twin without swapping suffixes fails resolution
or produces a JVM classfile the Scala.js linker can't consume.

