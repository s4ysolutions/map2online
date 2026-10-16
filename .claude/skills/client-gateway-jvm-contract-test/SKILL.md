---
name: client-gateway-jvm-contract-test
description: Use when a Scala.js client gateway and its zio-http server route can silently drift apart and you want a regression test catching that contract drift without a browser, or when deciding whether a cross-compiled client module is worth the extra build targets
metadata:
  tags: [scala, zio, zio-http, testing, architecture]
---

# JVM Contract Round-Trip Test

**Scope:** Scala 3 + ZIO 2.x + zio-http, a feature already following `client-gateway-port` and `endpoint-contract-separation`

## Overview

`client-gateway-port` and `endpoint-contract-separation` both claim a single
contract module keeps server and client from drifting — but that claim is
only as good as what actually gets tested. Unit tests that mock the use case
on the server side, and unit tests that mock the `HttpGateway` on the client
side, both pass even if the server's route path or the client's request
path silently disagree. The only test that catches this is one that runs a
real server and a real client against the same contract.

This requires the client port and its HTTP adapter to be cross-compiled to
the JVM (see `client-gateway-port`'s Module Layout) — the JS-only gateway
code cannot run inside a JVM test.

## Pattern

```scala
package s4y.vocabla.client.http

import s4y.http.gateway.SttpHttpGatewayJvm
import s4y.infra.memory.{TransactionContextMemory, TransactionManagerMemory}
import s4y.vocabla.app.usecases.GetLanguagesCommand
import s4y.vocabla.domain.vo.Lang
import s4y.vocabla.http.routes.Languages
import s4y.vocabla.infra.memory.LanguagesRepositoryMemory
import zio.http.codec.PathCodec
import zio.http.{Routes, Server}
import zio.test.{Spec, TestEnvironment, ZIOSpecDefault, assertTrue}
import zio.{Scope, ZIO, ZLayer}

object LanguagesGatewayHttpIntegrationSpec extends ZIOSpecDefault:

  private val useCaseLayer =
    (TransactionManagerMemory.layer ++ LanguagesRepositoryMemory.layer) >>>
      GetLanguagesCommand.makeLayer[TransactionContextMemory]

  private val serverLayer =
    ZLayer.succeed(Server.Config.default.port(0)) >>> Server.live

  override def spec: Spec[TestEnvironment & Scope, Any] =
    suite("LanguagesGatewayHttp (JVM integration)")(
      test("fetches languages from a real server through the shared contract") {
        for
          useCase <- ZIO.service[GetLanguagesCommand.GetLanguagesUseCase[TransactionContextMemory]]
          server  <- ZIO.service[Server]
          endpoint = Languages.endpoint(PathCodec.empty)
          _       <- server.install(Routes(Languages.route(endpoint, useCase)))
          port    <- server.port
          httpGateway <- SttpHttpGatewayJvm(s"http://localhost:$port")
          gateway  = LanguagesGatewayHttp(httpGateway)
          result  <- gateway.getLanguages
        yield assertTrue(
          result.languages.nonEmpty,
          result.defaultLang.code == Lang.Code("en")
        )
      }
    ).provideLayer(useCaseLayer ++ serverLayer)
```

## What This Catches That Unit Tests Don't

| Drift | Server-side unit test | Client-side unit test | This test |
|-------|:---:|:---:|:---:|
| Route path literal diverges from `Contract.pathSegments` | ❌ passes (mocked use case, no real routing) | ❌ passes (mocked `HttpGateway`, no real request) | ✅ 404s |
| `Schema` encode/decode asymmetry (field added on one side only) | ❌ passes | ❌ passes | ✅ decode failure |
| Domain VO ↔ DTO mapping drops or fabricates a field | ❌ passes if the use case test only checks the domain VO | ❌ passes if the adapter test only checks decode, not the resulting VO | ✅ assertion on the round-tripped value catches it |

## Key Pieces

- **`PathCodec.empty` as the server prefix** — the client always builds its
  request path as `"/" + pathSegments.mkString("/")` with no separate
  prefix concept (see `client-gateway-port`). Serve with an empty prefix so
  the two sides agree on the exact same path, matching production where the
  REST product's prefix and the client's assumed path are the same contract
  value.
- **`Server.Config.default.port(0)`** — bind an ephemeral port so the test
  is parallel-safe and needs no fixture cleanup; read the actual bound port
  back via `server.port`.
- **Memory-backed use case, not the pg adapter** — this test is about the
  HTTP contract, not persistence; see `static-data-memory-adapter` for why
  memory is the right adapter to wire here regardless of what production
  uses.
- **Assert on the round-tripped domain VO, not just "no exception"** — the
  whole value of this test is catching data loss (see the sentinel-fabrication
  mistake in `client-gateway-port`); assert on specific fields, not just
  `.isRight` / non-crash.

## When NOT to Bother

- Feature has no separate client gateway (server-only, or the client never
  crosses HTTP — e.g. same-process call).
- Contract has no path segments or Schema of its own to drift (trivial
  no-body endpoints where drift risk is near zero).
- The overhead of cross-compiling client + client.http to JVM only to
  support one test isn't worth it for a feature likely to be deleted soon —
  use judgement, this is insurance, not a mandate for every endpoint.

## Common Mistakes

**Testing against the pg-backed use case** — pulls in a real database as a
dependency for what should be a fast, DB-free contract check. Use the
memory adapter; the contract round-trip doesn't care which repository
backs the use case.

**Asserting only `result.isRight` / "no exception thrown"** — misses the
exact class of bug this test exists to catch (a dropped or fabricated
field surviving encode/decode without erroring). Assert on real field
values.

**Skipping cross-compilation and testing the adapter with a mocked
`HttpGateway` instead** — this is a legitimate unit test but it is not this
test; a mocked gateway can never catch a path or Schema mismatch against
the real server route, because there is no real server route in the test.
