package s4y.map2online.basemap.app

import s4y.app.UseCase
import s4y.domain.errors.InfraFailure
import s4y.kv.KeyValueStore
import s4y.map2online.basemap.domain.vo.*
import s4y.map2online.catalog.domain.vo.Coordinate
import zio.*

final case class LoadBaseMapCommand() extends s4y.app.zio.UseCaseCommand:
  type E = InfraFailure
  type A = Option[BaseMapSettings]

final case class SaveBaseMapCommand(settings: BaseMapSettings) extends s4y.app.zio.UseCaseCommand:
  type E = InfraFailure
  type A = Unit

/** The chosen base map and view, kept as a preference across visits. */
object BaseMapUseCases:
  val Key = "basemap"

  /** `id;lat;lon;zoom`; unreadable values count as "nothing saved". */
  def encode(s: BaseMapSettings): String =
    s"${MapSourceId.unwrap(s.source)};${s.view.center.lat};${s.view.center.lon};${s.view.zoom}"

  def decode(text: String): Option[BaseMapSettings] =
    text.split(";").toList match
      case id :: lat :: lon :: zoom :: Nil =>
        for
          la <- lat.toDoubleOption
          lo <- lon.toDoubleOption
          z <- zoom.toDoubleOption
          c <- Coordinate.from(la, lo).toOption
          zz <- Zoom.make(z).toOption
        yield BaseMapSettings(MapSourceId(id), MapView(c, zz))
      case _ => None

  final class Load(store: KeyValueStore) extends UseCase[LoadBaseMapCommand]:
    def apply(command: LoadBaseMapCommand): IO[InfraFailure, Option[BaseMapSettings]] =
      store.get(Key).map(_.flatMap(decode))

  final class Save(store: KeyValueStore) extends UseCase[SaveBaseMapCommand]:
    def apply(command: SaveBaseMapCommand): IO[InfraFailure, Unit] =
      store.put(Key, encode(command.settings))

  val layer: URLayer[KeyValueStore, UseCase[LoadBaseMapCommand] & UseCase[SaveBaseMapCommand]] =
    ZLayer.fromFunction((s: KeyValueStore) => Load(s): UseCase[LoadBaseMapCommand]) ++
      ZLayer.fromFunction((s: KeyValueStore) => Save(s): UseCase[SaveBaseMapCommand])
