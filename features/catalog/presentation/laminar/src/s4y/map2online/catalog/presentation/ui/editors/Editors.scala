package s4y.map2online.catalog.presentation.ui.editors

import com.raquo.laminar.api.L.*
import s4y.map2online.catalog.domain.vo.*
import s4y.map2online.catalog.presentation.Pins
import s4y.map2online.catalog.presentation.ui.MarkdownView
import s4y.presentation.laminar.Dialog

/** The editable text of a category, route or feature. */
final case class Texts(title: String, summary: String, description: String)

/** Editing dialogs. They hold a draft and hand back the result on Save. */
object Editors:

  def texts(
      heading: String,
      initial: Texts,
      onSave: Texts => Unit,
      onClose: () => Unit,
      extra: Var[Texts] => Modifier[HtmlElement] = _ => emptyMod
  ): HtmlElement =
    val draft = Var(initial)
    val preview = Var(false)
    Dialog(heading, onClose)(
      form(
        cls := "editor",
        onSubmit.preventDefault --> { _ =>
          onSave(draft.now())
          onClose()
        },
        label(
          span("Title"),
          input(
            typ := "text",
            controlled(
              value <-- draft.signal.map(_.title),
              onInput.mapToValue --> (v => draft.update(_.copy(title = v)))
            )
          )
        ),
        label(
          span("Summary"),
          input(
            typ := "text",
            controlled(
              value <-- draft.signal.map(_.summary),
              onInput.mapToValue --> (v => draft.update(_.copy(summary = v)))
            )
          )
        ),
        extra(draft),
        div(
          cls := "description-field",
          div(
            cls := "tabs",
            role := "tablist",
            button(
              typ := "button",
              role := "tab",
              aria.selected <-- preview.signal.map(p => !p),
              "Write",
              onClick --> (_ => preview.set(false))
            ),
            button(
              typ := "button",
              role := "tab",
              aria.selected <-- preview.signal,
              "Preview",
              onClick --> (_ => preview.set(true))
            )
          ),
          child <-- preview.signal.map {
            case false =>
              textArea(
                aria.label := "Description (Markdown)",
                placeholder := "Description: **bold**, *italic*, - lists, [links](https://…)",
                rows := 8,
                controlled(
                  value <-- draft.signal.map(_.description),
                  onInput.mapToValue --> (v => draft.update(_.copy(description = v)))
                )
              )
            case true => MarkdownView(draft.signal.map(_.description))
          }
        ),
        div(
          cls := "dialog-actions",
          button(typ := "button", cls := "secondary", "Cancel", onClick --> (_ => onClose())),
          button(typ := "submit", "Save")
        )
      )
    )

  def category(
      heading: String,
      c: Category,
      onSave: Category => Unit,
      onClose: () => Unit
  ): HtmlElement =
    texts(
      heading,
      Texts(Title.unwrap(c.title), Summary.unwrap(c.summary), Markdown.unwrap(c.description)),
      t =>
        onSave(
          c.copy(
            title = Title(t.title.trim),
            summary = Summary(t.summary.trim),
            description = Markdown(t.description)
          )
        ),
      onClose
    )

  def route(heading: String, r: Route, onSave: Route => Unit, onClose: () => Unit): HtmlElement =
    texts(
      heading,
      Texts(Title.unwrap(r.title), Summary.unwrap(r.summary), Markdown.unwrap(r.description)),
      t =>
        onSave(
          r.copy(
            title = Title(t.title.trim),
            summary = Summary(t.summary.trim),
            description = Markdown(t.description)
          )
        ),
      onClose
    )

  def feature(
      heading: String,
      f: Feature,
      onSave: Feature => Unit,
      onClose: () => Unit
  ): HtmlElement =
    val color = Var(f.color)
    texts(
      heading,
      Texts(Title.unwrap(f.title), Summary.unwrap(f.summary), Markdown.unwrap(f.description)),
      t =>
        onSave(
          f.copy(
            title = Title(t.title.trim),
            summary = Summary(t.summary.trim),
            description = Markdown(t.description),
            color = color.now()
          )
        ),
      onClose,
      _ =>
        Seq(
          div(
            cls := "field",
            span("Colour"),
            div(
              cls := "palette",
              role := "radiogroup",
              Color.values.toSeq.map(c =>
                button(
                  typ := "button",
                  cls := "swatch",
                  role := "radio",
                  aria.checked <-- color.signal.map(x => (x == c).toString),
                  cls("active") <-- color.signal.map(_ == c),
                  aria.label := c.toString,
                  styleAttr := s"background: ${c.rgba.take(7)}",
                  onClick --> (_ => color.set(c))
                )
              )
            )
          ),
          div(
            cls := "field",
            span("Position"),
            span(cls := "coordinates", Coordinates.describe(f.geometry))
          )
        )
    )

object Coordinates:
  private def fmt(c: Coordinate) = f"${c.lat: Double}%.5f, ${c.lon: Double}%.5f"

  def describe(g: Geometry): String = g match
    case Geometry.Point(c)      => fmt(c)
    case l: Geometry.LineString =>
      s"${l.coordinates.size} points, from ${fmt(l.coordinates.head)} to ${fmt(l.coordinates.last)}"

  /** A pin or a line glyph in the feature's colour. */
  def glyph(f: Feature): HtmlElement =
    f.geometry match
      case _: Geometry.Point =>
        img(cls := "glyph", src := Pins.dataUrl(f.color), alt := "", width := "14", height := "18")
      case _ => span(cls := "glyph line-glyph", styleAttr := s"background: ${f.color.rgba.take(7)}")
