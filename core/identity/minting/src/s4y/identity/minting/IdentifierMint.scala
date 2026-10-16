package s4y.identity.minting

import s4y.identity.Identifier

/** The only way to construct an [[Identifier]]: for repositories wrapping the value they generated
  * or loaded, and for parsers reading one from a file or a URL.
  */
object IdentifierMint:
  def fromString[A](raw: String): Either[InvalidIdentifier, Identifier[A]] =
    if raw.trim.isEmpty then Left(InvalidIdentifier(raw))
    else Right(Identifier.unsafe[A](raw))

final case class InvalidIdentifier(raw: String)
