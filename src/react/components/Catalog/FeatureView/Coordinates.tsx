import React, {useState} from 'react';
import {Geometry, LineString, isPoint} from '../../../../catalog';
import {formatCoordinate, formatCoordinates} from '../../../../lib/format';
import T from '../../../../l10n';
import log from '../../../../log';
import {AnimatePresence, motion} from 'framer-motion';

const hintInitial = {opacity: 1};
const hintExit = {opacity: 0};
const DELAY_HIDE_HINT = 1000;

const Coordinates: React.FunctionComponent<{geometry: Geometry}> =
  ({geometry}): React.ReactElement => {
    const coordinates = isPoint(geometry)
      ? formatCoordinate(geometry.coordinate)
      : formatCoordinates((geometry as LineString).coordinates);

    const [hintVisible, setHintVisible] = useState<boolean>(false);

    const handleCopyToClipboard = () => {
      if (navigator.clipboard) {
        const type = 'text/plain';
        const blob = new Blob([coordinates], { type });
        const data = [new ClipboardItem({ [type]: blob })];

        navigator.clipboard.write(data)
          .then(() => {
            log.debug('copied');
            setHintVisible(true);
            setTimeout(() => setHintVisible(false), DELAY_HIDE_HINT);
          })
          .catch((err) => {
            log.error(err);
          });
      }
    };

    return <div className="coordinates-block">
      <div className={`coordinates ${hintVisible ? 'hidden' : ''}`} onClick={handleCopyToClipboard}>
        {coordinates}
      </div>

      <AnimatePresence>
        {hintVisible
          ? <motion.div className="copied" exit={hintExit} initial={hintInitial}>
            {T`Copied to clipboard`}
          </motion.div>
          : null }
      </AnimatePresence>
    </div>;
  };

export default Coordinates;
