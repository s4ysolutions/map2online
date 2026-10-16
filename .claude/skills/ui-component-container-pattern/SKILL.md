---
name: ui-component-container-pattern
description: Use when a Scala.js/Laminar feature section grows past one leaf component and needs an entry point, when deciding where a group of related UI components belongs, or when a top-level file like Main.scala accumulates inlined section content to extract
metadata:
  tags: [scala, scalajs, laminar, frontend, ui]
---

# UI Component Container Pattern

**Scope:** Scala 3 + Scala.js + Laminar UI code organized under `features.X.ui.components.<feature>`

## Overview

React marks a folder's public entry with `index.tsx` — position alone tells you which file to import, the rest are implementation detail. Scala has no `index` literal: every file in a flat package looks equally importable, so a container object placed next to its own leaves (`LearningSettings.scala` beside `TagsManager.scala`, `LanguagePanels.scala`) is indistinguishable from them by name alone.

Fix the ambiguity structurally, not by naming convention: demote leaves one package level down into `components/`, and leave only the container alone at the feature package root. Root-alone position becomes the entry marker, the same role a folder gives `index.tsx`.

## Layout

```
studentprofile/ui/components/learningsettings/
  LearningSettings.scala          <- container, alone at root = entry
  components/
    TagsManager.scala
    LanguagePanels.scala
    AddTagModal.scala
```

```scala
// LearningSettings.scala — package root, the feature's public entry point
package s4y.vocabla.frontend.features.studentprofile.ui.components.learningsettings

import com.raquo.laminar.api.L.*
import s4y.vocabla.frontend.features.studentprofile.app.usecases.LearningSettingsUseCase
import s4y.vocabla.frontend.features.studentprofile.ui.components.learningsettings.components.{LanguagePanels, TagsManager}
import s4y.vocabla.frontend.layout.Column

object LearningSettings:
  def apply(useCase: LearningSettingsUseCase): HtmlElement =
    div(
      overflowY.auto,
      Column()(TagsManager(useCase), LanguagePanels(useCase))
    )
```

Outside callers (e.g. `Main.scala`) import only `...learningsettings.LearningSettings` and never reach into `...learningsettings.components`. That import boundary is the real payoff, not the file position — a caller can't accidentally wire a leaf directly and bypass the container's composition.

## Rules

- **Container takes only its use case(s)/state as constructor params — no parent-owned Vars beyond what genuinely must be shared.** If the container needs zero widgets or state from its caller, it is container-agnostic: droppable into any parent (a different tab, a modal, a test harness) with a one-line call.
- **Container name matches the feature package segment** (`LearningSettings` object ↔ `learningsettings` package) — the folder-as-entry position is the primary signal, matching name is the secondary confirmation, not a replacement for the folder split.
- **Leaves move to `components/`, never the reverse.** If a "leaf" needs to be called directly from outside the feature, it isn't a leaf — either it's a second container, or the caller has drifted into the wrong layer.
- **Shared state the container doesn't fully own stays a parameter.** In [[frontend-usecase-airstream-bridge]] terms: a `Var` created by a sibling section (e.g. a tag-picker slot shared with the page header) is passed in, not reconstructed inside the container — the container owns only state whose lifetime is genuinely scoped to it.
- **One container per feature package.** Two containers in the same `components/<feature>/` root re-introduces the original ambiguity; split into two feature packages instead.

## When NOT to Use

A feature with a single leaf component and no composition needed — wrapping one component in a container adds a file and an import hop for no clarity gain. Only extract once a section combines two or more components or accumulates non-trivial local state that a top-level file (`Main.scala`) would otherwise inline.

## Common Mistakes

**Container and leaves left flat in the same package** — `LearningSettings.scala` sitting next to `TagsManager.scala` in the same directory. Nothing distinguishes the entry point from the parts; a new contributor has to open every file to find out which one to import. Move the leaves into `components/`.

**Container reaches for global/module state instead of taking a param** — e.g. reading a shared `Var` via a singleton object import instead of accepting it as a constructor argument, because "it's obviously shared." This quietly breaks container-agnosticism: the container can no longer be dropped into a second place (a test, a second tab) without dragging the singleton's global wiring along. Pass it in.

**Extracting a container that takes the whole app's state** — going too far the other direction: pulling in `EntriesUseCase`, `LearningSettingsUseCase`, and a shared `pickerSlot` into one container because "the section needs all of it" without checking whether each dependency is truly section-scoped. If a param exists only to satisfy one deeply-nested leaf's edge case, reconsider whether that leaf belongs in this feature at all.
