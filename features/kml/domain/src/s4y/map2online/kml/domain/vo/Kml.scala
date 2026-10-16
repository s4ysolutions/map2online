package s4y.map2online.kml.domain.vo

import s4y.map2online.catalog.domain.vo.*

/** A KML file reduced to what Map2Online keeps: nested folders of placemarks. The root folder is
  * the file itself.
  */
final case class KmlFolder(
    name: String,
    description: Markdown,
    visible: Boolean,
    placemarks: Vector[KmlPlacemark],
    folders: Vector[KmlFolder]
)

final case class KmlPlacemark(
    name: String,
    description: Markdown,
    visible: Boolean,
    geometry: Geometry,
    color: Color
)

final case class KmlRead(root: KmlFolder, warnings: Vector[KmlWarning])

/** Placemarks that could not be imported; the rest of the file still is. */
enum KmlWarning:
  case NoGeometry(placemark: String)
  case UnparsableCoordinates(placemark: String, text: String)
  case InvalidGeometry(placemark: String, errors: Vector[GeometryError])

enum KmlError:
  case Malformed(message: String, offset: Int)
