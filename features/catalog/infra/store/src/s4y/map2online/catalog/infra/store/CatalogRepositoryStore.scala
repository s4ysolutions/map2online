package s4y.map2online.catalog.infra.store

import s4y.domain.errors.InfraFailure
import s4y.kv.KeyValueStore
import s4y.map2online.catalog.domain.vo.Catalog
import s4y.map2online.catalog.domain.workflows.ports.CatalogRepository
import s4y.tx.TransactionContext
import zio.*

/** Keeps the whole catalog as one JSON document in a [[KeyValueStore]], with an in-memory copy so
  * loads after the first cost nothing. The transaction manager serialises callers; each save is one
  * atomic put.
  */
final class CatalogRepositoryStore[TX <: TransactionContext](
    store: KeyValueStore,
    key: String,
    cache: Ref[Option[Catalog]]
) extends CatalogRepository[TX]:

  def load(using TX): IO[InfraFailure, Catalog] =
    cache.get.flatMap {
      case Some(c) => ZIO.succeed(c)
      case None    =>
        store
          .get(key)
          .flatMap {
            case None       => ZIO.succeed(Catalog.empty)
            case Some(text) =>
              ZIO
                .fromEither(CatalogJson.decode(text))
                .mapError(e => InfraFailure(s"stored catalog: $e"))
          }
          .tap(c => cache.set(Some(c)))
    }

  def save(catalog: Catalog)(using TX): IO[InfraFailure, Unit] =
    store.put(key, CatalogJson.encode(catalog)) *> cache.set(Some(catalog))

object CatalogRepositoryStore:
  val DefaultKey = "catalog"

  def makeLayer[TX <: TransactionContext: Tag](
      key: String = DefaultKey
  ): URLayer[KeyValueStore, CatalogRepository[TX]] =
    ZLayer.fromZIO(
      for
        store <- ZIO.service[KeyValueStore]
        cache <- Ref.make(Option.empty[Catalog])
      yield CatalogRepositoryStore[TX](store, key, cache)
    )
