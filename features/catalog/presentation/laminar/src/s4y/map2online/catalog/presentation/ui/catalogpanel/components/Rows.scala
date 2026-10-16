package s4y.map2online.catalog.presentation.ui.catalogpanel.components

import com.raquo.laminar.api.L.*
import s4y.identity.Identified
import s4y.map2online.catalog.domain.operations.CatalogOperations
import s4y.map2online.catalog.domain.vo.*
import s4y.map2online.catalog.domain.workflows.CatalogEdit
import s4y.map2online.catalog.presentation.ui.MarkdownView
import s4y.map2online.catalog.presentation.ui.catalogpanel.{Level, Navigation, Target}
import s4y.map2online.catalog.presentation.ui.editors.Coordinates
import s4y.map2online.catalog.presentation.{CatalogState, Wording}
import s4y.presentation.laminar.ReorderList

private[catalogpanel] object Icons:
  import svg.*
  private def icon(paths: SvgElement*): SvgElement =
    svg(
      width := "18",
      height := "18",
      viewBox := "0 0 24 24",
      fill := "none",
      stroke := "currentColor",
      strokeWidth := "2",
      strokeLineCap := "round",
      strokeLineJoin := "round",
      paths
    )
  def eye: SvgElement = icon(
    path(d := "M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"),
    circle(cx := "12", cy := "12", r := "3")
  )
  def eyeOff: SvgElement = icon(
    path(
      d := "M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c7 0 11 7 11 7a18 18 0 0 1-3.2 4M6.6 6.6A18 18 0 0 0 1 12s4 7 11 7a10 10 0 0 0 5.4-1.6"
    )
  )
  def edit: SvgElement = icon(path(d := "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"))
  def trash: SvgElement = icon(path(d := "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"))
  def grip: SvgElement = icon(
    circle(cx := "9", cy := "6", r := "1"),
    circle(cx := "15", cy := "6", r := "1"),
    circle(cx := "9", cy := "12", r := "1"),
    circle(cx := "15", cy := "12", r := "1"),
    circle(cx := "9", cy := "18", r := "1"),
    circle(cx := "15", cy := "18", r := "1")
  )
  def flag: SvgElement = icon(path(d := "M4 22V4M4 4h13l-2 4 2 4H4"))
  def chevron: SvgElement = icon(polyline(points := "9 6 15 12 9 18"))

private[catalogpanel] object Row:
  def iconButton(label: String, icon: SvgElement, onActivate: () => Unit): HtmlElement =
    button(
      cls := "icon-button",
      aria.label := label,
      title := label,
      icon,
      onClick.stopPropagation --> (_ => onActivate())
    )

  def visibility(visible: Boolean, what: String, toggle: () => Unit): HtmlElement =
    button(
      cls := "icon-button",
      cls("muted") := !visible,
      aria.pressed := visible.toString,
      aria.label := s"Show $what on the map",
      title := (if visible then s"Hide $what" else s"Show $what"),
      if visible then Icons.eye else Icons.eyeOff,
      onClick.stopPropagation --> (_ => toggle())
    )

  def titleOf(t: Title, fallback: String): String =
    Option(Title.unwrap(t)).filter(_.nonEmpty).getOrElse(fallback)

object Breadcrumbs:
  def apply(
      state: CatalogState,
      wording: Signal[Wording],
      level: Signal[Level],
      open: Level => Unit
  ): HtmlElement =
    navTag(
      cls := "breadcrumbs",
      aria.label := "Catalog levels",
      children <-- level.combineWith(state.catalog, wording).map { (l, cat, w) =>
        def crumb(text: String, target: Option[Level]) = target match
          case Some(t) => button(cls := "crumb", text, onClick --> (_ => open(t)))
          case None    => span(cls := "crumb current", aria.current := "page", text)
        def categoryTitle(c: CategoryId) =
          CatalogOperations
            .category(cat, c)
            .map(n => Row.titleOf(n.category.value.title, w.category))
            .getOrElse("")
        def routeTitle(r: RouteId) =
          CatalogOperations
            .route(cat, r)
            .map(n => Row.titleOf(n.route.value.title, w.route))
            .getOrElse("")
        l match
          case Level.Categories => List(crumb(w.categories, None))
          case Level.Routes(c)  =>
            List(crumb(w.categories, Some(Level.Categories)), crumb(categoryTitle(c), None))
          case Level.Features(c, r) =>
            List(
              crumb(w.categories, Some(Level.Categories)),
              crumb(categoryTitle(c), Some(Level.Routes(c))),
              crumb(routeTitle(r), None)
            )
      }
    )

