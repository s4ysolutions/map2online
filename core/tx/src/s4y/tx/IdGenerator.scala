package s4y.tx

import s4y.identity.Identifier
import zio.UIO

/** Port for minting fresh identifiers when the app creates entities itself (the browser is the
  * store, so there is no database sequence).
  */
trait IdGenerator:
  def next[A]: UIO[Identifier[A]]
