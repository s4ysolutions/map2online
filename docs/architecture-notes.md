# Architecture notes: plan, prepare, follow a trip

Status: draft. The user-facing design (pages, sections, moves) is in
`trip-design.md`; this file says how to build it. Nothing here is built yet. The PoC on
`refactor/scala` (phases 0–9 in `rewrite-plan.md`) is the starting point:
a local-first map editor with a catalog (Category → Route → Feature), base
maps, KML, search and a PWA shell.

## 1. The problem

One person (the organiser) plans a trip for a group. The trip has three
stages:

| Stage | Who | What they need | Must work offline | Must work on a phone |
|-------|-----|----------------|-------------------|----------------------|
| Plan | Organiser | Find POIs and facts about them, order them into a good route, keep plans B and C, estimate costs | Should | No |
| Prepare | Organiser, participants | A list of things to buy, who buys what, what is done | Should | Yes |
| Follow | Everyone | Own position and track, the others' tracks, visited POIs, messages | Must | Yes |

## 2. Roles and permissions

| Action | Organiser | Participant |
|--------|-----------|-------------|
| Edit the trip (POIs, routes, plans B/C, budget) | yes | no |
| Invite / remove members, make groups | yes | no |
| Decide which POI/route is visible to whom and when | yes | no |
| See the route | all of it | only what is open to them now |
| Share own track, see the group's tracks | yes | yes, inside their group |
| Shopping list: add items, take an item, mark bought | yes | yes |
| Messages | yes | yes |
| Export KML | yes | no |

A trip can have more than one organiser (co-organisers with the same
rights). This costs little now and is hard to add later.

## 3. Domain: new bounded contexts

The current `catalog` stays as "map content": geometry, colours, Markdown.
A trip adds context around it. Each line is a future `features/<name>/`
with the usual domain / workflows / app / infra / presentation split.

| Feature | Main types | Notes |
|---------|------------|-------|
| `trip` | `Trip`, `Member`, `Role`, `Group`, `Invite` | The aggregate root. A trip owns one catalog. |
| `itinerary` | `Day`, `Stop(primary, alternatives)`, `Plan` (A/B/C) | References catalog features by id. Plans B and C are alternative stops per slot, not copies of the whole route. |
| `visibility` | `Grant(subject, target, window)` | Subject: member, group or everyone. Target: category, route or feature. Window: from/until time, or "after stop N is visited". |
| `poi` | `PoiInfo`, `Source`, `Photo`, `Review`, `OpeningHours` | Facts collected from outside services, attached to a feature. Cached with source and fetch time. |
| `routing` | `Leg`, `DistanceMatrix`, `Optimisation` | Order stops, compute legs, recompute when a plan B is chosen. |
| `budget` | `CostItem`, `Currency`, `Estimate` | Per stop (tickets), per leg (fuel, transit), per day (food, lodging), per person or per group. |
| `shopping` | `Item`, `Assignee`, `State` (open / taken / bought) | Simple; most conflicts are "two people took the same item". |
| `tracking` | `TrackPoint`, `Track`, `Visit` | Local GPS log; a visit is detected when the track enters a radius around a stop. |
| `messaging` | `Message`, `Channel` (trip, group, direct) | Append-only; easy to sync. |
| `discovery` | `SharedRoute`, `ExternalRoute` | Routes other users made public, and routes from other services. |
| `advisor` | `Question`, `Advice` | AI help; online only. |
| `sync` (core) | `Change`, `Cursor`, `Outbox` | See section 4. |
| `auth` (core) | `Account`, `Session` | Needed as soon as there is a backend. |

## 4. Local-first storage and sync

**Decided: option A (server-ordered change log).** The local database is the main one; the backend is a
relay and a backup. Today the catalog is saved as one JSON document. That
cannot be merged between devices, so storage must change before sync.

Options:

