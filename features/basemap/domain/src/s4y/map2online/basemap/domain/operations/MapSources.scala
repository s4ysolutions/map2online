package s4y.map2online.basemap.domain.operations

import s4y.map2online.basemap.domain.vo.*
import s4y.map2online.catalog.domain.vo.Coordinate

/** The base maps on offer, grouped as in the source menu. */
object MapSources:
  private val osmAttribution =
    """© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors"""

  val groups: Vector[MapSourceGroup] = Vector(
    MapSourceGroup(
      "OpenStreetMap",
      Vector(
        TileSource(
          MapSourceId("osm"),
          "OpenStreetMap",
          "https://tiles-proxy-a.s4y.solutions/openstreet/{z}/{x}/{y}.png",
          osmAttribution,
          maxZoom = 19
        ),
        TileSource(
          MapSourceId("opentopomap"),
          "OpenTopoMap",
          "https://tile.opentopomap.org/{z}/{x}/{y}.png",
          s"""$osmAttribution, <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)""",
          maxZoom = 17
        )
      )
    ),
    MapSourceGroup(
      "Google",
      Vector(
        BackgroundSource(MapSourceId("google-map"), "Google Map", Engine.Google, "roadmap"),
        BackgroundSource(MapSourceId("google-terrain"), "Google Terrain", Engine.Google, "terrain"),
        BackgroundSource(
          MapSourceId("google-satellite"),
          "Google Satellite",
          Engine.Google,
          "satellite"
        ),
        BackgroundSource(MapSourceId("google-hybrid"), "Google Hybrid", Engine.Google, "hybrid")
      )
    ),
    MapSourceGroup(
      "Yandex",
      Vector(
        BackgroundSource(MapSourceId("yandex-map"), "Yandex Map", Engine.Yandex, "yandex#map"),
        BackgroundSource(
          MapSourceId("yandex-satellite"),
          "Yandex Satellite",
          Engine.Yandex,
          "yandex#satellite"
        ),
        BackgroundSource(
          MapSourceId("yandex-hybrid"),
          "Yandex Hybrid",
          Engine.Yandex,
          "yandex#hybrid"
        )
      )
    ),
    MapSourceGroup(
      "Genshtab",
      Vector(
        TileSource(
          MapSourceId("genshtab"),
          "Soviet General Staff",
          "https://tiles-proxy-a.s4y.solutions/gsh/?al=1&i=1&x={x}&y={y}&z={z}",
          """Map2Online © <a href="https://s4y.solutions/">S4Y</a>""",
          maxZoom = 15
        )
      )
    )
  )

  val all: Vector[MapSource] = groups.flatMap(_.sources)

  val default: MapSource = all.head

  val defaultView: MapView = MapView(Coordinate.from(48.0, 50.0).toOption.get, Zoom(4.0))

  def byId(id: MapSourceId): Option[MapSource] = all.find(_.id == id)

  /** Sources whose engine is usable; tile sources always are. */
  def available(enabledEngines: Set[Engine]): Vector[MapSourceGroup] =
    groups
      .map(g =>
        g.copy(sources = g.sources.filter {
          case b: BackgroundSource => enabledEngines(b.engine)
          case _: TileSource       => true
        })
      )
      .filter(_.sources.nonEmpty)

  /** Engines only draw whole zoom levels, so the map snaps to them. */
  def integerZoom(source: MapSource): Boolean = source.isInstanceOf[BackgroundSource]

  /** Saved settings, falling back to the default for a source that no longer exists (or whose
    * engine is not configured).
    */
  def resolve(
      settings: Option[BaseMapSettings],
      enabledEngines: Set[Engine]
  ): (MapSource, MapView) =
    val usable = available(enabledEngines).flatMap(_.sources)
    val source = settings.flatMap(s => usable.find(_.id == s.source)).getOrElse(default)
    (source, settings.map(_.view).getOrElse(defaultView))
