package s4y.map2online.catalog.presentation

import s4y.map2online.catalog.domain.vo.Color

import scala.scalajs.js

/** Map pin and line glyphs in palette colours (SVG, also used by the UI). */
object Pins:
  private val pinPath =
    "M12 0C6.5 0 2 4.4 2 9.9 2 17.3 12 32 12 32s10-14.7 10-22.1C22 4.4 17.5 0 12 0zm0 14a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"

  def svg(color: Color, selected: Boolean = false): String =
    val rgb = color.rgba.take(7)
    val stroke = if selected then """stroke="#1f2933" stroke-width="2""""
    else """stroke="#ffffff" stroke-width="1""""
    s"""<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="-1 -1 26 34"><path d="$pinPath" fill="$rgb" $stroke/></svg>"""

  def dataUrl(color: Color, selected: Boolean = false): String =
    "data:image/svg+xml;charset=utf-8," + js.URIUtils.encodeURIComponent(svg(color, selected))
