package s4y.markup

/** Renders the Markdown subset descriptions use: paragraphs (single newlines are line breaks), `#`
  * headings, `-`/`*`/`1.` lists, `>` quotes, fenced code, `---` rules, `**bold**`, `*italic*`,
  * `` `code` ``, links and images.
  *
  * Output is safe to insert into the DOM: all text is escaped and only http(s), mailto, relative
  * and `data:image/` URLs are kept.
  */
object MarkdownToHtml:

  def render(markdown: String): String =
    val lines = markdown.replace("\r\n", "\n").split("\n", -1).toVector
    blocks(lines, 0, Vector.empty).mkString("\n")

  private val heading = """^(#{1,6})\s+(.*)$""".r
  private val bullet = """^\s*[-*+]\s+(.*)$""".r
  private val ordered = """^\s*\d+[.)]\s+(.*)$""".r
  private val rule = """^\s*([-*_])(\s*\1){2,}\s*$""".r

  private def isBlank(l: String) = l.trim.isEmpty

  @annotation.tailrec
  private def blocks(lines: Vector[String], i: Int, out: Vector[String]): Vector[String] =
    if i >= lines.size then out
    else
      val line = lines(i)
      if isBlank(line) then blocks(lines, i + 1, out)
      else if line.trim.startsWith("```") then
        val end = lines.indexWhere(_.trim.startsWith("```"), i + 1)
        val stop = if end < 0 then lines.size else end
        val code = lines.slice(i + 1, stop).map(Xml.escapeText).mkString("\n")
        blocks(lines, stop + 1, out :+ s"<pre><code>$code</code></pre>")
      else
        line match
          case heading(hashes, text) =>
            blocks(
              lines,
              i + 1,
              out :+ s"<h${hashes.length}>${inlines(text.trim)}</h${hashes.length}>"
            )
          case rule(_, _) => blocks(lines, i + 1, out :+ "<hr>")
          case bullet(_)  =>
            val items = lines.drop(i).takeWhile(l => bullet.matches(l))
            val lis = items.map { case bullet(t) => s"<li>${inlines(t)}</li>"; case _ => "" }
            blocks(lines, i + items.size, out :+ s"<ul>${lis.mkString}</ul>")
          case ordered(_) =>
            val items = lines.drop(i).takeWhile(l => ordered.matches(l))
            val lis = items.map { case ordered(t) => s"<li>${inlines(t)}</li>"; case _ => "" }
            blocks(lines, i + items.size, out :+ s"<ol>${lis.mkString}</ol>")
          case l if l.trim.startsWith(">") =>
            val quoted = lines.drop(i).takeWhile(_.trim.startsWith(">"))
            val inner = render(quoted.map(_.trim.drop(1).stripPrefix(" ")).mkString("\n"))
            blocks(lines, i + quoted.size, out :+ s"<blockquote>$inner</blockquote>")
          case _ =>
            val para = lines
              .drop(i)
              .takeWhile(l =>
                !isBlank(l) && !heading.matches(l) && !rule.matches(l) && !bullet.matches(l) &&
                  !ordered.matches(l) && !l.trim.startsWith(">") && !l.trim.startsWith("```")
              )
            blocks(
              lines,
              i + para.size,
              out :+ s"<p>${para.map(l => inlines(l.trim)).mkString("<br>")}</p>"
            )
        end match
  end blocks

  private val code = """`([^`]+)`""".r
  private val image = """!\[([^\]]*)\]\(([^)\s]+)\)""".r
  private val link = """\[([^\]]+)\]\(([^)\s]+)\)""".r
  private val strong = """\*\*(.+?)\*\*|(^|[^\w])__(.+?)__(?=[^\w]|$)""".r
  private val emphasis = """\*(.+?)\*|(^|[^\w])_(.+?)_(?=[^\w]|$)""".r
  private val placeholder = "\u0000(\\d+)\u0000".r

  private def q(s: String) = java.util.regex.Matcher.quoteReplacement(s)

  /** Inline markup. Code spans, images and links become placeholders first so the emphasis rules
    * never touch code or URLs.
    */
  private def inlines(text: String): String =
    val held = scala.collection.mutable.ArrayBuffer.empty[String]
    def hold(html: String): String =
      held += html
      s"\u0000${held.size - 1}\u0000"

    var html = code.replaceAllIn(text, m => q(hold(s"<code>${Xml.escapeText(m.group(1))}</code>")))
    html = Xml.escapeText(html)
    html = image.replaceAllIn(
      html,
      m =>
        q(
          safeUrl(m.group(2)).fold(m.group(1))(u => hold(s"""<img src="$u" alt="${m.group(1)}">"""))
        )
    )
    html = link.replaceAllIn(
      html,
      m =>
        q(
          safeUrl(m.group(2)).fold(emphasize(m.group(1)))(u =>
            hold(s"""<a href="$u" target="_blank" rel="noopener">${emphasize(m.group(1))}</a>""")
          )
        )
    )
    html = emphasize(html)
    // placeholders may nest (a link around an image): restore until stable
    var restored = html
    var previous = ""
    while restored != previous do
      previous = restored
      restored = placeholder.replaceAllIn(restored, m => q(held(m.group(1).toInt)))
    restored

  private def emphasize(html: String): String =
    val bold = strong.replaceAllIn(
      html,
      m =>
        q(
          if m.group(1) != null then s"<strong>${m.group(1)}</strong>"
          else s"${m.group(2)}<strong>${m.group(3)}</strong>"
        )
    )
    emphasis.replaceAllIn(
      bold,
      m =>
        q(
          if m.group(1) != null then s"<em>${m.group(1)}</em>"
          else s"${m.group(2)}<em>${m.group(3)}</em>"
        )
    )

  /** `url` is already HTML-escaped (it went through escapeText). */
  private def safeUrl(url: String): Option[String] =
    val lower = url.toLowerCase
    val ok =
      lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("mailto:") ||
        lower.startsWith("data:image/") || !lower.matches("^[a-z][a-z0-9+.-]*:.*")
    Option.when(ok)(url.replace("\"", "&quot;"))
