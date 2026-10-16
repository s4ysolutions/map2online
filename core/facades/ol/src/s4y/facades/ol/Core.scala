package s4y.facades.ol

import org.scalajs.dom

import scala.scalajs.js
import scala.scalajs.js.annotation.JSImport

/** Hand-written facade for the parts of OpenLayers 10 Map2Online uses. Coordinates are
  * `js.Array[Double]` in the view projection unless a name says lon/lat.
  */
type Coordinate = js.Array[Double]
type Extent = js.Array[Double]
type Pixel = js.Array[Double]

@js.native
trait EventsKey extends js.Object

@js.native
trait BaseEvent extends js.Object:
  val `type`: String = js.native

@js.native
trait MapBrowserEvent extends BaseEvent:
  val coordinate: Coordinate = js.native
  val pixel: Pixel = js.native
  val originalEvent: dom.Event = js.native
  val dragging: Boolean = js.native
  def preventDefault(): Unit = js.native

@js.native
@JSImport("ol/Observable.js", JSImport.Namespace)
object Observable extends js.Object:
  def unByKey(key: EventsKey | js.Array[EventsKey]): Unit = js.native

@js.native
trait Observable extends js.Object:
  def on(tpe: String, listener: js.Function1[BaseEvent, Unit]): EventsKey = js.native
  def once(tpe: String, listener: js.Function1[BaseEvent, Unit]): EventsKey = js.native
  def get(key: String): js.Any = js.native
  def set(key: String, value: js.Any): Unit = js.native

@js.native
@JSImport("ol/Collection.js", JSImport.Default)
class Collection[T](items: js.Array[T] = js.native) extends Observable:
  def push(item: T): Int = js.native
  def clear(): Unit = js.native
  def getArray(): js.Array[T] = js.native
  def getLength(): Int = js.native
  def item(i: Int): T = js.native
  def remove(item: T): js.UndefOr[T] = js.native
  def insertAt(i: Int, item: T): Unit = js.native

// ------------------------------------------------------------------ map

trait MapOptions extends js.Object:
  var target: js.UndefOr[dom.HTMLElement] = js.undefined
  var layers: js.UndefOr[js.Array[BaseLayer]] = js.undefined
  var view: js.UndefOr[View] = js.undefined
  var controls: js.UndefOr[js.Array[Control] | Collection[Control]] = js.undefined

@js.native
@JSImport("ol/Map.js", JSImport.Default)
class OlMap(options: MapOptions) extends Observable:
  def setTarget(target: js.UndefOr[dom.HTMLElement]): Unit = js.native
  def getView(): View = js.native
  def setView(view: View): Unit = js.native
  def addLayer(layer: BaseLayer): Unit = js.native
  def removeLayer(layer: BaseLayer): js.UndefOr[BaseLayer] = js.native
  def getLayers(): Collection[BaseLayer] = js.native
  def addInteraction(i: Interaction): Unit = js.native
  def removeInteraction(i: Interaction): js.UndefOr[Interaction] = js.native
  def addOverlay(o: Overlay): Unit = js.native
  def removeOverlay(o: Overlay): js.UndefOr[Overlay] = js.native
  def addControl(c: Control): Unit = js.native
  def getEventPixel(e: dom.Event): Pixel = js.native
  def getCoordinateFromPixel(p: Pixel): Coordinate = js.native
  def getFeaturesAtPixel(
      p: Pixel,
      options: js.UndefOr[js.Object] = js.undefined
  ): js.Array[Feature] = js.native
  def hasFeatureAtPixel(p: Pixel, options: js.UndefOr[js.Object] = js.undefined): Boolean =
    js.native
  def getTargetElement(): dom.HTMLElement = js.native
  def getViewport(): dom.HTMLElement = js.native
  def updateSize(): Unit = js.native
  def render(): Unit = js.native
  def getSize(): js.UndefOr[js.Array[Double]] = js.native

