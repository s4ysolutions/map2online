package s4y.map2online.catalog.presentation.ui.catalogpanel

import com.raquo.laminar.api.L.*
import s4y.map2online.catalog.domain.operations.CatalogOperations
import s4y.map2online.catalog.domain.vo.*
import s4y.map2online.catalog.domain.workflows.CatalogEdit
import s4y.map2online.catalog.presentation.ui.catalogpanel.components.*
import s4y.map2online.catalog.presentation.ui.editors.Editors
import s4y.map2online.catalog.presentation.{CatalogState, Wording}
import s4y.presentation.laminar.Dialog

/** Where the panel is: the category list, one category's routes, or one route's features.
  */
enum Level:
  case Categories
  case Routes(category: CategoryId)
  case Features(category: CategoryId, route: RouteId)

/** Something the user asked to change or remove, awaiting a dialog. */
enum Target:
  case OfCategory(id: CategoryId)
  case OfRoute(id: RouteId)
  case OfFeature(id: FeatureId)

/** The catalog panel: drill down from categories to routes to features, reorder by dragging, toggle
  * visibility, choose the route drawing goes into, edit and delete. `onShow` moves the map to a
  * feature.
  */
object CatalogPanel:
  def apply(state: CatalogState, wording: Signal[Wording], onShow: Feature => Unit): HtmlElement =
    val level = Var[Level](Level.Categories)
    val editing = Var(Option.empty[Target])
    val deleting = Var(Option.empty[Target])

    // a level whose items disappeared falls back to the nearest one that exists
    val validLevel: Signal[Level] = level.signal.combineWith(state.catalog).map {
      case (l @ Level.Features(_, r), cat) if CatalogOperations.route(cat, r).isDefined => l
      case (Level.Features(c, _), cat) if CatalogOperations.category(cat, c).isDefined  =>
        Level.Routes(c)
      case (l @ Level.Routes(c), cat) if CatalogOperations.category(cat, c).isDefined => l
      case _ => Level.Categories
    }

    val nav = Navigation(
      open = l => level.set(l),
      edit = t => editing.set(Some(t)),
      delete = t => deleting.set(Some(t))
    )

    div(
      cls := "catalog-panel",
      Breadcrumbs(state, wording, validLevel, l => level.set(l)),
      div(
        cls := "catalog-content",
        child <-- validLevel.map {
          case Level.Categories     => CategoriesList(state, wording, nav)
          case Level.Routes(c)      => RoutesList(state, wording, c, nav)
          case Level.Features(_, r) => FeaturesList(state, r, nav, onShow)
        }
      ),
      // a feature picked on the map opens its route here
      state.selectedFeature.signal.changes.collect { case Some(id) => id } --> { id =>
        val cat = state.catalog.now()
        for
          route <- CatalogOperations.routeOf(cat, id)
          category <- CatalogOperations.categoryOf(cat, route.id)
        do level.set(Level.Features(category.id, route.id))
      },
      // "Edit" from the map's context menu
      state.editedFeature.signal.changes.collect { case Some(id) => id } --> { id =>
        editing.set(Some(Target.OfFeature(id)))
        state.editedFeature.set(None)
      },
      child.maybe <-- editing.signal
        .combineWith(wording)
        .map((t, w) => t.flatMap(editor(state, w, _, () => editing.set(None)))),
      child.maybe <-- deleting.signal
        .combineWith(wording)
        .map((t, w) => t.flatMap(confirmDelete(state, w, _, () => deleting.set(None))))
    )

  private def editor(
      state: CatalogState,
      w: Wording,
      t: Target,
      close: () => Unit
  ): Option[HtmlElement] =
    val cat = state.catalog.now()
    t match
      case Target.OfCategory(id) =>
        CatalogOperations
          .category(cat, id)
          .map(c =>
            Editors.category(
              s"Edit ${w.category.toLowerCase}",
              c.category.value,
              v => state.edit(CatalogEdit.UpdateCategory(id, v))(),
              close
            )
          )
      case Target.OfRoute(id) =>
        CatalogOperations
          .route(cat, id)
          .map(r =>
            Editors.route(
              s"Edit ${w.route.toLowerCase}",
              r.route.value,
              v => state.edit(CatalogEdit.UpdateRoute(id, v))(),
              close
            )
          )
      case Target.OfFeature(id) =>
        CatalogOperations
          .feature(cat, id)
          .map(f =>
            Editors.feature(
              "Edit place",
              f.value,
              v => state.edit(CatalogEdit.UpdateFeature(id, v))(),
              close
            )
          )

  private def confirmDelete(
      state: CatalogState,
      w: Wording,
      t: Target,
      close: () => Unit
  ): Option[HtmlElement] =
    val cat = state.catalog.now()
    def name(title: Title, fallback: String) =
      Option(Title.unwrap(title)).filter(_.nonEmpty).getOrElse(fallback)
    t match
      case Target.OfCategory(id) =>
        CatalogOperations
          .category(cat, id)
          .map(c =>
            Dialog.confirm(
              s"Delete ${w.category.toLowerCase} “${name(c.category.value.title, w.category)}” with its ${c.routes.size} ${w.routes.toLowerCase} and all their places?",
              "Delete",
              () => state.edit(CatalogEdit.RemoveCategory(id))(),
              close
            )
          )
      case Target.OfRoute(id) =>
        CatalogOperations
          .route(cat, id)
          .map(r =>
            Dialog.confirm(
              s"Delete ${w.route.toLowerCase} “${name(r.route.value.title, w.route)}” with its ${r.features.size} places?",
              "Delete",
              () => state.edit(CatalogEdit.RemoveRoute(id))(),
              close
            )
          )
      case Target.OfFeature(id) =>
        Some(
          Dialog.confirm(
            "Delete this place?",
            "Delete",
            () => state.edit(CatalogEdit.RemoveFeature(id))(),
            close
          )
        )
end CatalogPanel

/** Callbacks rows use to drive the panel. */
final case class Navigation(open: Level => Unit, edit: Target => Unit, delete: Target => Unit)
