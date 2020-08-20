import {Control} from 'ol/control';
import {visibleOlFeatures} from './ActiveFeatures';
import log from '../../../log';
import OlFeature from 'ol/Feature';

let lastFeatures: OlFeature[] = null;
let lastExtent: number[] = null;

const extentOfVisibleFeatures = (): number[] => {
  const features = visibleOlFeatures()
  if (features !== lastFeatures || !lastExtent) {
    if (features.length < 1) {
      lastExtent = [-100000, -100000, 100000, 100000];
    } else {
      let tlx = 0
      let tly = 0
      let brx = 0
      let bry = 0
      let count = 0;
      for (const feature of features) {
        const flatCoordinates = feature.get('geometry').flatCoordinates;
        let i = 0;
        while (i < flatCoordinates.length) {
          const x = flatCoordinates[i++]
          const y = flatCoordinates[i++]
          i++
          if (count === 0) {
            tlx = x;
            brx = x;
            tly = y;
            bry = y;
          } else {
            if (x < tlx) tlx = x;
            if (x > brx) brx = x;
            if (y < bry) bry = y;
            if (y > tly) tly = y;
          }
          count++;
        }
        if (i !== flatCoordinates.length) {
          log.error("corrdinates are not mulitple of 3", flatCoordinates)
        }
      }
      if (count === 1) {
        lastExtent = [tlx - 100000, bry - 100000, brx + 100000, tly + 100000];
      } else {
        const width = brx - tlx;
        const height = tly - bry;
        const dx = width / 8;
        const dy = height / 8;
        lastExtent = [
          tlx - dx,
          bry - dy,
          brx + dx,
          tly + dy,
        ];
      }
    }
  }
  return lastExtent;
};

//const zoomToExtentIcon = document.createElement('span');
const zoomToExtentInnerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" >
  <path d="M0 0h24v24H0z" fill="none" />
  <path fill="white" d="M10 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12-8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-4 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm4-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
</svg >`

const ZoomToFeaturesControl = /*@__PURE__*/(function (Control) {

  function ZoomToFeaturesControl() {

    var button = document.createElement('button');
    button.innerHTML = zoomToExtentInnerHTML;

    var element = document.createElement('div');
    element.className = 'ol-zoom-extent ol-unselectable ol-control';
    element.appendChild(button);

    Control.call(this, {
      element: element,
    });

    button.addEventListener('click', this.handleClick.bind(this), false);
  }

  if (Control) ZoomToFeaturesControl.__proto__ = Control;
  ZoomToFeaturesControl.prototype = Object.create(Control && Control.prototype);
  ZoomToFeaturesControl.prototype.constructor = ZoomToFeaturesControl;

  ZoomToFeaturesControl.prototype.handleClick = function handleClick() {
    const ext = extentOfVisibleFeatures();
    this.getMap().getView().fit(ext, this.getMap().getSize());
  };

  return ZoomToFeaturesControl;
}(Control));

export default ZoomToFeaturesControl;