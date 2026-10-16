---
name: endpoint-contract-separation
description: Use when building HTTP APIs with OpenAPI generation, when a route handler is growing schema definitions, or when endpoint metadata and handler logic are mixed in the same function
metadata:
  tags: [http, openapi, architecture, language-agnostic]
---

# Endpoint Contract Separation

**Scope:** language-agnostic, HTTP API pattern

## Overview

An **endpoint** is the OpenAPI contract: path, method, input type, output type, error type. A **route** is the handler implementation. They are defined in separate functions / objects and joined only at the composition point.

## Structure

```
Languages.endpoint(prefix)         ← contract: types + path + docs
Languages.route(endpoint, useCase) ← implementation: calls use case, maps DTO

// joined at the HTTP orchestrator or composition root
endpoint = Languages.endpoint(prefix)
routes ++ Languages.route(endpoint, ucGetLanguages)
openAPI = OpenAPIGen.fromEndpoints(..., endpoint, ...)
```

## Endpoint Object

```scala
// All schema/type information lives here
def endpoint(prefix: PathCodec[Unit]): GetLanguagesEndpoint =
  Endpoint(GET / prefix / "languages")
    .tag("Vocabla")
    .out[GetLanguagesResponse]
    .outError[InternalServerError500](Status.InternalServerError)
```

## Route Function

```scala
// Implementation only — no type declarations
def route(endpoint: GetLanguagesEndpoint,
          useCase: UseCase[GetLanguagesCommand]): Route[Any, Response] =
  endpoint.implement { _ =>
    useCase(new GetLanguagesCommand())
      .map { r => GetLanguagesResponse(...) }
      .mapError { case InfraFailure(_,_) => InternalServerError500("...") }
  }
```

## Naming the DTO Type (zio-schema / OpenAPI)

zio-http derives the OpenAPI component name from the Scala class name (`TypeId`) — there is no annotation that renames the type for OpenAPI while keeping a different class name (`@AvroAnnotations.name` exists but is Avro-codec-only and ignored by OpenAPI gen). A DTO called `GetLanguagesResponseDto` therefore shows up in the generated spec as `GetLanguagesResponseDto`, leaking implementation naming into the public contract.

**Fix:** name the DTO the same as the domain concept (`GetLanguagesResponse`, not `GetLanguagesResponseDto`) and let the package qualify it — `s4y.vocabla.contracts.http.LanguagesContract.GetLanguagesResponse` vs. the domain type in `s4y.vocabla.domain`. Where a call site needs both in scope, alias the import for local clarity: `import ...LanguagesContract.GetLanguagesResponse as GetLanguagesResponseDto`.

## Why Separate

| Concern | Endpoint | Route |
|---------|----------|-------|
| OpenAPI generation | ✅ passes endpoint to OpenAPIGen | ❌ |
| Type safety | ✅ typed in/out/error slots | ✅ implementation checked against contract |
| Middleware | ✅ auth type declared on endpoint | ✅ implementation called in orchestrator (composition root) |
| Testability | independent contract test | independent handler test |

Endpoints are **named, typed values** that the HTTP orchestrator can thread through both OpenAPI generation and route binding — impossible if the contract is embedded inside the handler.

## Path Segments Come From the Contract, Not the Endpoint Function

If the contract module already declares the route's path (e.g.
`LanguagesContract.pathSegments: Seq[String]` — see `client-gateway-port`,
where the client derives its request path from this same value), the
endpoint function must build its `PathCodec` from that value too, not from a
second, independently-typed literal:

```scala
// WRONG — path duplicated as a string literal; contract's pathSegments
// and this literal can drift independently with no compiler error
def endpoint(prefix: PathCodec[Unit]): GetLanguagesEndpoint =
  Endpoint((GET / prefix / "vocabla" / "languages") ?? Doc.p("..."))

// CORRECT — server derives the path from the same contract value the
// client already uses; renaming pathSegments breaks both sides together
private def path(prefix: PathCodec[Unit]): PathCodec[Unit] =
  LanguagesContract.pathSegments.foldLeft(prefix)(_ / _)

def endpoint(prefix: PathCodec[Unit]): GetLanguagesEndpoint =
  Endpoint((GET / path(prefix)) ?? Doc.p("..."))
```

This is what "path segments live on the contract" (from `client-gateway-port`)
actually requires to hold — a contract value only prevents drift if *both*
sides read it. A hardcoded path literal on the server compiles fine and
passes every unit test that mocks the use case; it silently 404s the moment
a real client hits it. A JVM-side integration test that runs a real server
and a real client gateway against the same contract (see the "JVM contract
round-trip test" pattern) is the way to catch this mechanically instead of
by manual review.

## Common Mistakes

**Defining the schema inside `.implement { ... }`** — the handler lambda becomes unreadable and the endpoint cannot be passed to OpenAPI gen separately.

**Endpoints as anonymous values** — giving endpoints named types (`type GetLanguagesEndpoint = Endpoint[...]`) lets the orchestrator store and pass them by name.

**Route calls repository directly** — the route maps HTTP ↔ command; business calls go through the use case.

**Path built from a string literal when the contract already has `pathSegments`** — see above; this is the single most common way contract and route drift apart, and it produces no compiler error, only a runtime 404.

