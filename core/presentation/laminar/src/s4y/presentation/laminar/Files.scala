package s4y.presentation.laminar

import org.scalajs.dom

import scala.scalajs.js

/** Browser file in/out. */
object Files:
  /** Reads text files, calling `onRead(name, text)` for each. */
  def readText(files: dom.FileList)(onRead: (String, String) => Unit): Unit =
    (0 until files.length).foreach { i =>
      val f = files(i)
      val reader = dom.FileReader()
      reader.onload = _ => onRead(f.name, reader.result.asInstanceOf[String])
      reader.readAsText(f)
    }

  /** Offers `text` as a file download. */
  def download(fileName: String, mime: String, text: String): Unit =
    val blob = dom.Blob(
      js.Array(text),
      new dom.BlobPropertyBag:
        `type` = mime
    )
    val url = dom.URL.createObjectURL(blob)
    val a = dom.document.createElement("a").asInstanceOf[dom.HTMLAnchorElement]
    a.href = url
    a.setAttribute("download", fileName)
    dom.document.body.appendChild(a)
    a.click()
    dom.document.body.removeChild(a)
    js.timers.setTimeout(1000)(dom.URL.revokeObjectURL(url))
