package s4y.map2online.web

import com.raquo.laminar.api.L.*
import s4y.app.zio.UseCase.useCase
import s4y.map2online.basemap.app.SaveBaseMapCommand
import s4y.map2online.basemap.domain.operations.MapSources
import s4y.map2online.basemap.domain.vo.BaseMapSettings
import s4y.map2online.basemap.presentation.{EngineKeys, MapWidget, SourcePicker}
import s4y.map2online.catalog.presentation.{CatalogServices, CatalogState, MapEditing, Naming}
import s4y.presentation.laminar.{ZioBridge, narrow}
import zio.Runtime

import scala.concurrent.ExecutionContext

/** The application shell. */
object App:
  private object DefaultNaming extends Naming:
    def newCategory: String = "New trip"
    def newRoute: String = "New route"

  def apply(
      saved: Option[BaseMapSettings]
  )(using Runtime[Main.Services], ExecutionContext): HtmlElement =
    given Runtime[CatalogServices] = summon[Runtime[Main.Services]].narrow[CatalogServices]
    val keys = EngineKeys.fromWindow()
    val (source, view) = MapSources.resolve(saved, keys.enabled)
    val map = MapWidget(source, view, keys)
    val catalog = CatalogState(DefaultNaming)
    val editing = MapEditing(map, catalog)

    div(
      cls := "app",
      headerTag(
        cls := "top-bar",
        span(cls := "brand", "Map2Online"),
        SourcePicker(map, keys),
        child.maybe <-- map.engineError.map(_.map(e => span(cls := "notice", e)))
      ),
      mainTag(
        cls := "workspace",
        map.element,
        editing.toolsPanel,
        editing.contextMenu,
        child.maybe <-- catalog.error.map(
          _.map(e =>
            div(
              cls := "toast",
              role := "alert",
              span(e),
              button("Dismiss", onClick --> (_ => catalog.dismissError()))
            )
          )
        ),
        editing.binder,
        onMountCallback(_ => catalog.load())
      ),
      // remember the map and view between visits
      map.source.combineWith(map.view).changes --> { (s, v) =>
        ZioBridge.run(useCase(SaveBaseMapCommand(BaseMapSettings(s.id, v))).ignoreLogged)
      }
    )
