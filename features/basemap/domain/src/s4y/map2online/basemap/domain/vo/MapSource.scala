package s4y.map2online.basemap.domain.vo

import s4y.map2online.catalog.domain.vo.Coordinate
import zio.prelude.{Assertion, Newtype, Subtype}

object MapSourceId extends Newtype[String]
type MapSourceId = MapSourceId.Type

/** Engines that draw a background with their own JS API under the transparent OpenLayers map (their
  * terms forbid using the tiles directly).
  */
enum Engine:
  case Google, Yandex

enum MapProjection(val code: String):
  case WebMercator extends MapProjection("EPSG:3857")

  /** Ellipsoidal Mercator; Yandex uses it. */
  case WorldMercator extends MapProjection("EPSG:3395")

/** A base map the user can pick. */
sealed trait MapSource:
  def id: MapSourceId
  def title: String
  def projection: MapProjection

/** Plain XYZ tiles drawn by OpenLayers; `{x}`, `{y}`, `{z}` in the URL. */
final case class TileSource(
    id: MapSourceId,
    title: String,
    urlTemplate: String,
    attribution: String,
    maxZoom: Int,
    projection: MapProjection = MapProjection.WebMercator
) extends MapSource

/** A background drawn by an engine; `mapType` is the engine's own name. */
final case class BackgroundSource(id: MapSourceId, title: String, engine: Engine, mapType: String)
    extends MapSource:
  def projection: MapProjection = engine match
    case Engine.Google => MapProjection.WebMercator
    case Engine.Yandex => MapProjection.WorldMercator

final case class MapSourceGroup(title: String, sources: Vector[MapSource])

object Zoom extends Subtype[Double]:
  override inline def assertion = Assertion.between(0.0, 24.0)
type Zoom = Zoom.Type

/** What the user sees: where and how close. Engine-neutral (lat/lon), so it survives switching
  * between projections.
  */
final case class MapView(center: Coordinate, zoom: Zoom)

final case class BaseMapSettings(source: MapSourceId, view: MapView)
