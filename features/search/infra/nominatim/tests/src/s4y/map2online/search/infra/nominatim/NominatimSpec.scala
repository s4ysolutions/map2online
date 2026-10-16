package s4y.map2online.search.infra.nominatim

import s4y.domain.errors.InfraFailure
import s4y.http.HttpClient
import s4y.map2online.catalog.domain.vo.Coordinate
import s4y.map2online.search.domain.vo.{Bounds, SearchQuery}
import zio.*
import zio.test.*

object NominatimSpec extends ZIOSpecDefault:
  private val response =
    """[{"place_id":1,"lat":"43.2380","lon":"76.9452","name":"Алматы","display_name":"Алматы, Казахстан",
      |  "type":"city","category":"place","boundingbox":["43.03","43.41","76.74","77.17"]},
      | {"place_id":2,"lat":"oops","lon":"1","display_name":"broken"},
      | {"place_id":3,"lat":"10","lon":"20","display_name":"Somewhere, Far","type":"peak"}]""".stripMargin

  private final class FakeHttp(calls: Ref[Vector[String]]) extends HttpClient:
    def getText(url: String, headers: Map[String, String]): IO[InfraFailure, String] =
      calls.update(_ :+ url).as(response)

  def spec = suite("Nominatim")(
    test("parses names, centres and bounds; skips unusable entries") {
      val places = NominatimGateway.parse(response).toOption.get
      assertTrue(
        places.map(_.name) == Vector("Алматы", "Somewhere"),
        places.head.bounds.map(_.northEast.lon: Double) == Some(77.17),
        places(1).bounds.isEmpty,
        places(1).kind == "peak"
      )
    },
    test("a viewbox limits the search to the visible area") {
      val b = Bounds(Coordinate.from(40, 70).toOption.get, Coordinate.from(45, 80).toOption.get)
      val url = NominatimGateway.url(SearchQuery.from("Almaty", Some(b)).toOption.get, Some("ru"))
      assertTrue(
        url.contains("viewbox=70.0,45.0,80.0,40.0"),
        url.contains("bounded=1"),
        url.contains("accept-language=ru")
      )
    },
    test("identical searches hit the network once") {
      for
        calls <- Ref.make(Vector.empty[String])
        cache <- Ref.make(Map.empty[String, Vector[s4y.map2online.search.domain.vo.Place]])
        gateway = NominatimGateway(FakeHttp(calls), cache)
        q = SearchQuery.from("Almaty").toOption.get
        _ <- gateway.search(q, None)
        _ <- gateway.search(q, None)
        n <- calls.get.map(_.size)
      yield assertTrue(n == 1)
    },
    test("an empty query is rejected before any request") {
      assertTrue(SearchQuery.from("   ").isLeft)
    }
  )
