package s4y.map2online.catalog.presentation.ui

import com.raquo.laminar.api.L.*
import com.raquo.laminar.codecs.StringAsIsCodec
import s4y.markup.MarkdownToHtml

/** Rendered Markdown. The renderer escapes text and drops unsafe URLs, so its output is safe to set
  * as HTML.
  */
object MarkdownView:
  private val innerHtml = htmlProp("innerHTML", StringAsIsCodec)

  def apply(markdown: Signal[String]): HtmlElement =
    div(cls := "markdown", innerHtml <-- markdown.map(MarkdownToHtml.render))
