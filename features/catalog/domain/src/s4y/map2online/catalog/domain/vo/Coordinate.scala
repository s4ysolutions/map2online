package s4y.map2online.catalog.domain.vo

import zio.prelude.{Assertion, Subtype, Validation}

object Latitude extends Subtype[Double]:
  override inline def assertion = Assertion.between(-90.0, 90.0)
type Latitude = Latitude.Type

object Longitude extends Subtype[Double]:
  override inline def assertion = Assertion.between(-180.0, 180.0)
type Longitude = Longitude.Type

/** WGS 84 position; altitude in metres when known. */
final case class Coordinate(lat: Latitude, lon: Longitude, alt: Option[Double] = None)

object Coordinate:
  def from(
      lat: Double,
      lon: Double,
      alt: Option[Double] = None
  ): Validation[GeometryError, Coordinate] =
    Validation.validateWith(
      Latitude.make(lat).mapError(_ => GeometryError.LatitudeOutOfRange(lat)),
      Longitude.make(lon).mapError(_ => GeometryError.LongitudeOutOfRange(lon))
    )(Coordinate(_, _, alt))
