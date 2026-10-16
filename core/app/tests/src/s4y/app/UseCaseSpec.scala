package s4y.app

// `_root_` because the `s4y.app.zio` package shadows `zio` inside `s4y.app`.

import _root_.zio.test.*
import _root_.zio.{IO, ZIO, ZLayer}

object UseCaseSpec extends ZIOSpecDefault:

  final case class Twice(n: Int) extends s4y.app.zio.UseCaseCommand:
    type E = String
    type A = Int

  private val doubling: s4y.app.UseCase[Twice] = new s4y.app.UseCase[Twice]:
    def apply(command: Twice): IO[String, Int] =
      if command.n < 0 then ZIO.fail("negative") else ZIO.succeed(command.n * 2)

  def spec = suite("UseCase.useCase")(
    test("calls the use case from the environment") {
      for r <- s4y.app.zio.UseCase.useCase(Twice(21))
      yield assertTrue(r == 42)
    },
    test("keeps the command's typed error") {
      for e <- s4y.app.zio.UseCase.useCase(Twice(-1)).flip
      yield assertTrue(e == "negative")
    }
  ).provideLayer(ZLayer.succeed(doubling))
