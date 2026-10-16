package s4y.map2online.catalog.domain

import s4y.identity.minting.IdentifierMint
import s4y.identity.{Identified, Identifier}
import s4y.map2online.catalog.domain.vo.*

object Fixtures:
  def id[A](raw: String): Identifier[A] =
    IdentifierMint
      .fromString[A](raw)
      .fold(e => throw IllegalArgumentException(e.toString), identity)

  def coordinate(lat: Double, lon: Double): Coordinate =
    Coordinate.from(lat, lon).fold(e => throw IllegalArgumentException(e.toString), identity)

  def point(lat: Double, lon: Double): Geometry = Geometry.Point(coordinate(lat, lon))

  def newCategory(raw: String): Identified[CategoryId, Category] =
    Identified(id(raw), Category.create(Title(raw)))

  def newRoute(raw: String): Identified[RouteId, Route] =
    Identified(id(raw), Route.create(Title(raw)))

  def newFeature(raw: String): Identified[FeatureId, Feature] =
    Identified(id(raw), Feature.create(Title(raw), point(0, 0)))

  def unsafe[A](e: Either[CatalogError, A]): A =
    e.fold(err => throw IllegalStateException(err.toString), identity)
