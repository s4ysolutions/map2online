package s4y.markup

import munit.FunSuite

class XmlSuite extends FunSuite:
  private def parse(s: String) = Xml.parse(s).fold(e => fail(e.toString), identity)

  test("elements, attributes, text and CDATA") {
    val doc = parse("""<?xml version="1.0"?><a id='x'><b>t &amp; u</b><![CDATA[<raw>]]></a>""")
    val a = doc.child("a").get
    assertEquals(a.attribute("ID"), Some("x"))
    assertEquals(a.child("b").map(_.text), Some("t & u"))
    assertEquals(a.text, "t & u<raw>")
  }

  test("namespace prefixes and case are ignored when matching names") {
    val doc = parse("""<kml:Placemark><gx:Track/></kml:Placemark>""")
    assert(doc.child("placemark").flatMap(_.child("track")).isDefined)
  }

  test("an unclosed <br> does not swallow the rest of the document") {
    val doc = parse("<d>one<br>two</d><n>x</n>")
    assertEquals(doc.child("d").map(_.text), Some("onetwo"))
    assertEquals(doc.child("n").map(_.text), Some("x"))
  }

  test("a stray close tag is ignored and unclosed tags close at the end") {
    val doc = parse("<a><b>x</c></b><i>y</a>")
    assertEquals(doc.child("a").map(_.text), Some("xy"))
  }

  test("numeric and HTML entities decode") {
    assertEquals(
      Xml.decodeEntities("&#1055;&#x438; &laquo;&nbsp;&raquo; &unknown;"),
      "Пи « » &unknown;"
    )
  }

  test("unterminated CDATA is an error") {
    assert(Xml.parse("<a><![CDATA[oops</a>").isLeft)
  }

class HtmlToMarkdownSuite extends FunSuite:
  import HtmlToMarkdown.convert

  test("plain text keeps its lines") {
    assertEquals(convert("  first line\n  second line  "), "first line\nsecond line")
  }

  test("inline formatting, links and images") {
    assertEquals(
      convert(
        """<b>bold</b> and <i>it</i>, <a href="https://x.org/a_b">site</a> <img src="https://x.org/i.png" alt="pic">"""
      ),
      "**bold** and *it*, [site](https://x.org/a_b) ![pic](https://x.org/i.png)"
    )
  }

  test("paragraphs, breaks and lists") {
    assertEquals(
      convert("<p>one<br>two</p><ul><li>a</li><li>b</li></ul><ol><li>c</li></ol>"),
      "one\ntwo\n\n- a\n- b\n\n1. c"
    )
  }

  test("headings and rules") {
    assertEquals(convert("<h2>Title</h2><hr><p>x</p>"), "## Title\n\n---\n\nx")
  }

class MarkdownToHtmlSuite extends FunSuite:
  import MarkdownToHtml.render

  test("paragraphs with line breaks") {
    assertEquals(render("one\ntwo\n\nthree"), "<p>one<br>two</p>\n<p>three</p>")
  }

  test("headings, lists, quotes, rules and code") {
    assertEquals(
      render("# H\n- a\n- b\n1. c\n> q\n---\n```\n<x>\n```"),
      "<h1>H</h1>\n<ul><li>a</li><li>b</li></ul>\n<ol><li>c</li></ol>\n<blockquote><p>q</p></blockquote>\n<hr>\n<pre><code>&lt;x&gt;</code></pre>"
    )
  }

  test("inline emphasis does not touch URLs or code") {
    assertEquals(
      render("**b** *i* `a_b_c` [l_ink](https://x.org/a_b_c) snake_case_name"),
      """<p><strong>b</strong> <em>i</em> <code>a_b_c</code> <a href="https://x.org/a_b_c" target="_blank" rel="noopener">l_ink</a> snake_case_name</p>"""
    )
  }

  test("HTML in the source is escaped") {
    assertEquals(
      render("<script>alert(1)</script>"),
      "<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>"
    )
  }

  test("unsafe URLs are dropped, keeping the text") {
    assertEquals(render("[x](javascript:alert%281%29)"), "<p>x</p>")
  }

  test("Markdown produced from HTML renders back to equivalent HTML") {
    val md = HtmlToMarkdown.convert("<p><b>Hi</b><br>there</p><ul><li>one</li></ul>")
    assertEquals(render(md), "<p><strong>Hi</strong><br>there</p>\n<ul><li>one</li></ul>")
  }
