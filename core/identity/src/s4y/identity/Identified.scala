package s4y.identity

/** An entity together with the identifier storage gave it. */
final case class Identified[Id, E](id: Id, value: E):
  def as[B](b: B): Identified[Id, B] = Identified(id, b)
  def map[B](f: E => B): Identified[Id, B] = Identified(id, f(value))
