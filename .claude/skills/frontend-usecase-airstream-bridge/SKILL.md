---
name: frontend-usecase-airstream-bridge
description: Use when a Scala.js frontend use case must turn a ZIO effect into an Airstream Signal/EventStream for Laminar UI, when choosing among the reactive bridging strategies (imperative Var, one-shot fromFuture, EventBus pipeline), or when deciding whether launching a ZIO fiber per UI event is too expensive
metadata:
  tags: [scala, scalajs, zio, airstream, frontend]
---

# Frontend Use Case: ZIO → Airstream Bridge

**Scope:** Scala.js frontend, ZIO 2.x effects, Airstream `Signal`/`EventStream`/`Var`, Laminar UI. This skill is about the **boundary object** — the thing that calls a `core.usecases` `UseCase[C]` ([[usecase-command]], reused verbatim from the backend — see [[client-gateway-port]]) and republishes its result as a `Signal`. The boundary object itself is frontend-only: a singleton owning a `Var`/`Signal` pair, with no Command, no TX, no ZLayer registration of its own.

## Overview

The frontend has no single ZIO runtime entry point the way `ZIOAppDefault.run` gives the backend one — see [[composition-root]]. DOM events (clicks, mount, input) each start a *new* root effect. A shared `Runtime[R]` (built once in the composition root, passed as `given`) launches every one of them. Launching a fiber onto an existing runtime is cheap (fiber alloc + microtask enqueue) — the expensive thing would be rebuilding the `Runtime` per call, which nothing here does. So the boundary between imperative DOM-event world and ZIO is unavoidable; only its shape is a choice.

The use case's `E` channel must already be folded to `Nothing` before crossing the bridge — every ZIO effect exposed to Laminar is `UIO[A]`, its failures already turned into a state value.

## Scope the `Runtime`, Don't Default It

`given Runtime[Any] = Runtime.default` is the easy answer and the wrong one
once real `core.usecases` exist: it hides which services are actually wired
and can't fail loudly if a layer is missing. Scope the `Runtime` to the exact
`ZLayer` graph the composition root built, same discipline as backend
[[composition-root]]:

```scala
// Main.scala — composition root
given Runtime[GetLanguagesCommand.GetLanguagesUseCase] =
  Unsafe.unsafe { implicit u =>
    Runtime.unsafe.fromLayer(
      SttpHttpGatewayJs.makeLayer(baseUrl) >>>
        LanguagesGatewayHttp.layer >>>
        GetLanguagesCommand.useCaseLayer
    )
  }
```

As a second real `core.usecases` type is added, `R` widens to the union of
both usecase types off **one** root layer graph — one composition root, one
`given Runtime[R]`, exactly the backend's "only the composition root names
concrete infra types" rule applied here. Don't give each boundary object its
own separately-scoped `Runtime`; that's N unsafe launches and N places
someone can wire a layer wrong instead of one.

A boundary object built purely from in-memory fixtures (dev/test double, no
port crossed) needs **no** `Runtime` at all — it never touches ZIO, so it's
just a plain class/object with a `Var`. Don't manufacture a layer for
something that was never an effect.

## Three Bridge Shapes

### A — Imperative `Var` + fire-and-forget launch

```scala
package s4y.vocabla.frontend

import org.scalajs.dom
import zio.{Runtime, UIO, Unsafe, ZIO}

object ZioBridge:
  // R generic, not fixed to Any — callers pass whatever service type their
  // composition root's scoped Runtime[R] actually provides.
  def run[R](effect: ZIO[R, Nothing, Unit])(using runtime: Runtime[R]): Unit =
    Unsafe.unsafe { implicit unsafe =>
      val _ = runtime.unsafe.runToFuture(logDefects(effect))
    }

  // runToFuture surfaces a defect as a failed Future; a caller that then
  // discards the Future (as `run` does) loses it with no trace. Log it
  // here, once, centrally — see Common Mistakes below.
  private def logDefects[R, A](effect: ZIO[R, Nothing, A]): ZIO[R, Nothing, A] =
    effect.tapDefect(cause =>
      ZIO.succeed(dom.console.error("ZioBridge defect:", cause.prettyPrint))
    )
```

