import * as React from 'react';
import Map from 'ol/Map';

const mapContext = React.createContext<Map>(null);
export default mapContext;
