package s4y.map2online.kml.domain.operations

import s4y.map2online.catalog.domain.vo.Color

/** KML colours (`aabbggrr`) to and from the palette. */
object KmlColors:

  /** `#`-prefixed values are what the old Map2Online wrote (`#rrggbbaa`); anything else is read as
    * standard KML `aabbggrr` or `bbggrr`.
    */
  def parse(text: String): Option[Color] =
    val t = text.trim
    if t.startsWith("#") then Color.fromRgba(t).orElse(rgb(t.drop(1).take(6)).map(nearest))
    else
      val hex = t.toLowerCase
      hex.length match
        case 8 =>
          rgb(s"${hex.substring(6, 8)}${hex.substring(4, 6)}${hex.substring(2, 4)}").map(nearest)
        case 6 =>
          rgb(s"${hex.substring(4, 6)}${hex.substring(2, 4)}${hex.substring(0, 2)}").map(nearest)
        case _ => None

  /** Style ids the old app generated: `map2_style_#rrggbbaa`. */
  def fromLegacyStyleId(id: String): Option[Color] =
    val prefix = "map2_style_"
    if id.startsWith(prefix) then
      val rest = id.drop(prefix.length)
      Color.fromRgba(if rest.startsWith("#") then rest else s"#$rest")
    else None

  /** `#rrggbbaa` to KML `aabbggrr`. */
  def toKml(color: Color): String =
    val h = color.rgba.drop(1)
    s"${h.substring(6, 8)}${h.substring(4, 6)}${h.substring(2, 4)}${h.substring(0, 2)}"

  private def rgb(hex6: String): Option[(Int, Int, Int)] =
    if hex6.length != 6 then None
    else
      try
        Some(
          (
            Integer.parseInt(hex6.substring(0, 2), 16),
            Integer.parseInt(hex6.substring(2, 4), 16),
            Integer.parseInt(hex6.substring(4, 6), 16)
          )
        )
      catch case _: NumberFormatException => None

  def nearest(rgb: (Int, Int, Int)): Color =
    Color.values.minBy { c =>
      val (r, g, b) = KmlColors.rgb(c.rgba.substring(1, 7)).getOrElse((0, 0, 0))
      val (dr, dg, db) = (r - rgb._1, g - rgb._2, b - rgb._3)
      dr * dr + dg * dg + db * db
    }
