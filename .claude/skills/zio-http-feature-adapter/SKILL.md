---
name: zio-http-feature-adapter
description: Use when building a ZIO-HTTP driving adapter for a bounded context, when deciding how to expose endpoints to OpenAPI generation, or when separating public from authenticated routes in zio-http
metadata:
  tags: [zio, zio-http, scala, http, architecture]
---

# ZIO-HTTP Feature Adapter Pattern

**Scope:** ZIO-HTTP 3.x specific

## Overview

Each bounded context's HTTP adapter is a class (`XxxZioHttp`) that holds an inner `XxxEndpoints` case class of named, typed endpoint references. Endpoints are bound once at startup; routes are split into public and authenticated. The class never imports infra types.

## Structure

```scala
final class PaymentsZioHttp(createOrder: UseCase[CreateOrderCommand]):

  final case class PaymentsEndpoints(
    createOrder: CreateOrderEndpoint,
    getOrder: GetOrderEndpoint
  ):
    def all: Seq[AnyEndpoint] = Seq(createOrder, getOrder)

  def endpoints(prefix: PathCodec[Unit]): PaymentsEndpoints =
    PaymentsEndpoints(
      createOrder = Orders.endpoint(prefix),
      getOrder    = OrderStatus.endpoint(prefix)
    )

  def routesPublic(e: PaymentsEndpoints): Routes[Any, Response] =
    Routes(OrderStatus.route(e.getOrder, createOrder))

  def routesAuth(e: PaymentsEndpoints): Routes[Identifier[AuthenticatedUser], Response] =
    Routes(Orders.route(e.createOrder, createOrder))

object PaymentsZioHttp:
  val layer: URLayer[UseCase[CreateOrderCommand], PaymentsZioHttp] =
    ZLayer.fromFunction(PaymentsZioHttp(_))
```

## Key Properties

**`XxxEndpoints` inner case class** — named fields let the composition root (`RestService`) thread individual endpoints by name to both route binding and `OpenAPIGen.fromEndpoints`. Anonymous endpoint sequences lose this.

**`endpoints(prefix)` called once at startup** — binds the path prefix to all endpoints; never called per-request.

**`routesPublic` / `routesAuth` split** — public routes are served as-is; authenticated routes are decorated with the auth middleware (`@@ BearerAuth.middleware`) at the composition root, not inside this class.

**`ZLayer.fromFunction`** — the companion `layer` uses `fromFunction` (pure constructor); no `ZLayer.fromZIO` unless the adapter itself has an effectful startup step.

## Composition Root Integration

```scala
val e: PaymentsEndpoints = paymentsHttp.endpoints(prefix)

val openAPI = OpenAPIGen.fromEndpoints("My API", "1.0", e.all ++ ...)

val routes =
  paymentsHttp.routesPublic(e)
  ++ paymentsHttp.routesAuth(e) @@ BearerAuth.middleware
  ++ SwaggerUI.routes("/docs", openAPI)
```

## Common Mistakes

**Auth middleware inside `routesAuth`** — middleware is applied by the composition root so different adapters can share it uniformly.

**`endpoints` called per-request** — creates endpoint objects on every request; call once and store.

**Importing infra types** — `PaymentsZioHttp` depends on `UseCase[...]`, never on `PaymentsRepositoryPg` or `TransactionContextPg`.

**`routesPublic` returning authenticated routes** — route/middleware split must be enforced; the compiler catches this only if auth routes have a non-`Any` environment type.

## Related

- `zio-http-endpoint` — the individual endpoint, route handler, error mapping, and DTO placement that `Xxx.endpoint`/`Xxx.route` (referenced above) are built from
- `endpoint-contract-separation` — splitting the endpoint contract from the route function, and DTO naming (no `Dto` suffix)

