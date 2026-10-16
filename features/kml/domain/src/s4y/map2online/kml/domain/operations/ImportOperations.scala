package s4y.map2online.kml.domain.operations

import s4y.map2online.catalog.domain.vo.*
import s4y.map2online.kml.domain.vo.*

/** Fits an arbitrarily nested KML tree into Category → Route → Feature.
  *
  * A folder's own placemarks form one route. Folders holding only placemarks are routes of the
  * nearest folder above them; every folder with subfolders is a category of the routes directly in
  * it. Levels with no routes disappear, and an unnamed folder borrows the nearest name above it
  * (ultimately the file name).
  */
object ImportOperations:

  def categories(root: KmlFolder): Vector[ImportedCategory] = walk(root, root.name)

  def routes(root: KmlFolder): Vector[ImportedRoute] = categories(root).flatMap(_.routes)

  def features(root: KmlFolder): Vector[Feature] = routes(root).flatMap(_.features)

  private def walk(f: KmlFolder, inherited: String): Vector[ImportedCategory] =
    val title = nonEmpty(f.name, inherited)
    val leafRoutes = f.folders.filter(s => s.folders.isEmpty && s.placemarks.nonEmpty)
    val routes =
      Option.when(f.placemarks.nonEmpty)(route(f, title)).toVector ++
        leafRoutes.map(s => route(s, nonEmpty(s.name, title)))
    val own = Option.when(routes.nonEmpty)(
      ImportedCategory(Category(Title(title), Summary.empty, f.description, f.visible), routes)
    )
    own.toVector ++ f.folders.filter(_.folders.nonEmpty).flatMap(walk(_, title))

  private def route(f: KmlFolder, title: String): ImportedRoute =
    ImportedRoute(
      Route(Title(title), Summary.empty, f.description, f.visible),
      f.placemarks.map(p =>
        Feature(Title(p.name), Summary.empty, p.description, p.visible, p.geometry, p.color)
      )
    )

  private def nonEmpty(name: String, fallback: String): String =
    if name.trim.nonEmpty then name.trim else fallback
