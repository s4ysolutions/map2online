package s4y.kv

import s4y.domain.errors.InfraFailure
import zio.IO

/** Port for persisting string documents by key: the catalog in IndexedDB, UI preferences in
  * localStorage, a map in tests.
  */
trait KeyValueStore:
  def get(key: String): IO[InfraFailure, Option[String]]
  def put(key: String, value: String): IO[InfraFailure, Unit]
  def remove(key: String): IO[InfraFailure, Unit]
