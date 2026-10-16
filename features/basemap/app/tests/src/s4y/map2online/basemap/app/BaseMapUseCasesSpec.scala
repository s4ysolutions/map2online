package s4y.map2online.basemap.app

import s4y.app.zio.UseCase.useCase
import s4y.infra.memory.KeyValueStoreMemory
import s4y.kv.KeyValueStore
import s4y.map2online.basemap.domain.vo.*
import s4y.map2online.catalog.domain.vo.Coordinate
import zio.*
import zio.test.*

object BaseMapUseCasesSpec extends ZIOSpecDefault:
  private val settings =
    BaseMapSettings(
      MapSourceId("google-satellite"),
      MapView(Coordinate.from(43.25, 76.95).toOption.get, Zoom(12.5))
    )

  def spec = suite("base map preferences")(
    test("saved settings load back") {
      for
        _ <- useCase(SaveBaseMapCommand(settings))
        loaded <- useCase(LoadBaseMapCommand())
      yield assertTrue(loaded == Some(settings))
    },
    test("nothing saved is None") {
      for loaded <- useCase(LoadBaseMapCommand())
      yield assertTrue(loaded.isEmpty)
    },
    test("an unreadable value is ignored") {
      for
        _ <- ZIO.serviceWithZIO[KeyValueStore](_.put(BaseMapUseCases.Key, "osm;95;0;3"))
        loaded <- useCase(LoadBaseMapCommand())
      yield assertTrue(loaded.isEmpty)
    }
  ).provideLayer(KeyValueStoreMemory.layer >+> BaseMapUseCases.layer)
