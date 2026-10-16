package s4y.map2online.kml.domain

import scala.scalajs.js
import scala.scalajs.js.annotation.JSImport

object Fixture:
  @js.native
  @JSImport("node:fs", "readFileSync")
  private def readFileSync(path: String, encoding: String): String = js.native

  def load(name: String): String = readFileSync(s"${fixtures.FixturesDir.path}/$name", "utf-8")
