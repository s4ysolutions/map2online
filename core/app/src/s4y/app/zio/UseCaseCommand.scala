package s4y.app.zio

import zio.{IO, Tag, ZIO}

/** Command whose use case touches a port: pins `Response` to `IO[E, A]`. */
trait UseCaseCommand extends s4y.app.UseCaseCommand:
  type E
  type A
  type Response = IO[E, A]

object UseCase:
  /** Calls the `UseCase[T]` found in the environment. */
  def useCase[T <: UseCaseCommand](command: T)(using
      Tag[s4y.app.UseCase[T]]
  ): ZIO[s4y.app.UseCase[T], command.E, command.A] =
    ZIO.serviceWithZIO[s4y.app.UseCase[T]](_(command))
