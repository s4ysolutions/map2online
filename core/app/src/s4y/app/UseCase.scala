package s4y.app

/** A plain description of intent; the response type travels with it. */
trait UseCaseCommand:
  type Response

/** Handler for one command type. Presentation depends only on this abstraction, never on the
  * concrete implementation.
  */
trait UseCase[T <: UseCaseCommand]:
  def apply(command: T): command.Response
