package s4y.presentation.laminar

import com.raquo.laminar.api.L.*
import org.scalajs.dom

/** A list whose rows are reordered by dragging their handle. Uses pointer events (with capture) so
  * it works with mouse, pen and touch alike.
  */
object ReorderList:

  /** `row(item, index, handle)` renders one row; put `handle` on the drag handle element.
    * `onMove(from, to)` fires when a row is dropped elsewhere.
    */
  def apply[A, K](
      items: Signal[Vector[A]],
      key: A => K,
      onMove: (Int, Int) => Unit
  )(row: (A, Signal[Int], Modifier[HtmlElement]) => HtmlElement): HtmlElement =
    val dragging = Var(Option.empty[(Int, Int)]) // (from, current target)
    var list: dom.HTMLElement = null

    def targetIndex(clientY: Double): Int =
      val rows = list.children.toSeq.collect {
        case e: dom.HTMLElement if e.classList.contains("reorder-row") => e
      }
      val i = rows.indexWhere { r =>
        val b = r.getBoundingClientRect()
        clientY < b.top + b.height / 2
      }
      if i < 0 then rows.size - 1 else i

    def handle(index: Signal[Int]): Modifier[HtmlElement] = Seq(
      cls := "drag-handle",
      aria.label := "Drag to reorder",
      onPointerDown.compose(_.withCurrentValueOf(index)) --> { (e, i) =>
        e.preventDefault()
        e.target.asInstanceOf[dom.Element].setPointerCapture(e.pointerId)
        dragging.set(Some((i, i)))
      },
      onPointerMove --> { e =>
        dragging.update(_.map((from, _) => (from, targetIndex(e.clientY))))
      },
      onPointerUp --> { _ =>
        dragging.now().foreach((from, to) => if from != to then onMove(from, to))
        dragging.set(None)
      },
      onPointerCancel --> (_ => dragging.set(None))
    )

    ul(
      cls := "reorder-list",
      onMountCallback(ctx => list = ctx.thisNode.ref),
      children <-- items.split(key) { (k, _, itemSignal) =>
        val index = items.map(_.indexWhere(x => key(x) == k))
        li(
          cls := "reorder-row",
          cls("dragged") <-- dragging.signal.combineWith(index).map((d, i) => d.exists(_._1 == i)),
          cls("drop-before") <-- dragging.signal
            .combineWith(index)
            .map((d, i) => d.exists((f, t) => t == i && f > i)),
          cls("drop-after") <-- dragging.signal
            .combineWith(index)
            .map((d, i) => d.exists((f, t) => t == i && f < i)),
          child <-- itemSignal.map(a => row(a, index, handle(index)))
        )
      }
    )
end ReorderList
