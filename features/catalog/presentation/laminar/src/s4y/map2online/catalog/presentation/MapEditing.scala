package s4y.map2online.catalog.presentation

import com.raquo.laminar.api.L.*
import org.scalajs.dom
import s4y.app.zio.UseCase.useCase
import s4y.facades.ol
import s4y.identity.Identified
import s4y.identity.minting.IdentifierMint
import s4y.map2online.catalog.domain.vo.*
import s4y.map2online.catalog.domain.workflows.CatalogEdit
import s4y.preferences.{LoadPreferenceCommand, SavePreferenceCommand}
import s4y.presentation.laminar.ZioBridge
import s4y.presentation.map.MapSurface
import zio.Runtime

import scala.scalajs.js

enum Tool:
  /** Pan, select by click; nothing is drawn. */
  case Browse
  case Point
  case Line

/** Catalog features on the map and the tools that edit them: a layer of the visible features (kept
  * in sync with the catalog and the view projection), drawing points and lines into the active
  * route, dragging vertices, snapping, a context menu and a tools panel.
  */
final class MapEditing(map: MapSurface, state: CatalogState)(using Runtime[CatalogServices]):
  val tool: Var[Tool] = Var(Tool.Browse)
  val paint: Var[Color] = Var(Color.default)

  private final case class Menu(id: FeatureId, x: Double, y: Double)
  private val menu = Var(Option.empty[Menu])
  private val drawing = Var(false)

  private val source = ol.VectorSource(new ol.VectorSourceOptions:
    wrapX = false)
  private val layer = ol.VectorLayer(new ol.VectorLayerOptions:
    this.source = MapEditing.this.source
    style = js.Any.fromFunction2((f: ol.Feature, _: Double) => styleOf(f))
    zIndex = 10
    updateWhileInteracting = true)

  // ------------------------------------------------------------ styling

  private val styleCache =
    scala.collection.mutable.Map.empty[(String, Color, Boolean, String), ol.Style]

  private def styleOf(f: ol.Feature): ol.Style =
    val kind = f.get("kind").asInstanceOf[String]
    val c =
      Color.values.find(_.toString == f.get("color").asInstanceOf[String]).getOrElse(Color.default)
    val selected = f.getId().toOption.map(_.toString) == state.selectedFeature.now().map(_.value)
    val title = f.get("title").asInstanceOf[js.UndefOr[String]].getOrElse("")
    styleCache.getOrElseUpdate((kind, c, selected, title), makeStyle(kind, c, selected, title))

  private def label(title: String, dy: Double): js.UndefOr[ol.Text] =
    if title.isEmpty then js.undefined
    else
      ol.Text(new ol.TextOptions:
        text = title
        font = "12px system-ui, sans-serif"
        offsetY = dy
        fill = ol.Fill(new ol.FillOptions:
          color = "#1f2933")
        stroke = ol.Stroke(new ol.StrokeOptions:
          color = "#ffffff"; width = 3)
        overflow = true)

  private def makeStyle(kind: String, c: Color, selected: Boolean, title: String): ol.Style =
    if kind == "Point" then
      ol.Style(new ol.StyleOptions:
        image = ol.Icon(new ol.IconOptions:
          src = Pins.dataUrl(c, selected)
          anchor = js.Array(0.5, 1.0)
          scale = if selected then 1.2 else 1.0)
        text = label(title, 10)
        zIndex = if selected then 2 else 1)
    else
      ol.Style(new ol.StyleOptions:
        stroke = ol.Stroke(new ol.StrokeOptions:
          color = c.rgba.take(7)
          width = if selected then 5 else 3)
        text = label(title, -8)
        zIndex = if selected then 2 else 0)

  private def drawStyle(c: Color): ol.Style =
    ol.Style(new ol.StyleOptions:
      stroke = ol.Stroke(new ol.StrokeOptions:
        color = c.rgba.take(7); width = 3; lineDash = js.Array(6.0, 4.0))
      image = ol.CircleStyle(new ol.CircleOptions:
        radius = 5
        fill = ol.Fill(new ol.FillOptions:
          color = c.rgba.take(7))
        stroke = ol.Stroke(new ol.StrokeOptions:
          color = "#ffffff"; width = 2)))

  // ------------------------------------------------------- catalog -> map

  private var shown = Map.empty[String, (Feature, String)]

  private def toGeometry(g: Geometry): ol.Geometry = g match
    case Geometry.Point(c)      => ol.Point(map.toMap(c.lon, c.lat))
    case l: Geometry.LineString =>
      ol.LineString(js.Array(l.coordinates.map(c => map.toMap(c.lon, c.lat))*))

  private def sync(features: Vector[Identified[FeatureId, Feature]], projection: String): Unit =
    val ids = features.map(_.id.value).toSet
    shown.keys.filterNot(ids).foreach { id =>
      source.getFeatureById(id) match
        case null          => ()
        case f: ol.Feature => source.removeFeature(f)
    }
    val added = js.Array[ol.Feature]()
    features.foreach { item =>
      val id = item.id.value
      val f = item.value
      shown.get(id) match
        case Some((old, p)) if old == f && p == projection => ()
        case Some(_)                                       =>
          source.getFeatureById(id) match
            case null            => ()
            case olf: ol.Feature =>
              setProperties(olf, f)
              olf.setGeometry(toGeometry(f.geometry))
        case None =>
          val olf = ol.Feature(toGeometry(f.geometry))
          olf.setId(id)
          setProperties(olf, f)
          added.push(olf)
    }
    if added.nonEmpty then source.addFeatures(added)
    shown = features.map(i => i.id.value -> (i.value, projection)).toMap

  private def setProperties(olf: ol.Feature, f: Feature): Unit =
    olf.set("kind", if f.geometry.isInstanceOf[Geometry.Point] then "Point" else "LineString")
    olf.set("color", f.color.toString)
    olf.set("title", Title.unwrap(f.title))

  // ------------------------------------------------------- map -> catalog

  private def fromGeometry(g: ol.Geometry): Option[Geometry] =
    def coordinate(c: ol.Coordinate): Option[Coordinate] =
      val (lon, lat) = map.fromMap(c)
      Coordinate.from(lat, lon).toOption
    g.getType() match
      case "Point" => coordinate(g.asInstanceOf[ol.Point].getCoordinates()).map(Geometry.Point(_))
      case "LineString" =>
        val cs = g.asInstanceOf[ol.LineString].getCoordinates().toVector.flatMap(coordinate)
        Geometry.LineString.from(cs).toOption
      case _ => None

  private def featureId(f: ol.Feature): Option[FeatureId] =
    f.getId().toOption.flatMap(id => IdentifierMint.fromString[Feature](id.toString).toOption)

  private def featureAt(pixel: ol.Pixel): Option[FeatureId] =
    val options = js.Dynamic.literal(
      hitTolerance = 6,
      layerFilter = js.Any.fromFunction1((l: ol.BaseLayer) => l eq layer)
    )
    map.olMap.getFeaturesAtPixel(pixel, options).headOption.flatMap(featureId)

  private def onDrawEnd(e: ol.BaseEvent): Unit =
    drawing.set(false)
    val drawn = e.asInstanceOf[ol.DrawEvent].feature
    drawn.getGeometry().toOption.flatMap(fromGeometry).foreach { g =>
      state.addFeature(Feature.create(Title(""), g, paint.now()))(id =>
        state.selectedFeature.set(Some(id))
      )
    }

  private def onModifyEnd(e: ol.BaseEvent): Unit =
    val catalog = state.catalog.now()
    e.asInstanceOf[ol.ModifyEvent].features.getArray().foreach { olf =>
      for
        id <- featureId(olf)
        g <- olf.getGeometry().toOption.flatMap(fromGeometry)
        current <- s4y.map2online.catalog.domain.operations.CatalogOperations.feature(catalog, id)
        if current.value.geometry != g
      do state.edit(CatalogEdit.UpdateFeature(id, current.value.copy(geometry = g)))()
    }

  // ------------------------------------------------------- interactions

  private var draw: Option[ol.Draw] = None
  private val modify = ol.Modify(new ol.ModifyOptions:
    this.source = MapEditing.this.source; pixelTolerance = 8)
  private val snap = ol.Snap(new ol.SnapOptions:
    this.source = MapEditing.this.source)
  modify.on("modifyend", e => onModifyEnd(e))

  private def setDraw(t: Tool, c: Color): Unit =
    draw.foreach { d =>
      d.abortDrawing()
      map.olMap.removeInteraction(d)
    }
    draw = t match
      case Tool.Browse            => None
      case Tool.Point | Tool.Line =>
        val d = ol.Draw(new ol.DrawOptions:
          `type` = if t == Tool.Point then "Point" else "LineString"
          style = drawStyle(c)
          stopClick = true)
        d.on("drawstart", _ => drawing.set(true))
        d.on("drawend", e => onDrawEnd(e))
        d.on("drawabort", _ => drawing.set(false))
        Some(d)
    // interactions handle events last-added first: snap must be last
    map.olMap.removeInteraction(modify)
    map.olMap.removeInteraction(snap)
    draw.foreach(map.olMap.addInteraction)
    map.olMap.addInteraction(modify)
    map.olMap.addInteraction(snap)

  private val onContextMenu: js.Function1[dom.MouseEvent, Unit] = e =>
    e.preventDefault()
    if drawing.now() then draw.foreach(_.abortDrawing())
    else
      val pixel = map.olMap.getEventPixel(e)
      menu.set(featureAt(pixel).map(id => Menu(id, pixel(0), pixel(1))))

  private val onKey: js.Function1[dom.KeyboardEvent, Unit] = e =>
    val typing = dom.document.activeElement match
      case el: dom.HTMLElement =>
        Set("INPUT", "TEXTAREA", "SELECT")(el.tagName) || el.isContentEditable
      case _ => false
    if !typing then
      e.key match
        case "Escape" =>
          draw.foreach(_.abortDrawing())
          menu.set(None)
        case "Backspace" if drawing.now() && tool.now() == Tool.Line =>
          e.preventDefault()
          draw.foreach(_.removeLastPoint())
        case _ => ()

  private val onSingleClick: js.Function1[ol.BaseEvent, Unit] = e =>
    menu.set(None)
    if tool.now() == Tool.Browse then
      val pixel = e.asInstanceOf[ol.MapBrowserEvent].pixel
      state.selectedFeature.set(featureAt(pixel))

  // ------------------------------------------------------------ binding

  private val toolKey = "map.tool"
  private val colorKey = "map.color"

  /** Attach to an element that lives as long as the map. */
  val binder: Modifier[HtmlElement] = Seq(
    onMountCallback { _ =>
      map.olMap.addLayer(layer)
      setDraw(tool.now(), paint.now())
      map.olMap.getViewport().addEventListener("contextmenu", onContextMenu, useCapture = true)
      dom.document.addEventListener("keydown", onKey)
      map.olMap.on("singleclick", onSingleClick)
      ZioBridge.run(
        (useCase(LoadPreferenceCommand(toolKey)) <*> useCase(LoadPreferenceCommand(colorKey))).fold(
          _ => (),
          (t, c) =>
            t.flatMap(n => Tool.values.find(_.toString == n)).foreach(tool.set)
            c.flatMap(n => Color.values.find(_.toString == n)).foreach(paint.set)
        )
      )
    },
    onUnmountCallback { _ =>
      map.olMap.removeLayer(layer)
      draw.foreach(map.olMap.removeInteraction)
      map.olMap.removeInteraction(modify)
      map.olMap.removeInteraction(snap)
      map.olMap.getViewport().removeEventListener("contextmenu", onContextMenu, useCapture = true)
      dom.document.removeEventListener("keydown", onKey)
    },
    state.visibleFeatures.combineWith(map.projection) --> { (fs, p) => sync(fs, p) },
    tool.signal.combineWith(paint.signal).changes --> { (t, c) =>
      setDraw(t, c)
      ZioBridge.run(
        (useCase(SavePreferenceCommand(toolKey, Some(t.toString))) *>
          useCase(SavePreferenceCommand(colorKey, Some(c.toString)))).ignore
      )
    },
    state.selectedFeature.signal --> (_ => layer.changed())
  )

  /** Context menu over a feature: edit or delete. */
  val contextMenu: HtmlElement = div(
    child.maybe <-- menu.signal.map(_.map { m =>
      div(
        cls := "context-menu",
        role := "menu",
        styleAttr := s"left: ${m.x}px; top: ${m.y}px",
        button(
          role := "menuitem",
          "Edit",
          onClick --> { _ =>
            state.selectedFeature.set(Some(m.id))
            state.editedFeature.set(Some(m.id))
            menu.set(None)
          }
        ),
        button(
          role := "menuitem",
          cls := "danger",
          "Delete",
          onClick --> { _ =>
            state.edit(CatalogEdit.RemoveFeature(m.id))()
            if state.selectedFeature.now().contains(m.id) then state.selectedFeature.set(None)
            menu.set(None)
          }
        )
      )
    })
  )

  /** Browse / point / line, and the palette. */
  val toolsPanel: HtmlElement =
    def toolButton(t: Tool, tip: String, glyph: SvgElement) =
      button(
        cls := "tool",
        cls("active") <-- tool.signal.map(_ == t),
        aria.pressed <-- tool.signal.map(a => (a == t).toString),
        aria.label := tip,
        title := tip,
        glyph,
        onClick --> (_ => tool.set(t))
      )
    div(
      cls := "tools-panel",
      role := "toolbar",
      aria.label := "Drawing tools",
      toolButton(Tool.Browse, "Browse and select", Glyphs.hand),
      toolButton(Tool.Point, "Draw points", Glyphs.pin),
      toolButton(Tool.Line, "Draw lines (double-click to finish)", Glyphs.line),
      div(
        cls := "palette",
        Color.values.toSeq.map(c =>
          button(
            cls := "swatch",
            cls("active") <-- paint.signal.map(_ == c),
            aria.label := c.toString,
            title := c.toString,
            styleAttr := s"background: ${c.rgba.take(7)}",
            onClick --> (_ => paint.set(c))
          )
        )
      ),
      child.maybe <-- drawing.signal.combineWith(tool.signal).map { (d, t) =>
        Option.when(d && t == Tool.Line)(
          div(cls := "hint", "Double-click to finish · Backspace undoes a point · Esc cancels")
        )
      }
    )
end MapEditing

/** Small inline SVG icons. */
object Glyphs:
  import svg.*

  private def icon(paths: SvgElement*): SvgElement =
    svg(
      width := "20",
      height := "20",
      viewBox := "0 0 24 24",
      fill := "none",
      stroke := "currentColor",
      strokeWidth := "2",
      strokeLineCap := "round",
      strokeLineJoin := "round",
      paths
    )

  def hand: SvgElement = icon(
    path(d := "M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8"),
    path(
      d := "M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"
    )
  )
  def pin: SvgElement = icon(
    path(d := "M12 22s7-7.6 7-12.3A7 7 0 0 0 5 9.7C5 14.4 12 22 12 22z"),
    circle(cx := "12", cy := "10", r := "2.5")
  )
  def line: SvgElement = icon(
    polyline(points := "3 17 9 11 13 15 21 7"),
    circle(cx := "3", cy := "17", r := "1.5"),
    circle(cx := "21", cy := "7", r := "1.5")
  )
