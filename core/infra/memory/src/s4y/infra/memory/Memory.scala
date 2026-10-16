package s4y.infra.memory

import s4y.domain.errors.InfraFailure
import s4y.identity.Identifier
import s4y.identity.minting.IdentifierMint
import s4y.kv.KeyValueStore
import s4y.tx.{IdGenerator, TransactionContext, TransactionManager}
import zio.*

/** Local transactions: a single permit serialises them, which is all the atomicity a single-user,
  * single-tab store needs.
  */
final class TransactionContextMemory private[memory] () extends TransactionContext

final class TransactionManagerMemory(lock: Semaphore)
    extends TransactionManager[TransactionContextMemory]:
  private val context = TransactionContextMemory()

  def transaction[R, E, A](log: String)(
      effect: TransactionContextMemory ?=> ZIO[R, InfraFailure | E, A]
  ): ZIO[R, InfraFailure | E, A] =
    lock.withPermit(effect(using context))

object TransactionManagerMemory:
  val layer: ULayer[TransactionManager[TransactionContextMemory]] =
    ZLayer.fromZIO(Semaphore.make(1).map(TransactionManagerMemory(_)))

/** Random version-4 UUIDs. `scala.util.Random` keeps it identical on the JVM and in Scala.js, where
  * `UUID.randomUUID` needs a SecureRandom shim.
  */
final class IdGeneratorRandom(random: scala.util.Random) extends IdGenerator:
  def next[A]: UIO[Identifier[A]] = ZIO.succeed {
    val msb = (random.nextLong() & ~0xf000L) | 0x4000L
    val lsb = (random.nextLong() & 0x3fffffffffffffffL) | 0x8000000000000000L
    IdentifierMint.fromString[A](java.util.UUID(msb, lsb).toString).toOption.get
  }

object IdGeneratorRandom:
  val layer: ULayer[IdGenerator] = ZLayer.succeed(IdGeneratorRandom(scala.util.Random()))

final class KeyValueStoreMemory(ref: Ref[Map[String, String]]) extends KeyValueStore:
  def get(key: String): IO[InfraFailure, Option[String]] = ref.get.map(_.get(key))
  def put(key: String, value: String): IO[InfraFailure, Unit] = ref.update(_.updated(key, value))
  def remove(key: String): IO[InfraFailure, Unit] = ref.update(_ - key)

object KeyValueStoreMemory:
  val layer: ULayer[KeyValueStore] =
    ZLayer.fromZIO(Ref.make(Map.empty[String, String]).map(KeyValueStoreMemory(_)))
