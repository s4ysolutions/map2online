package s4y.map2online.catalog.domain.workflows

import s4y.domain.errors.InfraFailure
import s4y.identity.{Identified, Identifier}
import s4y.map2online.catalog.domain.operations.CatalogOperations as Ops
import s4y.map2online.catalog.domain.vo.*
import s4y.map2online.catalog.domain.workflows.ports.CatalogRepository
import s4y.tx.{IdGenerator, TransactionContext, TransactionManager}
import zio.*

/** Load-modify-save of the catalog, one transaction per change. */
final class CatalogWorkflows[TX <: TransactionContext](
    repository: CatalogRepository[TX],
    tm: TransactionManager[TX],
    ids: IdGenerator
):

  def load: IO[InfraFailure, Catalog] =
    tm.transaction[Any, Nothing, Catalog]("load catalog")(repository.load)

  def edit(edit: CatalogEdit): IO[InfraFailure | CatalogError, Edited] =
    tm.transaction[Any, CatalogError, Edited](s"edit catalog: ${edit.productPrefix}") {
      for
        catalog <- repository.load
        edited <- apply(catalog, edit)
        _ <- repository.save(edited.catalog).when(edited.catalog != catalog)
      yield edited
    }

  /** Adds drafts (e.g. from KML) under fresh ids in one save. `target` decides the level: features
    * go into a route, routes into a category, categories into the catalog.
    */
  def insert(
      drafts: Vector[CategoryDraft],
      target: InsertTarget
  ): IO[InfraFailure | CatalogError, Catalog] =
    tm.transaction[Any, CatalogError, Catalog]("insert drafts") {
      for
        catalog <- repository.load
        inserted <- target match
          case InsertTarget.IntoCatalog =>
            ZIO.foldLeft(drafts)(catalog)((c, d) => addCategory(c, d))
          case InsertTarget.IntoCategory(category) =>
            ZIO.foldLeft(drafts.flatMap(_.routes))(catalog)((c, r) => addRoute(c, category, r))
          case InsertTarget.IntoRoute(route) =>
            ZIO.foldLeft(drafts.flatMap(_.routes).flatMap(_.features))(catalog)((c, f) =>
              addFeature(c, route, f)
            )
        _ <- repository.save(inserted)
      yield inserted
    }

  private def addCategory(catalog: Catalog, d: CategoryDraft): IO[CatalogError, Catalog] =
    for
      id <- ids.next[Category]
      added <- ZIO.fromEither(Ops.addCategory(catalog, Identified(id, d.category)))
      withRoutes <- ZIO.foldLeft(d.routes)(added)((c, r) => addRoute(c, id, r))
    yield withRoutes

  private def addRoute(catalog: Catalog, to: CategoryId, d: RouteDraft): IO[CatalogError, Catalog] =
    for
      id <- ids.next[Route]
      added <- ZIO.fromEither(Ops.addRoute(catalog, to, Identified(id, d.route)))
      withFeatures <- ZIO.foldLeft(d.features)(added)((c, f) => addFeature(c, id, f))
    yield withFeatures

  private def addFeature(catalog: Catalog, to: RouteId, f: Feature): IO[CatalogError, Catalog] =
    ids.next[Feature].flatMap(id => ZIO.fromEither(Ops.addFeature(catalog, to, Identified(id, f))))

  private def apply(catalog: Catalog, edit: CatalogEdit): IO[CatalogError, Edited] =
    import CatalogEdit.*
    def plain(e: Either[CatalogError, Catalog]) = ZIO.fromEither(e).map(Edited(_, None))
    def created[A](id: Identifier[A])(e: Either[CatalogError, Catalog]) =
      ZIO.fromEither(e).map(Edited(_, Some(id)))
    edit match
      case AddCategory(category, at) =>
        ids
          .next[Category]
          .flatMap(id => created(id)(Ops.addCategory(catalog, Identified(id, category), at)))
      case AddRoute(to, route, at) =>
        ids
          .next[Route]
          .flatMap(id => created(id)(Ops.addRoute(catalog, to, Identified(id, route), at)))
      case AddFeature(to, feature, at) =>
        ids
          .next[Feature]
          .flatMap(id => created(id)(Ops.addFeature(catalog, to, Identified(id, feature), at)))
      case UpdateCategory(id, category)  => plain(Ops.updateCategory(catalog, id)(_ => category))
      case UpdateRoute(id, route)        => plain(Ops.updateRoute(catalog, id)(_ => route))
      case UpdateFeature(id, feature)    => plain(Ops.updateFeature(catalog, id)(_ => feature))
      case RemoveCategory(id)            => plain(Ops.removeCategory(catalog, id))
      case RemoveRoute(id)               => plain(Ops.removeRoute(catalog, id))
      case RemoveFeature(id)             => plain(Ops.removeFeature(catalog, id))
      case ReorderCategories(from, to)   => plain(Ops.reorderCategories(catalog, from, to))
      case ReorderRoutes(in, from, to)   => plain(Ops.reorderRoutes(catalog, in, from, to))
      case ReorderFeatures(in, from, to) => plain(Ops.reorderFeatures(catalog, in, from, to))
  end apply
end CatalogWorkflows

object CatalogWorkflows:
  def makeLayer[TX <: TransactionContext: Tag]: URLayer[CatalogRepository[
    TX
  ] & TransactionManager[TX] & IdGenerator, CatalogWorkflows[TX]] =
    ZLayer.fromFunction(CatalogWorkflows[TX](_, _, _))
