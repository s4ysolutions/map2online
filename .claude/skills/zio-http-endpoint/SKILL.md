---
name: zio-http-endpoint
description: Use when adding a new HTTP endpoint to a feature adapter, when mapping domain errors to HTTP status codes, when deciding where DTOs live, or when wiring middleware context (Locale, authenticated user) inside a route
metadata:
  tags: [zio, zio-http, scala, http, presentation]
---

# ZIO-HTTP Endpoint + Route Pattern

**Scope:** ZIO-HTTP 3.x / Scala 3

## Overview

Each HTTP endpoint is defined in two steps: a typed `Endpoint` declaration (no I/O, drives OpenAPI) and a `route` implementation (handles the request). Both live in the same route object, separate from the feature adapter class that wires them together.

See `zio-http-feature-adapter` for how the adapter class groups endpoints and splits public vs auth routes.

## Endpoint Type

```
Endpoint[PathInput, Input, Error, Output, AuthType]
```

| Parameter | What it is |
|-----------|-----------|
| `PathInput` | Path variable type; `Unit` if path has no variables |
| `Input` | Request body type (or `Unit` for GET with no body) |
| `Error` | Union of HTTP error types this endpoint can return |
| `Output` | Response body type |
| `AuthType` | `AuthType.None` (public) or `AuthType.Bearer` (JWT required) |

Name complex endpoint types with a type alias so the feature adapter class can reference them:

```scala
type TranslationEndpoint = Endpoint[
  Unit,
  TranslationRequest,
  InternalServerError500 | NotAuthorized401 | UnprocessableEntity422,
  TranslationResponse,
  AuthType.Bearer
]
```

## Endpoint Builder

```scala
def endpoint(prefix: PathCodec[Unit]): TranslationEndpoint =
  Endpoint(Method.POST / prefix / "translation" ?? Doc.p("Translate text"))
    .tag("Translation")                        // OpenAPI tag grouping
    .in[TranslationRequest](Doc.p("..."))   // request body + description
    .out[TranslationResponse](Doc.p("...")) // success response
    .auth(AuthType.Bearer)                     // omit for public endpoints
    .outErrors(httpCodec401, httpCodec422, httpCodec500)  // error codecs
    ?? Doc.p("Full endpoint description for OpenAPI")
```

For query parameters:

```scala
Endpoint(Method.GET / prefix / "qualities" ?? Doc.p("..."))
  .tag("Translation")
  .query(HttpCodec.query[String]("provider"))  // ?provider=<string>
  .out[QualitiesResponse](Doc.p("..."))
  .outError[UnprocessableEntity422](Status.UnprocessableEntity)
```

## HTTP Error Types

All HTTP errors come from `s4y.http.error.HttpError` (`core.presentation.zioHttp` module). Error codecs come from `s4y.http.codecs.HttpCodecError`:

```scala
import s4y.http.error.HttpError.{InternalServerError500, NotAuthorized401, UnprocessableEntity422}
import s4y.http.codecs.HttpCodecError.{httpCodec401, httpCodec422, httpCodec500}
```

Domain error → HTTP error mapping, done in route:

| Domain error | HTTP error |
|-------------|-----------|
| `InfraFailure` | `InternalServerError500("Internal error")` — never leak infra details |
| `AuthorizeResult.Denied(reason)` | `NotAuthorized401(reason.localized)` |
| `TranslationError.RequestValidation(errors)` | `UnprocessableEntity422(errors.map(...))` |
| `TranslationError.Api(error)` | `InternalServerError500(error.message.localized)` |
| VO validation failure (`Validation.Failure`) | `UnprocessableEntity422(errors.map(...))` |

## DTOs and Schema

DTOs live in the route object alongside the endpoint, Schema derivation co-located.
No `Dto` suffix on the class name — rule and rationale owned by
`endpoint-contract-separation`.

```scala
object TranslationRouting:

  case class TranslationRequest(text: String, to: String, mode: Option[String])
  object TranslationRequest:
    given Schema[TranslationRequest] = DeriveSchema.gen[TranslationRequest]

  case class TranslationResponse(translated: String, inputTokenCount: Int)
  object TranslationResponse:
    given Schema[TranslationResponse] = DeriveSchema.gen[TranslationResponse]
```

Mapper from domain → DTO on the DTO companion:

```scala
// DTO shares the domain concept's name; the package qualifies it (see
// endpoint-contract-separation). Where both are in scope, alias the import:
// import contracts.http.TranslationProvider as TranslationProviderDto
object TranslationProvider:
  given Schema[TranslationProvider] = DeriveSchema.gen[TranslationProvider]
  def fromDomain(p: domain.TranslationProvider): TranslationProvider = ...
```

