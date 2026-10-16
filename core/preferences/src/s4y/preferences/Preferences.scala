package s4y.preferences

import s4y.app.UseCase
import s4y.domain.errors.InfraFailure
import s4y.kv.KeyValueStore
import zio.*

/** Small UI preferences (active route, tool, colour, open tree nodes): plain strings by key, kept
  * between visits.
  */
final case class LoadPreferenceCommand(key: String) extends s4y.app.zio.UseCaseCommand:
  type E = InfraFailure
  type A = Option[String]

final case class SavePreferenceCommand(key: String, value: Option[String])
    extends s4y.app.zio.UseCaseCommand:
  type E = InfraFailure
  type A = Unit

object PreferencesUseCases:
  private val prefix = "pref."

  final class Load(store: KeyValueStore) extends UseCase[LoadPreferenceCommand]:
    def apply(command: LoadPreferenceCommand): IO[InfraFailure, Option[String]] =
      store.get(prefix + command.key)

  final class Save(store: KeyValueStore) extends UseCase[SavePreferenceCommand]:
    def apply(command: SavePreferenceCommand): IO[InfraFailure, Unit] =
      command.value.fold(store.remove(prefix + command.key))(store.put(prefix + command.key, _))

  val layer
      : URLayer[KeyValueStore, UseCase[LoadPreferenceCommand] & UseCase[SavePreferenceCommand]] =
    ZLayer.fromFunction((s: KeyValueStore) => Load(s): UseCase[LoadPreferenceCommand]) ++
      ZLayer.fromFunction((s: KeyValueStore) => Save(s): UseCase[SavePreferenceCommand])
