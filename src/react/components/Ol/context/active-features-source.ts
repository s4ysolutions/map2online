import React from 'react';
import VectorSource from 'ol/source/Vector';

// the context will be set in ActiveFeatures component
const activeFeaturesContext = React.createContext<VectorSource>(null as unknown as VectorSource);
export default activeFeaturesContext;
