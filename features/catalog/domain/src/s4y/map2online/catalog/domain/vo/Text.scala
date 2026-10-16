package s4y.map2online.catalog.domain.vo

import zio.prelude.Newtype

/** Short name shown in the catalog tree and on the map. */
object Title extends Newtype[String]
type Title = Title.Type

/** One-line plain-text summary. */
object Summary extends Newtype[String]:
  val empty: Summary = wrap("")
type Summary = Summary.Type

/** Long description, Markdown source. */
object Markdown extends Newtype[String]:
  val empty: Markdown = wrap("")
type Markdown = Markdown.Type
