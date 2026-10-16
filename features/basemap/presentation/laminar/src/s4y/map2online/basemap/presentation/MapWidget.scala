package s4y.map2online.basemap.presentation

import com.raquo.laminar.api.L.*
import org.scalajs.dom
import s4y.facades.engines.{EngineMap, GoogleMaps, YandexMaps}
import s4y.facades.ol
import s4y.facades.ol.{OlMap, TileLayer, TileLayerOptions, View, ViewOptions, XYZ, XYZOptions}
import s4y.map2online.basemap.domain.operations.MapSources
import s4y.map2online.basemap.domain.vo.*
import s4y.map2online.catalog.domain.vo.Coordinate
import s4y.presentation.map.MapSurface

import scala.concurrent.{ExecutionContext, Future}
import scala.scalajs.js
import scala.util.{Failure, Success}

/** API keys for the background engines, read from `window.MAP2_CONFIG` (filled from Vite env at
  * build time, see index.html).
  */
final case class EngineKeys(google: Option[String], yandex: Option[String]):
  def enabled: Set[Engine] =
    google.map(_ => Engine.Google).toSet ++ yandex.map(_ => Engine.Yandex).toSet

  def key(engine: Engine): Option[String] = engine match
    case Engine.Google => google
    case Engine.Yandex => yandex

object EngineKeys:
  def fromWindow(): EngineKeys =
    val config = js.Dynamic.global.selectDynamic("MAP2_CONFIG")
    def read(name: String): Option[String] =
      if js.isUndefined(config) || config == null then None
      else
        config
          .selectDynamic(name)
          .asInstanceOf[js.UndefOr[String]]
          .toOption
          .map(_.trim)
          .filter(v => v.nonEmpty && !v.startsWith("%")) // Vite leaves %VAR% when unset
    EngineKeys(read("googleMapsKey"), read("yandexMapsKey"))

object Projections:
  private var registered = false

  /** EPSG:3395 for OpenLayers (proj4 knows it, OL needs the extent). */
  def register(): Unit =
    if !registered then
      ol.Proj4.defs(
        MapProjection.WorldMercator.code,
        "+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"
      )
      ol.registerProj4(ol.Proj4)
      val half = 20037508.342789244
      ol.proj.get(MapProjection.WorldMercator.code) match
        case null             => ()
        case p: ol.Projection => p.setExtent(js.Array(-half, -half, half, half))
      registered = true

/** The map: OpenLayers on top (input, drawing, tile sources), an engine map underneath when a
  * background source is selected, following the OpenLayers view. Other features add their layers
  * through [[addLayer]] and convert coordinates with [[toMap]] / [[fromMap]], rebuilding geometries
  * when [[projection]] changes.
  */
