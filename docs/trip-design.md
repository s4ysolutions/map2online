# Trip design: pages, sections and moves

Status: draft for discussion. This document says what the user sees and
does. How it is built is in `architecture-notes.md`.

## 1. The idea in one paragraph

An organiser plans a trip on a map, collects places, puts them into days,
keeps plan B and C for each important stop, and sees what it will cost.
Then they invite people. Together they prepare: a shared shopping list on
the phone. On the trip everyone opens "Go": the map follows them, shows
the next stop, the track, where the others are, and the group chat. It
works without the internet.

## 2. Words used in this document

| Word | Meaning |
|------|---------|
| Trip | One journey: dates, area, people, places, days |
| Place | A point of interest (POI) saved into the trip |
| Wishlist | Places saved but not yet put into a day |
| Day | An ordered list of stops for one date |
| Stop | A place in a day. It can have alternatives (plan B, plan C) |
| Organiser | Creates and edits the trip. There can be more than one |
| Participant | Invited person. Sees what the organiser opened for them |
| Group | Part of the participants who travel together and see each other |

## 3. Map of pages

```
My trips ─┬─ New trip
          ├─ Invitation (open by link / QR)
          └─ Trip ─┬─ Plan ────┬─ Explore      (map + place cards)
                   │           ├─ Days         (itinerary, plan B/C)
                   │           ├─ Budget
                   │           └─ Advisor      (chat panel, over Explore/Days)
                   ├─ Prepare ─┬─ People       (invite, roles, groups)
                   │           ├─ Sharing      (who sees what, when)
                   │           ├─ Shopping
                   │           └─ Offline      (download the trip)
                   ├─ Go ──────┬─ Live map
                   │           ├─ Messages
                   │           └─ Group
                   └─ Settings (base maps, wording, units, currency)
```

A participant sees the same trip with fewer sections:
**Route** (read-only Days and Explore, only open stops), **Shopping**,
**Go**, **Messages**.

Layout:

- Desktop: map in the middle, section panel on the left, stage tabs
  (Plan / Prepare / Go) in the top bar. Planning is mainly done here.
- Phone: map full screen, the section is a bottom sheet that the user
  drags up, stage tabs as a bottom bar. Prepare and Go are mainly done here.

## 4. Pages and moves

Each move is "the user does → the app shows". Moves are numbered so we can
talk about them.

### 4.1 My trips

The first page.

- List of trips in two groups: "I organise" and "I take part". Each card:
  name, dates, stage (planning / preparing / on the way / finished), a
  small map.
- An invitation waiting for an answer is shown on top.

Moves:

- **M1 New trip.** Tap "New trip" → enter name, dates (can be empty),
  area (search a place or draw a box on the map) → the trip opens in
  Plan → Explore, the map shows the area.
- **M2 Open trip.** Tap a card → the trip opens in the stage it is in now.
- **M3 Accept invitation.** Open a link or scan a QR → see trip name,
  organiser, dates → "Join" → the trip appears under "I take part".

### 4.2 Plan → Explore

The map with everything that can go into the trip.

What is on the screen:

- Base map switcher (as today: OSM, Google, Yandex, own servers).
- Place layers the user can turn on: sights, food, sleep, fuel, water,
  shops, transport, viewpoints… Places come from outside services.
- Layer "Routes of others": public routes of other users of the app and
  routes from imported GPX/KML files.
- The trip's own places and days on top.

Moves:

- **M4 Look at a place.** Tap a place → a card: photos, rating and
  reviews, opening hours, price, phone and website, where the data came
  from. Buttons: "Add to wishlist", "Add to day…".
- **M5 Search.** Type a name or address → results on the map (as today).
- **M6 Search here.** Pan the map, tap "Search this area" with a type
  (e.g. "camping") → results in the area.
- **M7 Use a route of others.** Tap a route → card with length, photos,
  author → "Copy into trip" puts its points into the wishlist or a day.
- **M8 Import a file.** Drop a GPX/KML file → it becomes a route of
  others (only for this trip) → then as M7.
- **M9 Draw.** Draw own points and lines, as in the current catalog editor.

### 4.3 Plan → Days

The itinerary. A list on the left, the route on the map.

What is on the screen:

- Wishlist at the top (places not in a day yet).
- Days, each with stops in order. Between two stops: travel time,
  distance, way (car, foot, bike, transit).
- Warnings on a stop: "closed on Monday", "arrive after closing time",
  "day is 14 hours long".
- On the map: the day's line; alternatives are drawn faded.

Moves:

- **M10 Put a place into a day.** Drag from wishlist to a day (or "Add to
  day…" from a card) → legs and times are recalculated.
- **M11 Reorder.** Drag a stop up or down → recalculated.
- **M12 Best order.** Tap "Optimise day" → the app proposes a new order
  with the time saved → "Apply" or "Cancel". Fixed stops (hotel at the
  end, booked time) are not moved.
- **M13 Add plan B.** On a stop tap "Add alternative" → choose from the
  wishlist or from places nearby of the same type → the stop now shows
  "A · B · C".
- **M14 Try plan B.** Tap B on a stop → the day is recalculated with B,
  the budget and times change, nothing is saved until "Make B the main".
- **M15 Fix time.** Set a stop's arrival time or length of stay (a
  booked tour at 10:00, two hours in a museum).

### 4.4 Plan → Budget

- Totals: whole trip, per day, per person. With alternatives the total is
  a range ("from 820 to 960 €").
