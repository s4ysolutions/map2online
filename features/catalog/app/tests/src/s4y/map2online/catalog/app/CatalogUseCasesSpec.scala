package s4y.map2online.catalog.app

import s4y.app.zio.UseCase.useCase
import s4y.infra.memory.*
import s4y.map2online.catalog.domain.vo.*
import s4y.map2online.catalog.domain.workflows.CatalogWorkflows
import s4y.map2online.catalog.infra.store.CatalogRepositoryStore
import s4y.map2online.kml.domain.vo.KmlWarning
import zio.*
import zio.test.{Summary as _, *}

object CatalogUseCasesSpec extends ZIOSpecDefault:
  type TX = TransactionContextMemory

  private val kml =
    """<kml><Document><Folder><name>Trip</name>
      |  <Folder><name>Day 1</name>
      |    <Placemark><name>A</name><Point><coordinates>10,20</coordinates></Point></Placemark>
      |    <Placemark><name>broken</name></Placemark>
      |  </Folder>
      |  <Folder><name>Day 2</name>
      |    <Placemark><name>B</name><LineString><coordinates>10,20 11,21</coordinates></LineString></Placemark>
      |  </Folder>
      |</Folder></Document></kml>""".stripMargin

  def spec = suite("catalog use cases")(
    test("importing KML reports what was imported and skipped") {
      for report <- useCase(ImportKmlCommand("trip.kml", kml, InsertTarget.IntoCatalog))
      yield assertTrue(
        report.imported == 2,
        report.warnings == Vector(KmlWarning.NoGeometry("broken")),
        report.catalog.categories.map(c => Title.unwrap(c.category.value.title)) == Vector("Trip")
      )
    },
    test("export of one route contains only that route") {
      for
        report <- useCase(ImportKmlCommand("trip.kml", kml, InsertTarget.IntoCatalog))
        day2 = report.catalog.categories.head.routes(1)
        text <- useCase(
          ExportKmlCommand("export", ExportScope.OneRoute(day2.id), onlyVisible = false)
        )
      yield assertTrue(text.contains("Day 2"), !text.contains("Day 1"))
    },
    test("exporting an unknown category is a typed error") {
      val unknown = s4y.identity.minting.IdentifierMint.fromString[Category]("nope").toOption.get
      for error <- useCase(
          ExportKmlCommand("export", ExportScope.OneCategory(unknown), onlyVisible = false)
        ).flip
      yield assertTrue(error == CatalogError.CategoryNotFound(unknown))
    },
    test("malformed KML is a KML error") {
      for error <- useCase(
          ImportKmlCommand("bad.kml", "<kml><![CDATA[", InsertTarget.IntoCatalog)
        ).flip
      yield assertTrue(error.isInstanceOf[s4y.map2online.kml.domain.vo.KmlError])
    }
  ).provideLayer(
    (TransactionManagerMemory.layer ++ IdGeneratorRandom.layer ++
      (KeyValueStoreMemory.layer >>> CatalogRepositoryStore.makeLayer[TX]())) >>>
      CatalogWorkflows.makeLayer[TX] >>> CatalogUseCases.makeLayer[TX]
  )