final class MapWidget(initialSource: MapSource, initialView: MapView, keys: EngineKeys)(using
    ExecutionContext
) extends MapSurface:
  Projections.register()

  private val sourceVar = Var(initialSource)
  private val viewVar = Var(initialView)
  private val projectionVar = Var(initialSource.projection)
  private val projectionCodeVar = Var(initialSource.projection.code)
  private val engineErrorVar = Var(Option.empty[String])

  val source: StrictSignal[MapSource] = sourceVar.signal
  val view: StrictSignal[MapView] = viewVar.signal
  val mapProjection: StrictSignal[MapProjection] = projectionVar.signal
  val projection: StrictSignal[String] = projectionCodeVar.signal
  val engineError: StrictSignal[Option[String]] = engineErrorVar.signal

  private val baseLayer = TileLayer(new TileLayerOptions:
    zIndex = 0; preload = 1)

  private val firstView = makeView(initialSource, initialView)

  val olMap: OlMap = OlMap(new ol.MapOptions:
    layers = js.Array(baseLayer)
    this.view = firstView
    controls = ol.defaultControls())
  olMap.addControl(ol.ScaleLine())

  private val engineContainers: Map[Engine, dom.HTMLElement] =
    Engine.values
      .map(e => e -> div(cls := s"map-engine map-engine-${e.toString.toLowerCase}").ref)
      .toMap
  private var engines = Map.empty[Engine, Future[EngineMap]]
  private var activeEngine: Option[Engine] = None

  private val olElement = div(cls := "map-ol").ref

  val element: HtmlElement = div(
    cls := "map-widget",
    engineContainers.values.toSeq.map(foreignHtmlElement(_)),
    foreignHtmlElement(olElement),
    onMountCallback { _ =>
      olMap.setTarget(olElement)
      select(initialSource)
    },
    onUnmountCallback(_ => olMap.setTarget(js.undefined))
  )

  def addLayer(layer: ol.BaseLayer): Unit = olMap.addLayer(layer)
  def removeLayer(layer: ol.BaseLayer): Unit = olMap.removeLayer(layer)

  def toMap(lon: Double, lat: Double): ol.Coordinate =
    ol.proj.fromLonLat(js.Array(lon, lat), projectionVar.now().code)

  def fromMap(c: ol.Coordinate): (Double, Double) =
    val lonLat = ol.proj.toLonLat(c, projectionVar.now().code)
    (normalizeLon(lonLat(0)), lonLat(1))

  private def coordinateOf(c: ol.Coordinate): Option[Coordinate] =
    val (lon, lat) = fromMap(c)
    Coordinate.from(lat, lon).toOption

  /** Longitudes OpenLayers produces past the antimeridian, wrapped back. */
  private def normalizeLon(lon: Double): Double = ((lon + 180) % 360 + 360) % 360 - 180

  def select(source: MapSource): Unit =
    val current = viewVar.now()
    if source.projection != projectionVar
        .now() || olMap.getView().getProjection().getCode() != source.projection.code
    then
      // the new view first: projection listeners rebuild geometries against it
      olMap.setView(makeView(source, current))
      projectionVar.set(source.projection)
      projectionCodeVar.set(source.projection.code)
    olMap.getView().setConstrainResolution(MapSources.integerZoom(source))
    sourceVar.set(source)
    source match
      case t: TileSource =>
        activeEngine = None
        showEngine(None)
        baseLayer.setSource(XYZ(new XYZOptions:
          url = t.urlTemplate
          attributions = t.attribution
          maxZoom = t.maxZoom
          this.projection = t.projection.code))
        baseLayer.setVisible(true)
        engineErrorVar.set(None)
      case b: BackgroundSource =>
        baseLayer.setVisible(false)
        activeEngine = Some(b.engine)
        showEngine(Some(b.engine))
        engine(b).onComplete {
          case Success(map) =>
            engineErrorVar.set(None)
            if activeEngine.contains(b.engine) then
              map.show(b.mapType)
              follow()
          case Failure(e) =>
            engineErrorVar.set(Some(s"${b.engine} maps unavailable: ${e.getMessage}"))
        }
  end select

  private def showEngine(engine: Option[Engine]): Unit =
    engineContainers.foreach((e, el) =>
      el.style.display = if engine.contains(e) then "block" else "none"
    )

  private def engine(b: BackgroundSource): Future[EngineMap] =
    engines.getOrElse(
      b.engine, {
        val v = viewVar.now()
        val lat = v.center.lat: Double
        val lon = v.center.lon: Double
        val container = engineContainers(b.engine)
        val created = keys.key(b.engine) match
          case None      => Future.failed(IllegalStateException("no API key configured"))
          case Some(key) =>
            b.engine match
              case Engine.Google =>
                GoogleMaps
                  .load(key)
                  .map(_ => GoogleMaps.create(container, lat, lon, v.zoom, b.mapType))
              case Engine.Yandex =>
                YandexMaps
                  .load(key)
                  .map(_ => YandexMaps.create(container, lat, lon, v.zoom, b.mapType))
        engines = engines.updated(b.engine, created)
        created.failed.foreach(_ => engines = engines - b.engine) // allow a retry
        created
      }
    )

  private def makeView(source: MapSource, v: MapView): View =
    val created = View(new ViewOptions:
      this.projection = source.projection.code
      center = ol.proj.fromLonLat(js.Array(v.center.lon, v.center.lat), source.projection.code)
      zoom = v.zoom
      maxZoom = 21
      constrainResolution = MapSources.integerZoom(source)
      enableRotation = false)
    created.on("change:center", _ => follow())
    created.on("change:resolution", _ => follow())
    created

  /** Current OpenLayers view as engine-neutral lat/lon/zoom. */
  private def currentView(): Option[MapView] =
    val v = olMap.getView()
    for
      c <- v.getCenter().toOption
      z <- v.getZoom().toOption
      center <- coordinateOf(c)
      zoom <- Zoom.make(z).toOption
    yield MapView(center, zoom)

  private def follow(): Unit =
    for
      e <- activeEngine
      f <- engines.get(e)
      map <- f.value.flatMap(_.toOption)
      v <- currentView()
    do map.moveTo(v.center.lat, v.center.lon, v.zoom)

  olMap.on("moveend", _ => currentView().foreach(viewVar.set))

  def fit(minLon: Double, minLat: Double, maxLon: Double, maxLat: Double): Unit =
    val maxZoomLevel = 16.0
    val p1 = toMap(minLon, minLat)
    val p2 = toMap(maxLon, maxLat)
    olMap
      .getView()
      .fit(
        js.Array(
          math.min(p1(0), p2(0)),
          math.min(p1(1), p2(1)),
          math.max(p1(0), p2(0)),
          math.max(p1(1), p2(1))
        ),
        new ol.FitOptions:
          padding = js.Array(40.0, 40.0, 40.0, 40.0); this.maxZoom = maxZoomLevel; duration = 300
      )

  def centerOn(lon: Double, lat: Double, zoomLevel: Option[Double] = None): Unit =
    olMap
      .getView()
      .animate(new ol.AnimationOptions:
        center = toMap(lon, lat)
        this.zoom = zoomLevel.fold[js.UndefOr[Double]](js.undefined)(z => z)
        duration = 300)
  def visibleBounds(): Option[(Double, Double, Double, Double)] =
    olMap.getSize().toOption.map { size =>
      val (west, south) = fromMap(olMap.getCoordinateFromPixel(js.Array(0.0, size(1))))
      val (east, north) = fromMap(olMap.getCoordinateFromPixel(js.Array(size(0), 0.0)))
      (west, math.max(-90, south), east, math.min(90, north))
    }
end MapWidget

/** Base map picker. */
object SourcePicker:
  def apply(widget: MapWidget, keys: EngineKeys): HtmlElement =
    val groups = MapSources.available(keys.enabled)
    select(
      cls := "source-picker",
      aria.label := "Base map",
      groups.map(g =>
        optGroup(
          htmlAttr("label", com.raquo.laminar.codecs.StringAsIsCodec) := g.title,
          g.sources.map(s => option(value := MapSourceId.unwrap(s.id), s.title))
        )
      ),
      controlled(
        value <-- widget.source.map(s => MapSourceId.unwrap(s.id)),
        onChange.mapToValue --> (id => MapSources.byId(MapSourceId(id)).foreach(widget.select))
      )
    )
