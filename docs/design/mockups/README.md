# Mockups

Static screen mockups for the pages and moves in `../../trip-design.md`.
They were made on a Claude Design canvas:
https://claude.ai/artifact/EbTT5eE5Z6T1fMxnXDXBkm (private to the owner).

Open any `.dc.html` file in a browser to see it. The files use no template
logic, so they render as plain HTML; the `support.js` script they load is
the canvas runtime and is not needed here (the browser reports it as
missing). `canvas.json` is the canvas layout (positions, pages, titles), kept
so the set can be loaded into a canvas again.

## Chosen style: C · Night instrument

Big monospace numbers, condensed type (Barlow Semi Condensed + JetBrains
Mono), one signal colour (yellow) for "the route / what to do now", cyan
for people.

| Screen | Night | Day |
|--------|-------|-----|
| My trips | `Home.dc.html` | — |
| New trip | `NewTrip.dc.html` | — |
| Invitation (phone) | `Invitation.dc.html` | — |
| Plan › Explore, place card | `Explore.dc.html` | — |
| Plan › Days | `NightDays.dc.html` | `DayDays.dc.html` |
| Plan › Budget | `Budget.dc.html` | — |
| Plan › Advisor | `Advisor.dc.html` | — |
| Prepare › People | `People.dc.html` | — |
| Prepare › Sharing | `Sharing.dc.html` | — |
| Prepare › Shopping (phone) | `Shopping.dc.html` | — |
| Prepare › Offline | `Offline.dc.html` | — |
| Go (phone) | `NightGo.dc.html` | `DayGo.dc.html` |
| Go › Messages (phone) | `Messages.dc.html` | — |
| Go › Group (phone) | `Group.dc.html` | — |
| Participant › Route (phone) | `Route.dc.html` | `DayRoute.dc.html` |

Day theme rules: yellow only as a fill with dark text (never yellow text on
white); the route is a yellow line with a black edge; people use the darker
cyan `#007C91`; selected items get a 2px black border.

## Other directions (not chosen)

- A · Field survey: `Main.dc.html`, `SurveyGo.dc.html`
- B · Transit line: `TransitDays.dc.html`, `TransitGo.dc.html`

All data in the mockups (prices, times, distances, people) is sample data.
