package s4y.map2online.kml.domain

import munit.FunSuite
import s4y.identity.Identified
import s4y.identity.minting.IdentifierMint
import s4y.map2online.catalog.domain.vo.*
import s4y.map2online.kml.domain.operations.*
import s4y.map2online.kml.domain.vo.*

class KmlReaderSuite extends FunSuite:

  private def read(name: String): KmlRead =
    KmlReader.read(name, Fixture.load(name)).fold(e => fail(e.toString), identity)

  private def titles[A](as: Vector[A])(f: A => Title) = as.map(a => Title.unwrap(f(a)))

  test("simple.kml: the file, an unnamed document, a category with two routes") {
    val root = read("simple.kml").root
    assertEquals(root.name, "simple.kml")
    val doc = root.folders.head
    assertEquals(doc.name, "")
    val cat1 = doc.folders.head
    assertEquals(cat1.name, "Category 1")
    assertEquals(cat1.folders.map(_.name), Vector("Route 11", "Route 12"))
    val r11 = cat1.folders.head
    assertEquals(Markdown.unwrap(r11.description), "Desc r11")
    assertEquals(r11.placemarks.map(_.name), Vector("111", "112"))
    assertEquals(
      r11.placemarks.map(p => Markdown.unwrap(p.description)),
      Vector("Desc 111", "Desc 112")
    )
    val r12 = cat1.folders(1)
    assertEquals(r12.placemarks.map(_.name), Vector("121", "122", "123"))
    assertEquals(Markdown.unwrap(r12.placemarks(2).description), "")
    assert(r12.placemarks(2).geometry.isInstanceOf[Geometry.LineString])
  }

  test("simple.kml imports as one category of two routes") {
    val cats = ImportOperations.categories(read("simple.kml").root)
    assertEquals(titles(cats)(_.category.title), Vector("Category 1"))
    assertEquals(titles(cats.head.routes)(_.route.title), Vector("Route 11", "Route 12"))
    assertEquals(cats.head.routes.map(_.features.size), Vector(2, 3))
  }

  test("simple-cdata.kml reads names and descriptions from CDATA") {
    val cat1 = read("simple-cdata.kml").root.folders.head.folders.head
    assertEquals(cat1.name, "cat1 name")
    assertEquals(Markdown.unwrap(cat1.description), "cat1 desc")
    assertEquals(cat1.folders.head.placemarks.head.name, "111")
  }

  test("rrb.kml: a real trip with 14 days") {
    val read0 = read("rrb.kml")
    val cat1 = read0.root.folders.head.folders.head
    assertEquals(cat1.name, "Открывая Мангистау - 2019")
    assertEquals(cat1.folders.size, 14)
    val day3 = cat1.folders(3)
    assertEquals(day3.name, "День 3")
    assertEquals(day3.placemarks.size, 72)
    assertEquals(read0.warnings, Vector.empty)
  }

  test("only-features.kml: placemarks at the top become one route named after the file") {
    val root = read("only-features.kml").root
    assertEquals(root.folders, Vector.empty)
    assertEquals(root.placemarks.size, 5)
    val cats = ImportOperations.categories(root)
    assertEquals(titles(cats)(_.category.title), Vector("only-features.kml"))
    assertEquals(cats.head.routes.map(_.features.size), Vector(5))
  }

  test(
    "3-levels-mixed.kml: a folder with placemarks and subfolders is a category with its own route"
  ) {
    val cats = ImportOperations.categories(read("3-levels-mixed.kml").root)
    val nested = cats.find(c => Title.unwrap(c.category.title) == "Category 1 nested").get
    assertEquals(titles(nested.routes)(_.route.title).head, "Category 1 nested")
    assertEquals(nested.routes.head.features.size, 2)
    assertEquals(ImportOperations.features(read("3-levels-mixed.kml").root).size, 10)
  }

  test("empty-top-level.kml: a level without routes disappears") {
    val cats = ImportOperations.categories(read("empty-top-level.kml").root)
    assertEquals(titles(cats)(_.category.title), Vector("Category 1"))
  }

  test("problem-br-tag.kml: an unclosed <br> in a description is a line break") {
    val read0 = read("problem-br-tag.kml")
    val all = ImportOperations.features(read0.root)
    val withBr = all.find(f => Title.unwrap(f.title) == "BC_Panorama Camping").get
    assert(Markdown.unwrap(withBr.description).startsWith("sym: Flag, Blue\ntype: user"))
    assert(all.size > 100)
  }

  test("01-11-2020.kml: an old Map2Online export keeps geometry and palette colours") {
    val cats = ImportOperations.categories(read("01-11-2020.kml").root)
    assertEquals(cats.size, 1)
    assertEquals(cats.head.routes.size, 1)
    val features = cats.head.routes.head.features
    assertEquals(features.size, 7)
    assertEquals(
      features.take(5).map(_.geometry.isInstanceOf[Geometry.Point]),
      Vector.fill(5)(true)
    )
    assertEquals(
      features
        .drop(5)
        .map(_.geometry match
          case l: Geometry.LineString => l.coordinates.size
          case _                      => 0),
      Vector(6, 6)
    )
    assertEquals(
      features.map(_.color),
      Vector(Color.Red, Color.Red, Color.Red, Color.Blue, Color.Yellow, Color.Pink, Color.Pink)
    )
  }

  test("invalid coordinates skip the placemark with a warning") {
    val kml = """<kml><Placemark><name>bad</name><Point><coordinates>10,95</coordinates></Point></Placemark>
                |<Placemark><name>none</name></Placemark>
                |<Placemark><name>ok</name><Point><coordinates>10,45,0</coordinates></Point></Placemark></kml>""".stripMargin
    val r = KmlReader.read("x.kml", kml).fold(e => fail(e.toString), identity)
    assertEquals(r.root.placemarks.map(_.name), Vector("ok"))
    assertEquals(
      r.warnings,
      Vector(
        KmlWarning.InvalidGeometry("bad", Vector(GeometryError.LatitudeOutOfRange(95))),
        KmlWarning.NoGeometry("none")
      )
    )
  }