```scala
// ui.state.Languages — the boundary object; core.usecases.GetLanguagesCommand
// is the actual UseCase[C], reused unchanged from the backend pattern.
object Languages:
  private val _state: Var[State] = Var(State.Loading)
  val state: Signal[State] = _state.signal

  enum State:
    case Loading
    case Loaded(languages: LanguagesDescriptor)
    case Failed(message: String)

  def reload(using runtime: Runtime[UseCase[GetLanguagesCommand]]): Unit =
    _state.set(State.Loading)
    ZioBridge.run(
      useCase(GetLanguagesCommand()).fold(
        failure => _state.set(State.Failed(failure.toString)),
        descriptor => _state.set(State.Loaded(descriptor))
      ).unit
    )
```

Boundary object owns a `Var`, writes to it from inside the effect, exposes the read-only `.signal`. Simplest shape; each call site is one `ZioBridge.run(...)`. One boundary object per backend-fetched resource — `reload` is the only place a `core.usecases.UseCase[C]` gets invoked for that resource.

### B — One-shot `Signal` via `EventStream.fromFuture`

```scala
package s4y.vocabla.frontend

import com.raquo.airstream.core.EventStream
import zio.{Runtime, UIO, Unsafe}

import scala.concurrent.ExecutionContext

extension [A](effect: UIO[A])
  def toEventStream(using runtime: Runtime[Any], ec: ExecutionContext): EventStream[A] =
    EventStream.fromFuture(
      Unsafe.unsafe { implicit unsafe => runtime.unsafe.runToFuture(effect) }
    )
```

`EventStream.fromFuture` needs an `ExecutionContext` to register `Future#onComplete` — put one `given` in the composition root, not an `import ... global` at every call site:

```scala
// composition root (Main.scala)
import scala.scalajs.concurrent.JSExecutionContext

given ExecutionContext = JSExecutionContext.queue   // microtask-based, not global's macrotask
```

```scala
val state: Signal[State] =
  gateway.getLanguages
    .fold(f => State.Failed(f.toString), State.Loaded(_))
    .toEventStream
    .startWith(State.Loading)
```

No `Var`. Fetch-once-on-construction collapses to a one-liner. **`fromFuture` is eager** — the future starts the moment `.toEventStream` runs, i.e. at construction time here. Fine for "load on mount"; wrong if you expected the stream to be lazy per-subscriber.

### C — `EventBus` + `flatMapSwitch` for repeatable triggers

```scala
val reload = new EventBus[Unit]

val state: Signal[State] =
  reload.events
    .startWith(())                          // fire once on mount
    .flatMapSwitch { _ =>
      gateway.getLanguages
        .fold(f => State.Failed(f.toString), State.Loaded(_))
        .toEventStream
        .startWith(State.Loading)
    }
    .toSignal(State.Loading)

// wiring: onClick.mapToUnit --> reload.writer
```

Each `reload.events` emission rebuilds the inner effect from scratch (so `toEventStream` is called fresh, launching a new future). `flatMapSwitch` drops the previous inner stream when a new one arrives — last-trigger-wins for what the UI *sees*.

## Decision Table

| Shape | Use when | Cost |
|-------|----------|------|
| A — `Var` + `ZioBridge.run` | Imperative command dispatch (button calls a method); state changes come from multiple independent code paths, not just one fetch | Explicit `set` calls, easy to reason about and unit-test directly against the `Var` |
| B — `fromFuture` + `startWith` | Fetch-once-on-mount, no re-trigger needed; want to kill boilerplate `Var` | Eager: constructing the stream launches the fiber immediately |
| C — `EventBus` + `flatMapSwitch` | Repeatable trigger (reload button, search-as-you-type) where only the latest result matters | One `EventBus` + composition per use case; more moving parts than A |