trait ViewOptions extends js.Object:
  var center: js.UndefOr[Coordinate] = js.undefined
  var zoom: js.UndefOr[Double] = js.undefined
  var projection: js.UndefOr[String | Projection] = js.undefined
  var constrainResolution: js.UndefOr[Boolean] = js.undefined
  var maxZoom: js.UndefOr[Double] = js.undefined
  var minZoom: js.UndefOr[Double] = js.undefined
  var enableRotation: js.UndefOr[Boolean] = js.undefined
  var extent: js.UndefOr[Extent] = js.undefined

trait FitOptions extends js.Object:
  var padding: js.UndefOr[js.Array[Double]] = js.undefined
  var maxZoom: js.UndefOr[Double] = js.undefined
  var duration: js.UndefOr[Double] = js.undefined

trait AnimationOptions extends js.Object:
  var center: js.UndefOr[Coordinate] = js.undefined
  var zoom: js.UndefOr[Double] = js.undefined
  var duration: js.UndefOr[Double] = js.undefined

@js.native
@JSImport("ol/View.js", JSImport.Default)
class View(options: ViewOptions) extends Observable:
  def getCenter(): js.UndefOr[Coordinate] = js.native
  def setCenter(c: Coordinate): Unit = js.native
  def getZoom(): js.UndefOr[Double] = js.native
  def setZoom(z: Double): Unit = js.native
  def getProjection(): Projection = js.native
  def fit(extent: Extent, options: js.UndefOr[FitOptions] = js.undefined): Unit = js.native
  def animate(options: AnimationOptions): Unit = js.native
  def getResolution(): js.UndefOr[Double] = js.native
  def setConstrainResolution(enabled: Boolean): Unit = js.native

@js.native
trait Projection extends js.Object:
  def getCode(): String = js.native
  def setExtent(extent: Extent): Unit = js.native

@js.native
@JSImport("ol/proj.js", JSImport.Namespace)
object proj extends js.Object:
  def fromLonLat(lonLat: Coordinate, projection: js.UndefOr[String] = js.undefined): Coordinate =
    js.native
  def toLonLat(c: Coordinate, projection: js.UndefOr[String] = js.undefined): Coordinate = js.native
  def transform(c: Coordinate, source: String, destination: String): Coordinate = js.native
  def get(code: String): Projection | Null = js.native

@js.native
@JSImport("ol/proj/proj4.js", "register")
def registerProj4(proj4: js.Any): Unit = js.native

@js.native
@JSImport("proj4", JSImport.Default)
object Proj4 extends js.Object:
  def defs(code: String, definition: String): Unit = js.native

@js.native
@JSImport("ol/extent.js", JSImport.Namespace)
object extent extends js.Object:
  def createEmpty(): Extent = js.native
  def extend(e: Extent, other: Extent): Extent = js.native
  def isEmpty(e: Extent): Boolean = js.native

// ------------------------------------------------------------- controls

@js.native
trait Control extends Observable

@js.native
@JSImport("ol/control/defaults.js", "defaults")
def defaultControls(options: js.UndefOr[js.Object] = js.undefined): Collection[Control] = js.native

@js.native
@JSImport("ol/control/ScaleLine.js", JSImport.Default)
class ScaleLine(options: js.UndefOr[js.Object] = js.undefined) extends Control

// -------------------------------------------------------------- overlay

trait OverlayOptions extends js.Object:
  var element: js.UndefOr[dom.HTMLElement] = js.undefined
  var positioning: js.UndefOr[String] = js.undefined
  var stopEvent: js.UndefOr[Boolean] = js.undefined
  var offset: js.UndefOr[js.Array[Double]] = js.undefined

@js.native
@JSImport("ol/Overlay.js", JSImport.Default)
class Overlay(options: OverlayOptions) extends Observable:
  def setPosition(c: js.UndefOr[Coordinate]): Unit = js.native
