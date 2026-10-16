package s4y.infra.memory

import s4y.domain.errors.InfraFailure
import s4y.tx.{IdGenerator, TransactionManager}
import zio.*
import zio.test.*

object MemorySpec extends ZIOSpecDefault:
  def spec = suite("memory infra")(
    test("transactions do not interleave") {
      for
        tm <- ZIO.service[TransactionManager[TransactionContextMemory]]
        log <- Ref.make(Vector.empty[String])
        step = (name: String) =>
          tm.transaction[Any, Nothing, Unit](name)(
            log.update(_ :+ s"$name start") *> ZIO.yieldNow *> log.update(_ :+ s"$name end")
          )
        _ <- step("a").zipPar(step("b"))
        entries <- log.get
      yield assertTrue(entries.grouped(2).forall(p => p(0).dropRight(6) == p(1).dropRight(4)))
    },
    test("generated ids are distinct UUIDs") {
      for
        gen <- ZIO.service[IdGenerator]
        ids <- ZIO.foreach(1 to 100)(_ => gen.next[Int])
      yield assertTrue(
        ids.distinct.size == 100,
        ids.forall(
          _.value.matches("[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}")
        )
      )
    },
    test("a transaction's failure is the caller's failure") {
      for
        tm <- ZIO.service[TransactionManager[TransactionContextMemory]]
        e <- tm.transaction[Any, String, Int]("fails")(ZIO.fail(InfraFailure("boom"))).flip
      yield assertTrue(e == InfraFailure("boom"))
    }
  ).provideLayer(TransactionManagerMemory.layer ++ IdGeneratorRandom.layer)