object CategoriesList:
  def apply(state: CatalogState, wording: Signal[Wording], nav: Navigation): HtmlElement =
    div(
      ReorderList[CategoryNode, CategoryId](
        state.catalog.map(_.categories),
        _.id,
        (from, to) => state.edit(CatalogEdit.ReorderCategories(from, to))()
      ) { (node, _, handle) =>
        val c = node.category.value
        div(
          cls := "row",
          span(handle, Icons.grip),
          child <-- wording.map(w =>
            Row.visibility(
              c.visible,
              w.category.toLowerCase,
              () => state.edit(CatalogEdit.UpdateCategory(node.id, c.copy(visible = !c.visible)))()
            )
          ),
          button(
            cls := "row-title",
            child.text <-- wording.map(w => Row.titleOf(c.title, w.category)),
            span(
              cls := "count",
              child.text <-- wording.map(w => s"${node.routes.size} ${w.routes.toLowerCase}")
            ),
            onClick --> (_ => nav.open(Level.Routes(node.id)))
          ),
          Row.iconButton("Edit", Icons.edit, () => nav.edit(Target.OfCategory(node.id))),
          Row.iconButton("Delete", Icons.trash, () => nav.delete(Target.OfCategory(node.id)))
        )
      },
      child.maybe <-- state.catalog
        .combineWith(state.loaded)
        .map((c, loaded) =>
          Option.when(loaded && c.categories.isEmpty)(
            p(cls := "empty", "Nothing here yet. Draw on the map or import a KML file.")
          )
        ),
      button(
        cls := "add-button",
        child.text <-- wording.map(w => s"Add ${w.category.toLowerCase}"),
        onClick.compose(_.sample(wording)) --> { w =>
          state.edit(CatalogEdit.AddCategory(Category.create(Title(w.newCategory))))(e =>
            e.created.foreach(id => nav.edit(Target.OfCategory(id.asInstanceOf[CategoryId])))
          )
        }
      )
    )

