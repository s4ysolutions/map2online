package s4y.domain.errors

/** The one typed infrastructure error a domain workflow may expose in `E`.
  *
  * Adapters collapse their library-specific errors (IndexedDB, fetch, XML parsing, …) into this
  * before returning to the domain.
  */
final case class InfraFailure(message: String, cause: Option[Throwable] = None)

object InfraFailure:
  def apply(cause: Throwable): InfraFailure =
    InfraFailure(Option(cause.getMessage).getOrElse(cause.toString), Some(cause))
