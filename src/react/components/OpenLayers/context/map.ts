import React from 'react';
import OlMap from 'ol/Map';

// the context will be set in Map component
const olMapContext = React.createContext<OlMap>(null as unknown as OlMap); // hack, but lets avoid "!"
export default olMapContext;
