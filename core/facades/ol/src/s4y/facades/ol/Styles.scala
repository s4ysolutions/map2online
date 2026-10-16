package s4y.facades.ol

import scala.scalajs.js
import scala.scalajs.js.annotation.JSImport

trait StrokeOptions extends js.Object:
  var color: js.UndefOr[String] = js.undefined
  var width: js.UndefOr[Double] = js.undefined
  var lineDash: js.UndefOr[js.Array[Double]] = js.undefined

@js.native
@JSImport("ol/style/Stroke.js", JSImport.Default)
class Stroke(options: StrokeOptions) extends js.Object

trait FillOptions extends js.Object:
  var color: js.UndefOr[String] = js.undefined

@js.native
@JSImport("ol/style/Fill.js", JSImport.Default)
class Fill(options: FillOptions) extends js.Object

@js.native
trait ImageStyle extends js.Object

trait IconOptions extends js.Object:
  var src: js.UndefOr[String] = js.undefined
  var anchor: js.UndefOr[js.Array[Double]] = js.undefined
  var scale: js.UndefOr[Double] = js.undefined
  var color: js.UndefOr[String] = js.undefined

@js.native
@JSImport("ol/style/Icon.js", JSImport.Default)
class Icon(options: IconOptions) extends ImageStyle

trait CircleOptions extends js.Object:
  var radius: js.UndefOr[Double] = js.undefined
  var fill: js.UndefOr[Fill] = js.undefined
  var stroke: js.UndefOr[Stroke] = js.undefined

@js.native
@JSImport("ol/style/Circle.js", JSImport.Default)
class CircleStyle(options: CircleOptions) extends ImageStyle

trait TextOptions extends js.Object:
  var text: js.UndefOr[String] = js.undefined
  var font: js.UndefOr[String] = js.undefined
  var offsetY: js.UndefOr[Double] = js.undefined
  var fill: js.UndefOr[Fill] = js.undefined
  var stroke: js.UndefOr[Stroke] = js.undefined
  var placement: js.UndefOr[String] = js.undefined
  var overflow: js.UndefOr[Boolean] = js.undefined

@js.native
@JSImport("ol/style/Text.js", JSImport.Default)
class Text(options: TextOptions) extends js.Object

trait StyleOptions extends js.Object:
  var stroke: js.UndefOr[Stroke] = js.undefined
  var fill: js.UndefOr[Fill] = js.undefined
  var image: js.UndefOr[ImageStyle] = js.undefined
  var text: js.UndefOr[Text] = js.undefined
  var zIndex: js.UndefOr[Int] = js.undefined

@js.native
@JSImport("ol/style/Style.js", JSImport.Default)
class Style(options: StyleOptions) extends js.Object
