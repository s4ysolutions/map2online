# Map2Online

https://map2.online: plan trips and travels by drawing routes on the map.

> This branch is a rewrite in Scala 3 / Scala.js. The current production app
> (TypeScript/React) is on `master`. See `docs/rewrite-plan.md`.

## Development

Requirements: JDK 21+, Node 22+, pnpm.

```bash
./mill __.testForked                # tests
./mill -w products.web.fastLinkJS   # terminal 1: keep the Scala.js bundle fresh
pnpm install && pnpm dev            # terminal 2: http://localhost:5173
```

Production build: `pnpm build`, then serve `dist/`.

### Offline and installable

The production build is a PWA: it can be installed from the browser, starts
offline with all data (kept in IndexedDB), and caches tiles from our own
tile servers. Export KML to back data up.

### Native apps (Capacitor)

On a machine with the Android SDK / Xcode:

```bash
pnpm exec cap add android      # or ios; commit the generated project
pnpm cap:sync                  # production build + copy into the native projects
pnpm exec cap open android     # build and run from Android Studio / Xcode
```

### Map API keys

Google and Yandex base maps need API keys at build time: copy `.env.example`
to `.env.local` and fill in `VITE_GOOGLE_MAPS_KEY` / `VITE_YANDEX_MAPS_KEY`.
Without a key those maps are not offered.
