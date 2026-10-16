package s4y.map2online.search.presentation

import com.raquo.laminar.api.L.*
import org.scalajs.dom
import s4y.app.UseCase
import s4y.app.zio.UseCase.useCase
import s4y.domain.errors.InfraFailure
import s4y.facades.ol
import s4y.map2online.catalog.domain.vo.Coordinate
import s4y.map2online.search.app.SearchPlacesCommand
import s4y.map2online.search.domain.vo.{Bounds, Place, SearchError}
import s4y.presentation.laminar.ZioBridge
import s4y.presentation.map.MapSurface
import zio.Runtime

/** Place search: type, press Enter, pick a result to go there. A result can be added to the catalog
  * with `onAdd`. The picked place is marked on the map until the next search.
  */
object SearchBox:
  private enum Results:
    case Idle
    case Searching
    case Found(places: Vector[Place])
    case Failed(message: String)

  def apply(map: MapSurface, onAdd: Place => Unit)(using
      Runtime[UseCase[SearchPlacesCommand]]
  ): HtmlElement =
    val text = Var("")
    val inView = Var(false)
    val results = Var(Results.Idle)
    val picked = Var(Option.empty[Place])

    val markerSource = ol.VectorSource(new ol.VectorSourceOptions {})
    val marker = ol.VectorLayer(new ol.VectorLayerOptions:
      source = markerSource
      zIndex = 20
      style = ol.Style(new ol.StyleOptions:
        image = ol.CircleStyle(new ol.CircleOptions:
          radius = 9
          fill = ol.Fill(new ol.FillOptions:
            color = "rgba(59, 130, 246, 0.35)")
          stroke = ol.Stroke(new ol.StrokeOptions:
            color = "#3b82f6"; width = 3))))

    def showMarker(p: Option[Place]): Unit =
      markerSource.clear()
      p.foreach(place =>
        markerSource.addFeature(ol.Feature(ol.Point(map.toMap(place.center.lon, place.center.lat))))
      )

    def run(): Unit =
      val within = Option
        .when(inView.now())(map.visibleBounds())
        .flatten
        .flatMap((w, s, e, n) =>
          for
            sw <- Coordinate.from(s, w).toOption
            ne <- Coordinate.from(n, e).toOption
          yield Bounds(sw, ne)
        )
      val language = Option(dom.window.navigator.language).filter(_.nonEmpty)
      results.set(Results.Searching)
      ZioBridge.run(
        useCase(SearchPlacesCommand(text.now(), within, language)).fold(
          {
            case SearchError.EmptyQuery => results.set(Results.Idle)
            case f: InfraFailure => results.set(Results.Failed(s"Search failed: ${f.message}"))
          },
          places => results.set(Results.Found(places))
        )
      )

    def go(p: Place): Unit =
      picked.set(Some(p))
      p.bounds match
        case Some(b) if b.southWest != b.northEast =>
          map.fit(b.southWest.lon, b.southWest.lat, b.northEast.lon, b.northEast.lat)
        case _ => map.centerOn(p.center.lon, p.center.lat, Some(14))
      results.set(Results.Idle)

    div(
      cls := "search",
      role := "search",
      form(
        onSubmit.preventDefault --> (_ => run()),
        input(
          typ := "search",
          placeholder := "Find a place",
          aria.label := "Find a place",
          controlled(value <-- text.signal, onInput.mapToValue --> text)
        ),
        label(
          cls := "in-view",
          title := "Only within the visible map",
          input(typ := "checkbox", checked <-- inView.signal, onChange.mapToChecked --> inView),
          span("in view")
        )
      ),
      child.maybe <-- results.signal.map {
        case Results.Idle      => None
        case Results.Searching =>
          Some(div(cls := "search-results", p(cls := "muted", "Searching…")))
        case Results.Failed(m) => Some(div(cls := "search-results", role := "alert", p(m)))
        case Results.Found(ps) if ps.isEmpty =>
          Some(div(cls := "search-results", p(cls := "muted", "Nothing found.")))
        case Results.Found(ps) =>
          Some(
            ul(
              cls := "search-results",
              ps.map(place =>
                li(
                  button(
                    cls := "result",
                    strong(place.name),
                    span(cls := "muted", place.description),
                    onClick --> (_ => go(place))
                  ),
                  button(
                    cls := "add-result",
                    aria.label := s"Add ${place.name} to the catalog",
                    title := "Add to the catalog",
                    "+",
                    onClick --> { _ =>
                      onAdd(place)
                      go(place)
                    }
                  )
                )
              )
            )
          )
      },
      onMountCallback(_ => map.olMap.addLayer(marker)),
      onUnmountCallback(_ => map.olMap.removeLayer(marker)),
      picked.signal.combineWith(map.projection) --> { (p, _) => showMarker(p) },
      onKeyDown.filter(_.key == "Escape") --> (_ => results.set(Results.Idle))
    )
end SearchBox