| Option | How | Good | Bad |
|--------|-----|------|-----|
| A. Server-ordered change log (recommended) | Every edit is a domain change (`MoveStop`, `TakeItem`, …). Devices write to a local outbox and push. The server checks permissions, gives each change a sequence number per trip, and devices pull from their last cursor. Conflicts are solved in domain code (last write wins per field; "taken" goes to the first change the server saw). | Fits workflows and typed errors; the server can enforce roles and visibility; easy to test on the JVM | We write the merge rules ourselves |
| B. CRDT library (Automerge / Yjs through a Scala.js facade) | Each trip is a CRDT document | Merging is solved | The server cannot see or filter content, so per-participant visibility is hard; a large JS dependency; domain types become CRDT types |
| C. Whole-document sync, last write wins | Upload and download the JSON | Simple | Loses edits when two people edit offline |

Option A also gives visibility for free: the server sends a participant
only the changes they are allowed to see.

Shape in the code: `core.sync` (ports: `ChangeLog`, `Outbox`, `SyncGateway`),
storage moves from one document to records per entity plus the outbox in
IndexedDB, `products.server` (zio-http + Postgres) as already planned in
`rewrite-plan.md`.

## 5. Protecting routes from being copied

**Decided: make copying hard, not impossible.** The goal is that route
data is never visible as plain JSON, in DevTools or on disk.

Facts this rests on:

- WASM cannot open network connections itself. It calls the browser's
  `fetch` / WebSocket, so every request and response is visible in the
  DevTools Network tab, as is IndexedDB in the Application tab. Plain JSON
  there would be readable by anyone.
- To draw a route, OpenLayers needs plain coordinates in JS memory. A
  person who knows the debugger can still read them there.

Layers:

1. **Send less.** The server gives each participant only what their
   sharing rules open. Stops that are open later are sent ahead (for
   offline use) but stay locked, see 2.
2. **Binary, encrypted packages.** Trip data for participants is a
   binary format (not JSON), encrypted per participant. Network traffic and
   IndexedDB show only bytes.
3. **Decoder in the app.** Decoding and key derivation live in the
   Scala.js code (minified), which gives the map only the stops that are
   open now. Reading the data needs reverse-engineering the bundle, not
   just opening DevTools. WASM was considered and dropped: it adds a second
   toolchain and protects no more, since it also uses the browser's network
   and the map still needs plain coordinates.
4. **Time-locked keys (optional).** Keys for later windows are released
   by the server when the window opens, or passed on by a group member over
   the mesh.
5. **Watermarking.** Each participant's coordinates are moved by a few
   metres in a pattern unique to them, so a leak shows its source.
6. **No export for participants.**

Organisers keep plain local data; protection applies only to what is sent
to participants.

## 6. Mobile without app stores

What a PWA can and cannot do (2026):

| Need | Android Chrome PWA | iOS Safari PWA | Capacitor app |
|------|--------------------|----------------|---------------|
| Offline app and data | yes | yes (storage can be cleared after weeks without use) | yes |
| GPS while app is open | yes | yes | yes |
| GPS track with screen off / app in background | no | no | yes (plugin) |
| Push notifications | yes | yes (installed PWA only) | yes |
| Bluetooth (Meshtastic radios) | Web Bluetooth: yes | no | yes |
| Phone-to-phone mesh without extra hardware | no | no | partly (Android Nearby; iOS limited) |

Consequence: **a full track while the phone is in a pocket needs a native
shell.** The PWA can only record while the screen is on.

Options:

- **PWA only.** Track only while the app is open (keep-awake while
  following). Mesh only through Meshtastic radios on Android. No stores.
- **PWA + Android APK** from the Capacitor shell already in the repo, given
  out as a file or through Google Play (much easier than the App Store).
  iOS users get the PWA with its limits.
- **PWA + both native shells.** Full features, but App Store review.

