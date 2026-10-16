package s4y.tx

import s4y.domain.errors.InfraFailure
import zio.ZIO

/** Marker for whatever an adapter needs to act inside one transaction. */
trait TransactionContext

/** Runs `effect` as one atomic unit: no other transaction on the same manager interleaves with it.
  */
trait TransactionManager[TX <: TransactionContext]:
  def transaction[R, E, A](log: String)(
      effect: TX ?=> ZIO[R, InfraFailure | E, A]
  ): ZIO[R, InfraFailure | E, A]
