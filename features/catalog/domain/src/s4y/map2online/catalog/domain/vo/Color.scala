package s4y.map2online.catalog.domain.vo

/** The palette features are drawn with. `rgba` is `#rrggbbaa`, lower case. */
enum Color(val rgba: String):
  case Red extends Color("#e6194bff")
  case Magenta extends Color("#f032e6ff")
  case Orange extends Color("#f58231ff")
  case Green extends Color("#3cb44bff")
  case Blue extends Color("#4363d8ff")
  case Pink extends Color("#fabebeff")
  case Cyan extends Color("#42d4f4ff")
  case Brown extends Color("#9a6324ff")
  case Yellow extends Color("#ffe119ff")

object Color:
  val default: Color = Red

  def fromRgba(rgba: String): Option[Color] =
    values.find(_.rgba.equalsIgnoreCase(rgba))
