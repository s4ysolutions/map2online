package s4y.map2online.search.domain.vo

import s4y.map2online.catalog.domain.vo.Coordinate

/** A box on the map, south-west and north-east corners. */
final case class Bounds(southWest: Coordinate, northEast: Coordinate)

/** A geocoding result. */
final case class Place(
    name: String,
    description: String,
    center: Coordinate,
    bounds: Option[Bounds],
    kind: String
)

/** Text to look up: trimmed, never empty. */
final case class SearchQuery private (text: String, within: Option[Bounds])

object SearchQuery:
  def from(text: String, within: Option[Bounds] = None): Either[SearchError, SearchQuery] =
    val t = text.trim
    if t.isEmpty then Left(SearchError.EmptyQuery) else Right(new SearchQuery(t, within))

enum SearchError:
  case EmptyQuery