**Current adopted shape: A, exclusively.** Every real `core.usecases`-backed
boundary object in this codebase is shape A. B and C are documented and kept
as reference (including as literal commented-out code next to the real
bridge) for when a second real usecase's shape actually calls for them —
see "Don't generalize the bridge before a third repeat" below. Don't reach
for B/C on a new boundary object just because they're documented; reach for
A first and only diverge when A visibly doesn't fit.

## Common Mistakes

**Forgetting the `ExecutionContext` for shape B/C.** `EventStream.fromFuture` fails to compile without one in scope (`Cannot find an implicit ExecutionContext`). Don't reach for `scala.concurrent.ExecutionContext.Implicits.global` per call site — define one `given ExecutionContext = JSExecutionContext.queue` in the composition root alongside `given Runtime[R]`, same lifetime, same place.

**Generalizing the fold+bridge skeleton before a third repeat.** Shape-A objects
repeat four lines: fold `E` into a local state case, call `ZioBridge.run`, done.
Don't collapse that into a generic helper (`onceZIO(command): Signal[LoadState[E, A]]`)
until a **third** repeat of the exact shape — with one or two usecases the helper's
own signature (givens for `UseCase[C]`, `Runtime[R]`, `ExecutionContext`, plus a
two-param `LoadState[E, A]`) costs more to read than the concrete lines, and concrete
is easier to diverge from later. Cost is asymmetric: collapsing three repeats later
is mechanical; unwinding a wrong helper across N call sites is not.

**Bridging a non-`UIO` effect.** `ZioBridge.run` and `toEventStream` both require `E = Nothing`. If a call site still has a real error channel, fold it (`.fold` / `.catchAll`) *before* the bridge, not after — the whole point is that nothing can be lost by launching fire-and-forget.

**Folding `E` to `Nothing` and assuming that covers all failure modes.** Folding
the error channel handles *expected* failures, but a defect (`ZIO.die`, an uncaught
exception in a `.map`/`.fold` callback) is a *different* channel — `UIO[A]` means
`E = Nothing`, not "cannot fail." `ZioBridge.run` discards the `Future` `runToFuture`
produces, so a defect vanishes silently — no stack trace, no console error, and
Scala.js has no unhandled-rejection reporting. (`toEventStream` is milder — Airstream
logs unhandled stream errors.) Tap defects centrally in the bridge
(`effect.tapDefect(...)`), not per call site.

**Assuming `flatMapSwitch` interrupts the ZIO fiber.** It only detaches the *stream* — the previous ZIO effect (e.g. an in-flight HTTP GET) keeps running to completion in the background; its result is just discarded. Harmless for idempotent GETs. If a stale request must actually stop (e.g. a mutating call), keep the `Fiber` from `runtime.unsafe.fork` and `interrupt` it explicitly instead of relying on Airstream to cancel anything.

**Rebuilding a `Runtime` per call site.** The cost concern people reach for ("is bridging expensive?") is almost always this, not the `runToFuture` call itself. One `Runtime[R]` built in the composition root ([[composition-root]]) from the real `ZLayer` graph, threaded as a `using` parameter everywhere, is enough — see "Scope the `Runtime`, Don't Default It" above. `Runtime[Any] = Runtime.default` is the version of this mistake that still compiles: it doesn't rebuild per call, but it hides which services exist and can't fail at construction if one is missing.

**Reaching for `Var` out of habit when B or C would drop it.** A `Var` that only ever gets written from one `.fold` call and read from one `.signal` is a sign shape B fits — no mutable state needed at all.

## Related

- [[composition-root]] — where the scoped `Runtime[R]` is constructed from the real `ZLayer` graph
- [[client-gateway-port]] — describes the whole `core` stack (`ports`/`gateways`/`usecases`) this skill sits on top of; `core.usecases` is the exact `UseCase[C]` this skill calls
- [[usecase-command]] — the `UseCaseCommand`/`UseCase[C]` pattern itself, reused unchanged in `core.usecases`; this skill is what happens *after* that call returns, on the way into Airstream
