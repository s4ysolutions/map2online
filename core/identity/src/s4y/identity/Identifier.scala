package s4y.identity

/** Opaque pointer to an `A` persisted somewhere.
  *
  * Domain code may carry, store and compare identifiers but cannot construct one: the constructor
  * is reachable only from `s4y.identity.minting`, which only infra, presentation and tests depend
  * on. Use sites name an alias (`type RouteId = Identifier[Route]`), never `Identifier[X]`
  * directly.
  */
final class Identifier[A] private[identity] (val value: String):
  override def equals(that: Any): Boolean = that match
    case other: Identifier[?] => value == other.value
    case _                    => false

  override def hashCode: Int = value.hashCode

  override def toString: String = s"Identifier($value)"

object Identifier:
  private[identity] def unsafe[A](value: String): Identifier[A] = new Identifier(value)
