package s4y.map2online.catalog.infra.store

import s4y.identity.Identified
import s4y.identity.minting.IdentifierMint
import s4y.infra.memory.*
import s4y.kv.KeyValueStore
import s4y.map2online.catalog.domain.vo.*
import s4y.map2online.catalog.domain.workflows.ports.CatalogRepository
import s4y.tx.TransactionManager
import zio.*
import zio.test.{Summary as _, *}

object CatalogStoreSpec extends ZIOSpecDefault:
  type TX = TransactionContextMemory

  private def id[A](s: String) = IdentifierMint.fromString[A](s).toOption.get
  private def c(lat: Double, lon: Double, alt: Option[Double] = None) =
    Coordinate.from(lat, lon, alt).toOption.get

  val catalog: Catalog = Catalog(
    Vector(
      CategoryNode(
        Identified(
          id("c1"),
          Category(Title("Трип"), Summary("s"), Markdown("**md**\n\"q\""), visible = false)
        ),
        Vector(
          RouteNode(
            Identified(
              id("r1"),
              Route(Title("Day"), Summary.empty, Markdown.empty, visible = true)
            ),
            Vector(
              Identified(
                id("f1"),
                Feature.create(Title("p"), Geometry.Point(c(1.5, -2.25, Some(100))), Color.Cyan)
              ),
              Identified(
                id("f2"),
                Feature.create(
                  Title("l"),
                  Geometry.LineString
                    .from(Vector(c(0, 0), c(89.999999999, 179.123456789)))
                    .toOption
                    .get
                )
              )
            )
          )
        )
      )
    )
  )

  def spec = suite("catalog store")(
    test("JSON encoding round-trips the catalog exactly") {
      assertTrue(CatalogJson.decode(CatalogJson.encode(catalog)) == Right(catalog))
    },
    test("a catalog saved by one repository is loaded by a fresh one") {
      def fresh(store: KeyValueStore) =
        Ref
          .make(Option.empty[Catalog])
          .map(CatalogRepositoryStore[TX](store, CatalogRepositoryStore.DefaultKey, _))
      for
        store <- ZIO.service[KeyValueStore]
        tm <- ZIO.service[TransactionManager[TX]]
        first <- fresh(store)
        _ <- tm.transaction[Any, Nothing, Unit]("save")(first.save(catalog))
        second <- fresh(store)
        loaded <- tm.transaction[Any, Nothing, Catalog]("load")(second.load)
      yield assertTrue(loaded == catalog)
    },
    test("an empty store is an empty catalog") {
      for
        repo <- ZIO.service[CatalogRepository[TX]]
        tm <- ZIO.service[TransactionManager[TX]]
        loaded <- tm.transaction[Any, Nothing, Catalog]("load")(repo.load)
      yield assertTrue(loaded == Catalog.empty)
    },
    test("a corrupted document is an infrastructure failure, not a crash") {
      for
        store <- ZIO.service[KeyValueStore]
        _ <- store.put(
          CatalogRepositoryStore.DefaultKey,
          """{"version":1,"categories":[{"id":""}]}"""
        )
        repo <- ZIO.service[CatalogRepository[TX]]
        tm <- ZIO.service[TransactionManager[TX]]
        failure <- tm.transaction[Any, Nothing, Catalog]("load")(repo.load).flip
      yield assertTrue(failure.message.startsWith("stored catalog:"))
    }
  ).provideLayer(
    TransactionManagerMemory.layer ++
      (KeyValueStoreMemory.layer >+> CatalogRepositoryStore.makeLayer[TX]())
  )
