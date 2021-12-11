# Map2Onlie

https://map2.online - online service intended to plan the trips and travels by the drawing their
routes on the map.

## Features
* Shows Google, Open Street, Bing and Soviet military maps as a layer to draw the routes on.
* Add the points and lines styled by the color to the route on the map and with the dialog screens.
* Grouping the features to 2-levels containers
* Export/Import to KML
* Saves the catalog of the plans and UI state locally within the browser (thechincally: indexeddb
  for the planned trips and localStorage for the UI state)

## Current state
* Although the state is Alpha it is good for the personal use.
* It is expected the data can be lost on the new versions updates - the backups with KML
  export is strongly adwised.

## TODOs
* More reach text descriptions of the features and containers.
* Small screens layouts
* Touch screen enabled UI
* Remote/Shared/Cloud storage for the plans
* Partial KML export/import

## Test requests
* Need to test KML import/export to and from other sources. Currently, SAS2Planet and Google Earth
  said to be working for at least some case.
* Usability.

## Bug reporting
  https://github.com/s4ysolutions/map2online/issues/new
  
## Development

### Local development:
```
npm install
npm run dev
```
open `http://localhost:9000`.

### Production build

```
npm install
npm run build
```
 copy `dist` folder the http server document root.