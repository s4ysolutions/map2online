# Rewrite plan: Scala 3 / Scala.js on Mill

The TypeScript/React app (2020–2024) stays on `master`. This branch,
`refactor/scala`, starts from an empty tree (one commit removing every file
on top of `master`, so history stays connected and a PR into `master` is
possible) and rebuilds the app phase by phase.

## Decisions

| Topic | Decision |
|-------|----------|
| Language | Scala 3 everywhere: Scala.js frontend now, JVM backend later |
| Build | Mill 1.x, hexagonal module split per `.claude/skills` |
| UI | Laminar + Airstream; ZIO only in storage/sync/use cases |
| Map renderer | OpenLayers (needs EPSG:3395 for Yandex; MapLibre can't) |
| Google / Yandex | Background engines via their JS APIs, synced to the OL view |
| Own tiles | Plain OL tile layers from own tile servers; offline packages later |
| Bing | Dropped (retired by Microsoft) |
| Descriptions | Markdown instead of rich text |
| Old data | No migration; there is no existing data |
| Mobile | Responsive PWA first, Capacitor shell later |

## Target module layout

```
core/
  i18n, identity, domain/errors, app (UseCase[C])        BaseModule + *Js twin
  identity/minting the only way to construct an Identifier (infra, presentation, tests)
  markup           lenient XML/HTML parser, HTML → Markdown, Markdown → safe HTML  + *Js twin
  tx               TransactionManager[TX], IdGenerator ports                       + *Js twin
  kv               KeyValueStore port (string documents by key)                    + *Js twin
  infra/memory     semaphore transactions, random UUIDs, map store                 + *Js twin
  infra/browser    IndexedDB and localStorage KeyValueStores                       JS
  facades/ol       OpenLayers facade (only what we use)    JS
  facades/engines  Google Maps JS API and Yandex Maps 2.1 (load, follow a view)  JS
  preferences      UI preferences by key (use cases over a KeyValueStore)          + *Js twin
  presentation/laminar  ZioBridge, runtime narrowing, shared UI pieces            JS
  presentation/map MapSurface: what features need from the map                    JS
  tests
features/
  catalog     Category→Route→Feature, geometry, colour palette, Markdown descriptions,
              reorder, visibility
              domain, workflows (CatalogRepository port, CatalogEdit), app (load, edit,
              import/export KML), infra.store (one JSON document in a KeyValueStore),
              presentation.laminar (CatalogState, features layer and drawing tools
              on a MapSurface, the tree)
  kml         KML ⇄ catalog as pure operations over core.markup's parser; import
              fitting (any nesting → Category/Route/Feature), palette colour mapping
  basemap     enum MapSource { Tiles | Background(engine) }, groups, selected source,
              view state (lat/lon/zoom live + debounced save), background engines
  search      Nominatim gateway port + adapter, results layer
  wording     the category/route naming choices
  shell       top navigation, side drawers, floating panel (presentation only)
products/
  web         Scala.js main: composition root, ZLayer graph, given Runtime, mounts Laminar
```

Every domain/workflow/app module cross-compiles (JVM for tests and a future
server, JS for the browser). A backend becomes `products.server` only when
sync is added.

## Phases

| # | Phase | Source on `master` | Done when |
|---|-------|--------------------|-----------|
| 0 | Clean start, CLAUDE.md, skills, cloud start-up hook, this plan | — | ✅ |
| 1 | Mill skeleton (`core.app`, `core.domain.errors`, `core.presentation.laminar`, `products.web`), Vite, CI, scalafmt | `.github/workflows` | ✅ CI green |
| 2 | Pure domain: `core.identity`, catalog value objects, the `Catalog` aggregate and its operations, colour palette, Markdown descriptions | `src/style`, `src/richtext`, `src/catalog`, `src/lib/reorder.ts` | ✅ MUnit tests on JVM and Node; the old equality bugs (`coordinatesEq` uses `===` where `!==` is needed; `Feature.eq` never compares `lon`) are gone by using derived equality |
| 3 | KML import/export | `src/importer`, `src/exporter`, `tests/data/*.kml` | ✅ fixture and round-trip tests on JVM and Node |
| 4 | Storage: catalog repository over a key-value store (IndexedDB in the browser, memory in tests); localStorage for UI state; edit/import/export use cases | `src/catalog/storage`, `src/kv` | ✅ workflow, store and use-case tests against the memory store |
| 5 | Map: OL facade, basemap sources and background engines, view sync | `src/map-sources`, `src/react/components/GoogleMap`, `src/react/components/OpenLayers` | ✅ checked in headless Chromium: tile URLs per source, switching, saved map and view, Google engine under OL (Yandex and live tiles are blocked from the build container) |
| 6 | Drawing: tools, draw/modify/select/snap, active features layer, context menu | `OpenLayers/interactions`, `src/ui/tools` | ✅ browser test: draw point and coloured line (category and route auto-created), Esc cancels, drag a point, delete via context menu, all persisted across reload |
| 7 | Catalog UI: tree, drag-and-drop reorder, edit/delete forms, Markdown editor, import/export dialogs | `src/react/components/Catalog`, `ModalForms`, `TopNavigation` | ✅ browser test: import a KML file, drill down, choose the drawing route, select, edit (title, colour), hide, drag to reorder, delete with confirmation, export, all persisted |
| 8 | Search and wording | `src/search`, `src/personalization` | everything the old app does |
| 9 | Mobile: responsive layout, touch, service worker, Capacitor shell | — | installable app on a phone |

Later, outside this plan: `products.server` (zio-http, Postgres) with sync,
auth and sharing; offline region packages from own tile servers.

## Porting notes from the old code

- The engine-switching design (`src/ui/layers/base`, `GoogleMap/`) is kept:
  one shared view/source state, OL leads, the background engine follows.
  Improvements: typed sources instead of the `Google` id prefix, lat/lon in
  the shared state, per-frame in-memory sync separated from the debounced
  save, no module-level mutable globals.
- Styles: the old app persisted only a palette style id per feature and fell
  back to the default for anything else, so a feature's style is just a
  palette `Color` (no separate `styles` feature). The full KML style model
  (icon, line width, balloon, list) belongs to the `kml` feature in phase 3,
  which maps imported styles onto the palette and writes palette styles back.
- KML parsing is a pure function over a small lenient XML parser
  (`core.markup`) rather than a port with DOM and JVM adapters: it is
  always-local CPU work, and one implementation behaves the same in tests
  and in the browser. It also tolerates the HTML found in descriptions
  (unclosed `<br>`, mismatched tags).
- KML colours are read as standard `aabbggrr` and snapped to the nearest
  palette colour; the old app's `#rrggbbaa` values and `map2_style_…` ids
  map exactly. Exports write standard colours, HTML descriptions and the
  Markdown source in `ExtendedData` (`map2_markdown`) for lossless re-import.
- Import fitting: a folder's own placemarks form one route; folders holding
  only placemarks are routes of the folder above; every folder with
  subfolders is a category of the routes directly in it; empty levels vanish;
  unnamed folders borrow the nearest name above (finally the file name).
  The old "(auto)" suffix for mixed folders is dropped.
- Background engines need API keys at build time (`VITE_GOOGLE_MAPS_KEY`,
  `VITE_YANDEX_MAPS_KEY`, see `.env.example`); without a key that engine's
  maps are simply not offered. Yandex uses the 2.1 API (it has satellite and
  hybrid types) and switches the OpenLayers view to EPSG:3395 while shown.
  Engine maps only draw whole zoom levels, so the view snaps to them then.
- Drawing is catalog editing on the map, so it lives in
  `catalog.presentation`, not a separate feature. It reaches the map only
  through `core.presentation.map.MapSurface`, which the base map widget
  implements; the product wires the two together. A Browse tool (pan and
  select, no drawing) is added so taps on a phone do not create points.
- Reordering uses pointer events with capture instead of HTML5 drag and
  drop, so it works with touch as well as a mouse.
- Scala.js output targets ES2018 (regex Unicode classes); every browser the
  app supports has it.
- Storage: the catalog is saved as one versioned JSON document. IndexedDB
  transactions close as soon as control returns to the event loop, so they
  cannot span ZIO steps; instead the transaction manager serialises
  read-modify-write and each save is a single atomic `put`. The repository
  keeps the loaded catalog in memory, so only writes touch IndexedDB.
- The tree's expanded/collapsed (`open`) flag was stored on categories and
  routes; it is UI state and moves to the key-value store with the catalog UI.
- Inserting at position 0 appended in the old code (`position || length`);
  the new `OrderingOperations.insert` takes `Option[Int]`.
- Domain objects in the old code mutate themselves and persist with
  fire-and-forget `update().then()`. The rewrite uses immutable VOs,
  operations, and workflows that return effects with typed errors.
