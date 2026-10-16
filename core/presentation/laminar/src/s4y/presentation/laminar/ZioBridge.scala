package s4y.presentation.laminar

import org.scalajs.dom
import zio.{Runtime, Unsafe, ZIO}

/** Launches a UI-triggered effect on the composition root's runtime.
  *
  * Effects reaching here have already folded their errors into UI state (`E = Nothing`); defects
  * are logged once, centrally, because the discarded Future would otherwise swallow them.
  */
object ZioBridge:
  def run[R](effect: ZIO[R, Nothing, Unit])(using runtime: Runtime[R]): Unit =
    Unsafe.unsafe { implicit unsafe =>
      val _ = runtime.unsafe.runToFuture(logDefects(effect))
    }

  private def logDefects[R, A](effect: ZIO[R, Nothing, A]): ZIO[R, Nothing, A] =
    effect.tapDefect(cause =>
      ZIO.succeed(dom.console.error("ZioBridge defect:", cause.prettyPrint))
    )
