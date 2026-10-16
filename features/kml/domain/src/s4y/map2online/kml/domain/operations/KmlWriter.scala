package s4y.map2online.kml.domain.operations

import s4y.identity.Identified
import s4y.map2online.catalog.domain.vo.*
import s4y.markup.{MarkdownToHtml, Xml}

/** Writes catalog content as KML 2.2.
  *
  * Descriptions go out as HTML (what Google Earth and others show) with the Markdown source kept in
  * ExtendedData, so a Map2Online re-import is lossless. Colours are palette styles in standard
  * `aabbggrr`.
  */
object KmlWriter:

  val IconHref = "https://maps.google.com/mapfiles/kml/paddle/wht-blank.png"
  val LineWidth = 3

  def styleId(color: Color): String = s"map2_${color.toString.toLowerCase}"

  def write(documentName: String, categories: Vector[CategoryNode], onlyVisible: Boolean): String =
    val shown = if onlyVisible then visibleOnly(categories) else categories
    val colors = shown.flatMap(_.routes.flatMap(_.features.map(_.value.color))).distinct
    val out = StringBuilder()
    out ++= "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
    out ++= "<kml xmlns=\"http://www.opengis.net/kml/2.2\">\n"
    out ++= "  <Document>\n"
    out ++= s"    <name>${cdata(documentName)}</name>\n"
    colors.foreach(c => style(out, c))
    shown.foreach(c => category(out, c))
    out ++= "  </Document>\n"
    out ++= "</kml>\n"
    out.toString

  private def visibleOnly(categories: Vector[CategoryNode]): Vector[CategoryNode] =
    categories
      .filter(_.category.value.visible)
      .map(c =>
        c.copy(routes =
          c.routes
            .filter(_.route.value.visible)
            .map(r => r.copy(features = r.features.filter(_.value.visible)))
        )
      )

  private def style(out: StringBuilder, color: Color): Unit =
    val kml = KmlColors.toKml(color)
    out ++= s"""    <Style id="${styleId(color)}">
               |      <IconStyle>
               |        <color>$kml</color>
               |        <Icon><href>$IconHref</href></Icon>
               |        <hotSpot x="0.5" y="0" xunits="fraction" yunits="fraction"/>
               |      </IconStyle>
               |      <LineStyle>
               |        <color>$kml</color>
               |        <width>$LineWidth</width>
               |      </LineStyle>
               |    </Style>
               |""".stripMargin

  private def category(out: StringBuilder, c: CategoryNode): Unit =
    val v = c.category.value
    out ++= s"""    <Folder id="${Xml.escapeAttribute(c.id.value)}">\n"""
    common(out, "      ", v.title, v.description, v.visible)
    c.routes.foreach(r => route(out, r))
    out ++= "    </Folder>\n"

  private def route(out: StringBuilder, r: RouteNode): Unit =
    val v = r.route.value
    out ++= s"""      <Folder id="${Xml.escapeAttribute(r.id.value)}">\n"""
    common(out, "        ", v.title, v.description, v.visible)
    r.features.foreach(f => placemark(out, f))
    out ++= "      </Folder>\n"

  private def placemark(out: StringBuilder, f: Identified[FeatureId, Feature]): Unit =
    val v = f.value
    val i = "          "
    out ++= s"""        <Placemark id="${Xml.escapeAttribute(f.id.value)}">\n"""
    common(out, i, v.title, v.description, v.visible)
    out ++= s"$i<styleUrl>#${styleId(v.color)}</styleUrl>\n"
    v.geometry match
      case Geometry.Point(c) =>
        out ++= s"$i<Point><coordinates>${coordinate(c)}</coordinates></Point>\n"
      case l: Geometry.LineString =>
        out ++= s"$i<LineString><coordinates>${l.coordinates.map(coordinate).mkString(" ")}</coordinates></LineString>\n"
    out ++= "        </Placemark>\n"

  private def common(
      out: StringBuilder,
      i: String,
      title: Title,
      description: Markdown,
      visible: Boolean
  ): Unit =
    out ++= s"$i<name>${cdata(Title.unwrap(title))}</name>\n"
    if !visible then out ++= s"$i<visibility>0</visibility>\n"
    val md = Markdown.unwrap(description)
    if md.nonEmpty then
      out ++= s"$i<description>${cdata(MarkdownToHtml.render(md))}</description>\n"
      out ++= s"""$i<ExtendedData><Data name="${KmlReader.MarkdownData}"><value>${cdata(
          md
        )}</value></Data></ExtendedData>\n"""

  private def cdata(s: String): String = s"<![CDATA[${s.replace("]]>", "]]]]><![CDATA[>")}]]>"

  private def coordinate(c: Coordinate): String =
    s"${plain(c.lon)},${plain(c.lat)},${plain(c.alt.getOrElse(0.0))}"

  /** Shortest exact decimal, never in exponent notation. */
  private def plain(d: Double): String = BigDecimal(d).bigDecimal.stripTrailingZeros.toPlainString
end KmlWriter
