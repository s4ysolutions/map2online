---
name: composition-root
description: Use when wiring adapters together, when deciding where to instantiate concrete infrastructure types, or when a module imports a concrete database/framework class and it feels wrong
metadata:
  tags: [architecture, language-agnostic, framework-agnostic]
---

# Composition Root

**Scope:** language-agnostic, framework-agnostic

## Overview

One place in the application decides which concrete adapter implements each port and assembles the full dependency graph. Everything outside this place depends only on abstractions.

## Rules

1. **Only the composition root names concrete infra types.** No other module imports `PostgresRepo`, `RedisCache`, `HttpGateway`, etc.
2. **Composition root contains no business logic.** It wires; it does not decide.
3. **Infrastructure choice is a configuration concern.** Type aliases at the composition root make the choice explicit and searchable:

```
// one line declaring the whole project's TX strategy
type TXDB = TransactionContextPg
type TXM = TransactionContextMemory
```

## Layer Graph (bottom-up)

```
infra layers
  ↓  (provide implementations)
app/use-case layers
  ↓  (provide orchestrated services)
presentation layers
  ↓  (provide driving adapters)
composition root          ← only place that knows all of the above
```

## Wiring Checklist

- [ ] Each port has exactly one concrete adapter chosen here
- [ ] No feature module imports another feature's infra module
- [ ] Type aliases document which infra was chosen and why
- [ ] All middleware / cross-cutting aspects applied here, not scattered across layers
- [ ] Auth, logging, CORS wired at the boundary, not inside use cases

## Common Mistakes

**Feature module imports sibling feature's infra** — cross-feature wiring goes through the composition root only; feature modules share domain abstractions, not concrete implementations.

**Use case constructs its own DB connection** — a use case that creates a connection or session owns the resource lifecycle, breaking testability and resource management.

**Composition root grows business logic** — if you find yourself writing `if (env == "prod") use X else use Y` here, extract the selection into a configuration module (e.g. `core.config` or `products.myService.config`). That module reads env vars or config files and returns typed config values; the composition root reads the typed result and picks the adapter declaratively. The composition root should remain a flat list of wiring declarations, not a decision tree.

**Multiple composition roots** — one per deployable artifact is fine; one per feature is a red flag that feature boundaries are leaking.