class KmlColorsSuite extends FunSuite:
  test("standard KML colours are aabbggrr") {
    assertEquals(KmlColors.parse("ff4b19e6"), Some(Color.Red))
    assertEquals(KmlColors.parse("ffd86343"), Some(Color.Blue))
  }

  test("the old app's #rrggbbaa values map exactly") {
    assertEquals(KmlColors.parse("#ffe119ff"), Some(Color.Yellow))
  }

  test("other colours snap to the nearest palette colour") {
    assertEquals(KmlColors.parse("ff0000ff"), Some(Color.Red)) // pure red
    assertEquals(KmlColors.parse("ffff0000"), Some(Color.Blue)) // pure blue
  }

  test("palette colours survive a write and read") {
    Color.values.foreach(c => assertEquals(KmlColors.parse(KmlColors.toKml(c)), Some(c)))
  }

  test("garbage is not a colour") {
    assertEquals(KmlColors.parse("nope"), None)
  }

class KmlRoundTripSuite extends FunSuite:
  private def id[A](s: String) = IdentifierMint.fromString[A](s).toOption.get
  private def c(lat: Double, lon: Double, alt: Option[Double] = None) =
    Coordinate.from(lat, lon, alt).toOption.get

  private val point = Feature(
    Title("Camp & <spring>"),
    Summary.empty,
    Markdown("**Water** here\n- tap\n- well\n\n[map](https://x.org/a_b)"),
    visible = true,
    Geometry.Point(c(43.123456789, 52.0000001, Some(120.5))),
    Color.Green
  )
  private val line = Feature(
    Title("Road ]]> end"),
    Summary.empty,
    Markdown.empty,
    visible = false,
    Geometry.LineString.from(Vector(c(0.00001, -179.5), c(-89.9, 179.99))).toOption.get,
    Color.Blue
  )
  private val catalog = Vector(
    CategoryNode(
      Identified(
        id("c1"),
        Category(Title("Trip"), Summary.empty, Markdown("About *trip*"), visible = true)
      ),
      Vector(
        RouteNode(
          Identified(
            id("r1"),
            Route(Title("Day 1"), Summary.empty, Markdown.empty, visible = true)
          ),
          Vector(Identified(id("f1"), point), Identified(id("f2"), line))
        )
      )
    )
  )

  test("a written catalog reads back unchanged") {
    val kml = KmlWriter.write("export", catalog, onlyVisible = false)
    val read = KmlReader.read("export.kml", kml).fold(e => fail(e.toString), identity)
    assertEquals(read.warnings, Vector.empty)
    val cats = ImportOperations.categories(read.root)
    assertEquals(cats.map(_.category), Vector(catalog.head.category.value))
    assertEquals(cats.head.routes.map(_.route), Vector(catalog.head.routes.head.route.value))
    assertEquals(cats.head.routes.head.features, Vector(point, line))
  }

  test("only visible content is written when asked") {
    val kml = KmlWriter.write("export", catalog, onlyVisible = true)
    val read = KmlReader.read("export.kml", kml).fold(e => fail(e.toString), identity)
    assertEquals(ImportOperations.features(read.root), Vector(point))
  }

  test("descriptions are HTML for other tools") {
    val kml = KmlWriter.write("export", catalog, onlyVisible = false)
    assert(kml.contains("<strong>Water</strong>"))
    assert(kml.contains("<color>ff4bb43c</color>"))
  }
