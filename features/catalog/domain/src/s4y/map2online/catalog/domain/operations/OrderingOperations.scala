package s4y.map2online.catalog.domain.operations

import s4y.map2online.catalog.domain.vo.CatalogError

/** Positional edits of the user-arranged lists in the catalog. */
object OrderingOperations:

  /** Moves the item at `from` so that it ends up at index `to`. */
  def reorder[A](items: Vector[A], from: Int, to: Int): Either[CatalogError, Vector[A]] =
    for
      _ <- requireIndex(from, items.size)
      _ <- requireIndex(to, items.size)
    yield
      val item = items(from)
      items.patch(from, Nil, 1).patch(to, Vector(item), 0)

  /** Inserts at `at` (0 to size inclusive), or appends when `at` is empty. */
  def insert[A](items: Vector[A], item: A, at: Option[Int]): Either[CatalogError, Vector[A]] =
    at match
      case None                                 => Right(items :+ item)
      case Some(i) if i >= 0 && i <= items.size => Right(items.patch(i, Vector(item), 0))
      case Some(i) => Left(CatalogError.PositionOutOfRange(i, items.size))

  private def requireIndex(i: Int, size: Int): Either[CatalogError, Unit] =
    if i >= 0 && i < size then Right(()) else Left(CatalogError.PositionOutOfRange(i, size))
