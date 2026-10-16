package s4y.presentation.map

import com.raquo.laminar.api.L.*
import s4y.facades.ol

/** What features need from the map without knowing how it is drawn: the OpenLayers map to add
  * layers and interactions to, and conversions between WGS 84 `(lon, lat)` and the current view
  * projection. Geometries must be rebuilt when [[projection]] changes.
  */
trait MapSurface:
  def olMap: ol.OlMap
  def projection: StrictSignal[String]
  def toMap(lon: Double, lat: Double): ol.Coordinate

  /** `(lon, lat)`, longitude wrapped into [-180, 180]. */
  def fromMap(c: ol.Coordinate): (Double, Double)
  def centerOn(lon: Double, lat: Double, zoom: Option[Double] = None): Unit

  /** Fits `(minLon, minLat, maxLon, maxLat)`. */
  def fit(minLon: Double, minLat: Double, maxLon: Double, maxLat: Double): Unit

  /** The visible area as `(minLon, minLat, maxLon, maxLat)`. */
  def visibleBounds(): Option[(Double, Double, Double, Double)]
