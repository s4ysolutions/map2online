package s4y.map2online.kml.domain

import java.nio.file.{Files, Paths}

object Fixture:
  def load(name: String): String = Files.readString(Paths.get(fixtures.FixturesDir.path, name))
