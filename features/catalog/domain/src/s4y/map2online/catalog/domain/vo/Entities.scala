package s4y.map2online.catalog.domain.vo

import s4y.identity.Identifier

final case class Category(
    title: Title,
    summary: Summary,
    description: Markdown,
    visible: Boolean
)

object Category:
  def create(title: Title): Category =
    Category(title, Summary.empty, Markdown.empty, visible = true)

final case class Route(
    title: Title,
    summary: Summary,
    description: Markdown,
    visible: Boolean
)

object Route:
  def create(title: Title): Route = Route(title, Summary.empty, Markdown.empty, visible = true)

final case class Feature(
    title: Title,
    summary: Summary,
    description: Markdown,
    visible: Boolean,
    geometry: Geometry,
    color: Color
)

object Feature:
  def create(title: Title, geometry: Geometry, color: Color = Color.default): Feature =
    Feature(title, Summary.empty, Markdown.empty, visible = true, geometry, color)

type CategoryId = Identifier[Category]
type RouteId = Identifier[Route]
type FeatureId = Identifier[Feature]
