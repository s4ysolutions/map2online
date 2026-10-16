package s4y.map2online.catalog.app

import s4y.app.UseCase
import s4y.domain.errors.InfraFailure
import s4y.map2online.catalog.domain.vo.*
import s4y.map2online.catalog.domain.workflows.{CatalogEdit, CatalogWorkflows, Edited}
import s4y.map2online.kml.domain.operations.{ImportOperations, KmlReader, KmlWriter}
import s4y.map2online.kml.domain.vo.{KmlError, KmlWarning}
import s4y.tx.TransactionContext
import zio.*

final case class LoadCatalogCommand() extends s4y.app.zio.UseCaseCommand:
  type E = InfraFailure
  type A = Catalog

final case class EditCatalogCommand(edit: CatalogEdit) extends s4y.app.zio.UseCaseCommand:
  type E = InfraFailure | CatalogError
  type A = Edited

/** Reads a KML file and inserts its content at `target`. */
final case class ImportKmlCommand(fileName: String, text: String, target: InsertTarget)
    extends s4y.app.zio.UseCaseCommand:
  type E = InfraFailure | CatalogError | KmlError
  type A = ImportReport

final case class ImportReport(catalog: Catalog, imported: Int, warnings: Vector[KmlWarning])

enum ExportScope:
  case WholeCatalog
  case OneCategory(id: CategoryId)
  case OneRoute(id: RouteId)

final case class ExportKmlCommand(documentName: String, scope: ExportScope, onlyVisible: Boolean)
    extends s4y.app.zio.UseCaseCommand:
  type E = InfraFailure | CatalogError
  type A = String

object CatalogUseCases:

  final class LoadCatalog[TX <: TransactionContext](w: CatalogWorkflows[TX])
      extends UseCase[LoadCatalogCommand]:
    def apply(command: LoadCatalogCommand): IO[InfraFailure, Catalog] = w.load

  final class EditCatalog[TX <: TransactionContext](w: CatalogWorkflows[TX])
      extends UseCase[EditCatalogCommand]:
    def apply(command: EditCatalogCommand): IO[InfraFailure | CatalogError, Edited] =
      w.edit(command.edit)

  final class ImportKml[TX <: TransactionContext](w: CatalogWorkflows[TX])
      extends UseCase[ImportKmlCommand]:
    def apply(command: ImportKmlCommand): IO[InfraFailure | CatalogError | KmlError, ImportReport] =
      for
        read <- ZIO.fromEither(KmlReader.read(command.fileName, command.text))
        drafts = ImportOperations.categories(read.root)
        catalog <- w.insert(drafts, command.target)
      yield ImportReport(catalog, drafts.flatMap(_.routes).map(_.features.size).sum, read.warnings)

  final class ExportKml[TX <: TransactionContext](w: CatalogWorkflows[TX])
      extends UseCase[ExportKmlCommand]:
    def apply(command: ExportKmlCommand): IO[InfraFailure | CatalogError, String] =
      w.load.flatMap { catalog =>
        val nodes: Either[CatalogError, Vector[CategoryNode]] = command.scope match
          case ExportScope.WholeCatalog    => Right(catalog.categories)
          case ExportScope.OneCategory(id) =>
            catalog.categories
              .find(_.id == id)
              .map(Vector(_))
              .toRight(CatalogError.CategoryNotFound(id))
          case ExportScope.OneRoute(id) =>
            catalog.categories
              .collectFirst {
                case c if c.routes.exists(_.id == id) =>
                  c.copy(routes = c.routes.filter(_.id == id))
              }
              .map(Vector(_))
              .toRight(CatalogError.RouteNotFound(id))
        ZIO.fromEither(nodes).map(KmlWriter.write(command.documentName, _, command.onlyVisible))
      }

  def makeLayer[TX <: TransactionContext: Tag]: URLayer[
    CatalogWorkflows[TX],
    UseCase[LoadCatalogCommand] & UseCase[EditCatalogCommand] & UseCase[ImportKmlCommand] &
      UseCase[ExportKmlCommand]
  ] =
    ZLayer.fromFunction((w: CatalogWorkflows[TX]) => LoadCatalog(w): UseCase[LoadCatalogCommand]) ++
      ZLayer.fromFunction((w: CatalogWorkflows[TX]) =>
        EditCatalog(w): UseCase[EditCatalogCommand]
      ) ++
      ZLayer.fromFunction((w: CatalogWorkflows[TX]) => ImportKml(w): UseCase[ImportKmlCommand]) ++
      ZLayer.fromFunction((w: CatalogWorkflows[TX]) => ExportKml(w): UseCase[ExportKmlCommand])
end CatalogUseCases
