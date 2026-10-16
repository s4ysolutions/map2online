package s4y.map2online.web

import com.raquo.laminar.api.L.*
import org.scalajs.dom
import s4y.app.UseCase
import s4y.app.zio.UseCase.useCase
import s4y.domain.errors.InfraFailure
import s4y.infra.browser.{KeyValueStoreIndexedDb, KeyValueStoreLocalStorage}
import s4y.infra.memory.{IdGeneratorRandom, TransactionContextMemory, TransactionManagerMemory}
import s4y.map2online.basemap.app.{BaseMapUseCases, LoadBaseMapCommand, SaveBaseMapCommand}
import s4y.map2online.catalog.app.*
import s4y.map2online.catalog.domain.workflows.CatalogWorkflows
import s4y.map2online.catalog.infra.store.CatalogRepositoryStore
import zio.{Runtime, Scope, Unsafe, ZEnvironment, ZLayer}

import scala.concurrent.ExecutionContext
import scala.scalajs.concurrent.JSExecutionContext
import scala.util.{Failure, Success}

/** Composition root of the browser application: the only place that names concrete adapters.
  */
object Main:
  /** Catalog writes are serialised in memory; IndexedDB holds the document. */
  type TX = TransactionContextMemory

  type Services = UseCase[LoadBaseMapCommand] & UseCase[SaveBaseMapCommand] &
    UseCase[LoadCatalogCommand] & UseCase[EditCatalogCommand] & UseCase[ImportKmlCommand] &
    UseCase[ExportKmlCommand]

  private val services: ZLayer[Any, InfraFailure, Services] =
    val preferences = KeyValueStoreLocalStorage.makeLayer("map2online.")
    val documents = KeyValueStoreIndexedDb.makeLayer("map2online", "documents")
    val baseMap = preferences >>> BaseMapUseCases.layer
    val catalog =
      (TransactionManagerMemory.layer ++ IdGeneratorRandom.layer ++
        (documents >>> CatalogRepositoryStore.makeLayer[TX]())) >>>
        CatalogWorkflows.makeLayer[TX] >>> CatalogUseCases.makeLayer[TX]
    baseMap ++ catalog

  def main(args: Array[String]): Unit =
    given ExecutionContext = JSExecutionContext.queue
    val boot =
      for
        scope <- Scope.make
        runtime <- services.toRuntime.provideEnvironment(ZEnvironment(scope))
        settings <- useCase(LoadBaseMapCommand())
          .provideEnvironment(runtime.environment)
          .orElseSucceed(None)
      yield (runtime, settings)
    val bootOrThrow = boot.mapError(e => RuntimeException(e.message))
    Unsafe.unsafe { implicit u =>
      Runtime.default.unsafe.runToFuture(bootOrThrow).onComplete {
        case Success((runtime, settings)) =>
          given Runtime[Services] = runtime
          render(dom.document.getElementById("app"), App(settings))
        case Failure(e) =>
          render(
            dom.document.getElementById("app"),
            div(cls := "fatal", h1("Map2Online cannot start"), p(e.getMessage))
          )
      }
    }
end Main
