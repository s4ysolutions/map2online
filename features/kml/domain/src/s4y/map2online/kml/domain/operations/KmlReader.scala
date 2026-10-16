package s4y.map2online.kml.domain.operations

import s4y.map2online.catalog.domain.vo.*
import s4y.map2online.kml.domain.vo.*
import s4y.markup.{HtmlToMarkdown, Xml, XmlNode}
import s4y.markup.XmlNode.*

/** Reads KML text into a [[KmlFolder]] tree. Lenient: malformed placemarks become warnings, and
  * only unreadable markup fails the whole file.
  */
object KmlReader:

  /** ExtendedData field holding the Markdown source on Map2Online exports. */
  val MarkdownData = "map2_markdown"

  private final case class StyleColors(icon: Option[Color], line: Option[Color])

  def read(fileName: String, text: String): Either[KmlError, KmlRead] =
    Xml.parse(text) match
      case Left(e)    => Left(KmlError.Malformed(e.message, e.offset))
      case Right(doc) =>
        val all = descendants(doc).toVector
        val styles = all.collect {
          case e if e.is("style") && e.attribute("id").isDefined =>
            e.attribute("id").get -> styleColors(e)
        }.toMap
        val styleMaps = all.collect {
          case e if e.is("stylemap") && e.attribute("id").isDefined =>
            val normal = e
              .childrenNamed("pair")
              .find(_.child("key").exists(_.text.trim == "normal"))
              .flatMap(_.child("styleurl"))
              .map(u => stripHash(u.text))
            e.attribute("id").get -> normal
        }.toMap
        val warnings = Vector.newBuilder[KmlWarning]
        val ctx = Context(styles, styleMaps, warnings)
        val top = doc.child("kml").getOrElse(doc)
        val root = folder(top, ctx).copy(name = fileName)
        Right(KmlRead(root, warnings.result()))

  private final class Context(
      val styles: Map[String, StyleColors],
      val styleMaps: Map[String, Option[String]],
      val warnings: scala.collection.mutable.Builder[KmlWarning, Vector[KmlWarning]]
  )

  private def descendants(e: Element): Iterator[Element] =
    e.elements.iterator.flatMap(c => Iterator.single(c) ++ descendants(c))

  private def stripHash(s: String): String =
    val t = s.trim
    val i = t.indexOf('#')
    if i >= 0 then t.substring(i + 1) else t

  private def folder(e: Element, ctx: Context): KmlFolder =
    val placemarks = Vector.newBuilder[KmlPlacemark]
    val folders = Vector.newBuilder[KmlFolder]
    e.elements.foreach { c =>
      if c.is("document") || c.is("folder") then folders += folder(c, ctx)
      else if c.is("placemark") then placemark(c, ctx).foreach(placemarks += _)
    }
    KmlFolder(
      name = name(e),
      description = description(e),
      visible = visible(e),
      placemarks = placemarks.result(),
      folders = folders.result()
    )

  private def name(e: Element): String =
    e.child("name")
      .map(_.text.trim)
      .filter(_.nonEmpty)
      .orElse(e.attribute("name").map(_.trim))
      .getOrElse("")

  private def visible(e: Element): Boolean =
    e.child("visibility").map(_.text.trim.toLowerCase).forall(v => v != "0" && v != "false")

  private def description(e: Element): Markdown =
    val fromData = e
      .child("extendeddata")
      .flatMap(_.childrenNamed("data").find(_.attribute("name").contains(MarkdownData)))
      .flatMap(_.child("value"))
      .map(_.text.trim)
    Markdown.wrap(
      fromData.getOrElse(e.child("description").fold("")(d => HtmlToMarkdown.convert(d.innerHtml)))
    )

  private def placemark(e: Element, ctx: Context): Option[KmlPlacemark] =
    val title = name(e)
    geometry(e, title, ctx).map { g =>
      KmlPlacemark(title, description(e), visible(e), g, color(e, g, ctx))
    }

  private def geometry(e: Element, title: String, ctx: Context): Option[Geometry] =
    e.find(c => c.is("point") || c.is("linestring") || c.is("linearring") || c.is("polygon")) match
      case None =>
        ctx.warnings += KmlWarning.NoGeometry(title)
        None
      case Some(g) =>
        val coordinatesElement =
          if g.is("polygon") then
            g.child("outerboundaryis")
              .flatMap(_.find(_.is("coordinates")))
              .orElse(g.find(_.is("coordinates")))
          else g.find(_.is("coordinates"))
        val text = coordinatesElement.fold("")(_.text)
        coordinates(text) match
          case None =>
            ctx.warnings += KmlWarning.UnparsableCoordinates(title, text.trim.take(80))
            None
          case Some(Vector()) =>
            ctx.warnings += KmlWarning.NoGeometry(title)
            None
          case Some(raw) =>
            val validated = raw.map((lon, lat, alt) => Coordinate.from(lat, lon, alt).toEither)
            val errors = validated.collect { case Left(es) => es.toVector }.flatten
            if errors.nonEmpty then
              ctx.warnings += KmlWarning.InvalidGeometry(title, errors)
              None
            else
              val cs = validated.collect { case Right(c) => c }
              if g.is("point") || cs.size == 1 then Some(Geometry.Point(cs.head))
              else
                Geometry.LineString.from(cs) match
                  case Right(l)  => Some(l)
                  case Left(err) =>
                    ctx.warnings += KmlWarning.InvalidGeometry(title, Vector(err))
                    None

  /** `lon,lat[,alt]` tuples separated by whitespace. */
  private[operations] def coordinates(
      text: String
  ): Option[Vector[(Double, Double, Option[Double])]] =
    val tuples = text.trim.split("\\s+").toVector.filter(_.nonEmpty)
    val parsed = tuples.map { t =>
      t.split(",").toVector.map(_.trim.toDoubleOption) match
        case Vector(Some(lon), Some(lat))            => Some((lon, lat, None))
        case Vector(Some(lon), Some(lat), Some(alt)) => Some((lon, lat, Option.when(alt != 0)(alt)))
        case _                                       => None
    }
    Option.when(parsed.forall(_.isDefined))(parsed.flatten)

  private def styleColors(style: Element): StyleColors =
    def colorOf(name: String) =
      style.child(name).flatMap(_.child("color")).flatMap(c => KmlColors.parse(c.text))
    StyleColors(colorOf("iconstyle"), colorOf("linestyle"))

  private def color(e: Element, g: Geometry, ctx: Context): Color =
    val inlined = e.child("style").map(styleColors)
    val shared = e.child("styleurl").map(u => stripHash(u.text)).flatMap { id =>
      ctx.styles
        .get(id)
        .orElse(ctx.styleMaps.get(id).flatten.flatMap(ctx.styles.get))
        .orElse(KmlColors.fromLegacyStyleId(id).map(c => StyleColors(Some(c), Some(c))))
    }
    val colors = inlined.orElse(shared).getOrElse(StyleColors(None, None))
    val picked = g match
      case _: Geometry.Point      => colors.icon.orElse(colors.line)
      case _: Geometry.LineString => colors.line.orElse(colors.icon)
    picked.getOrElse(Color.default)
end KmlReader
