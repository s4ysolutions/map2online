import MapTypeId = google.maps.MapTypeId;

export const sourceNameToMapId = (name: string): google.maps.MapTypeId => {
  switch (name) {
    case 'GoogleLandscape':
      return MapTypeId.TERRAIN;
    case 'GoogleSattelite':
      return MapTypeId.SATELLITE;
    case 'GoogleTrasport':
      return MapTypeId.HYBRID;
    default:
      return MapTypeId.ROADMAP;
  }
}
