package s4y.map2online.catalog.domain.vo

/** Catalog content not yet given identifiers, e.g. read from a KML file. */
final case class RouteDraft(route: Route, features: Vector[Feature])

final case class CategoryDraft(category: Category, routes: Vector[RouteDraft])

/** Where new content goes: features into a route, routes into a category, or categories into the
  * catalog (the three import modes of the old app).
  */
enum InsertTarget:
  case IntoRoute(route: RouteId)
  case IntoCategory(category: CategoryId)
  case IntoCatalog
