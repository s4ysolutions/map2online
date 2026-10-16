package s4y.map2online.catalog.domain

import munit.FunSuite
import s4y.map2online.catalog.domain.Fixtures.*
import s4y.map2online.catalog.domain.operations.CatalogOperations.*
import s4y.map2online.catalog.domain.vo.*

class CatalogSuite extends FunSuite:

  private val c1 = newCategory("c1")
  private val r1 = newRoute("r1")
  private val f1 = newFeature("f1")
  private val f2 = newFeature("f2")

  /** c1 / r1 / [f1, f2] */
  private val catalog: Catalog = unsafe(
    for
      a <- addCategory(Catalog.empty, c1)
      b <- addRoute(a, c1.id, r1)
      c <- addFeature(b, r1.id, f1)
      d <- addFeature(c, r1.id, f2)
    yield d
  )

  private def visibleIds(c: Catalog) = visibleFeatures(c).map(_.id)

  test("all features are visible by default, in catalog order") {
    assertEquals(visibleIds(catalog), Vector(f1.id, f2.id))
  }

  test("a hidden feature is not visible") {
    val hidden = unsafe(updateFeature(catalog, f1.id)(_.copy(visible = false)))
    assertEquals(visibleIds(hidden), Vector(f2.id))
  }

  test("a hidden route hides all its features") {
    val hidden = unsafe(updateRoute(catalog, r1.id)(_.copy(visible = false)))
    assertEquals(visibleIds(hidden), Vector.empty)
  }

  test("a hidden category hides all its routes' features") {
    val hidden = unsafe(updateCategory(catalog, c1.id)(_.copy(visible = false)))
    assertEquals(visibleIds(hidden), Vector.empty)
  }

  test("an added feature becomes visible at its position") {
    val f3 = newFeature("f3")
    val added = unsafe(addFeature(catalog, r1.id, f3, at = Some(1)))
    assertEquals(visibleIds(added), Vector(f1.id, f3.id, f2.id))
  }

  test("removing a category removes its routes and features") {
    val removed = unsafe(removeCategory(catalog, c1.id))
    assertEquals(route(removed, r1.id), None)
    assertEquals(feature(removed, f1.id), None)
  }

  test("removing a feature keeps its siblings") {
    val removed = unsafe(removeFeature(catalog, f1.id))
    assertEquals(visibleIds(removed), Vector(f2.id))
  }

  test("unknown ids are reported with their type") {
    val unknown = id[Feature]("nope")
    assertEquals(removeFeature(catalog, unknown), Left(CatalogError.FeatureNotFound(unknown)))
    assertEquals(
      addRoute(catalog, id("nope"), newRoute("r2")),
      Left(CatalogError.CategoryNotFound(id("nope")))
    )
  }

  test("an id already in the catalog cannot be added again") {
    assertEquals(addFeature(catalog, r1.id, f1), Left(CatalogError.DuplicateId(f1.id)))
  }

  test("reordering features changes only their order") {
    val reordered = unsafe(reorderFeatures(catalog, r1.id, 0, 1))
    assertEquals(visibleIds(reordered), Vector(f2.id, f1.id))
  }

  test("parents are found from children") {
    assertEquals(routeOf(catalog, f2.id).map(_.id), Some(r1.id))
    assertEquals(categoryOf(catalog, r1.id).map(_.id), Some(c1.id))
  }

  test("updating a feature changes only that feature") {
    val moved = point(5, 6)
    val updated = unsafe(updateFeature(catalog, f2.id)(_.copy(geometry = moved)))
    assertEquals(feature(updated, f2.id).map(_.value.geometry), Some(moved))
    assertEquals(feature(updated, f1.id), Some(f1))
  }

  test("domain code cannot mint identifiers") {
    assertEquals(
      compileErrors("""s4y.identity.minting.IdentifierMint.fromString[Feature]("x")"""),
      ""
    )
    assert(
      compileErrors("""s4y.identity.Identifier.unsafe[Feature]("x")""").contains(
        "cannot be accessed"
      )
    )
  }
