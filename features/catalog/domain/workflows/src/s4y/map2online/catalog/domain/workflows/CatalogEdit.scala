package s4y.map2online.catalog.domain.workflows

import s4y.identity.Identifier
import s4y.map2online.catalog.domain.vo.*

/** Every change the UI can make to the catalog. Additions carry no id: the workflow mints one and
  * reports it in [[Edited.created]].
  */
enum CatalogEdit:
  case AddCategory(category: Category, at: Option[Int] = None)
  case AddRoute(to: CategoryId, route: Route, at: Option[Int] = None)
  case AddFeature(to: RouteId, feature: Feature, at: Option[Int] = None)
  case UpdateCategory(id: CategoryId, category: Category)
  case UpdateRoute(id: RouteId, route: Route)
  case UpdateFeature(id: FeatureId, feature: Feature)
  case RemoveCategory(id: CategoryId)
  case RemoveRoute(id: RouteId)
  case RemoveFeature(id: FeatureId)
  case ReorderCategories(from: Int, to: Int)
  case ReorderRoutes(in: CategoryId, from: Int, to: Int)
  case ReorderFeatures(in: RouteId, from: Int, to: Int)

final case class Edited(catalog: Catalog, created: Option[Identifier[?]])
