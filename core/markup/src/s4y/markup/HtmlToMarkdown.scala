package s4y.markup

/** Converts description HTML (as found in KML files) to Markdown.
  *
  * Text without any markup is taken as plain text and kept line for line; once there is markup,
  * HTML whitespace rules apply.
  */
object HtmlToMarkdown:

  def convert(html: String): String =
    Xml.parse(html) match
      case Left(_)                            => html.trim
      case Right(doc) if doc.elements.isEmpty =>
        doc.text.linesIterator.map(_.strip).mkString("\n").trim
      case Right(doc) => normalize(blocks(doc.children))

  private def normalize(md: String): String =
    md.linesIterator.map(_.stripTrailing).mkString("\n").replaceAll("\n{3,}", "\n\n").trim

  private def blocks(nodes: Vector[XmlNode]): String = nodes.map(block).mkString

  private def block(node: XmlNode): String = node match
    case XmlNode.Text(v)    => collapse(v)
    case e: XmlNode.Element =>
      e.localName match
        case "p" | "div" | "section" | "article" => s"\n\n${inlines(e.children).trim}\n\n"
        case "br"                                => "\n"
        case "hr"                                => "\n\n---\n\n"
        case h if h.length == 2 && h.head == 'h' && h(1).isDigit =>
          s"\n\n${"#" * (h(1) - '0')} ${inlines(e.children).trim}\n\n"
        case "ul"         => s"\n\n${list(e, ordered = false)}\n\n"
        case "ol"         => s"\n\n${list(e, ordered = true)}\n\n"
        case "blockquote" =>
          val quoted = normalize(blocks(e.children)).linesIterator.map(l => s"> $l").mkString("\n")
          s"\n\n$quoted\n\n"
        case "pre"                                 => s"\n\n```\n${e.text.stripLineEnd}\n```\n\n"
        case "script" | "style" | "head" | "title" => ""
        case _                                     => inlines(Vector(e))

  private def list(e: XmlNode.Element, ordered: Boolean): String =
    e.elements
      .filter(_.is("li"))
      .zipWithIndex
      .map((li, i) => s"${if ordered then s"${i + 1}." else "-"} ${inlines(li.children).trim}")
      .mkString("\n")

  private def inlines(nodes: Vector[XmlNode]): String = nodes.map(inlineNode).mkString

  private def inlineNode(node: XmlNode): String = node match
    case XmlNode.Text(v)    => collapse(v)
    case e: XmlNode.Element =>
      e.localName match
        case "br"           => "\n"
        case "b" | "strong" => wrap("**", inlines(e.children))
        case "i" | "em"     => wrap("*", inlines(e.children))
        case "code"         => s"`${e.text}`"
        case "a"            =>
          val text = inlines(e.children).trim
          e.attribute("href") match
            case Some(href) if href.nonEmpty => s"[${if text.isEmpty then href else text}]($href)"
            case _                           => text
        case "img" =>
          e.attribute("src")
            .filter(_.nonEmpty)
            .fold("")(src => s"![${e.attribute("alt").getOrElse("")}]($src)")
        case "p" | "div" | "ul" | "ol" | "blockquote" | "pre" | "hr" => block(e)
        case h if h.length == 2 && h.head == 'h' && h(1).isDigit     => block(e)
        case "script" | "style"                                      => ""
        case _                                                       => inlines(e.children)

  private def wrap(marker: String, s: String): String =
    val t = s.trim
    if t.isEmpty then s else s"$marker$t$marker"

  private def collapse(s: String): String = s.replaceAll("\\s+", " ")
