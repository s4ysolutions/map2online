package s4y.map2online.catalog.domain

import munit.FunSuite
import s4y.map2online.catalog.domain.operations.OrderingOperations.*
import s4y.map2online.catalog.domain.vo.CatalogError

class OrderingSuite extends FunSuite:
  private val abcd = Vector("a", "b", "c", "d")

  test("reorder moves an item towards the end") {
    assertEquals(reorder(abcd, 0, 2), Right(Vector("b", "c", "a", "d")))
  }

  test("reorder moves an item towards the start") {
    assertEquals(reorder(abcd, 3, 1), Right(Vector("a", "d", "b", "c")))
  }

  test("reorder onto itself keeps the order") {
    assertEquals(reorder(abcd, 2, 2), Right(abcd))
  }

  test("reorder rejects positions outside the list") {
    assertEquals(reorder(abcd, 0, 4), Left(CatalogError.PositionOutOfRange(4, 4)))
    assertEquals(reorder(abcd, -1, 0), Left(CatalogError.PositionOutOfRange(-1, 4)))
  }

  test("insert without a position appends") {
    assertEquals(insert(abcd, "x", None), Right(abcd :+ "x"))
  }

  // master: `position || ids.length` appended when asked for position 0
  test("insert at 0 prepends") {
    assertEquals(insert(abcd, "x", Some(0)), Right("x" +: abcd))
  }

  test("insert accepts the end position and rejects beyond it") {
    assertEquals(insert(abcd, "x", Some(4)), Right(abcd :+ "x"))
    assertEquals(insert(abcd, "x", Some(5)), Left(CatalogError.PositionOutOfRange(5, 4)))
  }
