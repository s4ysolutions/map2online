package s4y.map2online.search.domain.workflows.ports

import s4y.domain.errors.InfraFailure
import s4y.map2online.search.domain.vo.{Place, SearchQuery}
import zio.IO

/** Finds places by name. `language` is a BCP 47 tag for result names. */
trait GeocodingGateway:
  def search(query: SearchQuery, language: Option[String]): IO[InfraFailure, Vector[Place]]
