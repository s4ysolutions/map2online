package s4y.map2online.catalog.infra.store

import s4y.identity.{Identified, Identifier}
import s4y.identity.minting.IdentifierMint
import s4y.map2online.catalog.domain.vo.*
import zio.Chunk
import zio.json.*
import zio.json.ast.Json

/** The stored form of the catalog: versioned JSON with GeoJSON-style geometry (`[lon, lat, alt?]`).
  */
object CatalogJson:
  val Version = 1

  def encode(catalog: Catalog): String =
    Json
      .Obj("version" -> Json.Num(Version), "categories" -> arr(catalog.categories.map(category)))
      .toJson

  def decode(text: String): Either[String, Catalog] =
    for
      json <- text.fromJson[Json]
      o <- obj(json)
      version <- field(o, "version").flatMap(num)
      _ <- Either.cond(version.intValue == Version, (), s"unsupported catalog version $version")
      categories <- field(o, "categories").flatMap(list(_)(decodeCategory))
    yield Catalog(categories)

  // ---------------------------------------------------------------- encode

  private def arr(items: Vector[Json]) = Json.Arr(Chunk.fromIterable(items))

  private def texts(title: Title, summary: Summary, description: Markdown, visible: Boolean) =
    Vector(
      "title" -> Json.Str(Title.unwrap(title)),
      "summary" -> Json.Str(Summary.unwrap(summary)),
      "description" -> Json.Str(Markdown.unwrap(description)),
      "visible" -> Json.Bool(visible)
    )

  private def category(c: CategoryNode): Json =
    val v = c.category.value
    Json.Obj(
      Chunk.fromIterable(
        Vector("id" -> Json.Str(c.id.value)) ++ texts(
          v.title,
          v.summary,
          v.description,
          v.visible
        ) :+
          ("routes" -> arr(c.routes.map(route)))
      )
    )

  private def route(r: RouteNode): Json =
    val v = r.route.value
    Json.Obj(
      Chunk.fromIterable(
        Vector("id" -> Json.Str(r.id.value)) ++ texts(
          v.title,
          v.summary,
          v.description,
          v.visible
        ) :+
          ("features" -> arr(r.features.map(feature)))
      )
    )

  private def feature(f: Identified[FeatureId, Feature]): Json =
    val v = f.value
    Json.Obj(
      Chunk.fromIterable(
        Vector("id" -> Json.Str(f.id.value)) ++ texts(
          v.title,
          v.summary,
          v.description,
          v.visible
        ) ++ Vector(
          "color" -> Json.Str(v.color.toString),
          "geometry" -> geometry(v.geometry)
        )
      )
    )

  private def position(c: Coordinate): Json =
    arr(Vector(Json.Num(c.lon), Json.Num(c.lat)) ++ c.alt.map(Json.Num(_)).toVector)

  private def geometry(g: Geometry): Json = g match
    case Geometry.Point(c) => Json.Obj("type" -> Json.Str("Point"), "coordinates" -> position(c))
    case l: Geometry.LineString =>
      Json.Obj("type" -> Json.Str("LineString"), "coordinates" -> arr(l.coordinates.map(position)))

  // ---------------------------------------------------------------- decode

  private type R[A] = Either[String, A]

  private def obj(j: Json): R[Json.Obj] = j match
    case o: Json.Obj => Right(o)
    case other       => Left(s"expected object, got $other")

  private def field(o: Json.Obj, name: String): R[Json] =
    o.get(name).toRight(s"missing field $name")

  private def str(j: Json): R[String] = j match
    case Json.Str(s) => Right(s)
    case other       => Left(s"expected string, got $other")

  private def num(j: Json): R[java.math.BigDecimal] = j match
    case Json.Num(n) => Right(n)
    case other       => Left(s"expected number, got $other")

  private def bool(j: Json): R[Boolean] = j match
    case Json.Bool(b) => Right(b)
    case other        => Left(s"expected boolean, got $other")

  private def list[A](j: Json)(f: Json => R[A]): R[Vector[A]] = j match
    case Json.Arr(items) =>
      items.foldLeft[R[Vector[A]]](Right(Vector.empty))((acc, i) =>
        acc.flatMap(v => f(i).map(v :+ _))
      )
    case other => Left(s"expected array, got $other")

  private def id[A](o: Json.Obj): R[Identifier[A]] =
    field(o, "id").flatMap(str).flatMap(s => IdentifierMint.fromString[A](s).left.map(_.toString))

  private final case class Texts(
      title: Title,
      summary: Summary,
      description: Markdown,
      visible: Boolean
  )

  private def decodeTexts(o: Json.Obj): R[Texts] =
    for
      title <- field(o, "title").flatMap(str)
      summary <- field(o, "summary").flatMap(str)
      description <- field(o, "description").flatMap(str)
      visible <- field(o, "visible").flatMap(bool)
    yield Texts(Title(title), Summary(summary), Markdown(description), visible)

  private def decodeCategory(j: Json): R[CategoryNode] =
    for
      o <- obj(j)
      i <- id[Category](o)
      t <- decodeTexts(o)
      routes <- field(o, "routes").flatMap(list(_)(decodeRoute))
    yield CategoryNode(
      Identified(i, Category(t.title, t.summary, t.description, t.visible)),
      routes
    )

  private def decodeRoute(j: Json): R[RouteNode] =
    for
      o <- obj(j)
      i <- id[Route](o)
      t <- decodeTexts(o)
      features <- field(o, "features").flatMap(list(_)(decodeFeature))
    yield RouteNode(Identified(i, Route(t.title, t.summary, t.description, t.visible)), features)

  private def decodeFeature(j: Json): R[Identified[FeatureId, Feature]] =
    for
      o <- obj(j)
      i <- id[Feature](o)
      t <- decodeTexts(o)
      colorName <- field(o, "color").flatMap(str)
      color <- Color.values.find(_.toString == colorName).toRight(s"unknown color $colorName")
      g <- field(o, "geometry").flatMap(decodeGeometry)
    yield Identified(i, Feature(t.title, t.summary, t.description, t.visible, g, color))

  private def decodePosition(j: Json): R[Coordinate] =
    list(j)(num).flatMap {
      case Vector(lon, lat)      => coordinate(lon, lat, None)
      case Vector(lon, lat, alt) => coordinate(lon, lat, Some(alt.doubleValue))
      case other                 => Left(s"bad position $other")
    }

  private def coordinate(
      lon: java.math.BigDecimal,
      lat: java.math.BigDecimal,
      alt: Option[Double]
  ): R[Coordinate] =
    Coordinate.from(lat.doubleValue, lon.doubleValue, alt).toEither.left.map(_.mkString(", "))

  private def decodeGeometry(j: Json): R[Geometry] =
    for
      o <- obj(j)
      kind <- field(o, "type").flatMap(str)
      coords <- field(o, "coordinates")
      g <- kind match
        case "Point"      => decodePosition(coords).map(Geometry.Point(_))
        case "LineString" =>
          list(coords)(decodePosition).flatMap(cs =>
            Geometry.LineString.from(cs).left.map(_.toString)
          )
        case other => Left(s"unknown geometry $other")
    yield g
end CatalogJson
