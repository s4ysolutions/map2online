import * as React from 'react';
import Map from 'ol/Map';

const olMapContext = React.createContext<Map>(null);
export default olMapContext;
