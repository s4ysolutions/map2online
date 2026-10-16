package s4y.map2online.web

import com.raquo.laminar.api.L.*
import s4y.app.zio.UseCase.useCase
import s4y.map2online.basemap.app.SaveBaseMapCommand
import s4y.map2online.basemap.domain.operations.MapSources
import s4y.map2online.basemap.domain.vo.BaseMapSettings
import s4y.map2online.basemap.presentation.{EngineKeys, MapWidget, SourcePicker}
import s4y.app.UseCase
import s4y.map2online.catalog.domain.vo.{Feature, Geometry, Title}
import s4y.map2online.catalog.presentation.ui.settings.WordingSettings
import s4y.map2online.search.app.SearchPlacesCommand
import s4y.map2online.search.presentation.SearchBox
import s4y.map2online.catalog.presentation.ui.catalogpanel.CatalogPanel
import s4y.map2online.catalog.presentation.ui.transfer.{ExportMenu, ImportDialog}
import s4y.map2online.catalog.presentation.{
  CatalogServices,
  CatalogState,
  MapEditing,
  Naming,
  Wording
}
import s4y.presentation.laminar.{ZioBridge, narrow}
import zio.Runtime

import scala.concurrent.ExecutionContext

/** The application shell: top bar, catalog drawer, map with tools. */
object App:
  def apply(
      saved: Option[BaseMapSettings]
  )(using Runtime[Main.Services], ExecutionContext): HtmlElement =
    given Runtime[CatalogServices] = summon[Runtime[Main.Services]].narrow[CatalogServices]
    val keys = EngineKeys.fromWindow()
    val (source, view) = MapSources.resolve(saved, keys.enabled)
    val map = MapWidget(source, view, keys)

    val wording = Var(Wording.default)
    val naming = new Naming:
      def newCategory: String = wording.now().newCategory
      def newRoute: String = wording.now().newRoute
    val catalog = CatalogState(naming)
    val editing = MapEditing(map, catalog)

    // phones start with the map; the catalog drawer covers it when open
    def narrow: Boolean = org.scalajs.dom.window.innerWidth <= 700
    val catalogOpen = Var(!narrow)
    val moreOpen = Var(false)
    val importing = Var(false)
    val settings = Var(false)
    WordingSettings.load(wording)

    val search =
      given Runtime[UseCase[SearchPlacesCommand]] =
        summon[Runtime[Main.Services]].narrow[UseCase[SearchPlacesCommand]]
      SearchBox(
        map,
        place =>
          catalog.addFeature(
            Feature.create(Title(place.name), Geometry.Point(place.center), editing.paint.now())
          )(id => catalog.selectedFeature.set(Some(id)))
      )

    def show(f: Feature): Unit =
      if narrow then catalogOpen.set(false) // on a phone the drawer covers the map
      f.geometry match
        case Geometry.Point(c)      => map.centerOn(c.lon, c.lat)
        case l: Geometry.LineString =>
          val lons = l.coordinates.map(_.lon: Double)
          val lats = l.coordinates.map(_.lat: Double)
          map.fit(lons.min, lats.min, lons.max, lats.max)

    div(
      cls := "app",
      headerTag(
        cls := "top-bar",
        button(
          cls := "bar-button",
          aria.expanded <-- catalogOpen.signal,
          aria.controls := "catalog-drawer",
          child.text <-- wording.signal.map(_.categories),
          onClick --> (_ => catalogOpen.update(!_))
        ),
        span(cls := "brand", "Map2Online"),
        search,
        // on narrow screens these fold into the "more" menu
        button(
          cls := "bar-button more-button",
          aria.label := "More",
          aria.expanded <-- moreOpen.signal,
          "⋯",
          onClick --> (_ => moreOpen.update(!_))
        ),
        div(
          cls := "bar-actions",
          cls("open") <-- moreOpen.signal,
          button(
            cls := "bar-button",
            "Import",
            onClick --> { _ =>
              moreOpen.set(false)
              importing.set(true)
            }
          ),
          ExportMenu(catalog, wording.signal),
          SourcePicker(map, keys),
          button(
            cls := "bar-button",
            aria.label := "Settings",
            title := "Settings",
            "⚙",
            span(cls := "narrow-only", " Settings"),
            onClick --> { _ =>
              moreOpen.set(false)
              settings.set(true)
            }
          )
        ),
        child.maybe <-- map.engineError.map(_.map(e => span(cls := "notice", e)))
      ),
      div(
        cls := "body",
        asideTag(
          idAttr := "catalog-drawer",
          cls := "drawer",
          cls("open") <-- catalogOpen.signal,
          aria.hidden <-- catalogOpen.signal.map(!_),
          CatalogPanel(catalog, wording.signal, show)
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
        )
      ),
      child.maybe <-- importing.signal.map(i =>
        Option.when(i)(ImportDialog(catalog, wording.signal, () => importing.set(false)))
      ),
      child.maybe <-- settings.signal.map(o =>
        Option.when(o)(WordingSettings.dialog(wording, () => settings.set(false)))
      ),
      // the map needs to know when the drawer changes its size
      catalogOpen.signal.changes --> (_ =>
        scala.scalajs.js.timers.setTimeout(250)(map.olMap.updateSize())
      ),
      // remember the map and view between visits
      map.source.combineWith(map.view).changes --> { (s, v) =>
        ZioBridge.run(useCase(SaveBaseMapCommand(BaseMapSettings(s.id, v))).ignoreLogged)
      }
    )
