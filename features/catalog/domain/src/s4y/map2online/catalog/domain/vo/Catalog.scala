package s4y.map2online.catalog.domain.vo

import s4y.identity.{Identified, Identifier}

/** The whole catalog: ordered categories, each with ordered routes, each with ordered features.
  * Order is meaningful (the user arranges it).
  */
final case class Catalog(categories: Vector[CategoryNode])

object Catalog:
  val empty: Catalog = Catalog(Vector.empty)

final case class CategoryNode(
    category: Identified[CategoryId, Category],
    routes: Vector[RouteNode]
):
  def id: CategoryId = category.id

final case class RouteNode(
    route: Identified[RouteId, Route],
    features: Vector[Identified[FeatureId, Feature]]
):
  def id: RouteId = route.id

enum CatalogError:
  case CategoryNotFound(id: CategoryId)
  case RouteNotFound(id: RouteId)
  case FeatureNotFound(id: FeatureId)
  case DuplicateId(id: Identifier[?])
  case PositionOutOfRange(position: Int, size: Int)
