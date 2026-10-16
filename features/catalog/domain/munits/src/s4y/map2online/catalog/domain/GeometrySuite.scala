package s4y.map2online.catalog.domain

import munit.FunSuite
import s4y.map2online.catalog.domain.Fixtures.*
import s4y.map2online.catalog.domain.vo.*
import zio.NonEmptyChunk
import zio.prelude.Validation

class GeometrySuite extends FunSuite:

  test("a coordinate inside WGS 84 bounds is valid") {
    assert(Coordinate.from(45.0, -179.5).isSuccess)
  }

  test("coordinate errors are accumulated, not fail-fast") {
    assertEquals(
      Coordinate.from(91.0, 181.0),
      Validation.failNonEmptyChunk(
        NonEmptyChunk(
          GeometryError.LatitudeOutOfRange(91.0),
          GeometryError.LongitudeOutOfRange(181.0)
        )
      )
    )
  }

  test("an out-of-range latitude literal does not compile") {
    assertEquals(compileErrors("Latitude(45.0)"), "")
    assert(compileErrors("Latitude(91.0)").nonEmpty)
  }

  test("a line needs at least two points") {
    assertEquals(
      Geometry.LineString.from(Vector(coordinate(1, 1))),
      Left(GeometryError.TooFewPoints(1))
    )
    assert(Geometry.LineString.from(Vector(coordinate(1, 1), coordinate(2, 2))).isRight)
  }

  // master: Feature.eq compared lat twice and never lon
  test("points that differ only in longitude are not equal") {
    assertNotEquals(point(10, 20), point(10, 21))
    assertEquals(point(10, 20), point(10, 20))
  }

  // master: coordinatesEq returned false when longitudes were *equal*
  test("lines compare every coordinate including longitude") {
    def line(lons: Double*) = Geometry.LineString.from(lons.toVector.map(coordinate(0, _)))
    assertEquals(line(1, 2), line(1, 2))
    assertNotEquals(line(1, 2), line(1, 3))
  }

  test("palette colours parse case-insensitively and default to red") {
    assertEquals(Color.fromRgba("#E6194BFF"), Some(Color.Red))
    assertEquals(Color.fromRgba("#123456ff"), None)
    assertEquals(Color.default, Color.Red)
  }
