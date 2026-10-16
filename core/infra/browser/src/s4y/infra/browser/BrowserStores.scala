package s4y.infra.browser

import org.scalajs.dom
import s4y.domain.errors.InfraFailure
import s4y.kv.KeyValueStore
import zio.*

import scala.scalajs.js

/** One IndexedDB object store of string values. Each call is its own IDB transaction (IDB
  * transactions cannot span ZIO steps); writes resolve on the transaction's `complete`, so they are
  * durable when the effect ends.
  */
final class KeyValueStoreIndexedDb private (db: dom.IDBDatabase, storeName: String)
    extends KeyValueStore:

  def get(key: String): IO[InfraFailure, Option[String]] =
    ZIO.async[Any, InfraFailure, Option[String]] { cb =>
      try
        val tx = db.transaction(storeName, dom.IDBTransactionMode.readonly)
        val req = tx.objectStore(storeName).get(key)
        req.onsuccess = _ =>
          val v = req.result.asInstanceOf[js.UndefOr[String]]
          cb(ZIO.succeed(v.toOption))
        req.onerror = _ => cb(ZIO.fail(InfraFailure(s"IndexedDB get $key failed")))
      catch case e: Throwable => cb(ZIO.fail(InfraFailure(e)))
    }

  def put(key: String, value: String): IO[InfraFailure, Unit] =
    write(_.put(value, key), s"put $key")

  def remove(key: String): IO[InfraFailure, Unit] = write(_.delete(key), s"delete $key")

  private def write(op: dom.IDBObjectStore => Unit, what: String): IO[InfraFailure, Unit] =
    ZIO.async[Any, InfraFailure, Unit] { cb =>
      try
        val tx = db.transaction(storeName, dom.IDBTransactionMode.readwrite)
        tx.oncomplete = _ => cb(ZIO.unit)
        tx.onerror = _ => cb(ZIO.fail(InfraFailure(s"IndexedDB $what failed")))
        tx.onabort = _ => cb(ZIO.fail(InfraFailure(s"IndexedDB $what aborted")))
        op(tx.objectStore(storeName))
      catch case e: Throwable => cb(ZIO.fail(InfraFailure(e)))
    }

object KeyValueStoreIndexedDb:
  def make(dbName: String, storeName: String): IO[InfraFailure, KeyValueStore] =
    ZIO.async[Any, InfraFailure, KeyValueStore] { cb =>
      try
        val req = dom.window.indexedDB.get.open(dbName, 1)
        req.onupgradeneeded = _ =>
          val db = req.result
          if !db.objectStoreNames.contains(storeName) then db.createObjectStore(storeName)
        req.onsuccess = _ => cb(ZIO.succeed(KeyValueStoreIndexedDb(req.result, storeName)))
        req.onerror = _ => cb(ZIO.fail(InfraFailure(s"cannot open IndexedDB $dbName")))
      catch case e: Throwable => cb(ZIO.fail(InfraFailure(e)))
    }

  def makeLayer(dbName: String, storeName: String): ZLayer[Any, InfraFailure, KeyValueStore] =
    ZLayer.fromZIO(make(dbName, storeName))

/** Small synchronous preferences (selected map, view, panel state). */
final class KeyValueStoreLocalStorage(prefix: String) extends KeyValueStore:
  private def storage = dom.window.localStorage

  def get(key: String): IO[InfraFailure, Option[String]] =
    ZIO.attempt(Option(storage.getItem(prefix + key))).mapError(InfraFailure(_))

  def put(key: String, value: String): IO[InfraFailure, Unit] =
    ZIO.attempt(storage.setItem(prefix + key, value)).mapError(InfraFailure(_))

  def remove(key: String): IO[InfraFailure, Unit] =
    ZIO.attempt(storage.removeItem(prefix + key)).mapError(InfraFailure(_))

object KeyValueStoreLocalStorage:
  def makeLayer(prefix: String): ULayer[KeyValueStore] =
    ZLayer.succeed(KeyValueStoreLocalStorage(prefix))

/** [[s4y.http.HttpClient]] over the browser's `fetch`. */
final class HttpClientFetch extends s4y.http.HttpClient:
  def getText(url: String, headers: Map[String, String]): IO[InfraFailure, String] =
    ZIO
      .fromPromiseJS {
        val init = new dom.RequestInit {}
        val h = dom.Headers()
        headers.foreach((k, v) => h.append(k, v))
        init.headers = h
        dom.fetch(url, init)
      }
      .mapError(e => InfraFailure(s"network error: ${e.getMessage}"))
      .flatMap { response =>
        if response.ok then ZIO.fromPromiseJS(response.text()).mapError(InfraFailure(_))
        else ZIO.fail(InfraFailure(s"HTTP ${response.status} from $url"))
      }

object HttpClientFetch:
  val layer: ULayer[s4y.http.HttpClient] = ZLayer.succeed(HttpClientFetch())