- Lines come from three places: stops (tickets), legs (fuel, tickets for
  transport), days (sleep, food). Lines with no price are listed as
  "price unknown".

Moves:

- **M16 Set a price.** Tap a line → enter price, "per person" or "for
  the group", currency.
- **M17 Day costs.** Set default costs per day (food per person, sleep)
  once for the whole trip; change them for one day.

### 4.5 Plan → Advisor

A chat panel that opens over Explore or Days. Online only.

- **M18 Ask.** "Where can we eat near stop 3 on day 2 for less than 20 €?"
  → the answer has places on the map with "Add" buttons, or a proposed
  change to a day with "Apply" / "Cancel". The advisor never changes the
  trip without the organiser's tap.

### 4.6 Prepare → People

- **M19 Invite.** Tap "Invite" → a link and a QR code; choose the role
  (participant or organiser) and the group.
- **M20 Groups.** Create groups, drag people between them. People in a
  group see each other's position on the trip.
- **M21 Remove.** Remove a person → they lose the trip on their next
  connection.

### 4.7 Prepare → Sharing

Decide what each participant sees, and when.

What is on the screen: days and stops, each with a rule:

| Rule | Meaning |
|------|---------|
| Open now | Visible from today |
| Open on date/time | Visible from that moment |
| Open after previous stop | Visible when the group visits the stop before |
| Only organisers | Never shown to participants |

A rule can be for everyone or for one group.

Moves:

- **M22 Set a rule.** Tap a day or stop → choose the rule and for whom.
  A rule on a day applies to all its stops unless a stop has its own.
- **M23 See as.** Choose "See as: group Red" → the map and Days show
  exactly what that group sees now, or at a chosen time.

### 4.8 Prepare → Shopping

Mainly on the phone.

What is on the screen: items in groups (food, gear, medicine, documents…).
Each item: name, quantity, shared or personal, who takes it, state.

Moves:

- **M24 Add item.** Type a name and quantity → added as "open". From a
  template ("3 days in the mountains") many items at once.
- **M25 Take item.** Tap "I take it" → the item shows my name. If two
  people take it offline, the first one the server got wins and the second
  one sees "Anna took it".
- **M26 Bought.** Tick → the item is done. Filter: "my items", "not taken
  yet", "all".

### 4.9 Prepare → Offline

- **M27 Make ready for offline.** Tap "Download" → choose base map
  and how detailed → the app shows size and progress, then "Ready
  offline" with the date. A trip that is not ready shows a warning on
  the Go tab.

### 4.10 Go → Live map

The main page during the trip. Built for one hand on a phone.

What is on the screen:

- Map that follows me (can be turned off by panning).
- My track for today.
- The next stop card at the bottom: name, distance, time to get there,
  opening hours, "Navigate" (opens an outside navigator app), "Skip".
- Visited stops ticked, stops not open yet are not shown at all.
- People of my group as dots with "seen 5 min ago".
- Connection status: "online", "radio mesh", "offline — 3 messages
  waiting".

Moves:

- **M28 Start the day.** Tap "Go" → the map follows, the track starts.
  The screen stays on (see the note about tracks in section 6).
- **M29 Arrive.** Come near a stop → "You are at the Castle. Mark
  visited?" → yes → the next stop opens if its rule says so.
- **M30 Stop is closed.** Tap "Problem" on the stop → "Closed" or
  "Can't reach" → the organiser gets a message. The organiser (or anyone,
  if allowed) taps plan B → all phones show the new stop.
- **M31 Find the group.** Tap a person → their track and last position.

### 4.11 Go → Messages

- One trip chat, one chat per group, direct messages.
- **M32 Send.** Type and send. Offline the message waits and goes when
  there is internet or a mesh radio near. The message shows its state:
  waiting, sent, delivered.
- **M33 Share position.** "Send my position" puts a point in the chat;
  tap it to see it on the map.

## 5. What each role sees

| Section | Organiser | Participant |
|---------|-----------|-------------|
| Explore | everything, can edit | only open stops, read only |
| Days | everything, can edit | only open stops, read only, no alternatives until they become main |
| Budget | yes | the per-person total only (to decide) |
| Advisor | yes | no |
| People | can edit | sees the list |
| Sharing | yes | no |
| Shopping | yes | yes |
| Offline | yes | yes |
| Go | yes | yes |
| Messages | yes | yes |
| Export KML | yes | no |

## 6. Limits the user will see

- **Track with the screen off.** In the browser the track is recorded
  only while the app is open on the screen. Go keeps the screen on.
  A full track in a pocket needs a native Android app (planned, postponed).
- **Mesh radio.** Messages and positions without the internet go through
  a small LoRa radio (Meshtastic, about 30 €) connected by Bluetooth.
  Works in Chrome on Android and on computers. Not on iPhone.
- **Route copying.** Participants can't export, and route data is never
  sent or stored as plain text. Someone who wants to copy what is on the
  screen still can; each participant's copy is slightly different, so a
  leak shows who it came from.

## 7. Questions for the design

1. Budget: do participants see the total? Should Go have "what we really
   spent" next to the estimate, and split costs between people?
2. Can participants suggest places (a "suggest" button on a card), or is
   the trip only the organiser's?
3. Can different groups follow different days or routes at the same
   time?
4. Who may switch to plan B during the trip: only organisers, or anyone
   in the group?
5. After the trip: do we need a "Finished" page (tracks, photos, what was
   visited, share as a public route for others)?
6. Should participants get a notice when a new stop opens?
7. Base maps per stage: should the organiser choose which base map
   participants get offline?
