package s4y.facades.ol

import scala.scalajs.js
import scala.scalajs.js.annotation.JSImport

@js.native
trait Interaction extends Observable:
  def setActive(active: Boolean): Unit = js.native
  def getActive(): Boolean = js.native

@js.native
trait DrawEvent extends BaseEvent:
  val feature: Feature = js.native

trait DrawOptions extends js.Object:
  var source: js.UndefOr[VectorSource] = js.undefined
  var `type`: js.UndefOr[String] = js.undefined
  var style: js.UndefOr[
    Style | js.Array[Style] | js.Function2[Feature, Double, Style | js.Array[Style]]
  ] =
    js.undefined
  var stopClick: js.UndefOr[Boolean] = js.undefined

@js.native
@JSImport("ol/interaction/Draw.js", JSImport.Default)
class Draw(options: DrawOptions) extends Interaction:
  def finishDrawing(): Unit = js.native
  def abortDrawing(): Unit = js.native
  def removeLastPoint(): Unit = js.native

@js.native
trait ModifyEvent extends BaseEvent:
  val features: Collection[Feature] = js.native

trait ModifyOptions extends js.Object:
  var source: js.UndefOr[VectorSource] = js.undefined
  var features: js.UndefOr[Collection[Feature]] = js.undefined
  var pixelTolerance: js.UndefOr[Double] = js.undefined

@js.native
@JSImport("ol/interaction/Modify.js", JSImport.Default)
class Modify(options: ModifyOptions) extends Interaction

trait SnapOptions extends js.Object:
  var source: js.UndefOr[VectorSource] = js.undefined
  var pixelTolerance: js.UndefOr[Double] = js.undefined

@js.native
@JSImport("ol/interaction/Snap.js", JSImport.Default)
class Snap(options: SnapOptions) extends Interaction
