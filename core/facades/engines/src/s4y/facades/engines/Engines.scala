package s4y.facades.engines

import org.scalajs.dom

import scala.concurrent.{Future, Promise}
import scala.scalajs.js
import scala.scalajs.js.Dynamic.{global as g, literal}

/** A map drawn by a third-party JS API that only follows a view it is given: it never handles input
  * (OpenLayers on top does).
  */
trait EngineMap:
  def show(mapType: String): Unit
  def moveTo(lat: Double, lon: Double, zoom: Double): Unit
  def element: dom.HTMLElement

/** Loads a script once and resolves when its API is ready. */
private object ScriptLoader:
  private val loaded = scala.collection.mutable.Map.empty[String, Future[Unit]]

  def load(url: String, ready: (() => Unit) => Unit): Future[Unit] =
    loaded.getOrElseUpdate(
      url, {
        val p = Promise[Unit]()
        val s = dom.document.createElement("script").asInstanceOf[dom.HTMLScriptElement]
        s.src = url
        s.async = true
        s.onload = _ => ready(() => p.trySuccess(()))
        s.addEventListener(
          "error",
          (_: dom.Event) => p.tryFailure(js.JavaScriptException(s"cannot load $url"))
        )
        dom.document.head.appendChild(s)
        p.future
      }
    )

/** Google Maps JavaScript API, raster map types. */
object GoogleMaps:
  def load(apiKey: String): Future[Unit] =
    ScriptLoader.load(
      s"https://maps.googleapis.com/maps/api/js?key=${js.URIUtils.encodeURIComponent(apiKey)}&v=weekly",
      ready => ready()
    )

  def create(
      container: dom.HTMLElement,
      lat: Double,
      lon: Double,
      zoom: Double,
      mapType: String
  ): EngineMap =
    val map = js.Dynamic.newInstance(g.google.maps.Map)(
      container,
      literal(
        center = literal(lat = lat, lng = lon),
        zoom = zoom,
        mapTypeId = mapType,
        disableDefaultUI = true,
        gestureHandling = "none",
        keyboardShortcuts = false,
        clickableIcons = false
      )
    )
    new EngineMap:
      def show(mapType: String): Unit = map.setMapTypeId(mapType)
      def moveTo(lat: Double, lon: Double, zoom: Double): Unit =
        map.moveCamera(literal(center = literal(lat = lat, lng = lon), zoom = zoom))
      def element: dom.HTMLElement = container

/** Yandex Maps API 2.1, which supports satellite and hybrid types. It draws in EPSG:3395, so
  * OpenLayers must use that projection while it is shown.
  */
object YandexMaps:
  def load(apiKey: String): Future[Unit] =
    ScriptLoader.load(
      s"https://api-maps.yandex.ru/2.1/?apikey=${js.URIUtils.encodeURIComponent(apiKey)}&lang=en_US",
      ready => g.ymaps.ready(() => ready())
    )

  def create(
      container: dom.HTMLElement,
      lat: Double,
      lon: Double,
      zoom: Double,
      mapType: String
  ): EngineMap =
    val map = js.Dynamic.newInstance(g.ymaps.Map)(
      container,
      literal(center = js.Array(lat, lon), zoom = zoom, `type` = mapType, controls = js.Array()),
      literal(suppressMapOpenBlock = true, yandexMapDisablePoiInteractivity = true)
    )
    map.behaviors.disable(
      js.Array("drag", "scrollZoom", "dblClickZoom", "multiTouch", "rightMouseButtonMagnifier")
    )
    new EngineMap:
      def show(mapType: String): Unit = map.setType(mapType)
      def moveTo(lat: Double, lon: Double, zoom: Double): Unit =
        map.setCenter(js.Array(lat, lon), math.round(zoom).toDouble, literal(duration = 0))
      def element: dom.HTMLElement = container