**Decided: PWA only for now; an Android app comes later** (a track with the
screen off is needed, and only a native app can record it; postponed). (A PWA — Progressive Web App — is a web site that the
user installs to the phone's home screen from the browser. It opens like an
app and works offline. No app store.) Start with PWA only, design `tracking` and `messaging`
behind ports (`LocationSource`, `MessageTransport`) so a Capacitor plugin
can be added later without changing the domain.

## 7. Messages and mesh

`MessageTransport` port with adapters, tried in order:

1. Backend over the internet (WebSocket, then the sync log).
2. Meshtastic LoRa radio over Web Bluetooth (Android Chrome, desktop
   Chrome; **decided: limiting mesh to these browsers is acceptable**). Messages and positions are small enough for LoRa. Each user
   needs a ~30 € radio.
3. Later, in a native shell: phone-to-phone (Android Nearby Connections).

Messages and track points are append-only with ids made on the device, so
the same message arriving over two transports is stored once.

## 8. Outside data sources

Most travel services have no open API, or their terms forbid storing the
data. Plan for a `PoiProvider` port with several adapters, each one with its
own rules on caching.

| Need | Sources with a usable API | Caching allowed | Notes |
|------|---------------------------|-----------------|-------|
| POIs and facts | OSM Overpass, Wikidata, Wikipedia | yes | Free; the base layer |
| Photos | Wikimedia Commons, Mapillary | yes (with licence) | |
| Reviews, ratings, opening hours | Google Places, Foursquare | very limited (Google: only `place_id`) | Paid; calls go through the backend so the key stays secret |
| Shared routes from others | GPX/KML files, Wikiloc (export), our own users | yes | AllTrails, komoot, Strava: no open API for this |
| Distances and travel times | OSRM, GraphHopper, Valhalla, OpenRouteService | yes | Self-host or paid plan |
| Route order with time windows | VROOM (open source) on the backend; small solver in the browser for offline | — | Plans B/C: re-run with the alternative stop |

## 9. AI advisor

Calls go from the browser to `products.server`, which calls the Claude API
(the key never reaches the browser). The model gets tools that call our own
ports: search POIs in an area, distance matrix, current itinerary, budget.
Advice comes back as proposed changes the organiser accepts or rejects; it
never edits the trip by itself. Online only.

## 10. Proposed phase order

Each phase ends usable. Planning-only features come first because they need
no backend.

| # | Phase | Needs backend |
|---|-------|---------------|
| 10 | Trip aggregate (one local user = organiser), itinerary with days, stops and plans B/C | no |
| 11 | Routing: distance matrix, stop order, recompute on plan B | no (external routing API) |
| 12 | POI enrichment: Overpass, Wikidata, Commons photos | no |
| 13 | Budget estimate | no |
| 14 | Storage per entity + change log + outbox (still local) | no |
| 15 | `products.server`: auth, invites, sync, roles enforced on the server | yes |
| 16 | Visibility grants, participant view, watermarking | yes |
| 17 | Shopping list | yes |
| 18 | Tracking: own track, visits, group tracks over sync | yes |
| 19 | Messaging over the backend | yes |
| 20 | Paid POI providers and AI advisor (through the backend) | yes |
| 21 | Discovery: users' public routes, GPX/KML from other services | yes |
| 22 | Meshtastic transport over Web Bluetooth | no |
| 23 | Native shell plugins (background GPS, Nearby), if chosen in section 6 | — |

## 11. Open questions

Decided: sync by change log (4), encrypted binary packages decoded in the app, no WASM (5), PWA only (6), mesh only in Chromium browsers (7).

1. Group size: 5 people or 200? This changes how tracks are synced and
   whether the server must fan out positions live.
2. Budget: one currency per trip, or many with exchange rates?
3. Are paid APIs (Google Places, routing) acceptable, and who pays — the
   organiser's own key, or ours?
4. Is "shared routes of other users" public to everyone, or only between
   trips of the same organiser?