object RoutesList:
  def apply(
      state: CatalogState,
      wording: Signal[Wording],
      category: CategoryId,
      nav: Navigation
  ): HtmlElement =
    val routes = state.catalog.map(c =>
      CatalogOperations.category(c, category).map(_.routes).getOrElse(Vector.empty)
    )
    div(
      child.maybe <-- state.catalog.map(c =>
        CatalogOperations
          .category(c, category)
          .map(n => descriptionOf(n.category.value.summary, n.category.value.description))
      ),
      ReorderList[RouteNode, RouteId](
        routes,
        _.id,
        (from, to) => state.edit(CatalogEdit.ReorderRoutes(category, from, to))()
      ) { (node, _, handle) =>
        val r = node.route.value
        div(
          cls := "row",
          cls("active-route") <-- state.activeRoute.signal.map(_.contains(node.id)),
          span(handle, Icons.grip),
          child <-- wording.map(w =>
            Row.visibility(
              r.visible,
              w.route.toLowerCase,
              () => state.edit(CatalogEdit.UpdateRoute(node.id, r.copy(visible = !r.visible)))()
            )
          ),
          button(
            cls := "icon-button draw-target",
            aria.label := "Draw into this",
            title := "New places are drawn into this",
            aria.pressed <-- state.activeRoute.signal.map(_.contains(node.id).toString),
            Icons.flag,
            onClick.stopPropagation --> (_ => state.setActiveRoute(Some(node.id)))
          ),
          button(
            cls := "row-title",
            child.text <-- wording.map(w => Row.titleOf(r.title, w.route)),
            span(cls := "count", s"${node.features.size} places"),
            onClick --> (_ => nav.open(Level.Features(category, node.id)))
          ),
          Row.iconButton("Edit", Icons.edit, () => nav.edit(Target.OfRoute(node.id))),
          Row.iconButton("Delete", Icons.trash, () => nav.delete(Target.OfRoute(node.id)))
        )
      },
      button(
        cls := "add-button",
        child.text <-- wording.map(w => s"Add ${w.route.toLowerCase}"),
        onClick.compose(_.sample(wording)) --> { w =>
          state.edit(CatalogEdit.AddRoute(category, Route.create(Title(w.newRoute))))(e =>
            e.created.foreach(id => state.setActiveRoute(Some(id.asInstanceOf[RouteId])))
          )
        }
      )
    )

  private[components] def descriptionOf(summary: Summary, description: Markdown): HtmlElement =
    div(
      cls := "level-description",
      Option(Summary.unwrap(summary)).filter(_.nonEmpty).map(s => p(cls := "summary", s)),
      Option(Markdown.unwrap(description)).filter(_.nonEmpty).map(d => MarkdownView(Val(d)))
    )

object FeaturesList:
  def apply(
      state: CatalogState,
      route: RouteId,
      nav: Navigation,
      onShow: Feature => Unit
  ): HtmlElement =
    val features = state.catalog.map(c =>
      CatalogOperations.route(c, route).map(_.features).getOrElse(Vector.empty)
    )
    div(
      child.maybe <-- state.catalog.map(c =>
        CatalogOperations
          .route(c, route)
          .map(n => RoutesList.descriptionOf(n.route.value.summary, n.route.value.description))
      ),
      ReorderList[Identified[FeatureId, Feature], FeatureId](
        features,
        _.id,
        (from, to) => state.edit(CatalogEdit.ReorderFeatures(route, from, to))()
      ) { (item, index, handle) =>
        val f = item.value
        val selected = state.selectedFeature.signal.map(_.contains(item.id))
        div(
          cls := "feature-row",
          div(
            cls := "row",
            cls("selected") <-- selected,
            span(handle, Icons.grip),
            Row.visibility(
              f.visible,
              "place",
              () => state.edit(CatalogEdit.UpdateFeature(item.id, f.copy(visible = !f.visible)))()
            ),
            button(
              cls := "row-title",
              Coordinates.glyph(f),
              child.text <-- index.map(i =>
                Row.titleOf(
                  f.title,
                  if f.geometry.isInstanceOf[Geometry.Point] then s"Point ${i + 1}"
                  else s"Line ${i + 1}"
                )
              ),
              onClick --> { _ =>
                state.selectedFeature.set(Some(item.id))
                onShow(f)
              }
            ),
            Row.iconButton("Edit", Icons.edit, () => nav.edit(Target.OfFeature(item.id))),
            Row.iconButton("Delete", Icons.trash, () => nav.delete(Target.OfFeature(item.id)))
          ),
          child.maybe <-- selected.map(s =>
            Option.when(s)(
              div(
                cls := "feature-details",
                Option(Summary.unwrap(f.summary))
                  .filter(_.nonEmpty)
                  .map(s => p(cls := "summary", s)),
                Option(Markdown.unwrap(f.description))
                  .filter(_.nonEmpty)
                  .map(d => MarkdownView(Val(d))),
                p(cls := "coordinates", Coordinates.describe(f.geometry))
              )
            )
          )
        )
      },
      child.maybe <-- features.map(fs =>
        Option.when(fs.isEmpty)(
          p(cls := "empty", "No places yet. Pick the point or line tool and draw on the map.")
        )
      )
    )
