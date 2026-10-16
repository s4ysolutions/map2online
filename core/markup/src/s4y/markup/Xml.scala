package s4y.markup

/** A small, lenient XML parser that also copes with the HTML found inside KML descriptions:
  * unclosed void tags (`<br>`), mismatched or missing close tags, HTML entities. Pure Scala so it
  * behaves identically on the JVM and in the browser.
  */
enum XmlNode:
  case Element(name: String, attributes: Map[String, String], children: Vector[XmlNode])
  case Text(value: String)

object XmlNode:
  extension (e: Element)
    /** Name without namespace prefix, lower case. */
    def localName: String = Xml.localName(e.name)

    def is(name: String): Boolean = e.localName == name.toLowerCase

    def attribute(name: String): Option[String] =
      e.attributes.collectFirst { case (k, v) if Xml.localName(k) == name.toLowerCase => v }

    def elements: Vector[Element] = e.children.collect { case c: Element => c }

    def child(name: String): Option[Element] = elements.find(_.is(name))

    def childrenNamed(name: String): Vector[Element] = elements.filter(_.is(name))

    /** Depth-first search, including `e` itself. */
    def find(p: Element => Boolean): Option[Element] =
      if p(e) then Some(e)
      else e.elements.iterator.map(_.find(p)).collectFirst { case Some(x) => x }

    /** Concatenated text of all descendants. */
    def text: String = e.children.map {
      case t: Text    => t.value
      case c: Element => c.text
    }.mkString

    /** Children serialised back to markup with text left unescaped: the HTML a KML description
      * means, whether it was escaped, in CDATA or written as raw elements.
      */
    def innerHtml: String = e.children.map(Xml.renderHtml).mkString

final case class XmlError(message: String, offset: Int)

