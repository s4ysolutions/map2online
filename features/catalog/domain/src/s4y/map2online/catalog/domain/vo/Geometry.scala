package s4y.map2online.catalog.domain.vo

sealed trait Geometry

object Geometry:
  final case class Point(coordinate: Coordinate) extends Geometry

  final case class LineString private (coordinates: Vector[Coordinate]) extends Geometry

  object LineString:
    val MinPoints = 2

    def from(coordinates: Vector[Coordinate]): Either[GeometryError, LineString] =
      if coordinates.size < MinPoints then Left(GeometryError.TooFewPoints(coordinates.size))
      else Right(new LineString(coordinates))

enum GeometryError:
  case LatitudeOutOfRange(value: Double)
  case LongitudeOutOfRange(value: Double)
  case TooFewPoints(count: Int)
