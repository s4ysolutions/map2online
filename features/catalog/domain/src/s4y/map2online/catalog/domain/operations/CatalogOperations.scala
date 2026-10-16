package s4y.map2online.catalog.domain.operations

import s4y.identity.{Identified, Identifier}
import s4y.map2online.catalog.domain.vo.*

/** Pure edits and queries over the [[Catalog]] aggregate. */
object CatalogOperations:

  /** Features drawn on the map: a feature shows only when it, its route and its category are all
    * visible. Catalog order is preserved.
    */
  def visibleFeatures(catalog: Catalog): Vector[Identified[FeatureId, Feature]] =
    for
      c <- catalog.categories if c.category.value.visible
      r <- c.routes if r.route.value.visible
      f <- r.features if f.value.visible
    yield f

  // ---------------------------------------------------------------- lookups

  def category(catalog: Catalog, id: CategoryId): Option[CategoryNode] =
    catalog.categories.find(_.id == id)

  def route(catalog: Catalog, id: RouteId): Option[RouteNode] =
    catalog.categories.iterator.flatMap(_.routes).find(_.id == id)

  def feature(catalog: Catalog, id: FeatureId): Option[Identified[FeatureId, Feature]] =
    routeOf(catalog, id).flatMap(_.features.find(_.id == id))

  def categoryOf(catalog: Catalog, id: RouteId): Option[CategoryNode] =
    catalog.categories.find(_.routes.exists(_.id == id))

  def routeOf(catalog: Catalog, id: FeatureId): Option[RouteNode] =
    catalog.categories.iterator.flatMap(_.routes).find(_.features.exists(_.id == id))

  // -------------------------------------------------------------- structure

  def addCategory(
      catalog: Catalog,
      category: Identified[CategoryId, Category],
      at: Option[Int] = None
  ): Either[CatalogError, Catalog] =
    for
      _ <- requireUnused(catalog, category.id)
      categories <- OrderingOperations.insert(
        catalog.categories,
        CategoryNode(category, Vector.empty),
        at
      )
    yield Catalog(categories)

  def addRoute(
      catalog: Catalog,
      to: CategoryId,
      route: Identified[RouteId, Route],
      at: Option[Int] = None
  ): Either[CatalogError, Catalog] =
    requireUnused(catalog, route.id).flatMap(_ =>
      modifyCategory(catalog, to)(c =>
        OrderingOperations
          .insert(c.routes, RouteNode(route, Vector.empty), at)
          .map(rs => c.copy(routes = rs))
      )
    )

  def addFeature(
      catalog: Catalog,
      to: RouteId,
      feature: Identified[FeatureId, Feature],
      at: Option[Int] = None
  ): Either[CatalogError, Catalog] =
    requireUnused(catalog, feature.id).flatMap(_ =>
      modifyRoute(catalog, to)(r =>
        OrderingOperations.insert(r.features, feature, at).map(fs => r.copy(features = fs))
      )
    )

  /** Removes the category with all its routes and features. */
  def removeCategory(catalog: Catalog, id: CategoryId): Either[CatalogError, Catalog] =
    val remaining = catalog.categories.filterNot(_.id == id)
    if remaining.size == catalog.categories.size then Left(CatalogError.CategoryNotFound(id))
    else Right(Catalog(remaining))

  /** Removes the route with all its features. */
  def removeRoute(catalog: Catalog, id: RouteId): Either[CatalogError, Catalog] =
    categoryOf(catalog, id) match
      case None    => Left(CatalogError.RouteNotFound(id))
      case Some(c) =>
        modifyCategory(catalog, c.id)(c => Right(c.copy(routes = c.routes.filterNot(_.id == id))))

  def removeFeature(catalog: Catalog, id: FeatureId): Either[CatalogError, Catalog] =
    routeOf(catalog, id) match
      case None    => Left(CatalogError.FeatureNotFound(id))
      case Some(r) =>
        modifyRoute(catalog, r.id)(r => Right(r.copy(features = r.features.filterNot(_.id == id))))

  def reorderCategories(catalog: Catalog, from: Int, to: Int): Either[CatalogError, Catalog] =
    OrderingOperations.reorder(catalog.categories, from, to).map(Catalog(_))

  def reorderRoutes(
      catalog: Catalog,
      in: CategoryId,
      from: Int,
      to: Int
  ): Either[CatalogError, Catalog] =
    modifyCategory(catalog, in)(c =>
      OrderingOperations.reorder(c.routes, from, to).map(rs => c.copy(routes = rs))
    )

  def reorderFeatures(
      catalog: Catalog,
      in: RouteId,
      from: Int,
      to: Int
  ): Either[CatalogError, Catalog] =
    modifyRoute(catalog, in)(r =>
      OrderingOperations.reorder(r.features, from, to).map(fs => r.copy(features = fs))
    )

  // ---------------------------------------------------------------- content

  def updateCategory(catalog: Catalog, id: CategoryId)(
      f: Category => Category
  ): Either[CatalogError, Catalog] =
    modifyCategory(catalog, id)(c => Right(c.copy(category = c.category.map(f))))

  def updateRoute(catalog: Catalog, id: RouteId)(f: Route => Route): Either[CatalogError, Catalog] =
    modifyRoute(catalog, id)(r => Right(r.copy(route = r.route.map(f))))

  def updateFeature(catalog: Catalog, id: FeatureId)(
      f: Feature => Feature
  ): Either[CatalogError, Catalog] =
    routeOf(catalog, id) match
      case None    => Left(CatalogError.FeatureNotFound(id))
      case Some(r) =>
        modifyRoute(catalog, r.id)(r =>
          Right(r.copy(features = r.features.map(i => if i.id == id then i.map(f) else i)))
        )

  // ---------------------------------------------------------------- helpers

  private def ids(catalog: Catalog): Iterator[Identifier[?]] =
    catalog.categories.iterator.flatMap(c =>
      Iterator.single(c.id) ++ c.routes.iterator.flatMap(r =>
        Iterator.single(r.id) ++ r.features.iterator.map(_.id)
      )
    )

  private def requireUnused(catalog: Catalog, id: Identifier[?]): Either[CatalogError, Unit] =
    if ids(catalog).contains(id) then Left(CatalogError.DuplicateId(id)) else Right(())

  private def modifyCategory(catalog: Catalog, id: CategoryId)(
      f: CategoryNode => Either[CatalogError, CategoryNode]
  ): Either[CatalogError, Catalog] =
    val i = catalog.categories.indexWhere(_.id == id)
    if i < 0 then Left(CatalogError.CategoryNotFound(id))
    else f(catalog.categories(i)).map(c => Catalog(catalog.categories.updated(i, c)))

  private def modifyRoute(catalog: Catalog, id: RouteId)(
      f: RouteNode => Either[CatalogError, RouteNode]
  ): Either[CatalogError, Catalog] =
    categoryOf(catalog, id) match
      case None    => Left(CatalogError.RouteNotFound(id))
      case Some(c) =>
        modifyCategory(catalog, c.id) { c =>
          val i = c.routes.indexWhere(_.id == id)
          f(c.routes(i)).map(r => c.copy(routes = c.routes.updated(i, r)))
        }