object Xml:
  val DocumentName = "#document"

  private val voidElements = Set("br", "hr", "img", "input", "wbr")

  def localName(name: String): String =
    val i = name.indexOf(':')
    (if i >= 0 then name.substring(i + 1) else name).toLowerCase

  /** Parses into a synthetic [[DocumentName]] element holding the top-level nodes. */
  def parse(input: String): Either[XmlError, XmlNode.Element] = Parser(input).run()

  def renderHtml(node: XmlNode): String = node match
    case XmlNode.Text(v)                        => v
    case XmlNode.Element(name, attrs, children) =>
      val a = attrs.map((k, v) => s""" $k="${escapeAttribute(v)}"""").mkString
      if children.isEmpty && voidElements(localName(name)) then s"<$name$a>"
      else s"<$name$a>${children.map(renderHtml).mkString}</$name>"

  def escapeText(s: String): String =
    s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

  def escapeAttribute(s: String): String = escapeText(s).replace("\"", "&quot;")

  private val namedEntities = Map(
    "amp" -> "&",
    "lt" -> "<",
    "gt" -> ">",
    "quot" -> "\"",
    "apos" -> "'",
    "nbsp" -> " ",
    "laquo" -> "«",
    "raquo" -> "»",
    "mdash" -> "—",
    "ndash" -> "–",
    "hellip" -> "…",
    "copy" -> "©",
    "deg" -> "°"
  )

  def decodeEntities(s: String): String =
    if s.indexOf('&') < 0 then s
    else
      val out = StringBuilder()
      var i = 0
      while i < s.length do
        val c = s.charAt(i)
        val semi = if c == '&' then s.indexOf(';', i) else -1
        if semi > i + 1 && semi - i <= 10 then
          val name = s.substring(i + 1, semi)
          val decoded =
            if name.startsWith("#x") || name.startsWith("#X") then
              parseInt(name.substring(2), 16).flatMap(codePoint)
            else if name.startsWith("#") then parseInt(name.substring(1), 10).flatMap(codePoint)
            else namedEntities.get(name)
          decoded match
            case Some(d) =>
              out.append(d)
              i = semi + 1
            case None =>
              out.append(c)
              i += 1
        else
          out.append(c)
          i += 1
      out.toString

  private def codePoint(cp: Int): Option[String] =
    if cp > 0 && cp <= Character.MAX_CODE_POINT then Some(String(Character.toChars(cp))) else None

  private def parseInt(s: String, radix: Int): Option[Int] =
    try Some(Integer.parseInt(s, radix))
    catch case _: NumberFormatException => None

  private final class Parser(in: String):
    private var pos = 0

    private final class Open(val name: String, val attributes: Map[String, String]):
      val children = Vector.newBuilder[XmlNode]

    def run(): Either[XmlError, XmlNode.Element] =
      val stack = scala.collection.mutable.Stack(Open(DocumentName, Map.empty))

      def close(): Unit =
        val o = stack.pop()
        stack.top.children += XmlNode.Element(o.name, o.attributes, o.children.result())

      var error: Option[XmlError] = None
      while error.isEmpty && pos < in.length do
        if in.startsWith("<!--", pos) then
          val end = in.indexOf("-->", pos + 4)
          if end < 0 then error = Some(XmlError("unterminated comment", pos)) else pos = end + 3
        else if in.startsWith("<![CDATA[", pos) then
          val end = in.indexOf("]]>", pos + 9)
          if end < 0 then error = Some(XmlError("unterminated CDATA", pos))
          else
            stack.top.children += XmlNode.Text(in.substring(pos + 9, end))
            pos = end + 3
        else if in.startsWith("<?", pos) || in.startsWith("<!", pos) then
          val end = in.indexOf('>', pos)
          if end < 0 then error = Some(XmlError("unterminated declaration", pos)) else pos = end + 1
        else if in.startsWith("</", pos) then
          val end = in.indexOf('>', pos)
          if end < 0 then error = Some(XmlError("unterminated close tag", pos))
          else
            val name = localName(in.substring(pos + 2, end).trim)
            // close up to the matching ancestor; a stray close tag is ignored
            if stack.exists(o => o.name != DocumentName && localName(o.name) == name) then
              while localName(stack.top.name) != name do close()
              close()
            pos = end + 1
        else if in.charAt(pos) == '<' && pos + 1 < in.length && isNameStart(in.charAt(pos + 1)) then
          openTag() match
            case Left(e)                           => error = Some(e)
            case Right((name, attrs, selfClosing)) =>
              val o = Open(name, attrs)
              if selfClosing || voidElements(localName(name)) then
                stack.top.children += XmlNode.Element(name, attrs, Vector.empty)
              else stack.push(o)
        else
          val next = in.indexOf('<', pos + 1)
          val end = if next < 0 then in.length else next
          stack.top.children += XmlNode.Text(decodeEntities(in.substring(pos, end)))
          pos = end

      error match
        case Some(e) => Left(e)
        case None    =>
          while stack.size > 1 do close()
          val root = stack.pop()
          Right(XmlNode.Element(DocumentName, Map.empty, mergeText(root.children.result())))
      end match
    end run

    private def isNameStart(c: Char): Boolean = c.isLetter || c == '_' || c == ':'

    private def isNameChar(c: Char): Boolean =
      c.isLetterOrDigit || c == '_' || c == ':' || c == '-' || c == '.'

    private def skipSpaces(): Unit = while pos < in.length && in.charAt(pos).isWhitespace do
      pos += 1

    private def name(): String =
      val start = pos
      while pos < in.length && isNameChar(in.charAt(pos)) do pos += 1
      in.substring(start, pos)

    /** At `<name`; returns the tag name, attributes and whether it was `/>`. */
    private def openTag(): Either[XmlError, (String, Map[String, String], Boolean)] =
      val start = pos
      pos += 1
      val tag = name()
      val attrs = Map.newBuilder[String, String]
      var result: Option[Either[XmlError, (String, Map[String, String], Boolean)]] = None
      while result.isEmpty do
        skipSpaces()
        if pos >= in.length then result = Some(Left(XmlError("unterminated tag", start)))
        else if in.startsWith("/>", pos) then
          pos += 2
          result = Some(Right((tag, attrs.result(), true)))
        else if in.charAt(pos) == '>' then
          pos += 1
          result = Some(Right((tag, attrs.result(), false)))
        else if isNameChar(in.charAt(pos)) then
          val attr = name()
          skipSpaces()
          if pos < in.length && in.charAt(pos) == '=' then
            pos += 1
            skipSpaces()
            attrs += attr -> decodeEntities(attributeValue())
          else attrs += attr -> ""
        else pos += 1 // garbage inside a tag: skip it
      result.get
    end openTag

    private def attributeValue(): String =
      if pos < in.length && (in.charAt(pos) == '"' || in.charAt(pos) == '\'') then
        val q = in.charAt(pos)
        val end = in.indexOf(q, pos + 1)
        val stop = if end < 0 then in.length else end
        val v = in.substring(pos + 1, stop)
        pos = math.min(in.length, stop + 1)
        v
      else
        val start = pos
        while pos < in.length && !in.charAt(pos).isWhitespace && in.charAt(pos) != '>' do pos += 1
        in.substring(start, pos)
  end Parser

  /** Adjacent text nodes (text followed by CDATA) become one. */
  private def mergeText(nodes: Vector[XmlNode]): Vector[XmlNode] =
    nodes
      .foldLeft(Vector.empty[XmlNode]) {
        case (acc :+ XmlNode.Text(a), XmlNode.Text(b)) => acc :+ XmlNode.Text(a + b)
        case (acc, e: XmlNode.Element) => acc :+ e.copy(children = mergeText(e.children))
        case (acc, t)                  => acc :+ t
      }
end Xml
