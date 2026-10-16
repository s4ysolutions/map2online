package s4y.map2online.catalog.domain.workflows

import s4y.infra.memory.*
import s4y.map2online.catalog.domain.operations.CatalogOperations
import s4y.map2online.catalog.domain.vo.*
import s4y.map2online.catalog.infra.store.CatalogRepositoryStore
import zio.*
import zio.test.*

object CatalogWorkflowsSpec extends ZIOSpecDefault:
  type TX = TransactionContextMemory

  private val point = Geometry.Point(Coordinate.from(10, 20).toOption.get)

  private def created[A](e: Edited) = e.created.get.asInstanceOf[s4y.identity.Identifier[A]]

  def spec = suite("CatalogWorkflows")(
    test("additions get fresh ids and persist") {
      for
        w <- ZIO.service[CatalogWorkflows[TX]]
        c <- w.edit(CatalogEdit.AddCategory(Category.create(Title("Trip"))))
        r <- w.edit(CatalogEdit.AddRoute(created[Category](c), Route.create(Title("Day 1"))))
        f <- w.edit(CatalogEdit.AddFeature(created[Route](r), Feature.create(Title("Camp"), point)))
        loaded <- w.load
      yield assertTrue(
        CatalogOperations.feature(loaded, created[Feature](f)).map(_.value.title) == Some(
          Title("Camp")
        ),
        loaded == f.catalog
      )
    },
    test("a failing edit changes nothing") {
      for
        w <- ZIO.service[CatalogWorkflows[TX]]
        _ <- w.edit(CatalogEdit.AddCategory(Category.create(Title("A"))))
        before <- w.load
        error <- w.edit(CatalogEdit.ReorderCategories(0, 5)).flip
        after <- w.load
      yield assertTrue(error == CatalogError.PositionOutOfRange(5, 1), before == after)
    },
    test("drafts insert at each level") {
      val drafts = Vector(
        CategoryDraft(
          Category.create(Title("K")),
          Vector(
            RouteDraft(Route.create(Title("R1")), Vector(Feature.create(Title("a"), point))),
            RouteDraft(
              Route.create(Title("R2")),
              Vector(Feature.create(Title("b"), point), Feature.create(Title("c"), point))
            )
          )
        )
      )
      for
        w <- ZIO.service[CatalogWorkflows[TX]]
        intoCatalog <- w.insert(drafts, InsertTarget.IntoCatalog)
        category = intoCatalog.categories.head
        intoCategory <- w.insert(drafts, InsertTarget.IntoCategory(category.id))
        route = intoCategory.categories.head.routes.head
        intoRoute <- w.insert(drafts, InsertTarget.IntoRoute(route.id))
      yield assertTrue(
        intoCatalog.categories.map(_.routes.size) == Vector(2),
        intoCategory.categories.head.routes.size == 4,
        intoRoute.categories.head.routes.head.features.map(_.value.title) ==
          Vector("a", "a", "b", "c").map(Title(_)),
        CatalogOperations.visibleFeatures(intoRoute).map(_.id).distinct.size == 9
      )
    }
  ).provideLayer(
    (TransactionManagerMemory.layer ++ IdGeneratorRandom.layer ++
      (KeyValueStoreMemory.layer >>> CatalogRepositoryStore.makeLayer[TX]())) >>>
      CatalogWorkflows.makeLayer[TX]
  )
