# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

Map2Online: plan trips by drawing points and routes over many base maps
(OSM, Google, Yandex, own tile servers with Soviet General Staff maps),
organise them as Category → Route → Feature with Markdown notes, and
import/export KML.

This branch (`refactor/scala`) is a from-scratch rewrite in Scala 3 /
Scala.js. The previous TypeScript/React app lives on `master`; read it with
`git show master:src/<path>` when porting. The phase plan and the decisions
behind it are in `docs/rewrite-plan.md`.

## Stack

- Mill 1.x (`./mill` launcher, version pinned in the `build.mill` header)
- Scala 3, Scala.js (ES modules), Laminar + Airstream
- ZIO 2, zio-prelude, zio-schema; MUnit for pure tests, ZIO Test for effects
- OpenLayers via a hand-written facade; Google Maps / Yandex JS APIs as
  background engines
- Vite bundles Mill's linker output (`vite.config.js`); pnpm for npm packages
- JDK 21+ on PATH (`mill-jvm-version: system`)

## Commands

```bash
./mill __.compile                                  # compile everything (JVM + JS)
./mill __.testForked                               # run every test module
./mill core.app.tests.testForked                   # one test module
./mill mill.scalalib.scalafmt/checkFormatAll       # format check (CI)
./mill mill.scalalib.scalafmt/                     # reformat everything
./mill -w products.web.fastLinkJS                  # keep the JS bundle fresh while `pnpm dev` runs
pnpm dev                                           # Vite dev server (after a fastLinkJS)
pnpm build                                         # fullLinkJS + production bundle in dist/
```

## Architecture

Follow the skills in `.claude/skills/` (from
`s4ysolutions/hexagonal-scala-zio-best-practice`, see its README there).
Entry points: `hexagonal-feature-layout` → `module-separation` →
`layers-to-modules` → `mill-module-layout` for structure;
`domain-value-objects` / `zio-prelude-domain-patterns` /
`domain-identity-types` / `domain-operations-and-workflows` for the domain;
`client-gateway-port`, `frontend-usecase-airstream-bridge`,
`ui-component-container-pattern` for the Scala.js side.

Invariants that are easiest to break (each owned by the named skill):

1. `feature.domain` has no ZIO; ports and workflows live in
   `feature.domain.workflows` (`layers-to-modules`).
2. Concrete infra types are named only in `products.*` (`composition-root`).
3. No `provide` for layer wiring; `>>>` / `++` only (`zio-layer-composition`).
4. No `Dto` suffix on DTO class names (`endpoint-contract-separation`).
5. Never say "domain service": it is an Operation or a Workflow.

Top-level layout: `core/` (feature-agnostic kernel), `features/<name>/`
(one per bounded context), `products/web` (the browser app and its
composition root). The target module list is in `docs/rewrite-plan.md`;
modules are added to `build.mill` only when they get real code.

## Deviations from the skills (deliberate)

- **The browser is the application.** The skills assume a backend runs domain
  logic and the frontend only cross-compiles VOs. Here the app is local-first
  with no backend yet, so every domain, workflow and app module is a
  `BaseModule` with a nested `*Js` twin. The JVM side gives fast tests and is
  ready for a future `products.server`. JS-only code (facades, IndexedDB,
  Laminar UI) uses `BaseJsModule` directly.
- **One Dep for both platforms.** `build.mill` declares dependencies with the
  `::` platform separator before the version (`mvn"dev.zio::zio::2.x"`), so
  the same `Deps.zio` resolves to the `_sjs1` artifact in a JS module. Twins
  still declare their own `mvnDeps`, reusing the parent's Seq.
- **Packages.** Core: `s4y.<module>` as in the skills (`s4y.app`,
  `s4y.domain.errors`, `s4y.presentation.laminar`). Features:
  `s4y.map2online.<feature>.<layer>`. Product: `s4y.map2online.web`.
  Inside `s4y.app.*` the `s4y.app.zio` package shadows the ZIO library;
  import ZIO there as `_root_.zio`.

## Product decisions already made

- Map: OpenLayers draws and edits on top; Google and Yandex are
  *background engines* (their own JS API maps under a transparent OL map,
  following OL's view). Your own tile servers and other XYZ sources are plain
  OL tile layers. Model sources as an enum
  (`Tiles(...)` / `Background(engine, ...)`), never by id prefix. Shared view
  state is lat/lon/zoom (not EPSG:3857 metres) because Yandex is EPSG:3395.
- Bing is dropped (service retired).
- Feature/route/category descriptions are Markdown, not rich text.
- No data migration from the old IndexedDB store; there is no existing data.
- Offline: own tile servers provide region packages later; Google/Yandex are
  online-only.

## Cloud sessions

`.claude/hooks/session-start.sh` prepares Mill in Claude Code cloud
containers: Coursier uses Google's Maven Central mirror (repo1 returns 429
there), and the JVM Mill launcher is used because the native one cannot
trust the proxy CA. It writes `COURSIER_REPOSITORIES` and `MILL_VERSION` to
the session environment.
