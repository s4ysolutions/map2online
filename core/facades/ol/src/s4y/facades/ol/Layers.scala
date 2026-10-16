package s4y.facades.ol

import scala.scalajs.js
import scala.scalajs.js.annotation.JSImport

@js.native
trait BaseLayer extends Observable:
  def setVisible(v: Boolean): Unit = js.native
  def getVisible(): Boolean = js.native
  def setZIndex(z: Int): Unit = js.native
  def setOpacity(o: Double): Unit = js.native

trait TileLayerOptions extends js.Object:
  var source: js.UndefOr[Source] = js.undefined
  var visible: js.UndefOr[Boolean] = js.undefined
  var zIndex: js.UndefOr[Int] = js.undefined
  var preload: js.UndefOr[Double] = js.undefined

@js.native
@JSImport("ol/layer/Tile.js", JSImport.Default)
class TileLayer(options: TileLayerOptions) extends BaseLayer:
  def setSource(s: Source): Unit = js.native
  def getSource(): Source | Null = js.native

trait VectorLayerOptions extends js.Object:
  var source: js.UndefOr[VectorSource] = js.undefined
  var style: js.UndefOr[js.Function2[Feature, Double, Style | js.Array[Style]] | Style] =
    js.undefined
  var zIndex: js.UndefOr[Int] = js.undefined
  var updateWhileInteracting: js.UndefOr[Boolean] = js.undefined

@js.native
@JSImport("ol/layer/Vector.js", JSImport.Default)
class VectorLayer(options: VectorLayerOptions) extends BaseLayer:
  def getSource(): VectorSource = js.native
  def changed(): Unit = js.native

@js.native
trait Source extends Observable

trait XYZOptions extends js.Object:
  var url: js.UndefOr[String] = js.undefined
  var attributions: js.UndefOr[String | js.Array[String]] = js.undefined
  var maxZoom: js.UndefOr[Int] = js.undefined
  var projection: js.UndefOr[String] = js.undefined
  var crossOrigin: js.UndefOr[String | Null] = js.undefined

@js.native
@JSImport("ol/source/XYZ.js", JSImport.Default)
class XYZ(options: XYZOptions) extends Source

trait VectorSourceOptions extends js.Object:
  var features: js.UndefOr[js.Array[Feature]] = js.undefined
  var wrapX: js.UndefOr[Boolean] = js.undefined

@js.native
@JSImport("ol/source/Vector.js", JSImport.Default)
class VectorSource(options: VectorSourceOptions = js.native) extends Source:
  def addFeature(f: Feature): Unit = js.native
  def addFeatures(fs: js.Array[Feature]): Unit = js.native
  def removeFeature(f: Feature): Unit = js.native
  def clear(fast: js.UndefOr[Boolean] = js.undefined): Unit = js.native
  def getFeatures(): js.Array[Feature] = js.native
  def getFeatureById(id: String | Double): Feature | Null = js.native
  def getExtent(): Extent = js.native

// ------------------------------------------------------------- features

@js.native
@JSImport("ol/Feature.js", JSImport.Default)
class Feature(geometryOrProperties: js.UndefOr[Geometry | js.Object] = js.undefined)
    extends Observable:
  def getId(): js.UndefOr[String | Double] = js.native
  def setId(id: String): Unit = js.native
  def getGeometry(): js.UndefOr[Geometry] = js.native
  def setGeometry(g: Geometry): Unit = js.native
  def setStyle(s: js.UndefOr[Style | js.Array[Style]]): Unit = js.native
  def changed(): Unit = js.native

@js.native
trait Geometry extends Observable:
  def getType(): String = js.native
  def getExtent(): Extent = js.native

@js.native
@JSImport("ol/geom/Point.js", JSImport.Default)
class Point(coordinates: Coordinate) extends Geometry:
  def getCoordinates(): Coordinate = js.native
  def setCoordinates(c: Coordinate): Unit = js.native

@js.native
@JSImport("ol/geom/LineString.js", JSImport.Default)
class LineString(coordinates: js.Array[Coordinate]) extends Geometry:
  def getCoordinates(): js.Array[Coordinate] = js.native
  def setCoordinates(c: js.Array[Coordinate]): Unit = js.native
  def getLastCoordinate(): Coordinate = js.native