Domain types never carry `Schema` — that annotation belongs in the presentation layer.

## Route Implementation

```scala
def route(
    endpoint: TranslationEndpoint,
    translateUseCase: UseCase[TranslateCommand],
    getProvidersUseCase: UseCase[GetProvidersCommand]
): Route[Locale & Identifier[AuthenticatedUser], Response] =
  endpoint.implement { requestDto =>
    withLocale {
      for
        userId      <- ZIO.service[Identifier[AuthenticatedUser]]
        startTime   <- Clock.instant
        result      <- translateUseCase(TranslateCommand(userId, ...))
                         .mapError {
                           case InfraFailure(_, _)              => InternalServerError500("Internal error")
                           case AuthorizeResult.Denied(reason)  => NotAuthorized401(reason.localized)
                           case TranslationError.Api(e)         => InternalServerError500(e.message.localized)
                           case TranslationError.InvalidProvider(p) =>
                             UnprocessableEntity422(NonEmptyChunk(s"Unknown provider: $p"))
                         }
        endTime     <- Clock.instant
      yield TranslationResponse(result.translated, result.inputTokenCount, ...)
    }
  }
```

**Route R type** reflects what middleware provides — `Locale` from `BrowserLocale`, `Identifier[AuthenticatedUser]` from auth middleware. These are NOT explicit parameters; they come from the ZIO environment.

## Middleware Context

`BrowserLocale.withLocale { ... }` bridges the ZIO `Locale` service into a Scala context parameter (`given Locale`), allowing i18n calls inside the block:

```scala
withLocale {
  // `given Locale` is in scope here — .localized() works on Translatable values
  ZIO.service[Identifier[AuthenticatedUser]]  // still from ZIO environment
}
```

## Pure Use Case in Routes (no injection)

For pure use cases with a `given` in the companion, call `summon` — no explicit injection:

```scala
// route receives no UseCase parameter
def route(endpoint: QualitiesEndpoint): Route[Any, Nothing] =
  endpoint.implement { providerStr =>
    TranslationProvider.fromString(providerStr) match
      case Validation.Success(_, provider) =>
        ZIO.succeed(
          summon[UseCase[GetQualitiesCommand]].apply(GetQualitiesCommand(provider))
            .toList.map(_.toString)
        )
      case Validation.Failure(_, errors) =>
        ZIO.fail(UnprocessableEntity422(errors.map(_.message.localized(using Locale.ENGLISH))))
  }
```

The `given UseCase[GetQualitiesCommand]` resolves from the companion via implicit search — no ZLayer registration needed.

## Middleware Stacking at Composition Root

Middleware is never applied inside the feature adapter — it is stacked at the composition root:

```scala
// no requirements
Routes(Ping.route(...))
// requires Locale
++ (verbaHttp.routesPublic(endpoints) ++ ...) @@ BrowserLocale.browserLocale
// requires Locale + AuthenticatedUser
++ verbaHttp.routesAuth(endpoints) @@ authMiddleware @@ BrowserLocale.browserLocale
```

Order matters: the rightmost `@@` is the outermost layer. `BrowserLocale` applied after `authMiddleware` means auth runs first, then locale is extracted.

## Common Mistakes

**`Http.collectZIO { case Method.GET -> ... }`** — old ZIO-HTTP API. Use `Endpoint` + `route` for type-safe errors and automatic OpenAPI.

**Domain error leaking unhandled** — if `.mapError` doesn't cover all cases, the compiler raises a union type mismatch. Exhaustive match is the guarantee.

**`InfraFailure` details in HTTP response** — always map to a generic message; never expose `logMessage` or `cause` to the caller.

**Schema on domain types** — `given Schema[MyVO]` in `domain/` pulls in ZIO-Schema; domain must stay schema-free. Put the `given Schema` on the DTO.

**Middleware applied inside `routesAuth`** — middleware belongs at the composition root so all adapters share the same auth uniformly.

**Hand-rolled English string duplicating a domain error's `.message`** — a domain
error enum with a `message: Translatable` (see `module-i18n`) already carries the
user-facing text; writing a second, hardcoded English string in the route's error
mapper (`case MyError.Foo => BadRequest400("Some new text")`) both duplicates it and
silently ignores the existing i18n resolution. If the error case has a `.message`,
use it — `BadRequest400(err.message.localized)` inside a `withLocale { ... }` block
(see "Middleware Context" above) — never a literal string. This is easy to miss
because both compile fine; the tell is a `match` on a domain error enum where some
branches call `.message.localized` and others don't.

