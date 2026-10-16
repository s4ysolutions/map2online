package s4y.http

import s4y.domain.errors.InfraFailure
import zio.IO

/** Port for plain HTTP GETs of text (JSON) from public services. */
trait HttpClient:
  def getText(url: String, headers: Map[String, String] = Map.empty): IO[InfraFailure, String]
