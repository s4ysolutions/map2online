package s4y.map2online.web

import com.raquo.laminar.api.L.*
import s4y.app.zio.UseCase.useCase
import s4y.map2online.basemap.app.SaveBaseMapCommand
import s4y.map2online.basemap.domain.operations.MapSources
import s4y.map2online.basemap.domain.vo.BaseMapSettings
import s4y.map2online.basemap.presentation.{EngineKeys, MapWidget, SourcePicker}
import s4y.presentation.laminar.ZioBridge
import zio.Runtime

import scala.concurrent.ExecutionContext

/** The application shell. */
object App:
  def apply(
      saved: Option[BaseMapSettings]
  )(using Runtime[Main.Services], ExecutionContext): HtmlElement =
    val keys = EngineKeys.fromWindow()
    val (source, view) = MapSources.resolve(saved, keys.enabled)
    val map = MapWidget(source, view, keys)

    div(
      cls := "app",
      headerTag(
        cls := "top-bar",
        span(cls := "brand", "Map2Online"),
        SourcePicker(map, keys),
        child.maybe <-- map.engineError.map(_.map(e => span(cls := "notice", e)))
      ),
      mainTag(cls := "workspace", map.element),
      // remember the map and view between visits
      map.source.combineWith(map.view).changes --> { (s, v) =>
        ZioBridge.run(useCase(SaveBaseMapCommand(BaseMapSettings(s.id, v))).ignoreLogged)
      }
    )
