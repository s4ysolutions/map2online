package s4y.map2online.catalog.presentation

import com.raquo.laminar.api.L.*
import s4y.app.UseCase
import s4y.app.zio.UseCase.useCase
import s4y.domain.errors.InfraFailure
import s4y.identity.minting.IdentifierMint
import s4y.identity.{Identified, Identifier}
import s4y.map2online.catalog.app.*
import s4y.map2online.catalog.domain.operations.CatalogOperations
import s4y.map2online.catalog.domain.vo.*
import s4y.map2online.catalog.domain.workflows.{CatalogEdit, Edited}
import s4y.map2online.kml.domain.vo.KmlError
import s4y.preferences.{LoadPreferenceCommand, SavePreferenceCommand}
import s4y.presentation.laminar.ZioBridge
import zio.Runtime

type CatalogServices = UseCase[LoadCatalogCommand] & UseCase[EditCatalogCommand] &
  UseCase[ImportKmlCommand] & UseCase[ExportKmlCommand] & UseCase[LoadPreferenceCommand] &
  UseCase[SavePreferenceCommand]

/** Titles for categories and routes the app creates by itself (when the user draws with nothing to
  * draw into). Personalised wording plugs in here.
  */
trait Naming:
  def newCategory: String
  def newRoute: String

/** The catalog as UI state: the frontend boundary object over the catalog use cases. Every change
  * goes through a use case and the returned catalog replaces the shown one.
  */
final class CatalogState(naming: Naming)(using Runtime[CatalogServices]):
  private val catalogVar = Var(Catalog.empty)
  private val loadedVar = Var(false)
  private val errorVar = Var(Option.empty[String])

  val catalog: StrictSignal[Catalog] = catalogVar.signal
  val loaded: StrictSignal[Boolean] = loadedVar.signal
  val error: StrictSignal[Option[String]] = errorVar.signal
  val visibleFeatures: Signal[Vector[Identified[FeatureId, Feature]]] =
    catalog.map(CatalogOperations.visibleFeatures)

  /** Where drawn features go. */
  val activeRoute: Var[Option[RouteId]] = Var(None)

  /** Highlighted on the map and in the tree. */
  val selectedFeature: Var[Option[FeatureId]] = Var(None)

  /** Opened in the feature editor. */
  val editedFeature: Var[Option[FeatureId]] = Var(None)

  private val activeRouteKey = "catalog.activeRoute"

  def dismissError(): Unit = errorVar.set(None)

  def load(): Unit =
    ZioBridge.run(
      (useCase(LoadCatalogCommand()) <*> useCase(LoadPreferenceCommand(activeRouteKey))
        .orElseSucceed(None)).fold(
        e => report(e),
        (c, active) =>
          catalogVar.set(c)
          activeRoute.set(active.flatMap(IdentifierMint.fromString[Route](_).toOption))
          loadedVar.set(true)
      )
    )

  def edit(e: CatalogEdit)(onDone: Edited => Unit = _ => ()): Unit =
    ZioBridge.run(
      useCase(EditCatalogCommand(e)).fold(
        report,
        edited =>
          catalogVar.set(edited.catalog)
          onDone(edited)
      )
    )

  def setActiveRoute(id: Option[RouteId]): Unit =
    activeRoute.set(id)
    ZioBridge.run(useCase(SavePreferenceCommand(activeRouteKey, id.map(_.value))).ignore)

  /** The route drawing goes into: the active one, else the last route. */
  def targetRoute: Option[RouteId] =
    val c = catalogVar.now()
    activeRoute
      .now()
      .filter(CatalogOperations.route(c, _).isDefined)
      .orElse(c.categories.reverseIterator.flatMap(_.routes.lastOption).nextOption().map(_.id))

  /** Adds into [[targetRoute]], creating a category and a route first when the catalog has none.
    */
  def addFeature(feature: Feature)(onDone: FeatureId => Unit = _ => ()): Unit =
    def into(route: RouteId): Unit =
      if !activeRoute.now().contains(route) then setActiveRoute(Some(route))
      edit(CatalogEdit.AddFeature(route, feature))(e => created[Feature](e).foreach(onDone))
    def inCategory(category: CategoryId): Unit =
      edit(CatalogEdit.AddRoute(category, Route.create(Title(naming.newRoute))))(e =>
        created[Route](e).foreach(into)
      )
    targetRoute match
      case Some(route) => into(route)
      case None        =>
        catalogVar.now().categories.lastOption match
          case Some(c) => inCategory(c.id)
          case None    =>
            edit(CatalogEdit.AddCategory(Category.create(Title(naming.newCategory))))(e =>
              created[Category](e).foreach(inCategory)
            )

  def importKml(fileName: String, text: String, target: InsertTarget)(
      onDone: ImportReport => Unit
  ): Unit =
    ZioBridge.run(
      useCase(ImportKmlCommand(fileName, text, target)).fold(
        report,
        r =>
          catalogVar.set(r.catalog)
          onDone(r)
      )
    )

  def exportKml(documentName: String, scope: ExportScope, onlyVisible: Boolean)(
      onDone: String => Unit
  ): Unit =
    ZioBridge.run(useCase(ExportKmlCommand(documentName, scope, onlyVisible)).fold(report, onDone))

  /** The id an addition created; the edit decides its type. */
  private def created[A](e: Edited): Option[Identifier[A]] =
    e.created.map(_.asInstanceOf[Identifier[A]])

  private def report(e: InfraFailure | CatalogError | KmlError): Unit =
    errorVar.set(Some(CatalogState.describe(e)))
end CatalogState

object CatalogState:
  def describe(e: InfraFailure | CatalogError | KmlError): String = e match
    case f: InfraFailure                       => s"Storage problem: ${f.message}"
    case CatalogError.PositionOutOfRange(_, _) => "That position does not exist."
    case CatalogError.DuplicateId(_)           => "That item already exists."
    case _: CatalogError                       => "That item no longer exists."
    case KmlError.Malformed(msg, offset)       => s"The file is not valid KML ($msg at $offset)."
