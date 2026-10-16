package s4y.map2online.web

import com.raquo.laminar.api.L.*
import org.scalajs.dom

/** Composition root of the browser application. */
object Main:
  def main(args: Array[String]): Unit =
    renderOnDomContentLoaded(
      dom.document.getElementById("app"),
      div(
        cls := "app",
        h1("Map2Online"),
        p("Scala.js rewrite in progress.")
      )
    )
