package s4y.map2online.catalog.domain.workflows.ports

import s4y.domain.errors.InfraFailure
import s4y.map2online.catalog.domain.vo.Catalog
import s4y.tx.TransactionContext
import zio.IO

/** The catalog is one aggregate, loaded and saved whole. */
trait CatalogRepository[TX <: TransactionContext]:
  def load(using TX): IO[InfraFailure, Catalog]
  def save(catalog: Catalog)(using TX): IO[InfraFailure, Unit]
