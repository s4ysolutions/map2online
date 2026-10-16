package s4y.map2online.search.infra.nominatim

import s4y.domain.errors.InfraFailure
import s4y.http.HttpClient
import s4y.map2online.catalog.domain.vo.Coordinate
import s4y.map2online.search.domain.vo.{Bounds, Place, SearchQuery}
import s4y.map2online.search.domain.workflows.ports.GeocodingGateway
import zio.*
import zio.json.*
import zio.json.ast.Json

/** OpenStreetMap Nominatim. Results are cached per URL: the usage policy asks clients not to repeat
  * identical requests.
  */
final class NominatimGateway(http: HttpClient, cache: Ref[Map[String, Vector[Place]]])
    extends GeocodingGateway:

  def search(query: SearchQuery, language: Option[String]): IO[InfraFailure, Vector[Place]] =
    val url = NominatimGateway.url(query, language)
    cache.get.map(_.get(url)).flatMap {
      case Some(places) => ZIO.succeed(places)
      case None         =>
        http
          .getText(url, language.map(l => "Accept-Language" -> l).toMap)
          .flatMap(text =>
            ZIO
              .fromEither(NominatimGateway.parse(text))
              .mapError(e => InfraFailure(s"Nominatim: $e"))
          )
          .tap(places => cache.update(_.updated(url, places)))
    }

object NominatimGateway:
  val Endpoint = "https://nominatim.openstreetmap.org/search"

  def url(query: SearchQuery, language: Option[String]): String =
    val enc = (s: String) => java.net.URLEncoder.encode(s, "UTF-8")
    val area = query.within.fold("") { b =>
      s"&viewbox=${b.southWest.lon},${b.northEast.lat},${b.northEast.lon},${b.southWest.lat}&bounded=1"
    }
    val lang = language.fold("")(l => s"&accept-language=${enc(l)}")
    s"$Endpoint?q=${enc(query.text)}&format=jsonv2&limit=10$area$lang"

  /** jsonv2 results; entries without a usable position are skipped. */
  def parse(text: String): Either[String, Vector[Place]] =
    text.fromJson[Json].flatMap {
      case Json.Arr(items) => Right(items.toVector.flatMap(place))
      case other           => Left(s"expected an array, got ${other.toString.take(80)}")
    }

  private def place(j: Json): Option[Place] = j match
    case o: Json.Obj =>
      def str(name: String) = o.get(name).collect { case Json.Str(s) => s }
      def num(name: String) = str(name).flatMap(_.toDoubleOption)
      for
        lat <- num("lat")
        lon <- num("lon")
        center <- Coordinate.from(lat, lon).toOption
      yield
        val display = str("display_name").getOrElse("")
        val name = str("name").filter(_.nonEmpty).getOrElse(display.takeWhile(_ != ','))
        val bounds = o.get("boundingbox").collect { case Json.Arr(bb) => bb.toVector }.flatMap {
          case Vector(Json.Str(s), Json.Str(n), Json.Str(w), Json.Str(e)) =>
            for
              south <- s.toDoubleOption
              north <- n.toDoubleOption
              west <- w.toDoubleOption
              east <- e.toDoubleOption
              sw <- Coordinate.from(south, west).toOption
              ne <- Coordinate.from(north, east).toOption
            yield Bounds(sw, ne)
          case _ => None
        }
        Place(name, display, center, bounds, str("type").orElse(str("category")).getOrElse(""))
    case _ => None

  val layer: URLayer[HttpClient, GeocodingGateway] =
    ZLayer.fromZIO(
      for
        http <- ZIO.service[HttpClient]
        cache <- Ref.make(Map.empty[String, Vector[Place]])
      yield NominatimGateway(http, cache)
    )
end NominatimGateway
