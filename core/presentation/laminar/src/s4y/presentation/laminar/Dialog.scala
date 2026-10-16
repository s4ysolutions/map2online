package s4y.presentation.laminar

import com.raquo.laminar.api.L.*
import org.scalajs.dom

/** A modal dialog: Esc and the backdrop close it, focus moves into it. */
object Dialog:
  def apply(titleText: String, onClose: () => Unit)(content: Modifier[HtmlElement]*): HtmlElement =
    div(
      cls := "dialog-backdrop",
      onMouseDown.filter(e => e.target == e.currentTarget) --> (_ => onClose()),
      div(
        cls := "dialog",
        role := "dialog",
        htmlAttr("aria-modal", com.raquo.laminar.codecs.StringAsIsCodec) := "true",
        aria.label := titleText,
        tabIndex := -1,
        h2(cls := "dialog-title", titleText),
        content,
        onKeyDown.filter(_.key == "Escape") --> { e =>
          e.stopPropagation()
          onClose()
        },
        onMountCallback { ctx =>
          val focusable = ctx.thisNode.ref.querySelector("input, textarea, select, button")
          (if focusable != null then focusable else ctx.thisNode.ref)
            .asInstanceOf[dom.HTMLElement]
            .focus()
        }
      )
    )

  /** Yes/no question before something destructive. */
  def confirm(
      question: String,
      confirmLabel: String,
      onConfirm: () => Unit,
      onClose: () => Unit
  ): HtmlElement =
    apply("Please confirm", onClose)(
      p(question),
      div(
        cls := "dialog-actions",
        button(cls := "secondary", "Cancel", onClick --> (_ => onClose())),
        button(
          cls := "danger-button",
          confirmLabel,
          onClick --> { _ =>
            onConfirm()
            onClose()
          }
        )
      )
    )
